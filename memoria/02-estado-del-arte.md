# 2. ESTADO DEL ARTE

Antes de abordar el desarrollo de la aplicación conviene situar el problema en su contexto:
qué implica organizar una boda, cómo se ha digitalizado esa tarea, qué herramientas existen
en la actualidad y qué limitaciones presentan. De ese análisis se deriva la oportunidad que
este proyecto pretende cubrir. El capítulo se cierra con una descripción de las tecnologías
y herramientas seleccionadas para la implementación, diferenciando así el **contexto del
problema** de las **decisiones técnicas** que lo resuelven.

## 2.1. La problemática de organizar una boda

Organizar una boda es un proyecto complejo y de larga duración en el que intervienen
numerosos aspectos interdependientes: la lista de invitados y el seguimiento de sus
confirmaciones, la distribución de esos invitados en las mesas del banquete, el control de
un presupuesto que se reparte entre múltiples categorías de gasto, la contratación y
seguimiento de proveedores, y una larga lista de tareas que deben completarse en un orden y
unos plazos determinados. Estos elementos no son independientes entre sí —el número de
invitados condiciona las mesas, el presupuesto y los proveedores—, lo que multiplica la
dificultad de mantener toda la información coherente y actualizada.

Tradicionalmente, esta coordinación se ha llevado con medios manuales (hojas de cálculo,
cuadernos o documentos dispersos), un enfoque propenso a errores y difícil de mantener
sincronizado. La propia estructura del dominio —una cuenta atrás de tareas organizadas por
meses, un reparto del presupuesto por categorías o la vinculación entre invitados y mesas—
se repite en las herramientas del sector, lo que evidencia que se trata de un problema bien
acotado y susceptible de ser sistematizado mediante software.

## 2.2. La digitalización de la planificación de eventos

En los últimos años, la planificación de bodas se ha trasladado progresivamente de los
medios manuales a **plataformas web y aplicaciones móviles** que centralizan la gestión. El
mercado del software de planificación de bodas se estimó en torno a 1.500 millones de dólares
en 2024, con una previsión de crecimiento sostenido en los próximos años (Growth Market
Reports, 2025). La tendencia del sector apunta a disponer de un único «centro de mando» que
reúna en un solo lugar todos los aspectos del evento: lista de invitados, mesas, presupuesto,
tareas, proveedores y comunicación con los asistentes. Estas plataformas ofrecen sus
servicios de planificación de forma gratuita para las parejas y obtienen sus ingresos de un
modelo de mercado (*marketplace*): los proveedores, los listados de regalos y los productos
de papelería (Growth Market Reports, 2025).

## 2.3. Herramientas existentes

A continuación se analizan tres de las plataformas más representativas: **Bodas.net**,
referente en el mercado español, y **The Knot** y **Zola**, dos de las plataformas líderes
en el mercado internacional.

### 2.3.1. Bodas.net

Bodas.net es una de las plataformas de referencia en España, con un punto fuerte en su
extenso directorio de proveedores clasificados por categoría y localización. Entre sus
herramientas gratuitas de organización incluye un **gestor de invitados** que permite
agruparlos (familiares, amigos, compañeros de trabajo) y controlar su asistencia; un
**organizador de mesas** de tipo «arrastrar y soltar», vinculado a la lista de invitados,
con distintos tipos de mesa; un **presupuestador** que realiza una estimación automática de
gasto por categoría, editable por el usuario; una **agenda de tareas** organizada por meses
a modo de cuenta atrás; y la creación de una **web de boda** personalizada para compartir la
información con los invitados. Toda la información se sincroniza entre la versión web y la
aplicación móvil (Bodas.net, s.f.).

### 2.3.2. The Knot

The Knot es una de las plataformas líderes en Estados Unidos. Ofrece una **lista de
invitados** con recogida de direcciones y seguimiento de confirmaciones (RSVP) por evento,
una herramienta de **plano de mesas**, un **asesor de presupuesto** (*Budget Advisor*) que
estima el coste medio de la boda y su reparto por proveedor a partir de datos reales de
otras parejas en cada localización, una **lista de tareas** personalizable según la fecha, y
una **web de boda** gratuita que sirve también para recoger las confirmaciones. En cuanto a
inteligencia artificial, The Knot incorpora ayuda para recomendar proveedores
(fotógrafos, floristas o espacios) que se ajusten al presupuesto y al estilo indicados por la
pareja (The Knot, s.f.).

