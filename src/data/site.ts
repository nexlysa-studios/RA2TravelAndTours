import { Compass, Plane, Sparkles, Mountain, Grape, MapPin, Binoculars } from "lucide-react";

export const SITE = {
  name: "RA2 Travel & Tours",
  url: "https://ra2travelandtours.co.za",
  phone: "+27 78 815 8817",
  phoneRaw: "+27788158817",
  whatsapp: "27788158817",
  email: "rezah@ra2travelandtours.co.za",
  address: "10 Kestel Street, Plumstead, Cape Town, South Africa",
  tagline: "Your journey. Your South Africa.",
  description:
    "Book private Cape Town tours, Cape Peninsula day trips, Aquila safaris and airport transfers with RA2 Travel & Tours. Tailor-made travel across South Africa.",
  whatsappMsg: "Hi RA2 Travel & Tours, I'd love some help planning my South African journey.",
  facebook: "https://www.facebook.com/119209587943809",
  instagram: "https://www.instagram.com/ra2travelandtours1/",
};

export const whatsappLink = (msg = SITE.whatsappMsg) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#tours", label: "Tours" },
  { href: "/packages", label: "Experiences" },
  { href: "/#transfers", label: "Airport Transfers" },
  { href: "/#about", label: "About Us" },
  { href: "/gallery", label: "Gallery" },
  { href: "/#book", label: "Contact" },
];

export const SERVICES = [
  {
    icon: Compass,
    title: "Private Cape Town Tours",
    desc: "Your own guide, your own pace. Explore Cape Town with an itinerary built around you.",
  },
  {
    icon: Mountain,
    title: "Cape Peninsula Tours",
    desc: "Cape Point, Boulders Beach and Chapman's Peak, connected by extraordinary coastal scenery.",
  },
  {
    icon: MapPin,
    title: "Cape Town City Tours",
    desc: "From Table Mountain to Bo-Kaap and the V&A Waterfront, meet the many sides of the Mother City.",
  },
  {
    icon: Binoculars,
    title: "Safari Experiences",
    desc: "Trade the city for the bush with a Big 5 safari at Aquila Game Reserve and private transport.",
  },
  {
    icon: Plane,
    title: "Airport Transfers",
    desc: "A welcoming meet and greet, comfortable private transport and a professional driver.",
  },
  {
    icon: Sparkles,
    title: "Adventure Experiences",
    desc: "Quad biking, tandem skydiving, paragliding and scenic helicopter rides. Find your next thrill.",
  },
  {
    icon: Grape,
    title: "Cape Winelands",
    desc: "Unhurried days among Stellenbosch and Franschhoek's vineyards, mountain views and local flavours.",
  },
  {
    icon: Compass,
    title: "Luxury & Custom Tours",
    desc: "A completely personal journey through South Africa, shaped around your interests, schedule and budget.",
  },
];

export type PackageItem = {
  title: string;
  slug: string;
  category: "Private Tours" | "Safari & Adventure" | "Airport & Chauffeur";
  note: string;
  location: string;
  duration: string;
  image: "safari" | "peninsula" | "city" | "wine" | "garden" | "adventure" | "transfer" | "custom";
  featured?: boolean;
  detailPath?: string;
  priceZar?: number;
};

