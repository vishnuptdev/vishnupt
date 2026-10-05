import { useState, type FormEvent } from "react";
import { contact, person } from "../content";

// Contact as an API call: the form is styled as a POST, transport is mailto (static site — no server).
const HAS_RECIPIENT = !contact.email.startsWith("[TODO");

const initial = { name: "", email: "", message: "" };

export default function ContactForm({ compact = false }: { compact?: boolean }) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      setStatus("422 name and message are required");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setStatus("422 email is not valid");
      return;
    }
    if (!HAS_RECIPIENT) {
      setStatus(`503 no recipient configured — ${contact.email}`);
      return;
    }
    const body = `${form.message}\n\n— ${form.name} <${form.email}>`;
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(
      `portfolio: ${form.name}`,
    )}&body=${encodeURIComponent(body)}`;
    setStatus("200 handed off to your mail client — nothing was stored on a server");
  }

  const set = (k: keyof typeof initial) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const field =
    "mt-1 w-full border border-bone/20 bg-transparent px-3 py-2 font-mono text-xs text-bone outline-none placeholder:text-bone/25 focus:border-amber";

  return (
    <section id={compact ? undefined : "contact"} className={compact ? "" : "scroll-mt-20 py-16"}>
      {!compact && (
        <>
          <h2 className="font-display text-3xl">Contact</h2>
          <p className="mt-2 text-xs text-bone/60">
            {person.name} &middot; {person.role}, {person.company} &middot; {contact.locationLine}
          </p>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <a href={`mailto:${contact.email}`} className="text-teal hover:underline">
              {contact.email}
            </a>
            <a href={contact.github} target="_blank" rel="noreferrer" className="text-teal hover:underline">
              {contact.github.replace("https://", "")}
            </a>
            <a href={contact.linkedin} target="_blank" rel="noreferrer" className="text-teal hover:underline">
              {contact.linkedin.replace("https://", "")}
            </a>
          </p>
        </>
      )}

      <form onSubmit={submit} noValidate className="mt-8 max-w-xl border border-bone/15 p-4 font-mono text-xs">
        <p className="text-teal">POST /contact HTTP/1.1</p>
        <p className="text-bone/55">Content-Type: application/json</p>

        <div className="mt-4 space-y-4 border-l border-bone/15 pl-4">
          <div>
            <label htmlFor="c-name" className="text-bone/55">
              "name":
            </label>
            <input
              id="c-name"
              className={field}
              value={form.name}
              onChange={set("name")}
              placeholder='"your name"'
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="c-email" className="text-bone/55">
              "email":
            </label>
            <input
              id="c-email"
              type="email"
              className={field}
              value={form.email}
              onChange={set("email")}
              placeholder='"you@example.com"'
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="c-message" className="text-bone/55">
              "message":
            </label>
            <textarea
              id="c-message"
              rows={5}
              className={field}
              value={form.message}
              onChange={set("message")}
              placeholder='"what are we building?"'
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-5 border border-amber px-4 py-2 text-amber transition-colors hover:bg-amber hover:text-graphite"
        >
          send &rarr; mailto
        </button>

        {status && (
          <p
            role="status"
            aria-live="polite"
            className={`mt-3 ${status.startsWith("200") ? "text-teal" : "text-amber"}`}
          >
            {status}
          </p>
        )}
      </form>
    </section>
  );
}
