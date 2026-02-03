export type ProjectStatus = 'live' | 'wip' | 'concept';

export interface Project {
  id: string;
  name: string;
  mascot: string;
  status: ProjectStatus;
  description: string;
  url: string | null;
  github: string | null;
}

export const projects: Project[] = [
  {
    id: 'about-rodney',
    name: 'Rodney John',
    mascot: '/images/mascots/rodney-final.webp',
    status: 'live',
    description:
      "Strategic Operations Leader with 10+ years driving performance across decentralized networks. Builder, automation enthusiast, and innovation partner. Let's connect.",
    url: 'https://www.linkedin.com/in/rodney-john',
    github: null,
  },
  {
    id: 'improvement-roadmap',
    name: 'Improvement Roadmap',
    mascot: '/images/mascots/mascot-roadmap.webp',
    status: 'live',
    description:
      'Visual formula builder that turns spreadsheet calculations into drag-and-drop workflows. Connect nodes instead of writing syntax. Perfect for business users who need dashboards without the formula headaches.',
    url: '/mvp/improvement-roadmap',
    github: 'https://github.com/irodinnovations/improvement-roadmap',
  },
  {
    id: 'omr-magazine',
    name: 'One More Round',
    mascot: '/images/mascots/mascot-omr.webp',
    status: 'live',
    description:
      "Premium digital magazine for the fighting game community. Tournament coverage, player spotlights, opinion pieces. The FGC's first real magazine.",
    url: 'https://omrnewsletter.substack.com',
    github: null,
  },
  {
    id: 'plex-organizer',
    name: 'Plex Organizer',
    mascot: '/images/mascots/mascot-plex.webp',
    status: 'wip',
    description:
      'Auto-organize media files for Plex on Synology NAS. TMDb integration for metadata, duplicate handling with quality comparison, web dashboard for control.',
    url: null,
    github: 'https://github.com/irodinnovations/plex-media-organizer',
  },
  {
    id: 'irod-hub',
    name: 'iRod Hub',
    mascot: '/images/mascots/mascot-hub.webp',
    status: 'live',
    description:
      'Personal productivity command center. Kanban board, meeting recorder with transcription, draft editor, MVP showcase, and file browser. Where ideas become everything.',
    url: null,
    github: null,
  },
  {
    id: 'arcade-portfolio',
    name: 'Arcade Portfolio',
    mascot: '/images/mascots/mascot-arcade.webp',
    status: 'live',
    description:
      "You're looking at it! A Virtua Fighter-inspired personal website. Press Start to enter, character select for projects. Because portfolios should be fun.",
    url: null,
    github: null,
  },
  {
    id: 'meeting-recorder',
    name: 'Meeting Recorder',
    mascot: '/images/mascots/mascot-recorder.webp',
    status: 'wip',
    description:
      'Otter.ai-style meeting recorder. Record audio directly in the browser, get AI transcriptions, send email recaps to clients. Private and self-hosted.',
    url: null,
    github: null,
  },
  {
    id: 'vibe-dispatch',
    name: "Vibe Coder's Dispatch",
    mascot: '/images/mascots/mascot-vibe.webp',
    status: 'live',
    description:
      'Newsletter for non-developers building software with AI. Practical tutorials, real project breakdowns, vibe coding tips. Build things without a CS degree.',
    url: 'https://vibecodersdispatch.substack.com',
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
