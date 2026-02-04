export type ProjectStatus = 'live' | 'wip' | 'concept';

export interface Project {
  id: string;
  name: string;
  mascot: string;
  status: ProjectStatus;
  description: string;
  url: string | null;
  github: string | null;
  isPersonal?: boolean;
}

export const projects: Project[] = [
  {
    id: 'about-rodney',
    name: 'Rodney John',
    mascot: '/images/mascots/rodney-final.webp',
    status: 'live',
    description:
      "I'm an Ops Performance Manager with a strong background in building dashboards, analytics tools, and reporting systems — now focused on creating AI-driven products. Self-taught, product-focused, and always shipping. Like what you see? Let's talk.",
    url: 'https://www.linkedin.com/in/rodney-john',
    github: null,
    isPersonal: true,
  },
  {
    id: 'vibe-dispatch',
    name: "Vibe Coder's Dispatch",
    mascot: '/images/mascots/mascot-vibe.webp',
    status: 'live',
    description:
      "A real-world look at how I went from ops and reporting systems to building AI-powered products — without a developer background. VCD isn't a \"learn to code\" series. It's about solving real problems, making smart trade-offs, and shipping useful software. Built for operators, analysts, and business-minded builders who want to create without mastering every line of code. This is what it looks like when business insight meets just enough tech to build.",
    url: 'https://vibecodersdispatch.substack.com',
    github: null,
  },
  {
    id: 'arcade-portfolio',
    name: 'Arcade Portfolio',
    mascot: '/images/mascots/mascot-arcade.webp',
    status: 'live',
    description:
      "You're looking at it. A game-inspired portfolio disguised as a character select screen, built with AI, stubbornness, and a love for 90s arcade aesthetics. Part professional portfolio, part arcade tribute, part experiment — it's proof that serious work doesn't have to be boring. There's also a hidden easter egg. Found it yet?",
    url: null,
    github: null,
  },
  {
    id: 'improvement-roadmap',
    name: 'Improvement Roadmap',
    mascot: '/images/mascots/mascot-roadmap.webp',
    status: 'live',
    description:
      "Visual formulas for people who hate formulas. Spreadsheets are powerful, but formulas are painful. Syntax is cryptic, mistakes break everything, and even pros still Google SUMIF. The Improvement Roadmap replaces formulas with visual logic — just drag, connect, and calculate. No syntax. No guesswork. Just clear, powerful results. Built for business users who think in ideas, not Excelese.",
    url: '/mvp/improvement-roadmap',
    github: null,
  },
  {
    id: 'omr-magazine',
    name: 'One More Round',
    mascot: '/images/mascots/mascot-omr.webp',
    status: 'live',
    description:
      "The FGC's first premium digital magazine. Tournament coverage, player spotlights, and community stories. Bringing the spirit of classic gaming magazines to the fighting game community.",
    url: 'https://omrnewsletter.substack.com',
    github: null,
  },
  {
    id: 'irod-hub',
    name: 'iRod Hub',
    mascot: '/images/mascots/mascot-hub.webp',
    status: 'live',
    description:
      'Personal productivity command center. Kanban boards, meeting recorder with AI transcription, draft editor, and file management. Where scattered ideas become organized action.',
    url: null,
    github: null,
  },
  {
    id: 'meeting-recorder',
    name: 'Meeting Recorder',
    mascot: '/images/mascots/mascot-recorder.webp',
    status: 'wip',
    description:
      'Self-hosted meeting intelligence. Record audio in-browser, get AI-powered transcriptions, and send automated recap emails. Private, secure, and under your control.',
    url: null,
    github: null,
  },
  {
    id: 'plex-organizer',
    name: 'Plex Organizer',
    mascot: '/images/mascots/mascot-plex.webp',
    status: 'wip',
    description:
      'Automated media library management for Plex on Synology NAS. TMDb metadata integration, intelligent duplicate handling, and a clean web dashboard for oversight.',
    url: null,
    github: null,
  },
  {
    id: 'mystery',
    name: '???',
    mascot: '/images/mascots/mascot-mystery.webp',
    status: 'concept',
    description:
      'More projects in development. Ideas are brewing, MVPs are being built. Stay tuned for what comes next.',
    url: null,
    github: null,
  },
];
