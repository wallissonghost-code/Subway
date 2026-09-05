import{runnerActions}from'../game/runner.js';
export const LIVE_ACTIONS=[
 {id:'lane_left',label:'Faixa esquerda',description:'Move uma faixa para a esquerda'},
 {id:'lane_right',label:'Faixa direita',description:'Move uma faixa para a direita'},
 {id:'jump',label:'Pular',description:'Faz o corredor pular'},
 {id:'slide',label:'Deslizar',description:'Faz o corredor deslizar'},
 {id:'start_run',label:'Iniciar corrida',description:'Inicia a partida pelo lobby'}
];
export async function executeLiveAction(id){const fn=runnerActions[id];if(!fn)return false;return fn()!==false}
