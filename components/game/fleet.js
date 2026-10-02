/*
  Light the fleet — board logic, pure functions only.

  A board is an n×n grid. One cell is the cloud (the source); every other
  cell is a site or a junction. The solution is a random spanning tree
  rooted at the cloud, so every cell has a path back to it. Each cell's
  connectors are a 4-bit mask (N=1, E=2, S=4, W=8). The board ships with
  every tile turned a random number of quarter-turns; the player turns
  tiles clockwise until the whole fleet is lit and no trace points nowhere.
*/
export const N = 6;

const DR = [-1, 0, 1, 0];
const DC = [0, 1, 0, -1];
const opposite = (d) => (d + 2) % 4;

/* FNV-1a over the seed string, then mulberry32 — small, fast, deterministic. */
export function hashSeed(str) {
  let h = 2166136261;
  for (const ch of String(str)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Turn a connector mask clockwise k quarter-turns: N→E→S→W→N. */
export function rotMask(mask, k) {
  let m = mask & 15;
  for (let i = 0; i < ((k % 4) + 4) % 4; i++) m = ((m << 1) | (m >> 3)) & 15;
  return m;
}

export function masks(base, rots) {
  return base.map((m, i) => rotMask(m, rots[i]));
}

/* Which cells can reach the source through matched connectors. */
export function lit(base, rots, src, n) {
  const cur = masks(base, rots);
  const seen = new Array(cur.length).fill(false);
  const stack = [src];
  seen[src] = true;
  while (stack.length) {
    const i = stack.pop();
    const r = Math.floor(i / n);
    const c = i % n;
    for (let d = 0; d < 4; d++) {
      if (!(cur[i] & (1 << d))) continue;
      const rr = r + DR[d];
      const cc = c + DC[d];
      if (rr < 0 || rr >= n || cc < 0 || cc >= n) continue;
      const j = rr * n + cc;
      if (seen[j] || !(cur[j] & (1 << opposite(d)))) continue;
      seen[j] = true;
      stack.push(j);
    }
  }
  return seen;
}

/* Connectors that point off the board or at a tile that doesn't answer. */
export function looseEnds(cur, n) {
  let loose = 0;
  for (let i = 0; i < cur.length; i++) {
    const r = Math.floor(i / n);
    const c = i % n;
    for (let d = 0; d < 4; d++) {
      if (!(cur[i] & (1 << d))) continue;
      const rr = r + DR[d];
      const cc = c + DC[d];
      if (rr < 0 || rr >= n || cc < 0 || cc >= n) loose++;
      else if (!(cur[rr * n + cc] & (1 << opposite(d)))) loose++;
    }
  }
  return loose;
}

export function isSolved(base, rots, src, n) {
  return (
    lit(base, rots, src, n).every(Boolean) &&
    looseEnds(masks(base, rots), n) === 0
  );
}

/* Fewest clockwise turns that put every tile back in a solved orientation
   (a straight trace is home again after two). */
export function par(base, rots) {
  return base.reduce((sum, m, i) => {
    for (let k = 0; k < 4; k++) if (rotMask(m, rots[i] + k) === m) return sum + k;
    return sum;
  }, 0);
}

export function generate(seed, n = N) {
  const rand = mulberry32(hashSeed(seed));
  const total = n * n;
  const src = Math.floor(n / 2) * n + Math.floor(n / 2);
  const base = new Array(total).fill(0);
  const inTree = new Array(total).fill(false);
  const frontier = [];
  const expand = (i) => {
    const r = Math.floor(i / n);
    const c = i % n;
    for (let d = 0; d < 4; d++) {
      const rr = r + DR[d];
      const cc = c + DC[d];
      if (rr < 0 || rr >= n || cc < 0 || cc >= n) continue;
      if (!inTree[rr * n + cc]) frontier.push([i, rr * n + cc, d]);
    }
  };

  /* randomized Prim: a bushy tree, lots of junctions, every cell reached */
  inTree[src] = true;
  expand(src);
  while (frontier.length) {
    const [a, b, d] = frontier.splice(Math.floor(rand() * frontier.length), 1)[0];
    if (inTree[b]) continue;
    inTree[b] = true;
    base[a] |= 1 << d;
    base[b] |= 1 << opposite(d);
    expand(b);
  }

  /* scramble, and never hand out a board that is already solved */
  let rots;
  do {
    rots = base.map(() => Math.floor(rand() * 4));
  } while (isSolved(base, rots, src, n));

  return { seed: String(seed), n, src, base, rots };
}
