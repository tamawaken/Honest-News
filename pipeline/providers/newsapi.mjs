import { NewsProviderBase } from "./base.mjs";

function normalizeNewsApiArticle(article) {
  return {
    headline: article.title || "Untitled",
    source: article.source?.name || "Unknown source",
    published: article.publishedAt || new Date().toISOString(),
    url: article.url || "",
    full_text: article.content || article.description || ""
  };
}

export class NewsApiProvider extends NewsProviderBase {
  async fetchTopic(topicQuery) {
    const url = new URL(`${this.baseUrl}/everything`);
    url.searchParams.set("q", topicQuery);
    url.searchParams.set("language", "en");
    url.searchParams.set("sortBy", "publishedAt");
    url.searchParams.set("pageSize", "25");
    url.searchParams.set("apiKey", this.apiKey);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NewsAPI request failed: ${response.status}`);
    }
    const payload = await response.json();
    if (!Array.isArray(payload.articles)) return [];
    return payload.articles.map(normalizeNewsApiArticle).filter((a) => a.url);
  }
}
