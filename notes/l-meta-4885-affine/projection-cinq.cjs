const assert = require('node:assert/strict');
const fs = require('node:fs');
const { incidence } = require('./bornes-quatuors.cjs');

const edges = incidence([2, 4, 5, 6, 7, 8, 10, 11, 12]);
const pointCount = 12;
const lineCount = 9;
const inputCount = pointCount + lineCount;
const range = size => Array.from({ length: size }, (_, i) => i);
const points = range(pointCount);
const lines = range(lineCount);
const inputs = range(inputCount);
const patterns = ['2+2+1', '2+1+1+1', '1+1+1+1+1'];
const additionalPatterns = ['3+2', '3+1+1', '4+1'];
const sixPatterns = ['3+3', '3+2+1', '3+1+1+1', '2+2+2', '2+2+1+1', '2+1+1+1+1', '1+1+1+1+1+1'];

function maximalNegatives() {
  const neighbors = points.map(point => edges.reduce((mask, [p, line]) =>
    p === point ? mask | (1 << (line - pointCount)) : mask, 0));
  const negatives = [];
  for (let mask = 0; mask < (1 << pointCount); mask++) {
    const forbidden = neighbors.reduce((blocked, row, point) =>
      ((mask >> point) & 1) ? blocked | row : blocked, 0);
    const allowed = ((1 << lineCount) - 1) ^ forbidden;
    if (neighbors.every((row, point) => ((mask >> point) & 1) || (row & allowed))) {
      negatives.push(mask | (allowed << pointCount));
    }
  }
  assert.equal(negatives.length, 197);
  return negatives;
}

class Cnf {
  constructor() {
    this.variableCount = 1;
    this.clauses = [[1]];
  }

  fresh() {
    return ++this.variableCount;
  }

  add(...literals) {
    if (!literals.includes(1)) this.clauses.push(literals.filter(literal => literal !== -1));
  }

  or(literals) {
    if (literals.includes(1)) return 1;
    const active = literals.filter(literal => literal !== -1);
    if (active.length <= 1) return active[0] ?? -1;
    const result = this.fresh();
    this.add(-result, ...active);
    for (const literal of active) this.add(-literal, result);
    return result;
  }

  and(literals) {
    return -this.or(literals.map(literal => -literal));
  }

  atMost(literals, limit) {
    if (limit >= literals.length) return;
    let thresholds = Array(limit + 2).fill(-1);
    thresholds[0] = 1;
    for (const literal of literals) {
      const next = [1];
      for (let i = 1; i < thresholds.length; i++) {
        const reached = this.fresh();
        this.add(-thresholds[i], reached);
        this.add(-thresholds[i - 1], -literal, reached);
        next.push(reached);
      }
      thresholds = next;
    }
    this.add(-thresholds[limit + 1]);
  }

  one(literals) {
    this.add(...literals);
    for (const [i, literal] of literals.entries()) {
      for (let j = 0; j < i; j++) this.add(-literal, -literals[j]);
    }
  }

  write(filename) {
    const body = this.clauses.map(clause => [...clause, 0].join(' ')).join('\n');
    fs.writeFileSync(filename, `p cnf ${this.variableCount} ${this.clauses.length}\n${body}\n`);
  }
}

