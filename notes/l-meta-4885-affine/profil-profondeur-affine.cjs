const fs=require('node:fs');
const {incidence}=require('./bornes-quatuors.cjs');
const n=21;
const edges=incidence([2,4,5,6,7,8,10,11,12]);
for(const file of process.argv.slice(2)){
  const data=JSON.parse(fs.readFileSync(file,'utf8'));
  const gates=data.gates??data;
  const output=data.output??n+gates.length-1;
  let full=0,shallow=0;
  const deep=[];
  for(const [x,y] of edges){
    const original=Array.from({length:n},(_,i)=>Number(i===x||i===y));
    const zero=[...original],limited=[...original];
    for(const [op,a,b] of gates){
      if(!['and','or'].includes(op)||Math.min(a,b)<0||Math.max(a,b)>=original.length)throw Error('bad gate');
      original.push(op==='and'?original[a]&original[b]:original[a]|original[b]);
      limited.push(op==='and'?zero[a]&zero[b]:limited[a]|limited[b]);
      zero.push(op==='and'?0:zero[a]|zero[b]);
    }
    full+=original[output];
    shallow+=limited[output];
    if(original[output]&&!limited[output])deep.push([x,y]);
  }
  const exposed=new Set([output]),live=new Set([output]);
  for(let j=gates.length-1;j>=0;j--){
    const [op,a,b]=gates[j];
    if(live.has(n+j)){live.add(a);live.add(b);}
    if(op==='or'&&exposed.has(n+j)){exposed.add(a);exposed.add(b);}
  }
  const innerAnd=gates.flatMap(([op],j)=>op==='and'&&live.has(n+j)&&!exposed.has(n+j)?[j]:[]);
  console.log(JSON.stringify({file,full,shallow,deep,innerAnd}));
}
