# Usage guide

## 1. On the website (no install)

Open **https://mn-demo.vercel.app**.

### Watch the agents: instant mode
1. Scroll to **Agents** and leave the switch on **Instant (local)**.
2. Press **Run the desk** (or **Step** through it one transaction at a time).
3. Click any step to compare what the agent knows (violet) with what the chain sees (grey), including transaction inputs that are public by design (amber).

No wallet is needed. The compiled contract runs in your browser.

### Run the agents on Midnight: Lace mode
You need the **Lace** wallet with Midnight enabled, on the same network as the site (Preview), with **DUST** for fees:
1. Get tNIGHT from the [Preview faucet](https://midnight-tmnight-preview.nethermind.dev), then in Lace designate it for DUST generation and wait a few minutes.
2. Click **Connect wallet** (top right) and approve in Lace.
3. In **Agents**, switch to **On Midnight (Lace)** and press **Deploy & run on preview**.
4. Approve each transaction in Lace (11 in total: deploy, 2 deposits, 4 mandate steps, open RFQ, quote, match, claim). Allow 10–20 minutes.
5. When it finishes, the summary links your freshly deployed desk on the explorer.

If Lace can't prove a transaction, the site falls back to a proof server on `http://127.0.0.1:6300`; start one with `npm run proof-server:start`.

### Try a mandate
In **Set a mandate**, change the limits or the order and watch the verdict, which comes from the real `submitQuote` circuit. Tick **Compromised agent** to see a looser, forged mandate rejected.

### Send a live transaction
**Connect, prove, settle** sends a `storeMessage` transaction to the demo contract on Preview. It shows the full prove → balance → submit pipeline with Lace.

## 2. From the command line

```bash
npm install
npm test                 # 13 protocol tests against the compiled circuits
npm run typecheck
npm run agents           # the 39-step story in the terminal (instant)
npm run benchmark        # circuit execution times
```

### On-chain, with a seed wallet

```bash
npm run proof-server:start                           # local node, indexer, proof server (Docker)
npm run agents:onchain                               # full round on the local devnet
npm run health-check -- --network preview
npm run deploy:otc -- --network preview              # deploy a desk; prints the address
npm run agents:onchain -- --network preview          # full round on Preview
npm run cli -- --network preview                     # interactive menu
```

On a public network the first run creates a wallet and waits for you to fund its address from the faucet. Set `PRIVATE_STATE_PASSWORD` (16+ characters) so contract secret keys aren't encrypted with the public placeholder. Keep `.midnight-state.json` and `.otc-desk-keys.json` private and backed up.

### Compiling the contract

```bash
compact update 0.31.1        # matches compact-runtime 0.16
npm run compile
```

No local compiler? Use Docker:

```bash
docker run --rm -v compact-home:/root -v "$PWD:/work" -w /work ubuntu:24.04 bash -c \
  "apt-get update -qq && apt-get install -y -qq curl xz-utils unzip >/dev/null && \
   curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh && \
   ~/.local/bin/compact update 0.31.1 && \
   ~/.local/bin/compact compile contracts/private-otc-desk.compact contracts/managed/private-otc-desk"
```

After recompiling, copy `contracts/managed/private-otc-desk/keys/*` and `zkir/*.bzkir` to `public/managed/private-otc-desk/` so the site serves the matching artifacts.
