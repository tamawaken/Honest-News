function claimFromSentence(sentence, sourceName, leanLabel) {
  const clean = sentence.replace(/\s+/g, " ").trim();
  if (!clean) return null;
  const words = clean.split(" ");
  const actor = words.slice(0, 2).join(" ");
  const action = words.slice(2, 8).join(" ");
  const detail = words.slice(8).join(" ");
  return {
    actor: actor || "unspecified",
    action: action || "reported event",
    detail: detail || "",
    date: "unspecified",
    mentioned_by: [sourceName],
    mentioned_by_leans: [leanLabel]
  };
}

function normalizeClaimKey(claim) {
  return `${claim.actor}|${claim.action}`.toLowerCase().replace(/[^a-z0-9|]/g, "");
}

function leanBucket(leanValue) {
  if (leanValue < -0.15) return "left";
  if (leanValue > 0.15) return "right";
  return "centre";
}

export function buildFactualCore(articles) {
  const claimMap = new Map();
  for (const article of articles) {
    const lean = leanBucket(article.source_lean);
    const sentences = article.full_text
      .split(/[.!?]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);

    for (const sentence of sentences) {
      const claim = claimFromSentence(sentence, article.source, lean);
      if (!claim) continue;
      const key = normalizeClaimKey(claim);
      if (!claimMap.has(key)) {
        claimMap.set(key, claim);
      } else {
        const existing = claimMap.get(key);
        existing.mentioned_by.push(article.source);
        existing.mentioned_by_leans.push(lean);
      }
    }
  }

  const agreedFacts = [];
  const leanSpecificFacts = { left: [], centre: [], right: [] };

  for (const claim of claimMap.values()) {
    const leanSet = new Set(claim.mentioned_by_leans);
    if (leanSet.size >= 2) {
      agreedFacts.push({
        ...claim,
        mentioned_by: [...new Set(claim.mentioned_by)],
        mentioned_by_leans: [...leanSet]
      });
    } else {
      const onlyLean = [...leanSet][0] || "centre";
      leanSpecificFacts[onlyLean].push({
        ...claim,
        mentioned_by: [...new Set(claim.mentioned_by)],
        mentioned_by_leans: [...leanSet]
      });
    }
  }

  const contestedFramings = agreedFacts.slice(0, 6).map((claim) => ({
    base_fact: `${claim.actor} ${claim.action}`.trim(),
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
