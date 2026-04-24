export class NewsProviderBase {
  constructor({ apiKey, baseUrl }) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  // Returns normalized article list:
  // [{ headline, source, published, url, full_text }]
  async fetchTopic(_topicQuery) {
    throw new Error("fetchTopic must be implemented by provider adapter.");
  }
}
