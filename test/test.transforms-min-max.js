var fs = require("fs");
var PCMTransform = require("../");
var expect = require("chai").expect;
var utils = require("./utils");
var equals = require("array-equal");

var UP_SLOPE = Array.prototype.slice.call(utils.BUFFERS.SAW_UP);
var DOWN_SLOPE = Array.prototype.slice.call(utils.BUFFERS.SAW_DOWN);

UP_SLOPE.splice(20);
DOWN_SLOPE.splice(20);

describe("transforms - min-max", function () {
  it("returns a min/max duple from every batch (batchSize: 1) (out of phase waves in L/R)", function (done) {
    var data = [];
    var buffer = utils.stereoMix(utils.BUFFERS.SAW_UP, utils.BUFFERS.SAW_DOWN);
    utils.createReadStream(buffer)
      .pipe(PCMTransform({ batchSize: 1, transform: "min-max" }))
      .on("data", function (d) { data.push(d); })
      .on("finish", end);

    function end () {
      expect(data.length).to.be.equal(200);
      var merged = Buffer.concat(data, 800);
      for (var i = 0; i < merged.length; i += 4) {
        var min = merged.readInt16LE(i);
        var max = merged.readInt16LE(i + 2);
        expect(min).to.be.equal(DOWN_SLOPE[(i?i/4:0)%20]);
        expect(max).to.be.equal(UP_SLOPE[(i?i/4:0)%20]);
      }
      done();
    }
  });

  it("returns a min/max duple from every batch (batchSize: 10) (out of phase waves in L/R)", function (done) {
    var data = [];
    var buffer = utils.stereoMix(utils.BUFFERS.SAW_UP, utils.BUFFERS.SAW_DOWN);
    utils.createReadStream(buffer)
      .pipe(PCMTransform({ batchSize: 5, transform: "min-max" }))
      .on("data", function (d) { data.push(d); })
      .on("finish", end);

    var slopes = [
      [-13107, 13106],
      [-29491, 29490],
      [-32767, 32767],
      [-16384, 16383]
    ];
    function end () {
      expect(data.length).to.be.equal(40);
      var merged = Buffer.concat(data, 160);
      for (var i = 0; i < merged.length; i += 4) {
        var min = merged.readInt16LE(i);
        var max = merged.readInt16LE(i + 2);
        expect(min).to.be.equal(slopes[(i?i/4:0)%4][0]);
        expect(max).to.be.equal(slopes[(i?i/4:0)%4][1]);
      }
      done();
    }
  });
});