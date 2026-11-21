import assert from "node:assert/strict";
import test from "node:test";
import { formatReport, safeSourceUrl } from "../src/utils/report.ts";

function result(provider, output, report = "Fallback report") {
  return { provider, output, report, model: null, response_id: null, usage: null };
}

const citation = { url: "https://example.com/news", title: "Company announcement" };

test("Claude text stays continuous across cited blocks with deduplicated source numbers", () => {
  const formatted = formatReport(result("anthropic", [
    { type: "text", text: "- News: " },
    { type: "text", text: "earnings announcement", citations: [citation] },
    { type: "text", text: ". More evidence", citations: [citation] },
    { type: "text", text: ".\n\n## Limitations\nUncertain cause." },
  ]));
  assert.match(formatted.markdown, /- News: earnings announcement \[1\]/);
  assert.match(formatted.markdown, /\. More evidence \[1\]/);
  assert.equal(formatted.sources.length, 1);
});

test("OpenAI citation replacements preserve later offsets and reading-order numbering", () => {
  const formatted = formatReport(result("openai", [{ type: "message", content: [{
    type: "output_text", text: "First [a], second [b].",
    annotations: [
      { ...citation, type: "url_citation", start_index: 6, end_index: 9 },
      { url: "https://example.com/second", type: "url_citation", start_index: 18, end_index: 21 },
    ],
  }] }]));
  assert.match(formatted.markdown, /First  \[1\].*, second  \[2\].*\./);
  assert.equal(formatted.sources.length, 2);
});

test("unusable citations do not create unsafe links or remove report text", () => {
  const formatted = formatReport(result("anthropic", [
    { type: "text", text: "Evidence", citations: [{ url: "javascript:alert(1)" }, null] },
  ]));
  assert.equal(formatted.markdown, "Evidence");
  assert.deepEqual(formatted.sources, []);
  for (const url of ["javascript:alert(1)", "data:text/html,test", "/relative", null]) {
    assert.equal(safeSourceUrl(url), null);
  }
});

test("validation-only and older reports use saved text when there are no native text blocks", () => {
  assert.equal(formatReport(result("none", [])).markdown, "Fallback report");
  assert.equal(formatReport(result("anthropic", [null, { type: "web_search_tool_result" }])).markdown, "Fallback report");
});
