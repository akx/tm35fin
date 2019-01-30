const { expect } = require("chai");
const { xyToTile } = require("./tm35fin");

describe("tm35fin", () => {
  it("converts Turku's coordinates correctly", () => {
    expect(xyToTile(239645, 6712052, 9)).to.equal("L3324B4");
  });
  it("converts Turku's coordinates correctly, level 6", () => {
    expect(xyToTile(239645, 6712052, 6)).to.equal("L3324");
  });
});
