// tm35fin.js
// based on TM35FIN.py by Lauri Kangas (which is licensed under ICCLEIYSIUYA (http://evvk.com/evvktvh.html))

// list for using row letters as calculatable indices
const rows200 = [
  "K",
  "L",
  "M",
  "N",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
];

// tile sizes indexed by printed map scale (e.g. 1:200k)
const scaleSizes = {
  200: [192000, 96000],
  100: [96000, 48000],
  50: [48000, 24000],
  25: [24000, 12000],
  20: [12000, 12000],
  10: [6000, 6000],
  5: [3000, 3000],
};

// tile sizes with list index corresponding to tile level (0..9)
const levelSizes = [
  [192000, 96000],
  [96000, 9600],
  [96000, 4800],
  [48000, 4800],
  [48000, 2400],
  [24000, 2400],
  [24000, 1200],
  [12000, 1200],
  [6000, 600],
  [3000, 300],
];

const grid4 = [["1", "2"], ["3", "4"]];
const grid8 = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"]];

const K4pos = [500000, 6570000]; // position of lower right of K4 as reference
const refpos = [
  // "K0" lower left
  K4pos[0] - 5 * scaleSizes[200][0],
  K4pos[1],
];

const divmod = (a, b) => [Math.floor(a / b), a % b];

/**
 * Generate level variants of a tile string
 * @param {string} tile Tile string
 * @returns {Array<string>} Increasingly precise variants for the tile
 */
const shorten = tile => {
  const shortenedTiles = [];
  for (let i = 0; i < tile.length - 1; i += 1) {
    shortenedTiles.push(tile.substring(0, i + 2));
  }
  const LRtiles = [];
  for (let i = 1; i < 4; i += 1) {
    const t = shortenedTiles[i - 1];
    LRtiles.push(
      t.substring(0, t.length - 1) + (/[12]/.test(t[t.length - 1]) ? "L" : "R"),
    );
  }

  [1, 3, 5].forEach((k, i) => {
    shortenedTiles.splice(k, 0, LRtiles[i]);
  });

  const t = shortenedTiles[7];
  const x =
    t.substring(0, t.length - 1) + (/[ABCD]/.test(t[t.length - 1]) ? "L" : "R");
  shortenedTiles.splice(7, 0, x);
  return shortenedTiles;
};

// legal characters per tile string index
const legalPerIndex = [
  /[KLMNPQRSTUVWX]/,
  /[23456]/,
  /[1234]/,
  /[1234]/,
  /[1234]/,
  /[ABCDEFGH]/,
  /[1234]/,
];
// possible level based on tile length, corrected later for LR tiles
const levelFromTileLength = [-1, -1, 0, 2, 4, 6, 8, 9];

/**
 * @param {string} tile tile name, e.g. /L4131E/
 * @returns Tile level index
 */
const getTileLevel = tile => {
  if (tile.length < 2 || tile.length > 7) {
    throw new Error(`tile ${tile} length must be 2..7`);
  }

  let LR = false;
  if (/LR/.test(tile[tile.length - 1])) {
    if (tile.length === 7) {
      throw new Error("tiles of length 7 may not end in L or R");
    }
    LR = true;
    tile = tile.substr(0, tile.length - 1);
  }

  for (let i = 0; i < tile.length; i += 1) {
    if (!legalPerIndex[i].test(tile[i])) {
      throw new Error(`illegal character ${tile[i]} (position ${i})`);
    }
  }

  return levelFromTileLength[tile.length] + (LR ? 1 : 0);
};
/**
 * @param {string} tile tile name, e.g. /L4131E/
 * @returns Tile size in meters, e.g. (6000, 6000), throws if broken tile
 */
const getTileSize = tile => {
  const tileLevel = getTileLevel(tile);
  return levelSizes[tileLevel];
};

/**
 * @param {*} x ETRS-TM35FIN x coordinate
 * @param {*} y ETRS-TM35FIN y coordinate
 */