export const PACKAGES: PackageItem[] = [
  {
    title: "Aquila Game Reserve Safari",
    slug: "aquila-safari",
    category: "Safari & Adventure",
    note: "A day in the African bush. Discover the Big 5 with a reserve guide and private transport from Cape Town.",
    location: "Touws River, Western Cape",
    duration: "Full day · approx. 10 hours",
    image: "safari",
    featured: true,
  },
  {
    title: "Cape Peninsula Full Day Tour",
    slug: "cape-peninsula-tour",
    category: "Private Tours",
    note: "Dramatic coastlines, Cape Point and the penguins of Boulders Beach. A Cape Town essential, at your pace.",
    location: "Cape Peninsula",
    duration: "Full day · approx. 8 hours",
    image: "peninsula",
    featured: true,
    detailPath: "/cape-peninsula-tour",
  },
  {
    title: "Cape Town City Tour",
    slug: "cape-town-city-tour",
    category: "Private Tours",
    note: "Table Mountain, colourful Bo-Kaap and the V&A Waterfront, brought to life by a local guide.",
    location: "Cape Town",
    duration: "Half or full day",
    image: "city",
    featured: true,
    detailPath: "/cape-town-city-tour",
  },
  {
    title: "Cape Winelands",
    slug: "cape-winelands",
    category: "Private Tours",
    note: "Explore Stellenbosch and Franschhoek with beautiful estates, leisurely tastings and mountain views.",
    location: "Stellenbosch & Franschhoek",
    duration: "Full day · approx. 8 hours",
    image: "wine",
    featured: true,
    detailPath: "/stellenbosch-wine-tour",
  },
  {
    title: "Garden Route",
    slug: "garden-route",
    category: "Private Tours",
    note: "Coastal towns, forests and wide-open scenery on a tailor-made journey along South Africa's Garden Route.",
    location: "Western & Eastern Cape",
    duration: "Multi-day · tailored to you",
    image: "garden",
    featured: true,
  },
  {
    title: "Adventure Experiences",
    slug: "adventure-experiences",
    category: "Safari & Adventure",
    note: "Quad bike the Atlantis Dunes, soar above Cape Town or take a tandem skydive. We'll help plan the details.",
    location: "Cape Town & surrounds",
    duration: "Activity dependent",
    image: "adventure",
    featured: true,
  },
  {
    title: "Private Airport Transfers",
    slug: "airport-transfer",
    category: "Airport & Chauffeur",
    note: "A smooth arrival starts with a warm welcome. Private meet-and-greet transfers for individuals, families and groups.",
    location: "Cape Town International Airport",
    duration: "Route dependent",
    image: "transfer",
    featured: true,
  },
  {
    title: "Custom Private Tours",
    slug: "custom-private-tour",
    category: "Private Tours",
    note: "Your interests, your schedule, your South Africa. Let our local team create a journey that's entirely yours.",
    location: "Cape Town & South Africa",
    duration: "Tailor-made",
    image: "custom",
    featured: true,
  },
  {
    title: "Executive & Chauffeur Services",
    slug: "chauffeur-service",
    category: "Airport & Chauffeur",
    note: "Professional private transport for business travellers, VIP arrivals, special occasions and flexible day itineraries.",
    location: "Cape Town & Western Cape",
    duration: "By arrangement",
    image: "transfer",
  },
];

export const FEATURED_PACKAGES = PACKAGES.filter((item) => item.featured);

export type DetailedTour = {
  title: string;
  label: string;
  slug: string;
  priceZar?: number;
  priceNote?: string;
  intro: string;
  description: string;
  heroImage: string;
  highlights: { title: string; desc: string }[];
  idealFor: string[];
  included: string[];
  notIncluded?: string[];
  addOns?: string[];
  info?: string[];
  accessibility?: string[];
  additionalInfo?: string[];
  cancellationPolicy?: string[];
  closing: string;
};

const planningNotes = [
  "Your final itinerary, inclusions and availability are confirmed with your personalised quote.",
  "Entrance tickets, activities and meals are quoted separately unless specified.",
];

