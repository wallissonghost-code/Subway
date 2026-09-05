# Rail Rush Live

Primeira base do endless runner 3D mobile do repositório Subway.

## Estrutura

- `index.html` — shell da aplicação, lobby, HUD e modal de configurações.
- `styles.css` — interface mobile.
- `src/config.js` — parâmetros globais do jogo.
- `src/game/state.js` — estado da partida.
- `src/game/scene.js` — cena 3D, pista, personagem, perseguidor, moedas e obstáculos.
- `src/game/runner.js` — regras de corrida, pontuação, colisões e comandos.
- `src/game/input.js` — gestos mobile e teclado de teste.
- `src/live/actions.js` — catálogo de ações exposto ao Live+.
- `src/live/panel-bridge.js` — conexão com o painel Live+ e ACK de comandos.
- `src/ui.js` — lobby, HUD, game over e configurações.
- `src/main.js` — bootstrap e loop principal.

## Primeira etapa pronta

O lobby e a corrida usam a mesma cena 3D. O botão **TOQUE PARA JOGAR** inicia a corrida sem trocar de página. Gestos de esquerda/direita/cima/baixo controlam faixa, pulo e deslize. A engrenagem abre a conexão Live+, usando o mesmo formato de sessão/manifesto do jogo Modelo.

Ações Live+ iniciais: `lane_left`, `lane_right`, `jump`, `slide` e `start_run`.

Os modelos atuais são placeholders geométricos originais para validar a mecânica. Assets, animações, mapas, power-ups e progressão entram nas próximas etapas sem misturar essas responsabilidades no mesmo arquivo.
