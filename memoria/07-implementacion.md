# 8. IMPLEMENTACIÓN

Este capítulo describe cómo se ha llevado a la práctica el diseño del capítulo 7. No se
detalla el código archivo por archivo —lo que resultaría extenso y poco útil— sino que se
seleccionan los aspectos con mayor relevancia técnica: la estructura e inicialización del
proyecto, la parte del cliente, la parte del servidor, un conjunto de funcionalidades
destacadas por su lógica y, por último, la integración de la inteligencia artificial. Los
fragmentos de código se incluyen únicamente cuando ayudan a explicar una decisión; las
capturas de las pantallas se recogen en este capítulo y, de forma guiada, en el Anexo B.

## 8.1. Estructura e inicialización del proyecto

El proyecto se organiza en un único repositorio con dos carpetas independientes,
`frontend` y `backend`, cada una con sus propias dependencias y scripts. Esta separación
permite desarrollar, probar y desplegar ambas partes por separado.

**Inicialización del backend.** El servidor se construye sobre Express. Al arrancar,
encadena una serie de *middlewares* en un orden significativo: cabeceras de seguridad,
control de origen (CORS) según el entorno, registro de peticiones, análisis del cuerpo
JSON, limitación de frecuencia en las rutas de autenticación y, finalmente, el enrutador
principal montado bajo `/api`. El **manejador central de errores** se registra en último
lugar, de modo que captura cualquier fallo producido en las capas anteriores. La
configuración sensible (cadena de conexión, secretos de firma, credenciales de correo y de
IA) se externaliza en variables de entorno que se **validan al arranque**: en producción,
la ausencia o el uso de valores inseguros en los secretos de sesión aborta el inicio
(RNF-02).

**Acceso a datos con Prisma.** La persistencia es uno de los puntos donde la elección
tecnológica tuvo mayor impacto en la productividad, por lo que merece un detalle específico.
Prisma sigue un enfoque *schema-first*: el modelo de datos se declara en un único fichero de
esquema y, a partir de él, el comando `prisma generate` produce automáticamente un cliente
de acceso a datos con **tipado estático de extremo a extremo**, mientras que `prisma migrate`
deriva y aplica las **migraciones** versionadas sobre la base de datos. El siguiente
fragmento del esquema muestra la entidad de invitados, con su relación reflexiva (un invitado
principal y sus acompañantes), la propagación de borrados en cascada desde la boda y la
restricción de unicidad que impide asignar dos veces el mismo asiento:

```prisma
model Guest {
  id         String     @id @default(cuid())
  name       String
  weddingId  String
  wedding    Wedding    @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  groupId    String?
  tableId    String?
  seatNumber Int?
  role       GuestRole  @default(PRIMARY)
  rsvp       RsvpStatus @default(PENDING)
  allergies  String[]   @default([])
  parentId   String?
  parent     Guest?     @relation("GuestCompanions", fields: [parentId], references: [id], onDelete: Cascade)
  companions Guest[]    @relation("GuestCompanions")

  @@unique([tableId, seatNumber])
}
```

**Cuadro 8.1.** Declaración del modelo de invitados (`Guest`) en el esquema de Prisma. _Fuente: elaboración propia._

A partir de esta declaración, el cliente generado ofrece métodos cuyos nombres y tipos se
derivan del propio modelo (`prisma.guest.findMany`, `create`, `update`…): referirse a un
campo inexistente o asignar un tipo incorrecto se detecta en **tiempo de compilación**, no en
ejecución. Los enumerados del dominio (`GuestRole`, `RsvpStatus`, etc.) se declaran en el
mismo esquema, lo que garantiza su integridad a nivel de base de datos, y las claves foráneas
fijan el comportamiento ante borrados (cascada hacia los hijos de la boda, `SetNull` cuando
la relación es opcional). Frente a ORM basados en decoradores como TypeORM, este enfoque
reduce el esquema, los tipos de TypeScript y la estructura real de la base de datos a una
**única fuente de verdad**. Un script de **semilla** completa la inicialización creando datos
de demostración (un usuario de prueba con su boda) para facilitar el desarrollo y las
pruebas.

**Inicialización del frontend.** La aplicación se construye con Vite y React. El punto de
entrada monta el árbol de componentes —proveedor de tema, enrutador y sistema de avisos— y
delega en el enrutador la selección de la página según la URL. A partir de ahí, cada página
consume los servicios de dominio para obtener y modificar los datos.

La estructura de carpetas del proyecto es la siguiente:

