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

El workflow sube el **build de Vite** (`dist/`) a la rama **`gh-pages`**. Si antes ves pantalla en blanco, suele ser porque Pages estaba sirviendo la **raíz del repo** (`index.html` con `/src/main.tsx`, que el navegador no puede ejecutar).

1. En GitHub: **Settings → Pages**.
2. En **Build and deployment → Source**, elegí **Deploy from a branch**.
3. Branch: **`gh-pages`**, carpeta **`/ (root)`**, Guardar.
4. Tras cada push a **`main`**, esperá a que el workflow **Deploy GitHub Pages** termine en verde (**Actions**).
5. Abrí: **https://josedaminato.github.io/acompa-ar/**

Si renombrás el repo, cambiá `VITE_BASE_URL` en `.github/workflows/pages.yml` para que sea `/nombre-del-repo/`.

### Opción B — Vercel

Importá el repo en [Vercel](https://vercel.com): detecta Vite; `vercel.json` ya redirige rutas al SPA. No hace falta `VITE_BASE_URL` en la raíz del dominio.

## Base de datos

Ejecutá `supabase/schema.sql` en el SQL Editor de tu proyecto Supabase.

## Licencia

Privado / uso del autor del repositorio salvo que indique lo contrario.
