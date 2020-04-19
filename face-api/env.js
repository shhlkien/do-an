require('@tensorflow/tfjs-node');
const { Canvas, Image, ImageData, loadImage } = require('canvas');
const { env } = require('face-api.js');

env.monkeyPatch({ Canvas, Image, ImageData });

module.exports = loadImage;