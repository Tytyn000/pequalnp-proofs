// Lower bounds for binary monotone circuits computing a graph's edge function.
// Only the six-cycle base case uses a solver certificate.
const delta = new Set([0, 1, 3, 9]);
const bits = n => Array.from({length: n}, (_, i) => i);
const weight = mask => {
  let count = 0;
  for (; mask; mask &= mask - 1) count++;
  return count;
};

function incidence(lines, omitted = []) {
  return bits(12).flatMap(i => omitted.includes(i + 1) ? [] :
    lines.flatMap((line, j) => delta.has((i + 1 + line) % 13) ? [[i, 12 + j]] : []));
}

function createLowerBound(extraBase=()=>0,{absorbingCuts=false,earliestReads=false,keepBranches=true}={}){
const memo = new Map();
function lowerBound(raw) {
  if (!raw.length) return {lower: 0};
  const labels = [...new Set(raw.flat())].sort((a,b) => a - b);
  const index = new Map(labels.map((label, i) => [label, i]));
  const n = labels.length;
  const edges = raw.map(([a,b]) => [index.get(a), index.get(b)])
    .sort(([a,b], [c,d]) => a - c || b - d);
  const key = n + ':' + edges.map(([a,b]) => a * n + b).join(',');
  if (memo.has(key)) return memo.get(key);
  const known=extraBase(edges);
  if(known){const result={lower:known};memo.set(key,result);return result;}
  const neighbors = Array(n).fill(0);
  for (const [a,b] of edges) {
    neighbors[a] |= 1 << b;
    neighbors[b] |= 1 << a;
  }
  let reachable = 1;
  for (let step = 0; step < n; step++) {
    for (const i of bits(n)) if (reachable >> i & 1) reachable |= neighbors[i];
  }
  const degrees = neighbors.map(weight);
  if (n === 6 && reachable === 63 && degrees.every(d => d === 2)) return {lower: 8};

  function restrict(zero, one) {
    let singletons = 0;
    for (const i of bits(n)) if (one >> i & 1) singletons |= neighbors[i];
    if (singletons & one) return -Infinity;
    singletons &= ~(zero | one);
    const deleted = zero | one | singletons;
    const remainder = edges.filter(([a,b]) => !(deleted & ((1 << a) | (1 << b))));
    const count = weight(singletons);
    if (!remainder.length) return count ? count - 1 : -Infinity;
    return lowerBound(remainder).lower + count;
  }

  const individual = bits(n).map(i => [restrict(1 << i, 0), restrict(0, 1 << i)]);
  const branches = [[], []];
  const firstBranches = [];
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      const adjacent = Boolean(neighbors[a] >> b & 1);
      const outsideA = neighbors[a] & ~(1 << b);
      const outsideB = neighbors[b] & ~(1 << a);
      const pair = (1 << a) | (1 << b);
      const bestJoint = Math.max(...[0, 1 << a, 1 << b, pair]
        .map(one => restrict(pair ^ one, one)));
      for (const and of adjacent ? [0, 1] : [0]) {
        const extraA = Number(and ? degrees[a] > 1 : adjacent || Boolean(outsideA & ~outsideB));
        const extraB = Number(and ? degrees[b] > 1 : adjacent || Boolean(outsideB & ~outsideA));
        const jointReaders = Math.max(1 + Math.max(extraA, extraB),
          extraA && extraB && outsideA !== outsideB ? 3 : 1);
        const singleA = individual[a].map((l, value) => l + 1 + extraA + Number(value !== and));
        const singleB = individual[b].map((l, value) => l + 1 + extraB + Number(value !== and));
        const lower = Math.max(...singleA, ...singleB, bestJoint + jointReaders + 1);
        branches[and].push(lower);
        if(keepBranches)firstBranches.push({a, b, and, lower});
      }
    }
  }
  const result = {
    lower: Math.max(n - 1, ...individual.flat().map(x => x + 1), Math.min(...branches.flat()),
      ...(absorbingCuts?individual.map(row=>Math.min(...row)+2):[])),
    firstOr: Math.min(...branches[0]),
    firstAnd: Math.min(...branches[1]),
    firstBranches
  };
  if(earliestReads){
    function excludesSize(size){
      const forcedOr=individual.map(([zero])=>zero>=size-1);
      const once=individual.map(([zero,one],i)=>forcedOr[i]||
        (zero>=size-2&&one>=size-3)||(zero>=size-3&&one>=size-2));
      const singleMask=bits(n).reduce((mask,i)=>mask|(once[i]?1<<i:0),0);
      if(!singleMask)return false;
      if(edges.some(([a,b])=>!once[a]&&!once[b]))return false;
      for(const x of bits(n))if(once[x]){
        if(!forcedOr[x]&&!(neighbors[x]&singleMask))return false;
        for(const y of bits(n))if(x!==y){
          const sameOutside=(neighbors[x]&~(1<<y))===(neighbors[y]&~(1<<x));
          if(once[y]?sameOutside:!(neighbors[x]&~neighbors[y]))return false;
        }
      }
      return true;
    }
    const firstSize=result.lower;
    while(excludesSize(result.lower))result.lower++;
    if(result.lower>firstSize)result.earliestReadUpgrade=[firstSize,result.lower];
  }
  memo.set(key, result);
  return result;
}
return lowerBound;
}
const lowerBound=createLowerBound();

