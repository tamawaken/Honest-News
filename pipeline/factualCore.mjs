const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "of",
  "to",
  "in",
  "on",
  "for",
  "with",
  "by",
  "from",
  "as",
  "at",
  "that",
  "this",
  "it",
  "is",
  "was",
  "are",
  "were",
  "be",
  "been",
  "being",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "has",
  "have",
  "had"
]);

function splitSentences(text) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 30)
    .slice(0, 12);
}

function tokenizeSignificant(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

function extractNumbers(text) {
  return new Set((text.match(/\b\d[\d,./-]*\b/g) || []).map((n) => n.trim()));
}

function hasAttribution(text) {
  return /\b(according to|said|stated|reported|confirmed|announced|told)\b/i.test(text);
}

function claimFromSentence(sentence, sourceName, leanLabel) {
  const clean = sentence.replace(/\s+/g, " ").trim();
  if (!clean) return null;
  const words = clean.split(" ");
  const actor = words.slice(0, 2).join(" ");
  const action = words.slice(2, 8).join(" ");
  const detail = words.slice(8).join(" ");
  const significantTokens = tokenizeSignificant(clean);
  if (significantTokens.length < 4) return null;
  return {
    actor: actor || "unspecified",
    action: action || "reported event",
    detail: detail || "",
    sentence: clean,
    numbers: [...extractNumbers(clean)],
    has_attribution: hasAttribution(clean),
    tokens: significantTokens,
    mentioned_by: [sourceName],
    mentioned_by_leans: [leanLabel]
  };
}

function claimsSimilar(baseClaim, nextClaim) {
  const baseTokens = new Set(baseClaim.tokens);
  const nextTokens = new Set(nextClaim.tokens);
  const overlap = [...baseTokens].filter((t) => nextTokens.has(t)).length;
  const minSize = Math.max(1, Math.min(baseTokens.size, nextTokens.size));
  const ratio = overlap / minSize;

  const baseNums = new Set(baseClaim.numbers);
  const nextNums = new Set(nextClaim.numbers);
  const oneHasNums = baseNums.size > 0 || nextNums.size > 0;
  const numsOverlap = [...baseNums].some((n) => nextNums.has(n));
  if (oneHasNums && !numsOverlap) return false;

  return ratio >= 0.58;
}

function leanBucket(leanValue) {
  if (leanValue < -0.15) return "left";
  if (leanValue > 0.15) return "right";
  return "centre";
}

export function buildFactualCore(articles) {
  const groupedClaims = [];
  for (const article of articles) {
    const lean = leanBucket(article.source_lean);
    const sentences = splitSentences(article.full_text);

    for (const sentence of sentences) {
      const claim = claimFromSentence(sentence, article.source, lean);
      if (!claim) continue;
      const existingGroup = groupedClaims.find((group) => claimsSimilar(group.claim, claim));
      if (!existingGroup) {
        groupedClaims.push({ claim, items: [claim] });
      } else {
        existingGroup.items.push(claim);
      }
    }
  }

  const agreedFacts = [];
  const leanSpecificFacts = { left: [], centre: [], right: [] };

  for (const group of groupedClaims) {
    const canonical = group.claim;
    const sourceSet = new Set();
    const leanSet = new Set();
    for (const item of group.items) {
      for (const source of item.mentioned_by) sourceSet.add(source);
      for (const lean of item.mentioned_by_leans) leanSet.add(lean);
    }
    const normalizedClaim = {
      actor: canonical.actor,
      action: canonical.action,
      detail: canonical.detail,
      sentence: canonical.sentence,
      has_attribution: group.items.some((item) => item.has_attribution),
      mentioned_by: [...sourceSet],
      mentioned_by_leans: [...leanSet]
    };

    if (leanSet.size >= 2) {
      agreedFacts.push(normalizedClaim);
    } else {
      const onlyLean = [...leanSet][0] || "centre";
      leanSpecificFacts[onlyLean].push(normalizedClaim);
    }
  }

  const contestedFramings = agreedFacts.slice(0, 8).map((claim) => ({
    base_fact: claim.sentence || `${claim.actor} ${claim.action}`.trim(),
    framings: {
      left: `${claim.actor} framed with accountability and social impact emphasis.`,
      centre: `${claim.actor} described with procedural and timeline context.`,
      right: `${claim.actor} framed with institutional and policy consequence emphasis.`
    }
  }));

  return {
    agreed_facts: agreedFacts,
    lean_specific_facts: leanSpecificFacts,
    contested_framings: contestedFramings
  };
}