### 2.3.3. Zola

Zola se presenta como una solución «todo en uno» que reúne web, listado de regalos, lista de
invitados y presupuesto en una misma aplicación. Su **lista de tareas** se reorganiza
automáticamente en función de la fecha de la boda; su **gestor de invitados** recoge
direcciones, confirmaciones, elección de menú e incluso peticiones musicales; su **plano de
mesas** funciona por «arrastrar y soltar» y permite exportar el resultado a PDF; y su
**seguimiento de presupuesto** ofrece sugerencias de reparto y recordatorios de pago. Zola
incorpora además una función de IA para redactar mensajes de agradecimiento personalizados.
Su servicio básico es gratuito, si bien algunas herramientas avanzadas, como el plano de
mesas, tienen un coste adicional (Zola, s.f.).

### 2.3.4. Comparativa

La Tabla 2.1 resume las funcionalidades de las tres plataformas frente a la aplicación
desarrollada en este proyecto.

**Tabla 2.1.** Comparativa de funcionalidades entre las plataformas existentes y este
proyecto.

| Funcionalidad | Bodas.net | The Knot | Zola | Este proyecto |
|---|---|---|---|---|
| Invitados y RSVP | Sí | Sí | Sí | Sí (con acompañantes) |
| Grupos de invitados | Sí | Sí | Sí | Sí |
| Distribución de mesas | Sí | Sí | Sí (de pago) | Sí |
| Tareas / checklist | Sí | Sí | Sí | Sí |
| Presupuesto | Sí | Sí | Sí | Sí |
| Proveedores | Sí (directorio) | Sí (directorio) | Sí (directorio) | Sí (gestión propia + documentos) |
| RSVP público / web | Sí | Sí | Sí | Sí (enlace público) |
| IA | Limitada | Recomendación de proveedores | Redacción de textos | Propuestas de tareas, mesas y presupuesto |
| Modelo | Gratuito (marketplace) | Gratuito (marketplace) | Gratuito (marketplace) | No comercial (TFM) |

## 2.4. Limitaciones y oportunidad

Del análisis anterior se desprenden varias observaciones. En primer lugar, las plataformas
existentes están construidas alrededor de un **modelo de negocio basado en el directorio de
proveedores y el listado de regalos**: las herramientas de organización, aun siendo útiles y
completas, son un complemento de ese modelo, y algunas prestaciones concretas —como el plano
de mesas de Zola— pueden requerir un pago adicional. En segundo lugar, la **inteligencia
artificial** que estas plataformas han empezado a incorporar se orienta principalmente a su
negocio (recomendación de proveedores) o a tareas de comunicación (redacción de mensajes),
más que a **automatizar las decisiones organizativas internas** de la pareja.

Existe, por tanto, la oportunidad de plantear una aplicación **integrada y autocontenida**,
sin la capa de directorio comercial, en la que la inteligencia artificial se aplique
precisamente a las decisiones más tediosas de la organización —**generar el listado de
tareas, distribuir a los invitados en las mesas y repartir el presupuesto por categorías**—
y lo haga en forma de **propuestas editables que la pareja revisa y confirma**. Esta es la
propuesta de valor que persigue este proyecto y que lo diferencia de las soluciones
analizadas.

## 2.5. Tecnologías y herramientas seleccionadas

Una vez situado el problema, se describen las tecnologías elegidas para la implementación.
La aplicación se estructura en dos partes —cliente y servidor— desarrolladas ambas con
**TypeScript**, un superconjunto de JavaScript que añade tipado estático y reduce los
errores en tiempo de desarrollo (Microsoft, s.f.).

