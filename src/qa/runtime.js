import{getRunnerSnapshot,runnerActions}from'../game/runner.js';
import{getNearby,getSceneMetrics}from'../game/scene.js';
import{GAME_CONFIG}from'../config.js';

function nearby(){const n=getNearby();return{worldZ:n.worldZ,playerX:n.playerX,obstacles:n.obstacles.map(o=>({lane:o.lane,type:o.type,radius:o.radius||0,z:o.z+n.worldZ})),coins:n.coins.filter(c=>!c.taken).map(c=>({lane:c.lane,z:c.z+n.worldZ}))}}
function snapshot(){return{time:performance.now(),runner:getRunnerSnapshot(),scene:getSceneMetrics(),nearby:nearby(),config:{baseSpeed:GAME_CONFIG.baseSpeed,maxSpeed:GAME_CONFIG.maxSpeed,acceleration:GAME_CONFIG.acceleration,laneX:[...GAME_CONFIG.laneX]}}}
window.__RAIL_QA__={snapshot,action(name){const fn=runnerActions[name];return typeof fn==='function'?!!fn():false},version:'qa-v1'};
window.dispatchEvent(new CustomEvent('railrush-qa-ready'));
