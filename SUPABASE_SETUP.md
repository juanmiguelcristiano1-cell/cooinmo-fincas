# COOINMO FINCAS · Base de datos central

La V4 admite una base de datos central con Supabase. GitHub Pages sigue funcionando como frontend estático.

## 1. Crear el proyecto

Entra en Supabase y crea un proyecto nuevo. Desde el panel del proyecto usa **Connect** para obtener la URL del proyecto y la **Publishable Key**.

La documentación actual de Supabase permite usar `@supabase/supabase-js` desde CDN y recomienda utilizar una Publishable Key en código del navegador; nunca debe exponerse una secret/service_role key. La seguridad de las tablas se controla con permisos y Row Level Security (RLS).

## 2. Crear las tablas

Abre **SQL Editor** en Supabase y ejecuta todo el archivo:

`supabase/schema.sql`

Este archivo crea:

- `fincas`: inventario central de propiedades.
- `leads`: contactos de propietarios y compradores.
- RLS y políticas de acceso.
- permisos mínimos para `anon` y `authenticated`.

## 3. Activar el panel

Abre en GitHub:

`assets/supabase-config.js`

y completa:

```js
window.COINMO_SUPABASE_CONFIG = {
  url: 'https://TU-PROYECTO.supabase.co',
  publishableKey: 'sb_publishable_...'
};
```

No coloques aquí una clave `service_role` o `secret`.

## 4. Crear la cuenta de administrador

Abre:

`https://juanmiguelcristiano1-cell.github.io/cooinmo-fincas/admin.html`

Usa **Crear cuenta** con tu correo y una contraseña y después inicia sesión. En proyectos alojados, Supabase puede exigir confirmación del correo antes del acceso, según la configuración de Auth.

## 5. Resultado

Cuando el panel esté conectado:

`Panel COOINMO → Supabase → Fincas`

La web pública lee las fincas publicadas desde la base central, y los formularios públicos pueden registrar leads directamente en `leads`.

## 6. Siguiente fase

Después de activar Supabase, el siguiente paso es añadir:

- usuarios/roles de COOINMO,
- fotografías en Supabase Storage,
- fichas individuales con URL propia,
- estados del expediente,
- seguimiento de compradores,
- feed XML/API por portal,
- estadísticas y trazabilidad.
