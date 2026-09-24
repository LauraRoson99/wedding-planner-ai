# REQUISITOS.md — Wedding Planner AI

> **Propósito.** Este documento es el "harness" de requisitos del proyecto: la fuente de verdad de **qué hace la aplicación, qué falta y cómo debe construirse**. Está pensado para que cualquier desarrollador pueda avanzar rápido sin re-descubrir el contexto en cada sesión.
>
> **Cómo usarlo.**
> - Antes de implementar algo, localiza el requisito por su **ID** (`RF-*`, `IA-*`, `RNF-*`) y respeta el estado y la prioridad marcados aquí.
> - Al cerrar un requisito, **actualiza su estado** en este archivo (☐ pendiente → ◑ en curso → ☑ hecho) en el mismo commit.
> - La arquitectura, comandos y convenciones de código se recogen en las convenciones del proyecto (§7); este documento **no las repite**, solo referencia.
> - Prioridad actual del TFM: **completar el MVP funcional**. La IA y el endurecimiento de seguridad son objetivos posteriores (ver §5 y §6).

---

## 1. Visión del producto

Planificador de bodas web (proyecto **"planifica2"**, TFM del Máster en Ingeniería Informática, UGR). Una pareja gestiona toda su boda desde un único panel: invitados, mesas, tareas, agenda, presupuesto y proveedores, con un dashboard de seguimiento. El diferenciador previsto es un conjunto de **asistencias con IA** (API de OpenAI) que automatizan las decisiones más tediosas (planificación de tareas, distribución de mesas y reparto de presupuesto/proveedores).

**Público objetivo:** parejas organizando su boda (usuario final no técnico). Idioma de producto: **español**.

---

## 2. Estado actual (resumen)

| Módulo | Backend | Frontend | Estado |
|---|---|---|---|
| Autenticación (registro/login JWT) | ☑ | ☑ | Refresh (RF-83), logout con invalidación (RF-84), recuperación y cambio de contraseña (RF-85) |
| Multi-boda (selector de boda activa) | ☑ | ☑ | RF-96: listar/crear/borrar bodas + selector en cabecera |
| Invitados + acompañantes | ☑ | ☑ | Completo (CRUD, import, invitaciones) |
| Grupos | ☑ | ☑ | Completo |
| Mesas + asignación de asientos | ☑ | ☑ | Completo (mapa de mesas manual) |
| Tareas | ☑ | ☑ | Completo (CRUD, prioridad, estado, categoría) |
| Agenda / eventos | ☑ | ☑ | Completo (calendario FullCalendar) |
| Presupuesto | ☑ | ☑ | Completo (partidas + gráficas) |
| Proveedores | ☑ | ☑ | Completo (CRUD, categorías, estados, documentos RF-94) |
| Dashboard / analítica | ☑ | ☑ | Completo |
| **Funcionalidad de IA** | ☑ | ☑ | Completa: infra OpenAI (IA-90/91/92) + tareas (IA-01) + presupuesto/proveedores (IA-03) + distribución de mesas (IA-02) |

---

## 3. Requisitos funcionales implementados

> Referencia de lo que ya funciona, para no reimplementarlo. Todos los endpoints cuelgan de `/api` y (salvo auth/health) exigen `Authorization: Bearer <token>`. El alcance por boda se pasa como `?weddingId=...`.

### 3.1 Autenticación y usuarios
- **RF-01** ☑ Registro de usuario (`POST /auth/register`): crea usuario, hashea contraseña (bcrypt) y **auto-crea una boda** ("Mi boda") si no existe.
- **RF-02** ☑ Login (`POST /auth/login`): devuelve `access` + `refresh` (JWT) y la boda activa.
- **RF-03** ☑ Protección de rutas por token (`requireAuth`) y expiración validada en cliente (`lib/auth.ts`), con redirección a `/login` en 401/expiración.

