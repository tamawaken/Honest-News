export function createEventId(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return `evt_${Math.abs(hash).toString(16)}`;
}

export function assertNonEmptyString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid ${field}: expected non-empty string`);
  }
}

export function validateArticleShape(article) {
  assertNonEmptyString(article.url, "article.url");
  assertNonEmptyString(article.source, "article.source");
  assertNonEmptyString(article.headline, "article.headline");
  assertNonEmptyString(article.full_text, "article.full_text");
}

export function validateEventClusterShape(cluster) {
  assertNonEmptyString(cluster.event_id, "event_id");
  assertNonEmptyString(cluster.event_summary, "event_summary");
  if (!Array.isArray(cluster.articles) || cluster.articles.length === 0) {
    throw new Error("Invalid EventCluster.articles: expected non-empty array");
  }
}

export function validateMetaArticleShape(metaArticle) {
  assertNonEmptyString(metaArticle.event_id, "metaArticle.event_id");
  if (!Array.isArray(metaArticle.source_profiles)) {
    throw new Error("Invalid metaArticle.source_profiles: expected array");
  }
  if (!metaArticle.factual_core || !metaArticle.meta_narrative) {
    throw new Error("Invalid metaArticle: missing factual_core or meta_narrative");
  }
}
