import { useState, type FormEvent } from "react";
import QRCode from "qrcode";

// Short-link + QR demo, fully client-side. Preview only — no link is actually created.
const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // no confusable chars (0/o, 1/l)

export default function CorbzyDemo() {
  const [url, setUrl] = useState("https://corbzy.com");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ link: string; qr: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function shorten(e: FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!/^https?:\/\/[^\s]+\.[^\s]+/.test(url.trim())) {
      setError("invalid input — needs http(s):// and a domain");
      return;
    }
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    const code = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
    const link = `https://corbzy.com/${code}`;
    try {
      const qr = await QRCode.toDataURL(link, {
        width: 200,
        margin: 1,
        color: { dark: "#0e1013", light: "#e8e4da" },
      });
      setResult({ link, qr });
    } catch {
      setError("QR generation failed");
    }
  }

  async function copy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <form onSubmit={shorten} className="flex flex-wrap gap-2">
        <label htmlFor="corbzy-url" className="sr-only">
          URL to shorten
        </label>
        <input
          id="corbzy-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          spellCheck={false}
          className="min-w-0 flex-1 border border-bone/20 bg-transparent px-3 py-2 font-mono text-xs text-bone outline-none placeholder:text-bone/55 focus:border-amber"
          placeholder="https://your-link.example/page"
        />
        <button
          type="submit"
          className="border border-amber px-3 py-2 font-mono text-xs text-amber transition-colors hover:bg-amber hover:text-graphite"
        >
          POST /shorten
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-2 font-mono text-[11px] text-amber">
          400 {error}
        </p>
      )}

      {result && (
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <div className="font-mono text-xs">
            <p className="text-bone/55">res →</p>
            <button
              type="button"
              onClick={copy}
              className="mt-1 text-teal underline decoration-bone/20 underline-offset-4 hover:decoration-teal"
              title="copy to clipboard"
            >
              {result.link}
            </button>
            <p className="mt-1 text-[11px] text-bone/55">{copied ? "copied" : "click to copy"}</p>
          </div>
          <img
            src={result.qr}
            width={132}
            height={132}
            alt={`QR code for ${result.link}`}
            className="border border-bone/15"
          />
        </div>
      )}
    </div>
  );
}
