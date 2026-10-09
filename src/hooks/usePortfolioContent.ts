import { useState, useEffect } from 'react';

// Default Fallbacks from existing portfolio to guarantee zero-flash loading
const DEFAULT_PROJECTS = [
  {
    id: 'sector',
    span: 'bento-wide',
    number: '01',
    tags: ['Freestyle', 'Self Build'],
    title: 'SECTOR',
    icon: 'Rocket',
    desc: 'High-speed FPV racing drone. Fine-tuned for extreme precision and freestyle maneuvers. 0 to 200 km/h in under a second.',
    specs: ['Product Design', '0→200 km/h', 'Custom ESC'],
    published: true,
  },
  {
    id: 'cinelog',
    span: 'bento-narrow',
    number: '02',
    tags: ['Cinematic FPV'],
    title: 'CINELOG 35',
    icon: 'Video',
    desc: 'Compact cinewhoop designed for smooth cinematic tracking shots in tight spaces.',
    specs: ['Stable', 'ND Filters', 'Agile'],
    published: true,
  },
  {
    id: 'goldeneye',
    span: 'bento-wide',
    number: '03',
    tags: ['Autonomous', 'Rescue'],
    title: 'GOLDEN EYE',
    icon: 'Bot',
    desc: 'Autonomous rescue drone designed for medicine delivery in disaster zones. Built with custom electronics and flight controllers.',
    specs: ['Product Design', 'Payload', 'Auto Nav'],
    published: true,
  },
];

const DEFAULT_EXPERIENCES = [
  { year: 'Aug 2025 - Present', title: 'Learning Coordinator', org: 'TinkerHub', desc: '', tag: null },
  { year: 'Oct 2024 - Aug 2025', title: 'Co Lead', org: 'TinkerHub', desc: '', tag: null },
  { year: 'Apr 2025 - Present', title: 'MDC', org: 'IEEE', desc: '', tag: null },
];

const DEFAULT_ACHIEVEMENTS = [
  {
    title: 'NASA Space Apps Global Nominee',
    desc: 'Selected for the global nomination in the NASA Space Apps Challenge 2024 with Team Clean-Enviro.',
    img: '/achievements/nasa.jpg',
    tags: ['NASA', 'AI', 'Aerospace'],
  },
  {
    title: 'TinkerHub Co-Lead',
    desc: 'Co-lead of TinkerHub TOC-H campus team, promoting tech learning & innovation.',
    img: '/achievements/tinkerhub.jpg',
    tags: ['Community', 'Leadership'],
  },
  {
    title: 'Exhibition at Central University',
    desc: 'Showcased innovative drone technologies and autonomous UAV projects at Kasaragod Central University.',
    img: '/achievements/kazz.png',
    tags: ['Exhibition', 'UAV'],
  },
  {
    title: 'Electronics Workshops',
    desc: 'Completed advanced certification in modern web technologies and responsive design principles.',
    img: '/achievements/certificate.png',
    tags: ['Certification', 'Web'],
  },
  {
    title: 'Tech Innovation Workshops',
    desc: 'Attended multiple hands-on workshops on advanced electronics and embedded systems.',
    img: '/achievements/aisat.jpg',
    tags: ['Workshop', 'Electronics'],
  },
  {
    title: 'Innovation Excellence Award',
    desc: 'Recognized for outstanding contributions to emerging drone technology applications.',
    img: '/achievements/award.png',
    tags: ['Award', 'Excellence'],
  },
];

const DEFAULT_SKILLS = [
  'Drone Engineering',
  'FPV Piloting',
  'Product Design',
  'Embedded Systems',
  'Arduino & Electronics',
  'Python',
  'React',
  'Betaflight',
  'ArduPilot',
];

const DEFAULT_SOFTWARE_TOOLS = [
  { name: 'Fusion 360', icon: '/fusion360.png' },
  { name: 'Arduino', icon: '/arduino.png' },
  { name: 'Betaflight', icon: '/betaflight.png' },
  { name: 'QGroundControl', icon: '/qgroundcontrol.png' },
  { name: 'VS Code', icon: '/vscode.png' },
];

const DEFAULT_MARQUEE = [
  'Drone Engineer',
  '•',
  'FPV Pilot',
  '•',
  'Aerospace Innovator',
  '•',
  'AI Systems',
  '•',
  'NASA Nominee',
  '•',
  'Embedded Tech',
  '•',
];

