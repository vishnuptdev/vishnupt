# Source of truth for the portfolio copy

Use ONLY facts in this file. Anything marked TODO must render as a clearly visible placeholder
(e.g. "[TODO: add metric]") — never invent numbers, clients, dates, or quotes.
Updated 2026-10-04 from the owner's one-page resume (Vishnu_Payyannur_Thotten_Resume_1page.pdf).
Phone number exists on the resume but is deliberately NOT published here.

## Person

- Name: Vishnu Payyannur Thotten
- Role: Backend Team Lead at Trasna (formerly Workz), Dubai, UAE — since 2022
- Leads a team of 5 backend engineers
- Trasna manufactures eSIM and physical SIM cards; core contributor to eIM (GSMA SGP.32)
  IoT remote SIM profile management; owns 8+ backend services end-to-end
- 10+ years of backend engineering
- Core stack: Python (FastAPI, Flask, Django, DRF), Go, PostgreSQL, MySQL, Redis, ClickHouse,
  pgvector, Docker, Kubernetes, Nginx, Celery, RabbitMQ, CI/CD (GitLab)
- AI/LLM practice: RAG, LLM API integration (OpenAI, Anthropic, Ollama), LLM evaluation &
  benchmarking, MCP servers

## Projects (each becomes a "case file")

1. prgate — internal LLM-powered pull-request review tool, built at Trasna/Workz.
   - Judges diffs against team-committed rubrics; posts inline review comments.
   - Audit logging: rubric version, findings, tokens, cost, latency.
   - Outcome: cuts manual review time, reinforces coding standards.
   - TODO: quantified review-time metric; exact stack.
2. docmind — RAG service with measured evaluation (personal).
   - FastAPI: chunk → embed (pgvector) → retrieve → rerank → generate; Redis-backed async
     ingestion; multi-tenant collection scoping; MCP server exposing it to Claude Desktop/Code.
   - Eval harness: 39-question golden dataset; ablation sweep across chunking, top-k,
     reranking, embedding models.
   - Load testing: embedding calls ≈ 88% of query latency; app-layer CPU is the throughput ceiling.
   - TODO: public repo link.
3. superman — Go CLI routing AI coding tasks between a cheap local model and a capable guide model.
   - AST/regex symbol + call-graph index (Go, Python, JS, Java, Kotlin, Rust) feeds the routing
     decision; benchmark harness compares routed vs direct on cost, latency, pass rate.
   - Benchmarking cut routed cost by 24%; multi-provider fallback across OpenAI-compatible APIs
     and local Ollama.
   - TODO: public repo link.
4. llm-gateway — Go reverse proxy fronting multiple LLM providers (personal).
   - Provider-agnostic API in front of Anthropic, OpenAI and local Ollama.
   - Per-API-key rate limits, cost tracking, caching, automatic failover.
   - TODO: usage metrics, public repo link.
5. corbzy.com — live product, Go backend, solo-operated.
   - URL shortener (custom aliases, link expiry, click analytics), QR generator (URL, WiFi,
     vCard, calendar, SMS), digital business cards, UTM builder.
   - Owns every layer in production: API, data model, deployment, SEO, analytics.
   - Analytics record clicks without storing visitor IPs.
   - TODO: traffic/uptime numbers (only if the owner supplies them).

## Experience

- Backend Team Lead, Trasna (formerly Workz), Dubai, UAE — 2022 to present.
  Team of 5; technical direction across the backend stack; GitLab releases + Docker pipelines;
  FastAPI/Flask + PostgreSQL/Redis, expanding into Go; ClickHouse data pipeline with
  change-data-capture replication + monitoring; built prgate.
- Software Developer, Classyserve Technologies, Kerala, India — 2018 to 2022.
  REST APIs with Python/Django REST Framework; PostgreSQL/MySQL schema + query optimization;
  Docker, CI/CD, Celery background jobs.
- Junior Software Developer, Bizotic, Kerala, India — 2016 to 2017.
  Python/Django web apps; client- and server-side validation; production issue resolution.
- Web Developer, Infotech OneZero, Kerala, India — 2014 to 2016.
  Responsive web apps with HTML/CSS/JavaScript/PHP; SEO; ongoing client maintenance.

## Education

- B.Tech, Computer Science and Engineering, Vimal Jyothi Engineering College, Kerala, India — 2009–2013

## Contact

- Email: vishnupavithra@gmail.com
- GitHub: https://github.com/vishnuptdev
- LinkedIn: https://linkedin.com/in/vishnu-pavithran
- Location line: Dubai, UAE
