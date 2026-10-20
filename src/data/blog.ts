import heroImg from "@/assets/hero-capetown.jpg";
import peninsulaImg from "@/assets/tour-peninsula.jpg";
import wineImg from "@/assets/tour-wine.jpg";
import tableImg from "@/assets/tour-table.jpg";
import foodImg from "@/assets/tour-food.jpg";
import westcoastImg from "@/assets/tour-westcoast.jpg";
import bokkaapImg from "@/assets/Bokaap.webp";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  readTime: string;
  category: string;
  content: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "top-10-things-to-do-in-cape-town",
    title: "Top 10 Things to Do in Cape Town",
    excerpt:
      "From Table Mountain to Boulders Beach, here are the unmissable experiences every visitor should add to their Cape Town itinerary.",
    image: heroImg,
    date: "June 20, 2026",
    readTime: "7 min read",
    category: "Travel Guide",
    content: [
      "Cape Town is one of the most beautiful cities in the world, and there is something for every kind of traveller. From rocky coastal drives to mountain tops and market streets, these ten experiences are the best way to feel the city in one visit.",
      "1. Take the Table Mountain cableway early to beat the wind and crowds. The views over the city, ocean and stadium are spectacular and you can walk the plateau if the weather is clear.",
      "2. Spend time with the African penguins at Boulders Beach. Arrive before mid-morning when the beach is cooler and the colony is most active, then follow the boardwalks through the dunes.",
      "3. Drive Chapman's Peak at sunset for one of the most beautiful coastal roads in the world. Stop at the viewpoints for photos and to watch the ocean glow as the light changes.",
      "4. Explore the colourful Bo-Kaap neighbourhood on foot, learn about its Cape Malay heritage, and try a traditional curry or sweet treat from a local bakery.",
      "5. Take the ferry to Robben Island and hear the story of Nelson Mandela and South Africa's fight for democracy. Book in advance and bring a light jacket — the island can be chilly.",
      "6. Visit the V&A Waterfront for shops, markets, and a harbour boat cruise. Wander the outdoor food market for seafood, local craft coffee, and sunset views.",
      "7. Sample world-class wines on a half-day trip to Stellenbosch or Franschhoek. Choose a mix of historic estates and newer boutique cellars for a balanced day.",
      "8. Walk through Kirstenbosch Botanical Gardens, especially in spring when the flowers are at their best. The tree canopy walk is a must if you want a different perspective over the gardens.",
      "9. Watch the sunset from Signal Hill or Lion's Head. Both are easy to reach and offer panoramic skyline views — Lion's Head is more of a hike, while Signal Hill is perfect for a relaxed picnic.",
      "10. Book a private shuttle so you can relax between stops and see more without worrying about parking or timing. Tell us your priorities and we'll tailor the route to your pace.",
    ],
  },
  {
    slug: "cape-peninsula-day-tour-guide",
    title: "The Ultimate Cape Peninsula Day Tour Guide",
    excerpt:
      "Everything you need to know about exploring Cape Point, Chapman's Peak, and the penguins of Boulders Beach in a single unforgettable day.",
    image: peninsulaImg,
    date: "June 12, 2026",
    readTime: "6 min read",
    category: "Tours",
    content: [
      "The Cape Peninsula day tour is the most iconic full-day experience in Cape Town. It combines dramatic ocean views, fynbos-clad cliffs, historic lighthouses, and a chance to see African penguins on a single route.",
      "A typical day starts with a pickup in the city between 8am and 9am. The first stop is usually Hout Bay, where you can see the fishing harbour and, on clear days, take a short boat ride to Seal Island.",
      "Next comes Chapman's Peak Drive, one of the world’s most scenic coastal roads. The road winds along the mountain and drops to the sea below — take a moment at the view points to feel the sheer scale of the peninsula.",
      "Cape Point and the old lighthouse are the highlight. There’s a short walk to the lighthouse and a funicular option if you prefer not to climb. From the top, you can see where the Atlantic and Indian Ocean currents collide.",
      "The day usually finishes at Boulders Beach, where the penguin colony waddles along the sand. Follow the boardwalks, keep a respectful distance, and bring a hat and sunscreen for the open beach.",
      "A private shuttle makes this itinerary smooth: you avoid rental hassles, stay together as a group, and can linger longer at the places you love without feeling rushed.",
    ],
  },
  {
    slug: "best-time-to-visit-cape-town",
    title: "When Is the Best Time to Visit Cape Town?",
    excerpt:
      "A month-by-month breakdown of Cape Town's seasons, weather, crowds, and what's worth doing at each time of year.",
    image: tableImg,
    date: "June 1, 2026",
    readTime: "6 min read",
    category: "Travel Tips",
    content: [
      "Cape Town has a Mediterranean climate, which means warm, dry summers and cool, wet winters. There is no single best time to visit — it depends on whether you want beach days, wine tastings, whale watching, or quiet streets.",
      "Summer (November to March) is the busiest season. The weather is usually hot and dry, beaches are lively, and the skies are clear for mountain hikes. If you come in summer, book tours and restaurants well in advance.",
      "Autumn (April to May) is one of the best windows for travel. The crowds thin out, the vineyards are at their most colourful, and the sea is still warm enough for walking along the coast.",
      "Winter (June to August) is the season for whale watching and fewer tourists. Expect cool, rainy days, but also dramatic surf on the Atlantic coast and excellent hotel deals. Some tours run rain or shine, so dress in layers.",
      "Spring (September to October) brings wildflowers across the Cape and mild weather. It is a great time for scenic drives up the West Coast and afternoon vineyard lunches before the summer rush begins.",
      "If you are planning a specific activity — like hiking Table Mountain, visiting the beach, or taking a wine tour — we can recommend the best days and tailor your itinerary to the weather forecast.",
    ],
  },
  {
    slug: "stellenbosch-wine-route-essentials",
    title: "Stellenbosch Wine Route: A First-Timer's Guide",
    excerpt:
      "Which estates to visit, what to order, and how to make the most of a day in South Africa's most famous wine region.",
    image: wineImg,
    date: "May 22, 2026",
    readTime: "6 min read",
    category: "Wine & Dining",
    content: [
      "Stellenbosch is South Africa's oldest wine region and one of the most picturesque. With Cape Dutch architecture, oak-lined avenues, and hundreds of wineries nearby, it is the perfect escape from the city.",
      "A successful wine-route day usually includes a mix of established estates and small boutique cellars. Start with one winery known for its classics, enjoy a long lunch at a restaurant with vineyard views, then finish with a lighter tasting or chocolate pairing.",
      "Tasting fees are often refundable when you buy bottles, so ask about the cellar's refund policy before you begin. Reserve your tastings in advance, especially for weekends and peak season.",
      "Stellenbosch is also a food destination. Many estates have excellent farm-to-table restaurants, and the town centre is full of cafés, bakeries, and deli counters. Plan your lunch stop so you have time to relax between tastings.",
      "A private shuttle is the best way to enjoy the wine route safely. We know the local roads, the estate opening hours, and the quieter routes that let you get the most out of your day.",
    ],
  },
  {
    slug: "airport-transfer-tips-cape-town",
    title: "Airport Transfers in Cape Town: What to Expect",
    excerpt:
      "How long the drive really takes, what to do on arrival, and why a pre-booked shuttle beats a taxi rank every time.",
    image: foodImg,
    date: "May 10, 2026",
    readTime: "4 min read",
    category: "Travel Tips",
    content: [
      "Cape Town International Airport is around 20km from the city centre, but traffic can change the travel time significantly. Outside peak hour it takes about 25 minutes; during rush hour it can take closer to 45 minutes.",
      "A pre-booked transfer removes the stress of finding a driver after a long flight. With a private shuttle you get a meet-and-greet service, help with luggage, and a fixed price that is agreed before you travel.",
      "If you are arriving on a late flight, a driver waiting with your name is far better than standing in a crowded arrivals hall. We track your flight so we can adjust for delays and be ready when you come through customs.",
      "If you are staying in Camps Bay, Clifton, Sea Point or the V&A Waterfront, tell us and we will plan the quickest route for the time of day. We can also take you onward to Stellenbosch, Somerset West or Hermanus if your trip includes more than Cape Town.",
      "For departures, a morning pickup is usually reliable, but we will still check your flight time and airport lane conditions. You can relax knowing your transfer is booked and your driver knows the city.",
    ],
  },
  {
    slug: "capetown-neighborhoods-guide",
    title: "A Local's Guide to Cape Town Neighborhoods",
    excerpt:
      "Discover the city through its best neighbourhoods, from the colourful streets of Bo-Kaap to the beaches of Camps Bay.",
    image: bokkaapImg,
    date: "June 25, 2026",
    readTime: "6 min read",
    category: "Travel Guide",
    content: [
      "Cape Town is a city of distinct neighbourhoods, each with its own character. Understanding the local areas makes it easier to choose where to stay and what to do during your trip.",
      "The City Bowl is the heart of Cape Town, where the business district meets the old residential streets of Tamboerskloof and Gardens. It's a great base for museums, markets and access to Table Mountain.",
      "Sea Point and Green Point sit along the Atlantic coast and are perfect for ocean walks, cafés, and relaxed evenings. The Sea Point promenade is a favourite for sunrise joggers and sunset strolls.",
      "Camps Bay and Clifton are the glamorous beach suburbs. White sand, chic restaurants and dramatic coastal views make them ideal for a day of lounging and people-watching.",
      "Bo-Kaap offers colourful houses, cafés, and Cape Malay culture. Take a guided walk to learn about the neighbourhood's history, sample local dishes, and enjoy the bright, photogenic streets.",
      "Woodstock is the creative hub, with cafés, street art, and markets like the Neighbourgoods Market. It's a good choice if you want somewhere edgy, local and easy to reach from the city centre.",
      "We can help you choose the best neighbourhoods for your interests, whether you want beaches, vineyards, food, or city life. A private shuttle also makes it easy to base yourself in one area while exploring the rest of the city.",
    ],
  },
  {
    slug: "cape-town-for-families",
    title: "Cape Town for Families: Best Kid-Friendly Experiences",
    excerpt:
      "Planning a family trip? Here are safe, fun and unforgettable attractions that kids and parents will both love.",
    image: westcoastImg,
    date: "June 18, 2026",
    readTime: "5 min read",
    category: "Family Travel",
    content: [
      "Cape Town is a wonderful destination for families. From wildlife encounters to outdoor adventures, there are plenty of activities that are easy with children and still exciting for adults.",
      "Start with the Two Oceans Aquarium at the V&A Waterfront. It is a calm, educational introduction to the local marine life and has touch pools, penguins, and interactive displays.",
      "Boulders Beach is another family favourite — the penguins are always a hit, and the sheltered bay is ideal for children to paddle safely while watching the birds nearby.",
      "Kirstenbosch Botanical Gardens are perfect for a relaxed picnic and outdoor play. The tree canopy walkway is fun for older kids, and the gardens are a peaceful place to stretch your legs after a busy morning.",
      "For a more active day, take a slow coastal drive to the Cape Point Peninsula and stop at the scenic beaches, lighthouses and picnic spots along the way. Our private shuttle can make the journey easy with all the luggage and snacks handled for you.",
      "If your family wants a quieter day outside the city, the West Coast wildflower season and scenic bays offer open spaces, nature walks and the chance to explore at your own pace.",
    ],
  },
];
