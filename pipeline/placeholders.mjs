export async function fetchNewsByTopicPlaceholder(topicQuery) {
  throw new Error(
    `News API placeholder called for "${topicQuery}". Configure a provider adapter (NewsAPI/GNews/MediaStack).`
  );
}

export async function extractClaimsWithLlmPlaceholder(_articleText) {
  throw new Error(
    "LLM placeholder called for claim extraction. Connect Claude/API client and keep extraction-only constraints."
  );
}

export async function extractFramingWithLlmPlaceholder(_articleText) {
  throw new Error(
    "LLM placeholder called for framing extraction. Connect Claude/API client and keep compare-not-judge constraints."
  );
}

export async function generateMetaNarrativeWithLlmPlaceholder(_payload) {
  throw new Error(
    "LLM placeholder called for meta narrative generation. Connect Claude/API client with structured JSON output."
  );
}
