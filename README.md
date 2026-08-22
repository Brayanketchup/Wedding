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

4. Define `ADMIN_EMAIL`, `ADMIN_PASSWORD` y un `JWT_SECRET` aleatorio de al menos 32 caracteres en `.env`.

5. Inicia ambas aplicaciones:

   ```bash
   npm run dev
   ```

La invitación vive en `http://localhost:5173/invite/TOKEN` y el dashboard en `http://localhost:5173/admin`.

En desarrollo, Vite reenvía automáticamente las peticiones `/api` al puerto `4000`, así que `VITE_API_URL` puede permanecer vacío.

## Crear invitaciones

Cada invitado recibe un token aleatorio. El token se muestra una sola vez y MongoDB guarda únicamente su hash, así que conserva los enlaces que devuelve este comando:

```bash
npm run seed -- "Lucía Torres" "Mateo Díaz" "Familia Rivera"
```

El resultado será similar a:

```text
Lucía Torres: http://localhost:5173/invite/Jh7...token-completo
```

Una URL sin token o con un token que no exista muestra la pantalla de invitación privada. Las respuestas pueden cambiarse desde el mismo enlace y el dashboard siempre muestra la última decisión y su fecha.

## Video de YouTube

Configura `VITE_YOUTUBE_VIDEO_ID` con la parte final de la URL de tu video. Por ejemplo, para `https://youtube.com/watch?v=ABC123`, usa:

```env
VITE_YOUTUBE_VIDEO_ID=ABC123
VITE_YOUTUBE_START_SECONDS=0
```

La experiencia reproduce 60 segundos desde el punto configurado y luego abre el RSVP. Por ejemplo, `VITE_YOUTUBE_START_SECONDS=20` reproduce desde 0:20 hasta 1:20. YouTube puede impedir autoplay hasta que exista una interacción; por eso el invitado pulsa primero **Abrir nuestra invitación**.

## Seguridad

- Los tokens se generan con 192 bits de aleatoriedad y se guardan como hashes SHA-256.
- El dashboard usa una cookie firmada, `HttpOnly`, con ocho horas de duración.
- Los intentos de inicio de sesión están limitados por IP.
- En producción, usa HTTPS, una contraseña larga y secretos diferentes a los del ejemplo.

## Comandos

```bash
npm run dev      # web + API en desarrollo
npm run build    # build de producción del frontend
npm run check    # ESLint y comprobaciones del servidor
npm run seed -- "Nombre"  # crea invitados
npm start        # inicia la API
```

## Producción en un solo servicio

Ejecuta `npm run build` y configura `NODE_ENV=production`. Después, `npm start` sirve la API y también `apps/web/dist`, incluyendo las rutas `/invite/:token` y `/admin`. Mantén `VITE_API_URL` vacío cuando ambos usen el mismo dominio.
