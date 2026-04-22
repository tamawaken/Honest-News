import fs from 'fs';
import path from 'path';
import nacl from 'tweetnacl';

const ARTICLES_DIR = path.resolve('../articles');
const KEYS_DIR = path.resolve('../keys');

if (!fs.existsSync(KEYS_DIR)) fs.mkdirSync(KEYS_DIR, { recursive: true });

// Load or create keypair (raw Ed25519, base64 files)
const pubPath = path.join(KEYS_DIR, 'public_key.b64');
const privPath = path.join(KEYS_DIR, 'private_key_secret.b64');

let keyPair;
if (fs.existsSync(pubPath) && fs.existsSync(privPath)) {
  const pub = Buffer.from(fs.readFileSync(pubPath,'utf8').trim(), 'base64');
  const sec = Buffer.from(fs.readFileSync(privPath,'utf8').trim(), 'base64');
  keyPair = { publicKey: new Uint8Array(pub), secretKey: new Uint8Array(sec) };
  console.log('Loaded existing Ed25519 keypair.');
} else {
  keyPair = nacl.sign.keyPair();
  fs.writeFileSync(pubPath, Buffer.from(keyPair.publicKey).toString('base64') + '\n');
  fs.writeFileSync(privPath, Buffer.from(keyPair.secretKey).toString('base64') + '\n', { mode: 0o600 });
  console.log('Generated new Ed25519 keypair.');
}

// Walk articles and sign all *.json
function* walk(dir){
  for (const f of fs.readdirSync(dir)){
    const p = path.join(dir, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else if (p.endsWith('.json')) yield p;
  }
}

let count = 0;
for (const jsonPath of walk(ARTICLES_DIR)) {
  const raw = fs.readFileSync(jsonPath);
  const sig = nacl.sign.detached(new Uint8Array(raw), keyPair.secretKey);
  const out = jsonPath.replace(/\.json$/i, '.sig');
  fs.writeFileSync(out, Buffer.from(sig).toString('base64') + '\n');
  count++;
  console.log('Signed:', path.relative(ARTICLES_DIR, jsonPath));
}
console.log(`\nDone. Signed ${count} article(s).`);

