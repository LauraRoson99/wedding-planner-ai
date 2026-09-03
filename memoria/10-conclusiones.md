# 11. CONCLUSIONES Y LÍNEAS FUTURAS

En este capítulo se recogen las conclusiones del trabajo, contrastando lo conseguido con los
objetivos planteados, y se exponen las posibles líneas de evolución futura del proyecto.

## 11.1. Conclusiones

El problema del que parte este trabajo es la dificultad de organizar una boda de forma
centralizada. La organización de una boda exige coordinar durante meses numerosos aspectos
interdependientes —invitados, mesas, tareas, presupuesto y proveedores—. Las herramientas
existentes, orientadas a un modelo de negocio basado en el directorio de proveedores, no
automatizan las decisiones organizativas internas de la pareja. El objetivo del proyecto era
desarrollar una aplicación web que resolviera esta necesidad e incorporara, además,
asistencias basadas en inteligencia artificial.

Para dar respuesta a este problema se ha desarrollado una aplicación web completa. Esta
aplicación reúne en un único lugar la gestión de la cuenta y de varias bodas, los invitados
y sus acompañantes con confirmación de asistencia, los grupos y la distribución en mesas, las
tareas y la agenda, el presupuesto y los proveedores, y un panel de seguimiento con avisos.
Sobre esta base se han integrado tres asistencias de inteligencia artificial —generación de
tareas, distribución de mesas y reparto de presupuesto—, que operan siempre como propuestas
editables bajo la revisión y confirmación del usuario. El sistema se ha construido sobre una
arquitectura en capas, con autenticación basada en tokens y un modelo de autorización por
propiedad de boda que garantiza el aislamiento entre bodas.

En cuanto a los resultados, se han alcanzado los ocho objetivos específicos planteados y, con
ellos, el objetivo general. La aplicación se ha validado con un conjunto de datos
representativo de 64 invitados, y las asistencias de inteligencia artificial se han
comprobado mediante generaciones reales. La calidad del sistema se respalda con 18 pruebas
automatizadas del backend superadas sin errores, con una compilación y un análisis de estilo
sin errores en ambas partes del proyecto, y con un flujo de integración continua. La
principal limitación reconocida es la ausencia de pruebas automatizadas en el frontend.

Durante el desarrollo se afrontaron dificultades cuya resolución constituyó buena parte del
aprendizaje del proyecto, entre ellas la representación visual de las mesas, el aislamiento
entre bodas, la gestión de la expiración de la sesión y la codificación de los ficheros CSV.
El trabajo ha permitido, asimismo, consolidar conocimientos en el desarrollo de aplicaciones
web completas, desde el diseño de la arquitectura y el modelo de datos hasta la integración
de servicios externos y de inteligencia artificial.

## 11.2. Líneas futuras

A partir del estado actual del proyecto y de sus limitaciones, se identifican las siguientes
líneas de trabajo futuro:

- **Pruebas automatizadas del frontend.** Incorporar pruebas de componentes y de extremo a
  extremo que complementen las del backend y refuercen la prevención de regresiones.
- **Ampliación de las asistencias de IA.** Extender la inteligencia artificial a nuevas
  tareas (por ejemplo, sugerencias de proveedores o de agenda) y permitir refinar las
  propuestas de forma conversacional.
- **Aplicación móvil.** Ofrecer una versión para dispositivos móviles que facilite la
  consulta y la recepción de avisos en cualquier momento.
- **Exportación de documentos.** Permitir exportar a PDF elementos como la distribución de
  mesas, el calendario de eventos o el resumen del presupuesto.
- **Personalización del idioma.** Añadir soporte multi-idioma para llegar a un público más
  amplio.
- **Colaboración entre usuarios.** Permitir que varias personas (por ejemplo, los dos
  miembros de la pareja) gestionen una misma boda de forma compartida.

Estas líneas confirman que la aplicación, además de cumplir los objetivos del trabajo,
constituye una base sólida sobre la que seguir evolucionando el producto.
