# Acompañar

Web app de apoyo en recuperación (MVP): React, Vite, TypeScript, Tailwind, Supabase.

## Desarrollo local

```bash
npm install
cp .env.example .env   # completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev
```

Abrir `http://localhost:5173`.

### Vista previa interna (sin Supabase)

En la landing, **“Entrar en vista previa interna”** abre el dashboard con datos de ejemplo guardados solo en el navegador (`localStorage`). Sirve para mostrar la interfaz a alguien sin backend. **Salir** cierra esa sesión simulada.

## Ver la interfaz en internet

### GitHub Pages (este repo)

El sitio estático compilado vive en la carpeta **`docs/`** en la rama **`main`** (no uses la raíz del repo: ahí está el `index.html` de desarrollo con `/src/main.tsx` → **pantalla en blanco**).

1. **Settings → Pages → Build and deployment**
2. **Source:** Deploy from a branch  
3. **Branch:** `main`, **Folder:** `/docs` (no “/ (root)”)
4. Guardar y esperar ~1 minuto.

URL: **https://josedaminato.github.io/acompa-ar/**

Si GitHub sigue sirviendo la **raíz del repo** (pantalla blanca), el sitio redirige solo en `github.io` al build en **`…/docs/`**. Las rutas internas usan hash (`#/dashboard`) para que funcione en cualquier modo de Pages.

En cada push a `main` (salvo si solo cambió `docs/`), el workflow **Deploy GitHub Pages** vuelve a generar `docs/`.

Si renombrás el repo, cambiá `VITE_BASE_URL` en `.github/workflows/pages.yml` a `/nombre-del-repo/`.

### Opción B — Vercel

Importá el repo en [Vercel](https://vercel.com): detecta Vite; `vercel.json` ya redirige rutas al SPA. No hace falta `VITE_BASE_URL` en la raíz del dominio.

## Base de datos

Ejecutá `supabase/schema.sql` en el SQL Editor de tu proyecto Supabase.

## Licencia

Privado / uso del autor del repositorio salvo que indique lo contrario.
