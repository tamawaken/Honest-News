function requiredFromEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function optionalFromEnv(name, fallback = "") {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

export function readPipelineConfig() {
  const provider = optionalFromEnv("TNM_NEWS_PROVIDER", "gnews").toLowerCase();
  return {
    provider,
    providers: {
      newsapi: {
        apiKey: optionalFromEnv("TNM_NEWSAPI_KEY"),
        baseUrl: optionalFromEnv("TNM_NEWSAPI_BASE_URL", "https://newsapi.org/v2")
      },
      gnews: {
        apiKey: optionalFromEnv("TNM_GNEWS_KEY"),
        baseUrl: optionalFromEnv("TNM_GNEWS_BASE_URL", "https://gnews.io/api/v4")
      },
      mediastack: {
        apiKey: optionalFromEnv("TNM_MEDIASTACK_KEY"),
        baseUrl: optionalFromEnv("TNM_MEDIASTACK_BASE_URL", "http://api.mediastack.com/v1")
      }
    },
    llm: {
      provider: optionalFromEnv("TNM_LLM_PROVIDER", "placeholder"),
      apiKey: optionalFromEnv("TNM_LLM_API_KEY"),
      model: optionalFromEnv("TNM_LLM_MODEL", "placeholder-model")
    },
    signing: {
      keysDir: optionalFromEnv("TNM_KEYS_DIR", "./keys"),
      articlesDir: optionalFromEnv("TNM_ARTICLES_DIR", "./articles"),
      pipelineOutputPath: optionalFromEnv(
        "TNM_PIPELINE_OUTPUT_PATH",
        "./pipeline/output/latest-meta-article.json"
      )
    }
  };
}

export function assertProviderConfigured(config) {
  const provider = config.providers[config.provider];
  if (!provider) {
    throw new Error(`Unsupported TNM_NEWS_PROVIDER: ${config.provider}`);
  }
  if (!provider.apiKey) {
    throw new Error(
      `Provider "${config.provider}" selected but API key missing. Set corresponding TNM_*_KEY variable.`
    );
  }
}

export function assertLlmConfigured(config) {
  if (config.llm.provider === "placeholder") return;
  if (!config.llm.apiKey) {
    throw new Error(`LLM provider "${config.llm.provider}" selected but TNM_LLM_API_KEY is missing.`);
  }
}

export function readRequiredConfig(name) {
  return requiredFromEnv(name);
}