```
wedding-planner-ai/
├── backend/            # API REST (Express + TypeScript + Prisma)
│   ├── prisma/         # esquema, migraciones y semilla de datos
│   └── src/
│       ├── routes/         # definición de la API
│       ├── controllers/    # validación de la entrada
│       ├── services/       # lógica de negocio y acceso a datos
│       ├── middleware/     # autenticación, propiedad de boda y errores
│       └── utils/          # utilidades (contraseñas, tokens, correo)
└── frontend/           # aplicación de página única (React + TypeScript + Vite)
    └── src/
        ├── pages/          # páginas de la aplicación
        ├── components/     # componentes reutilizables
        ├── services/       # acceso a la API por dominio
        └── lib/            # capa de API, autenticación y utilidades
```

**Cuadro 8.2.** Estructura de carpetas del proyecto. _Fuente: elaboración propia._

## 8.2. Parte del cliente

**Capa única de acceso a la API.** Todas las llamadas de red pasan por un módulo que expone
funciones equivalentes a los verbos HTTP (`apiGet`, `apiPost`, `apiPut`, `apiPatch`,
`apiDelete`, además de utilidades para subir ficheros y descargar binarios). Esta capa
centraliza tres responsabilidades transversales: **inyectar el *token*** de sesión en la
cabecera de cada petición, **renovar la sesión** de forma transparente cuando el servidor
responde que el *token* de acceso ha expirado (reintentando la petición una sola vez y
compartiendo una única renovación entre llamadas concurrentes), y **extraer el mensaje de
error** del cuerpo de la respuesta para que los componentes muestren siempre un texto
limpio. Concentrar esta lógica en un único punto evita repetirla en cada pantalla y
garantiza un comportamiento uniforme.

Sobre esa capa, **cada dominio dispone de su propio servicio** (invitados, tareas,
presupuesto, etc.), que encapsula sus operaciones y coloca junto a ellas los tipos y las
**etiquetas en español** de los valores enumerados (por ejemplo, la traducción de los
estados de un proveedor). El **estado de sesión** —tokens y boda activa— se guarda en el
almacenamiento local del navegador; antes de cualquier operación con alcance de boda, la
aplicación recupera de ahí la boda seleccionada.

**Navegación e interfaz.** El enrutador distingue las rutas públicas de las protegidas
(estas últimas envueltas en una guarda de sesión y en la disposición principal, con
cabecera y menú lateral). El menú se declara en un único lugar y alimenta tanto la barra
lateral de escritorio como el panel deslizante en móvil.

La reutilización de componentes es un pilar de la coherencia visual. Dos ejemplos
transversales: un sistema de **avisos (toasts)** que confirma el resultado de cada acción, y
un **diálogo de confirmación** común a todas las operaciones destructivas. El patrón de uso
es homogéneo en toda la aplicación:

```tsx
try {
  await apiDelete(`/tasks/${task.id}`);
  toast.success("Tarea eliminada");
} catch (e) {
  toastError(e); // muestra el mensaje limpio extraído por la capa de API
}
```

**Cuadro 8.3.** Patrón de borrado con aviso y manejo de errores en el cliente. _Fuente: elaboración propia._

De este modo, acciones equivalentes se comportan igual en cualquier pantalla y el usuario
recibe siempre una respuesta clara de lo que ha ocurrido (RNF-23).

## 8.3. Parte del servidor

La lógica del servidor sigue el flujo en capas descrito en el diseño: **ruta →
controlador → servicio**. El controlador valida la entrada con un **esquema de Zod** y delega
en el servicio, que contiene la lógica y el acceso a datos. El uso de Zod es representativo de
una de las decisiones técnicas del proyecto: un mismo esquema valida los datos en tiempo de
ejecución y, a la vez, **infiere el tipo de TypeScript** de la entrada ya validada, evitando
declararlo por separado. Además, cuando la validación falla, Zod produce un error que el
manejador central traduce a una respuesta 400 con un mensaje legible (RNF-22):

```ts
const createGuestSchema = z.object({
  name: z.string().min(1),
  groupId: z.string().optional(),
  rsvp: z.enum(["PENDING", "CONFIRMED", "DECLINED"]).default("PENDING"),
  allergies: z.array(z.string()).default([]),
  companions: z.array(z.object({ name: z.string().min(1) })).default([]),
});

// En el controlador: valida y, si es correcto, delega en el servicio.
const data = createGuestSchema.parse(req.body); // data queda tipado
const guest = await guestService.createWithCompanions(weddingId, data);
```

**Cuadro 8.4.** Validación de la entrada con Zod en el controlador. _Fuente: elaboración propia._

El siguiente fragmento ilustra el patrón en la capa de servicio con el alta de un invitado y
sus acompañantes, que debe ser **atómica** (o se crean todos, o no se crea ninguno) y por
tanto se resuelve en una **transacción**:

