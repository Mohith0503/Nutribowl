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

export const COMBOS = [
  {
    id: "c1",
    name: "Peanut Butter Banana Overnight Oats",
    price: 150,
    base: "Rolled oats / oats",
    addons: ["Peanut butter", "Banana"],
    image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&q=80",
    tag: "High Protein",
    inStock: true,
    desc: "Nutritious overnight oats layered with creamy peanut butter and fresh banana slices.",
    nutrition: { calories: 560, protein: "21g", carbs: "70g", fiber: "9g", fat: "18g" }
  },
  {
    id: "c2",
    name: "Apple Cinnamon Overnight Oats",
    price: 135,
    base: "Rolled oats / oats",
    addons: ["Apple", "Cinnamon"],
    image: "https://images.unsplash.com/photo-1504308805006-0f7a5f1adea4?w=400&q=80",
    tag: "Fresh Fruits",
    inStock: true,
    desc: "Crisp apple bites and warm cinnamon blended into cold, creamy overnight oats.",
    nutrition: { calories: 360, protein: "14g", carbs: "45g", fiber: "9g", fat: "10g" }
  },
  {
    id: "c3",
    name: "Chocolate Fiber Overnight Oats",
    price: 145,
    base: "Rolled oats / oats",
    addons: ["Cocoa powder", "Chia seeds"],
    image: "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=400&q=80",
    tag: "Fiber Rich",
    inStock: true,
    desc: "A rich dark chocolate overnight bowl packed with fiber and omega-3s.",
    nutrition: { calories: 380, protein: "15g", carbs: "46g", fiber: "10g", fat: "11g" }
  },
  {
    id: "c4",
    name: "Cocoa Banana Oat Cup",
    price: 140,
    base: "Rolled oats / oats",
    addons: ["Cocoa powder", "Banana"],
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
    tag: "Energy Booster",
    inStock: true,
    desc: "Creamy cooked oats infused with rich cocoa and topped with sweet banana slices.",
    nutrition: { calories: 390, protein: "15g", fiber: "8g" }
  },
  {
    id: "c5",
    name: "Peanut Butter Power Oats",
    price: 130,
    base: "Rolled oats / oats",
    addons: ["Peanut butter", "Honey"],
    image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&q=80",
    tag: "High Protein",
    inStock: true,
    desc: "Warm, comforting cooked oats stirred with creamy peanut butter and organic honey.",
    nutrition: { calories: 560, protein: "18g", fiber: "8g" }
  },
  {
    id: "c6",
    name: "Cinnamon Apple Oat Porridge",
    price: 120,
    base: "Rolled oats / oats",
    addons: ["Apple", "Cinnamon"],
    image: "https://images.unsplash.com/photo-1614961909372-5e11b6a0ae54?w=400&q=80",
    tag: "Classic",
    inStock: true,
    desc: "Warm cinnamon spiced oatmeal porridge topped with caramelized apple bites.",
    nutrition: { calories: 350, protein: "14g", fiber: "9g" }
  }
];

export const TAG_COLORS = {
  "High Protein": { bg: "bg-[#FFF3E0]", text: "text-[#E65100]", border: "border-[#FFCC80]" },
  "Fiber Rich": { bg: "bg-[var(--accent-light)]", text: "text-[var(--accent-dark)]", border: "border-[var(--accent)]" },
  "Fresh Fruits": { bg: "bg-[#FCE4EC]", text: "text-[#AD1457]", border: "border-[#F48FB1]" },
  "Healthy Fats": { bg: "bg-[#FFF8E1]", text: "text-[#F57F17]", border: "border-[#FFE082]" },
  "Energy Booster": { bg: "bg-[#FFFDE7]", text: "text-[#F57F17]", border: "border-[#FFF59D]" },
  "Classic": { bg: "bg-[#E8EAF6]", text: "text-[#3F51B5]", border: "border-[#C5CAE9]" }
};

export const REVIEWS = [
  { name: "Priya S.", text: "Best breakfast in Hyderabad! The Apple Cinnamon Overnight Oats with almonds and honey is my go-to every morning.", rating: 5, location: "Kondapur Hyderabad" },
  { name: "Rahul K.", text: "Peanut Butter Power Oats changed my gym mornings completely. Highly recommend!", rating: 5, location: "Heritage Rocks" },
  { name: "Ananya M.", text: "So fresh and healthy. Loved the customized oats bowl. Will definitely order again!", rating: 5, location: " Near Malkam Cheruvu" },
];

export const WHATSAPP_NUMBER = "919515739319";
export const HERO_BG = "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=1400&q=80";
export const STORY_BG = "https://images.unsplash.com/photo-1504308805006-0f7a5f1adea4?w=1400&q=80";
