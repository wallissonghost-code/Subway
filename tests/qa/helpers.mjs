import{expect}from'@playwright/test';
export async function openQA(page){await page.goto('/?qa=1');await page.waitForFunction(()=>window.__RAIL_QA__?.version==='qa-v1');}
export async function snap(page){return page.evaluate(()=>window.__RAIL_QA__.snapshot())}
export async function action(page,name){return page.evaluate(n=>window.__RAIL_QA__.action(n),name)}
export async function start(page){await action(page,'start_run');await expect.poll(async()=> (await snap(page)).runner.mode).toBe('running')}
export async function autopilotStep(page){
 const s=await snap(page);if(s.runner.mode!=='running'||s.runner.paused)return s;
 const lane=s.runner.lane,obs=s.nearby.obstacles.filter(o=>o.z<0&&o.z>-10).sort((a,b)=>b.z-a.z),danger=obs.find(o=>o.lane===lane);
 if(danger&&danger.z>-7){
  if(danger.type==='jump'&&s.runner.y<.05){await action(page,'jump')}
  else if(danger.type==='block'){
   const blocked=new Set(obs.filter(o=>o.z>-8&&o.z<1).map(o=>o.lane));
   const choices=[0,1,2].filter(x=>!blocked.has(x));
   if(choices.length){const target=choices.reduce((a,b)=>Math.abs(b-lane)<Math.abs(a-lane)?b:a,choices[0]);if(target<lane)await action(page,'lane_left');else if(target>lane)await action(page,'lane_right')}
  }
 }
 return s;
}
export async function runAutopilot(page,ms,{sampleEvery=1000,onSample=()=>{}}={}){const start=Date.now();let next=start;while(Date.now()-start<ms){await autopilotStep(page);if(Date.now()>=next){await onSample(await snap(page));next+=sampleEvery}await page.waitForTimeout(90)}}
