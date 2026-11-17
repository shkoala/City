/* Two quiet, opposite-direction journeys on the separated east cycle path. */
(function(root){
'use strict';
const G=root.CitySceneGeometry||(typeof require!=='undefined'?require('./scene-geometry.js'):null);
function makePath(points){
 let length=0;
 const segments=points.slice(1).map((b,i)=>{const a=points[i],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),s=length;length+=len;return {a,b,len,s,tx:dx/len,ty:dy/len};});
 return {segments,length};
}
function pose(path,s,dir,lane){
 const g=path.segments.find(g=>s<g.s+g.len)||path.segments.at(-1),d=s-g.s,y=g.a[1]+g.ty*d,scale=.75+.25*Math.max(0,Math.min(1,y/1086));
 return {x:g.a[0]+g.tx*d+g.ty*lane*scale*dir,y:y-g.tx*lane*scale*dir,tx:g.tx*dir,ty:g.ty*dir,scale};
}
class Cycling{
 constructor(config=G.cycleway){
  this.path=makePath(config.points);this.lane=config.lane;this.enabled=true;this.time=0;
  this.riders=[{id:0,dir:1,s:this.path.length*.34,speed:31,color:'coral',distance:0,trips:0},{id:1,dir:-1,s:this.path.length*.69,speed:28,color:'blue',distance:0,trips:0}];
  this.place();
 }
 setEnabled(value){this.enabled=!!value;}
 place(){for(const r of this.riders)Object.assign(r,pose(this.path,r.s,r.dir,this.lane));}
 tick(dt){
  if(!this.enabled||!Number.isFinite(dt)||dt<=0)return;
  this.time+=dt;
  for(const r of this.riders){const d=r.speed*dt;r.distance+=d;r.s+=r.dir*d;while(r.s<0){r.s+=this.path.length;r.trips++;}while(r.s>=this.path.length){r.s-=this.path.length;r.trips++;}}
  this.place();
 }
}
Cycling.pose=pose;Cycling.makePath=makePath;
root.CityCycling=Cycling;if(typeof module!=='undefined')module.exports=Cycling;
})(typeof window!=='undefined'?window:globalThis);
