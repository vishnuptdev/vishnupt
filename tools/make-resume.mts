// Resume PDF generator — run `npm run resume` after editing src/content/index.ts.
// Typesets public/resume.pdf straight from the typed content layer: same facts, same order,
// nothing invented. Print-plain by design (Helvetica on A4); the site stays cinematic,
// the download stays a resume. Phone number deliberately not published — matches the site.
import { writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import {
  person,
  summaryLines,
  skillGroups,
  experience,
  projects,
  education,
  contact,
} from "../src/content/index.ts";

const W = 595.28; // A4
const H = 841.89;
const M = 46;
const INK = rgb(0.08, 0.09, 0.11);
const MUT = rgb(0.34, 0.36, 0.39);
const ACC = rgb(0.68, 0.42, 0.02); // amber, dark enough for print
const RULE = rgb(0.72, 0.72, 0.72);

const doc = await PDFDocument.create();
doc.setTitle(`${person.name} — ${person.role}`);
doc.setAuthor(person.name);
doc.setSubject("Resume");

const regular = await doc.embedFont(StandardFonts.Helvetica);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);

let page: PDFPage = doc.addPage([W, H]);
let y = H - M;

function wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const w of text.split(/\s+/)) {
    const t = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(t, size) <= maxW) line = t;
    else {
      if (line) out.push(line);
      line = w;
    }
  }
  if (line) out.push(line);
  return out;
}

function need(h: number) {
  if (y - h < M) {
    page = doc.addPage([W, H]);
    y = H - M;
  }
}

function line(t: string, size: number, font: PDFFont, color = INK, indent = 0) {
  for (const ln of wrap(t, font, size, W - M * 2 - indent)) {
    need(size + 4);
    y -= size + 3.8;
    page.drawText(ln, { x: M + indent, y, size, font, color });
  }
}

function heading(t: string) {
  need(40);
  y -= 16;
  page.drawText(t.toUpperCase(), { x: M, y, size: 10.5, font: bold, color: ACC, characterSpacing: 1.6 });
  y -= 7;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.7, color: RULE });
  y -= 2;
}

// ---- header ----
line(person.name, 21, bold);
y -= 2;
line(`${person.role} · ${person.location}`, 11, regular, MUT);
line(
  `${contact.email} · ${contact.github.replace("https://", "")} · ${contact.linkedin.replace("https://", "")}`,
  9,
  regular,
  MUT
);

// ---- summary ----
heading("Professional Summary");
for (const s of summaryLines) line(s, 9.8, regular);

// ---- skills ----
heading("Core Skills");
for (const g of skillGroups) line(`${g.big}: ${g.chips.join(", ")}`, 9.5, regular);

// ---- experience ----
heading("Professional Experience");
for (const e of experience) {
  need(30);
  y -= 5;
  line(`${e.title} — ${e.org}`, 10.5, bold);
  line(`${e.location} · ${e.from} – ${e.to}`, 9, regular, MUT);
  y -= 1;
  for (const b of e.bullets) line(`•  ${b}`, 9.5, regular, INK, 8);
}

// ---- personal projects ----
heading("Personal Projects");
for (const p of projects) {
  need(26);
  y -= 4;
  line(p.url ? `${p.name} — ${p.url}` : p.name, 10.5, bold);
  line(p.summary, 9.5, regular);
  line(`Stack: ${p.stack.join(", ")}`, 9, regular, MUT);
}

// ---- education ----
heading("Education");
line(education.degree, 10.5, bold);
line(`${education.college} — ${education.place} · ${education.years}`, 9.5, regular, MUT);

const out = new URL("../public/resume.pdf", import.meta.url);
writeFileSync(out, await doc.save());
console.log(`wrote ${out.pathname}`);
