import { NewsProviderBase } from "./base.mjs";

function normalizeGNewsArticle(article) {
  return {
    headline: article.title || "Untitled",
    source: article.source?.name || "Unknown source",
    published: article.publishedAt || new Date().toISOString(),
    url: article.url || "",
    full_text: article.content || article.description || ""
  };
}

export class GNewsProvider extends NewsProviderBase {
  async fetchTopic(topicQuery) {
    const url = new URL(`${this.baseUrl}/search`);
    url.searchParams.set("q", topicQuery);
    url.searchParams.set("lang", "en");
    url.searchParams.set("max", "25");
    url.searchParams.set("sortby", "publishedAt");
    url.searchParams.set("apikey", this.apiKey);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`GNews request failed: ${response.status}`);
    }
    const payload = await response.json();
    if (!Array.isArray(payload.articles)) return [];
    return payload.articles.map(normalizeGNewsArticle).filter((a) => a.url);
  }
}
