import { PrismaClient } from "../src/generated/client/client";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

// Deterministic name pools (Spanish) to build a rich, realistic guest list.
const firstNames = [
  "Laura", "Daniel", "María", "Carlos", "Ana", "Javier", "Lucía", "Sergio",
  "Marta", "Pablo", "Sara", "Álvaro", "Elena", "Rubén", "Cristina", "Adrián",
  "Paula", "Diego", "Carmen", "Raúl", "Alba", "Iván", "Nuria", "Hugo",
  "Sofía", "Marcos", "Irene", "Jorge", "Claudia", "Víctor", "Andrea", "Óscar",
  "Beatriz", "Guillermo", "Rocío", "Alejandro", "Silvia", "Fernando", "Patricia",
  "Gonzalo", "Natalia", "Rodrigo", "Miriam", "Ignacio", "Teresa", "Emilio",
  "Lorena", "Manuel", "Isabel", "Roberto",
];

const surnames = [
  "García", "Martínez", "López", "Sánchez", "Pérez", "Gómez", "Rodríguez",
  "Fernández", "González", "Ruiz", "Díaz", "Moreno", "Álvarez", "Romero",
  "Torres", "Navarro", "Ramírez", "Gil", "Serrano", "Molina", "Blanco",
  "Castro", "Ortega", "Rubio", "Marín", "Iglesias", "Santos", "Cano",
  "Prieto", "Vega",
];

const diets = [
  "NONE", "NONE", "NONE", "VEGETARIAN", "NONE", "VEGAN", "NONE", "NONE",
  "HALAL", "NONE",
];
const allergyPool: string[][] = [
  [], [], ["Gluten"], [], ["Lactosa"], [], ["Frutos secos"], [], ["Marisco"], [],
];

const slug = (name: string) =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, ".");

const now = new Date();
const addDays = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d;
};
const weddingDate = new Date("2027-06-19T11:00:00.000Z");
const dayBefore = (d: Date) => {
  const r = new Date(d);
  r.setDate(r.getDate() - 1);
  return r;
};

