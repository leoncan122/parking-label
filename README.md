# ParkIt - ¿Dónde dejaste tu vehículo?

Aplicación web para guardar la ubicación de tu vehículo (moto, auto, bicicleta, scooter, etc.) usando geolocalización del navegador y autenticación con Supabase.

## Stack

- **React** + TypeScript (Vite)
- **Tailwind CSS**
- **Supabase** (Auth + Database)
- **lucide-react** (iconos)

## Setup

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. Copia tu `Project URL` y `anon public key`

### 2. Configurar base de datos

Ejecuta este SQL en el SQL Editor de Supabase:

```sql
-- Tabla de ubicaciones guardadas
create table parking_locations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  latitude float8 not null,
  longitude float8 not null,
  label text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index para consultas más rápidas
create index idx_parking_locations_user on parking_locations(user_id);

-- Policy: usuarios solo ven sus propias ubicaciones
create policy "Users can view their own locations"
  on parking_locations for select
  using (auth.uid() = user_id);

-- Policy: usuarios pueden insertar sus propias ubicaciones
create policy "Users can insert their own locations"
  on parking_locations for insert
  with check (auth.uid() = user_id);

-- Policy: usuarios pueden eliminar sus propias ubicaciones
create policy "Users can delete their own locations"
  on parking_locations for delete
  using (auth.uid() = user_id);

-- Enable Row Level Security
alter table parking_locations enable row level security;
```

### 3. Habilitar autenticación

En Supabase Dashboard → Authentication → Providers → habilita:
- Email/Password (activado por defecto)
- Google (opcional, requiere configuración OAuth)

### 4. Variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de Supabase.

### 5. Instalar y ejecutar

```bash
npm install
npm run dev
```

La app estará disponible en `http://localhost:5173`

## Funcionalidades

- 🔐 **Autenticación**: Email/Password + Google
- 📍 **Geolocalización**: Obtener ubicación actual o seleccionar en mapa
- 🏷️ **Etiquetas**: Moto, Auto, Bicicleta, Scooter, Otro
- 📋 **Lista de ubicaciones**: Ver todas las ubicaciones guardadas
- 🗺️ **Abrir en Maps**: Enlace directo a Google Maps
- 🗑️ **Eliminar**: Con confirmación

## Estructura

```
src/
├── lib/supabase.ts          # Cliente Supabase + tipos
├── components/
│   ├── AuthScreen.tsx       # Login / Registro
│   ├── LocationPicker.tsx   # Selector de ubicación
│   ├── VehicleLabelSelector.tsx  # Selector de tipo de vehículo
│   └── LocationList.tsx     # Lista de ubicaciones guardadas
├── App.tsx                  # Componente principal
└── main.tsx                 # Entry point
```
