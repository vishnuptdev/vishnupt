// Typed content layer — mirrors content/profile.md (source of truth, updated from the owner's resume).
// Rule: no invented facts. Unknown values stay as visible "[TODO: …]" strings.
// The resume is the script and the site order: summary → skills → experience → personal
// projects → education/contact. Each resume section appears exactly once, verbatim.

export interface Person {
  name: string;
  role: string;
  company: string;
  location: string;
}

export interface Project {
  slug: string;
  name: string;
  kind: "personal";
  summary: string;
  stack: string[];
  url?: string;
  repo?: string;
  // Case-file sections. Missing facts are "[TODO: …]" strings, rendered visibly.
  problem: string;
  design: string;
  outcome: string;
}

export interface ExperienceEntry {
  title: string;
  org: string;
  location: string;
  from: string;
  to: string;
  bullets: string[];
}

export interface Contact {
  email: string;
  github: string;
  linkedin: string;
  locationLine: string;
}

export const person: Person = {
  name: "Vishnu Payyannur Thotten",
  role: "Senior Backend Engineer",
  company: "Trasna",
  location: "Dubai, UAE",
};

// PROFESSIONAL SUMMARY — the resume paragraph verbatim, split at its own sentence stops.
// Nothing reworded, nothing added: three sentences, three captions.
export const summaryLines = [
  "Senior Backend Engineer with 10+ years building and scaling production backend systems.",
  "Track record of designing high-performance APIs, optimizing database and query performance at scale, and owning multi-tenant API platforms and real-time data infrastructure end-to-end.",
  "Extends the same engineering discipline to LLM-based systems, measuring retrieval quality, cost, and latency, and building AI tooling that fits real developer workflows.",
];

// CORE SKILLS — the resume's five groups, verbatim names and items, nothing added or merged.
export const skillGroups = [
  {
    big: "Languages & Frameworks",
    chips: ["Python", "FastAPI", "Flask", "Django", "Django REST Framework", "Go"],
  },
  { big: "Databases", chips: ["PostgreSQL", "MySQL", "Redis", "ClickHouse", "pgvector"] },
  {
    big: "APIs & Architecture",
    chips: ["RESTful API Design", "Microservices", "System Design", "Database Optimization", "Performance Tuning"],
  },
  {
    big: "AI / LLM",
    chips: [
      "Retrieval-Augmented Generation",
      "LLM API integration (OpenAI, Anthropic, Ollama)",
      "LLM evaluation & benchmarking",
      "LLM-powered developer tooling",
      "MCP servers",
    ],
  },
  {
    big: "DevOps & Tools",
    chips: ["Docker", "Kubernetes", "Linux", "CI/CD", "GitLab", "Nginx", "Celery", "RabbitMQ", "PyTest", "Jira"],
  },
];

// PROFESSIONAL EXPERIENCE — four roles, every resume bullet verbatim, in resume order.
export const experience: ExperienceEntry[] = [
  {
    title: "Senior Backend Engineer",
    org: "Trasna (formerly Workz)",
    location: "Dubai, UAE",
    from: "2022",
    to: "Present",
    bullets: [
      "Drive technical direction across the backend stack; manage GitLab releases and Docker deployment pipelines across all services.",
      "Build and maintain backend services in FastAPI and Flask with PostgreSQL and Redis, expanding into Go for new services.",
      "Core contributor to eIM (GSMA SGP.32) systems, implementing protocol message parsing and handling for IoT remote SIM profile management.",
      "Own 8+ backend services end-to-end, including a ClickHouse data pipeline with change-data-capture replication and monitoring, improving data reliability and observability across environments.",
      "Designed and built prgate, an internal LLM-powered pull request review tool that judges diffs against team-committed rubrics and posts inline review comments with full audit logging (rubric version, findings, tokens, cost, latency) — cutting manual review time and reinforcing coding standards.",
    ],
  },
  {
    title: "Software Developer",
    org: "Classyserve Technologies",
    location: "Kerala, India",
    from: "2018",
    to: "2022",
    bullets: [
      "Built and maintained RESTful APIs with Python and Django REST Framework, powering production-grade web applications.",
      "Owned relational database design and query optimization across PostgreSQL and MySQL, improving performance under load.",
      "Containerized applications with Docker, built CI/CD pipelines, and used Celery for asynchronous background processing.",
    ],
  },
  {
    title: "Junior Software Developer",
    org: "Bizotic",
    location: "Kerala, India",
    from: "2016",
    to: "2017",
    bullets: [
      "Developed and supported Python/Django web applications, implementing client- and server-side validation and resolving production issues with senior developers.",
    ],
  },
  {
    title: "Web Developer",
    org: "Infotech OneZero",
    location: "Kerala, India",
    from: "2014",
    to: "2016",
    bullets: [
      "Built responsive web applications with HTML, CSS, JavaScript, and PHP; improved search engine optimization and handled ongoing client maintenance.",
    ],
  },
];