if(require.main===module){
const summary=({lower,firstOr,firstAnd})=>({lower,firstOr,firstAnd});
for (const [lines, omitted] of [
  [[2,4,5,6], [1,3,4,5]],
  [[2,4,5,7], [1,2,4,5,6,8,10]]
]) {
  const edges = incidence(lines);
  const active = [...new Set(edges.flat())].sort((a,b) => a - b);
  const fixed = active.map(vertex => {
    const left = edges.filter(edge => !edge.includes(vertex));
    const neighbors = new Set(edges.filter(edge => edge.includes(vertex))
      .map(edge => edge.find(v => v !== vertex)));
    const remainder = left.filter(edge => edge.every(v => !neighbors.has(v)));
    const zero = lowerBound(left).lower;
    const one = lowerBound(remainder).lower + neighbors.size;
    return {vertex, degree: neighbors.size, zero, one};
  });
  console.log(JSON.stringify({
    lines, full: summary(lowerBound(edges)), core: summary(lowerBound(incidence(lines, omitted))), fixed
  }));
}

// Check simultaneous restrictions of one private point at most on each line.
for (const lines of [[2,4,5,6],[2,4,5,7]]) {
  const edges = incidence(lines);
  const privateSites = [...new Set(edges.map(([point]) => point))].flatMap(point => {
    const incident = edges.filter(([a]) => a === point);
    return incident.length === 1 ? incident : [];
  });
  const bounds = {};
  for (let mask = 1; mask < 1 << privateSites.length; mask++) {
    const cut = privateSites.filter((_, i) => mask >> i & 1);
    if (new Set(cut.map(([,line]) => line)).size !== cut.length) continue;
    const deleted = new Set(cut.map(([point]) => point));
    const result = lowerBound(edges.filter(([point]) => !deleted.has(point))).lower;
    const key = cut.length + ':' + result;
    bounds[key] = (bounds[key] ?? 0) + 1;
    if (result < 18 - cut.length) throw Error('Cut does not saturate the gate budget');
  }
  console.log(JSON.stringify({lines, simultaneousCuts: bounds}));
}

for (const [lines, omitted] of [
  [[2,4,5,6], [1,3,4,5]],
  [[2,4,5,7], [1,2,4,5,6,8,10]],
  [[2,4,5,7], [1,2,4,5]]
]) {
  const edges = incidence(lines, omitted);
  const active = [...new Set(edges.flat())].sort((a,b) => a-b);
  const fixed = active.map(vertex => {
    const outside = edges.filter(edge => !edge.includes(vertex));
    const neighbors = new Set(edges.filter(edge => edge.includes(vertex))
      .map(edge => edge.find(v => v !== vertex)));
    const remaining = outside.filter(edge => edge.every(v => !neighbors.has(v)));
    return {vertex, degree: neighbors.size, zero: lowerBound(outside).lower,
      one: lowerBound(remaining).lower + neighbors.size};
  });
  console.log(JSON.stringify({lines, omitted, restricted: summary(lowerBound(edges)), fixed}));
}
}
module.exports={incidence,lowerBound,createLowerBound};
