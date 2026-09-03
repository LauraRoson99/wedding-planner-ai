# 10. RESULTADOS

Este capítulo evalúa en qué medida se han alcanzado los objetivos planteados en el
capítulo 3. Para ello se recuperan los objetivos específicos, se relacionan con los
requisitos que los materializan (capítulo 6) y con las pruebas que los verifican
(capítulo 9), y se valora su grado de cumplimiento. Se describen además los resultados
obtenidos, los resultados no previstos inicialmente y las limitaciones detectadas.

## 10.1. Grado de cumplimiento de los objetivos

La Tabla 10.1 resume el estado de cada objetivo específico al finalizar el proyecto,
apoyándose en los requisitos asociados y en su verificación.

**Tabla 10.1.** Grado de cumplimiento de los objetivos específicos.

| Objetivo | Requisitos | Estado | Evidencia |
|---|---|---|---|
| OE-1. Cuenta y bodas | RF-01…RF-09, RNF-01/02 | Alcanzado | Registro, inicio de sesión y gestión de varias bodas aisladas; verificado por pruebas |
| OE-2. Invitados | RF-10…RF-16, RF-80/81 | Alcanzado | Alta con acompañantes, RSVP, invitaciones y confirmación pública (Fig. 8.1) |
| OE-3. Grupos y mesas | RF-20…RF-24 | Alcanzado | Grupos y mapa de mesas con asignación de asientos (Fig. 8.2) |
| OE-4. Tareas y agenda | RF-30, RF-31, RF-40, RF-41 | Alcanzado | Gestión de tareas y calendario de eventos |
| OE-5. Gestión económica | RF-50…RF-52, RF-60…RF-62 | Alcanzado | Presupuesto con gráficas, proveedores y documentos (Fig. 8.3) |
| OE-6. Seguimiento global | RF-70, RF-71 | Alcanzado | Panel de seguimiento y avisos (Fig. 8.4) |
| OE-7. Asistencias con IA | IA-01…IA-03, IA-90…IA-92 | Alcanzado | Generación real de propuestas de tareas, mesas y presupuesto (Fig. 8.5) |
| OE-8. Calidad | RNF-03, RNF-10…RNF-13, RNF-20…RNF-23 | Alcanzado (con matices) | 18 pruebas del backend en verde, integración continua, interfaz responsive y localizada; sin pruebas automatizadas de frontend |

Los **ocho objetivos específicos se han alcanzado**, y con ellos el objetivo general de
disponer de una aplicación web integral para la organización de una boda con asistencias de
inteligencia artificial. El único matiz relevante afecta a OE-8: la calidad se ha atendido
en seguridad, usabilidad, robustez, pruebas del backend e integración continua, pero el
frontend no cuenta todavía con pruebas automatizadas propias.

## 10.2. Resultados de la aplicación

El resultado principal es una **aplicación funcional y completa** que cubre el ciclo de
organización de una boda. Para comprobar su comportamiento con un volumen realista se cargó
un conjunto de datos de demostración correspondiente a una boda con **64 invitados** (50
principales y 14 acompañantes), 6 grupos, 9 mesas, 18 tareas, 7 eventos, 11 proveedores y un
presupuesto con 12 partidas.

Sobre ese conjunto, el **panel de seguimiento** (Fig. 8.4) agrega correctamente el estado de
la boda —invitaciones enviadas, proveedores, progreso de tareas, estado del presupuesto,
reparto de invitados por asistencia y próximas tareas—, y la **cuenta atrás** refleja el
tiempo restante hasta la fecha de la boda. Los distintos módulos operan de forma coherente
sobre esos datos, como muestran las capturas del capítulo 8 y del Anexo B.

Especial mención merecen las **asistencias de inteligencia artificial**, que constituían el
elemento diferenciador del proyecto. La Figura 8.5 muestra una **generación real** del
asistente de tareas: a partir del contexto de la boda, la IA propuso un conjunto de tareas
con su categoría, prioridad y fecha, presentadas como propuestas editables que el usuario
puede revisar y confirmar antes de crearlas. Las tres asistencias —tareas, distribución de
mesas y presupuesto— funcionan siguiendo este mismo principio de propuesta editable bajo
control del usuario.

Desde el punto de vista de la **calidad técnica**, la batería de pruebas del backend se
ejecuta sin errores (18 pruebas superadas), y tanto el análisis de estilo como la
compilación de ambas partes del proyecto finalizan correctamente (capítulo 9).

## 10.3. Resultados no previstos

Durante el desarrollo surgieron mejoras que, sin estar planteadas explícitamente al inicio,
aportaron valor al producto final:

- Un **sistema de avisos (toasts)** y un **diálogo de confirmación** comunes a toda la
  aplicación, que unifican la retroalimentación al usuario y protegen las acciones
  destructivas.
- El **borrado masivo** de invitados y la **asignación masiva** a un grupo, que agilizan la
  gestión de listas grandes.
- Una **importación CSV enriquecida** que crea los grupos que no existan y resuelve los
  problemas de codificación al abrir los ficheros en Excel.

## 10.4. Desviaciones y limitaciones

El proyecto presenta también algunas limitaciones que conviene reconocer:

- **Ausencia de pruebas automatizadas en el frontend**, cuya validación se apoya en la
  compilación con verificación de tipos y en las pruebas funcionales manuales.
- **Dependencia de un servicio externo** para las asistencias de IA, con el coste asociado a
  su uso; el sistema está diseñado para degradar con elegancia si la IA no está disponible.
- El **envío de correo** en el entorno de desarrollo utiliza una cuenta de prueba; un
  despliegue real requiere configurar un servidor SMTP.

Estas limitaciones no comprometen los objetivos alcanzados y se retoman, como posibles vías
de mejora, en el capítulo de conclusiones.
