# RESUMEN

La organización de una boda es una tarea compleja y de larga duración en la que intervienen
numerosos aspectos interdependientes —invitados, mesas, tareas, presupuesto y proveedores—
que habitualmente se gestionan de forma fragmentada y propensa a errores. Este Trabajo Fin
de Máster presenta el desarrollo de una aplicación web que permite organizar de forma
integral y centralizada todos estos aspectos desde un único panel, e incorpora un conjunto
de asistencias basadas en inteligencia artificial que automatizan las decisiones
organizativas más tediosas.

La aplicación permite gestionar invitados y acompañantes con seguimiento de confirmaciones
de asistencia (RSVP) y envío de invitaciones por correo electrónico, agrupar invitados y
distribuirlos en las mesas del banquete, planificar tareas y eventos, controlar el
presupuesto y los proveedores —con documentos adjuntos— y consultar un panel de seguimiento
con avisos sobre tareas y pagos próximos. Un mismo usuario puede gestionar varias bodas de
forma aislada y segura.

El sistema se ha desarrollado siguiendo una arquitectura cliente-servidor: una interfaz
construida con React y TypeScript, y un servidor Node.js con Express que expone una API (interfaz de programación de aplicaciones) REST
y accede a una base de datos PostgreSQL mediante el ORM (mapeador objeto-relacional) Prisma. La autenticación se basa en
tokens JWT (JSON Web Tokens) con renovación de sesión, y la autorización, en la propiedad de cada boda. Las
asistencias de inteligencia artificial, apoyadas en la API de OpenAI e invocadas
exclusivamente desde el servidor, proponen listados de tareas, distribuciones de mesas y
repartos de presupuesto en forma de propuestas editables que el usuario revisa y confirma
antes de aplicarlas.

El resultado es una herramienta funcional y autocontenida que cubre el ciclo completo de la
organización de una boda.

**Palabras clave:** planificación de bodas, aplicación web, inteligencia artificial, gestión
de invitados, distribución de mesas, desarrollo full-stack.

---

# ABSTRACT

Planning a wedding is a complex, long-running task involving many interdependent aspects —
guests, tables, tasks, budget and vendors — that are usually managed in a fragmented and
error-prone way. This Master's Thesis presents the development of a web application that
allows all these aspects to be organised in an integrated and centralised manner from a
single dashboard, and incorporates a set of artificial-intelligence assistants that automate
the most tedious organisational decisions.

The application makes it possible to manage guests and their companions with RSVP tracking
and email invitations, to group guests and arrange them at the banquet tables, to plan tasks
and events, to control the budget and vendors —with attached documents— and to consult a
tracking dashboard with reminders about upcoming tasks and payments. A single user can manage
several weddings in an isolated and secure way.

The system was developed following a client-server architecture: a user interface built with
React and TypeScript, and a Node.js server with Express that exposes a REST API and accesses
a PostgreSQL database through the Prisma ORM. Authentication is based on JWT tokens with
session renewal, and authorisation on the ownership of each wedding. The artificial-
intelligence assistants, powered by the OpenAI API and invoked exclusively from the server,
propose task lists, table arrangements and budget allocations as editable proposals that the
user reviews and confirms before applying them.

The result is a functional, self-contained tool that covers the full cycle of organising a
wedding.

**Keywords:** wedding planning, web application, artificial intelligence, guest management,
seating arrangement, full-stack development.
