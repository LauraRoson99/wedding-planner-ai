import { PrismaClient } from "../src/generated/client/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // 1) User demo
  const email = "demo@planifica2.com";
  const passwordHash = await bcrypt.hash("123456", 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: passwordHash,
      name: "Demo User",
    },
  });

  // 2) Wedding demo
  const wedding = await prisma.wedding.create({
    data: {
      name: "Boda Laura & Dani",
      date: new Date("2026-06-20T12:00:00.000Z"),
      ownerId: user.id,
    },
  });

    // 3) Groups demo
    const g1 = await prisma.group.create({
        data: { name: "Amigos de la novia", weddingId: wedding.id },
    });

    const g2 = await prisma.group.create({
        data: { name: "Familia del novio", weddingId: wedding.id },
    });

    // 4) Tables demo
    const t1 = await prisma.table.create({
        data: { name: "Mesa 1", seats: 8, weddingId: wedding.id },
    });

    const t2 = await prisma.table.create({
        data: { name: "Mesa 2", seats: 8, weddingId: wedding.id },
    });

    // 5) Guests demo
    await prisma.guest.createMany({
        data: [
        { name: "Laura", weddingId: wedding.id, groupId: g1.id, tableId: t1.id },
        { name: "Dani", weddingId: wedding.id, groupId: g2.id, tableId: t2.id },
        { name: "Mario", weddingId: wedding.id, groupId: g1.id, tableId: null }, // sin mesa
        ],
    });

    // 6) Events demo
    await prisma.event.createMany({
        data: [
        { title: "Ceremonia", date: new Date("2026-06-20T12:00:00.000Z"), weddingId: wedding.id },
        { title: "Banquete", date: new Date("2026-06-20T14:30:00.000Z"), weddingId: wedding.id },
        ],
    });

    console.log("✅ Seed completado:", { user: user.email, wedding: wedding.name });
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
