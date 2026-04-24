import { NewsApiProvider } from "./newsapi.mjs";
import { GNewsProvider } from "./gnews.mjs";
import { MediaStackProvider } from "./mediastack.mjs";

export function createNewsProvider(config) {
  const providerConfig = config.providers[config.provider];
  if (!providerConfig) {
    throw new Error(`Unknown news provider: ${config.provider}`);
  }

  switch (config.provider) {
    case "newsapi":
      return new NewsApiProvider(providerConfig);
    case "gnews":
      return new GNewsProvider(providerConfig);
    case "mediastack":
      return new MediaStackProvider(providerConfig);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}
