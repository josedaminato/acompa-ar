# Acompañar

Web app de apoyo en recuperación (MVP): React, Vite, TypeScript, Tailwind, Supabase.

## Desarrollo local

```bash
npm install
cp .env.example .env   # completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev
```

Abrir `http://localhost:5173`.

## Ver la interfaz en internet

### Opción A — GitHub Pages (gratis, con este repo)

1. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Hacé push a `main` (el workflow `.github/workflows/pages.yml` genera el sitio).
3. La URL queda: **https://josedaminato.github.io/acompa-ar/**

(Si el repo no es público o cambia el nombre, ajustá `VITE_BASE_URL` en el workflow para que coincida con `/nombre-del-repo/`.)

### Opción B — Vercel

Importá el repo en [Vercel](https://vercel.com): detecta Vite; `vercel.json` ya redirige rutas al SPA. No hace falta `VITE_BASE_URL` en la raíz del dominio.

## Base de datos

Ejecutá `supabase/schema.sql` en el SQL Editor de tu proyecto Supabase.

## Licencia

Privado / uso del autor del repositorio salvo que indique lo contrario.
