import { readPipelineConfig, assertProviderConfigured } from "./config.mjs";
import { createNewsProvider } from "./providers/index.mjs";

export async function fetchArticlesForTopic(topicQuery) {
  const config = readPipelineConfig();
  assertProviderConfigured(config);
  const provider = createNewsProvider(config);
  return provider.fetchTopic(topicQuery);
}