const DEFAULT_PROFILE = {
  name: 'Sreehari Nandanan',
  firstName: 'SREEHARI',
  lastName: 'NANDANAN',
  scriptGreeting: 'hello, i am',
  title: 'Drone Engineer & Aerospace Innovator',
  heroDesc: 'Building next-gen autonomous flight systems.\nRacing drones, cinematic UAVs & AI-powered rescue vehicles — one breakthrough at a time.',
  heroImage: '/sreeharinandanan.webp',
  heroSecondaryImage: '/sreehari.webp',
  aboutLead: 'Pushing ideas forward, exploring new possibilities, and building what matters. Shaping a path in drones, tech, and innovation — one project at a time.',
  aboutBody: 'My expertise bridges hardware and software — crafting high-speed racing drones, autonomous rescue solutions, and cinematic aerial rigs. From intricate product design to custom Arduino-based electronics.',
  stats: [
    { num: '10+', label: 'Drone Builds' },
    { num: '20+', label: 'Projects' },
    { num: '4+', label: 'Years Exp' },
    { num: '∞', label: 'FPV Hours', isInfinity: true },
  ],
  contactEmail: 'sreeharinandanan3690@gmail.com',
  contactHeading: "LET'S BUILD SOMETHING",
  contactSub: "Custom drone build, skilled FPV pilot, or AI hardware innovation — let's bring your vision to life.",
  socialLinks: [
    { label: 'GH', title: 'GitHub', href: '#' },
    { label: 'LI', title: 'LinkedIn', href: '#' },
    { label: 'IG', title: 'Instagram', href: '#' },
  ],
};

export function usePortfolioContent() {
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [softwareTools, setSoftwareTools] = useState(DEFAULT_SOFTWARE_TOOLS);
  const [marqueeItems, setMarqueeItems] = useState(DEFAULT_MARQUEE);
  const [experiences, setExperiences] = useState(DEFAULT_EXPERIENCES);
  const [achievements, setAchievements] = useState(DEFAULT_ACHIEVEMENTS);
  const [siteSettings, setSiteSettings] = useState<any>({ showHireBox: true });

  useEffect(() => {
    let isMounted = true;

    async function fetchDynamicContent() {
      try {
        // Fetch published projects
        const projRes = await fetch('/content/projects.json');
        if (projRes.ok) {
          const projs = await projRes.json();
          if (Array.isArray(projs) && isMounted) {
            // Filter out unpublished drafts on public site
            setProjects(projs.filter((p: any) => p.published !== false));
          }
        }
      } catch {}

      try {
        // Fetch profile
        const profRes = await fetch('/content/profile.json');
        if (profRes.ok) {
          const p = await profRes.json();
          if (p && isMounted) setProfile((prev) => ({ ...prev, ...p }));
        }
      } catch {}

      try {
        // Fetch skills
        const skRes = await fetch('/content/skills.json');
        if (skRes.ok) {
          const sk = await skRes.json();
          if (sk && isMounted) {
            if (Array.isArray(sk.skills)) setSkills(sk.skills);
            if (Array.isArray(sk.softwareTools)) setSoftwareTools(sk.softwareTools);
            if (Array.isArray(sk.marqueeItems)) {
              // Interleave with dots for ticker
              const interleaved: string[] = [];
              sk.marqueeItems.forEach((item: string) => {
                interleaved.push(item);
                interleaved.push('•');
              });
              setMarqueeItems(interleaved);
            }
          }
        }
      } catch {}

      try {
        // Fetch experience
        const expRes = await fetch('/content/experience.json');
        if (expRes.ok) {
          const exp = await expRes.json();
          if (Array.isArray(exp) && isMounted) setExperiences(exp);
        }
      } catch {}

      try {
        // Fetch achievements
        const achRes = await fetch('/content/achievements.json');
        if (achRes.ok) {
          const ach = await achRes.json();
          if (Array.isArray(ach) && isMounted) setAchievements(ach);
        }
      } catch {}

      try {
        // Fetch site settings
        const setRes = await fetch('/content/site-settings.json');
        if (setRes.ok) {
          const s = await setRes.json();
          if (s && isMounted) setSiteSettings(s);
        }
      } catch {}
    }

    fetchDynamicContent();
    return () => { isMounted = false; };
  }, []);

  return {
    projects,
    profile,
    skills,
    softwareTools,
    marqueeItems,
    experiences,
    achievements,
    siteSettings,
  };
}
