const LOADED_WEIGHTS = {
  claimed: 0.3,
  admitted: 0.3,
  revealed: 0.3,
  slammed: 0.6,
  blasted: 0.6,
  controversial: 0.6,
  radical: 0.6,
  regime: 1.0,
  flood: 1.0,
  destroying: 1.0
};

const ATTRIBUTION_PATTERNS = [
  /\baccording to\b/i,
  /\bsaid\b/i,
  /\bstated\b/i,
  /\breported\b/i,
  /\btold\b/i,
  /\bannounced\b/i
];

const POSITIVE_WORDS = new Set([
  "progress",
  "improve",
  "stronger",
  "benefit",
  "gain",
  "growth",
  "support",
  "optimism"
]);

const NEGATIVE_WORDS = new Set([
  "risk",
  "crisis",
  "decline",
  "conflict",
  "pressure",
  "damage",
  "fall",
  "warning",
  "harm"
]);

const OPINION_PATTERNS = [
  /\bobviously\b/i,
  /\bundoubtedly\b/i,
  /\bof course\b/i,
  /\beveryone knows\b/i,
  /\bthe truth is\b/i,
  /\bwithout doubt\b/i
];

const NEUTRAL_REPLACEMENTS = {
  slammed: "criticised",
  blasted: "criticised",
  controversial: "debated",
  radical: "major",
  regime: "government",
  flood: "increase",
  destroying: "changing"
};

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function splitParagraphs(text) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function scoreLoadedLanguage(tokens) {
  let total = 0;
  const found = [];
  for (const token of tokens) {
    const weight = LOADED_WEIGHTS[token];
    if (weight !== undefined) {
      total += weight;
      found.push(token);
    }
  }
  if (tokens.length === 0) return { score: 0, found: [] };
  return {
    score: Math.min(1, total / tokens.length * 8),
    found
  };
}

function scoreAttributionDensity(paragraphs) {
  let attributed = 0;
  let claims = 0;
  for (const para of paragraphs) {
    const sentenceCount = Math.max(1, para.split(/[.!?]/).filter((s) => s.trim()).length);
    claims += sentenceCount;
    if (ATTRIBUTION_PATTERNS.some((pattern) => pattern.test(para))) attributed += sentenceCount;
  }
  if (claims === 0) return 0;
  return attributed / claims;
}

function scoreParagraphSentiment(paragraph) {
  const tokens = tokenize(paragraph);
  let pos = 0;
  let neg = 0;
  for (const token of tokens) {
    if (POSITIVE_WORDS.has(token)) pos++;
    if (NEGATIVE_WORDS.has(token)) neg++;
  }
  if (tokens.length === 0) return 0;
  return (pos - neg) / Math.max(1, Math.sqrt(tokens.length));
}

function classifyEmotionalTrend(curve) {
  if (curve.length <= 1) return "steady";
  const start = curve[0];
  const end = curve[curve.length - 1];
  const maxIdx = curve.reduce((best, value, idx) => (value > curve[best] ? idx : best), 0);
  if (maxIdx <= 1 && curve[maxIdx] > 0.25) return "front-loaded";
  if (end - start > 0.15) return "escalating";
  if (start - end > 0.15) return "de-escalating";
  return "steady";
}

function detectAgentPatient(headline) {
  const words = headline.split(/\s+/).filter(Boolean);
  if (words.length < 2) {
    return { primary_agent: "unspecified", primary_patient: "unspecified" };
  }
  return {
    primary_agent: words[0].replace(/[^A-Za-z0-9-]/g, ""),
    primary_patient: words[words.length - 1].replace(/[^A-Za-z0-9-]/g, "")
  };
}

function estimateEmphasis(paragraphs) {
  const total = Math.max(1, paragraphs.length);
  const buckets = {
    event_factual: 0,
    sourced_reaction: 0,
    editorial_framing: 0,
    historical_context: 0,
    prediction: 0
  };
  for (const p of paragraphs) {
    if (/\baccording to|said|reported|stated|told\b/i.test(p)) {
      buckets.sourced_reaction += 1;
    } else if (/\bwill|expected|forecast|could|may\b/i.test(p)) {
      buckets.prediction += 1;
    } else if (/\bprevious|earlier|history|since\b/i.test(p)) {
      buckets.historical_context += 1;
    } else if (/\barguably|critics|supporters|framing\b/i.test(p)) {
      buckets.editorial_framing += 1;
    } else {
      buckets.event_factual += 1;
    }
  }
  for (const key of Object.keys(buckets)) {
    buckets[key] = Number((buckets[key] / total).toFixed(3));
  }
  return buckets;
}

function countOpinionSentences(text) {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  let count = 0;
  for (const sentence of sentences) {
    if (OPINION_PATTERNS.some((pattern) => pattern.test(sentence))) count += 1;
  }
  return count;
}

function neutralizeLoadedTerms(text) {
  let out = text;
  let replacementCount = 0;
  for (const [term, replacement] of Object.entries(NEUTRAL_REPLACEMENTS)) {
    const pattern = new RegExp(`\\b${term}\\b`, "gi");
    out = out.replace(pattern, (match) => {
      replacementCount += 1;
      if (!replacement) return match;
      return match[0] === match[0].toUpperCase()
        ? replacement[0].toUpperCase() + replacement.slice(1)
        : replacement;
    });
  }
  return { text: out, replacementCount };
}

export function analyzeArticleLinguistics(article) {
  const paragraphs = splitParagraphs(article.full_text);
  const tokens = tokenize(article.full_text);
  const loaded = scoreLoadedLanguage(tokens);
  const attributionDensity = scoreAttributionDensity(paragraphs);
  const emotionalCurve = paragraphs.map((p) => Number(scoreParagraphSentiment(p).toFixed(3)));
  const emotionalPeak = emotionalCurve.length ? Math.max(...emotionalCurve) : 0;
  const emotionalTrend = classifyEmotionalTrend(emotionalCurve);
  const framingRoles = detectAgentPatient(article.headline);
  const opinionSentenceCount = countOpinionSentences(article.full_text);
  const neutralized = neutralizeLoadedTerms(article.full_text);
  return {
    loaded_language_score: Number(loaded.score.toFixed(3)),
    loaded_words_found: [...new Set(loaded.found)],
    framing: {
      primary_agent: framingRoles.primary_agent || "unspecified",
      primary_patient: framingRoles.primary_patient || "unspecified",
      emphasis_distribution: estimateEmphasis(paragraphs),
      omitted_facts: []
    },
    attribution_density: Number(attributionDensity.toFixed(3)),
    emotional_curve: emotionalCurve,
    emotional_peak: Number(emotionalPeak.toFixed(3)),
    emotional_trend: emotionalTrend,
    opinion_sentence_count: opinionSentenceCount,
    neutralized_preview: neutralized.text.slice(0, 240),
    neutralized_replacement_count: neutralized.replacementCount
  };
}
