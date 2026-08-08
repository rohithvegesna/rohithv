/* Canvas-generated textures: brand signage, canopy band, price board,
   product labels, receipt. All fictional — sourced from config/brand.js. */
import * as THREE from "three";
import { brand, products } from "@/config/brand";

function canvas(w, h) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  return [cv, cv.getContext("2d")];
}

function tex(cv, { repeat, anisotropy = 4 } = {}) {
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = anisotropy;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}

export function signTexture() {
  const [cv, x] = canvas(1024, 256);
  x.fillStyle = brand.sign.bg;
  x.fillRect(0, 0, 1024, 256);
  x.strokeStyle = "rgba(242,234,217,0.18)";
  x.lineWidth = 6;
  x.strokeRect(10, 10, 1004, 236);
  x.font = "800 150px 'Big Shoulders', 'Arial Narrow', sans-serif";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.shadowColor = brand.sign.accent;
  x.shadowBlur = 42;
  x.fillStyle = brand.sign.text;
  x.fillText(brand.name, 512, 108);
  x.shadowBlur = 0;
  x.font = "700 44px 'Overpass Mono', monospace";
  x.fillStyle = brand.sign.accent;
  x.fillText(brand.tagline, 512, 204);
  return tex(cv);
}

export function stripeTexture() {
  const [cv, x] = canvas(64, 128);
  x.fillStyle = "#efe9dc";
  x.fillRect(0, 0, 64, 128);
  const h = 26;
  brand.stripes.forEach((c, i) => {
    x.fillStyle = c;
    x.fillRect(0, 18 + i * (h + 4), 64, h);
  });
  return tex(cv, { repeat: [24, 1] });
}

export function priceBoardTexture() {
  const [cv, x] = canvas(512, 640);
  x.fillStyle = "#0d0b09";
  x.fillRect(0, 0, 512, 640);
  x.strokeStyle = brand.sign.accent;
  x.lineWidth = 8;
  x.strokeRect(8, 8, 496, 624);
  x.textAlign = "center";
  x.font = "800 84px 'Big Shoulders', 'Arial Narrow', sans-serif";
  x.fillStyle = "#f2ead9";
  x.fillText(brand.name, 256, 108);
  x.font = "700 52px 'Overpass Mono', monospace";
  x.fillStyle = "#a89a8b";
  x.fillText(brand.fuel.productName, 256, 220);
  x.font = "800 200px 'Big Shoulders', 'Arial Narrow', sans-serif";
  x.fillStyle = "#8fd98f";
  x.shadowColor = "#8fd98f";
  x.shadowBlur = 30;
  x.fillText(brand.fuel.pricePerGallon.toFixed(2), 256, 430);
  x.shadowBlur = 0;
  x.font = "700 44px 'Overpass Mono', monospace";
  x.fillStyle = "#a89a8b";
  x.fillText("PER GALLON", 256, 560);
  return tex(cv);
}

export function productLabelTexture(p) {
  const [cv, x] = canvas(256, 256);
  x.fillStyle = p.color;
  x.fillRect(0, 0, 256, 256);
  const g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "rgba(255,255,255,0.22)");
  g.addColorStop(0.5, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(0,0,0,0.3)");
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);
  x.fillStyle = "rgba(15,12,10,0.85)";
  x.fillRect(0, 88, 256, 84);
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.font = "800 40px 'Big Shoulders', 'Arial Narrow', sans-serif";
  x.fillStyle = "#f2ead9";
  const words = p.name.split(" ");
  x.fillText(words[0], 128, 116);
  x.fillText(words.slice(1).join(" "), 128, 152);
  x.font = "700 26px 'Overpass Mono', monospace";
  x.fillStyle = "#0f0c0a";
  x.fillText(`$${p.price.toFixed(2)}`, 128, 226);
  return tex(cv);
}

export function pumpScreenTexture(lines, accent = "#8fd98f") {
  const [cv, x] = canvas(256, 192);
  x.fillStyle = "#0a1208";
  x.fillRect(0, 0, 256, 192);
  x.strokeStyle = "rgba(143,217,143,0.35)";
  x.strokeRect(4, 4, 248, 184);
  x.textAlign = "center";
  x.font = "700 24px 'Overpass Mono', monospace";
  lines.forEach((l, i) => {
    x.fillStyle = i === 0 ? accent : "#bfe6b4";
    x.fillText(l, 128, 48 + i * 40);
  });
  return tex(cv);
}

export function asphaltRoughness() {
  const [cv, x] = canvas(256, 256);
  const img = x.createImageData(256, 256);
  let seed = 1337;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 165 + rnd() * 70 - (rnd() < 0.015 ? 90 : 0); // darker = wet pools
    img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
    img.data[i + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(14, 14);
  return t;
}

export function stainTexture(seedBase = 7) {
  const [cv, x] = canvas(128, 128);
  let seed = seedBase;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  x.clearRect(0, 0, 128, 128);
  for (let i = 0; i < 26; i++) {
    const r = 12 + rnd() * 34;
    const g = x.createRadialGradient(64, 64, 2, 64 + (rnd() - 0.5) * 40, 64 + (rnd() - 0.5) * 40, r);
    g.addColorStop(0, `rgba(4,4,5,${0.16 + rnd() * 0.22})`);
    g.addColorStop(1, "rgba(4,4,5,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
  }
  const t = new THREE.CanvasTexture(cv);
  return t;
}

export function tireMarkTexture() {
  const [cv, x] = canvas(64, 256);
  x.clearRect(0, 0, 64, 256);
  for (const lane of [18, 46]) {
    for (let yq = 0; yq < 256; yq += 4) {
      const a = 0.05 + 0.16 * Math.abs(Math.sin(yq * 0.021));
      x.fillStyle = `rgba(6,6,7,${a})`;
      x.fillRect(lane - 5, yq, 10, 3);
    }
  }
  const t = new THREE.CanvasTexture(cv);
  return t;
}

export { products, brand };
