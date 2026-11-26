const assert = require('node:assert/strict');
const gates = require('./witness-affine-44-complet.json');

const inputCount = 21;
const differenceSet = new Set([0, 1, 3, 9]);
const lines = Array.from({ length: 13 }, (_, line) => line)
  .filter(line => !differenceSet.has(line));
const pointMasks = lines.map(line => {
  let mask = 0;
  for (let point = 1; point <= 12; point++) {
    if (differenceSet.has((point + line) % 13)) mask |= 1 << (point - 1);
  }
  return mask;
});
assert.equal(gates.length, 44);
for (const [i, [op, a, b]] of gates.entries()) {
  assert.ok(op === 'and' || op === 'or');
  for (const operand of [a, b]) {
    assert.ok(Number.isInteger(operand) && operand >= 0 && operand < inputCount + i);
  }
}

const values = new Uint8Array(inputCount + gates.length);
for (let mask = 0; mask < 1 << inputCount; mask++) {
  for (let wire = 0; wire < inputCount; wire++) {
    values[wire] = (mask >>> wire) & 1;
  }
  for (let i = 0; i < gates.length; i++) {
    const [op, a, b] = gates[i];
    values[inputCount + i] = op === 'and' ? values[a] & values[b] : values[a] | values[b];
  }
  const expected = pointMasks.some((points, j) => ((mask >>> (12 + j)) & 1) && (mask & points));
  assert.equal(Boolean(values.at(-1)), expected, `input mask ${mask}`);
}
console.log(`Verified ${1 << inputCount} assignments for the 44-gate witness.`);
