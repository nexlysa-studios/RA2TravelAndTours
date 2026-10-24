import photo1 from "@/assets/Ra2pics (1).webp";
import photo2 from "@/assets/Ra2pics (2).webp";
import photo3 from "@/assets/Ra2pics (3).webp";
import photo4 from "@/assets/Ra2pics (4).webp";
import photo5 from "@/assets/Ra2pics (5).webp";
import photo6 from "@/assets/Ra2pics (6).webp";
import photo7 from "@/assets/Ra2pics (7).webp";
import photo8 from "@/assets/Ra2pics (8).webp";

export const galleryPhotos = [
  {
    src: photo1,
    title: "A ride through the countryside",
    alt: "Travellers horseback riding through an open South African landscape",
    category: "Adventure",
    location: "South Africa",
    shape: "portrait",
  },
  {
    src: photo2,
    title: "Cape Town after dark",
    alt: "Moonlit view over Cape Town and its city lights",
    category: "Coast & ocean",
    location: "Cape Town",
    shape: "landscape",
  },
  {
    src: photo3,
    title: "Good company on the Cape coast",
    alt: "Travellers sharing a coastal stop and an evening meal",
    category: "People & places",
    location: "Cape Peninsula",
    shape: "portrait",
  },
  {
    src: photo4,
    title: "A day in the Winelands",
    alt: "A group enjoying a sunny day in a mountain garden",
    category: "Winelands",
    location: "Cape Winelands",
    shape: "landscape",
  },
  {
    src: photo5,
    title: "Take the scenic route",
    alt: "Travellers enjoying an outdoor adventure in the Cape",
    category: "Adventure",
    location: "South Africa",
    shape: "portrait",
  },
  {
    src: photo6,
    title: "The coast at our own pace",
    alt: "Travellers looking out over the Cape Town coastline",
    category: "Coast & ocean",
    location: "Cape Town",
    shape: "landscape",
  },
  {
    src: photo7,
    title: "A different way to explore",
    alt: "Visitors riding an open-air sightseeing tram",
    category: "Adventure",
    location: "South Africa",
    shape: "portrait",
  },
  {
    src: photo8,
    title: "The Cape at golden hour",
    alt: "Visitors taking in the sunset from a mountain lookout",
    category: "Coast & ocean",
    location: "Cape Town",
    shape: "portrait",
  },
] as const;