```ts
return prisma.$transaction(async (tx) => {
  const primary = await tx.guest.create({
    data: { weddingId, name, role: "PRIMARY", groupId, allergies },
  });
  if (companions.length) {
    await tx.guest.createMany({
      data: companions.map((c) => ({
        weddingId, parentId: primary.id, role: "COMPANION", name: c.name,
      })),
    });
  }
  return tx.guest.findUnique({
    where: { id: primary.id },
    include: { companions: true },
  });
});
```

**Cuadro 8.5.** Alta transaccional de un invitado y sus acompañantes. _Fuente: elaboración propia._

Dos *middlewares* completan la capa de servidor. El de **propiedad de boda** (RNF-01)
intercepta las operaciones con alcance de boda y rechaza con 404 cualquier `weddingId` que
no pertenezca al usuario del *token*. El **manejador de errores** (RNF-22) traduce cualquier
excepción a una respuesta JSON homogénea: errores de validación a 400 con mensaje en
español, conflictos de la base de datos a su código HTTP correspondiente, y errores
inesperados a un 500 genérico que no filtra detalles internos.

Por último, el servidor integra dos servicios externos. El **envío de correo** utiliza un
transportador que se inicializa de forma perezosa: si hay credenciales SMTP configuradas
las usa, y en caso contrario recurre a una **cuenta de prueba** que no entrega el correo a
destinatarios reales pero devuelve un enlace de previsualización, lo que permite desarrollar
y probar el envío de invitaciones sin infraestructura de correo. La **subida de documentos**
de proveedores se gestiona con almacenamiento en disco, asignando a cada fichero un nombre
único y validando su tipo y tamaño.

## 8.4. Funcionalidades destacadas

### 8.4.1. Invitados, acompañantes e importación

El módulo de invitados es el más rico del sistema. Además del alta transaccional de
acompañantes ya mostrada, incorpora una **importación masiva** desde CSV que crea el grupo
indicado si no existe, y un **borrado masivo** de invitados seleccionados.

La importación planteó un problema práctico relevante: al abrir un CSV en la versión
española de Excel, los **acentos y la «ñ» se corrompían** y **todo el contenido caía en una
sola columna**. La causa es doble: Excel espera la codificación local salvo que el fichero
declare UTF-8 mediante una marca de orden de bytes (BOM), y en la configuración regional
española el separador de columnas por defecto es el punto y coma, no la coma. La solución
fue anteponer la marca UTF-8 y emplear el punto y coma como separador, de modo que el
mismo fichero se ve correctamente —columnas y acentos— sin que el usuario tenga que
configurar nada. El analizador de importación, además, ignora la fila de cabecera y las
líneas auxiliares para que una plantilla descargada pueda rellenarse y reimportarse sin
cambios.

La Figura 8.1 muestra la pantalla de gestión de invitados.

![Gestión de invitados](figuras/capturas/invitados.png)

**Figura 8.1.** Pantalla de gestión de invitados, con acompañantes, estado de asistencia e
invitación. _Fuente: elaboración propia._

### 8.4.2. Grupos y mesas: la distribución visual

La asignación de invitados a mesas fue uno de los puntos que más iteración requirió, no por
la lógica de datos sino por **cómo representarla visualmente** de forma que resultara clara.
Se optó por un **mapa de mesas** en el que cada mesa muestra sus asientos y el usuario
asigna un invitado seleccionado a un asiento concreto. A nivel de datos, la integridad de la
asignación se garantiza con la restricción de unicidad sobre la pareja (mesa, asiento)
descrita en el diseño, de modo que es imposible colocar a dos personas en el mismo sitio.
Se añadieron además acciones para **liberar un asiento** o **vaciar una mesa** por completo.

La Figura 8.2 muestra el mapa de mesas con la distribución de invitados.

![Mapa de mesas](figuras/capturas/mesas.png)

**Figura 8.2.** Mapa de mesas con la asignación de invitados a asientos. _Fuente:
elaboración propia._

### 8.4.3. Presupuesto y proveedores

El módulo de presupuesto permite definir un importe global y gestionar partidas de gasto con
su categoría, importes estimado, real y pagado, y estado. La información se resume en
**gráficas** de reparto por categoría y de seguimiento del gasto. Cada partida puede
**vincularse a un proveedor**, lo que conecta ambos módulos y evita duplicar información. Los
proveedores, a su vez, admiten **documentos adjuntos** (contratos o presupuestos) que se
suben, listan, descargan y eliminan desde la ficha del proveedor.

La Figura 8.3 muestra la gestión del presupuesto.

![Gestión del presupuesto](figuras/capturas/presupuesto.png)

**Figura 8.3.** Gestión del presupuesto con sus gráficas de reparto y seguimiento. _Fuente:
elaboración propia._

