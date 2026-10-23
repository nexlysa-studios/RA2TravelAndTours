import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Compass,
  MapPin,
  Plane,
  Plus,
} from "lucide-react";
import { FAQS, PACKAGES, whatsappLink } from "@/data/site";
import hero from "@/assets/herobg.png";
import peninsula from "@/assets/tour-peninsula.jpg";
import wine from "@/assets/tour-wine.jpg";
import safari from "@/assets/tour-safari.jpg";
import city from "@/assets/tour-table.jpg";
import garden from "@/assets/tour-westcoast.jpg";
import adventure from "@/assets/Heli-pilot.jpg";
import penguins from "@/assets/Pengi.webp";
import bokaap from "@/assets/Bokaap.webp";

const images: Record<string, string> = { peninsula, wine, safari, city, garden, adventure };
const groups = ["All journeys", "Coast & city", "Wine & wildlife", "Adventure & beyond"];
const collection = [
  "cape-peninsula-tour",
  "cape-winelands",
  "aquila-safari",
  "cape-town-city-tour",
  "garden-route",
  "adventure-experiences",
].map((slug) => PACKAGES.find((item) => item.slug === slug)!);
const groupByImage: Record<string, string> = {
  peninsula: groups[1],
  city: groups[1],
  wine: groups[2],
  safari: groups[2],
  garden: groups[3],
  adventure: groups[3],
};

export function HomeHero() {
  return (
    <section id="top" className="travel-hero travel-container">
      <div className="travel-hero-copy">
        <p className="travel-eyebrow">
          <span className="travel-dot" />
          Cape Town is just the beginning
        </p>
        <h1>
          Take the
          <br />
          <span>scenic</span> route.
        </h1>
        <p className="travel-hero-description">
          Private journeys. Local perspectives. A little more South Africa, at your own pace.
        </p>
        <div className="travel-hero-actions">
          <a href="#tours" className="travel-button">
            Find your journey <ArrowUpRight size={18} />
          </a>
          <a href="#book" className="travel-text-link">
            Make it personal <ArrowRight size={17} />
          </a>
        </div>
        <div className="travel-hero-note">
          <Compass size={32} strokeWidth={1} />
          <p>
            Planned around you.
            <br />
            <span>Guided by people who call it home.</span>
          </p>
        </div>
      </div>
      <div className="travel-hero-photo">
        <img
          src={hero}
          alt="A winding coastal road beneath Cape Town's mountains at sunset"
          fetchPriority="high"
          width={1672}
          height={941}
        />
        <div className="travel-photo-label">
          <MapPin size={15} />
          <span>The Atlantic coast, Cape Town</span>
        </div>
        <a href="#tours" className="travel-photo-index" aria-label="Discover our private journeys">
          <span>
            A different
            <br />
            way to go.
          </span>
          <ArrowDown size={20} />
        </a>
      </div>
      <div className="travel-hero-bottom">
        <p>
          PRIVATE TOURS <span> / </span> SAFARIS <span> / </span> AIRPORT TRANSFERS
        </p>
        <a href="#tours">
          A world worth exploring <ArrowDown size={14} />
        </a>
      </div>
    </section>
  );
}

