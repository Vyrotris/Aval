const config = require('../data/config.json');

function getColor(name) {
  const color = config.colors[name];
  if (!color) throw new Error(`Color "${name}" not found in config`);
  if (typeof color === 'number') return color;
  if (typeof color === 'string') {
    let c = color;
    if (c.startsWith('#')) c = c.slice(1);
    else if (c.startsWith('0x')) c = c.slice(2);
    return parseInt(c, 16);
  }
  throw new TypeError('Color value must be a string or number');
}

module.exports = { getColor };