async function main() {
  // 0) Wipe everything (all data roots at User via cascade).
  await prisma.user.deleteMany({});

  // 1) Demo user
  const user = await prisma.user.create({
    data: {
      email: "demo@planifica2.com",
      password: await bcrypt.hash("123456", 10),
      name: "Laura Rosón",
    },
  });

  // 2) Wedding
  const wedding = await prisma.wedding.create({
    data: { name: "Boda de Laura & Dani", date: weddingDate, ownerId: user.id },
  });
  const weddingId = wedding.id;

  // 3) Groups
  const groupNames = [
    "Familia de la novia",
    "Familia del novio",
    "Amigos de la novia",
    "Amigos del novio",
    "Compañeros de trabajo",
    "Amigos comunes",
  ];
  const groups = [];
  for (const name of groupNames) {
    groups.push(await prisma.group.create({ data: { name, weddingId } }));
  }

  // 4) Tables
  const tableDefs = [
    { name: "Mesa Presidencial", seats: 6 },
    { name: "Mesa 1", seats: 8 },
    { name: "Mesa 2", seats: 8 },
    { name: "Mesa 3", seats: 8 },
    { name: "Mesa 4", seats: 8 },
    { name: "Mesa 5", seats: 8 },
    { name: "Mesa 6", seats: 8 },
    { name: "Mesa 7", seats: 8 },
    { name: "Mesa 8", seats: 8 },
  ];
  const tables = [];
  for (const t of tableDefs) {
    tables.push(await prisma.table.create({ data: { ...t, weddingId } }));
  }

  // 5) Primary guests (50)
  const primaries = [];
  for (let i = 0; i < 50; i++) {
    const rsvp = i % 20 < 12 ? "CONFIRMED" : i % 20 < 17 ? "PENDING" : "DECLINED";
    const ageGroup = i % 17 === 0 ? "CHILD" : i % 29 === 0 && i !== 0 ? "BABY" : "ADULT";
    const name = `${firstNames[i]} ${surnames[i % surnames.length]}`;
    const hasEmail = i % 7 !== 3;
    const sent = i % 6 !== 0;
    const g = await prisma.guest.create({
      data: {
        name,
        weddingId,
        groupId: groups[i % groups.length].id,
        role: "PRIMARY",
        rsvp,
        ageGroup,
        diet: diets[i % diets.length],
        allergies: allergyPool[i % allergyPool.length],
        email: hasEmail ? `${slug(name)}@example.com` : null,
        phone: i % 3 === 0 ? `6${(10000000 + i * 137).toString().slice(0, 8)}` : null,
        notes: i % 11 === 0 ? "Necesita alojamiento cerca de la finca." : null,
        invitationSent: sent,
        invitationSentAt: sent ? addDays(-25) : null,
        rsvpToken: randomUUID(),
      },
    });
    primaries.push({ ...g });
  }

  // 6) Companions (14) attached to confirmed primaries
  const confirmedPrimaries = primaries.filter((p) => p.rsvp === "CONFIRMED");
  for (let j = 0; j < 14; j++) {
    const parent = confirmedPrimaries[(j * 2) % confirmedPrimaries.length];
    const cname = `${firstNames[(30 + j) % firstNames.length]} ${surnames[(j + 5) % surnames.length]}`;
    await prisma.guest.create({
      data: {
        name: cname,
        weddingId,
        groupId: parent.groupId,
        parentId: parent.id,
        role: "COMPANION",
        rsvp: "CONFIRMED",
        ageGroup: j % 5 === 0 ? "CHILD" : "ADULT",
        diet: j % 4 === 0 ? "VEGETARIAN" : "NONE",
        allergies: j % 6 === 0 ? ["Lactosa"] : [],
      },
    });
  }

  // 7) Seat assignment: seat confirmed guests sequentially across tables
  const confirmedGuests = await prisma.guest.findMany({
    where: { weddingId, rsvp: "CONFIRMED" },
    orderBy: { createdAt: "asc" },
  });
  let ti = 0;
  let si = 1;
  for (const cg of confirmedGuests) {
    if (ti >= tables.length) break;
    await prisma.guest.update({
      where: { id: cg.id },
      data: { tableId: tables[ti].id, seatNumber: si },
    });
    si++;
    if (si > tables[ti].seats) {
      ti++;
      si = 1;
    }
  }

  // 8) Tasks
  await prisma.task.createMany({
    data: [
      { title: "Confirmar la lista de invitados", category: "GUESTS", priority: "HIGH", status: "IN_PROGRESS", dueDate: addDays(3), weddingId },
      { title: "Enviar las invitaciones", category: "GUESTS", priority: "HIGH", status: "COMPLETED", completed: true, dueDate: addDays(-20), weddingId },
      { title: "Cerrar el menú con el catering", category: "BANQUET", priority: "HIGH", status: "IN_PROGRESS", dueDate: addDays(10), weddingId },
      { title: "Elegir la tarta nupcial", category: "BANQUET", priority: "MEDIUM", status: "PENDING", dueDate: addDays(45), weddingId },
      { title: "Prueba del vestido", category: "OUTFITS", priority: "MEDIUM", status: "PENDING", dueDate: addDays(70), weddingId },
      { title: "Alquiler del traje", category: "OUTFITS", priority: "MEDIUM", status: "PENDING", dueDate: addDays(80), weddingId },
      { title: "Contratar al fotógrafo", category: "PHOTO_VIDEO", priority: "HIGH", status: "COMPLETED", completed: true, dueDate: addDays(-30), weddingId },
      { title: "Reunión con el DJ", category: "MUSIC", priority: "LOW", status: "PENDING", dueDate: addDays(90), weddingId },
      { title: "Decoración floral de la ceremonia", category: "DECORATION", priority: "MEDIUM", status: "PENDING", dueDate: addDays(60), weddingId },
      { title: "Reservar la luna de miel", category: "TRAVEL", priority: "MEDIUM", status: "IN_PROGRESS", dueDate: addDays(120), weddingId },
      { title: "Trámites y documentación civil", category: "PAPERWORK", priority: "HIGH", status: "PENDING", dueDate: addDays(-5), weddingId },
      { title: "Ajustar el presupuesto", category: "BUDGET", priority: "MEDIUM", status: "IN_PROGRESS", dueDate: addDays(15), weddingId },
      { title: "Elegir las alianzas", category: "OTHER", priority: "MEDIUM", status: "PENDING", dueDate: addDays(100), weddingId },
      { title: "Diseñar la distribución de mesas", category: "GUESTS", priority: "MEDIUM", status: "PENDING", dueDate: addDays(130), weddingId },
      { title: "Contratar el transporte de invitados", category: "TRAVEL", priority: "LOW", status: "PENDING", dueDate: addDays(140), weddingId },
      { title: "Prueba de peinado y maquillaje", category: "OUTFITS", priority: "LOW", status: "PENDING", dueDate: addDays(150), weddingId },
      { title: "Confirmar el alojamiento de invitados", category: "GUESTS", priority: "LOW", status: "PENDING", dueDate: addDays(110), weddingId },
      { title: "Ensayo de la ceremonia", category: "CEREMONY", priority: "MEDIUM", status: "PENDING", dueDate: addDays(200), weddingId },
    ],
  });

  // 9) Events (agenda)
  await prisma.event.createMany({
    data: [
      { title: "Reunión con la floristería", date: addDays(9), time: "17:00", location: "Floristería Azahar", description: "Elegir el estilo de los centros de mesa y el ramo.", weddingId },
      { title: "Degustación del menú", date: addDays(25), time: "13:30", location: "Catering Delicias", description: "Probar entrantes, principales y postres.", weddingId },
      { title: "Reunión con el fotógrafo", date: addDays(40), time: "18:00", location: "Foto Estudio Luz", description: "Definir el reportaje y la sesión pre-boda.", weddingId },
      { title: "Prueba del vestido", date: addDays(70), time: "11:00", location: "Novias Blanco", description: "Primera prueba y arreglos.", weddingId },
      { title: "Ensayo de la ceremonia", date: dayBefore(weddingDate), time: "19:00", location: "Parroquia de San Miguel", description: "Ensayo con los padrinos y testigos.", weddingId },
      { title: "Ceremonia", date: weddingDate, time: "12:00", location: "Parroquia de San Miguel", description: "Ceremonia religiosa.", weddingId },
      { title: "Banquete", date: weddingDate, time: "14:30", location: "Finca El Olivar", description: "Cóctel, banquete y fiesta.", weddingId },
    ],
  });

  // 10) Providers
  const providerDefs = [
    { key: "venue", name: "Finca El Olivar", category: "VENUE", status: "BOOKED", contactName: "Rosa Jiménez", phone: "952123456", email: "reservas@fincaelolivar.es", website: "https://fincaelolivar.es", estimatedPrice: 8500, finalPrice: 8500, notes: "Incluye montaje, mobiliario y limpieza." },
    { key: "catering", name: "Catering Delicias", category: "CATERING", status: "CONFIRMED", contactName: "Miguel Ángel Ruiz", phone: "952654321", email: "eventos@cateringdelicias.es", website: "https://cateringdelicias.es", estimatedPrice: 12000, finalPrice: 12500, notes: "85 € por comensal, menú degustación." },
    { key: "photo", name: "Foto Estudio Luz", category: "PHOTOGRAPHY", status: "BOOKED", contactName: "Elena Torres", phone: "600111222", email: "hola@estudioluz.es", website: null, estimatedPrice: 1800, finalPrice: 1800, notes: "Reportaje completo + álbum." },
    { key: "video", name: "Cinema Bodas", category: "VIDEO", status: "QUOTED", contactName: "David Marín", phone: "600333444", email: "info@cinemabodas.es", website: null, estimatedPrice: 1500, finalPrice: null, notes: "Vídeo resumen y ceremonia completa." },
    { key: "music", name: "DJ Ritmo", category: "MUSIC", status: "CONFIRMED", contactName: "Sergio Blanco", phone: "600555666", email: "djritmo@email.es", website: null, estimatedPrice: 1200, finalPrice: 1200, notes: "Ceremonia, cóctel y fiesta." },
    { key: "florist", name: "Floristería Azahar", category: "FLORIST", status: "CONTACTED", contactName: "Rocío Cano", phone: "600777888", email: "azahar@flores.es", website: null, estimatedPrice: 900, finalPrice: null, notes: null },
    { key: "deco", name: "Decoración Encanto", category: "DECORATION", status: "QUOTED", contactName: "Patricia Gil", phone: "600999000", email: "encanto@deco.es", website: null, estimatedPrice: 1100, finalPrice: null, notes: null },
    { key: "transport", name: "Transportes Nupcial", category: "TRANSPORT", status: "CONTACTED", contactName: "Fernando Vega", phone: "601222333", email: "reservas@transportesnupcial.es", website: null, estimatedPrice: 600, finalPrice: null, notes: "Autobús para invitados." },
    { key: "beauty", name: "Belleza & Estilo", category: "BEAUTY", status: "BOOKED", contactName: "Silvia Prieto", phone: "601444555", email: "citas@bellezayestilo.es", website: null, estimatedPrice: 500, finalPrice: 550, notes: "Peinado y maquillaje novia + madre." },
    { key: "invitations", name: "Papelería Bonita", category: "INVITATIONS", status: "PAID", contactName: "Nuria Santos", phone: "601666777", email: "pedidos@papeleriabonita.es", website: null, estimatedPrice: 400, finalPrice: 380, notes: "Invitaciones, seating y minutas." },
    { key: "dress", name: "Novias Blanco", category: "DRESS", status: "CONFIRMED", contactName: "Carmen Ortega", phone: "601888999", email: "citas@noviasblanco.es", website: null, estimatedPrice: 1600, finalPrice: 1650, notes: null },
  ];
  const providers: Record<string, string> = {};
  for (const p of providerDefs) {
    const { key, ...data } = p;
    const created = await prisma.provider.create({ data: { ...data, weddingId } });
    providers[key] = created.id;
  }

  // 11) Budget + items (some linked to providers, with due dates for reminders)
  await prisma.budget.create({ data: { weddingId, totalAmount: 28000, currency: "EUR" } });
  await prisma.budgetItem.createMany({
    data: [
      { name: "Finca y espacio", category: "VENUE", estimatedAmount: 8500, actualAmount: 8500, paidAmount: 4000, status: "CONFIRMED", dueDate: addDays(40), providerId: providers.venue, weddingId },
      { name: "Banquete", category: "CATERING", estimatedAmount: 12500, actualAmount: 12500, paidAmount: 3000, status: "CONFIRMED", dueDate: addDays(5), providerId: providers.catering, weddingId },
      { name: "Vestido de novia", category: "DRESS", estimatedAmount: 1600, actualAmount: 1650, paidAmount: 1650, status: "PAID", providerId: providers.dress, weddingId },
      { name: "Traje del novio", category: "SUIT", estimatedAmount: 700, paidAmount: 0, status: "PLANNED", weddingId },
      { name: "Fotografía y vídeo", category: "PHOTO_VIDEO", estimatedAmount: 3300, actualAmount: 3300, paidAmount: 900, status: "CONFIRMED", dueDate: addDays(-3), providerId: providers.photo, weddingId },
      { name: "Música y DJ", category: "MUSIC", estimatedAmount: 1200, actualAmount: 1200, paidAmount: 1200, status: "PAID", providerId: providers.music, weddingId },
      { name: "Decoración", category: "DECORATION", estimatedAmount: 1100, paidAmount: 0, status: "PLANNED", providerId: providers.deco, weddingId },
      { name: "Flores", category: "FLOWERS", estimatedAmount: 900, paidAmount: 0, status: "PLANNED", dueDate: addDays(12), providerId: providers.florist, weddingId },
      { name: "Transporte", category: "TRANSPORT", estimatedAmount: 600, paidAmount: 0, status: "PLANNED", providerId: providers.transport, weddingId },
      { name: "Invitaciones y papelería", category: "INVITATIONS", estimatedAmount: 400, actualAmount: 380, paidAmount: 380, status: "PAID", providerId: providers.invitations, weddingId },
      { name: "Belleza (peluquería y maquillaje)", category: "BEAUTY", estimatedAmount: 550, actualAmount: 550, paidAmount: 200, status: "CONFIRMED", providerId: providers.beauty, weddingId },
      { name: "Luna de miel", category: "HONEYMOON", estimatedAmount: 4000, paidAmount: 500, status: "PLANNED", dueDate: addDays(150), weddingId },
    ],
  });

  const totalGuests = await prisma.guest.count({ where: { weddingId } });
  console.log("✅ Seed completado:");
  console.log(`   Usuario: ${user.email} / 123456`);
  console.log(`   Boda: ${wedding.name} (${weddingDate.toISOString().slice(0, 10)})`);
  console.log(`   Invitados: ${totalGuests} · Grupos: ${groups.length} · Mesas: ${tables.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
