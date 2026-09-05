import{test,expect}from'@playwright/test';
import{mkdir,writeFile}from'node:fs/promises';
import{openQA,start,runAutopilot}from'./helpers.mjs';
const DURATION=Math.max(30_000,Number(process.env.QA_SOAK_MS||30_000));

test('endless map, render loop and runtime stay healthy under soak',async({page})=>{
 test.setTimeout(DURATION+45_000);await openQA(page);await start(page);const samples=[];
 await runAutopilot(page,DURATION,{sampleEvery:2000,onSample:s=>samples.push(s)});
 expect(samples.length).toBeGreaterThan(5);const first=samples[0],last=samples.at(-1);
 expect(last.runner.mode).toBe('running');expect(last.runner.alive).toBe(true);expect(last.runner.distance).toBeGreaterThan(first.runner.distance);
 for(let i=1;i<samples.length;i++){expect(samples[i].runner.distance).toBeGreaterThan(samples[i-1].runner.distance);expect(samples[i].scene.frames).toBeGreaterThan(samples[i-1].scene.frames);expect(samples[i].scene.track.fronts.some(z=>z<=20&&z>=-80)).toBe(true)}
 const elapsed=(last.time-first.time)/1000,frameDelta=last.scene.frames-first.scene.frames,avgFps=frameDelta/Math.max(.1,elapsed);expect(avgFps).toBeGreaterThan(15);
 const geometries=samples.map(s=>s.scene.renderer.geometries);expect(Math.max(...geometries)-Math.min(...geometries)).toBeLessThanOrEqual(2);
 const mem=await page.evaluate(()=>performance.memory?{used:performance.memory.usedJSHeapSize,total:performance.memory.totalJSHeapSize}:null);
 const report={generatedAt:new Date().toISOString(),durationMs:DURATION,result:'pass',avgFps:Number(avgFps.toFixed(1)),distance:Number(last.runner.distance.toFixed(2)),speed:Number(last.runner.speed.toFixed(2)),coins:last.runner.coins,score:Math.floor(last.runner.score),frames:frameDelta,renderer:last.scene.renderer,geometryRange:[Math.min(...geometries),Math.max(...geometries)],memory:mem,samples:samples.map(s=>({t:Number(((s.time-first.time)/1000).toFixed(1)),distance:Number(s.runner.distance.toFixed(1)),speed:Number(s.runner.speed.toFixed(2)),coins:s.runner.coins,score:Math.floor(s.runner.score),frames:s.scene.frames,worldZ:Number(s.scene.worldZ.toFixed(1)),geometries:s.scene.renderer.geometries}))};
 await mkdir('qa-output',{recursive:true});await writeFile('qa-output/qa-report.json',JSON.stringify(report,null,2));
});
