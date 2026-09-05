import{readFile,writeFile}from'node:fs/promises';
const file='qa-output/qa-report.json';const r=JSON.parse(await readFile(file,'utf8'));const findings=[];
const add=(level,check,message)=>findings.push({level,check,message});
if(r.avgFps<30)add('warning','fps',`FPS médio baixo: ${r.avgFps}`);else add('ok','fps',`FPS médio: ${r.avgFps}`);
if(r.geometryRange?.[1]-r.geometryRange?.[0]>2)add('error','geometry-growth','Geometrias cresceram durante a partida; possível vazamento.');else add('ok','geometry-growth','Contagem de geometrias estável.');
if(r.distance<=0||r.speed<=0)add('error','runner-progress','Distância/velocidade não avançaram.');else add('ok','runner-progress',`Distância ${r.distance} m; velocidade final ${r.speed}.`);
if(r.coins<=0)add('warning','coins','Nenhuma moeda contabilizada no soak.');else add('ok','coins',`${r.coins} moedas contabilizadas.`);
const s=r.samples||[];let stalls=0,regressions=0;for(let i=1;i<s.length;i++){if(s[i].frames<=s[i-1].frames)stalls++;if(s[i].distance<s[i-1].distance)regressions++}
if(stalls)add('error','render-stall',`${stalls} amostras sem avanço de frames.`);else add('ok','render-stall','Renderização avançou em todas as amostras.');
if(regressions)add('error','distance-regression',`${regressions} regressões de distância.`);else add('ok','distance-regression','Distância monotônica durante a corrida.');
if(r.memory?.used&&r.memory?.total){const ratio=r.memory.used/r.memory.total;if(ratio>.85)add('warning','memory',`Heap em ${(ratio*100).toFixed(1)}% do total.`);else add('ok','memory',`Heap em ${(ratio*100).toFixed(1)}% do total.`)}
const status=findings.some(x=>x.level==='error')?'fail':findings.some(x=>x.level==='warning')?'warning':'pass';const out={status,generatedAt:new Date().toISOString(),source:file,findings};await writeFile('qa-output/qa-analysis.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2));if(status==='fail')process.exitCode=1;
