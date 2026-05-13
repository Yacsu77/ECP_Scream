# Qualy_Code — Padrões de qualidade do código

**Projeto:** 3DModelVideoRecorder  
**Uso:** base para revisões e commits futuros.

## Princípios

- **SRP:** Um ficheiro / hook / serviço, uma responsabilidade clara.
- **Abstrações:** Loaders de modelo via factory (`createModelLoader`); cena complexa atrás de facade quando aplicável.
- **Estado global:** alterações via ações do Zustand (`useViewerStore`), não mutação direta dispersa.
- **TypeScript:** `strict`, sem `any`; tipos explícitos em APIs públicas.

## Commits

Formato **Conventional Commits** em português ou inglês, com corpo explicando o *porquê* quando não for óbvio:

- `feat(scope): …` · `fix(scope): …` · `docs(scope): …` · `chore(scope): …`

## Frontend (React + Three)

- Efeitos com cleanup; sem side effects no render.
- `preserveDrawingBuffer: true` no canvas quando há gravação.
- Acessibilidade: botões e zonas de upload com `aria-label` onde fizer sentido.

## Performance (orientação)

- Monitorizar FPS (toggle Stats) ao alterar gravação ou modelos pesados.
- Evitar re-renders desnecessários; `frameloop="demand"` com `invalidate()` onde já aplicado.

## Segurança / dados

- URLs `blob:` são só em memória; não persistir segredos em `localStorage` para este projeto.
- Backend: validar tipo de ficheiro no servidor, não só pela extensão.

Para detalhes de arquitetura e APIs, ver `Docks/ARCHITECTURE.md` e `Docks/README.md`.
