/*
  Fictional station brand — trade-dress-inspired stripe band (orange/green/
  red) with an original name and wordmark. Every sign, canopy band, pump
  decal, and receipt header in the game reads from this file, so officially
  licensed branding can be swapped in later with written permission by
  editing ONLY this config.
*/
export const brand = {
  name: "NITE-SEVEN",
  storeName: "Nite-Seven Food Store",
  tagline: "OPEN ALL NIGHT",
  stripes: ["#e8801a", "#2e9e5b", "#d63c2f"], // orange / green / red band
  sign: {
    bg: "#12100e",
    text: "#f2ead9",
    accent: "#e8801a",
  },
  fuel: {
    productName: "NightGrade 87",
    pricePerGallon: 3.09,
  },
  receiptFooter: "engineered by Rohith Varma Vegesna — see the work → Classic site",
};

/* Fictional shelf products; label textures are canvas-generated from these. */
export const products = [
  { id: "volt", name: "VOLT KOLA", kind: "can", color: "#d63c2f", price: 1.89 },
  { id: "packet", name: "PACKET CHIPS", kind: "bag", color: "#e8a01a", price: 2.49 },
  { id: "uplink", name: "UPLINK ENERGY", kind: "can", color: "#2e9e5b", price: 3.29 },
  { id: "fedcache", name: "FED CACHE BAR", kind: "bar", color: "#8a5a34", price: 1.59 },
  { id: "coldboot", name: "COLD BOOT BREW", kind: "bottle", color: "#3a6ea5", price: 2.99 },
  { id: "checksum", name: "CHECKSUM CRUNCH", kind: "bag", color: "#7a4a9e", price: 2.79 },
];
