# Boda — invitaciones privadas

Monorepo para una invitación de boda en video con RSVP y un dashboard privado para administradores.

## Estructura

```text
apps/
  web/   React + Vite + Tailwind (invitación y dashboard)
  api/   Express + MongoDB (tokens, respuestas y autenticación)
```

## Empezar

Necesitas Node.js 20+ y una base gratuita de [MongoDB Atlas](https://www.mongodb.com/atlas/database).

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea tu configuración:

   ```bash
   cp .env.example .env
   ```

3. En MongoDB Atlas, crea un cluster M0, un usuario de base de datos y permite tu IP en **Network Access**. Copia la cadena de conexión en `MONGODB_URI`.

4. Define `ADMIN_EMAIL`, una contraseña temporal en `ADMIN_PASSWORD` y un `JWT_SECRET` aleatorio de al menos 32 caracteres en `.env`. En la primera conexión se crea ese administrador en MongoDB y se le obliga a reemplazar la contraseña temporal.

5. Inicia ambas aplicaciones:

   ```bash
   npm run dev
   ```

La invitación vive en `http://localhost:5173/invite/TOKEN` y el dashboard en `http://localhost:5173/admin`.

En desarrollo, Vite reenvía automáticamente las peticiones `/api` al puerto `4000`, así que `VITE_API_URL` puede permanecer vacío.

## Crear invitaciones

Cada invitado recibe un token aleatorio. MongoDB guarda su hash para validar el acceso y una copia cifrada para que un administrador autenticado pueda volver a copiar o compartir el enlace desde el dashboard:

```bash
npm run seed -- "Lucía Torres" "Mateo Díaz" "Familia Rivera"
```

El resultado será similar a:

```text
Lucía Torres: http://localhost:5173/invite/Jh7...token-completo
```

Una URL sin token o con un token que no exista muestra la pantalla de invitación privada. Las respuestas pueden cambiarse desde el mismo enlace y el dashboard siempre muestra la última decisión y su fecha.

## Administradores y contraseñas

No existe registro público. La primera cuenta se crea una sola vez a partir de `ADMIN_EMAIL` y `ADMIN_PASSWORD`; después, MongoDB es la fuente de identidad y cambiar esas variables no reemplaza la contraseña guardada.

Las contraseñas nunca se guardan como texto legible. Se derivan con scrypt, una sal aleatoria por cuenta y comparación de tiempo constante. Cada administrador tiene `mustChangePassword`; cuando es `true`, solo puede acceder a la pantalla de actualización y crea directamente su contraseña definitiva sin volver a introducir la temporal. Los cambios voluntarios posteriores sí requieren la contraseña actual.

Para autorizar otro correo, genera una cuenta con contraseña temporal:

```bash
npm run admin:create -- admin2@example.com
```

Para restablecer una cuenta existente cuando olvidó su contraseña:

```bash
npm run admin:reset -- admin@example.com
```

Ambos comandos generan una contraseña temporal que se muestra una sola vez. El restablecimiento cierra todas las sesiones anteriores y exige una contraseña nueva en el siguiente inicio de sesión. Un administrador autenticado también puede cambiar su propia contraseña desde el dashboard.

## Video de Mux

La invitación usa `@mux/mux-player-react` con dos videos públicos: uno horizontal (16:9) para pantallas de escritorio y uno vertical (9:16) para pantallas de hasta 767 px. Solo se monta un reproductor a la vez. Si la ventana cruza ese breakpoint, la app cambia de orientación e intenta conservar la posición y el estado de reproducción.

Los Playback IDs públicos están definidos en `ResponsiveMuxVideo.jsx`. No se necesitan secretos ni credenciales de la API de Mux en el navegador.

## Fecha de la boda

Configura la fecha que aparece en la invitación y alimenta la cuenta regresiva usando el formato ISO `AAAA-MM-DD`:

```env
VITE_WEDDING_DATE=2026-11-14
```

Con ese formato, la cuenta regresiva termina al comenzar el día según la zona horaria del invitado. Para apuntar a una hora y zona específicas, usa una fecha ISO completa, por ejemplo `2026-11-14T17:00:00-05:00`.

Al cambiarla en producción, crea un nuevo deployment para que Vite incorpore el valor actualizado.

La portada muestra un espacio reservado para la fotografía de la pareja. Para reemplazarlo sin configuración adicional, guarda la imagen como `apps/web/public/wedding-photo.jpg`. Como alternativa, puedes alojarla en Vercel Blob u otro CDN y configurar su URL:

```env
VITE_WEDDING_IMAGE_URL=https://example.public.blob.vercel-storage.com/pareja.jpg
```

## Seguridad

- Los tokens se generan con 192 bits de aleatoriedad. Se guardan como hashes SHA-256 para validar el acceso y con cifrado AES-256-GCM para que solo el dashboard autenticado pueda recuperar los enlaces.
- Los correos de administradores tienen un índice único y no hay un endpoint de registro público.
- Las contraseñas se guardan únicamente como hashes scrypt con sal aleatoria.
- El dashboard usa una cookie firmada, `HttpOnly`, con ocho horas de duración.
- Cambiar o restablecer una contraseña invalida las sesiones anteriores.
- Los intentos de inicio de sesión están limitados por IP.
- En producción, usa HTTPS, una contraseña larga y secretos diferentes a los del ejemplo.

## Comandos

```bash
npm run dev      # web + API en desarrollo
npm run build    # build de producción del frontend
npm run check    # ESLint y comprobaciones del servidor
npm run seed -- "Nombre"  # crea invitados
npm run admin:create -- admin@example.com # crea un administrador autorizado
npm run admin:reset -- admin@example.com  # genera una contraseña temporal nueva
npm start        # inicia la API
```

## Producción en un solo servicio

Ejecuta `npm run build` y configura `NODE_ENV=production`. Después, `npm start` sirve la API y también `apps/web/dist`, incluyendo las rutas `/invite/:token` y `/admin`. Mantén `VITE_API_URL` vacío cuando ambos usen el mismo dominio.

### Vercel

El archivo `vercel.json` construye `apps/web/dist`, envía `/api/*` a la función Express y conserva las rutas del SPA. Importa el repositorio con el directorio raíz sin modificar y configura estas variables para Production y Preview: `MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`, `VITE_WEDDING_DATE` y `VITE_WEDDING_IMAGE_URL`. `PUBLIC_APP_URL` es opcional porque Vercel proporciona su dominio automáticamente; configúralo explícitamente al usar un dominio personalizado. Después de cambiar variables, crea un nuevo deployment.
