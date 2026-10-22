<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:agent-history -->

## Historial de prompts y salidas del agente (obligatorio)

Todo agente de IA (Claude Code, Codex, Cursor, Gemini, etc.) que trabaje en este repositorio DEBE registrar cada interaccion en `AGENT_HISTORY.md` (raiz del repo), de forma cronologica y append-only:

1. Al recibir un prompt del usuario, anade una entrada **antes** de empezar a trabajar; al terminar, completa el campo `Salida` de esa misma entrada.
2. Formato de cada entrada (nueva entrada al final del archivo, nunca reordenar ni borrar las anteriores):

```
### <timestamp UTC ISO-8601> | usuario: <git user.name> <<git user.email>> | agente: <nombre y modelo>
**Prompt:**
<texto literal del prompt>

**Salida:**
<resumen fiel de lo que hizo/respondio el agente: archivos tocados, comandos relevantes, resultado, errores>
```

3. Obten el timestamp con `date -u +%FT%TZ` y el usuario con `git config user.name` / `git config user.email`.
4. Nunca registres secretos (contrasenas, tokens, connection strings con credenciales); reemplazalos por `***`.
5. Si el repo tiene `AGENTS.md`, `CLAUDE.md` u otro archivo de instrucciones para agentes, esta regla aplica en todos.

<!-- END:agent-history -->
