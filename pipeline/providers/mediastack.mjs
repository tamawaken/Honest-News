import { NewsProviderBase } from "./base.mjs";

function normalizeMediaStackArticle(article) {
  return {
    headline: article.title || "Untitled",
    source: article.source || "Unknown source",
    published: article.published_at || new Date().toISOString(),
    url: article.url || "",
    full_text: article.description || ""
  };
}

export class MediaStackProvider extends NewsProviderBase {
  async fetchTopic(topicQuery) {
    const url = new URL(`${this.baseUrl}/news`);
    url.searchParams.set("access_key", this.apiKey);
    url.searchParams.set("languages", "en");
    url.searchParams.set("keywords", topicQuery);
    url.searchParams.set("sort", "published_desc");
    url.searchParams.set("limit", "25");

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`MediaStack request failed: ${response.status}`);
    }
    const payload = await response.json();
    if (!Array.isArray(payload.data)) return [];
    return payload.data.map(normalizeMediaStackArticle).filter((a) => a.url);
  }
}