### 3.2 Invitados
- **RF-10** ☑ CRUD de invitados principales (`/guests`).
- **RF-11** ☑ Acompañantes anidados (relación padre-hijo): alta/edición/borrado en la misma operación que el invitado principal (transacción).
- **RF-12** ☑ Atributos: RSVP (PENDING/CONFIRMED/DECLINED), dieta, alergias, grupo de edad (adulto/niño/bebé), teléfono, email, notas.
- **RF-13** ☑ Importación masiva por lista (`POST /guests/import`) mapeando por nombre de grupo.
- **RF-14** ☑ Seguimiento de invitaciones enviadas (`PATCH /guests/invitation/sent|unsent`), con marca de fecha.

### 3.3 Grupos y mesas
- **RF-20** ☑ CRUD de grupos (`/groups`).
- **RF-21** ☑ CRUD de mesas con nº de asientos (`/tables`).
- **RF-22** ☑ Asignación manual de invitados a mesa y asiento; unicidad `(tableId, seatNumber)`; mapa visual de mesas.

### 3.4 Tareas
- **RF-30** ☑ CRUD de tareas (`/tasks`) con `title`, `notes`, `dueDate`.
- **RF-31** ☑ Prioridad (LOW/MEDIUM/HIGH), estado (PENDING/IN_PROGRESS/COMPLETED/BLOCKED) y categoría (11 categorías del dominio boda).

### 3.5 Agenda / eventos
- **RF-40** ☑ CRUD de eventos (`/events`) con fecha, hora, ubicación y descripción.
- **RF-41** ☑ Vista de calendario (FullCalendar) y cuenta atrás a la fecha de la boda.

### 3.6 Presupuesto
- **RF-50** ☑ Presupuesto global por boda (importe total + moneda, por defecto EUR).
- **RF-51** ☑ Partidas de gasto (`BudgetItem`): estimado, real, pagado, estado, fechas, proveedor (texto libre), categoría.
- **RF-52** ☑ Gráficas de reparto y seguimiento (barras + donut).

### 3.7 Proveedores
- **RF-60** ☑ CRUD de proveedores (`/providers`): categoría (15 tipos), estado (contactado→pagado), contacto, precios estimado/final, web, notas.

### 3.8 Dashboard
- **RF-70** ☑ Resumen agregado por boda (`/dashboard`): invitados por RSVP/edad, ocupación de mesas, progreso de tareas, próximos eventos, estado de presupuesto, invitaciones enviadas, proveedores y tareas próximas/vencidas.
- **RF-71** ☑ Este endpoint **ya valida la propiedad de la boda** (`ownerId: userId`) — usar como patrón de referencia para RNF-01.

---

## 4. Requisitos funcionales pendientes (MVP)

> Prioridad **P1** = necesario para un MVP presentable; **P2** = deseable; **P3** = nice-to-have.

### 4.1 Cierre de MVP y limpieza
- **RF-80** ☑ **P1** — Sustituir la navegación de plantilla por la real. `frontend/src/config/menu.ts` reescrito con la navegación real (Inicio, Tareas, Invitados, Agenda, Presupuesto, Proveedores) e iconos correctos; `app-sidebar.tsx` ahora consume `mainMenu` como fuente única de verdad (elimina la lista hardcodeada duplicada).
- **RF-81** ☑ **P1** — Eliminadas las páginas de plantilla sobrantes (`Sample`, `ComingSoon`, `Dashboard` huérfana) y sus rutas `/pages/*` en `Router.tsx`.
- **RF-82** ☑ **P1** — Página de **ajustes de boda** (`/settings`): editar nombre y fecha desde la UI. Backend: nuevo módulo `wedding` (`GET`/`PUT /weddings/:id`) con verificación de propiedad (patrón RF-71). Frontend: página `Settings.tsx`, `weddingService.ts`, entrada en el menú, y persistencia de nombre/fecha en `localStorage`. El countdown del header ya usa la fecha real de la boda (antes hardcodeada) y se refresca en vivo al guardar. Nota: la validación inválida devuelve 500 (no 400) por el middleware global de errores — pendiente en RNF-22, no específico de este módulo.