function build(representatives, budget, hidden, unproductive, symbolic, mode) {
  const mixed = mode !== 'lines';
  const hasPoint = mode === 'mixed';
  const repeated = mode === 'repeat';
  const termCount = mode === 'eight' ? 8 : 9;
  assert.ok(representatives.length);
  assert.ok(Number.isInteger(budget) && budget >= 0);
  assert.ok([1, 2, 3].includes(hidden));
  assert.ok([0, 1, 2].includes(unproductive));
  const edgeCount = representatives[0].indices.length;
  assert.ok(edgeCount === 5 || (edgeCount === 6 && !mixed));
  for (const { indices } of representatives) {
    assert.equal(indices.length, edgeCount);
    assert.equal(new Set(indices).size, edgeCount);
    assert.ok(indices.every(i => Number.isInteger(i) && i >= 0 && i < edges.length));
    const affectedLines = lines.map(line => indices.filter(i => edges[i][1] === pointCount + line));
    assert.ok(affectedLines.every(group => group.length <= (mixed ? 4 : 3)));
  }

  const cnf = new Cnf();
  const fixed = new Set(representatives[0].indices);
  const isDeep = edges.map((_, i) => symbolic ? cnf.fresh() : fixed.has(i) ? 1 : -1);
  if (symbolic) {
    cnf.atMost(isDeep, edgeCount);
    const choices = representatives.map(({ indices }) => cnf.and(indices.map(i => isDeep[i])));
    cnf.add(...choices);
  }
  const vertices = repeated ? range(inputCount + lineCount) : mixed ? inputs : lines;
  const members = mixed ? inputs : points;
  const vertexOf = center => center >= inputCount ? center - lineCount : mixed ? center : pointCount + center;
  const centerActive = vertices.map(() => mixed ? cnf.fresh() : 1);
  if (mixed) {
    cnf.atMost(centerActive, termCount);
    cnf.atMost(centerActive.map(flag => -flag), vertices.length - termCount);
    if (hasPoint) {
      cnf.add(...centerActive.slice(0, pointCount));
      cnf.atMost(centerActive.slice(0, pointCount), 2);
    } else {
      for (const flag of centerActive.slice(0, pointCount)) cnf.add(-flag);
    }
    if (repeated) {
      cnf.one(centerActive.slice(inputCount));
      for (const center of vertices.slice(inputCount)) {
        cnf.add(-centerActive[center], centerActive[vertexOf(center)]);
      }
    }
  }
  const shallowFlags = vertices.map(center => members.map(neighbor => {
    const vertex = vertexOf(center);
    const i = edges.findIndex(([q, l]) => (q === vertex && l === neighbor) ||
      (l === vertex && q === neighbor));
    if (i === -1) return -1;
    if (!mixed) return -isDeep[i];
    const member = cnf.fresh();
    cnf.add(-member, -isDeep[i]);
    cnf.add(-member, centerActive[center]);
    return member;
  }));
  if (mixed) {
    for (const [i, [point, line]] of edges.entries()) {
      cnf.add(isDeep[i], shallowFlags[point][line], shallowFlags[line][point],
        repeated ? shallowFlags[line + lineCount][point] : -1);
    }
    for (const [center, flag] of centerActive.entries()) cnf.add(-flag, ...shallowFlags[center]);
  }
  const shallow = shallowFlags.map(row => members.filter(neighbor => row[neighbor] !== -1));
  const slots = range(Math.max(4, hidden + budget)).map(() => ({ isAnd: cnf.fresh(), isExtraOr: cnf.fresh() }));
  const extraFlags = slots.map(slot => slot.isExtraOr);
  const minimumExtraOr = Number(process.env.AFFINE_PROJECTED_OR_MIN ?? 0);
  assert.ok(Number.isInteger(minimumExtraOr) && minimumExtraOr >= 0 && minimumExtraOr <= budget);
  if (minimumExtraOr) cnf.atMost(extraFlags.map(flag => -flag), slots.length - minimumExtraOr);
  const maximumExtraOr = Number(process.env.AFFINE_PROJECTED_OR_MAX ?? budget);
  assert.ok(Number.isInteger(maximumExtraOr) && maximumExtraOr >= minimumExtraOr && maximumExtraOr <= budget);
  if (maximumExtraOr < budget) cnf.atMost(extraFlags, maximumExtraOr);
  const andFlags = slots.map(slot => slot.isAnd);
  cnf.atMost(andFlags, hidden);
  cnf.atMost(andFlags.map(flag => -flag), slots.length - hidden);
  const enabled = slots.map(({ isAnd, isExtraOr }) => {
    cnf.add(-isAnd, -isExtraOr);
    return cnf.or([isAnd, isExtraOr]);
  });

  const guardUses = vertices.map(() => slots.map(() => cnf.fresh()));
  const centers = vertices.map(() => {
    const choices = range(slots.length + 1).map(() => cnf.fresh());
    cnf.one(choices);
    return choices;
  });

  function newOperand(slot) {
    const direct = range(1 + inputCount + slot).map(() => cnf.fresh());
    const guardLine = vertices.map(() => cnf.fresh());
    const choices = [...direct, ...guardLine];
    cnf.one(choices);
    const fromGuard = cnf.or(guardLine);
    const member = members.map(() => cnf.fresh());
    const uses = range(slot).map(() => cnf.fresh());
    for (const flag of [...member, ...uses]) cnf.add(-flag, fromGuard);
    for (const [line, choice] of guardLine.entries()) {
      if (mixed) cnf.add(-choice, centerActive[line]);
      for (const point of members) {
        cnf.add(-choice, -member[point], shallowFlags[line][point]);
      }
      for (const [j, use] of uses.entries()) cnf.add(-choice, -use, guardUses[line][j]);
    }
    return { direct, fromGuard, member, uses, choices };
  }

  const operands = slots.map((_, slot) => [newOperand(slot), newOperand(slot)]);
  if (process.env.AFFINE_PROJECTED_CANONICAL === '1') {
    for (let i = 1; i < enabled.length; i++) cnf.add(-enabled[i], enabled[i - 1]);
    for (const [left, right] of operands) {
      for (const [i, choice] of left.choices.entries()) {
        cnf.add(-choice, ...right.choices.slice(i));
      }
    }
  }
  const extraOperands = range(unproductive).map(() => [newOperand(slots.length), newOperand(slots.length)]);

  function evaluateOperand(operand, primary, signals) {
    const candidates = [-1, ...primary, ...signals];
    const result = cnf.fresh();
    for (const [j, choice] of operand.direct.entries()) {
      const value = candidates[j];
      cnf.add(-choice, -result, value);
      cnf.add(-choice, result, -value);
    }
    const hits = members.filter(point => primary[point] === 1)
      .map(point => operand.member[point]);
    for (const [j, use] of operand.uses.entries()) hits.push(cnf.and([use, signals[j]]));
    cnf.add(-operand.fromGuard, -result, ...hits);
    for (const hit of hits) cnf.add(-operand.fromGuard, result, -hit);
    return result;
  }

  function evaluate(mask, suppressAnd) {
    const primary = inputs.map(i => (mask >> i) & 1 ? 1 : -1);
    const signals = [];
    for (const [i, slot] of slots.entries()) {
      const [left, right] = operands[i].map(operand => evaluateOperand(operand, primary, signals));
      const actOr = cnf.and([slot.isExtraOr, cnf.or([left, right])]);
      const actAnd = suppressAnd ? -1 : cnf.and([slot.isAnd, left, right]);
      signals.push(cnf.or([actOr, actAnd]));
    }
    const extraValues = extraOperands.map(pair => pair.map(operand => evaluateOperand(operand, primary, signals)));
    return { primary, signals, extraValues };
  }

  const singletonValues = inputs.map(i => evaluate(1 << i, true));
  const singletonRows = singletonValues.map(row => row.signals);
  for (const i of extraOperands.keys()) {
    cnf.add(...[0, 1].map(side => cnf.and(singletonValues.map(row => -row.extraValues[i][side]))));
  }
  const empty = slots.map((_, slot) => cnf.and(singletonRows.map(row => -row[slot])));
  const charges = [...extraFlags];
  for (const [line, shallowPoints] of shallow.entries()) {
    for (const [slot, use] of guardUses[line].entries()) {
      cnf.add(-use, enabled[slot]);
      if (mixed) cnf.add(-use, centerActive[line]);
      for (const vertex of inputs) {
        cnf.add(-use, -singletonRows[vertex][slot], shallowFlags[line][vertex] ?? -1);
      }
      for (const [i, point] of shallowPoints.entries()) {
        for (const other of shallowPoints.slice(0, i)) {
          cnf.add(-use, -singletonRows[point][slot], -singletonRows[other][slot]);
        }
      }
      if (!repeated) charges.push(cnf.and([use, empty[slot]]));
    }
    for (const [slot, choice] of centers[line].slice(1).entries()) {
      cnf.add(-choice, extraFlags[slot]);
      if (mixed) cnf.add(-choice, centerActive[line]);
      for (const vertex of inputs) {
        cnf.add(-choice, (vertex === vertexOf(line) ? 1 : -1) * singletonRows[vertex][slot]);
      }
    }
  }
  if (repeated) for (const vertex of inputs) for (const slot of slots.keys()) {
    const use = vertices.filter(center => vertexOf(center) === vertex)
      .map(center => guardUses[center][slot]);
    charges.push(cnf.and([cnf.or(use), empty[slot]]));
  }
  cnf.atMost(charges, budget);

  function enforce(mask, expected) {
    const { primary, signals, extraValues } = evaluate(mask, false);
    const lineTerms = vertices.map(line => {
      const alternatives = [primary[vertexOf(line)], ...signals];
      const center = cnf.or(centers[line].map((flag, i) => cnf.and([flag, alternatives[i]])));
      const guard = cnf.or([
        ...shallow[line].map(point => cnf.and([shallowFlags[line][point], primary[point]])),
        ...guardUses[line].map((flag, i) => cnf.and([flag, signals[i]])),
      ]);
      if (!expected) cnf.add(-centerActive[line], -center, -guard);
      return expected ? cnf.and([centerActive[line], center, guard]) : -1;
    });
    if (!expected) for (const pair of extraValues) cnf.add(...pair.map(literal => -literal));
    if (expected) cnf.add(...lineTerms, ...extraValues.map(pair => cnf.and(pair)));
  }
  for (const i of symbolic ? range(edges.length) : fixed) {
    const [point, line] = edges[i];
    enforce((1 << point) | (1 << line), true);
  }
  for (const mask of maximalNegatives()) enforce(mask, false);

  return { cnf, slots, guardUses, centers, operands, extraOperands, centerActive, shallowFlags };
}

