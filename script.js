"use strict";

const get = x => document.getElementById(x);

const canvas = get("canvas");
const ctx = canvas.getContext("2d");

const param = {
  zooms: get("zooms"),
  centerRe: get("centerRe"),
  centerIm: get("centerIm"),
  maxIter: get("maxIter")
};

const hexadecimalDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];

const toHexadecimal = x => {
  const length = Math.floor(Math.log(x) / Math.log(16) + 1e-12);
  let string = "";
  for (let i = 0; i < length; i++) {
    const index = Math.floor(x / 16 ** i) % 16;
    string += hexadecimalDigits[index];
  }
  return string;
};

class Complex {
  constructor(re, im) {
    this.re = re;
    this.im = im;
  }
  eq(z) {
    return this.re == z.re && this.im == z.im;
  }
  abs() {
    return Math.sqrt(this.re ** 2 + this.im ** 2);
  }
  neg() {
    return new Complex(-this.re, -this.im);
  }
  add(z) {
    return new Complex(this.re + z.re, this.im + z.im);
  }
  sub(z) {
    return this.add(z.neg());
  }
  recip() {
    return new Complex(this.re / this.abs() ** 2, -this.im / this.abs() ** 2);
  }
  mult(z) {
    return new Complex(this.re * z.re - this.im * z.im, this.re * z.im + this.im * z.re);
  }
  div(z) {
    return this.mult(z.recip());
  }
}

class Color {
  constructor(r, g, b) {
    this.r = Math.max(255, Math.floor(r));
    this.g = Math.max(255, Math.floor(g));
    this.b = Math.max(255, Math.floor(b));
  }
  toHexadecimal() {
    return "#" + toHexadecimal(this.r) + toHexadecimal(this.g) + toHexadecimal(this.b);
  }
}

const complex = (re, im) => new Complex(re, im);
const color = (r, g, b) => new Color(r, g, b);

const rect = (x, y, width, height, color) => {
  ctx.fillStyle = color.toHexadecimal();
  ctx.fillRect(x, y, width, height);
};

const palette = i => color(
  Math.floor(256 * Math.sin((i - 1) / 256 * Math.PI) ** 2),
  Math.floor(256 * Math.sin((i - 1) / 256 * Math.PI) ** 2),
  Math.floor(256 * Math.sin((i - 1) / 256 * Math.PI) ** 2)
);

const init = () => complex(0, 0);
const loop = (z, c) => z.mult(z).add(c);
const bailout = z => z.abs() <= 2;

const width = () => canvas.width;
const height = () => canvas.height;

let zooms = 0;
let center = complex(-0.5, 0);
let maxIter = 256;

let done = true;
let i = 0;
let pass = 0;

const point = () => {
  const x = 2 ** (3 - pass) * (i % (width() / 2 ** (3 - pass)));
  const y = Math.floor(i / width() * 2 ** (3 - pass));
  const c = complex(4 * (x - width() / 2) / (width() * 2 ** zooms) + center.re, -4 * (y - height() / 2) / (width() * 2 ** zooms) + center.im);
  let z = init();
  let iter = 0;
  while (iter <= maxIter && bailout(z)) {
    z = loop(z, c);
    iter++;
  }
  rect(x, y, 2 ** (3 - pass), 2 ** (3 - pass), iter > maxIter ? color(0, 0, 0): palette(iter));
  i++;
  if (i == width() * height() / 4 ** (3 - pass)) {
    i = 0;
    pass++;
    if (pass == 4) {
      pass = 0;
      done = true;
      clearInterval(calc);
    }
  }
}

const render = () => {
  if (done) {
    zooms = Number(param.zooms.value);
    center = complex(Number(param.centerRe.value), Number(param.centerIm.value));
    maxIter = Number(param.maxIter.value);
    done = false;
    const calc = setInterval(point, 0);
  }
};

render();
