// Placeholder content: replace with real resume data.

export const profile = {
  name: "Frantss Bongiovanni",
  handle: "frantssb",
  role: "Software Engineer",
  tagline: "Building calm software. Small details matter.",
  location: "Somewhere, Earth",
  utcOffset: -3,
  email: "hello@example.com",
  resumeHref: "#",
  about: [
    "I am a software engineer focused on web applications, developer tooling, and interfaces that stay out of the way.",
    "Placeholder paragraph: where I started, what I studied, and what I have been building over the last few years. Two or three sentences, written in first person, with inline links to the work.",
  ],
  links: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "X", href: "https://x.com/" },
  ],
};

export type Job = {
  company: string;
  location: string;
  role: string;
  type: string;
  start: string;
  end: string;
  duration: string;
  bullets: string[];
  stack: string[];
};

export const jobs: Job[] = [
  {
    company: "Company One",
    location: "Remote",
    role: "Senior Software Engineer",
    type: "Full-time",
    start: "01.2024",
    end: "∞",
    duration: "1y 9m",
    bullets: [
      "Led the rewrite of the customer dashboard; cut median load time by 60%.",
      "Owned the design system: tokens, primitives, and documentation.",
    ],
    stack: ["TypeScript", "Solid", "TanStack", "Postgres"],
  },
  {
    company: "Company Two",
    location: "São Paulo, BR",
    role: "Software Engineer",
    type: "Full-time",
    start: "03.2021",
    end: "12.2023",
    duration: "2y 10m",
    bullets: [
      "Built the billing pipeline handling 2M invoices a month.",
      "Introduced end-to-end tests and preview deployments.",
    ],
    stack: ["React", "Node.js", "AWS"],
  },
  {
    company: "Company Three",
    location: "Hybrid",
    role: "Frontend Developer",
    type: "Contract",
    start: "06.2019",
    end: "02.2021",
    duration: "1y 9m",
    bullets: ["Shipped the marketing site and component library."],
    stack: ["Vue", "Sass"],
  },
];

export type Project = { name: string; year: string; description: string; href: string };

export const projects: Project[] = [
  {
    name: "project-alpha",
    year: "2026",
    description: "Open-source CLI for scaffolding typed APIs.",
    href: "#",
  },
  {
    name: "project-beta",
    year: "2025",
    description: "A tiny state machine library for Solid.",
    href: "#",
  },
  {
    name: "project-gamma",
    year: "2024",
    description: "Self-hosted analytics with a 2kB client.",
    href: "#",
  },
  {
    name: "project-delta",
    year: "2023",
    description: "Keyboard-first command palette component.",
    href: "#",
  },
];

export type Post = { slug: string; title: string; date: string; body: string[] };

const placeholderBody = [
  "Placeholder: the opening paragraph sets up the problem and why it matters.",
  "Placeholder: the middle walks through what was tried, what worked, and what did not.",
  "Placeholder: the closing paragraph says what to take away.",
];

export const posts: Post[] = [
  {
    slug: "notes-on-boring-architecture",
    title: "Placeholder: notes on boring architecture",
    date: "2026.09.12",
    body: placeholderBody,
  },
  {
    slug: "ssr-without-the-tears",
    title: "Placeholder: SSR without the tears",
    date: "2026.03.02",
    body: placeholderBody,
  },
  {
    slug: "what-i-learned-shipping-a-design-system",
    title: "Placeholder: what I learned shipping a design system",
    date: "2025.11.20",
    body: placeholderBody,
  },
  {
    slug: "on-deleting-code",
    title: "Placeholder: on deleting code",
    date: "2025.06.08",
    body: placeholderBody,
  },
  {
    slug: "a-year-of-typescript-strict-mode",
    title: "Placeholder: a year of TypeScript strict mode",
    date: "2024.12.30",
    body: placeholderBody,
  },
];

export const education = [
  { school: "University Placeholder", degree: "BSc Computer Science", years: "2015–2019" },
];

export const stack = [
  "TypeScript",
  "Solid",
  "React",
  "Node.js",
  "Postgres",
  "Tailwind CSS",
  "Vite",
  "Docker",
];