const [catalog, selection, filename, budgetArg = '2', hiddenArg = '2', unproductiveArg = '0', centerMode = 'lines'] = process.argv.slice(2);
const symbolic = selection === 'all' || [...patterns, ...additionalPatterns, ...sixPatterns].includes(selection);
if (!filename || (!symbolic && !/^\d+$/.test(selection))) {
  throw Error('Usage: node projection-cinq.cjs <orbits.json> <orbit number|all|partition> <output.cnf> [budget] [internal ANDs] [unproductive AND] [lines|mixed|eight|repeat]');
}
const { representatives } = JSON.parse(fs.readFileSync(catalog, 'utf8'));
const group = representatives[0]?.indices.length === 6 ? sixPatterns : patterns;
const allowed = symbolic
  ? representatives.filter(row => selection === 'all' ? group.includes(row.pattern) : row.pattern === selection)
  : [representatives[Number(selection) - 1]];
if (allowed.some(row => !row)) throw Error('Unknown orbit number');
const budget = Number(budgetArg);
const hidden = Number(hiddenArg);
const unproductive = Number(unproductiveArg);
assert.ok(['lines', 'mixed', 'eight', 'repeat'].includes(centerMode));
const supported = centerMode === 'mixed' ? additionalPatterns : ['4+1'];
if (centerMode !== 'lines' && !allowed.every(row => supported.includes(row.pattern))) {
  throw Error('Unsupported representative for this center mode');
}
const { cnf, ...mapping } = build(allowed, budget, hidden, unproductive, symbolic, centerMode);
cnf.write(filename);
const orbit = symbolic ? { selection, count: allowed.length } : allowed[0];
fs.writeFileSync(filename + '.map', JSON.stringify({ ...mapping, ...orbit, budget, hidden, unproductive }) + '\n');
console.log(JSON.stringify({
  selection, ...orbit, budget, hidden, unproductive, vars: cnf.variableCount, clauses: cnf.clauses.length,
}));
