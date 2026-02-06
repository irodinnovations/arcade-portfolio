// Professional portfolio content data

export const CONTACT_EMAIL = 'rodney@rodneyjohn.com'

export const SOCIAL_LINKS = {
  linkedin: 'https://www.linkedin.com/in/rodney-john',
  github: 'https://github.com/irodinnovations',
  substack: 'https://vibecodersdispatch.substack.com',
} as const

export const STATS = [
  { value: '400+', label: 'Dashboards Built' },
  { value: '3,500+', label: 'Hours Automated' },
  { value: '30+', label: 'Sites Nationwide' },
  { value: '200+', label: 'Staff Trained' },
  { value: '200+', label: 'KPIs Defined' },
  { value: '40%', label: 'Accuracy Improvement' },
] as const

export const CAPABILITIES = [
  {
    icon: '📊',
    title: 'Performance Reporting Systems',
    description:
      'Design and build reporting infrastructure that teams actually trust and use daily. No more "where did this number come from?"',
  },
  {
    icon: '⚡',
    title: 'Process Automation',
    description:
      "Turn manual, error-prone workflows into reliable automated systems. If you're copy-pasting between spreadsheets, we should talk.",
  },
  {
    icon: '🎯',
    title: 'KPI Design & Governance',
    description:
      'Define metrics that actually drive behavior. Clear ownership, consistent definitions, dashboards that lead to action.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Tools',
    description:
      'Building practical AI products that solve real problems. Not hype — working software that ships.',
  },
] as const

export const PROJECTS = [
  {
    tag: 'AI / SaaS',
    title: 'Content Repurposer',
    description:
      'AI-powered tool that transforms long-form content into platform-optimized posts for LinkedIn, Twitter, and newsletters.',
    stats: [
      { value: '97%', label: 'test coverage' },
      { value: '92', label: 'automated tests' },
      { value: 'Production', label: 'ready' },
    ],
    link: '#',
  },
  {
    tag: 'Automation',
    title: 'Improvement Roadmap',
    description:
      'Visual formula builder that turns spreadsheet calculations into drag-and-drop workflows. Making Excel accessible to everyone.',
    stats: [
      { value: '31', label: 'formula types' },
      { value: '118', label: 'tests passing' },
    ],
    link: '#',
  },
  {
    tag: 'Templates',
    title: 'KPI Command Center',
    description:
      'Plug-and-play KPI tracking system with 52 pre-built metrics, auto-calculations, and executive-ready reports. Built for operations teams.',
    stats: [
      { value: '52', label: 'KPIs included' },
      { value: '6', label: 'worksheets' },
    ],
    link: '#',
  },
] as const

export const TIMELINE = [
  {
    date: '2019 – 2025',
    title: 'Manager, Operations Performance',
    company: 'Center for Employment Opportunities',
    highlights: [
      'Built performance reporting system used across 30+ sites nationally',
      'Automated weekly reporting, saving 15+ hours of manual work',
      'Defined and governed KPIs for program delivery teams',
      'Led data quality initiatives that improved reporting accuracy by 40%',
    ],
  },
  {
    date: '2014 – 2019',
    title: 'Senior Associate, Program Improvement',
    company: 'Center for Employment Opportunities',
    highlights: [
      'Designed operational dashboards for executive decision-making',
      'Created workflow automation reducing processing time by 60%',
      'Trained 100+ staff on reporting tools and data interpretation',
    ],
  },
] as const

export const NAV_LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#projects', label: 'Projects' },
  { href: '#background', label: 'Background' },
  { href: '#contact', label: 'Contact' },
] as const
