const SOURCE_TABLE = [
  { source: "Reuters", lean: 0.0, reliability: 0.94, type: "wire" },
  { source: "BBC", lean: -0.05, reliability: 0.9, type: "public_broadcaster" },
  { source: "CoinDesk", lean: 0.15, reliability: 0.76, type: "trade_press" },
  { source: "NASA", lean: 0.0, reliability: 0.95, type: "government_science" },
  { source: "NIH", lean: 0.0, reliability: 0.94, type: "government_science" },
  { source: "UN News", lean: -0.05, reliability: 0.84, type: "multilateral" },
  { source: "VentureBeat", lean: 0.1, reliability: 0.72, type: "trade_press" },
  { source: "Eco-Business", lean: -0.1, reliability: 0.7, type: "trade_press" },
  { source: "Ember", lean: -0.05, reliability: 0.82, type: "research_org" },
  { source: "Bloomberg", lean: 0.05, reliability: 0.87, type: "financial_press" }
];

const SOURCE_ALIASES = {
  "Reuters / RTE": "Reuters",
  "Reuters / Bloomberg": "Reuters",
  "UN News / Reuters": "UN News",
  "VentureBeat / Reuters": "VentureBeat",
  "Ember / AP": "Ember",
  "NIH / NIDA": "NIH",
  "BBC / Reuters": "BBC"
};

const bySource = new Map(SOURCE_TABLE.map((entry) => [entry.source, entry]));

export function resolveSourceName(sourceName) {
  return SOURCE_ALIASES[sourceName] || sourceName;
}

export function classifySource(sourceName) {
  const resolved = resolveSourceName(sourceName);
  const rating = bySource.get(resolved);
  if (!rating) {
    return {
      source: sourceName,
      resolved_source: resolved,
      source_rated: false,
      lean: 0.0,
      reliability: 0.5,
      type: "unrated"
    };
  }
  return {
    source: sourceName,
    resolved_source: resolved,
    source_rated: true,
    lean: rating.lean,
    reliability: rating.reliability,
    type: rating.type
  };
}

export function listRatedSources() {
  return SOURCE_TABLE.slice();
}
