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
      "Operations Performance Manager with 10+ years building robust reporting systems that empower teams to trust their data and act on it. I specialize in KPI frameworks, automated reporting, and data standardization across multi-site operations.",
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
      'Building software without a CS degree. Practical tutorials and real project breakdowns for non-developers turning ideas into working tools with AI. Because you don\'t need to code to create.',
    url: 'https://vibecodersdispatch.substack.com',
    github: null,
  },
  {
    id: 'arcade-portfolio',
    name: 'Arcade Portfolio',
    mascot: '/images/mascots/mascot-arcade.webp',
    status: 'live',
    description:
      "You're looking at it! A Virtua Fighter-inspired portfolio that proves professional can still be fun. Built with Next.js, TypeScript, and a passion for 90s arcade aesthetics.",
    url: null,
    github: null,
  },
  {
    id: 'improvement-roadmap',
    name: 'Improvement Roadmap',
    mascot: '/images/mascots/mascot-roadmap.webp',
    status: 'live',
    description:
      'Visual formula builder that transforms spreadsheet logic into intuitive drag-and-drop workflows. Designed for business users who need powerful calculations without the formula syntax headaches.',
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
