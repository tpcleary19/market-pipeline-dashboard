import type { InvestigationResult } from "../types/market";

export interface ReportSource {
  url: string;
  title: string;
}

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" ? value as Record<string, unknown> : null;
}

export function safeSourceUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

export function formatReport(result: InvestigationResult): { markdown: string; sources: ReportSource[] } {
  const sources: ReportSource[] = [];
  function reference(value: unknown): string {
    const citation = object(value);
    const url = safeSourceUrl(citation?.url);
    if (!url) return "";
    let index = sources.findIndex((source) => source.url === url);
    if (index === -1) {
      index = sources.length;
      sources.push({ url, title: typeof citation?.title === "string" ? citation.title : url });
    }
    return ` [${index + 1}](<${url}>)`;
  }

  const text: string[] = [];
  for (const value of result.output) {
    const block = object(value);
    if (!block) continue;
    if (result.provider === "anthropic" && block.type === "text" && typeof block.text === "string") {
      const citations = Array.isArray(block.citations) ? block.citations : [];
      text.push(block.text + citations.map(reference).join(""));
    }
    if (result.provider === "openai" && block.type === "message" && Array.isArray(block.content)) {
      for (const value of block.content) {
        const part = object(value);
        if (part?.type !== "output_text" || typeof part.text !== "string") continue;
        let content = part.text;
        const annotations = (Array.isArray(part.annotations) ? part.annotations : [])
          .map(object)
          .filter((item): item is Record<string, unknown> => item !== null && item.type === "url_citation")
          .filter((item) => Number.isInteger(item.start_index) && Number.isInteger(item.end_index)
            && Number(item.start_index) >= 0 && Number(item.end_index) >= Number(item.start_index)
            && Number(item.end_index) <= content.length)
          .sort((a, b) => Number(a.start_index) - Number(b.start_index));
        // Number citations in reading order, then edit backwards to preserve offsets.
        const edits = annotations.map((item) => ({
          start: Number(item.start_index), end: Number(item.end_index), link: reference(item),
        }));
        for (const item of edits.reverse()) {
          if (item.link) content = content.slice(0, item.start) + item.link + content.slice(item.end);
        }
        text.push(content);
      }
    }
  }
  return { markdown: text.join("").trim() || result.report, sources };
}
