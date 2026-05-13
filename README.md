# ECP_Scream — 3D Model Video Recorder

Aplicação web para carregar modelos `.glb` / `.stl`, visualizar em Three.js e gravar vídeo (até 30 s).

## Estrutura

| Pasta | Conteúdo |
|-------|----------|
| `Front End/client/` | React + Vite + TypeScript + R3F |
| `Back end/` | Express opcional (upload temporário) |
| `Docks/` | Documentação (arquitetura, setup, hooks, etc.) |
| `ContextoInicial.json` | Especificação inicial do produto |
| `Qualy_Code.md` | Critérios de qualidade de código |

Os ficheiros em `Models/` não são versionados (ver `.gitignore`).

## Arranque rápido

Ver **[Docks/SETUP.md](Docks/SETUP.md)** para comandos `npm install` e `npm run dev` do cliente e do servidor.

## Licença

Ver ficheiro `LICENSE` na raiz.
