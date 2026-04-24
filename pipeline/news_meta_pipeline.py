#!/usr/bin/env python3
"""
The News Meta deterministic processing pipeline (no LLM).

Hardened version:
- consistent schema
- canonical hashing/signing flow
- true Ed25519 signatures (cryptography or pynacl backend)
- safer claim dedupe and neutral rewrite behavior
"""

from __future__ import annotations

import argparse
import base64
import json
import hashlib
import os
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# -----------------------------------------------------------------------------
# Static source profile table
# -----------------------------------------------------------------------------

SOURCE_BIAS_TABLE = {
    "MSNBC": {"lean": -0.8, "reliability": 0.55, "type": "mainstream"},
    "The Guardian": {"lean": -0.5, "reliability": 0.75, "type": "mainstream"},
    "CNN": {"lean": -0.5, "reliability": 0.60, "type": "mainstream"},
    "New York Times": {"lean": -0.4, "reliability": 0.80, "type": "mainstream"},
    "Washington Post": {"lean": -0.4, "reliability": 0.78, "type": "mainstream"},
    "BBC": {"lean": -0.2, "reliability": 0.82, "type": "mainstream"},
    "NPR": {"lean": -0.3, "reliability": 0.80, "type": "mainstream"},
    "Reuters": {"lean": 0.0, "reliability": 0.90, "type": "wire"},
    "AP News": {"lean": 0.0, "reliability": 0.90, "type": "wire"},
    "Bloomberg": {"lean": 0.1, "reliability": 0.80, "type": "mainstream"},
    "Fox News": {"lean": 0.7, "reliability": 0.45, "type": "mainstream"},
    "Daily Mail": {"lean": 0.5, "reliability": 0.40, "type": "tabloid"},
    "The Telegraph": {"lean": 0.4, "reliability": 0.70, "type": "mainstream"},
    "New York Post": {"lean": 0.5, "reliability": 0.50, "type": "tabloid"},
    "The Wall Street Journal": {"lean": 0.3, "reliability": 0.82, "type": "mainstream"},
    "Breitbart": {"lean": 0.9, "reliability": 0.30, "type": "partisan"},
    "Daily Wire": {"lean": 0.8, "reliability": 0.45, "type": "partisan"},
    "Al Jazeera": {"lean": -0.2, "reliability": 0.70, "type": "independent"},
    "ProPublica": {"lean": -0.3, "reliability": 0.85, "type": "independent"},
    "Bellingcat": {"lean": 0.0, "reliability": 0.90, "type": "independent"},
}


def lookup_source(source_name: str) -> dict[str, Any]:
    source_low = source_name.lower().strip()
    for name, data in SOURCE_BIAS_TABLE.items():
        nlow = name.lower()
        if source_low == nlow or source_low in nlow or nlow in source_low:
            return {"source": name, "rated": True, **data}
    return {
        "source": source_name,
        "rated": False,
        "lean": None,
        "reliability": None,
        "type": "unknown",
    }


def categorise_lean(lean: float | None) -> str:
    if lean is None:
        return "unrated"
    if lean <= -0.2:
        return "left"
    if lean >= 0.2:
        return "right"
    return "centre"


# -----------------------------------------------------------------------------
# Deterministic language/tone analysis
# -----------------------------------------------------------------------------

LOADED_WORDS = {
    "claimed": 0.3,
    "insisted": 0.3,
    "admitted": 0.3,
    "warned": 0.3,
    "slammed": 0.6,
    "blasted": 0.6,
    "attacked": 0.6,
    "controversial": 0.6,
    "radical": 0.6,
    "extreme": 0.6,
    "stunning": 0.6,
    "shocking": 0.6,
    "bombshell": 0.6,
    "dire": 0.6,
    "fury": 0.6,
    "chaos": 0.6,
    "regime": 1.0,
    "puppet": 1.0,
    "sham": 1.0,
    "rigged": 1.0,
    "hoax": 1.0,
    "illegals": 1.0,
    "invasion": 0.9,
    "swarm": 0.9,
    "fascist": 1.0,
    "far-left": 0.7,
    "far-right": 0.7,
}

