import fs from "fs";
import path from "path";
import { SAMPLE_EVENT } from "./sample-event.mjs";
import { runPipelineFromArticles, runPipelineFromTopic } from "./pipeline.mjs";
import { runHandoffSign } from "./handoff-sign.mjs";

const OUTPUT_DIR = path.resolve("./pipeline/output");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "latest-meta-article.json");

async function main() {
  const useProvider = process.env.TNM_USE_PROVIDER === "1";
  const result = useProvider
    ? await runPipelineFromTopic({
        topic: process.env.TNM_TOPIC || SAMPLE_EVENT.topic,
        eventSummaryHint: process.env.TNM_EVENT_SUMMARY || ""
      })
    : await runPipelineFromArticles({
        topic: SAMPLE_EVENT.topic,
        eventSummaryHint: SAMPLE_EVENT.event_summary,
        articles: SAMPLE_EVENT.articles
      });

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));

  console.log("Pipeline scaffold run complete.");
  console.log(`Event ID: ${result.event_cluster.event_id}`);
  console.log(`Articles clustered: ${result.event_cluster.articles.length}`);
  console.log(`Agreed facts: ${result.meta_article.factual_core.agreed_facts.length}`);
  console.log(`Output: ${OUTPUT_PATH}`);
  console.log(`Source mode: ${useProvider ? "provider adapter" : "local sample event"}`);

  if (process.env.TNM_HANDOFF_SIGN === "1") {
    console.log("Running Ed25519 handoff/signing...");
    await runHandoffSign();
  }
}

main().catch((error) => {
  console.error("Pipeline scaffold failed:", error);
  process.exit(1);
});
