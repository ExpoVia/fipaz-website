# ExpoVia Demo

Landing de presentación y simulación móvil para validar ExpoVia en La Paz Expone.

```bash
pnpm install
pnpm dev
```

Abrir `http://localhost:3000`. Requisito: Node.js 20.9 o superior.

Base incluida: Next.js 16, TypeScript, Tailwind, Motion, Lucide, Zustand, Vaul, Zod, Embla y zoom/pan.

La demo pública `/demo` refleja la aplicación visitante Expo, con temas claro y
oscuro, mapa integrado y recorridos de demostración. Ver las rutas y las
instrucciones de prueba en [Demo mobile](Doc/demo-mobile-parity.md).

## Equipo

| Responsable | Entrega | Documento |
| --- | --- | --- |
| Omar | dirección, shell móvil e integración | [Ver tareas](Doc/Omar.md) |
| Jhamil | landing y captura de feedback | [Ver tareas](Doc/Jhamil.md) |
| Saul | Inicio, Explorar y perfil de stand | [Ver tareas](Doc/Saul.md) |
| Franco | mapa interactivo | [Ver tareas](Doc/Franco.md) |
| Fabricio | sistema visual, misiones y premios | [Ver tareas](Doc/Fabricio.md) |
| Erick | simulación NFC, datos y estado | [Ver tareas](Doc/Erick.md) |

## Checklist de entrega

- [ ] `/` explica ExpoVia y abre la demo.
- [ ] `/demo` funciona como aplicación móvil responsive.
- [ ] Navegación inferior conecta Inicio, Mapa, NFC, Misiones y Perfil.
- [ ] Mapa permite zoom, filtros, selección de zona y stand.
- [ ] NFC simulado suma puntos y actualiza una misión sin duplicarse.
- [ ] Contenido ficticio y estilo pixel-art original están completos.
- [ ] Prueba en Android, iPhone y escritorio terminada.
- [ ] `pnpm lint` y `pnpm build` pasan sin errores.
- [ ] URL pública y plan de contingencia preparados.

**Code freeze:** miércoles 9 de septiembre, 15:00. **Demo de campo:** jueves 10 por la mañana.