### 4.2 Autenticación completa
- **RF-83** ☑ **P1** — Endpoint de **refresh token** (`POST /auth/refresh`): recibe el `refresh`, verifica y comprueba que el usuario existe, y rota **ambos** tokens (`access` + `refresh`). Frontend: `lib/api.ts` renueva el `access` de forma silenciosa (single-flight compartido + reintento único ante 401), sin aplicarlo a los endpoints `/auth/*`; `isLoggedIn()` mantiene la sesión mientras el `refresh` siga válido, de modo que expirar el `access` ya **no** expulsa al login. La invalidación real de tokens (store de sesiones con estado) se completó en RF-84; la duración del `refresh` la controla `JWT_REFRESH_EXPIRES`.
- **RF-84** ☑ **P2** — **Logout real / invalidación de sesión.** Nueva tabla `RefreshToken` (`jti` único por sesión). `login`/`register` persisten el `jti`; `refresh` exige que el `jti` exista y no esté caducado, y al rotar **borra el anterior** (esto cierra también el hueco que quedaba en RF-83: los refresh antiguos ya no valen tras rotar). Nuevo `POST /auth/logout` (revoca el `jti`, idempotente); el `logout` del frontend lo llama antes de limpiar `localStorage`. Verificado e2e: tras logout el refresh devuelve 401; un refresh reusado tras rotación devuelve 401.
- **RF-85** ☑ **P2** — **Recuperación y cambio de contraseña.** Nueva tabla `PasswordResetToken` (guarda el **hash SHA-256** del token, caducidad 1h). `POST /auth/forgot-password` genera el token y envía email con enlace (`APP_BASE_URL/reset-password/:token`, plantilla `password-reset.template.ts`; respuesta siempre 200 para no filtrar si el email existe). `POST /auth/reset-password` valida el token, cambia la contraseña, **consume el token y revoca todas las sesiones** (borra los refresh). `POST /auth/change-password` (autenticado) verifica la contraseña actual. Frontend: páginas `/forgot-password` y `/reset-password/:token`, enlace "¿Olvidaste tu contraseña?" en Login, y formulario de cambio de contraseña en Ajustes. Verificado e2e completo (recuperar, reusar token→400, sesiones revocadas, cambiar con current correcta/incorrecta).
- **RF-86** ☑ **P3** — **Perfil de usuario editable.** `GET /auth/me` y `PATCH /auth/profile` (autenticados; valida unicidad de email con 409). Frontend: tarjeta "Perfil" en Ajustes (nombre + email). Verificado e2e (editar nombre, email duplicado→409, sin token→401).

