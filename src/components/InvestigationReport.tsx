import Markdown from "react-markdown";
import type { InvestigationResult } from "../types/market";
import { formatReport, safeSourceUrl } from "../utils/report";

export function InvestigationReport({ result }: { result: InvestigationResult }) {
  const { markdown, sources } = formatReport(result);
  return (
    <div className="investigation-report">
      <Markdown
        skipHtml
        urlTransform={(url) => safeSourceUrl(url) ?? ""}
        components={{
          h1: ({ children }) => <h3>{children}</h3>,
          h2: ({ children }) => <h3>{children}</h3>,
          h3: ({ children }) => <h4>{children}</h4>,
          a: ({ href, children }) => href
            ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
            : <span>{children}</span>,
          img: () => null,
        }}
      >
        {markdown}
      </Markdown>
      {sources.length > 0 && (
        <section className="investigation-sources" aria-label="Report sources">
          <h3>Sources</h3>
          <ol>
            {sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
