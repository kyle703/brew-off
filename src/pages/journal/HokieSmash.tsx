import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import JournalFrame from "../../journal/JournalFrame";

const NUMBERS: { measure: string; plan: string; beer: string }[] = [
  { measure: "Preboil gravity", plan: "1.061", beer: "1.050" },
  { measure: "Original gravity", plan: "1.071", beer: "1.060" },
  { measure: "Final gravity", plan: "1.015", beer: "1.008" },
  { measure: "Alcohol", plan: "7.3%", beer: "6.8%" },
  { measure: "Attenuation", plan: "~79%", beer: "87%" },
  { measure: "Mash efficiency", plan: "72%", beer: "~51%" },
  { measure: "Bitterness", plan: "~50 IBU", beer: "~50 IBU" },
  { measure: "Into the fermenter", plan: "5.25 gal", beer: "~5 gal" },
  { measure: "Total hops", plan: "10.5 oz", beer: "12 oz" },
];

const GRAIN = [
  ["Briess 2-Row", "11 lb · $1.29/lb", "$14.19"],
  ["Briess White Wheat", "2 lb · $1.49/lb", "$2.98"],
  ["Flaked oats", "1.5 lb · $1.99/lb", "$2.99"],
  ["Rice hulls", "0.5 lb · $2.39/lb", "$1.20"],
];

const HOPS = [
  ["60 min", "0.75 oz Columbus", "Bitterness"],
  ["170°F, 20 min", "3 oz Falconer's Flight", "Whirlpool"],
  ["170°F, 20 min", "1 oz Centennial", "Whirlpool"],
  ["Day 3", "5 oz Falconer's Flight", "Loose"],
  ["Day 3", "1 oz Centennial", "Loose"],
  ["Day 3", "1.25 oz Columbus", "Loose"],
];

const CLOCK = [
  ["0:00", "Heat mash water to 160°F."],
  ["0:20", "Dough in. Hold 152°F. Stir 30 seconds every 15."],
  ["1:25", "Lift basket. Rinse at 170°F, a quart at a time."],
  ["2:10", "Boil. Columbus in."],
  ["3:15", "170°F. Flameout hops loose in the basket. 20 minutes."],
  ["3:35", "Tap water through the coil, to ~85°F."],
  ["3:50", "Ice loop to 66°F."],
  ["4:20", "Splash into the fermenter. Pitch. Hold 68°F."],
];

const DAYS = [
  ["Day 0", "Brew. OG 1.060. Likely Tue Sep 22."],
  ["Day 3", "Dry hop 7.25 oz, loose, in two or three pours."],
  ["Day 8", "Gravity not taken."],
  ["Day 10 · Fri Oct 2", "Crash at 1 psi. Tank empty by 11:30 pm."],
  ["Day 11", "CO2 replaced. Exchange about $30."],
  ["Day 12 · Sun Oct 4", "FG 1.008, hydrometer. Kegged at 12 psi, 38°F."],
  ["Day 19 · Mon Oct 11", "Carbonated."],
];

const NOTES = [
  {
    title: "Mash efficiency ~51%",
    body: "Preboil 1.050 vs 1.061. Coarse crush, channeled rinse, or a bed that was not stirred. Boiled the full hour. Skipped top-up water. No sugar.",
    next: "Finer crush, slower rinse, less grain. Do not plan 72% on this system yet.",
  },
  {
    title: "Preboil volume was a guess",
    body: "Target was 6.1 gal. Foundry marks stop at 5.5. Volume came in short.",
    next: "Dipstick, marked from measured water before brew day.",
  },
  {
    title: "15 lb would not stir",
    body: "Basket was packed. Spoon bent. The no-pump plan assumed a stir every 15 minutes. That stir did not happen.",
    next: "Heavier paddle. Less grain, or split the batch. Reconsider the recirc pump.",
  },
  {
    title: "Slow runoff",
    body: "2 lb wheat and 1.5 lb oats, even with rice hulls.",
    next: "Do not squeeze. Stir the top, reseat the basket, stop at the volume mark.",
  },
  {
    title: "Fermenter leak emptied the CO2 tank",
    body: "Connected at 1 psi. Empty in about two hours. The buzz was the leak. A full gauge only means liquid CO2 is still in the tank.",
    next: "Leak-test empty at 1 psi. Star San on the gasket, elbow, manifold, and racking arm. Keep a second tank.",
  },
  {
    title: "Air in during the crash",
    body: "No CO2 on the fermenter. Cooling pulled air in. About 2 oz of oxygen. Hop aroma fades early, around week 3 or 4.",
    next: "Hold 1 psi of CO2 for the whole crash.",
  },
  {
    title: "Dry hop sat 9 days",
    body: "Useful contact is about 5 days. After that it goes vegetal.",
    next: "Set the crash from the dry-hop date.",
  },
];

