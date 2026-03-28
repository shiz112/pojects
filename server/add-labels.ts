import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const labels = [
    { id: 1, name: "Bug", color: "#ef4444" },
    { id: 2, name: "Feature", color: "#3b82f6" },
    { id: 3, name: "High Priority", color: "#eab308" },
    { id: 4, name: "Design", color: "#a855f7" },
    { id: 5, name: "Backend", color: "#22c55e" },
    { id: 6, name: "Frontend", color: "#f97316" }
  ];

  for (const l of labels) {
    await prisma.label.upsert({
      where: { id: l.id },
      update: { name: l.name, color: l.color },
      create: { id: l.id, name: l.name, color: l.color }
    });
    console.log(`Upserted label: ${l.name}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
