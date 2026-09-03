# ANEXO A. MANUAL DE INSTALACIÓN

Este anexo describe los pasos necesarios para poner en marcha la aplicación en un entorno
local, así como las indicaciones para su despliegue en producción. El proyecto se compone de
dos partes independientes —`backend` y `frontend`— que se ejecutan por separado, además de
una base de datos PostgreSQL.

## A.1. Requisitos previos

Antes de comenzar es necesario tener instalado el siguiente software:

- **Node.js 20 LTS** o superior (incluye `npm`).
- **Docker** (con Docker Compose), para ejecutar la base de datos PostgreSQL. De forma
  alternativa, puede utilizarse una instalación local de PostgreSQL 16.
- **Git**, para obtener el código fuente.

## A.2. Obtención del código

Se clona el repositorio y se accede a la carpeta del proyecto:

```bash
git clone <URL-del-repositorio>
cd wedding-planner-ai
```

El proyecto contiene dos carpetas principales: `backend` y `frontend`.

## A.3. Puesta en marcha del backend

Todos los comandos de este apartado se ejecutan desde la carpeta `backend`.

**1. Instalar las dependencias:**

```bash
cd backend
npm install
```

**2. Levantar la base de datos.** El repositorio incluye un fichero `docker-compose.yml` que
arranca un contenedor de PostgreSQL 16 (base de datos `tfm_backend`, usuario y contraseña
`postgres`, puerto `5432`):

```bash
docker compose up -d
```

**3. Configurar las variables de entorno.** Se crea un fichero `.env` en la carpeta
`backend` con las siguientes variables. Las obligatorias son:

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | `postgresql://postgres:postgres@localhost:5432/tfm_backend` |
| `JWT_ACCESS_SECRET` | Secreto de firma del *token* de acceso | *(cadena larga y aleatoria)* |
| `JWT_REFRESH_SECRET` | Secreto de firma del *token* de refresco | *(cadena larga y aleatoria)* |
| `JWT_ACCESS_EXPIRES` | Caducidad del *token* de acceso | `15m` |
| `JWT_REFRESH_EXPIRES` | Caducidad del *token* de refresco | `7d` |
| `PORT` | Puerto del servidor | `4000` |
| `NODE_ENV` | Entorno de ejecución | `development` |

De forma **opcional** pueden configurarse:

| Variable | Descripción |
|---|---|
| `APP_BASE_URL` | URL base del frontend, usada para construir los enlaces de las invitaciones y de recuperación de contraseña (por defecto `http://localhost:5173`) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | Credenciales del servidor de correo para el envío de invitaciones. Si no se configuran, el sistema utiliza una cuenta de prueba (Ethereal) que no entrega el correo pero proporciona un enlace de previsualización |
| `CORS_ORIGINS` | Lista de orígenes permitidos en producción (separados por comas) |
| `AUTH_RATE_LIMIT_MAX` | Número máximo de peticiones a las rutas de autenticación por ventana de tiempo (por defecto 50) |
| `OPENAI_API_KEY` | Clave de la API de OpenAI para las asistencias con IA. Si no se define, las funciones de IA se ocultan en la interfaz |
| `OPENAI_MODEL`, `OPENAI_TIMEOUT_MS` | Modelo y tiempo máximo de espera para las llamadas a la IA |

**4. Generar el cliente de acceso a datos** a partir del esquema (necesario tras clonar el
repositorio o modificar el esquema):

```bash
npm run prisma:generate
```

**5. Aplicar las migraciones** para crear las tablas en la base de datos:

```bash
npm run prisma:migrate
```

**6. (Opcional) Cargar datos de demostración.** Este paso crea un usuario de prueba con su
boda, útil para explorar la aplicación:

```bash
npx prisma db seed
```

El usuario de demostración es `demo@planifica2.com` con contraseña `123456`.

**7. Arrancar el servidor** en modo desarrollo (con recarga automática):

```bash
npm run dev
```

El backend queda disponible en `http://localhost:4000`, con la API bajo el prefijo `/api`.

## A.4. Puesta en marcha del frontend

Los comandos de este apartado se ejecutan desde la carpeta `frontend`.

**1. Instalar las dependencias:**

```bash
cd frontend
npm install
```

**2. Configurar las variables de entorno.** Se copia el fichero de ejemplo y se ajusta si es
necesario:

```bash
cp .env.example .env
```

La variable principal es `VITE_API_URL`, que debe apuntar a la API del backend y terminar en
`/api` (por defecto `http://localhost:4000/api`).

**3. Arrancar la aplicación** en modo desarrollo:

```bash
npm run dev
```

El frontend queda disponible en `http://localhost:5173`.

## A.5. Acceso a la aplicación

Con el backend y el frontend en marcha, se accede desde el navegador a
`http://localhost:5173`. Puede registrarse un usuario nuevo o, si se cargaron los datos de
demostración, iniciar sesión con las credenciales indicadas en el apartado A.3.

## A.6. Despliegue en producción

Para un despliegue en producción, además de configurar `NODE_ENV=production` y unos secretos
de sesión seguros (el servidor aborta el arranque si detecta secretos por defecto en
producción), se siguen estos pasos:

**Backend:**

```bash
npm run build              # compila TypeScript a la carpeta dist/
npx prisma migrate deploy  # aplica las migraciones en producción
npm start                  # ejecuta el servidor compilado
```

**Frontend:**

```bash
npm run build              # genera los ficheros estáticos en dist/
```

Los ficheros estáticos generados por el frontend se sirven mediante cualquier servidor web
estático, apuntando la variable `VITE_API_URL` a la URL pública de la API. En producción
conviene restringir los orígenes permitidos mediante `CORS_ORIGINS`.
