import fs from "fs";
import path from "path";
import crypto from "crypto";

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

const ED25519_PKCS8_PREFIX = Buffer.from("302e020100300506032b657004220420", "hex");
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

function privateKeyFromSeed(seed32) {
  const der = Buffer.concat([ED25519_PKCS8_PREFIX, seed32]);
  return crypto.createPrivateKey({ key: der, format: "der", type: "pkcs8" });
}

function publicRawFromKeyObject(publicKey) {
  const spkiDer = publicKey.export({ format: "der", type: "spki" });
  if (spkiDer.length < ED25519_SPKI_PREFIX.length + 32) {
    throw new Error("Invalid Ed25519 SPKI key length.");
  }
  return spkiDer.subarray(spkiDer.length - 32);
}

export function loadOrCreateEd25519Keypair(keysDirPath) {
  ensureDir(keysDirPath);
  const pubPath = path.join(keysDirPath, "public_key.b64");
  const privPath = path.join(keysDirPath, "private_key_secret.b64");

  if (fs.existsSync(pubPath) && fs.existsSync(privPath)) {
    const pub = Buffer.from(fs.readFileSync(pubPath, "utf8").trim(), "base64");
    const sec = Buffer.from(fs.readFileSync(privPath, "utf8").trim(), "base64");
    let privateKey;

    if (sec.length === 64) {
      // Legacy nacl secret_key format: first 32 bytes are seed.
      privateKey = privateKeyFromSeed(sec.subarray(0, 32));
    } else {
      privateKey = crypto.createPrivateKey({ key: sec, format: "der", type: "pkcs8" });
    }

    return {
      publicKeyRaw: pub,
      privateKey,
      pubPath,
      privPath,
      created: false
    };
  }

  const seed = crypto.randomBytes(32);
  const privateKey = privateKeyFromSeed(seed);
  const publicKeyRaw = publicRawFromKeyObject(crypto.createPublicKey(privateKey));

  // Store in legacy-compatible format so verify tooling can continue using raw base64 files.
  const secretLegacy = Buffer.concat([seed, publicKeyRaw]);
  fs.writeFileSync(pubPath, publicKeyRaw.toString("base64") + "\n");
  fs.writeFileSync(privPath, secretLegacy.toString("base64") + "\n", { mode: 0o600 });
  return { publicKeyRaw, privateKey, pubPath, privPath, created: true };
}

export function signDetachedBase64(rawBytes, privateKey) {
  const sig = crypto.sign(null, Buffer.from(rawBytes), privateKey);
  return sig.toString("base64");
}