const CUTS = [
  ["El Dorado", "Not bought. Falconer's Flight already covers it."],
  ["Murphy & Rude", "Skipped. Too expensive for a first all-grain."],
  ["Orange zest", "Skipped. Redundant with Falconer's Flight."],
  ["Hibiscus, elderberry", "Skipped. Wrong flavor in this IPA."],
];

const KEEP = [
  "Loose dry hop, no bags. Racking arm stays above the trub.",
  "Flameout hops loose in the grain basket. Outlet valve stayed clear.",
  "Two-stage chill: tap to ~85°F, then ice loop to 66°F.",
  "One 11 g packet of Verdant, sprinkled dry. 87% attenuation.",
  "Cold crash in the fermenter, then closed transfer at 1 psi.",
  "Hydrometer for FG. A refractometer is wrong once there is alcohol.",
  "Sanitize what the boil did not touch. Star San does not clean soil.",
  "Splash into the fermenter. Keep air out after pitching.",
  "Nothing through the lid gasket.",
  "Stay at 1 psi. Above 2.5 psi can damage the lid clamps.",
  "Set the regulator where the tank sits.",
];

const GEAR = [
  "Inline mesh filter and tubing sized to fit it.",
  "Heavier mash paddle.",
  "Volume dipstick.",
  "Second CO2 tank.",
];

