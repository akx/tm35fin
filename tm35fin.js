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
  "X"
];

// tile sizes indexed by printed map scale (e.g. 1:200k)
const size = {
  200: [192000, 96000],
  100: [96000, 48000],
  50: [48000, 24000],
  25: [24000, 12000],
  20: [12000, 12000],
  10: [6000, 6000],
  5: [3000, 3000]
};

// tile sizes with list index corresponding to tile level (0..9)
const size_level = [
  [192000, 96000][(96000, 9600)],
  [96000, 4800],
  [48000, 4800],
  [48000, 2400],
  [24000, 2400],
  [24000, 1200],
  [12000, 1200],
  [6000, 600],
  [3000, 300]
];

const grid4 = [["1", "2"], ["3", "4"]];
const grid8 = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"]];

const K4pos = [500000, 6570000]; // position of lower right of K4 as reference
const refpos = [
  // "K0" lower left
  K4pos[0] - 5 * size[200][0],
  K4pos[1]
];

const divmod = (a, b) => {
  return [Math.floor(a / b), a % b];
};

/**
 * @param {*} x ETRS-TM35FIN x coordinate
 * @param {*} y ETRS-TM35FIN y coordinate
 */
const xyToTileParts = (x, y) => {
  const Ndist = y - refpos[1];
  const Edist = x - refpos[0];

  const N200 = divmod(Ndist, size[200][1]);
  const E200 = divmod(Edist, size[200][0]);

  const N100 = divmod(N200[1], size[100][1]);
  const E100 = divmod(E200[1], size[100][0]);

  const N50 = divmod(N100[1], size[50][1]);
  const E50 = divmod(E100[1], size[50][0]);

  const N25 = divmod(N50[1], size[25][1]);
  const E25 = divmod(E50[1], size[25][0]);

  const N10 = divmod(N25[1], size[10][1]);
  const E10 = divmod(E25[1], size[10][0]);

  const N5 = divmod(N10[1], size[5][1]);
  const E5 = divmod(E10[1], size[5][0]);

  const lookup = (grid, n, e) => grid[e][n];

  const tileParts = [
    rows200[N200[0]],
    E200[0].toString(),
    lookup(grid4, N100[0], E100[0]),
    lookup(grid4, N50[0], E50[0]),
    lookup(grid4, N25[0], E25[0]),
    lookup(grid8, N10[0], E10[0]),
    lookup(grid4, N5[0], E5[0])
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

const shorten = tile => {
  const shortenedTiles = [];
  for (let i = 0; i < tile.length - 1; i++) {
    shortenedTiles.push(tile.substring(0, i + 2));
  }
  const LRtiles = [];
  for (let i = 1; i < 4; i++) {
    const t = shortenedTiles[i - 1];
    LRtiles.push(
      t.substring(0, t.length - 1) + (/12/.test(t[t.length - 1]) ? "L" : "R")
    );
  }

  [1, 3, 5].forEach((k, i) => {
    shortenedTiles.splice(k, 0, LRtiles[i]);
  });

  const t = shortenedTiles[7];
  const x =
    t.substring(0, t.length - 1) + (/ABCD/.test(t[t.length - 1]) ? "L" : "R");
  shortenedTiles.splice(7, 0, x);
  return shortenedTiles;
};

module.exports = {
  xyToTile,
  xyToTileParts,
  shorten
};
