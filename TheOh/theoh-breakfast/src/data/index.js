import { oatsBreads } from './oatsBreads';
import { fruits } from './fruits';
import { nuts } from './nuts';
import { seeds } from './seeds';
import { butters } from './butters';

export { oatsBreads } from './oatsBreads';
export { fruits } from './fruits';
export { nuts } from './nuts';
export { seeds } from './seeds';
export { butters } from './butters';

export const ADDONS = {
  "Spreads & Sweeteners": butters,
  "Fresh Fruits": fruits,
  "Premium Nuts": nuts,
  "Healthy Seeds": seeds,
};

export const TAG_COLORS = {
  "High Protein": { bg: "bg-[#FFF3E0]", text: "text-[#E65100]", border: "border-[#FFCC80]" },
  "Fiber Rich": { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", border: "border-[#A5D6A7]" },
  "Fresh Fruits": { bg: "bg-[#FCE4EC]", text: "text-[#AD1457]", border: "border-[#F48FB1]" },
  "Healthy Fats": { bg: "bg-[#FFF8E1]", text: "text-[#F57F17]", border: "border-[#FFE082]" },
};

export const REVIEWS = [
  { name: "Priya S.", text: "Best breakfast in Hyderabad! The Fruit Oats with almonds and strawberry is my go-to every morning.", rating: 5, location: "Kondapur Hyderabad" },
  { name: "Rahul K.", text: "High Protein Oats with peanut butter changed my gym mornings completely. Highly recommend!", rating: 5, location: "Heritage Rocks" },
  { name: "Ananya M.", text: "So fresh and healthy. Loved the multigrain bread combo. Will definitely order again!", rating: 5, location: " Near Malkam Cheruvu" },
];

export const WHATSAPP_NUMBER = "919876543210";
export const HERO_BG = "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=1400&q=80";
export const STORY_BG = "https://images.unsplash.com/photo-1504308805006-0f7a5f1adea4?w=1400&q=80";
