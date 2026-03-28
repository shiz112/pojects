import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = [
    { name: 'Diana Prince' },
    { name: 'Bruce Wayne' },
    { name: 'Clark Kent' }
  ];

  for (const u of users) {
    await prisma.user.create({ data: { name: u.name, avatar: null } });
    console.log(`Created user: ${u.name}`);
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
