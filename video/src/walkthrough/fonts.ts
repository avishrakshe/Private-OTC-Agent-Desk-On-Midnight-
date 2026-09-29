// The site's typefaces (variable fonts, latin subset), self-hosted in public/fonts via
// `npm run walkthrough:fonts`, so a render never waits on the network.
export const FONT_FILES = [
  { family: 'Inter Tight', weights: '100 900', probe: '600', file: 'fonts/inter-tight.woff2' },
  { family: 'Inter', weights: '100 900', probe: '400', file: 'fonts/inter.woff2' },
  { family: 'JetBrains Mono', weights: '100 800', probe: '400', file: 'fonts/jetbrains-mono.woff2' },
] as const;
