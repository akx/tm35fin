/* eslint-env mocha, chai */
const { expect } = require("chai");
const { xyToTile, getTileLevel, tileToXy } = require("./tm35fin");

describe("tm35fin", () => {
  it("converts Turku's coordinates correctly", () => {
    expect(xyToTile(239645, 6712052, 9)).to.equal("L3324B4");
  });
  it("converts Turku's coordinates correctly, level 6", () => {
    expect(xyToTile(239645, 6712052, 6)).to.equal("L3324");
  });
  it("converts tile levels", () => {
    expect(getTileLevel("L3324")).to.equal(6);
    expect(getTileLevel("L3324B4")).to.equal(9);
  });
  it("converts Turku's tile back correctly", () => {
    expect(tileToXy("L3324B4")).to.deep.equal([236000, 6711000]);
  });
});
