/**
 * The voice-over, one entry per scene. `npm run voice` turns each `text` into public/voice/<id>.mp3
 * plus word timings, and the video sizes every scene to its narration.
 */
export type SceneId =
  | 'hook'
  | 'problem'
  | 'brand'
  | 'how'
  | 'layers'
  | 'features'
  | 'agents'
  | 'result'
  | 'mandate'
  | 'guarantees'
  | 'live'
  | 'about'
  | 'outro';

export interface ScriptScene {
  id: SceneId;
  chapter: string;
  text: string;
  /** Show word-timed captions for this scene. */
  captions?: boolean;
}

export const VOICE = {
  name: 'en-US-AndrewMultilingualNeural',
  rate: '+4%',
  pitch: '+0Hz',
};

export const SCRIPT: ScriptScene[] = [
  {
    id: 'hook',
    chapter: 'The problem',
    text: 'Every time a big order hits a public blockchain, it is announced before it fills. Its size. Its price. The wallet behind it. And bots are watching.',
  },
  {
    id: 'problem',
    chapter: 'The problem',
    text: 'They trade ahead of you, sandwich your order, and walk away with the spread. For a DAO selling its treasury, or an AI agent trading on its own, the leak happens before execution. So that is exactly where it has to be closed.',
  },
  {
    id: 'brand',
    chapter: 'Introducing',
    text: 'Meet Private OTC Agent Desk. A sealed request-for-quote desk on Midnight, built for DAO treasuries, market makers and AI agents. Nobody sees the order, until it is filled.',
  },
  {
    id: 'how',
    chapter: 'How it works',
    text: 'Here is how it works. The seller opens an RFQ, and the chain records only an ID. Market makers answer with sealed quotes: a hash on-chain, with the real price encrypted to the seller. The seller then proves, in zero knowledge, that the best quote beats its private floor. The trade settles at the maker’s price, and an auditor can verify it later with a viewing key.',
  },
  {
    id: 'layers',
    chapter: 'How it works',
    text: 'Prices, floors, mandates and balances never leave your device. The proof says the rules hold, and nothing more. The ledger stores only commitments.',
  },
  {
    id: 'features',
    chapter: 'The desk',
    text: 'This is the desk. Every trade is proven against the same protocol guarantees. Pre-trade privacy. Zero-knowledge agent mandates. Proof of funds, with escrow locked at quote time. And an oracle price band of plus or minus three percent. Break any rule, and no proof exists, so no transaction exists.',
  },
  {
    id: 'agents',
    chapter: 'Agents',
    text: 'Now watch the agents trade. A Treasury Seller sells one point eight million DAO tokens in three slices. Three market makers answer with sealed, escrowed quotes. Along the way, the circuits block a fat-finger price, a bid outside its mandate, and a quote its maker could not fund.',
  },
  {
    id: 'result',
    chapter: 'Agents',
    text: 'The result: every token sold, for about one point five million dollars. All three receipts verified by the auditor. And zero prices or sizes ever reached the chain.',
  },
  {
    id: 'mandate',
    chapter: 'Mandates',
    text: 'The mandate builder answers the big question: can I let an AI trade my treasury? The owner commits to a private policy. Now flip on a compromised agent that claims a looser mandate, and the real circuit refuses. No valid proof. Order blocked.',
  },
  {
    id: 'guarantees',
    chapter: 'Under the hood',
    text: 'Under the hood: one Compact contract, twelve circuits and six guarantees. Built for DAO treasuries, token unlocks, market makers and AI treasury agents.',
  },
  {
    id: 'live',
    chapter: 'Live on Midnight',
    text: 'And it is live. Connect your Lace wallet, generate a real zero-knowledge proof, and settle a real transaction on Midnight. Or switch the agents on-chain, and they deploy a fresh desk from your wallet in eleven proven transactions.',
  },
  {
    id: 'about',
    chapter: 'The story',
    text: 'The About page tells the full story: the public mempool versus the private desk, the match proof in a single circuit, and exactly who sees what.',
  },
  {
    id: 'outro',
    chapter: 'Try it',
    captions: false,
    text: 'Private OTC Agent Desk. Sealed quotes, zero-knowledge matches, and agents that cannot break their mandate. Try it now, on Midnight.',
  },
];
