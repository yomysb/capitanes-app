# Capitanes App

App de gestión para el equipo amateur de básquetbol **Capitanes**: jugadores, arbitraje semanal, finanzas y partidos.

**Stack:** Next.js 14 (App Router) + Supabase (Postgres + Auth) + Tailwind CSS + Vercel

---

## 1. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor** → pega y ejecuta el contenido completo de `supabase/schema.sql`.
3. Ve a **Authentication → Users → Add User** y crea tu primer usuario administrador (correo + contraseña). No hay registro público: solo entra quien tú des de alta aquí.
4. Ve a **Settings → API** y copia:
   - `Project URL`
   - `anon public key`

## 2. Correr localmente

```bash
npm install
cp .env.local.example .env.local
```

Edita `.env.local` con tus valores reales de Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) — te debe mandar directo a `/login`.

## 3. Subir a GitHub

```bash
git init
git add .
git status   # confirma que .env.local NO aparece en la lista
git commit -m "Version inicial Capitanes"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/capitanes-app.git
git push -u origin main
```

## 4. Desplegar en Vercel

1. Entra a [vercel.com/new](https://vercel.com/new) e importa el repo `capitanes-app`.
2. Antes de darle Deploy, agrega las variables de entorno (Project Settings → Environment Variables, o en la pantalla de importación):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Márcalas para **Production**, **Preview** y **Development**.
3. Dale **Deploy**. Cuando termine te da una URL tipo `capitanes-app.vercel.app`.
4. Entra con el usuario que creaste en Supabase Auth.

Cada `git push` a `main` después de esto vuelve a desplegar automáticamente.

## Estructura del proyecto

```
app/
├── login/                    # pantalla de login
├── auth/signout/             # cierre de sesión
└── (protected)/              # todo lo que requiere sesión
    ├── layout.tsx            # valida sesión + navegación inferior
    ├── dashboard/            # caja, próximo partido, récord
    ├── jugadores/            # CRUD + estado de cuenta individual
    ├── partidos/             # partidos + pase de lista + cobro de arbitraje
    ├── finanzas/             # campañas, gastos, balance
    └── torneos/

lib/
├── supabase/client.ts        # cliente para Client Components
├── supabase/server.ts        # cliente para Server Components/Actions
└── finanzas.ts                # cálculo de cuota de arbitraje + registro de pagos

supabase/schema.sql            # esquema completo con RLS, listo para ejecutar
middleware.ts                  # protege rutas y refresca sesión
```

## Lógica de arbitraje

Costo del partido (`$250` por defecto, configurable en la tabla `config`) se divide entre:

```
jugadores fijos activos + jugadores "por partido" que asistieron ese día
```

Cualquier monto pagado de más se registra automáticamente como excedente hacia el **Fondo en Caja**.