export function JourneyCollection() {
  const [active, setActive] = useState(groups[0]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const visible = collection.filter(
    (item) => active === groups[0] || groupByImage[item.image] === active,
  );
  return (
    <section id="tours" className="travel-section travel-collection">
      <div className="travel-container">
        <div className="travel-section-heading">
          <div>
            <p className="travel-eyebrow">01 / The journeys</p>
            <h2>
              Where will your
              <br />
              curiosity take you?
            </h2>
          </div>
          <p>
            Ocean roads or open skies. A glass in the Winelands or a day in the wild. Start with a
            place that speaks to you.
          </p>
        </div>
        <div className="travel-filters" role="group" aria-label="Filter journeys">
          {groups.map((group) => (
            <button
              key={group}
              type="button"
              disabled={!hydrated}
              aria-pressed={active === group}
              onClick={() => setActive(group)}
            >
              {group}
              <span>{group === groups[0] ? "06" : "02"}</span>
            </button>
          ))}
        </div>
        <div className="travel-journey-grid" aria-live="polite" aria-atomic="false">
          {visible.map((item) => (
            <article key={item.slug} className="travel-journey">
              <a
                href={item.detailPath || `/?service=${item.slug}#book`}
                className="travel-journey-image"
                aria-label={`Explore ${item.title}`}
              >
                <img
                  src={images[item.image]}
                  alt={item.title}
                  loading="lazy"
                  width={900}
                  height={680}
                />
                <span className="travel-image-arrow">
                  <ArrowUpRight size={23} />
                </span>
                <span className="travel-journey-category">{groupByImage[item.image]}</span>
              </a>
              <div className="travel-journey-caption">
                <p>{item.duration}</p>
                <h3>
                  <a href={item.detailPath || `/?service=${item.slug}#book`}>{item.title}</a>
                </h3>
                <p>{item.note}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="travel-collection-bottom">
          <p>
            Something a little more <em>you</em>? Every itinerary can be personalised.
          </p>
          <a href="/?service=custom-private-tour#book" className="travel-text-link">
            Let's create your own <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
    </section>
  );
}

export function HomeStory() {
  return (
    <section id="about" className="travel-story travel-section">
      <div className="travel-container travel-story-grid">
        <div className="travel-story-photos">
          <figure className="travel-story-main">
            <img
              src={bokaap}
              alt="A colourful day exploring the streets of Bo-Kaap"
              loading="lazy"
              width={1200}
              height={902}
            />
            <figcaption>Colourful corners. A slower kind of exploring.</figcaption>
          </figure>
          <img
            className="travel-story-inset"
            src={penguins}
            alt="African penguins at Boulders Beach"
            loading="lazy"
            width={640}
            height={800}
          />
        </div>
        <div className="travel-story-copy">
          <p className="travel-eyebrow">02 / Local roots. Personal journeys.</p>
          <h2>
            A local team.
            <br />
            Your kind of Cape.
          </h2>
          <p>
            We're RA2 Travel & Tours. Cape Town is our home, and sharing it is what we do best. We
            bring the local knowledge; you bring the things you love.
          </p>
          <p>
            No two travellers see a place the same way. That's why we plan private tours, family
            days out and South African adventures around your interests, your people and your pace.
          </p>
          <div className="travel-story-promise">
            <span>
              <Check size={16} />
              Your own private journey
            </span>
            <span>
              <Check size={16} />
              Room to change the plan
            </span>
            <span>
              <Check size={16} />
              One team, from hello to home
            </span>
          </div>
          <a href="#book" className="travel-text-link">
            Get to know your next adventure <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
    </section>
  );
}

export function HomeTransfers() {
  return (
    <section id="transfers" className="travel-transfers travel-section">
      <div className="travel-container travel-transfer-grid">
        <div>
          <p className="travel-eyebrow">03 / From the moment you land</p>
          <h2>
            A warm welcome.
            <br />A smooth arrival.
          </h2>
          <p>
            Airport to hotel. City to coast. Business meeting to a well-earned break. Let our local
            team take care of getting you there.
          </p>
          <a className="travel-button" href="/?service=airport-transfer#book">
            Arrange my transfer <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="travel-transfer-ticket">
          <div className="travel-ticket-top">
            <span>YOUR ARRIVAL, TAKEN CARE OF</span>
            <Plane size={22} />
          </div>
          <div className="travel-ticket-route">
            <div>
              <strong>CPT</strong>
              <span>Cape Town International</span>
            </div>
            <div className="travel-route-line">
              <Plane size={20} />
            </div>
            <div>
              <strong>YOU</strong>
              <span>Wherever you're headed</span>
            </div>
          </div>
          <div className="travel-ticket-bottom">
            <span>Private meet & greet</span>
            <span>Individuals · Families · Groups</span>
          </div>
          <a href="/?service=chauffeur-service#book">
            Need an executive or chauffeur service? <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}

export function HomePlanning() {
  return (
    <section id="services" className="travel-planning travel-section">
      <div className="travel-container">
        <div className="travel-section-heading">
          <div>
            <p className="travel-eyebrow">04 / A journey that feels like yours</p>
            <h2>
              A little inspiration.
              <br />
              We'll take it from there.
            </h2>
          </div>
          <a href="#book" className="travel-text-link">
            Start the conversation <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="travel-planning-steps">
          {[
            [
              "01",
              "Tell us your kind of trip.",
              "A place you've always wanted to see, a date in the diary or simply a feeling. Start wherever you are.",
            ],
            [
              "02",
              "We'll connect the dots.",
              "Our local team shapes the route, transport and experiences into a personalised quote for you.",
            ],
            [
              "03",
              "Make room for the memories.",
              "Once the details are agreed, you can look forward to the journey. We'll take care of the arrangements.",
            ],
          ].map(([number, title, copy]) => (
            <div key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeQuestions() {
  return (
    <section className="travel-questions travel-section">
      <div className="travel-container travel-question-grid">
        <div>
          <p className="travel-eyebrow">A few things before you go</p>
          <h2>
            Good questions.
            <br />
            Straight answers.
          </h2>
          <p>Still curious about something?</p>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="travel-text-link"
          >
            Ask our local team <ArrowUpRight size={17} />
          </a>
        </div>
        <div>
          {FAQS.map((faq, index) => (
            <details key={faq.q}>
              <summary>
                <span className="travel-question-number">0{index + 1}</span>
                <h3>{faq.q}</h3>
                <Plus size={18} />
              </summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