**Cliente.** La interfaz se ha construido con **React** (Meta Open Source, s.f.), una
biblioteca para construir interfaces de usuario basada en componentes reutilizables. Frente
a alternativas como Angular —un framework más completo pero también más pesado y
prescriptivo— o Vue, se optó por React por su modelo de componentes sencillo, su enorme
ecosistema y su amplia adopción, lo que facilita encontrar documentación y bibliotecas de
apoyo. Como herramienta de construcción se eligió **Vite** (Vite, s.f.) en lugar de
empaquetadores tradicionales como Webpack o de Create React App: Vite ofrece un servidor de
desarrollo de arranque casi instantáneo y una recarga en caliente muy rápida, al apoyarse en
los módulos nativos de JavaScript del navegador durante el desarrollo y en un empaquetado
optimizado solo para la compilación de producción. Para los estilos se utilizó **Tailwind
CSS** (Tailwind Labs, s.f.), un framework de utilidades que, a diferencia de bibliotecas de
componentes cerradas como Bootstrap, aplica clases atómicas directamente en el marcado y
evita escribir CSS a medida, lo que da consistencia visual y rapidez. Sobre él se empleó
**shadcn/ui** (shadcn, s.f.), una colección de componentes accesibles construidos sobre
Radix UI que se integran en el propio proyecto y se pueden personalizar, en lugar de depender
de una biblioteca externa con una estética impuesta. Para las gráficas y el calendario se
emplearon bibliotecas especializadas.

**Servidor.** Se ha empleado **Node.js** (OpenJS Foundation, s.f.-b) con el framework
**Express** (OpenJS Foundation, s.f.-a), que facilita la creación de una API REST (interfaz
de programación de aplicaciones). Se prefirió Express frente a alternativas como NestJS
—más estructurado, pero con un andamiaje y una curva de aprendizaje mayores— o Fastify, por
su madurez, su simplicidad y su extenso catálogo de *middlewares*, adecuados para un
proyecto de este tamaño. La validación de las entradas se realiza con **Zod** (Zod, s.f.),
una biblioteca que define esquemas de validación en tiempo de ejecución y, a la vez, **infiere
de ellos los tipos de TypeScript**, de modo que una única definición sirve para validar y
tipar; frente a alternativas como Joi o class-validator, Zod destaca por esa integración con
el sistema de tipos. El acceso a datos se realiza mediante el ORM (mapeador
objeto-relacional) **Prisma** (Prisma, s.f.), que a partir de un esquema declarativo genera
un cliente con tipado estático y gestiona las migraciones de la base de datos; frente a ORM
basados en decoradores como TypeORM o Sequelize, Prisma mantiene una única fuente de verdad
entre el esquema, los tipos y la base de datos. Como sistema gestor se eligió **PostgreSQL**
(PostgreSQL Global Development Group, s.f.), un sistema relacional de código abierto
ampliamente contrastado, preferido frente a MySQL por su rigor en la integridad referencial
y su soporte de tipos avanzados (como los arrays empleados en el modelo de invitados). El
entorno de base de datos se ejecuta en un contenedor **Docker** (Docker Inc., s.f.) para
simplificar su puesta en marcha y reproducibilidad.

Por último, las asistencias de inteligencia artificial se apoyan en la **API de OpenAI**
(OpenAI, s.f.), invocada exclusivamente desde el servidor. La Tabla 2.2 resume las
principales decisiones tecnológicas, las alternativas consideradas y el motivo de cada
elección. La justificación detallada de estas decisiones y su uso concreto se desarrollan en
los capítulos de diseño (capítulo 7) e implementación (capítulo 8).

**Tabla 2.2.** Principales decisiones tecnológicas y alternativas consideradas.

| Ámbito | Elección | Alternativas consideradas | Motivo principal |
|---|---|---|---|
| Lenguaje | TypeScript | JavaScript | Tipado estático; menos errores en desarrollo |
| Interfaz | React | Angular, Vue | Modelo de componentes y ecosistema amplio |
| Construcción | Vite | Webpack, Create React App | Arranque y recarga en caliente muy rápidos |
| Estilos | Tailwind CSS + shadcn/ui | Bootstrap, Material UI | Utilidades atómicas y componentes accesibles y personalizables |
| Servidor | Node.js + Express | NestJS, Fastify | Madurez, simplicidad y ecosistema de *middlewares* |
| Validación | Zod | Joi, class-validator | Validación e inferencia de tipos desde un único esquema |
| Acceso a datos | Prisma | TypeORM, Sequelize | Esquema declarativo y cliente con tipado estático |
| Base de datos | PostgreSQL | MySQL | Integridad referencial y tipos avanzados |
