import { classifySource } from "./sourceRatings.mjs";
import { analyzeArticleLinguistics } from "./linguistics.mjs";
import { buildFactualCore } from "./factualCore.mjs";
import { fetchArticlesForTopic } from "./fetchTopic.mjs";
import {
  createEventId,
  validateArticleShape,
  validateEventClusterShape,
  validateMetaArticleShape
} from "./types.mjs";

function clusterEventArticles(topic, inputArticles, eventSummaryHint = "") {
  const seed = `${topic}|${inputArticles.map((a) => a.headline).join("|")}`;
  const eventId = createEventId(seed);
  const eventSummary =
    eventSummaryHint ||
    `${topic}: ${inputArticles.length} related reports clustered by entity and action overlap.`;

  const articles = inputArticles.map((article) => {
    validateArticleShape(article);
    const sourceClass = classifySource(article.source);
    return {
      ...article,
      source_lean: sourceClass.lean,
      source_reliability: sourceClass.reliability,
      source_rated: sourceClass.source_rated,
      source_type: sourceClass.type
    };
  });

  const cluster = {
    event_id: eventId,
    event_summary: eventSummary,
    detected_at: new Date().toISOString(),
    articles
  };
  validateEventClusterShape(cluster);
  return cluster;
}

function enrichLinguistics(cluster) {
  return {
    ...cluster,
    articles: cluster.articles.map((article) => ({
      ...article,
      linguistic_profile: analyzeArticleLinguistics(article)
    }))
  };
}

function buildMetaNarrative(cluster, factualCore) {
  const agreements = factualCore.agreed_facts
    .slice(0, 8)
    .map((fact) => `${fact.actor} ${fact.action}`.trim());

  const omissions = {
    left: factualCore.lean_specific_facts.right.slice(0, 4).map((c) => `${c.actor} ${c.action}`.trim()),
    centre: [],
    right: factualCore.lean_specific_facts.left.slice(0, 4).map((c) => `${c.actor} ${c.action}`.trim())
  };

  const languageComparison = cluster.articles.map((article) => ({
    source: article.source,
    source_lean: article.source_lean,
    loaded_language_score: article.linguistic_profile.loaded_language_score,
    attribution_density: article.linguistic_profile.attribution_density,
    emotional_trend: article.linguistic_profile.emotional_trend,
    primary_agent: article.linguistic_profile.framing.primary_agent,
    primary_patient: article.linguistic_profile.framing.primary_patient
  }));

  return {
    event_summary: cluster.event_summary,
    agreements,
    divergences: factualCore.contested_framings,
    omissions,
    language_comparison: languageComparison
  };
}

export async function runPipelineFromArticles({
  topic,
  articles,
  eventSummaryHint = ""
}) {
  const stage1 = clusterEventArticles(topic, articles, eventSummaryHint);
  const stage3 = enrichLinguistics(stage1);
  const factualCore = buildFactualCore(stage3.articles);
  const metaNarrative = buildMetaNarrative(stage3, factualCore);

  const metaArticle = {
    event_id: stage3.event_id,
    generated_at: new Date().toISOString(),
    factual_core: factualCore,
    source_profiles: stage3.articles,
    meta_narrative: metaNarrative,
    signature: null,
    signing_status: "unsigned_placeholder"
  };

  validateMetaArticleShape(metaArticle);
  return {
    event_cluster: stage3,
    meta_article: metaArticle
  };
}

export async function runPipelineFromTopic({ topic, eventSummaryHint = "" }) {
  const articles = await fetchArticlesForTopic(topic);
  if (!articles.length) {
    throw new Error(`No articles returned for topic "${topic}" from configured provider.`);
  }
  return runPipelineFromArticles({ topic, articles, eventSummaryHint });
}
