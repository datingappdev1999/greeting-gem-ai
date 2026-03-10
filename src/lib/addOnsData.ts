// Flower bouquet images
import bouquetRoses from "@/assets/addons/bouquet-roses.jpg";
import bouquetMixed from "@/assets/addons/bouquet-mixed.jpg";
import bouquetLily from "@/assets/addons/bouquet-lily.jpg";
import bouquetTulip from "@/assets/addons/bouquet-tulip.jpg";
import bouquetPeony from "@/assets/addons/bouquet-peony.jpg";
import bouquetSunflower from "@/assets/addons/bouquet-sunflower.jpg";
import bouquetLavender from "@/assets/addons/bouquet-lavender.jpg";
import bouquetOrchid from "@/assets/addons/bouquet-orchid.jpg";
// Chocolate images
import chocLuxury from "@/assets/addons/choc-luxury.jpg";
import chocTruffle from "@/assets/addons/choc-truffle.jpg";
import chocMilkDark from "@/assets/addons/choc-milk-dark.jpg";
import chocHazelnut from "@/assets/addons/choc-hazelnut.jpg";
import chocRaspberry from "@/assets/addons/choc-raspberry.jpg";
import chocSalted from "@/assets/addons/choc-salted.jpg";
import chocOrange from "@/assets/addons/choc-orange.jpg";
import chocMinis from "@/assets/addons/choc-minis.jpg";

export interface FlowerBouquet {
  id: string;
  name: string;
  price: number; // GBP, in £20–£40 range
  description: string;
  imageUrl: string;
}

export interface ChocolateOption {
  id: string;
  name: string;
  price: number; // GBP, in £10–£20 range
  description: string;
  imageUrl: string;
}

export const FLOWER_BOUQUETS: FlowerBouquet[] = [
  { id: "bouquet-roses", name: "Classic Red Roses", price: 34.99, description: "12 stem hand-tied bouquet", imageUrl: bouquetRoses },
  { id: "bouquet-mixed", name: "Mixed Seasonal Blooms", price: 29.99, description: "Seasonal flowers, wrapped", imageUrl: bouquetMixed },
  { id: "bouquet-lily", name: "Lily & Eucalyptus", price: 39.99, description: "Elegant lilies with foliage", imageUrl: bouquetLily },
  { id: "bouquet-tulip", name: "Tulip Posy", price: 24.99, description: "Fresh tulips in soft tones", imageUrl: bouquetTulip },
  { id: "bouquet-peony", name: "Peony & Rose", price: 44.99, description: "Peonies and garden roses", imageUrl: bouquetPeony },
  { id: "bouquet-sunflower", name: "Sunflower Cheer", price: 27.99, description: "Bright sunflowers & greens", imageUrl: bouquetSunflower },
  { id: "bouquet-lavender", name: "Lavender & Dried", price: 32.99, description: "Lavender and dried stems", imageUrl: bouquetLavender },
  { id: "bouquet-orchid", name: "Orchid Elegance", price: 42.99, description: "Potted orchid in ceramic", imageUrl: bouquetOrchid },
];

export const CHOCOLATE_OPTIONS: ChocolateOption[] = [
  { id: "choc-luxury", name: "Luxury Belgian Box", price: 18.99, description: "16 pieces, assorted", imageUrl: chocLuxury },
  { id: "choc-truffle", name: "Truffle Selection", price: 14.99, description: "12 hand-finished truffles", imageUrl: chocTruffle },
  { id: "choc-milk-dark", name: "Milk & Dark Duo", price: 12.99, description: "Two bars, gift boxed", imageUrl: chocMilkDark },
  { id: "choc-hazelnut", name: "Hazelnut Praline", price: 16.99, description: "Praline collection", imageUrl: chocHazelnut },
  { id: "choc-raspberry", name: "Raspberry Hearts", price: 11.99, description: "Heart-shaped chocolates", imageUrl: chocRaspberry },
  { id: "choc-salted", name: "Salted Caramel Box", price: 15.99, description: "9 salted caramel pieces", imageUrl: chocSalted },
  { id: "choc-orange", name: "Orange & Dark", price: 13.99, description: "Dark chocolate with orange", imageUrl: chocOrange },
  { id: "choc-minis", name: "Mini Treats Box", price: 10.99, description: "20 mini chocolates", imageUrl: chocMinis },
];
