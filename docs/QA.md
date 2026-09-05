# QA do Rail Rush Live

## Estrutura

- `tests/qa/smoke.spec.mjs`: testes funcionais curtos de gameplay.
- `tests/qa/soak.spec.mjs`: partida automatizada de 30 s ou 20 min.
- `tests/qa/helpers.mjs`: piloto automático e utilitários.
- `tests/qa/analyze-report.mjs`: analisador automático de anomalias e regressões.
- `src/qa/runtime.js`: telemetria de teste carregada apenas com `?qa=1`.
- `.github/workflows/qa.yml`: CI a cada push/PR.
- `.github/workflows/qa-soak.yml`: endurance de 20 min diário/manual.

## O que é verificado

- início e continuidade da corrida;
- swipe responsivo antes de soltar o dedo;
- pause congela distância e mundo, e resume corretamente;
- colisão com obstáculo encerra a corrida;
- moedas realmente incrementam o contador;
- distância e pontuação crescem de forma monotônica;
- velocidade respeita `baseSpeed`, aceleração e `maxSpeed`;
- mapa/trilhos continuam existindo durante partidas longas;
- frame loop continua avançando;
- contagem de geometrias do Three.js não cresce durante o soak;
- relatório de FPS, distância, velocidade, moedas, score, frames, geometria e heap quando disponível.

## Duração

O CI normal executa um soak de 30 segundos. O workflow `Game QA Soak 20m` executa 1.200.000 ms (20 minutos) e gera artefatos com relatório JSON, análise e traces/screenshot/vídeo em falhas.
