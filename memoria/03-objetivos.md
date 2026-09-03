# 3. OBJETIVOS

Este capítulo establece los objetivos del Trabajo Fin de Máster. Se distingue entre un
**objetivo general**, que resume la meta global del proyecto, y un conjunto de **objetivos
específicos**, más concretos y verificables, que se traducen posteriormente en los
requisitos del sistema (capítulo 6) y cuyo grado de cumplimiento se evalúa en los resultados
(capítulo 10).

## 3.1. Objetivo general

El objetivo general del proyecto es **desarrollar una aplicación web que permita a una
pareja organizar de forma integral y centralizada todos los aspectos de su boda** —invitados,
grupos, mesas, tareas, agenda, presupuesto y proveedores— desde un único panel, incorporando
además un conjunto de **asistencias basadas en inteligencia artificial** que automaticen las
decisiones organizativas más tediosas y actúen como elemento diferenciador frente a las
soluciones existentes.

## 3.2. Objetivos específicos

Para alcanzar el objetivo general se definen los siguientes objetivos específicos:

- **OE-1. Gestión de la cuenta y de las bodas.** Proporcionar un sistema de registro e
  inicio de sesión seguro que permita a cada usuario gestionar una o varias bodas de forma
  aislada.
- **OE-2. Gestión de invitados.** Permitir el registro completo de invitados y sus
  acompañantes, con seguimiento de la asistencia (RSVP), el envío de invitaciones y una vía
  para que los invitados confirmen su asistencia.
- **OE-3. Organización de grupos y mesas.** Ofrecer la agrupación de invitados y la
  asignación de estos a las mesas y asientos del banquete de forma visual.
- **OE-4. Planificación de tareas y agenda.** Facilitar la gestión de las tareas
  pendientes y de los eventos del calendario asociados a la boda.
- **OE-5. Gestión económica.** Permitir el control del presupuesto y de los proveedores, y
  la relación entre ambos.
- **OE-6. Seguimiento global.** Proporcionar un panel que resuma el estado de la boda y un
  sistema de avisos sobre tareas y pagos próximos o vencidos.
- **OE-7. Asistencias con inteligencia artificial.** Integrar asistencias que propongan
  automáticamente un listado de tareas, una distribución de mesas y un reparto de
  presupuesto, siempre bajo la revisión y confirmación del usuario.
- **OE-8. Calidad del producto.** Construir la aplicación atendiendo a la seguridad, la
  usabilidad (interfaz responsive y localizada), la robustez frente a errores y la calidad
  del código (pruebas e integración continua).

## 3.3. Relación de los objetivos con los requisitos

La Tabla 3.1 relaciona cada objetivo específico con los requisitos que lo materializan
(definidos en el capítulo 6). Esta correspondencia permite comprobar, en el capítulo de
resultados, en qué medida se ha alcanzado cada objetivo.

**Tabla 3.1.** Correspondencia entre objetivos específicos y requisitos.

| Objetivo | Requisitos asociados |
|---|---|
| OE-1. Cuenta y bodas | RF-01…RF-09, RNF-01, RNF-02 |
| OE-2. Invitados | RF-10…RF-16, RF-80, RF-81 |
| OE-3. Grupos y mesas | RF-20…RF-24 |
| OE-4. Tareas y agenda | RF-30, RF-31, RF-40, RF-41 |
| OE-5. Gestión económica | RF-50…RF-52, RF-60…RF-62 |
| OE-6. Seguimiento global | RF-70, RF-71 |
| OE-7. Asistencias con IA | IA-01, IA-02, IA-03, IA-90, IA-91, IA-92 |
| OE-8. Calidad | RNF-03, RNF-10…RNF-13, RNF-20…RNF-23 |