export const DETAILED_TOURS: Record<string, DetailedTour> = {
  peninsula: {
    title: "Cape Peninsula Full Day Tour",
    label: "Coastlines & unforgettable encounters",
    slug: "cape-peninsula-tour",
    heroImage: "peninsula",
    intro:
      "Follow the coast to Cape Point, meet the Boulders Beach penguins and discover the Cape Peninsula with your own private guide.",
    description:
      "The Cape Peninsula is a journey of changing landscapes: Atlantic beaches, mountains above the sea, fishing harbours and wild headlands. RA2 Travel & Tours brings these places together on a private day designed around your group.\n\nTravel through Camps Bay and Hout Bay before taking in the views along Chapman's Peak Drive, subject to road conditions. Continue to Cape Point and the Cape of Good Hope for dramatic scenery and time to explore.\n\nVisit the African penguins at Boulders Beach and enjoy the character of Simon's Town. Choose photo stops, discuss a lunch break with your guide and spend more time in the places that interest you. Your route and timings are agreed with the RA2 team before travel.",
    highlights: [
      {
        title: "Chapman's Peak",
        desc: "Clifftop coastal views and time for photographs on this remarkable ocean road.",
      },
      {
        title: "Cape Point",
        desc: "Wild landscapes, a historic lighthouse and panoramic views across the peninsula.",
      },
      {
        title: "Boulders Beach",
        desc: "See the African penguin colony from the protected boardwalks near Simon's Town.",
      },
      {
        title: "Hout Bay & Camps Bay",
        desc: "Fishing-harbour character, mountain backdrops and beautiful Atlantic beaches.",
      },
    ],
    idealFor: ["Couples", "Families", "Small groups", "First-time visitors"],
    included: [
      "Private transport and local guide",
      "Agreed pickup and drop-off",
      "A personalised day itinerary",
      "Flexible sightseeing and photo stops",
    ],
    notIncluded: [
      "Cape Point and Boulders Beach entrance fees unless included in your quote",
      "Meals, optional activities and gratuities",
    ],
    addOns: [
      "Seal Island boat trip, weather permitting",
      "Cape Point funicular",
      "A relaxed coastal lunch stop",
    ],
    info: ["Approximate duration: 8 hours", "Private experience", "Route subject to conditions"],
    additionalInfo: planningNotes,
    closing:
      "A whole day of sea air, remarkable scenery and local stories. Let RA2 plan your private Cape Peninsula experience.",
  },
  city: {
    title: "Cape Town City Tour",
    label: "Meet the Mother City",
    slug: "cape-town-city-tour",
    heroImage: "city",
    intro:
      "Discover Table Mountain, Bo-Kaap and the V&A Waterfront through the eyes of a local, with a private itinerary shaped around you.",
    description:
      "Cape Town has a story around every corner. Our private city experience introduces you to its landscapes, heritage and everyday life with comfortable transport and a knowledgeable local guide.\n\nExplore the colourful streets and Cape Malay heritage of Bo-Kaap, see the city from Signal Hill and make time for the V&A Waterfront. Table Mountain can be included when weather and cableway operations allow; tickets and timings are confirmed during planning.\n\nChoose a half-day introduction or a more leisurely full day. Whether you love history, photography, food or simply discovering somewhere new, RA2 will help build a route that fits.",
    highlights: [
      {
        title: "Table Mountain",
        desc: "A Cape Town icon, with a cableway visit possible when weather and operations allow.",
      },
      {
        title: "Bo-Kaap",
        desc: "Colourful streets and a chance to learn about Cape Malay culture and heritage.",
      },
      {
        title: "V&A Waterfront",
        desc: "Harbour views, local markets, shopping and places to pause over lunch.",
      },
      {
        title: "City viewpoints",
        desc: "Signal Hill and scenic stops chosen around your interests and the day's conditions.",
      },
    ],
    idealFor: ["First-time visitors", "Families", "Couples", "Corporate travellers"],
    included: [
      "Private transport and local guide",
      "Agreed pickup and drop-off",
      "A tailored half-day or full-day route",
      "Time for sightseeing and photographs",
    ],
    notIncluded: [
      "Attraction tickets unless included in your quote",
      "Meals and optional activities",
    ],
    additionalInfo: planningNotes,
    closing:
      "Get to know Cape Town at your own pace. Tell us what interests you and we'll take care of the route.",
  },
  winelands: {
    title: "Cape Winelands Private Tour",
    label: "A little slower. A little more special.",
    slug: "cape-winelands",
    heroImage: "wine",
    intro:
      "Spend an unhurried day among the vineyards, estates and mountain scenery of Stellenbosch and Franschhoek.",
    description:
      "A day in the Cape Winelands is about more than wine. It's oak-lined streets, generous hospitality, beautiful gardens and mountain views that invite you to slow down.\n\nRA2 Travel & Tours creates a private route through Stellenbosch, Franschhoek or the surrounding wine regions based on your preferences. Discuss the estates you'd like to visit, the tastings you enjoy and whether you'd like to include a leisurely lunch.\n\nWith a professional driver taking care of the journey, you're free to enjoy the day. Estate reservations, tasting fees and any additional experiences are agreed in your personalised quote. Non-drinkers and families are welcome; we'll help find suitable stops for everyone.",
    highlights: [
      {
        title: "Stellenbosch",
        desc: "Historic streets, mountain scenery and a choice of acclaimed wine estates.",
      },
      {
        title: "Franschhoek",
        desc: "A beautiful valley known for its food, wine and relaxed village atmosphere.",
      },
      {
        title: "Estate experiences",
        desc: "Tastings, gardens and cellar visits selected around your preferences and availability.",
      },
      {
        title: "Your perfect pace",
        desc: "Time for a long lunch, a scenic stop or another estate. Plan the day your way.",
      },
    ],
    idealFor: ["Couples", "Friends", "Wine lovers", "Private groups"],
    included: [
      "Private transport with a professional driver",
      "Agreed pickup and drop-off",
      "A personalised estate itinerary",
      "Reservation coordination",
    ],
    notIncluded: [
      "Wine tasting and estate fees unless included in your quote",
      "Meals, purchases and optional activities",
    ],
    additionalInfo: planningNotes,
    closing:
      "Good wine, beautiful places and a day that feels like yours. Plan your private Winelands escape with RA2.",
  },
};

