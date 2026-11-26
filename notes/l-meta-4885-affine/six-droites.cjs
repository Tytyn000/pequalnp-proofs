const {incidence,createLowerBound}=require('./bornes-quatuors.cjs');
const {knownRestriction}=require('./cinq-droites.cjs');

function permutations(items){
  if(!items.length)return [[]];
  return items.flatMap((x,i)=>permutations(items.filter((_,j)=>i!==j)).map(rest=>[x,...rest]));
}
const permutationsFive=permutations([0,1,2,3,4]);
const bitCount=input=>{
  let count=0;
  for(let x=input;x;x&=x-1)count++;
  return count;
};
function pointMasks(edges, lines){
  const indices=new Map(lines.map((line,i)=>[line,i]));
  const groups=new Map();
  for(const [p,l] of edges)groups.set(p,(groups.get(p)??0)|(1<<indices.get(l)));
  return [...groups.values()];
}
function canonical(masks){
  let first=null;
  for(const p of permutationsFive){
    const key=masks.map(m=>p.reduce((a,to,from)=>a|((m>>from&1)<<to),0))
      .sort((a,b)=>a-b).join(',');
    if(first===null||key<first)first=key;
  }
  return first;
}
const references=new Map();
for(const [labels,omit,bound] of [
  [[2,4,5,6,7],[1,2,3,4,5,6],17],
  [[2,4,5,6,8],[3,4,6],19]
]){
  const edges=incidence(labels,omit), lines=[...new Set(edges.map(e=>e[1]))].sort((a,b)=>a-b);
  const masks=pointMasks(edges,lines);
  references.set(canonical(masks),bound);
}
function certifiedBase(edges){
  const lines=[...new Set(edges.map(e=>e[1]))].sort((a,b)=>a-b);
  if(lines.length!==5)return knownRestriction(edges);
  const masks=pointMasks(edges,lines);
  const shared=masks.filter(x=>bitCount(x)>1);
  const incidences=shared.reduce((a,b)=>a+bitCount(b),0);
  if(!((shared.length===6&&incidences===14)||(shared.length===8&&incidences===17)))return 0;
  const known=references.get(canonical(shared));
  return known?known+masks.length-shared.length:0;
}
const base=edges=>Math.max(certifiedBase(edges),certifiedBase(edges.map(([a,b])=>[b,a])));
const lowerBound=createLowerBound(base,{absorbingCuts:true,earliestReads:true});

function singleCuts(edges){
  return [...new Set(edges.flat())].sort((a,b)=>a-b).map(vertex=>{
    const neighbors=new Set(edges.filter(e=>e.includes(vertex)).map(e=>e.find(v=>v!==vertex)));
    const zero=edges.filter(e=>!e.includes(vertex));
    const one=zero.filter(e=>e.every(v=>!neighbors.has(v)));
    return {vertex,degree:neighbors.size,zero:lowerBound(zero).lower,
      one:lowerBound(one).lower+neighbors.size};
  });
}
function report(lines){
  const edges=incidence(lines);
  const privateLabels=[...new Set(edges.map(([p])=>p))].filter(p=>edges.filter(([x])=>x===p).length===1)
    .map(p=>p+1).sort((a,b)=>a-b);
  const core=edges.filter(([p])=>!privateLabels.includes(p+1));
  const summary=({lower,firstOr,firstAnd,earliestReadUpgrade})=>({lower,firstOr,firstAnd,earliestReadUpgrade});
  const bounds=summary(lowerBound(edges));
  return {lines,privateLabels,coreInputs:new Set(core.flat()).size,coreEdges:core.length,
    bounds,core:summary(lowerBound(core)),cuts:singleCuts(edges),coreCuts:singleCuts(core)};
}
if(require.main===module)for(const lines of [[2,4,5,6,7,8],[2,4,5,6,8,10]])console.log(JSON.stringify(report(lines)));
module.exports={base,lowerBound,singleCuts,report};