NEUTRAL_REPLACEMENTS = {
    "slammed": "criticised",
    "blasted": "criticised",
    "attacked": "criticised",
    "claimed": "said",
    "admitted": "said",
    "insisted": "said",
    "warned": "said",
    "controversial": "debated",
    "radical": "major",
    "extreme": "strong",
    "stunning": "notable",
    "shocking": "notable",
    "bombshell": "major development",
    "dire": "serious",
    "fury": "strong reaction",
    "chaos": "disruption",
    "sham": "disputed practice",
    "rigged": "disputed",
    "hoax": "disputed claim",
    "regime": "government",
    "puppet": "ally",
    "illegals": "undocumented immigrants",
    "invasion": "increase",
    "swarm": "large group",
    "fascist": "authoritarian",
    "far-left": "left-leaning",
    "far-right": "right-leaning",
}

ATTRIBUTION_PATTERNS = [
    r"\baccording to\b",
    r"\bsaid\b",
    r"\bstated\b",
    r"\breported\b",
    r"\bconfirmed\b",
    r"\bannounced\b",
    r"\btold\b",
    r"\bin a statement\b",
    r"\bin a press release\b",
    r'"[^"]{5,}"',
]

OPINION_INDICATORS = [
    r"\bobviously\b",
    r"\bundoubtedly\b",
    r"\bof course\b",
    r"\beveryone knows\b",
    r"\bthe truth is\b",
    r"\bclearly\b",
    r"\bwithout doubt\b",
    r"\bit'?s time to\b",
    r"\bhow dare\b",
    r"\bunacceptable\b",
]

POSITIVE_WORDS = {"success", "progress", "benefit", "growth", "agreement", "secure", "support"}
NEGATIVE_WORDS = {"crisis", "failure", "threat", "risk", "conflict", "abuse", "violence"}
FEAR_WORDS = {"threat", "danger", "warning", "crisis", "panic", "fatal", "vulnerable"}
URGENCY_WORDS = {"breaking", "urgent", "developing", "immediate", "now", "live"}


def scan_loaded_language(text: str) -> dict[str, Any]:
    text_low = text.lower()
    found = []
    total_weight = 0.0
    sorted_terms = sorted(LOADED_WORDS.keys(), key=len, reverse=True)

    for term in sorted_terms:
        pattern = r"\b" + re.escape(term) + r"\b"
        for m in re.finditer(pattern, text_low):
            weight = LOADED_WORDS[term]
            found.append(
                {
                    "word": term,
                    "weight": weight,
                    "position": m.start(),
                    "context": text[max(0, m.start() - 25) : m.end() + 25],
                    "neutral_alternative": NEUTRAL_REPLACEMENTS.get(term),
                }
            )
            total_weight += weight

    word_count = max(len(re.findall(r"\b\w+\b", text)), 1)
    score = min(1.0, total_weight / max(word_count * 0.1, 1.0))
    return {
        "loaded_language_score": round(score, 4),
        "loaded_words_found": sorted(found, key=lambda x: (-x["weight"], x["position"])),
        "loaded_word_count": len(found),
        "total_word_count": word_count,
        "loaded_density": round(len(found) / word_count * 100, 2),
    }


def measure_attribution(text: str) -> dict[str, Any]:
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if len(s.strip()) > 10]
    attributed = 0
    for s in sentences:
        slow = s.lower()
        if any(re.search(p, slow) for p in ATTRIBUTION_PATTERNS):
            attributed += 1
    total = max(len(sentences), 1)
    return {
        "attribution_density": round(attributed / total, 4),
        "total_sentences": len(sentences),
        "attributed_sentences": attributed,
        "unattributed_sentences": len(sentences) - attributed,
    }


def analyse_tone(text: str) -> dict[str, Any]:
    words = re.findall(r"\b\w+\b", text.lower())
    wc = max(len(words), 1)
    pos = sum(1 for w in words if w in POSITIVE_WORDS)
    neg = sum(1 for w in words if w in NEGATIVE_WORDS)
    fear = sum(1 for w in words if w in FEAR_WORDS)
    urg = sum(1 for w in words if w in URGENCY_WORDS)
    total_sent = pos + neg
    tone_balance = round((pos - neg) / total_sent, 4) if total_sent else 0.0
    return {
        "tone_balance": tone_balance,
        "positive_count": pos,
        "negative_count": neg,
        "fear_index": round(min(1.0, fear / max(wc * 0.02, 1)), 4),
        "urgency_index": round(min(1.0, urg / max(wc * 0.01, 1)), 4),
    }


