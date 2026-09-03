# 9. PRUEBAS Y VALIDACIÓN

Para garantizar el correcto funcionamiento del sistema se ha seguido una **estrategia de
pruebas en varios niveles**: pruebas automatizadas —unitarias y de integración— sobre la
lógica del servidor, pruebas funcionales manuales sobre la aplicación completa y un proceso
de integración continua que ejecuta las validaciones de forma automática ante cada cambio.
Este capítulo describe cada nivel y presenta los resultados obtenidos.

## 9.1. Estrategia de pruebas

Las pruebas se han organizado siguiendo el criterio habitual de la pirámide de pruebas:
una base amplia de **pruebas unitarias** rápidas sobre las utilidades puras, un conjunto de
**pruebas de integración** que ejercitan la API de extremo a extremo contra una base de
datos real, y una capa de **verificación funcional manual** sobre la interfaz. Todo ello se
apoya en un sistema de **integración continua** que actúa como red de seguridad frente a
regresiones. Las pruebas automatizadas del backend se han implementado con el framework
**Vitest** (Vitest, s.f.) —una alternativa moderna a Jest, integrada de forma nativa con Vite
y TypeScript—, acompañado de la biblioteca **supertest** para las pruebas de la API.

## 9.2. Pruebas unitarias

Las pruebas unitarias verifican, de forma aislada y sin acceso a la base de datos, el
comportamiento de las utilidades con lógica propia:

- **Cifrado de contraseñas:** que una contraseña se cifra y que su verificación posterior
  distingue correctamente entre la contraseña válida y una incorrecta.
- **Tokens de sesión (JWT):** que un *token* firmado se verifica correctamente y que su
  contenido se recupera de forma fiable.
- **Plantilla de invitación por correo:** que el mensaje se genera con los datos esperados,
  comprobando además el **escape de HTML** para prevenir la inyección de contenido.
- **Manejador central de errores:** que un error de validación se traduce en una respuesta
  400 con mensaje legible, que los errores con formato `{ status, message }` se respetan y
  que cualquier error inesperado se enmascara como 500 genérico (RNF-22).

## 9.3. Pruebas de integración

Las pruebas de integración ejercitan la API de extremo a extremo mediante peticiones HTTP
reales contra la base de datos de desarrollo, limpiando después los datos que crean. El caso
principal recorre el flujo **registro → boda → invitado** y verifica, entre otros, los
siguientes comportamientos:

- El registro de un usuario crea automáticamente su primera boda.
- Un registro con un correo ya existente devuelve un conflicto (409).
- El alta y el listado de un invitado funcionan correctamente.
- Una petición sin *token* de sesión se rechaza con 401.
- Un intento de acceder a una boda ajena devuelve 404, validando el **aislamiento entre
  bodas** (RNF-01).
- Una petición con datos inválidos devuelve un 400 con un mensaje limpio en español
  (RNF-22).

## 9.4. Resultados de las pruebas automatizadas

La ejecución completa de la batería de pruebas del backend finaliza **sin errores**. La
Tabla 9.1 resume los resultados, junto con la verificación de estilo (lint) y de compilación
(build) de ambas partes del proyecto.

**Tabla 9.1.** Resultados de las validaciones automatizadas.

| Validación | Resultado |
|---|---|
| Pruebas del backend (Vitest) | 18 pruebas superadas en 5 ficheros |
| Análisis de estilo del backend (ESLint) | Sin errores |
| Compilación del backend (TypeScript) | Sin errores |
| Análisis de estilo del frontend (ESLint) | 0 errores (36 avisos de estilo) |
| Compilación del frontend (build de producción) | Sin errores |

Como limitación reconocida, el **frontend no dispone todavía de pruebas automatizadas**; su
validación se apoya en la compilación con verificación de tipos y en las pruebas funcionales
manuales descritas a continuación. Esta carencia se recoge como línea de trabajo futura
(capítulo 11).

## 9.5. Pruebas funcionales manuales

De forma complementaria a las pruebas automatizadas, cada funcionalidad se ha verificado
manualmente sobre la interfaz a medida que se implementaba y en una revisión final sobre la
aplicación completa. Para ello se utilizó un conjunto de datos de demostración
representativo (una boda con 64 invitados, grupos, mesas, tareas, agenda, presupuesto y
proveedores). La Tabla 9.2 resume las comprobaciones funcionales por módulo.

**Tabla 9.2.** Verificación funcional por módulo.

| Módulo | Comprobaciones |
|---|---|
| Autenticación | Registro, inicio y cierre de sesión, renovación transparente y recuperación de contraseña |
| Invitados | Alta con acompañantes, edición, borrado individual y masivo, importación y exportación CSV, envío de invitaciones |
| Grupos y mesas | Alta de grupos y mesas, asignación de invitados a asientos, liberación y vaciado |
| Tareas y agenda | Alta, edición y borrado; filtros; vista de calendario y cuenta atrás |
| Presupuesto y proveedores | Partidas, gráficas, vínculo proveedor-partida y documentos adjuntos |
| Panel y avisos | Agregados del panel y notificaciones de tareas y pagos próximos o vencidos |
| Asistencias con IA | Generación de propuestas de tareas, distribución de mesas y presupuesto, con revisión y confirmación por el usuario |

Las capturas que documentan estas comprobaciones se recogen en el capítulo 8 y, de forma
guiada, en el Anexo B.

## 9.6. Integración continua

El proyecto incorpora un flujo de **integración continua** (GitHub Actions) que se ejecuta
ante cada cambio en la rama principal y que actúa como red de seguridad frente a regresiones.
Se compone de dos trabajos: uno para el **backend** —que levanta una base de datos PostgreSQL
de servicio, instala dependencias, genera el cliente de datos, ejecuta el análisis de estilo,
compila, aplica las migraciones y lanza las pruebas— y otro para el **frontend** —que instala
dependencias, ejecuta el análisis de estilo y compila—. Mantener ambos trabajos en verde es
condición para integrar cualquier cambio.

## 9.7. Trazabilidad entre requisitos y pruebas

La Tabla 9.3 relaciona una selección de requisitos con la prueba que verifica su
cumplimiento, cerrando el ciclo entre lo especificado (capítulo 6) y lo comprobado.

**Tabla 9.3.** Trazabilidad entre requisitos y pruebas.

| Requisito | Prueba que lo verifica |
|---|---|
| RF-01, RF-02, RF-03 | Integración: registro, boda automática, acceso sin token (401) |
| RF-10, RF-11 | Integración: alta y listado de invitados |
| RF-80 | Unitaria: generación de la plantilla de invitación |
| RNF-01 | Integración: acceso a boda ajena (404) |
| RNF-02 | Unitarias: cifrado de contraseñas y tokens |
| RNF-22 | Unitaria e integración: errores 400/409/500 con mensaje limpio |
| IA-01, IA-02, IA-03 | Funcional: generación, revisión y aplicación de propuestas |
| Resto de RF | Funcional: verificación por módulo (Tabla 9.2) |
