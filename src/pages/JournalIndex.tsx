import { Link } from "react-router-dom";
import { BREWS, brewChapters } from "../journal/brews";
import JournalFrame from "../journal/JournalFrame";

const chapters = brewChapters(BREWS);

export default function JournalIndex() {
  return (
    <JournalFrame id="index" title="Brew Journal" className="journal-index">
      <div className="j-wrap">
        <p className="j-kicker">Personal batches</p>
        <h1 className="j-title">Brew Journal</h1>
        <p className="j-dek">Batch log. Recipe as run, and what to change.</p>
        <nav className="j-links" aria-label="Related sites">
          <Link to="/">Current brew-off</Link>
          <a href="/history/">Party archive</a>
        </nav>
        <p className="j-note">
          Personal batches. Separate from the party archive. Figures are
          actuals.
        </p>

        {chapters.length > 0 && (
          <ul className="j-styles">
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <a href={`#${chapter.id}`}>
                  {chapter.family}
                  <span aria-hidden> · {chapter.brews.length}</span>
                </a>
              </li>
            ))}
          </ul>
        )}

        {chapters.map((chapter) => (
          <section key={chapter.id} id={chapter.id} className="j-chapter">
            <div className="j-chapter-head">
              <h2 className="j-style">{chapter.family}</h2>
              <p className="j-count">
                {chapter.brews.length}{" "}
                {chapter.brews.length === 1 ? "batch" : "batches"}
              </p>
            </div>
            {chapter.note && <p className="j-style-note">{chapter.note}</p>}
            <div className="space-y-5">
              {chapter.brews.map((brew) => (
                <Link
                  key={brew.slug}
                  to={`/journal/${brew.slug}`}
                  className="j-card"
                  style={{
                    ["--j-bg" as string]: brew.theme.bg,
                    ["--j-ink" as string]: brew.theme.ink,
                    ["--j-accent" as string]: brew.theme.accent,
                  }}
                >
                  <img src={brew.label} alt="" />
                  <div className="j-card-body">
                    <p className="j-card-style">{brew.style}</p>
                    <h3>{brew.name}</h3>
                    <p className="j-card-meta">
                      {brew.place} · {brew.brewed}
                    </p>
                    <p>{brew.summary}</p>
                    <div className="j-stats">
                      <p>
                        <span>Label</span>
                        <strong>{brew.abvLabel}</strong>
                      </p>
                      <p>
                        <span>In the glass</span>
                        <strong>{brew.abvActual}</strong>
                      </p>
                      <p>
                        <span>Gravity</span>
                        <strong>
                          {brew.og} → {brew.fg}
                        </strong>
                      </p>
                    </div>
                    <p className="j-next">
                      <span>For next time</span>
                      {brew.nextTime}
                    </p>
                    <p className="j-open">Open the batch</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </JournalFrame>
  );
}
