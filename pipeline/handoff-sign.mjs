import fs from "fs";
import path from "path";
import { readPipelineConfig } from "./config.mjs";
import { canonicalStringify } from "./canonicalize.mjs";
import { loadOrCreateEd25519Keypair, signDetachedBase64 } from "./signing.mjs";

function formatDateDir(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function readPipelineOutput(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Pipeline output not found at: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function toAbsolute(basePath) {
  return path.isAbsolute(basePath) ? basePath : path.resolve(basePath);
}

export async function runHandoffSign() {
  const config = readPipelineConfig();
  const outputPath = toAbsolute(config.signing.pipelineOutputPath);
  const articlesRoot = toAbsolute(config.signing.articlesDir);
  const keysDir = toAbsolute(config.signing.keysDir);

  const payload = readPipelineOutput(outputPath);
  const metaArticle = payload.meta_article || payload;
  if (!metaArticle.event_id) {
    throw new Error("Pipeline output missing meta_article.event_id");
  }

  const keyPair = loadOrCreateEd25519Keypair(keysDir);
  const canonical = canonicalStringify(metaArticle);
  const canonicalBytes = Buffer.from(canonical, "utf8");
  const signature = signDetachedBase64(canonicalBytes, keyPair.privateKey);

  const dateDir = formatDateDir(new Date(metaArticle.generated_at || Date.now()));
  const outDir = path.join(articlesRoot, dateDir);
  ensureDir(outDir);

  const jsonPath = path.join(outDir, `${metaArticle.event_id}.json`);
  const sigPath = path.join(outDir, `${metaArticle.event_id}.sig`);

  const signedMeta = { ...metaArticle, signature };
  fs.writeFileSync(jsonPath, canonicalStringify(signedMeta) + "\n");
  fs.writeFileSync(sigPath, signature + "\n");

  console.log("Handoff + signing complete.");
  console.log(`Meta article: ${jsonPath}`);
  console.log(`Signature:    ${sigPath}`);
  console.log(`Public key:   ${path.join(keysDir, "public_key.b64")}`);
  console.log(`Key status:   ${keyPair.created ? "created new keypair" : "loaded existing keypair"}`);
  return { jsonPath, sigPath };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runHandoffSign().catch((error) => {
    console.error("Handoff/signing failed:", error);
    process.exit(1);
  });
}
