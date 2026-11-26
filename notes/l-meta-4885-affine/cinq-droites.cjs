const {incidence,createLowerBound}=require('./bornes-quatuors.cjs');

function permutations(items){
  if(!items.length)return [[]];
  return items.flatMap((item,i)=>permutations(items.filter((_,j)=>j!==i)).map(rest=>[item,...rest]));
}
const linePermutations=Array.from({length:6},(_,n)=>permutations(Array.from({length:n},(_,i)=>i)));

function neighborhoods(edges){
  const lines=[...new Set(edges.map(([,line])=>line))].sort((a,b)=>a-b);
  const index=new Map(lines.map((line,i)=>[line,i]));
  const byPoint=new Map();
  for(const [point,line] of edges)byPoint.set(point,(byPoint.get(point)??0)|(1<<index.get(line)));
  return {lines,masks:[...byPoint.values()]};
}
function canonical(n,masks){
  return linePermutations[n].map(perm=>masks.map(mask=>perm.reduce((out,to,from)=>
    out|((mask>>from&1)<<to),0)).sort((a,b)=>a-b).join(',')).sort()[0];
}
const weight=mask=>{
  let count=0;
  for(;mask;mask&=mask-1)count++;
  return count;
};
const references=new Map();
for(const [lines,omit,gates] of [
  [[2,4,5],[1,4,5,7,8,10],8],
  [[2,4,5,6],[1,3,4,5],15],
  [[2,4,5,7],[1,2,4,5,6,8,10],12],
  [[2,4,5,6],[1,3,4,5,7],13],
  [[2,4,5,6],[1,3,4,5,7,9],11]
]){
  const signature=neighborhoods(incidence(lines,omit));
  references.set(signature.lines.length+':'+canonical(signature.lines.length,signature.masks),gates);
}
const knownShapes=new Set(['3:3:6','4:6:12','4:4:9','4:5:10','4:4:8']);
function knownRestriction(edges){
  const {lines,masks}=neighborhoods(edges);
  const shared=masks.filter(mask=>weight(mask)>1);
  const shape=lines.length+':'+shared.length+':'+shared.reduce((sum,m)=>sum+weight(m),0);
  if(!knownShapes.has(shape))return 0;
  const bound=references.get(lines.length+':'+canonical(lines.length,shared));
  return bound?bound+masks.length-shared.length:0;
}
const lowerBound=createLowerBound(knownRestriction);

function restrictionBounds(edges){
  return [...new Set(edges.flat())].sort((a,b)=>a-b).map(vertex=>{
    const neighbors=new Set(edges.filter(e=>e.includes(vertex)).map(e=>e.find(v=>v!==vertex)));
    const outside=edges.filter(e=>!e.includes(vertex));
    const remaining=outside.filter(e=>e.every(v=>!neighbors.has(v)));
    return {vertex,degree:neighbors.size,zero:lowerBound(outside).lower,
      one:lowerBound(remaining).lower+neighbors.size};
  });
}
function report(lines){
  const edges=incidence(lines);
  const points=[...new Set(edges.map(([p])=>p))];
  const privatePoints=points.filter(p=>edges.filter(([a])=>a===p).length===1);
  const core=edges.filter(([p])=>!privatePoints.includes(p));
  const summary=({lower,firstOr,firstAnd})=>({lower,firstOr,firstAnd});
  const fullBound=summary(lowerBound(edges));
  const coreBound=summary(lowerBound(core));
  return {lines,privatePoints,coreVertices:new Set(core.flat()).size,coreEdges:core.length,
    fullBound,coreBound,cuts:restrictionBounds(edges),coreCuts:restrictionBounds(core)};
}
if(require.main===module)for(const lines of [[2,4,5,6,7],[2,4,5,6,8]])console.log(JSON.stringify(report(lines)));
module.exports={knownRestriction,lowerBound,restrictionBounds,report};