def strip_opinion_sentences(text: str) -> dict[str, Any]:
    sentences = [s for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
    kept = []
    removed = []
    for s in sentences:
        slow = s.lower()
        match = next((p for p in OPINION_INDICATORS if re.search(p, slow)), None)
        if match:
            removed.append({"sentence": s.strip(), "reason": f"Opinion indicator: {match}"})
        else:
            kept.append(s.strip())
    return {
        "clean_text": " ".join(kept).strip(),
        "removed_sentences": removed,
        "sentences_kept": len(kept),
        "sentences_removed": len(removed),
    }


def neutralise_text(text: str) -> dict[str, Any]:
    changes = []
    out = text
    for term in sorted(NEUTRAL_REPLACEMENTS.keys(), key=len, reverse=True):
        repl = NEUTRAL_REPLACEMENTS[term]
        pattern = re.compile(r"\b" + re.escape(term) + r"\b", re.IGNORECASE)
        while True:
            m = pattern.search(out)
            if not m:
                break
            original = out[m.start() : m.end()]
            final = repl
            if original[:1].isupper():
                final = repl[:1].upper() + repl[1:] if repl else repl
            changes.append(
                {
                    "original": original,
                    "replacement": final,
                    "position": m.start(),
                    "context_before": out[max(0, m.start() - 20) : m.end() + 20],
                }
            )
            out = out[: m.start()] + final + out[m.end() :]
    out = re.sub(r"\s{2,}", " ", out).strip()
    return {"neutral_text": out, "changes_made": changes, "total_changes": len(changes)}


# -----------------------------------------------------------------------------
# Claim extraction + dedupe
# -----------------------------------------------------------------------------

STOPWORDS = {
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "to",
    "of",
    "in",
    "for",
    "on",
    "and",
    "or",
    "that",
    "this",
    "with",
    "as",
    "by",
    "from",
    "it",
}


def extract_factual_claims(text: str) -> list[dict[str, Any]]:
    claims = []
    for s in re.split(r"(?<=[.!?])\s+", text):
        sent = s.strip()
        if len(sent) < 25:
            continue
        has_number = bool(re.search(r"\b\d[\d,./-]*\b", sent))
        has_date = bool(re.search(r"\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})", sent.lower()))
        has_attr = any(re.search(p, sent.lower()) for p in ATTRIBUTION_PATTERNS)
        has_named = bool(re.search(r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b", sent))
        fact_score = (0.3 if has_number else 0) + (0.2 if has_date else 0) + (0.3 if has_attr else 0) + (
            0.2 if has_named else 0
        )
        if fact_score >= 0.3:
            claims.append(
                {
                    "text": sent,
                    "fact_score": round(fact_score, 2),
                    "has_number": has_number,
                    "has_date": has_date,
                    "has_attribution": has_attr,
                    "has_named_entity": has_named,
                }
            )
    return claims


def claim_signature(text: str) -> tuple[set[str], set[str]]:
    words = {w for w in re.findall(r"\b[a-z]{3,}\b", text.lower()) if w not in STOPWORDS}
    nums = set(re.findall(r"\b\d[\d,./-]*\b", text))
    return words, nums


def claims_similar(a: str, b: str) -> bool:
    wa, na = claim_signature(a)
    wb, nb = claim_signature(b)
    if not wa or not wb:
        return False
    overlap = len(wa & wb) / min(len(wa), len(wb))
    # If one has numbers and the other has none, treat as different claims.
    if (na and not nb) or (nb and not na):
        return False
    return overlap >= 0.6


def cross_reference_claims(articles: list[dict[str, Any]]) -> dict[str, Any]:
    rows = []
    for article in articles:
        for claim in article.get("factual_claims", []):
            rows.append(
                {
                    "claim": claim["text"],
                    "source": article["source"],
                    "lean_category": categorise_lean(article["source_profile"].get("lean")),
                }
            )

    groups: list[list[dict[str, Any]]] = []
    for row in rows:
        placed = False
        for group in groups:
            if claims_similar(row["claim"], group[0]["claim"]):
                group.append(row)
                placed = True
                break
        if not placed:
            groups.append([row])

    agreed = []
    lean_specific = {"left": [], "centre": [], "right": []}

    for group in groups:
        sources = sorted({g["source"] for g in group})
        leans = sorted({g["lean_category"] for g in group if g["lean_category"] in {"left", "centre", "right"}})
        item = {
            "claim": group[0]["claim"],
            "mentioned_by": sources,
            "lean_coverage": leans,
            "cross_spectrum": len(leans) >= 2,
        }
        if len(leans) >= 2:
            agreed.append(item)
        elif len(leans) == 1:
            lean_specific[leans[0]].append(item)

    return {
        "agreed_facts": agreed,
        "lean_specific": lean_specific,
        "agreed_count": len(agreed),
        "left_only_count": len(lean_specific["left"]),
        "centre_only_count": len(lean_specific["centre"]),
        "right_only_count": len(lean_specific["right"]),
    }


# -----------------------------------------------------------------------------
# Article + meta pipeline
# -----------------------------------------------------------------------------


def analyse_article(source: str, headline: str, text: str, url: str = "") -> dict[str, Any]:
    source_profile = lookup_source(source)
    loaded = scan_loaded_language(text)
    attr = measure_attribution(text)
    tone = analyse_tone(text)
    opinion = strip_opinion_sentences(text)
    neutral = neutralise_text(opinion["clean_text"])
    claims = extract_factual_claims(text)
    wc = max(len(re.findall(r"\b\w+\b", text)), 1)
    return {
        "source": source,
        "headline": headline,
        "url": url,
        "analysed_at": datetime.now(timezone.utc).isoformat(),
        "source_profile": source_profile,
        "loaded_language": loaded,
        "attribution": attr,
        "tone": tone,
        "opinion_removal": {
            "sentences_removed": opinion["removed_sentences"],
            "count_removed": opinion["sentences_removed"],
        },
        "neutralisation": {"changes_made": neutral["changes_made"], "total_changes": neutral["total_changes"]},
        "neutral_text": neutral["neutral_text"],
        "factual_claims": claims,
        "factual_claim_count": len(claims),
        "scores": {
            "loaded_language": loaded["loaded_language_score"],
            "attribution_density": attr["attribution_density"],
            "tone_balance": tone["tone_balance"],
            "fear_index": tone["fear_index"],
            "urgency_index": tone["urgency_index"],
            "factual_claim_density": round(len(claims) / max(wc / 100, 1), 2),
        },
    }


def generate_meta_article(topic: str, articles: list[dict[str, Any]]) -> dict[str, Any]:
    cross_ref = cross_reference_claims(articles)
    summary = " ".join([c["claim"] for c in cross_ref["agreed_facts"][:5]])
    if not summary:
        summary = "Insufficient cross-source agreement to generate neutral summary."

    comparison = []
    for a in articles:
        comparison.append(
            {
                "source": a["source"],
                "lean": a["source_profile"].get("lean"),
                "lean_category": categorise_lean(a["source_profile"].get("lean")),
                "reliability": a["source_profile"].get("reliability"),
                "scores": a["scores"],
                "loaded_words_count": a["loaded_language"]["loaded_word_count"],
                "top_loaded_words": [w["word"] for w in a["loaded_language"]["loaded_words_found"][:5]],
                "neutral_changes_count": a["neutralisation"]["total_changes"],
                "opinion_sentences_removed": a["opinion_removal"]["count_removed"],
            }
        )

    leans = [a["source_profile"].get("lean") for a in articles if a["source_profile"].get("lean") is not None]
    mean_lean = round(sum(leans) / max(len(leans), 1), 3) if leans else None

    return {
        "topic": topic,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "article_count": len(articles),
        "source_spectrum": {
            "left_count": sum(1 for a in articles if categorise_lean(a["source_profile"].get("lean")) == "left"),
            "centre_count": sum(1 for a in articles if categorise_lean(a["source_profile"].get("lean")) == "centre"),
            "right_count": sum(1 for a in articles if categorise_lean(a["source_profile"].get("lean")) == "right"),
            "mean_lean": mean_lean,
            "coverage_balance": "balanced"
            if all(
                sum(1 for a in articles if categorise_lean(a["source_profile"].get("lean")) == bucket) > 0
                for bucket in ("left", "centre", "right")
            )
            else "unbalanced",
        },
        "neutral_summary": summary,
        "cross_reference": cross_ref,
        "source_comparison": comparison,
        "aggregate_scores": {
            "mean_loaded_language": round(sum(a["scores"]["loaded_language"] for a in articles) / max(len(articles), 1), 4),
            "mean_attribution_density": round(
                sum(a["scores"]["attribution_density"] for a in articles) / max(len(articles), 1), 4
            ),
            "mean_fear_index": round(sum(a["scores"]["fear_index"] for a in articles) / max(len(articles), 1), 4),
        },
        "methodology": {
            "llm_used": False,
            "bias_source": "Static source table (human maintained)",
            "process": [
                "ingest",
                "source classify",
                "loaded language scoring",
                "attribution/tone scoring",
                "opinion strip + neutral rewrite",
                "factual claim extraction",
                "cross-source claim comparison",
                "canonical hash + Ed25519 sign",
            ],
        },
        "articles": articles,
    }


# -----------------------------------------------------------------------------
# Canonical serialization and Ed25519 signing
# -----------------------------------------------------------------------------


def canonical_json_bytes(payload: dict[str, Any]) -> bytes:
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_or_create_ed25519(keys_dir: Path):
    keys_dir.mkdir(parents=True, exist_ok=True)
    pub_path = keys_dir / "public_key.b64"
    sec_path = keys_dir / "private_key_secret.b64"

    try:
        from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
        from cryptography.hazmat.primitives import serialization

        backend = "cryptography"

        def from_seed(seed: bytes):
            sk = Ed25519PrivateKey.from_private_bytes(seed)
            pk = sk.public_key().public_bytes(
                encoding=serialization.Encoding.Raw,
                format=serialization.PublicFormat.Raw,
            )
            return sk, pk

        if pub_path.exists() and sec_path.exists():
            pub = base64.b64decode(pub_path.read_text().strip())
            sec = base64.b64decode(sec_path.read_text().strip())
            seed = sec[:32] if len(sec) >= 32 else sec
            sk, _ = from_seed(seed)
            return backend, sk.sign, pub, False

        seed = os.urandom(32)
        sk, pk = from_seed(seed)
        sec_legacy = seed + pk
        pub_path.write_text(base64.b64encode(pk).decode() + "\n")
        sec_path.write_text(base64.b64encode(sec_legacy).decode() + "\n")
        os.chmod(sec_path, 0o600)
        return backend, sk.sign, pk, True
    except Exception:
        pass

    try:
        from nacl.signing import SigningKey

        backend = "pynacl"

        if pub_path.exists() and sec_path.exists():
            pub = base64.b64decode(pub_path.read_text().strip())
            sec = base64.b64decode(sec_path.read_text().strip())
            seed = sec[:32] if len(sec) >= 32 else sec
            sk = SigningKey(seed)
            return backend, lambda data: sk.sign(data).signature, pub, False

        seed = os.urandom(32)
        sk = SigningKey(seed)
        pk = bytes(sk.verify_key)
        sec_legacy = seed + pk
        pub_path.write_text(base64.b64encode(pk).decode() + "\n")
        sec_path.write_text(base64.b64encode(sec_legacy).decode() + "\n")
        os.chmod(sec_path, 0o600)
        return backend, lambda data: sk.sign(data).signature, pk, True
    except Exception as exc:
        raise RuntimeError("python_ed25519_unavailable") from exc


def sign_with_node_bridge(payload: bytes, keys_dir: Path) -> tuple[str, bytes, bytes, bool]:
    env = os.environ.copy()
    env["TNM_KEYS_DIR"] = str(keys_dir)
    env["TNM_PAYLOAD_B64"] = base64.b64encode(payload).decode()
    node_code = r"""
import fs from "fs";
import path from "path";
import crypto from "crypto";

const keysDir = process.env.TNM_KEYS_DIR;
const payload = Buffer.from(process.env.TNM_PAYLOAD_B64, "base64");

const ED25519_PKCS8_PREFIX = Buffer.from("302e020100300506032b657004220420", "hex");
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");
const pubPath = path.join(keysDir, "public_key.b64");
const privPath = path.join(keysDir, "private_key_secret.b64");

function ensureDir(d){ if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }
function privateKeyFromSeed(seed32) {
  const der = Buffer.concat([ED25519_PKCS8_PREFIX, seed32]);
  return crypto.createPrivateKey({ key: der, format: "der", type: "pkcs8" });
}
function publicRawFromKeyObject(publicKey) {
  const spkiDer = publicKey.export({ format: "der", type: "spki" });
  return spkiDer.subarray(spkiDer.length - 32);
}

ensureDir(keysDir);
let created = false;
let publicKeyRaw;
let privateKey;

if (fs.existsSync(pubPath) && fs.existsSync(privPath)) {
  publicKeyRaw = Buffer.from(fs.readFileSync(pubPath, "utf8").trim(), "base64");
  const sec = Buffer.from(fs.readFileSync(privPath, "utf8").trim(), "base64");
  privateKey = sec.length === 64
    ? privateKeyFromSeed(sec.subarray(0, 32))
    : crypto.createPrivateKey({ key: sec, format: "der", type: "pkcs8" });
} else {
  created = true;
  const seed = crypto.randomBytes(32);
  privateKey = privateKeyFromSeed(seed);
  publicKeyRaw = publicRawFromKeyObject(crypto.createPublicKey(privateKey));
  const secretLegacy = Buffer.concat([seed, publicKeyRaw]);
  fs.writeFileSync(pubPath, publicKeyRaw.toString("base64") + "\n");
  fs.writeFileSync(privPath, secretLegacy.toString("base64") + "\n", { mode: 0o600 });
}

const signature = crypto.sign(null, payload, privateKey);
process.stdout.write(JSON.stringify({
  backend: "node_crypto_bridge",
  public_key_b64: publicKeyRaw.toString("base64"),
  signature_b64: signature.toString("base64"),
  key_created_now: created
}));
"""
    cmd = ["node", "--input-type=module", "-e", node_code]
    completed = subprocess.run(cmd, env=env, capture_output=True, text=True, check=True)
    data = json.loads(completed.stdout)
    return (
        data["backend"],
        base64.b64decode(data["public_key_b64"]),
        base64.b64decode(data["signature_b64"]),
        bool(data["key_created_now"]),
    )


def attach_signature(meta_unsigned: dict[str, Any], keys_dir: Path) -> dict[str, Any]:
    canonical = canonical_json_bytes(meta_unsigned)
    content_hash = sha256_hex(canonical)
    enriched = {**meta_unsigned, "content_hash": content_hash}
    canonical_enriched = canonical_json_bytes(enriched)

    try:
        backend, signer, public_key_raw, created = load_or_create_ed25519(keys_dir)
        sig = signer(canonical_enriched)
    except RuntimeError as exc:
        if str(exc) != "python_ed25519_unavailable":
            raise
        backend, public_key_raw, sig, created = sign_with_node_bridge(canonical_enriched, keys_dir)
    enriched["signature"] = {
        "signed_at": datetime.now(timezone.utc).isoformat(),
        "algorithm": "Ed25519",
        "backend": backend,
        "public_key_b64": base64.b64encode(public_key_raw).decode(),
        "signature_b64": base64.b64encode(sig).decode(),
        "key_created_now": created,
        "signed_payload": "canonical_json(all_fields_except_signature)",
    }
    return enriched


# -----------------------------------------------------------------------------
# Demo runner
# -----------------------------------------------------------------------------


def demo(output_path: Path, keys_dir: Path) -> dict[str, Any]:
    sample_articles = [
        {
            "source": "CNN",
            "headline": "Government slammed over controversial new immigration policy",
            "url": "https://example.com/cnn/article",
            "text": (
                "The government was slammed today over its controversial new immigration policy. "
                "The Home Secretary announced the policy Tuesday and said it would reduce intake by 50,000. "
                "The Home Office confirmed changes would take effect in January 2027."
            ),
        },
        {
            "source": "Fox News",
            "headline": "Government takes action on border controls",
            "url": "https://example.com/fox/article",
            "text": (
                "The government announced border measures Tuesday and said the plan will reduce asylum intake by 50,000. "
                "The Home Secretary stated in a press release that the policy will begin in January 2027."
            ),
        },
        {
            "source": "Reuters",
            "headline": "UK government announces asylum intake changes",
            "url": "https://example.com/reuters/article",
            "text": (
                "The UK government announced changes Tuesday that would reduce annual intake by approximately 50,000, "
                "according to a Home Office statement. The changes are scheduled to take effect in January 2027."
            ),
        },
    ]

    analysed = [analyse_article(a["source"], a["headline"], a["text"], a["url"]) for a in sample_articles]
    meta_unsigned = generate_meta_article("UK asylum policy change", analysed)
    meta_signed = attach_signature(meta_unsigned, keys_dir)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(meta_signed, indent=2, ensure_ascii=False) + "\n")
    return meta_signed


def main() -> None:
    parser = argparse.ArgumentParser(description="Run deterministic News Meta Python pipeline demo")
    parser.add_argument(
        "--output",
        default=str(Path("./pipeline/output/meta_article_demo.json")),
        help="Output JSON path",
    )
    parser.add_argument(
        "--keys-dir",
        default=str(Path("./keys")),
        help="Directory for public_key.b64/private_key_secret.b64",
    )
    args = parser.parse_args()

    out = Path(args.output).resolve()
    keys = Path(args.keys_dir).resolve()
    result = demo(out, keys)
    print("Pipeline complete.")
    print(f"Output: {out}")
    print(f"Articles: {result['article_count']}")
    print(f"Agreed facts: {result['cross_reference']['agreed_count']}")
    print(f"Hash: {result['content_hash'][:16]}...")


if __name__ == "__main__":
    main()