const xyToTileParts = (x, y) => {
  const Ndist = y - refpos[1];
  const Edist = x - refpos[0];

  const N200 = divmod(Ndist, scaleSizes[200][1]);
  const E200 = divmod(Edist, scaleSizes[200][0]);

  const N100 = divmod(N200[1], scaleSizes[100][1]);
  const E100 = divmod(E200[1], scaleSizes[100][0]);

  const N50 = divmod(N100[1], scaleSizes[50][1]);
  const E50 = divmod(E100[1], scaleSizes[50][0]);

  const N25 = divmod(N50[1], scaleSizes[25][1]);
  const E25 = divmod(E50[1], scaleSizes[25][0]);

  const N10 = divmod(N25[1], scaleSizes[10][1]);
  const E10 = divmod(E25[1], scaleSizes[10][0]);

  const N5 = divmod(N10[1], scaleSizes[5][1]);
  const E5 = divmod(E10[1], scaleSizes[5][0]);

  const lookup = (grid, n, e) => grid[e][n];

  const tileParts = [
    rows200[N200[0]],
    E200[0].toString(),
    lookup(grid4, N100[0], E100[0]),
    lookup(grid4, N50[0], E50[0]),
    lookup(grid4, N25[0], E25[0]),
    lookup(grid8, N10[0], E10[0]),
    lookup(grid4, N5[0], E5[0]),
  ];

  return tileParts;
};

/**
 * @param {*} x ETRS-TM35FIN x coordinate
 * @param {*} y ETRS-TM35FIN y coordinate
 * @param {*} level Tile level (0..9)
 */
const xyToTile = (x, y, level = 9) => {
  const tile = xyToTileParts(x, y).join("");
  if (level < 9) {
    const shortened = shorten(tile);
    return shortened[level];
  }
  return tile;
};

const xOffsetMap = {
  ll: 0,
  l: 0,
  ul: 0,
  sw: 0,
  w: 0,
  nw: 0,
  u: 0.5,
  c: 0.5,
  d: 0.5,
  n: 0.5,
  0: 0.5,
  s: 0.5,
  lr: 1,
  r: 1,
  ur: 1,
  se: 1,
  e: 1,
  ne: 1,
};

const yOffsetMap = {
  ll: 0,
  d: 0,
  lr: 0,
  sw: 0,
  s: 0,
  se: 0,
  l: 0.5,
  c: 0.5,
  r: 0.5,
  w: 0.5,
  0: 0.5,
  e: 0.5,
  ul: 1,
  u: 1,
  ur: 1,
  nw: 1,
  n: 1,
  ne: 1,
};

/**
 *
 * @param {string} tile  tile name, e.g. /L4131F/
 * @param {*} corner corner of coordinate (ul/u/ur/l/c/r/ll/d/lr or nw/n/ne/w/0/e/sw/s/se)
 * @returns (x,y) coordinates within tile
 */
const tileToXy = (tile, corner = "sw") => {
  const tileLevel = getTileLevel(tile);
  const row200Num = rows200.indexOf(tile[0]);
  const col200Num = parseInt(tile[1], 10);

  let [x, y] = refpos; // lower left of "K0"

  y += row200Num * scaleSizes[200][1];
  x += col200Num * scaleSizes[200][0];

  if (tile.length > 2) {
    if (/[34R]/.test(tile[2])) {
      x += scaleSizes[100][0];
    }
    if (/[24]/.test(tile[2])) {
      y += scaleSizes[100][1];
    }
  }

  if (tile.length > 3) {
    if (/[34R]/.test(tile[3])) {
      x += scaleSizes[50][0];
    }
    if (/[24]/.test(tile[3])) {
      y += scaleSizes[50][1];
    }
  }

  if (tile.length > 4) {
    if (/[34R]/.test(tile[4])) {
      x += scaleSizes[25][0];
    }
    if (/[24]/.test(tile[4])) {
      y += scaleSizes[25][1];
    }
  }

  if (tile.length > 5) {
    let offset = 0;
    if (/[CD]/.test(tile[5])) offset = 1;
    if (/[EFR]/.test(tile[5])) offset = 2;
    if (/[GH]/.test(tile[5])) offset = 3;
    x += scaleSizes[10][0] * offset;
    if (/[BDFH]/.test(tile[5])) y += scaleSizes[10][1];
  }

  if (tile.length === 7) {
    if (/[3R]/.test(tile[6])) {
      x += scaleSizes[5][0];
    }
    if (/[24]/.test(tile[6])) {
      y += scaleSizes[5][1];
    }
  }

  // now x,y points to lower left of tile

  const xOff = xOffsetMap[corner];
  const yOff = yOffsetMap[corner];
  if (xOff === undefined || yOff === undefined) {
    throw new Error(`invalid corner ${corner}`);
  }

  x += levelSizes[tileLevel][0] * xOff;
  y += levelSizes[tileLevel][1] * yOff;
  return [x, y];
};

module.exports = {
  xyToTile,
  xyToTileParts,
  getTileLevel,
  getTileSize,
  tileToXy,
  shorten,
};
