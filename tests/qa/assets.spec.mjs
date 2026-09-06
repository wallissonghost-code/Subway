import{test,expect}from'@playwright/test';

test('all train skins become visible and never disappear',async({page})=>{
 await page.goto('/?qa=1&assets=1');
 await page.waitForFunction(()=>window.__RAIL_QA__?.version==='qa-v2');
 await page.evaluate(()=>window.__RAIL_QA__.action('start_run'));
 await expect.poll(async()=>{
  const s=await page.evaluate(()=>window.__RAIL_QA__.snapshot());
  return s.scene.trains?.length||0;
 },{timeout:5000}).toBeGreaterThan(0);

 // Enquanto os GLBs carregam, todo trem precisa ter placeholder visível.
 let first=await page.evaluate(()=>window.__RAIL_QA__.snapshot());
 for(const t of first.scene.trains){expect(t.meshes).toBeGreaterThan(0)}

 // Os dois modelos Meshy são pesados; damos tempo realista para rede + decode.
 await expect.poll(async()=>{
  const s=await page.evaluate(()=>window.__RAIL_QA__.snapshot());
  return s.scene.trains.filter(t=>t.ready).length;
 },{timeout:30000,intervals:[500,1000,2000]}).toBe(first.scene.trains.length);

 const loaded=await page.evaluate(()=>window.__RAIL_QA__.snapshot());
 expect(loaded.scene.trains.some(t=>t.variant==='normal')).toBe(true);
 expect(loaded.scene.trains.some(t=>t.variant==='ramp')).toBe(true);
 for(const t of loaded.scene.trains){
  expect(t.failed).toBe(false);
  expect(t.ready).toBe(true);
  expect(t.placeholder).toBe(false);
  expect(t.meshes).toBeGreaterThan(0);
 }

 // Deixa o bot rodar alguns segundos e confirma que as skins continuam presentes.
 await page.waitForTimeout(6000);
 const after=await page.evaluate(()=>window.__RAIL_QA__.snapshot());
 for(const t of after.scene.trains){expect(t.meshes).toBeGreaterThan(0);expect(t.failed).toBe(false)}
});
