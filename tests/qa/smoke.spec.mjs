import{test,expect}from'@playwright/test';
import{openQA,snap,action,start,runAutopilot}from'./helpers.mjs';

test.beforeEach(async({page})=>{await openQA(page)});

test('pause freezes world and resumes cleanly',async({page})=>{await start(page);await page.waitForTimeout(900);await action(page,'pause');const a=await snap(page);await page.waitForTimeout(1200);const b=await snap(page);expect(b.runner.paused).toBe(true);expect(Math.abs(b.runner.distance-a.runner.distance)).toBeLessThan(.02);expect(Math.abs(b.scene.worldZ-a.scene.worldZ)).toBeLessThan(.02);await action(page,'pause');await page.waitForTimeout(500);const c=await snap(page);expect(c.runner.distance).toBeGreaterThan(b.runner.distance+2)});

test('obstacle collision ends the run',async({page})=>{await start(page);await action(page,'lane_left');await expect.poll(async()=> (await snap(page)).runner.mode,{timeout:5000}).toBe('gameover')});

test('coins, distance, score and speed progress consistently',async({page})=>{await start(page);const samples=[];await runAutopilot(page,6500,{sampleEvery:500,onSample:s=>samples.push(s)});const last=samples.at(-1);expect(last.runner.mode).toBe('running');expect(last.runner.coins).toBeGreaterThan(0);expect(last.runner.distance).toBeGreaterThan(60);expect(last.runner.score).toBeGreaterThan(last.runner.distance*3.5);expect(last.runner.speed).toBeGreaterThanOrEqual(last.config.baseSpeed);expect(last.runner.speed).toBeLessThanOrEqual(last.config.maxSpeed+.01);for(let i=1;i<samples.length;i++){expect(samples[i].runner.distance).toBeGreaterThanOrEqual(samples[i-1].runner.distance);expect(samples[i].runner.score).toBeGreaterThanOrEqual(samples[i-1].runner.score)}});

test('swipe changes lane before finger release',async({page,context})=>{await start(page);const cdp=await context.newCDPSession(page);const box=await page.locator('#gameCanvas').boundingBox();const x=box.x+box.width/2,y=box.y+box.height*.6;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-45,y}]});await expect.poll(async()=> (await snap(page)).runner.lane,{timeout:500}).toBe(0);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})});
