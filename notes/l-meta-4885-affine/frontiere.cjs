const fs = require('node:fs');
const delta=new Set([0,1,3,9]);
const omittedPoint=process.env.AFFINE_REMOVE_POINT;
const omittedPoints=new Set(process.env.AFFINE_REMOVE_POINTS?process.env.AFFINE_REMOVE_POINTS.split(',').map(Number):[]);
const selectedLines=process.env.AFFINE_ONLY_LINES?.split(",").map(Number);
const lines=Array.from({length:13},(_,v)=>v).filter(v=>!delta.has(v)&&(!selectedLines||selectedLines.includes(v)));
const points=Array.from({length:12},(_,v)=>v+1)
  .filter(v=>String(v)!==omittedPoint && !omittedPoints.has(v) && (!selectedLines||lines.some(line=>delta.has((v+line)%13))));
const half=points.length, rightSize=lines.length, n=half+rightSize;
const block=(1<<half)-1, rightBlock=(1<<rightSize)-1;
const edges=[], rows=Array(half).fill(0);
for(let a=0;a<half;a++)for(let b=0;b<rightSize;b++)if(delta.has((points[a]+lines[b])%13)){
  edges.push([a,half+b]); rows[a]|=1<<b;
}
function fullNegativeProjections(){
  if(!selectedLines||selectedLines.length!==2)throw Error("The projected objective needs two lines");
  const allLines=Array.from({length:13},(_,i)=>i).filter(i=>!delta.has(i));
  const allRows=Array.from({length:12},(_,i)=>allLines.reduce((mask,l,j)=>
    delta.has((i+1+l)%13)?mask|(1<<j):mask,0));
  const weights=new Map();
  for(let left=0;left<4096;left++){
    let blocked=0;
    for(let p=0;p<12;p++)if(left&(1<<p))blocked|=allRows[p];
    const right=511^blocked;
    if(!allRows.every((row,p)=>(left&(1<<p))||(row&right)))continue;
    let mask=0;
    points.forEach((p,i)=>{if(left&(1<<(p-1)))mask|=1<<i;});
    lines.forEach((l,i)=>{if(right&(1<<allLines.indexOf(l)))mask|=1<<(half+i);});
    weights.set(mask,(weights.get(mask)??0)+1);
  }
  if([...weights.values()].reduce((sum,v)=>sum+v,0)!==197)throw Error("Missing affine negatives");
  return weights;
}
function automorphisms(){
  if(omittedPoint||omittedPoints.size||selectedLines)throw Error("Second-gate symmetry uses the complete affine graph");
  const rowIndex=new Map(rows.map((row,i)=>[row,i])), permutations=[], perm=[];
  function visit(used){
    if(perm.length===rightSize){
      const left=rows.map(row=>rowIndex.get(perm.reduce((mask,b,a)=>
        row&(1<<a)?mask|(1<<b):mask,0)));
      if(!left.includes(undefined))permutations.push([...left,...perm.map(b=>half+b),n]);
      return;
    }
    for(let j=0;j<rightSize;j++)if(!(used&(1<<j))){
      perm.push(j); visit(used|(1<<j)); perm.pop();
    }
  }
  visit(0);
  return permutations;
}
function possibleTightBridge(indices){
  const deepEdges=indices.map(i=>edges[i]);
  return rows.some((neighbors,point)=>deepEdges.every(([q,line])=>
    q!==point&&(neighbors&(1<<(line-half)))
  ))||lines.some((_,i)=>deepEdges.every(([point,line])=>
    line!==half+i&&(rows[point]&(1<<i))
  ));
}
function possibleDoubleStar(indices){
  const selected=indices.map(i=>edges[i]);
  const points=new Set(selected.map(([point])=>point));
  const lines=new Set(selected.map(([,line])=>line));
  const allLines=Array.from(lines).reduce((mask,line)=>mask|(1<<(line-half)),0);
  const universalPoints=new Set(Array.from(points).filter(point=>(rows[point]&allLines)===allLines));
  const universalLines=new Set(Array.from(lines).filter(line=>
    Array.from(points).every(point=>rows[point]&(1<<(line-half)))
  ));
  return selected.every(([point,line])=>universalPoints.has(point)||universalLines.has(line));
}
function deepEdgeOrbits(edgeCount){
  if(edges.length!==36||![4,5,6].includes(edgeCount))
    throw Error('Deep-edge orbits require four to six edges of the complete affine graph');
  const edgeIndices=new Map(edges.map((edge,i)=>[edge.join(','),i]));
  const images=automorphisms().map(permutation=>edges.map(([point,line])=>
    edgeIndices.get([permutation[point],permutation[line]].join(','))
  ));
  if(!images.length||images.some(image=>new Set(image).size!==edges.length||image.includes(undefined)))
    throw Error('Expected permutations of all 36 edges');
  const seen=new Set(), representatives=[], selected=[];
  function visit(start){
    if(selected.length<edgeCount){
      const last=edges.length-edgeCount+selected.length;
      for(let i=start;i<=last;i++){
        selected.push(i);
        visit(i+1);
        selected.pop();
      }
      return;
    }
    const key=selected.join(',');
    if(seen.has(key))return;
    const orbit=new Set(images.map(image=>selected.map(i=>image[i]).sort((x,y)=>x-y).join(',')));
    if(!orbit.has(key)||images.length%orbit.size)
      throw Error('Invalid orbit for the affine automorphism group');
    for(const member of orbit)seen.add(member);
    const byLine=new Map();
    for(const i of selected){
      const line=edges[i][1];
      byLine.set(line,(byLine.get(line)??0)+1);
    }
    const pattern=[...byLine.values()].sort((x,y)=>y-x).join('+');
    const representative={indices:[...selected],pattern,size:orbit.size};
    if(edgeCount===4)representative.tightBridge=possibleTightBridge(selected);
    else if(edgeCount===5)representative.doubleStar=possibleDoubleStar(selected);
    representatives.push(representative);
  }
  visit(0);
  const expected={4:58905,5:376992,6:1947792}[edgeCount];
  if(seen.size!==expected||representatives.reduce((sum,rep)=>sum+rep.size,0)!==seen.size)
    throw Error('Expected a partition of all deep-edge sets');
  return {automorphismCount:images.length,representatives};
}
function quartetAutomorphisms(){
  function permutations(items){
    if(!items.length)return [[]];
    return items.flatMap((item,i)=>permutations(items.filter((_,j)=>i!==j)).map(t=>[item,...t]));
  }
  if(n===8&&process.env.AFFINE_CORE_FULL_SYMMETRY==='1'){
    const edgeKeys=new Set(edges.map(([a,b])=>a*n+b));
    return permutations(Array.from({length:n},(_,i)=>i)).filter(p=>
      edges.every(([a,b])=>edgeKeys.has(Math.min(p[a],p[b])*n+Math.max(p[a],p[b])))).map(p=>[...p,n]);
  }
  const groups=new Map();
  for(const [point,mask] of rows.entries())groups.set(mask,[...(groups.get(mask)??[]),point]);
  const result=[];
  for(const linePermutation of permutations(Array.from({length:rightSize},(_,i)=>i))){
    let pointPermutations=[[]];
    for(const [mask,from] of groups){
      const transformed=linePermutation.reduce((acc,to,j)=>acc|((mask>>j&1)<<to),0);
      const targets=groups.get(transformed);
      if(targets?.length!==from.length){pointPermutations=[];break;}
      pointPermutations=pointPermutations.flatMap(assigned=>
        permutations(targets).map(to=>[...assigned,...from.map((p,i)=>[p,to[i]])]));
    }
    for(const pointPermutation of pointPermutations){
      const mapping=Array.from({length:n+1},(_,i)=>i);
      for(const [from,to] of pointPermutation)mapping[from]=to;
      linePermutation.forEach((to,from)=>{mapping[half+from]=half+to;});
      result.push(mapping);
    }
  }
  return result;
}
function canonicalSecond(a,b){
  const stabilizer=automorphisms().filter(p=>(p[a]===a&&p[b]===b)||(p[a]===b&&p[b]===a));
  const pairs=[];
  for(let x=0;x<=n;x++)for(let y=x+1;y<=n;y++){
    const key=x*(n+1)+y;
    if(stabilizer.every(p=>key<=Math.min(p[x],p[y])*(n+1)+Math.max(p[x],p[y])))pairs.push([x,y]);
  }
  return {size:stabilizer.length,pairs};
}
const pos=edges.map(([a,b])=>(1<<a)|(1<<b));
const neg=[];
for(let s=0;s<=block;s++){
  let covers=0;
  for(let a=0;a<half;a++)if(s>>a&1)covers|=rows[a];
  const t=rightBlock^covers;
  if(rows.every((row,a)=>(s>>a&1)||(row&t)))neg.push(s|(t<<half));
}
const rand=x=>Math.imul(x^0x45d9f3b,0x9e3779b1)>>>0;
const examples=[...pos.map(m=>[m,true]),...neg.slice().sort((a,b)=>rand(a)-rand(b)).map(m=>[m,false])];
function secondCandidates(a,b,firstOp){
  const states=examples.map(([mask])=>{
    const w=Array.from({length:n},(_,i)=>Boolean(mask>>i&1));
    w.push(firstOp==="and"?w[a]&&w[b]:w[a]||w[b]);
    return w;
  });
  const choices=[];
  for(const [u,v] of canonicalSecond(a,b).pairs){
    if(!states.some(w=>w[u]&&!w[v])||!states.some(w=>!w[u]&&w[v]))continue;
    for(const op of ["and","or"]){
      const signal=states.map(w=>op==="and"?w[u]&&w[v]:w[u]||w[v]);
      if(!signal.slice(0,pos.length).some(Boolean)||signal.slice(pos.length).every(Boolean))continue;
      if(Array.from({length:n+1},(_,i)=>i).some(i=>states.every((row,k)=>row[i]===signal[k])))continue;
      choices.push({u,v,op,usesFirst:v===n});
    }
  }
  return choices;
}
function failures(gates){
  const observed=examples;
  const mis=observed.filter(([m,target])=>{
    const w=Array.from({length:n},(_,v)=>Boolean(m>>v&1));
    for(const [op,a,b] of gates)w.push(op==='and'?w[a]&&w[b]:w[a]||w[b]);
    return w.at(-1)!==target;
  });
  return mis;
}
function test(gates){
  return {positive:pos.length,negative:neg.length,gates:gates.length,mismatches:failures(gates).length};
}
function control(){
  const g=[], add=(o,a,b)=>n+g.push([o,Math.min(a,b),Math.max(a,b)])-1;
  const terms=[];
  for(let b=half;b<n;b++){
    const leaves=edges.filter(e=>e[1]===b).map(e=>e[0]);
    terms.push(add('and',b,leaves.reduce((a,c)=>add('or',a,c))));
  }
  terms.reduce((a,b)=>add('or',a,b));
  return g;
}
function redundantControl(){
  const inner=control();
  const result=[['or',0,1],...inner.map(([op,a,b])=>[op,a+(a>=n),b+(b>=n)])];
  const original=n+result.length-1;
  result.push(['or',n,original],['and',original,original+1]);
  return result;
}
function orderedControl(original=control()) {
  const translation = new Map(Array.from({ length: n }, (_, i) => [i, i]));
  const remaining = new Set(original.map((_, i) => n + i));
  const ordered = [];
  while (remaining.size > 0) {
    const ready = [...remaining].flatMap(id => {
      const [op, a, b] = original[id - n];
      if (!translation.has(a) || !translation.has(b)) return [];
      const left = translation.get(a), right = translation.get(b);
      return [{ id, op, a: Math.min(left, right), b: Math.max(left, right) }];
    });
    ready.sort((u, v) => u.a - v.a || u.b - v.b || u.id - v.id);
    const { id, op, a, b } = ready[0];
    translation.set(id, n + ordered.length);
    remaining.delete(id);
    ordered.push([op, a, b]);
  }
  if (translation.get(n + original.length - 1) !== n + ordered.length - 1) {
    throw Error('Output mapping changed');
  }
  return ordered;
}
function symmetricControl(seedA,seedB){
  const reference=control();
  const a=reference[0][1], b=reference[0][2];
  const candidates=automorphisms().filter(p=>
    (p[a]===seedA&&p[b]===seedB)||(p[a]===seedB&&p[b]===seedA));
  let best=null, bestKey=null;
  for(const perm of candidates){
    const mapped=new Map(Array.from({length:n},(_,i)=>[i,perm[i]]));
    const ordered=[['or',seedA,seedB]];
    mapped.set(n,n);
    const remaining=new Set(reference.slice(1).map((_,j)=>n+j+1));
    while(remaining.size){
      const ready=[...remaining].flatMap(i=>{
        const [op,a,b]=reference[i-n];
        if(!mapped.has(a)||!mapped.has(b))return [];
        return [{i,op,a:Math.min(mapped.get(a),mapped.get(b)),b:Math.max(mapped.get(a),mapped.get(b))}];
      });
      ready.sort((u,v)=>u.a-v.a||u.b-v.b||u.i-v.i);
      const {i,op,a,b}=ready[0];
      mapped.set(i,n+ordered.length); remaining.delete(i); ordered.push([op,a,b]);
    }
    const key=ordered.map(g=>String(g[1]).padStart(2,"0")+String(g[2]).padStart(2,"0")).join("");
    if(bestKey===null||key<bestKey){best=ordered;bestKey=key;}
  }
  if(!best)throw Error("The known circuit has a different first-gate orbit");
  return best;
}
function relaxedControl(seedA,seedB,seedOp){
  const program=[[seedOp,seedA,seedB]];
  const add=(op,a,b)=>n+program.push([op,Math.min(a,b),Math.max(a,b)])-1;
  const fold=(op,values)=>values.reduce((a,b)=>add(op,a,b));
  const left=Array.from({length:half},(_,i)=>i);
  const right=Array.from({length:rightSize},(_,i)=>i+half);
  const chosen=neg.filter(m=>m!==block&&m!==(rightBlock<<half))
    .sort((a,b)=>b.toString(2).replaceAll('0','').length-a.toString(2).replaceAll('0','').length||a-b)[0];
  const remaining=Array.from({length:n},(_,i)=>i).filter(i=>!(chosen>>i&1));
  const isOr=seedOp==="or";
  const l=fold("or",isOr?[n,...left.filter(i=>i!==seedA&&i!==seedB)]:left);
  const r=fold("or",right);
  const g=add("and",0,1), h=add("or",l,g);
  const cleanLeft=isOr?add("or",h,add("and",2,3)):h;
  const extra=fold("or",remaining);
  let output=fold("and",[cleanLeft,r,extra]);
  if(!isOr)output=add("or",output,n);
  const gateCount=program.length;
  while(program.length<43)output=add("or",output,output);
  const mapping=new Map(Array.from({length:n+1},(_,i)=>[i,i]));
  const ordered=[program[0]];
  const pending=new Set(program.slice(1).map((_,i)=>n+i+1));
  while(pending.size){
    const ready=[...pending].flatMap(i=>{
      const [op,x,y]=program[i-n];
      if(!mapping.has(x)||!mapping.has(y))return [];
      return [{i,op,x:Math.min(mapping.get(x),mapping.get(y)),y:Math.max(mapping.get(x),mapping.get(y))}];
    });
    ready.sort((u,v)=>u.x-v.x||u.y-v.y||u.i-v.i);
    const {i,op,x,y}=ready[0];
    mapping.set(i,n+ordered.length); pending.delete(i); ordered.push([op,x,y]);
  }
  return {gates:ordered,actualGates:gateCount,samples:[block,rightBlock<<half,chosen]};
}
function verifyMaximalIndependent() {
  const col = Array(rightSize).fill(0);
  for (const [a, b] of edges) col[b - half] |= 1 << a;
  const mirror = new Set();
  for (let right = 0; right <= rightBlock; right++) {
    let blocked = 0;
    for (let b = 0; b < rightSize; b++) if (right & (1 << b)) blocked |= col[b];
    const left = block ^ blocked;
    if (col.every((bits, b) => (right & (1 << b)) || (bits & left))) {
      mirror.add(left | (right << half));
    }
  }
  if (mirror.size !== neg.length || !neg.every(mask => mirror.has(mask))) {
    throw Error('The two enumerations disagree');
  }
}
const args=process.argv.slice(2), cmd=args[0];
if(cmd==='relaxed-control'){
  const [path,a,b,op]=args.slice(1);
  const data=relaxedControl(Number(a),Number(b),op);
  fs.writeFileSync(path+'.json',JSON.stringify(data.gates)+'\n');
  fs.writeFileSync(path+'.samples.json',JSON.stringify(data.samples)+'\n');
  console.log(JSON.stringify({actualGates:data.actualGates,samples:data.samples,...test(data.gates)}));
} else if(cmd==='boundary-masks'){
  console.log(JSON.stringify({positives:pos,negatives:neg}));
} else if(cmd==='failures'){
  const gates=JSON.parse(fs.readFileSync(args[1],'utf8'));
  const bad=failures(gates);
  console.log(JSON.stringify({incorrectPositives:bad.filter(([,positive])=>positive).map(([mask])=>mask),
    incorrectNegatives:bad.filter(([,positive])=>!positive).map(([mask])=>mask)}));
} else if(cmd==='seconds'){
  for(const [a,b,op] of [[0,1,'or'],[0,2,'or'],[0,12,'or'],[0,12,'and'],[0,13,'or'],[12,13,'or']]){
    const choices=secondCandidates(a,b,op);
    const counts=[true,false].flatMap(dep=>['and','or'].map(op=>
      choices.filter(c=>c.usesFirst===dep&&c.op===op).length));
    console.log(JSON.stringify({first:[a,b,op],usesAnd:counts[0],usesOr:counts[1],externalAnd:counts[2],externalOr:counts[3]}));
  }
} else if(['four-deep-orbits','five-deep-orbits','six-deep-orbits'].includes(cmd)){
  const {automorphismCount,representatives}=deepEdgeOrbits({'four-deep-orbits':4,'five-deep-orbits':5,'six-deep-orbits':6}[cmd]);
  console.log(JSON.stringify({automorphismCount,representatives},null,2));
} else if(cmd==='orbits'){
  for(const [a,b] of [[0,1],[0,2],[0,12],[0,13],[12,13]]){
    const {size,pairs}=canonicalSecond(a,b);
    console.log(JSON.stringify({first:[a,b],stabilizer:size,secondPairs:pairs.length}));
  }
} else if(cmd==='control'){
  verifyMaximalIndependent();
  let g=process.env.AFFINE_ORDERED_CONTROL==='1'?orderedControl():control();
  if(process.env.AFFINE_QUARTET_ORBITS==='1'){
    if(![4,5,6].includes(lines.length))throw Error('Local control needs four, five or six lines');
    const key=program=>program.flatMap(([,a,b])=>[a,b].map(x=>String(x).padStart(2,'0'))).join('');
    const candidates=quartetAutomorphisms().map(p=>orderedControl(g.map(([op,a,b])=>
      [op,a<n?p[a]:a,b<n?p[b]:b])));
    g=candidates.reduce((best,candidate)=>key(candidate)<key(best)?candidate:best);
  }
  console.log(JSON.stringify(test(g)));
  const witness=args[1]??(omittedPoints.size?'witness-points-removed.json':selectedLines?'witness-two-lines-9.json':omittedPoint?'witness-point-removed.json':'witness-44.json');
  fs.writeFileSync(witness,JSON.stringify(g));} else if(cmd==='build'){
  const [file,sArg,countArg,mode,seedLeft,seedRight,seedOp,probesArg]=args.slice(1);
  const s=Number(sArg), count=Number(countArg), probes=Number(probesArg??4);
  const quartet=mode==='quartet';
  const quartetCore=mode==='quartet-core';
  const five=mode==='five';
  const six=mode==='six';
  const localFamily=quartet||quartetCore||five||six;
  const cycleCore=quartetCore&&n===8&&edges.length===8;
  const boundaryMode=localFamily||["boundary","distinct","pinned-boundary","pinned-absorption","pinned-equal","pinned-distinct","pinned-symmetry"].includes(mode);
  const fiveCuts=['2,4,5,6,7:','2,4,5,6,7:6','2,4,5,6,7:1,2,3,4,5,6','2,4,5,6,8:','2,4,5,6,8:3,4,6'];
  if(five&&(!fiveCuts.includes(`${lines}:${[...omittedPoints].sort((a,b)=>a-b)}`)||omittedPoint))throw Error('Five mode needs one of the two representatives or its core');
  const sixCuts=['2,4,5,6,7,8:','2,4,5,6,7,8:2,3,4','2,4,5,6,8,10:'];
  if(six&&(!sixCuts.includes(`${lines}:${[...omittedPoints].sort((a,b)=>a-b)}`)||omittedPoint))throw Error('Six mode needs one of the two representatives or the smaller core');
  if(quartet&&(lines.length!==4||omittedPoint||omittedPoints.size||![18,19].includes(s)))throw Error('Quartet mode needs four full lines and 18 or 19 gates');
  const cutsForCore=['2,4,5,6:1,3,4,5','2,4,5,6:1,3,4,5,7','2,4,5,6:1,3,4,5,7,9','2,4,5,7:1,2,4,5,6,8,10','2,4,5,7:1,2,4,5'];
  if(quartetCore&&(!cutsForCore.includes(`${lines}:${[...omittedPoints].sort((a,b)=>a-b)}`)||omittedPoint||!(cycleCore?[10,11]:n===8?[11,12]:n===9?[12,13]:[14,15]).includes(s)))throw Error('Quartet core mode needs a supported restriction');
  const distinct=["distinct","pinned-equal","pinned-distinct","pinned-symmetry"].includes(mode);
  const second=["boundary","distinct","pinned-symmetry"].includes(mode)&&seedLeft!==undefined;
  const neutral=mode==="neutral"||mode==="pinned-neutral";
  const explicitProbe=process.env.AFFINE_SKIP_FORCED_VALUE!=="1";
  const sensitivity=["sensitivity","neutral","boundary","distinct"].includes(mode),
    pinnedProbe=["pinned-probe","pinned-redundant","pinned-neutral"].includes(mode);
  if(boundaryMode&&count!==neg.length)throw Error("These conditions need every boundary row");
  const active=mode==="active"||sensitivity;
  if((sensitivity||pinnedProbe) && (count!==neg.length || !Number.isInteger(probes) || probes<1 || probes>s))throw Error("Use all negative boundaries and a valid number of probes");
  let fresh=0; const clauses=[], gates=[];
  const v=()=>++fresh, add=(...a)=>clauses.push(a);
  const truth=v(); add(truth);
  const affine34=mode==='affine34';
  if(affine34&&(s!==34||n!==21||edges.length!==36||count!==neg.length||seedOp!=='or')){
    throw Error('affine34 needs the complete 34-gate affine instance and a fixed initial OR');
  }
  function one(a){
    add(...a);
    let prior; const prefixes=[];
    for(const x of a){
      const next=v(); add(-x,next);
      if(prior){add(-prior,next);add(-x,-prior);}
      add(-next,x,...(prior?[prior]:[])); prior=next; prefixes.push(next);
    }
    return prefixes;
  }
  for(let j=0;j<s;j++){
    const type=v(), a=Array.from({length:n+j},v), b=Array.from({length:n+j},v);
    const ap=one(a), bp=one(b);
    for(let i=0;i<a.length;i++)for(let k=0;k<i;k++)add(-a[i],-b[k]);
    gates.push({type,a,b,ap,bp});
  }
  const refinement=process.env.AFFINE_REFINEMENT==='1';
  if(refinement&&(!process.env.AFFINE_NEG_SAMPLES||!['plain','ordered'].includes(mode)||count!==neg.length))
    throw Error('Refinement needs explicit negative samples in plain or ordered mode');
  const deepEdgeCount=Number(process.env.AFFINE_MIN_DEEP_EDGES??(process.env.AFFINE_TWO_DEEP_EDGES==='1'?2:0));
  const depthEquality=process.env.AFFINE_DEPTH_EQUALITY==='1';
  if(depthEquality&&(![3,4,5].includes(deepEdgeCount)||s!==43||process.env.AFFINE_EDIT_BASE))
    throw Error('Depth equality needs three to five deep edges at 43 gates without fixed edit distance');
  const fiveEquality=depthEquality&&deepEdgeCount===5;
  const compactDepth=process.env.AFFINE_COMPACT_DEPTH==='1';
  if(compactDepth&&!depthEquality)throw Error('Compact depth needs an exact deep edge count');
  const tightDepth=process.env.AFFINE_DEPTH_TIGHT==='1';
  if(tightDepth&&(!depthEquality||deepEdgeCount!==4))
    throw Error('Tight depth needs exactly four deep edges');
  const maxNine=process.env.AFFINE_DEPTH_MAX_NINE==='1';
  if(maxNine&&(!depthEquality||![4,5].includes(deepEdgeCount)||tightDepth))
    throw Error('The nine-term bound needs four or five deep edges without a ten-term minimum');
  const deepLinePattern=process.env.AFFINE_DEEP_LINE_PATTERN;
  if(deepLinePattern&&(!depthEquality||
    !(deepEdgeCount===3?['two-plus-one','distinct']:deepEdgeCount===4?['single','split']:['split']).includes(deepLinePattern)))
    throw Error('Unsupported deep line pattern for the requested equality case');
  const tightAccounting=process.env.AFFINE_TIGHT_ACCOUNTING==='1';
  if(tightAccounting&&(!tightDepth||deepLinePattern!=='split'))
    throw Error('Tight accounting needs ten productive ANDs and several deep lines');
  const tightDisjoint=process.env.AFFINE_TIGHT_DISJOINT==='1';
  if(tightDisjoint&&(!tightAccounting||!compactDepth))
    throw Error('Disjoint terms need tight accounting and compact depth');
  const linearSplit=process.env.AFFINE_LINEAR_SPLIT==='1';
  if(linearSplit&&(!maxNine||deepEdgeCount!==4||!compactDepth||deepLinePattern!=='split'))
    throw Error('Linear split needs compact depth, the nine-term bound and several deep lines');
  const excludeTriple=process.env.AFFINE_EXCLUDE_DEEP_TRIPLE==='1';
  const deepOrbit=process.env.AFFINE_DEEP_ORBIT;

  if(excludeTriple&&(!linearSplit||deepOrbit===undefined))
    throw Error('Excluding deep triples needs linear split and orbit selection');
  if(deepOrbit!==undefined&&(!depthEquality||![4,5].includes(deepEdgeCount)||deepLinePattern==='single'))
    throw Error('Deep orbits require exactly four or five edges without a fixed line');
  const fiveWide=process.env.AFFINE_FIVE_WIDE==='1';
  if(fiveWide&&(!fiveEquality||!compactDepth||!maxNine||deepOrbit===undefined))
    throw Error('The five-edge wide case needs compact depth, the nine-term bound and orbits');
  const deepPartition=process.env.AFFINE_DEEP_PARTITION;
  if(deepPartition&&(!fiveEquality||deepOrbit===undefined))
    throw Error('A deep partition requires five-edge orbit selection');
  const tightBridge=process.env.AFFINE_TIGHT_BRIDGE==='1';
  if(tightBridge&&(!tightDisjoint||deepOrbit===undefined))
    throw Error('The tight bridge filter needs disjoint terms and deep-edge orbits');
  const fixedLineEdges=deepLinePattern==='single'?edges.flatMap(([,line],i)=>line===half?[i]:[]):[];
  if(deepLinePattern==='single'&&(fixedLineEdges.length!==4||
    new Set(automorphisms().map(permutation=>permutation[half])).size!==lines.length))
    throw Error('Fixing the deep line requires transitivity on all lines');
  if(deepEdgeCount){
    if(![2,3,4,5,6].includes(deepEdgeCount))throw Error('Expected two to six deep edge witnesses');
    if(n!==21||edges.length!==36||s>43||count!==neg.length||(!refinement&&process.env.AFFINE_NEG_SAMPLES))
      throw Error('Depth condition needs the exact affine instance at at most 43 gates');
    function shallowAccepts(inputs){
      const orOnly=[...inputs], shallow=[...inputs];
      for(const g of gates){
        const a0=v(),b0=v(),a=v(),b=v(),zeroAnd=v(),oneAnd=v();
        for(let i=0;i<orOnly.length;i++){
          add(-g.a[i],-a0,orOnly[i]);add(-g.a[i],a0,-orOnly[i]);
          add(-g.b[i],-b0,orOnly[i]);add(-g.b[i],b0,-orOnly[i]);
          add(-g.a[i],-a,shallow[i]);add(-g.a[i],a,-shallow[i]);
          add(-g.b[i],-b,shallow[i]);add(-g.b[i],b,-shallow[i]);
        }
        add(-zeroAnd,-g.type);add(-zeroAnd,a0,b0);
        add(zeroAnd,g.type,-a0);add(zeroAnd,g.type,-b0);
        add(-g.type,-oneAnd,a0);add(-g.type,-oneAnd,b0);
        add(-g.type,oneAnd,-a0,-b0);
        add(g.type,-oneAnd,a,b);add(g.type,oneAnd,-a);add(g.type,oneAnd,-b);
        orOnly.push(zeroAnd);shallow.push(oneAnd);
      }
      return shallow.at(-1);
    }
    const chosen=Array.from({length:deepEdgeCount},(_,j)=>{
      const selection=edges.map(v);
      one(selection);
      if(fixedLineEdges.length)add(selection[fixedLineEdges[j]]);
      if(!compactDepth){
        const input=Array.from({length:n},v);
        for(const [j,edge] of edges.entries()){
          for(const [i,wire] of input.entries())add(-selection[j],edge.includes(i)?wire:-wire);
        }
        add(-shallowAccepts(input));
      }
      return selection;
    });
    for(let j=0;j<chosen.length;j++)for(let k=0;k<j;k++){
      for(let i=0;i<edges.length;i++)add(-chosen[j][i],-chosen[k][i]);
    }
    const spreadOrbitWitnesses=[];
    if(deepOrbit!==undefined){
      const {representatives}=deepEdgeOrbits(deepEdgeCount);
      const orbitNumber=Number(deepOrbit);
      if(deepOrbit!=='all'&&(!Number.isInteger(orbitNumber)||orbitNumber<1||orbitNumber>representatives.length))
        throw Error('Deep orbit must be all or a one-based representative number');
      const allowed=representatives.filter((rep,i)=>
        (deepOrbit==='all'||i+1===orbitNumber)&&(deepLinePattern!=='split'||rep.pattern!=='4')&&
        (!tightBridge||rep.tightBridge)&&(!excludeTriple||rep.pattern!=='3+1')&&
        (!deepPartition||rep.pattern===deepPartition)&&(!fiveWide||Number(rep.pattern[0])<=2)
      );
      if(!allowed.length)throw Error('No orbit matches the deep-line pattern');
      const witnesses=allowed.map(({indices,pattern})=>{
        const witness=v();
        indices.forEach((edge,j)=>add(-witness,chosen[j][edge]));
        if(fiveEquality&&pattern!=='4+1')spreadOrbitWitnesses.push(witness);
        return witness;
      });
      one(witnesses);
    }
    if(depthEquality){
      if(!compactDepth)for(const [i,edge] of edges.entries()){
        const input=Array.from({length:n},(_,j)=>edge.includes(j)?truth:-truth);
        add(shallowAccepts(input),...chosen.map(group=>group[i]));
      }
      const exposed=gates.map(v);
      add(exposed.at(-1));
      const inner=[];

      for(const [j,g] of gates.entries()){
        const hidden=v();
        add(-hidden,g.type);add(-hidden,-exposed[j]);add(hidden,-g.type,exposed[j]);
        inner.push(hidden);
        if(j<s-1){
          const readers=gates.slice(j+1).map((reader,k)=>{
            const path=v(), reaches=exposed[j+k+1];
            add(-path,-reader.type);add(-path,reaches);
            add(-path,reader.a[n+j],reader.b[n+j]);
            add(path,reader.type,-reaches,-reader.a[n+j]);
            add(path,reader.type,-reaches,-reader.b[n+j]);
            return path;
          });
          add(-exposed[j],...readers);
          for(const reader of readers)add(-reader,exposed[j]);
        }
      }
      function orOnlyOperands(inputs){
        const values=[...inputs];
        return gates.map(g=>{
          const left=v(),right=v(),value=v();
          for(let i=0;i<values.length;i++){
            add(-g.a[i],-left,values[i]);add(-g.a[i],left,-values[i]);
            add(-g.b[i],-right,values[i]);add(-g.b[i],right,-values[i]);
          }
          add(-value,-g.type);add(-value,left,right);
          add(value,g.type,-left);add(value,g.type,-right);
          values.push(value);
          return [left,right];
        });
      }
      const singletonOperands=compactDepth?Array.from({length:n},(_,j)=>
        orOnlyOperands(Array.from({length:n},(_,i)=>i===j?truth:-truth))
      ):null;
      if(singletonOperands){
        for(const [i,[point,line]] of edges.entries()){
          const matches=gates.map((g,j)=>{
            const match=v();
            const [aPoint,bPoint]=singletonOperands[point][j];
            const [aLine,bLine]=singletonOperands[line][j];
            add(-match,g.type);add(-match,exposed[j]);
            add(-match,aPoint,aLine);add(-match,bPoint,bLine);
            for(const left of [aPoint,aLine])for(const right of [bPoint,bLine])
              add(match,-g.type,-exposed[j],-left,-right);
            return match;
          });
          const marked=chosen.map(selection=>selection[i]);
          if(tightDisjoint){
            one([...marked,...matches]);
          }else{
            add(...marked,...matches);
            for(const mark of marked)for(const match of matches)add(-mark,-match);
          }
        }
      }
      function atMost(wires,limit,condition=truth){
        let counts=Array(limit+2).fill(-truth);
        counts[0]=truth;
        for(const wire of wires){
          const next=[truth];
          for(let k=1;k<=limit+1;k++){
            const reached=v();
            add(-counts[k],reached);add(-counts[k-1],-wire,reached);
            next.push(reached);
          }
          counts=next;
        }
        add(...(condition===truth?[]:[-condition]),-counts[limit+1]);
      }
      if(deepEdgeCount===3||tightAccounting){
        one(inner);
      }else{
        add(...inner);
        atMost(inner,linearSplit||fiveWide?2:3);
        if(linearSplit||fiveWide)for(const gate of inner.keys())add(...inner.filter((_,j)=>j!==gate));
      }
      atMost(gates.map(g=>g.type),tightAccounting||maxNine||fiveEquality?11:deepEdgeCount+8);
      if(deepLinePattern==='split'){
        for(const line of lines.keys()){
          add(...chosen.flatMap(selection=>edges.flatMap(([,wire],i)=>
            wire!==half+line?[selection[i]]:[]
          )));
        }
      }
      if(tightDepth||maxNine||fiveEquality){
        const allOperands=orOnlyOperands(Array(n).fill(truth));
        const lineOperands=!tightDepth?[]:singletonOperands?singletonOperands.slice(half):
          lines.map((_,j)=>orOnlyOperands(Array.from({length:n},(_,i)=>i===half+j?truth:-truth)));
        const pointCenters=[];
        const productive=gates.map((g,j)=>{
          const flag=v(), [left,right]=allOperands[j];
          add(-flag,g.type);add(-flag,exposed[j]);add(-flag,left);add(-flag,right);
          add(flag,-g.type,-exposed[j],-left,-right);
          if(tightAccounting)add(-g.type,-exposed[j],flag);
          if(tightDepth)for(let side=0;side<2;side++){
            const witness=v();
            add(-witness,flag);
            const support=lineOperands.map(operands=>operands[j][side]);
            for(let i=0;i<support.length;i++)add(-witness,...support.filter((_,k)=>i!==k));
            pointCenters.push(witness);
          }
          return flag;
        });
        function centerWitnesses(vertex){
          const centers=[];
          for(const [j,flag] of productive.entries())for(let side=0;side<2;side++){
            const center=v();
            add(-center,flag);
            for(const [input,operands] of singletonOperands.entries())
              add(-center,input===vertex?operands[j][side]:-operands[j][side]);
            centers.push(center);
          }
          return centers;
        }
        if(tightDepth){
          atMost(productive.map(wire=>-wire),s-10);
          add(...pointCenters);
        }else if(fiveEquality){
          atMost([...productive,...inner],11);
          if(spreadOrbitWitnesses.length){
            const spread=v();
            for(const witness of spreadOrbitWitnesses)add(-witness,spread);
            atMost(productive.map(wire=>-wire),s-9,spread);
          }
          if(maxNine)atMost(productive,9);
          if(fiveWide)for(let line=half;line<n;line++)add(...centerWitnesses(line));
        }else{
          atMost(productive,9);
          if(linearSplit)for(let line=half;line<n;line++)add(...centerWitnesses(line));

        }
      }
      if(deepLinePattern&&deepEdgeCount===3){
        const lineChoices=chosen.map(selection=>{
          const choices=lines.map(v);
          for(const [i,[,line]] of edges.entries())add(-selection[i],choices[line-half]);
          one(choices);
          return choices;
        });
        for(let a=0;a<lines.length;a++)for(let b=0;b<lines.length;b++)for(let c=0;c<lines.length;c++){
          const distinctLines=new Set([a,b,c]).size;
          if(distinctLines!==(deepLinePattern==='distinct'?3:2))
            add(-lineChoices[0][a],-lineChoices[1][b],-lineChoices[2][c]);
        }
        // At most one line lacks an exposed AND with that input wired directly.
        const rawLineReaders=lines.map((_,i)=>{
          const line=half+i, witnessed=v();
          const readers=gates.map((g,j)=>{
            const reader=v();
            add(-reader,g.type);add(-reader,exposed[j]);
            add(-reader,g.a[line],g.b[line]);
            return reader;
          });
          add(-witnessed,...readers);
          return witnessed;
        });
        for(let i=0;i<rawLineReaders.length;i++)for(let j=0;j<i;j++)
          add(rawLineReaders[i],rawLineReaders[j]);
      }
    }
  }
  if(process.env.AFFINE_EDIT_BASE){
    const reference=JSON.parse(fs.readFileSync(process.env.AFFINE_EDIT_BASE,'utf8'));
    const budget=Number(process.env.AFFINE_EDIT_BUDGET);
    if(reference.output!==n+s-1||reference.gates.length!==s||!Number.isInteger(budget)||budget<0||budget>=s)
      throw Error('Invalid circuit editing neighborhood');
    let limit=Array(budget+2).fill(-truth);
    limit[0]=truth;
    for(const [j,[op,a,b]] of reference.gates.entries()){
      const g=gates[j],different=v();
      if(!['and','or'].includes(op)||![a,b].every(w=>Number.isInteger(w)&&w>=0&&w<n+j))
        throw Error('Invalid reference gate');
      add(g.a[Math.min(a,b)],different);
      add(g.b[Math.max(a,b)],different);
      add(op==='and'?g.type:-g.type,different);
      const next=[truth];
      for(let k=1;k<=budget+1;k++){
        const flag=v();
        add(-limit[k],flag);
        add(-limit[k-1],-different,flag);
        next.push(flag);
      }
      limit=next;
    }
    add(-limit[budget+1]);
  }
  if(affine34){
    add(-gates[1].type);
    for(const g of gates)add(-g.type,-g.bp[n-1]);
    if(process.env.AFFINE_34_SECOND_ORBITS){
      const rows=fs.readFileSync(process.env.AFFINE_34_SECOND_ORBITS,'utf8').trim().split('\n').map(JSON.parse);
      const row=rows.find(item=>item.first[0]===Number(seedLeft)&&item.first[1]===Number(seedRight));
      if(!row)throw Error('Missing second-gate orbit representatives');
      const allowed=new Set(row.representatives.map(([a,b])=>a*(n+1)+b));
      for(let a=0;a<=n;a++)for(let b=a+1;b<=n;b++){
        if(!allowed.has(a*(n+1)+b))add(-gates[1].a[a],-gates[1].b[b]);
      }
    }
    for(let input=0;input<n;input++){
      let once=-truth,twice=-truth;
      const endpoint=input===Number(seedLeft)||input===Number(seedRight);
      for(const g of gates){
        const read=v(),nextOnce=v(),nextTwice=v();
        const left=g.a[input],right=g.b[input];
        add(-left,read);add(-right,read);add(left,right,-read);
        add(-twice,-read);
        add(-read,-once,-g.type);
        add(-nextTwice,twice,read);add(-nextTwice,twice,once);
        add(-nextOnce,once,read);
        add(-read,nextOnce);add(-once,nextOnce);
        add(-twice,nextTwice);add(-read,-once,nextTwice);
        if(endpoint)add(-read,-g.type);
        once=nextOnce;
        twice=nextTwice;
      }
      for(const g of gates){
        add(-g.a[input],-g.type,-twice);
        add(-g.b[input],-g.type,-twice);
      }
    }
  }
  const fiveTight=five&&s===22&&!omittedPoints.size&&process.env.AFFINE_FIVE_PRIVATE==='1';
  const compressedFive=five&&s===22&&lines.join(',')==='2,4,5,6,7'&&omittedPoints.size===1&&omittedPoints.has(6);
  const privatePoints=quartet||fiveTight||compressedFive?rows.flatMap((mask,i)=>mask&&!(mask&(mask-1))?[[i,half+Math.log2(mask)]]:[]):[];
  const centralCut=five&&n===11&&s===16&&process.env.AFFINE_FIVE_CENTRAL==='1';
  const centralLine=centralCut?Array.from({length:rightSize},(_,j)=>half+j)
    .find(i=>edges.filter(([,line])=>line===i).length===2):null;
  const sixTight=six&&lines.join(',')==='2,4,5,6,8,10'&&s===24;
  const crossPairs=sixTight?edges.filter(([point])=>rows[point].toString(2).replaceAll('0','').length===2):[];
  const forcedOrPairs=centralCut?edges.filter(([,line])=>line===centralLine)
    .map(([point])=>[centralLine,point]):sixTight?crossPairs:privatePoints;
  const fiveReaders=centralCut&&process.env.AFFINE_FIVE_READERS==='1';
  const inputTwice=[];
  if(fiveReaders){
    const or=(x,y)=>{const z=v();add(-x,z);add(-y,z);add(x,y,-z);return z;};
    const and=(x,y)=>-or(-x,-y);
    for(let input=0;input<n;input++){
      let once=-truth, twice=-truth;
      for(const gate of gates){
        const reads=or(gate.a[input],gate.b[input]);
        add(-reads,-gate.type,-once);
        const newRepeat=and(once,reads);
        twice=or(twice,newRepeat);
        once=or(once,reads);
      }
      inputTwice.push(twice);
      for(const gate of gates){
        add(-gate.a[input],-gate.type,-twice);
        add(-gate.b[input],-gate.type,-twice);
      }
    }
  }
  if(localFamily){
    // Any primary AND can be moved to the first position. At 18 gates it is excluded.
    if(s===18||(quartetCore&&(cycleCore?s===10:(n===8&&s===11)||(n===9&&s===12))))for(const g of gates)add(-g.type,-g.bp[n-1]);
    const strengthened=five?require('./cinq-droites.cjs'):six?require('./six-droites.cjs'):null;
    if(strengthened&&strengthened.lowerBound(edges).firstAnd>s)for(const g of gates)add(-g.type,-g.bp[n-1]);
    if((quartetCore||five||six)&&process.env.AFFINE_CORE_FIRST_BOUNDS==='1'){
      const {lowerBound}=strengthened??require('./bornes-quatuors.cjs');
      const possible=new Set(lowerBound(edges).firstBranches.filter(g=>g.lower<=s).map(g=>[g.a,g.b,g.and].join(',')));
      for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)for(const and of [0,1]){
        if(!possible.has([a,b,and].join(',')))add(-gates[0].a[a],-gates[0].b[b],and?-gates[0].type:gates[0].type);
      }
    }
    const thetaReads=quartetCore&&!cycleCore&&n===8&&s===11&&process.env.AFFINE_CORE_LEAF_READS==='1';
    const diamondReads=quartetCore&&n===9&&s===12&&process.env.AFFINE_DIAMOND_READS==='1';
    if(thetaReads||diamondReads){
      const degrees=Array(n).fill(0);
      for(const [a,b] of edges){degrees[a]++;degrees[b]++;}
      for(let input=0;input<n;input++)if(degrees[input]===2){
        if(diamondReads&&input>=half)one(gates.flatMap(g=>[g.a[input],g.b[input]]));
        for(const g of gates)for(const h of gates)if(g!==h){
          for(const x of [g.a[input],g.b[input]])for(const y of [h.a[input],h.b[input]])add(-g.type,-x,-y);
        }
      }
      for(const [a,b] of edges)if(thetaReads&&degrees[a]===2&&degrees[b]===2){
        for(const g of gates)add(-g.a[a],-g.b[b]);
      }
    }
    if(diamondReads&&process.env.AFFINE_DIAMOND_STAR==='1'){
      add(gates[0].a[0]);add(gates[0].b[2]);add(-gates[0].type);
      for(const g of gates.slice(1)){
        add(-g.a[8],g.type);add(-g.b[8],g.type);
        add(-g.a[8],g.b[n]);add(-g.b[8]);
        add(-g.a[n],g.b[8]);add(-g.b[n],g.a[8]);
      }
    }
    if(process.env.AFFINE_QUARTET_ORBITS==='1'){
      if(seedLeft!==undefined)throw Error('Quartet orbits cannot be combined with a fixed first gate');
      const permutations=quartetAutomorphisms();
      const pair=(a,b)=>Math.min(a,b)*(n+1)+Math.max(a,b);
      for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){
        const key=pair(a,b), left=-gates[0].a[a], right=-gates[0].b[b];
        if(permutations.some(p=>pair(p[a],p[b])<key)){add(left,right);continue;}
        const stabilizer=permutations.filter(p=>pair(p[a],p[b])===key);
        for(let x=0;x<=n;x++)for(let y=x+1;y<=n;y++){
          if(stabilizer.some(p=>pair(p[x],p[y])<pair(x,y))){
            add(left,right,-gates[1].a[x],-gates[1].b[y]);
          }
        }
      }
    }
    for(const point of new Set(forcedOrPairs.map(([point])=>point))){
      const readers=gates.flatMap(g=>[g.a[point],g.b[point]]);
      one(readers);
      for(const g of gates){add(-g.a[point],-g.type);add(-g.b[point],-g.type);}
    }
    if(fiveTight||compressedFive)for(const [j,g] of gates.entries()){
      const takesPrivate=v();
      const children=gates.slice(j+1).map(h=>{
        const reads=v();
        add(-h.a[n+j],reads);add(-h.b[n+j],reads);add(h.a[n+j],h.b[n+j],-reads);
        add(-takesPrivate,-reads,h.type);
        return reads;
      });
      for(const [point,line] of privatePoints)if(!compressedFive||lines[line-half]===7){
        add(-g.a[point],takesPrivate);add(-g.b[point],takesPrivate);
      }
      add(-takesPrivate,...children);
      for(let i=0;i<children.length;i++)for(let k=0;k<i;k++)add(-takesPrivate,-children[i],-children[k]);
    }
    if(compressedFive&&process.env.AFFINE_FIVE_TWIN_CASE){
      const [point,line]=privatePoints.find(([,l])=>lines[l-half]===7);
      const or=(x,y)=>{const z=v();add(-x,z);add(-y,z);add(x,y,-z);return z;};
      const and=(x,y)=>-or(-x,-y);
      const readers=gates.map(g=>or(g.a[line],g.b[line]));
      const andReaders=gates.map((g,j)=>and(readers[j],g.type));
      const hasAnd=andReaders.reduce(or,-truth);
      let seen=-truth,twice=-truth;
      for(const wire of readers){
        add(-twice,-wire);
        twice=or(twice,and(seen,wire));
        seen=or(seen,wire);
      }
      for(const [j,g] of gates.entries()){
        const privateInput=gates.slice(0,j).map((h,k)=>
          and(g.b[n+k],or(h.a[point],h.b[point])));
        // The single primary-AND reader of the line must read the private OR.
        add(twice,-andReaders[j],...privateInput);
      }
      const selected=process.env.AFFINE_FIVE_TWIN_CASE;
      if(selected==='single-and'){add(-twice);add(hasAnd);}
      else if(selected==='single-or'){add(-twice);add(-hasAnd);}
      else if(selected==='double'){add(twice);}
      else throw Error('Unknown private point case');
      if(selected==='single-and'&&process.env.AFFINE_FIVE_TWIN_STAR==='1'){
        for(const [j,g] of gates.entries()){
          add(-g.b[point]);
          for(let i=0;i<n;i++)add(-g.a[point],-g.b[i]);
          for(let i=0;i<j;i++){
            const otherReaders=gates.flatMap((h,k)=>k!==j&&k>i?[h.a[n+i],h.b[n+i]]:[]);
            add(-g.a[point],-g.b[n+i],...otherReaders);
          }
          const children=gates.slice(j+1).map(h=>{
            const reads=or(h.a[n+j],h.b[n+j]);
            add(-andReaders[j],-reads,-h.type);
            return reads;
          });
          add(-andReaders[j],...children);
          for(let i=0;i<children.length;i++)for(let k=0;k<i;k++)add(-andReaders[j],-children[i],-children[k]);
        }
      }
    }
    for(let line=half;s===18&&line<n;line++){
      const orReaders=gates.map(g=>{
        const reader=v();
        add(-g.a[line],g.type,reader);add(-g.b[line],g.type,reader);
        return reader;
      });
      for(let i=0;i<s;i++)for(let j=0;j<i;j++)add(-orReaders[i],-orReaders[j]);
    }
    if(process.env.AFFINE_QUARTET_PROPAGATE==='1'){
      function boundedRemoval(inputs,value,budget){
        const constants=Array.from({length:n},(_,i)=>inputs.includes(i)?truth:-truth);
        let thresholds=Array(budget+2).fill(-truth);
        thresholds[0]=truth;
        for(const g of gates){
          const a=v(),b=v(),out=v(),removed=v();
          for(let i=0;i<constants.length;i++){
            add(-g.a[i],-a,constants[i]);add(-g.a[i],a,-constants[i]);
            add(-g.b[i],-b,constants[i]);add(-g.b[i],b,-constants[i]);
          }
          add(-a,removed);add(-b,removed);add(a,b,-removed);
          const conj=value?g.type:-g.type;
          add(-conj,-out,a);add(-conj,-out,b);add(-conj,out,-a,-b);
          add(conj,out,-a);add(conj,out,-b);add(conj,-out,a,b);
          constants.push(out);
          const next=[truth];
          for(let k=1;k<=budget+1;k++){
            const flag=v();
            add(-thresholds[k],flag);
            add(-thresholds[k-1],-removed,flag);
            next.push(flag);
          }
          thresholds=next;
        }
        add(-thresholds[budget+1]);
      }
      if(quartet){
        for(let i=0;i<half;i++){
          const isPrivate=privatePoints.some(([p])=>p===i);
          boundedRemoval([i],false,s-(isPrivate?17:16));
          if(isPrivate)boundedRemoval([i],true,s-15);
        }
        for(let i=half;i<n;i++)boundedRemoval([i],true,s-15);
      }else if(five||six){
        for(const cut of six?strengthened.singleCuts(edges):strengthened.restrictionBounds(edges)){
          const isPrivate=compressedFive&&privatePoints.some(([p])=>p===cut.vertex);
          const isCentral=compressedFive&&privatePoints.some(([p,l])=>p===cut.vertex&&lines[l-half]===7);
          const zero=isPrivate?Math.max(21,cut.zero):cut.zero;
          const one=isPrivate?Math.max(isCentral?20:19,cut.one):cut.one;
          if(zero>s||one>s)throw Error('Budget below a proved restricted lower bound');
          boundedRemoval([cut.vertex],false,s-zero);
          boundedRemoval([cut.vertex],true,s-one);
        }
        if(centralCut&&process.env.AFFINE_FIVE_PAIR_ZERO==='1'){
          for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){
            const remaining=edges.filter(edge=>!edge.includes(a)&&!edge.includes(b));
            const lower=strengthened.lowerBound(remaining).lower;
            if(lower>=13)boundedRemoval([a,b],false,s-lower);
          }
        }
      }else{
        for(let i=0;i<n;i++){
          const degree=edges.filter(edge=>edge.includes(i)).length;
          const zeroBound=cycleCore?8:n===8?(degree===2?9:8):n===9?(degree===2?10:9):n===11&&i<half?12:11;
          boundedRemoval([i],false,s-zeroBound);
          if(cycleCore){
            boundedRemoval([i],true,s-7);
          }else if(n===9){
            const oneBounds=[8,7,8,8,8,10,8,8,10];
            boundedRemoval([i],true,s-oneBounds[i]);
          }else if(n!==8&&i>=half)boundedRemoval([i],true,s-11);
          if(n===11&&degree===1)boundedRemoval([i],true,s-12);
        }
        if(n===8&&!cycleCore&&process.env.AFFINE_CORE_ARM_CUTS==='1'){
          const degrees=Array(n).fill(0);
          for(const [a,b] of edges){degrees[a]++;degrees[b]++;}
          for(const [a,b] of edges)if(degrees[a]===2&&degrees[b]===2){
            boundedRemoval([a,b],false,s-8);
          }
        }
        if(diamondReads)for(const cut of [[0,8],[2,8],[3,5],[4,5]])boundedRemoval(cut,false,s-9);
      }
    }
  }
  if (seedLeft !== undefined) {
    add(gates[0].a[Number(seedLeft)]); add(gates[0].b[Number(seedRight)]);
    add(seedOp==='and'?gates[0].type:-gates[0].type);
  }
  if(second){
    const allowed=new Set(canonicalSecond(Number(seedLeft),Number(seedRight)).pairs.map(p=>p.join(",")));
    for(let a=0;a<=n;a++)for(let b=a+1;b<=n;b++)
      if(!allowed.has([a,b].join(",")))add(-gates[1].a[a],-gates[1].b[b]);
  }
  if(process.env.AFFINE_SECOND_STYLE){
    if(!second||s<2)throw Error("A second-gate partition needs a fixed first gate");
    const style=process.env.AFFINE_SECOND_STYLE;
    const allowed=new Set(secondCandidates(Number(seedLeft),Number(seedRight),seedOp)
      .filter(c=>style==="uses"?c.usesFirst:style==="external"?!c.usesFirst:false)
      .map(c=>[c.u,c.v,c.op].join(",")));
    for(let a=0;a<=n;a++)for(let b=a+1;b<=n;b++)for(const op of ["and","or"])
      if(!allowed.has([a,b,op].join(",")))
        add(-gates[1].a[a],-gates[1].b[b],op==="and"?-gates[1].type:gates[1].type);
  }
  if(affine34||localFamily||mode==='projection'||mode==='ordered'||mode==='ordered-dirty'||mode==='active'||sensitivity||mode==='readers'||mode==='pinned-ordered'||mode==='pinned-symmetry'){
    for(let j=seedLeft===undefined?0:1;j<s-1;j++){
      const u=gates[j], w=gates[j+1], depends=w.b[n+j], tie=v();
      for(let a=0;a<u.a.length;a++){
        add(-u.a[a],-w.a[a],tie);
        if(a>0)add(-u.a[a],-w.ap[a-1],depends);
        if(a>0)add(-tie,-u.b[a],-w.bp[a-1],depends);
      }
    }
  }
  if (seedLeft!==undefined && (affine34||mode==='ordered-dirty'||active)) {
    const endpoints=[Number(seedLeft),Number(seedRight)];
    for (const point of endpoints) {
      const other=endpoints.find(v=>v!==point), witnesses=[];
      for (const gate of gates.slice(1)) {
        const left=v(), right=v();
        add(-left,gate.a[point]); add(-left,-gate.b[other]);
        add(-right,gate.b[point]); add(-right,-gate.a[other]);
        witnesses.push(left,right);
      }
      add(...witnesses);
    }
  }
  // The output and all available earlier wires use an acyclic topological numbering.
  const lastRequiredWire=process.env.AFFINE_EDIT_BASE?n:n+s-1;
  for(let i=mode==="projection"?n:0;i<lastRequiredWire;i++){
    add(...gates.flatMap(g=>i<g.a.length?[g.a[i],g.b[i]]:[]));
  }
  const aliases=[], direction=Array.from({length:s},()=>[[],[]]), boundaryRows=[];
  if(boundaryMode){
    for(let j=0;j<s;j++){
      const g=gates[j], yes=v(), same=[];
      for(let i=0;i<g.a.length;i++){
        const match=v();
        add(-match,g.a[i]); add(-match,g.b[i]); add(-g.a[i],-g.b[i],match);
        add(-match,yes); same.push(match);
      }
      add(-yes,...same);
      aliases.push(yes);
      if(j===0)add(-yes);
      else {
        add(-yes,g.a[n+j-1]); add(-yes,g.b[n+j-1]); add(-yes,-g.type);
        add(-aliases[j-1],yes);
      }
    }
  }
  if(mode==="pinned" || mode==="pinned-ordered" || mode==="pinned-dirty" || pinnedProbe || mode==="pinned-boundary" || mode==="pinned-absorption" || mode==="pinned-equal" || mode==="pinned-distinct" || mode==="pinned-symmetry")(["pinned-redundant","pinned-absorption","pinned-equal"].includes(mode)?redundantControl():mode==="pinned-symmetry"?symmetricControl(Number(seedLeft),Number(seedRight)):mode==="pinned-ordered"?orderedControl():control()).forEach(([op,a,b],j)=>{
    const g=gates[j];add(g.a[a]);add(g.b[b]);add(g.type*(op==='and'?1:-1));
  });
  if(process.env.AFFINE_PIN_FILE){
    const pinned=JSON.parse(fs.readFileSync(process.env.AFFINE_PIN_FILE,'utf8'));
    if(pinned.length!==s)throw Error("Wrong pinned size");
    pinned.forEach(([op,a,b],j)=>{
      const g=gates[j]; add(g.a[a]); add(g.b[b]); add(g.type*(op==="and"?1:-1));
    });
  }
  const compactRows=process.env.AFFINE_COMPACT_ROWS==='1';
  if(compactRows&&(!['plain','ordered'].includes(mode)||count!==neg.length||
    (!refinement&&process.env.AFFINE_NEG_SAMPLES)))
    throw Error('Compact rows need the full exact boundary in plain or ordered mode');
  function encodeCompactRow(values,positive){
    for(const g of gates){
      const a=v(),b=v(),out=v();
      for(const [i,value] of values.entries()){
        add(-g.a[i],positive?-a:a,positive?value:-value);
        add(-g.b[i],positive?-b:b,positive?value:-value);
      }
      if(positive){
        add(-g.type,-out,a);add(-g.type,-out,b);add(g.type,-out,a,b);
      }else{
        add(-g.type,out,-a,-b);add(g.type,out,-a);add(g.type,out,-b);
      }
      values.push(out);
    }
    return values;
  }
  const events=Array.from({length:s},()=>({positive:[[],[]],negative:[[],[]]}));
  function encodeRow(w, dirty=false, forced=-1, value=false, boundary=null, reducedDirections=null){
    const marked=[];
    for(const [j,g] of gates.entries()){
      if(j===forced&&!explicitProbe){ w.push(value?truth:-truth); continue; }
      const a=v(),b=v(),out=v();
      for(let i=0;i<w.length;i++){
        add(-g.a[i],-a,w[i]);add(-g.a[i],a,-w[i]);
        add(-g.b[i],-b,w[i]);add(-g.b[i],b,-w[i]);
      }
      add(-g.type,-out,a);add(-g.type,-out,b);add(-g.type,out,-a,-b);
      add(g.type,out,-a);add(g.type,out,-b);add(g.type,-out,a,b);
      if(boundary===false)for(const [point,line] of forcedOrPairs){
        // A true neighbor on a maximal negative makes the unique reader pivotal.
        if(w[line]===truth){add(-g.a[point],-b);add(-g.b[point],-a);}
      }
      if((fiveReaders||affine34)&&boundary===true)for(let input=0;input<n;input++){
        if(w[input]!==truth)continue;
        add(-g.type,-g.a[input],b);add(-g.type,-g.b[input],a);
      }
      if(fiveReaders&&boundary===false)for(const [left,right] of edges){
        if(w[right]===truth){add(g.type,inputTwice[left],-g.a[left],-b);add(g.type,inputTwice[left],-g.b[left],-a);}
        if(w[left]===truth){add(g.type,inputTwice[right],-g.a[right],-b);add(g.type,inputTwice[right],-g.b[right],-a);}
      }
      if(j===forced){
        add(value?-out:out);
        w.push(value?truth:-truth);
      }else{
        w.push(out);
      }
      if((boundaryMode&&boundary!==null)||reducedDirections){
        const ab=v(),ba=v();
        add(-ab,a); add(-ab,-b); add(-ba,b); add(-ba,-a);
        const target=reducedDirections??direction;
        target[j][0].push(ab); target[j][1].push(ba);
      }
      if(neutral && boundary!==null){
        const group=events[j][boundary?"positive":"negative"];
        for(const [side,operand,sibling] of [[0,a,b],[1,b,a]]){
          const flag=v();
          add(-flag,boundary?operand:-operand);
          add(-flag,-g.type,sibling); add(-flag,g.type,-sibling);
          group[side].push(flag);
        }
      }
      if(dirty){
        const flag=v(); add(-flag,g.type); add(-flag,out); marked.push(flag); 
      }
    }
    if(dirty)add(...marked);
    return w;
  }
  const hits=Array.from({length:s},()=>[]), misses=Array.from({length:s},()=>[]);
  if(active && count!==neg.length)throw Error("The active-gate condition needs all maximal negatives");
  const samplePath=process.env.AFFINE_NEG_SAMPLES;
  let selectedRows=examples.slice(0,pos.length+count);
  if(samplePath){
    if(active||boundaryMode||pinnedProbe)throw Error("This mode requires the full boundary");
    const chosen=JSON.parse(fs.readFileSync(samplePath,'utf8'));
    if(chosen.some(mask=>!neg.includes(mask)))throw Error("A sample is not a maximal independent set");
    selectedRows=[...pos.map(m=>[m,true]),...chosen.map(m=>[m,false])];
  }
  for(const [mask,expected] of selectedRows){
    const inputs=Array.from({length:n},(_,i)=>mask>>i&1?truth:-truth);
    const row=compactRows?encodeCompactRow(inputs,expected):encodeRow(inputs,false,-1,false,expected);
    if(distinct)boundaryRows.push(row);
    if(active)for(let j=0;j<s;j++){
      (expected?hits:misses)[j].push(expected?row[n+j]:-row[n+j]);
    }
    add(expected?row.at(-1):-row.at(-1));
  }
  if(boundaryMode&&mode!=="pinned-equal")for(let j=0;j<s;j++){
    add(aliases[j],...direction[j][0]); add(aliases[j],...direction[j][1]);
  }
  const saturatedCompressed=compressedFive&&process.env.AFFINE_FIVE_TWIN_CUTS==='1';
  const sixSaturation=sixTight&&process.env.AFFINE_SIX_CROSS_CUT==='1';
  const affineSaturation=affine34&&process.env.AFFINE_34_SATURATED==='1';
  if(centralCut||saturatedCompressed||sixSaturation||affineSaturation||
    (quartet&&(s===18||process.env.AFFINE_PIN_FILE)&&process.env.AFFINE_QUARTET_SATURATED==='1')){
    const cuts=affineSaturation?[[Number(seedLeft)],[Number(seedRight)]]:
      centralCut?[[centralLine]]:sixSaturation?[[crossPairs[0][0]]]:privatePoints.map(([point])=>[point]);
    if(privatePoints.length===4||saturatedCompressed){
      cuts.push(privatePoints.map(([point])=>point));
    }else if(process.env.AFFINE_QUARTET_ONE_PER_LINE==='1'){
      const firstPrivate=Array.from({length:rightSize},(_,i)=>
        privatePoints.find(([,line])=>line===half+i)[0]);
      cuts.push(firstPrivate);
    }
    for(const cut of cuts){
      const cutMask=cut.reduce((mask,i)=>mask|(1<<i),0);
      const projected=[...new Set(neg.map(mask=>mask&~cutMask))];
      const maximal=projected.filter(mask=>!projected.some(other=>other!==mask&&(mask&other)===mask));
      const supports=[...pos.filter(mask=>!(mask&cutMask)),...maximal];
      const reducedDirections=Array.from({length:s},()=>[[],[]]);
      for(const mask of supports){
        const input=Array.from({length:n},(_,i)=>mask>>i&1?truth:-truth);
        encodeRow(input,false,-1,false,null,reducedDirections);
      }
      for(const [j,g] of gates.entries()){
        const readers=cut.flatMap(i=>[g.a[i],g.b[i]]);
        add(...readers,...reducedDirections[j][0]);
        add(...readers,...reducedDirections[j][1]);
      }
    }
  }
  if(distinct){
    for(let j=0;j<s;j++)for(let earlier=0;earlier<n+j;earlier++){
      const different=[];
      for(const row of boundaryRows){
        const flag=v(), a=row[earlier], b=row[n+j];
        add(-flag,a,b); add(-flag,-a,-b);
        different.push(flag);
      }
      add(aliases[j],...different);
    }
  }
  if(active)for(let j=0;j<s;j++){
    add(...hits[j]); add(...misses[j]);
  }
  if(["dirty","pinned-dirty","ordered-dirty","readers","active"].includes(mode)||sensitivity){
    const input=Array.from({length:n},v); add(...input);
    for(const [a,b] of edges)add(-input[a],-input[b]);
    for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)for(let c=b+1;c<n;c++)
      add(-input[a],-input[b],-input[c]);
    add(-encodeRow(input,true).at(-1));
  }
  if(neutral){
    function or(a,b){const z=v(); add(-a,z);add(-b,z);add(a,b,-z);return z;}
    function and(a,b){return -or(-a,-b);}
    for(let j=0;j<s-1;j++){
      let one=-truth,two=-truth;
      for(const g of gates.slice(j+1)){
        const read=or(g.a[n+j],g.b[n+j]);
        two=or(two,and(one,read));
        one=or(one,read);
      }
      for(let k=j+1;k<s;k++){
        const left=gates[k].a[n+j],right=gates[k].b[n+j];
        for(const group of [events[k].positive,events[k].negative]){
          add(two,-left,right,...group[0]);
          add(two,-right,left,...group[1]);
        }
      }
    }
  }
  if(sensitivity||pinnedProbe){
    const neighbors=Array.from({length:n},()=>[]);
    for(const [a,b] of edges){neighbors[a].push(b);neighbors[b].push(a);}
    for(let j=0;j<probes;j++){
      const edgeChoice=Array.from({length:edges.length},v);
      one(edgeChoice);
      const positive=Array.from({length:n},v);
      for(let i=0;i<edges.length;i++){
        const [a,b]=edges[i];
        for(let point=0;point<n;point++)
          add(-edgeChoice[i],point===a||point===b?positive[point]:-positive[point]);
      }
      add(-encodeRow(positive,false,j,false).at(-1));
      const negative=Array.from({length:n},v);
      for(const [a,b] of edges)add(-negative[a],-negative[b]);
      for(let point=0;point<n;point++)add(negative[point],...neighbors[point].map(other=>negative[other]));
      add(encodeRow(negative,false,j,true).at(-1));
    }
  }
  if(mode==="projection"){
    const bound=Number(process.env.AFFINE_ERROR_BOUND);
    if(!Number.isInteger(bound)||bound<0||bound>=197||count!==0)throw Error("Invalid projection budget");
    if(process.env.AFFINE_NO_FALSE_PAIRS==='1'){
      const edgeMasks=new Set(edges.map(([a,b])=>(1<<a)|(1<<b)));
      for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){
        if(edgeMasks.has((1<<a)|(1<<b)))continue;
        add(-encodeRow(Array.from({length:n},(_,i)=>i===a||i===b?truth:-truth)).at(-1));
      }
    }
    let previous=Array(bound+2).fill(-truth); previous[0]=truth;
    for(const [mask,weight] of fullNegativeProjections()){
      const out=encodeRow(Array.from({length:n},(_,i)=>mask>>i&1?truth:-truth)).at(-1);
      const current=[truth];
      for(let k=1;k<=bound+1;k++){
        const threshold=v();
        add(-previous[k],threshold);
        add(-out,-previous[Math.max(0,k-weight)],threshold);
        current.push(threshold);
      }
      previous=current;
    }
    add(-previous[bound+1]);
  }
  fs.writeFileSync(file,'p cnf '+fresh+' '+clauses.length+'\n'+clauses.map(c=>c.join(' ')+' 0').join('\n')+'\n');
  fs.writeFileSync(file+'.map',JSON.stringify(gates.map(({type,a,b})=>({type,a,b}))));
  console.log(JSON.stringify({file,vars:fresh,clauses:clauses.length,positives:pos.length,negatives:selectedRows.length-pos.length,allNegatives:neg.length}));
} else if(cmd==='model'){
  const [file,output]=args.slice(1);
  const records=fs.readFileSync(output,'utf8').split(/\r?\n/);
  const status=records.find(line=>line.startsWith('s '));
  if(status!=='s SATISFIABLE'){console.log(status??'No solver verdict');process.exit(0);}
  const set=new Set(records.filter(line=>line.startsWith('v ')).flatMap(line=>line.slice(2).trim().split(/\s+/)).map(Number).filter(x=>x>0));
  const g=JSON.parse(fs.readFileSync(file+'.map')).map(f=>[set.has(f.type)?'and':'or',f.a.findIndex(x=>set.has(x)),f.b.findIndex(x=>set.has(x))]);
  console.log(JSON.stringify(test(g)));fs.writeFileSync(output+'.json',JSON.stringify(g));
}