### 8.4.4. Panel de seguimiento y avisos

La página de inicio ofrece un **panel** que agrega el estado de la boda: distribución de
invitados por asistencia y edad, ocupación de mesas, progreso de tareas, estado del
presupuesto, invitaciones enviadas y próximos eventos. De forma complementaria, un sistema
de **avisos** calcula en el momento las tareas sin completar y los pagos pendientes cuya
fecha está vencida o próxima, y los presenta en una campana de notificaciones en la
cabecera. Ambos se calculan siempre acotados a la boda del usuario (RNF-01).

La Figura 8.4 muestra el panel de seguimiento de la boda.

![Panel de seguimiento](figuras/capturas/dashboard.png)

**Figura 8.4.** Panel de seguimiento de la boda. _Fuente: elaboración propia._

## 8.5. Integración de la inteligencia artificial

Las tres asistencias con IA comparten una misma infraestructura, diseñada en torno a dos
principios: **fiabilidad del formato** y **control del usuario**.

La fiabilidad se consigue con una capa común que solicita a la IA una respuesta en
**formato estructurado** (un esquema JSON estricto) y **valida** el resultado contra ese
mismo esquema antes de devolverlo. Si la respuesta no cumple el formato esperado, no se
utiliza. Cada asistente aporta su esquema y construye el contexto de la boda a partir de la
base de datos: por ejemplo, el asistente de tareas recibe la fecha de la boda, el número de
invitados y las tareas ya existentes para no repetirlas.

Esta fiabilidad se apoya en una técnica reciente de la API de OpenAI, los ***structured
outputs***: la llamada se realiza con `response_format` de tipo `json_schema` en modo
`strict`, lo que **obliga al modelo a devolver un JSON que se ajusta exactamente al esquema
indicado**, en lugar de texto libre que habría que interpretar. Aun así, como capa de defensa
adicional, la respuesta se vuelve a validar en el servidor con el esquema de Zod
correspondiente antes de usarse (IA-91); si no supera esa validación, se descarta y se
informa al usuario sin exponer detalles internos (IA-92). Toda esta lógica se concentra en
una única función `generateStructured`, que cada asistente reutiliza aportando su esquema y
su contexto:

```ts
const completion = await openai.chat.completions.create({
  model: env.ai.model,
  temperature: 0.4,
  messages: [
    { role: "system", content: opts.system },
    { role: "user", content: opts.user },
  ],
  response_format: {
    type: "json_schema",
    json_schema: { name: opts.schemaName, schema: opts.jsonSchema, strict: true },
  },
});

// Segunda barrera: validar la respuesta con Zod antes de devolverla.
const validated = opts.schema.safeParse(JSON.parse(content));
if (!validated.success) {
  throw { status: 502, message: "La respuesta de la IA no cumple el formato esperado." };
}
return validated.data;
```

**Cuadro 8.6.** Llamada a la IA con salida estructurada (`json_schema`) y validación con Zod. _Fuente: elaboración propia._

El control del usuario se garantiza porque las funciones de IA **nunca escriben en la base
de datos directamente**: devuelven **propuestas editables** que el usuario revisa —pudiendo
descartar los elementos que no desee— y solo entonces se persisten mediante los mismos
endpoints de alta que el resto de la aplicación. Así, la generación de tareas confirmadas
reutiliza el alta de tareas, y la de presupuesto y proveedores, sus respectivas altas.

La asistencia de **distribución de mesas** merece una mención especial. Como los
identificadores de mesas e invitados son dinámicos y no pueden enumerarse por adelantado en
el esquema, la propuesta de la IA podría contener referencias inválidas. Por ello, el
servidor **valida y depura** la propuesta antes de mostrarla —descartando identificadores
inexistentes, asientos fuera de capacidad y cualquier asiento o invitado repetido— y,
cuando el usuario la acepta, la aplica en una **transacción** que respeta la restricción de
unicidad de asientos.

Respecto a la seguridad y la robustez, la clave de acceso a la IA reside **exclusivamente
en el backend** (IA-90); el cliente solo consulta un indicador de estado para mostrar u
ocultar las funciones de IA. Ante un fallo, el sistema **degrada con elegancia**: informa de
forma clara si la funcionalidad no está configurada y muestra un mensaje amable si la API
falla, sin exponer detalles internos.

La Figura 8.5 muestra el diálogo de revisión de una propuesta generada por la inteligencia artificial.

![Propuesta de tareas generada por IA](figuras/capturas/ia-tareas.png)

**Figura 8.5.** Diálogo de revisión de una propuesta de tareas generada por la inteligencia
artificial, antes de confirmarla. _Fuente: elaboración propia._