// PERSONAL PROJECTS — the resume's four, verbatim one-liners; details from its bullets.
// prgate is NOT here: the resume files it under Trasna, so it lives only in that cut.
export const projects: Project[] = [
  {
    slug: "corbzy",
    name: "corbzy.com",
    kind: "personal",
    summary: "Live production web toolkit with a Go backend, built and operated solo.",
    stack: ["Go"],
    url: "https://corbzy.com",
    problem: "Short links, QR codes, business cards and UTM campaigns scattered across different tools.",
    design:
      "A Go-backed URL shortener with custom aliases, link expiry and click analytics, plus a QR code generator (URL, WiFi, vCard, calendar, SMS), digital business cards and a UTM builder.",
    outcome:
      "Built and operated end-to-end: API design, data model, deployment, SEO, and privacy-conscious analytics that record clicks without storing visitor IPs. [TODO: traffic/uptime numbers]",
  },
  {
    slug: "docmind",
    name: "docmind",
    kind: "personal",
    summary: "RAG service with async ingestion and a measured evaluation harness.",
    stack: ["Python", "FastAPI", "pgvector", "Redis", "MCP"],
    problem: "Document Q&A where retrieval quality is guessed, not measured.",
    design:
      "A FastAPI RAG service (chunk, embed to pgvector, retrieve, rerank, generate) with Redis-backed async ingestion, multi-tenant collection scoping, and an MCP server exposing it to Claude Desktop/Code.",
    outcome:
      "A 39-question golden dataset and ablation sweep across chunking, top-k, reranking and embedding models — load testing identified embedding calls as ~88% of query latency and application-layer CPU as the throughput ceiling. [TODO: public repo link]",
  },
  {
    slug: "superman",
    name: "superman",
    kind: "personal",
    summary:
      "Zero-dependency Go CLI that routes AI coding tasks between a cheap local model and a capable guide model.",
    stack: ["Go", "Ollama", "OpenAI-compatible APIs"],
    problem: "Paying capable-model prices for trivial edits — and trivial routing guesses for hard ones.",
    design:
      "An AST/regex-based symbol and call-graph index (Go, Python, JS/TS, Java, Kotlin, Rust) that resolves which files a change actually affects, feeding a ranked repo map into the prompt.",
    outcome:
      "A benchmark harness comparing routed vs. direct execution on cost, latency and pass rate — the data cut routed cost by 24%. Multi-provider fallback across OpenAI-compatible APIs and local Ollama. [TODO: public repo link]",
  },
  {
    slug: "llm-gateway",
    name: "llm-gateway",
    kind: "personal",
    summary: "Go reverse proxy unifying multiple LLM providers behind one API.",
    stack: ["Go"],
    problem: "Every provider means its own keys, limits and failover code in every client.",
    design:
      "A provider-agnostic gateway fronting Anthropic, OpenAI and local Ollama, with per-API-key rate limiting, cost tracking, caching and automatic failover.",
    outcome: "[TODO: usage metrics] [TODO: public repo link]",
  },
];

// EDUCATION — the resume's last section, shown once, at the end of the film.
export const education = {
  degree: "B.Tech in Computer Science and Engineering",
  college: "Vimal Jyothi Engineering College",
  place: "Kerala, India",
  years: "2009 – 2013",
};

// Section registry — nav, palette jumps and scroll anchors all read this. Page order = resume order.
export interface Section {
  id: string;
  label: string;
  hint: string;
  phase: number;
}

// nav chrome copy: chapter codenames, not dictionary headings — the resume wording lives
// in the sections themselves, verbatim; the bar speaks film
export const topSections: Section[] = [
  { id: "world", label: "the brief", hint: "the corridor", phase: 2 },
  { id: "skills", label: "stack", hint: "five groups", phase: 3 },
  { id: "experience", label: "commits", hint: "four cuts", phase: 4 },
  { id: "cases", label: "side quests", hint: "the side reel", phase: 5 },
  { id: "education", label: "roots", hint: "origin cut", phase: 6 },
  { id: "contact", label: "ping", hint: "let's build", phase: 7 },
];

export const contact: Contact = {
  email: "vishnupavithra@gmail.com",
  github: "https://github.com/vishnuptdev",
  linkedin: "https://linkedin.com/in/vishnu-pavithran",
  locationLine: "Dubai, UAE",
};
