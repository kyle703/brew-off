import type { ComponentType } from "react";
import { Link, useParams } from "react-router-dom";
import type { BrewSlug } from "../journal/brews";
import JournalFrame from "../journal/JournalFrame";
import HokieSmash from "./journal/HokieSmash";

const PAGES: Record<BrewSlug, ComponentType> = {
  "hokie-smash": HokieSmash,
};

export default function JournalEntry() {
  const { slug = "" } = useParams();
  const Page = PAGES[slug as BrewSlug];
  if (!Page) {
    return (
      <JournalFrame id="index" title="Brew Journal" className="journal-index">
        <div className="j-wrap">
          <p className="j-kicker">Personal batches</p>
          <h1 className="j-title">No batch under that name</h1>
          <p className="j-dek">
            {slug ? `“${slug}” is not in the log.` : "That batch is not in the log."}
          </p>
          <p className="j-links">
            <Link to="/journal">Back to the journal</Link>
          </p>
        </div>
      </JournalFrame>
    );
  }
  return <Page />;
}