### 4.3 Invitaciones y RSVP
- **RF-90** ☑ **P1** — **Envío real de invitaciones por email** con **Nodemailer + SMTP**. Backend: `utils/mailer.ts` (transporter perezoso; usa SMTP si hay credenciales, si no cae a cuenta de prueba **Ethereal** con URL de previsualización), plantilla HTML en español (`services/invitation.template.ts`), y `POST /guests/invitation/send` (`guest.service.sendInvitations`) que envía a los invitados PRIMARY con email, marca `invitationSent` solo los enviados con éxito y devuelve resumen `{ sent, failed, skipped, previews }`. Frontend: nuevo campo **email** en el alta/edición de invitado, y la acción "Enviar invitaciones" (bloque + por invitado) llama al envío real y muestra un banner de resultado (enviadas / sin email / con error + enlaces de previsualización en dev). Variables `.env`: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` (todas opcionales; sin ellas se usa Ethereal). Pendiente relacionado: RF-91 (página pública de RSVP con enlace único).
- **RF-91** ☑ **P2** — **Página pública de RSVP** (`/rsvp/:token`, sin login). Modelo: `Guest.rsvpToken` (único, generado al crear invitado o bajo demanda). Backend: rutas públicas **sin auth** `GET`/`POST /public/rsvp/:token` (`getRsvpByToken`/`submitRsvpByToken`) que devuelven/actualizan asistencia, dieta, alergias y RSVP de acompañantes; endpoint admin `POST /guests/:id/rsvp-link`. Frontend: página standalone donde el invitado confirma asistencia + dieta/alergias + acompañantes, y botón "copiar enlace RSVP" por invitado en la lista. La invitación por email (RF-90) incluye el botón "Confirmar asistencia" con el enlace único (`APP_BASE_URL/rsvp/:token`). Nota de arquitectura: las rutas públicas se registran **antes** que los routers protegidos, porque estos montan `router.use(requireAuth)` en la raíz e interceptarían cualquier petición posterior.
- **RF-92** ☑ **P3** — **Exportación de invitados a CSV.** Botón "Exportar CSV" en la pestaña de Invitados que genera el fichero en el cliente (Nombre, Email, Grupo, RSVP, Invitación enviada, Alergias, Acompañantes) con BOM UTF-8 para que Excel muestre los acentos.

### 4.4 Mejoras de módulos existentes
- **RF-93** ☑ **P2** — **Vincular proveedores con partidas de presupuesto**. Modelo: `BudgetItem.providerId` → relación opcional a `Provider` (`onDelete: SetNull`), conservando `supplier` como texto libre de respaldo. Backend: `budget.service`/`controller` aceptan `providerId` (validado contra la misma boda con error 400 si no pertenece) e incluyen `provider { id, name }` en el listado. Frontend: la página de Presupuesto carga los proveedores y ofrece un **selector "Proveedor vinculado"** (además del texto libre), mostrando el proveedor vinculado con distintivo en la tabla. Migración `20260719010000_link_budget_item_provider`.
- **RF-94** ☑ **P2** — **Adjuntar documentos/contratos a proveedores.** Almacenamiento en **disco local** (`uploads/provider-documents/`, gitignored) con `multer` (nombre en disco = uuid; límite 10 MB; tipos permitidos PDF/imágenes/Office validados en el controller tras guardar). Modelo `ProviderDocument` (nombre original, nombre en disco, mime, tamaño). Endpoints (con ownership por boda): `POST/GET /providers/:id/documents`, `GET /providers/:id/documents/:docId/download` (descarga autenticada), `DELETE /providers/:id/documents/:docId`. Borrar un proveedor limpia también sus ficheros de disco. Frontend: diálogo de documentos por proveedor (subir/listar/descargar/borrar); helpers `apiUpload`/`apiBlob` en `lib/api.ts`. Verificado e2e (subir, listar, descargar contenido, tipo no permitido→400, cross-user→404, borrar doc y proveedor limpian disco).
- **RF-95** ☑ **P3** — **Recordatorios in-app de tareas y pagos.** `GET /notifications?weddingId=` calcula en vivo (con ownership) las tareas no completadas y las partidas de presupuesto no pagadas/canceladas con `dueDate` **vencida o dentro de 14 días**, ordenadas por fecha y con contador de vencidos. **Estado leído/no leído**: como los recordatorios se calculan en vivo (no hay fila que marcar), el modelo `NotificationRead` guarda el acuse por usuario y boda (`key` = `task:<id>`/`payment:<id>`, más la `dueDate` que tenía al leerlo); `POST /notifications/read` marca los indicados o todos, y limpia los acuses de recordatorios que ya no existen. Un recordatorio vuelve a **no leído** si le cambian la fecha o si vence después de haberlo leído, para que la campana avise otra vez. Migración `20260921000000_add_notification_read`. Frontend: **campana en la cabecera** (`notifications-bell.tsx`) con badge que cuenta solo los **no leídos** (rojo si hay vencidos sin leer) y desplegable con enlaces a Tareas/Presupuesto; los no leídos llevan punto, se pueden marcar uno a uno o con "Marcar todo como leído", y al cerrar el desplegable se marcan como leídos los que se han visto; se refresca al abrir y cada 5 min. Verificado e2e (filtra correctamente completadas/pagadas y fuera de ventana, marca vencidos, cross-user→404; y el ciclo no leído→leído→no leído al cambiar la fecha).
- **RF-96** ☑ **P3** — **Múltiples bodas por usuario con selector de boda activa.** Backend: `GET /weddings` (lista las del usuario), `POST /weddings` (crea) y `DELETE /weddings/:id` (con ownership; impide borrar la única boda → 400). Frontend: componente `WeddingSwitcher` en la cabecera (desplegable con las bodas, marca la activa, permite cambiar y crear una nueva); al cambiar actualiza `weddingId`/nombre/fecha en `localStorage` y recarga para que todas las páginas recojan la boda seleccionada. Verificado e2e (crear/listar/borrar, no borrar la última, cross-user 404).

---

## 5. Requisitos de IA (fase posterior al MVP)

> Se integran mediante la **API de OpenAI** (SDK `openai` en el backend). El asistente conversacional queda **fuera de alcance** por decisión de producto. Todas las funciones de IA deben: (a) recibir el contexto de la boda desde la BBDD, (b) devolver **propuestas editables** que el usuario confirma antes de persistir, (c) no escribir en BBDD sin confirmación explícita del usuario.

- **IA-01** ☑ **Generación de tareas / checklist.** `POST /ai/tasks/suggest?weddingId=` (`aiTasks.service.ts`) construye el contexto de la boda (nombre, fecha, nº de invitados, tareas ya existentes para no repetir), pide al modelo entre 8 y 15 tareas con `category`/`priority`/`dueDate` (retro-planificadas desde la fecha) vía salida estructurada, y devuelve **propuestas editables sin persistir**. Frontend: botón "Generar con IA" en Tareas (visible solo si la IA está configurada) → diálogo de revisión (desmarcar las no deseadas) → alta en bloque `POST /tasks/bulk` (reutiliza `RF-30`). Verificado el fallback sin clave (503 claro) y el alta masiva; la generación real requiere `OPENAI_API_KEY`.
- **IA-02** ☑ **Distribución de mesas (seating).** `POST /ai/seating/suggest?weddingId=` (`aiSeating.service.ts`) pasa al modelo las mesas (id, nombre, capacidad) y los invitados (id, nombre, grupo) y obtiene, vía salida estructurada, una asignación `guestId → tableId + seatNumber`. Como los ids son dinámicos (no enumerables), el backend **valida y limpia** la propuesta con `utils/seating.validateAssignments` (descarta ids inexistentes, asientos fuera de capacidad, y cualquier asiento o invitado repetido) antes de devolverla — nunca persiste. Aplicación: `POST /tables/seating/apply` (`table.service.applySeatingService`) revalida y aplica en **transacción** (limpia el seating actual de la boda y coloca la propuesta, respetando `@@unique([tableId, seatNumber])`); con ownership. Frontend: botón "Distribuir con IA" en la pestaña de Mesas → diálogo de revisión agrupado por mesa (con nº de asignados/sin sitio) → "Aplicar distribución" (reemplaza el mapa) → recarga (reutiliza `RF-22`). Verificado el fallback sin clave (503), la aplicación real (descarta asignaciones inválidas) y cross-wedding 404.
- **IA-03** ☑ **Sugerencias de presupuesto y proveedores.** `POST /ai/budget/suggest?weddingId=` (`aiBudget.service.ts`) usa el presupuesto total (de `Budget`), el nº de invitados, las partidas/proveedores ya existentes y unas notas opcionales de estilo/zona para proponer (salida estructurada + Zod) un **reparto por `BudgetCategory`** con importes estimados y una **lista de proveedores** por `ProviderCategory`. Devuelve propuestas editables sin persistir. Frontend: botón "Generar con IA" en Presupuesto → diálogo con las dos listas (desmarcar + total seleccionado) → alta en bloque `POST /budget/items/bulk` y `POST /providers/bulk` (reutiliza `RF-51`/`RF-60`, ambos con verificación de propiedad). Verificado el fallback sin clave (503) y ambos bulk (create + cross-wedding 404).

**Requisitos transversales de IA**
- **IA-90** ☑ Configuración segura de `OPENAI_API_KEY` **solo en backend** (`config/env.ts`, junto a `OPENAI_MODEL` por defecto `gpt-4o-mini` y `OPENAI_TIMEOUT_MS`). El frontend nunca ve la clave; consulta `GET /ai/status` para saber si mostrar las funciones de IA.
- **IA-91** ☑ Capa `services/ai.service.ts` con `generateStructured()`: llama a OpenAI forzando **salida estructurada** (`response_format: json_schema`, `strict`) y **valida con Zod** el JSON antes de devolverlo al controlador. Cada asistente aporta su esquema Zod + JSON Schema y construye el prompt con el contexto de la boda.
- **IA-92** ☑ Coste/errores: modelo configurable, `max_tokens` acotado, `timeout` y `maxRetries` en el cliente, y **fallback claro** — 503 "IA no configurada" si falta la clave y 502 con mensaje amable si la API falla o devuelve un formato inválido (sin filtrar detalles internos).

---

## 6. Requisitos no funcionales, seguridad y calidad

> Marcados como **secundarios** respecto al MVP, pero recogidos como deuda técnica a resolver antes de la entrega final.

### 6.1 Seguridad
- **RNF-01** ☑ **P2** — **Autorización por propiedad de boda.** Implementado en dos frentes: (a) middleware `requireWeddingOwnership` (`middleware/weddingOwnership.ts`), montado tras `requireAuth` en los routers `guest`/`group`/`table`/`task`/`event`, que rechaza con 404 cualquier petición cuyo `weddingId` (query o body) no pertenezca al usuario del token — cubre listar/crear/importar/acciones masivas; (b) las rutas por `:id` (get/update/delete, enlace RSVP, asientos) filtran sus consultas de servicio por `wedding: { ownerId: userId }`, cerrando el IDOR. `dashboard`/`budget`/`provider`/`wedding` ya lo hacían inline (patrón RF-71). Verificado e2e: acceso cross-wedding a lista y por-id devuelve 404; el propietario mantiene acceso.
- **RNF-02** ☑ **P2** — **Validación estricta de secretos JWT al arrancar.** `config/env.ts` aborta el arranque si `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` faltan o valen `change_me` **en producción** (`NODE_ENV=production`); en desarrollo avisa por consola y usa el fallback para no bloquear el dev local. Verificado en aislamiento (prod+inseguro → lanza; prod+seguro → arranca).
- **RNF-03** ☑ **P3** — **Rate limiting + CORS por entorno.** `express-rate-limit` en `/api/auth/*` (ventana 15 min, `max` configurable por `AUTH_RATE_LIMIT_MAX`, por defecto 50; responde 429 al exceder). CORS: abierto en desarrollo; en producción restringido a `CORS_ORIGINS` (lista separada por comas) o, si no se define, a `APP_BASE_URL`. Verificado: 429 tras exceder el límite (instancia aislada con `max=3`) y CORS refleja el origen en dev.

### 6.2 Calidad de código
- **RNF-10** ☑ **P2** — **Unificado el cliente Prisma.** Los servicios `guest`, `task`, `dashboard`, `event`, `table`, `group` y `budget` ya no instancian `new PrismaClient()` propio: todos importan el singleton compartido `src/db/prisma.ts` (como ya hacían `auth` y `provider`).
- **RNF-11** ☑ **P2** — **Variable de entorno del frontend documentada.** `VITE_API_URL` (base de la API REST, termina en `/api`) se declara ahora explícitamente en `frontend/.env` y `.env.example`, junto a `VITE_BASE_URL` (base de assets, distinta). Documentado en `frontend/.env.example`.
- **RNF-12** ☑ **P3** — **Tests con Vitest** en el backend (18 tests, verdes). Unitarios (sin DB): `passwords`, `jwt`, plantilla de invitación (incluye escape de HTML), y el `error` middleware (RNF-22: ZodError→400, passthrough de `{status,message}`, 500 genérico). E2e con supertest (`src/app.e2e.test.ts`, contra la BBDD de desarrollo con limpieza): registro→boda auto-creada, registro duplicado→409, alta+listado de invitado, 401 sin token, 404 cross-wedding (RNF-01), 400 con mensaje limpio (RNF-22). Scripts `npm test` / `test:watch`. Pendiente: tests de frontend.
- **RNF-13** ☑ **P3** — **Pipeline CI** (`.github/workflows/ci.yml`) con dos jobs: **backend** (Postgres de servicio → `npm ci` → prisma generate → lint → build → migrate deploy → test) y **frontend** (`npm ci` → lint → build). Añadido `npm run lint` al backend (ESLint 9 flat + typescript-eslint, config `eslint.config.mjs`, ignora `src/generated`). Para que el pipeline arranque en verde: se desactivó `exactOptionalPropertyTypes` en el `tsconfig` del backend (era la única causa de los 7 errores de build, chocaba con el patrón Zod→servicios) y se excluyeron los `*.test.ts` del build; y en el frontend se bajaron a `warn` reglas de estilo/DX preexistentes (`no-explicit-any`, `react-refresh/*`, `no-unused-expressions`). Verificado en local: backend lint+build+18 tests y frontend lint+build, todo verde.

### 6.3 No funcionales generales
- **RNF-20** ☑ Interfaz **responsive** y accesible. Auditoría + arreglos: **navegación móvil** (el sidebar `w-48` se oculta en móvil `hidden md:block` y la hamburguesa abre un drawer `Sheet` con el menú, antes no hacía nada); logo con altura inválida `h-17`→`h-10 w-auto` y typo `~max-w-7xl`→`max-w-7xl` en la cabecera; superficies `bg-white`→`bg-card` en el mapa de mesas (funcionaban mal en modo oscuro); **accesibilidad**: `aria-label`/`title` en botones de solo icono (editar/eliminar/cerrar/quitar-filtro en Tareas, Presupuesto, Proveedores, Grupos, Invitados), `aria-label` en el checkbox de completar tarea, y asociación `label`↔`input` (`htmlFor`/`id`) en los formularios de auth (Login, Register, ForgotPassword, ResetPassword). La tabla ancha de Presupuesto ya tenía `overflow-x-auto`. Pendiente menor: asociar labels en algunos campos de diálogos (Agenda, TaskDialog).
- **RNF-21** ☑ Localización en español y formatos `es-ES`/EUR. El formato de fechas y moneda ya usaba `es-ES`/EUR en todas las páginas; se tradujeron los textos en inglés que quedaban: página 404 (`NotMatch`), footer, "Log out"→"Cerrar sesión", menú de tema (Claro/Oscuro/Sistema) y textos de accesibilidad (`sr-only`/`aria-label`).
- **RNF-22** ☑ **Manejo de errores uniforme.** `middleware/error.ts` centraliza: `ZodError` → **400** con mensaje legible en español (email/contraseña/campos obligatorios) + `details`; errores conocidos de Prisma mapeados (P2002→409, P2025→404, P2003→400); objetos `{ status, message }` de los servicios respetados; y 500 genérico que **no filtra** detalles internos en producción. Frontend: `lib/api.ts` extrae el `error` del cuerpo JSON (en vez del texto crudo), así los componentes muestran un mensaje limpio. Resuelve el "500 en validación" que se arrastraba en todos los controladores con Zod.

---

## 7. Convenciones al implementar

Para que cualquier cambio encaje con el código existente:

1. **Sigue la capa por dominio:** `routes → controllers (validación Zod) → services (Prisma)`. La validación va **siempre** en el controlador; la lógica y las queries en el servicio.
2. **Prisma:** importa `PrismaClient` desde `src/generated/client/client`; tras tocar `schema.prisma`, ejecuta `npm run prisma:generate` y crea migración con `npm run prisma:migrate`. Mantén sincronizados los enums de Prisma ↔ Zod ↔ tipos TS del frontend.
3. **Frontend:** todas las llamadas de red pasan por `src/lib/api.ts`; los tipos y etiquetas en español viven junto al servicio del dominio (`src/services/*Service.ts` o `src/features/*/types.ts`).
4. **Multi-tenancy:** cualquier endpoint nuevo scoped por boda debe verificar propiedad (RNF-01) además de exigir token.
5. **IA:** la clave de OpenAI y todas las llamadas a la API viven **solo en el backend**; nunca exponer `OPENAI_API_KEY` ni llamar a OpenAI desde el frontend.
6. **Al terminar un requisito, actualiza su estado en este archivo** (§3–6) en el mismo commit.

---

## 8. Roadmap sugerido

1. **Sprint MVP (P1):** RF-80, RF-81, RF-82 (limpieza + ajustes de boda) → RF-83 (refresh) → RF-90 (envío de invitaciones).
2. **Sprint RSVP y calidad (P2):** RF-91 (RSVP público), RF-93 (proveedor↔presupuesto), RNF-01/RNF-10/RNF-11.
3. **Sprint IA:** IA-90/91 (infra OpenAI) → IA-01 (tareas) → IA-03 (presupuesto) → IA-02 (seating).
4. **Cierre:** RNF-12/RNF-13 (tests + CI), pulido responsive y de errores, y memoria del TFM.

> _Última revisión: 2026-07-10. Mantener este documento vivo: es la referencia para saber qué construir a continuación._
