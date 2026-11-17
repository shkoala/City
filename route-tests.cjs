/* Audit the wording against the map, not only whether a stored path is walkable. */
const assert=require('node:assert/strict'),W=require('./world');
let routes=0,steps=0;
function verify(task){
 const label=task.start+' / '+task.facing+' / '+task.serial;
 let at=0,facing=task.facing;
 for(const instruction of task.instructions){
  steps++;const {from,to,text,kind}=instruction;
  assert.equal(from,at,label+': continuous instruction coverage');
  if(kind==='turn'){
   assert.equal(to,from,label+': turn on the spot');
   const turns=[...text.matchAll(/Turn (left|right)/g)];assert.ok(turns.length,label+': named relative turn');
   for(const turn of turns)facing=W.dirs[(W.dirs.indexOf(facing)+(turn[1]==='left'?3:1))%4];
   continue;
  }
  assert.ok(to>from&&to<task.path.length,label+': movement endpoint');
  let crossings=0;
  for(let k=from+1;k<=to;k++){
   const a=task.path[k-1],b=task.path[k],edge=W.edge(a,b);
   assert.ok(edge,label+': connected path');
   assert.equal(W.direction(a,b),facing,label+': text requires the correct heading');
   if(edge.crossing)crossings++;
   if(!task.planned)for(const id of edge.passes)assert.ok(text.includes(W.venues[id].article),label+': side landmark '+id);
   if(k<to){
    if(W.nodes[b].place)assert.ok(text.includes(W.venues[b].article),label+': intermediate entrance '+b);
    for(const branch of W.edges[b]){
     if(!branch.crossing||branch.to===a||branch.to===task.path[k+1])continue;
     const delta=(W.dirs.indexOf(W.direction(b,branch.to))-W.dirs.indexOf(facing)+4)%4;
     const side=delta===1?'right':'left';
     assert.ok(text.includes('zebra crossing on your '+side),label+': distinguish the side crossing at '+b);
    }
   }
  }
  assert.equal(crossings,kind==='cross'?1:0,label+': crossing only when instructed');
  if(kind==='cross')assert.match(text,/Cross the road/,label+': spoken crossing command');
  const destination=task.path[to];
  if(to===task.path.length-1){
   assert.equal(destination,task.target,label+': correct meeting place');
   // All entrances on the approved map open onto the pavement below their building.
   assert.ok(['E','W'].includes(facing),label+': approach along the entrance pavement');
   assert.ok(text.includes('It’s on your '+(facing==='E'?'left':'right')+'.'),label+': building side');
  }else if(!task.planned&&kind!=='cross'){
   const next=task.path[to+1],nextEdge=W.edge(destination,next),nextFacing=W.direction(destination,next);
   if(nextEdge.crossing){
    if(nextFacing===facing)assert.ok(text.includes('Stop at the zebra crossing ahead.'),label+': crossing ahead at a junction');
    else{
     const delta=(W.dirs.indexOf(nextFacing)-W.dirs.indexOf(facing)+4)%4;
     assert.ok(text.includes('Stop beside the zebra crossing on your '+(delta===1?'right':'left')+'.'),label+': turn towards a side crossing');
    }
   }else if(W.neighbour(destination,facing)){
    assert.match(text,/Stop at the next path on your (left|right)\./,label+': a branch is not a corner');
   }else assert.ok(text.includes('Stop at the corner.'),label+': actual pavement corner');
  }
  at=to;
 }
 assert.equal(at,task.path.length-1,label+': instructions reach the target');routes++;
 return facing;
}

const storyKey=['post','garage','theatre','cafe','bakery','library','post','school'];
let start='bus',facing='S';
for(let serial=0;serial<storyKey.length;serial++){
 const task=W.routeTask(start,facing,serial);
 assert.equal(task.target,storyKey[serial]);assert.equal(task.planned,true);
 facing=verify(task);start=task.target;
}
assert.equal(start,'school');assert.equal(facing,'E');
for(const start of Object.keys(W.nodes))for(const facing of W.dirs){
 for(let serial=0;serial<22;serial++)verify(W.routeTask(start,facing,serial));
 for(const place of W.places)if(place.id!==start){
  const path=W.shortestPath(start,place.id);
  verify({start,facing,target:place.id,path,instructions:W.instructionsFor(path,facing),serial:'all-destinations'});
 }
}

// Specific failures hidden by the old tests: a junction can also lead to a zebra.
const library=W.instructionsFor(['library','rL','mR','mCrossE','post'],'W');
assert.ok(library[0].text.includes('zebra crossing ahead'));
const bus=W.routeTask('bus','S',8);
assert.ok(bus.instructions.some(i=>i.to===2&&i.text.includes('zebra crossing on your left')));
const side=W.instructionsFor(['mL','mBackL','mTopL','hL','hospital'],'N')[0].text;
assert.ok(side.includes('the garage')&&side.includes('the theatre'));

const missionKey={
 'errand-bread':'bakery','errand-car':'garage','errand-veg':'greengrocer','errand-card':'post',
 'errand-money':'bank','errand-bus':'bus','errand-school':'school','errand-hospital':'hospital',
 'errand-film':'cinema','errand-play':'theatre','errand-tea':'cafe','errand-books':'library',
 'errand-wallet':'police','errand-park':'park','clue-behind':'cinema','clue-front':'police',
 'clue-next':'theatre','clue-bakery':'bakery','clue-library':'library','clue-post':'post',
 'clue-between':'park','clue-bank':'bank'
};
assert.equal(W.missions.length,Object.keys(missionKey).length);
for(const mission of W.missions)assert.equal(mission.target,missionKey[mission.id],mission.id);
for(const place of W.places){
 for(const reply of [place.name,place.article,'I am at '+place.article+'.','I’m at '+place.article+'.','We are outside '+place.article+'.','It is '+place.article+'.'])assert.ok(W.answerMatches(reply,place.id),reply);
 for(const other of W.places)if(other.id!==place.id)assert.ok(!W.answerMatches(other.article,place.id),'Reject '+other.id+' for '+place.id);
 assert.ok(!W.answerMatches('I am not at '+place.article,place.id));
}
for(const [answer,id] of [["the baker's shop",'bakery'],["the greengrocer's shop",'greengrocer'],['the coffee shop','cafe']])assert.ok(W.answerMatches(answer,id),answer);
assert.ok(!W.answerMatches('bus station','bus'),'The picture shows a bus stop');
assert.ok(!W.answerMatches('post office and bank','post'),'Keep the full place name');
console.log(JSON.stringify({status:'passed',wordingRoutes:routes,instructionSteps:steps,storyAnswers:storyKey.length,missionAnswers:W.missions.length}));