function Section({
  id,
  num,
  title,
  children,
}: {
  id: string;
  num: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="hs-section">
      <p className="hs-kicker">{num}</p>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function HokieSmash() {
  return (
    <JournalFrame
      id="hokie-smash"
      title="Hokie Smash · Brew Journal"
      className="journal-hokie"
    >
      <header className="hs-nav">
        <div className="hs-nav-top">
          <Link to="/journal">← Journal</Link>
          <Link to="/">Brew-Off</Link>
        </div>
        <nav className="hs-nav-links" aria-label="On this batch">
          <a href="#numbers">Numbers</a>
          <a href="#recipe">Recipe</a>
          <a href="#timeline">Timeline</a>
          <a href="#notes">Notes</a>
        </nav>
      </header>

      <article>
        <header className="hs-hero">
          <img
            className="hs-label"
            src="/journal/hokie-smash/label.jpg"
            width={682}
            height={1024}
            alt="Hokie Smash label"
          />
          <div>
            <p className="hs-kicker">India Pale Ale · Richmond · Sep 2026</p>
            <h1 className="hs-title hs-display">Hokie Smash</h1>
            <p className="hs-lede">
              First all-grain. Anvil Foundry 6.5, about 5 gal. Kegged Oct 4.
              Carbonated Oct 11. No tasting notes yet.
            </p>
            <dl className="hs-stats">
              <div>
                <dt>Actual</dt>
                <dd>6.8%</dd>
              </div>
              <div>
                <dt>Label</dt>
                <dd>6.9%</dd>
              </div>
              <div>
                <dt>OG</dt>
                <dd>1.060</dd>
              </div>
              <div>
                <dt>FG</dt>
                <dd>1.008</dd>
              </div>
              <div>
                <dt>IBU</dt>
                <dd>~50</dd>
              </div>
              <div>
                <dt>Efficiency</dt>
                <dd>~51%</dd>
              </div>
            </dl>
          </div>
        </header>

        <Section id="numbers" num="01" title="Numbers">
          <p className="hs-prose" style={{ marginTop: "1rem" }}>
            FG is a hydrometer reading. Use the beer column, not the plan.
          </p>
          <table className="hs-compare">
            <caption className="sr-only">Planned versus actual</caption>
            <thead>
              <tr>
                <th scope="col">Measurement</th>
                <th scope="col">Plan</th>
                <th scope="col">Beer</th>
              </tr>
            </thead>
            <tbody>
              {NUMBERS.map((row) => (
                <tr key={row.measure}>
                  <th scope="row">{row.measure}</th>
                  <td>{row.plan}</td>
                  <td>{row.beer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section id="recipe" num="02" title="As brewed">
          <div className="hs-sheet" style={{ marginTop: "1.25rem" }}>
            <p className="hs-kicker">~5 gal · Foundry 6.5 · mill gap 0.035 in</p>
            <h3>Efficiency was ~51%. Do not plan 72% yet.</h3>
            <p>
              Grain uncrushed from Original Gravity, milled at home. Do not
              mill oats or rice hulls. Hulls are for drainage. Grain about $21.
            </p>

            <p className="hs-subhead">Grain, 15 lb</p>
            {GRAIN.map(([name, detail, cost]) => (
              <div className="hs-line" key={name}>
                <div>
                  <strong>{name}</strong>
                  <small>{detail}</small>
                </div>
                <div>{cost}</div>
              </div>
            ))}

            <p className="hs-subhead">Hops, 12 oz</p>
            <p>
              Falconer’s Flight 8 oz, Centennial 2 oz, Columbus 2 oz. Bitterness
              is the 60-minute Columbus only. Do not sanitize pellets.
            </p>
            {HOPS.map(([when, what, note]) => (
              <div className="hs-line" key={`${when}-${what}`}>
                <div>
                  <strong>{what}</strong>
                  <small>
                    {when} · {note}
                  </small>
                </div>
              </div>
            ))}

            <p className="hs-subhead">Yeast</p>
            <p>
              One 11 g packet, Lallemand Verdant IPA. Sprinkled dry. No
              starter. Pitched at 66°F, held at 68°F. The two-packet plan was
              unnecessary.
            </p>

            <p className="hs-subhead">Water, distilled</p>
            <p>
              Calcium chloride for body, gypsum for bitterness. This bill leans
              round. Lactic acid is optional: mash lands near pH 5.6 and the
              acid brings it to 5.4.
            </p>
            <div className="hs-grid-2">
              <div>
                <p className="hs-subhead">Mash · 4 gal + 2 cups</p>
                <ul>
                  <li>Calcium chloride 5 g</li>
                  <li>Gypsum 2.5 g</li>
                  <li>Epsom salt 1 g</li>
                  <li>Lactic acid 88%, 2 mL</li>
                </ul>
              </div>
              <div>
                <p className="hs-subhead">Rinse · 3 gal</p>
                <ul>
                  <li>Calcium chloride 3 g</li>
                  <li>Gypsum 1.5 g</li>
                  <li>Epsom salt 1 g</li>
                  <li>Lactic acid 88%, 1 mL</li>
                </ul>
              </div>
            </div>

            <p className="hs-subhead">Brew day, about 4.5 hours</p>
            <ol className="hs-clock">
              {CLOCK.map(([time, step]) => (
                <li key={time}>
                  <b>{time}</b>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <p className="hs-subhead">Cut</p>
            <ul className="hs-cuts">
              {CUTS.map(([name, why]) => (
                <li key={name}>
                  <strong>{name}.</strong> {why}
                </li>
              ))}
            </ul>

            <p className="hs-subhead">Keg</p>
            <ol>
              <li>Fill with Star San. Push it out with CO2 at 5 psi through the liquid post. Vent to zero.</li>
              <li>Transfer at 1 psi. Racking arm above the trub, beer in through the liquid post, relief open.</li>
              <li>Arm down only at the end. Stop when it pulls sludge.</li>
              <li>12 psi at 38°F for 7 to 10 days.</li>
            </ol>
            <p>
              Transfer tubing was too narrow. Go up one size, and buy it with
              the inline filter.
            </p>
            <p className="hs-muted">
              Original Gravity, 6118 Lakeside Ave. Call ahead for grain and
              salts.
            </p>
          </div>
        </Section>

        <Section id="timeline" num="03" title="Timeline">
          <p className="hs-prose" style={{ marginTop: "1rem" }}>
            Day 0 is unconfirmed. Day 10 was Friday, October 2.
          </p>
          <ol className="hs-days">
            {DAYS.map(([day, body]) => (
              <li key={day}>
                <div className="hs-day-label">{day}</div>
                <p>{body}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="notes" num="04" title="Notes">
          <ol className="hs-trouble">
            {NOTES.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <p className="hs-fix">
                  <span>Next</span>
                  {item.next}
                </p>
              </li>
            ))}
          </ol>
          <div className="hs-grid-2">
            <div className="hs-sheet">
              <p className="hs-kicker">Keep</p>
              <ul className="hs-keep">
                {KEEP.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="hs-sheet">
              <p className="hs-kicker">Buy</p>
              <ul>
                {GEAR.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="hs-subhead">Still open</p>
              <ul className="hs-open">
                <li>Brew date. Likely Tue Sep 22.</li>
                <li>Tasting notes.</li>
                <li>Serving line. Check for 3/16 in ID, 8 to 10 ft.</li>
                <li>Leak point: gasket, elbow, manifold, or racking arm.</li>
                <li>Transfer tubing size, and the size for the inline filter.</li>
              </ul>
            </div>
          </div>
        </Section>
      </article>

      <footer className="hs-foot">
        <p>
          Personal batch log. Party archive:{" "}
          <a href="/history/">Brew-Off History</a>.
        </p>
      </footer>
    </JournalFrame>
  );
}