export const CAPE_PENINSULA_TOUR = DETAILED_TOURS.peninsula;

export const FEATURES = [
  {
    title: "Private & Personalised",
    desc: "Every journey can be tailored around you, your pace and the things you love.",
  },
  {
    title: "Professional Local Guides",
    desc: "Experience South Africa with knowledgeable, welcoming local professionals.",
  },
  {
    title: "Comfortable Transport",
    desc: "Enjoy the journey with reliable private transport and thoughtfully planned routes.",
  },
  {
    title: "Flexible Itineraries",
    desc: "Build a trip around your interests and schedule, with room to make it your own.",
  },
  {
    title: "Family Friendly",
    desc: "Thoughtful experiences for couples, families, friends and multi-generational groups.",
  },
  {
    title: "Local Expertise",
    desc: "Discover Cape Town and South Africa with people who know and love the destination.",
  },
];

export const STATS = [
  { value: 100, suffix: "%", label: "Private journeys" },
  { value: 24, suffix: "/7", label: "WhatsApp availability" },
  { value: 8, suffix: "", label: "Signature experiences" },
  { value: 1, suffix: "", label: "Journey designed for you" },
];

export const TRAVEL_STYLES = [
  {
    title: "For the explorers",
    text: "A coastal drive. A quiet viewpoint. A city story you hadn't heard before. Make room for the unexpected, with a local guide who knows the way.",
    detail: "Private tours & local discoveries",
  },
  {
    title: "For your favourite people",
    text: "Time together is the best part of travel. Bring the family, gather your friends and let us plan a comfortable journey with something for everyone.",
    detail: "Families, couples & small groups",
  },
  {
    title: "For a little more adventure",
    text: "Dunes beneath your wheels, the city beneath your feet or a safari on the horizon. Tell us what excites you. We'll help turn it into a day to remember.",
    detail: "Safari & adventure experiences",
  },
];

export const FAQS = [
  {
    q: "Do you offer private tours in Cape Town?",
    a: "Yes, we specialise in private tours in Cape Town for individuals, couples, families and small groups. You'll have your own vehicle, guide and flexible itinerary, allowing you to explore at your own pace.",
  },
  {
    q: "Can you customise itineraries?",
    a: "Absolutely. We create customised travel itineraries based on your interests, travel style and time frame. Whether you're looking for adventure, wine experiences, sightseeing or a mix of everything, we tailor the journey to you.",
  },
  {
    q: "Do you provide airport transfers?",
    a: "Yes, we offer private Cape Town airport transfers, meet-and-greet services, executive transfers and chauffeur-driven options for leisure travellers, families and business clients. Please book at least 24 hours before arrival where possible. Reach us on WhatsApp for short-notice requests.",
  },
  {
    q: "Are your tours suitable for families?",
    a: "Yes. We plan comfortable, engaging experiences for travellers of different ages and can adjust activities for children, seniors and multi-generational groups. Please tell us about child seats, mobility needs and any special requirements when requesting your quote.",
  },
  {
    q: "Do you offer tours outside of Cape Town?",
    a: "Yes, we arrange experiences across the Western Cape and South Africa, including the Cape Winelands, Garden Route and safari destinations. Tell us where you'd love to go and we'll discuss a suitable itinerary.",
  },
  {
    q: "What happens after I request a booking?",
    a: "Your request is saved with an RA2 reference and we send an email acknowledging receipt. Our team then checks availability and prepares your personalised quote. Your trip is confirmed once the arrangements are agreed with RA2. You can also choose to share your request with us on WhatsApp.",
  },
];
