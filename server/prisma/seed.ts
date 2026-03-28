import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clear existing data in correct order
  await prisma.checklistItem.deleteMany();
  await prisma.checklist.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.cardMember.deleteMany();
  await prisma.cardLabel.deleteMany();
  await prisma.card.deleteMany();
  await prisma.list.deleteMany();
  await prisma.board.deleteMany();
  await prisma.label.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const alice = await prisma.user.create({ data: { name: 'Alice Johnson', avatar: null } });
  const bob = await prisma.user.create({ data: { name: 'Bob Smith', avatar: null } });
  const carol = await prisma.user.create({ data: { name: 'Carol White', avatar: null } });

  // Create labels
  const labels = await Promise.all([
    prisma.label.create({ data: { name: 'Design', color: '#0079bf' } }),
    prisma.label.create({ data: { name: 'Backend', color: '#d04444' } }),
    prisma.label.create({ data: { name: 'Frontend', color: '#4bce97' } }),
    prisma.label.create({ data: { name: 'Urgent', color: '#f5cd47' } }),
    prisma.label.create({ data: { name: 'Research', color: '#fea362' } }),
    prisma.label.create({ data: { name: 'QA', color: '#9f8fef' } }),
  ]);

  // ─── BOARD 1: Product Roadmap ───
  const board1 = await prisma.board.create({
    data: {
      title: 'Product Roadmap',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
  });
  const [backlog, inProgress1, inReview, done1] = await Promise.all([
    prisma.list.create({ data: { boardId: board1.id, title: 'Backlog', position: 1 } }),
    prisma.list.create({ data: { boardId: board1.id, title: 'In Progress', position: 2 } }),
    prisma.list.create({ data: { boardId: board1.id, title: 'In Review', position: 3 } }),
    prisma.list.create({ data: { boardId: board1.id, title: 'Done', position: 4 } }),
  ]);
  await Promise.all([
    prisma.card.create({ data: { listId: backlog.id, title: 'Design new landing page', position: 1, description: 'Redesign the homepage with new branding guidelines.' } }),
    prisma.card.create({ data: { listId: backlog.id, title: 'User research interviews', position: 2 } }),
    prisma.card.create({ data: { listId: backlog.id, title: 'Competitor analysis report', position: 3 } }),
    prisma.card.create({ data: { listId: inProgress1.id, title: 'Build authentication flow', position: 1, dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) } }),
    prisma.card.create({ data: { listId: inProgress1.id, title: 'API integration for payments', position: 2 } }),
    prisma.card.create({ data: { listId: inProgress1.id, title: 'Dashboard analytics widget', position: 3 } }),
    prisma.card.create({ data: { listId: inReview.id, title: 'Mobile responsive fixes', position: 1 } }),
    prisma.card.create({ data: { listId: inReview.id, title: 'Performance optimization', position: 2 } }),
    prisma.card.create({ data: { listId: done1.id, title: 'Set up CI/CD pipeline', position: 1 } }),
    prisma.card.create({ data: { listId: done1.id, title: 'Write API documentation', position: 2 } }),
  ]);

  // ─── BOARD 2: Marketing Campaign ───
  const board2 = await prisma.board.create({
    data: {
      title: 'Marketing Campaign',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
  });
  const [ideas, planning, active, completed] = await Promise.all([
    prisma.list.create({ data: { boardId: board2.id, title: 'Ideas', position: 1 } }),
    prisma.list.create({ data: { boardId: board2.id, title: 'Planning', position: 2 } }),
    prisma.list.create({ data: { boardId: board2.id, title: 'Active', position: 3 } }),
    prisma.list.create({ data: { boardId: board2.id, title: 'Completed', position: 4 } }),
  ]);
  await Promise.all([
    prisma.card.create({ data: { listId: ideas.id, title: 'YouTube tutorial series', position: 1 } }),
    prisma.card.create({ data: { listId: ideas.id, title: 'Influencer partnership program', position: 2 } }),
    prisma.card.create({ data: { listId: ideas.id, title: 'Referral reward system', position: 3 } }),
    prisma.card.create({ data: { listId: planning.id, title: 'Q4 email newsletter campaign', position: 1, dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) } }),
    prisma.card.create({ data: { listId: planning.id, title: 'Social media content calendar', position: 2 } }),
    prisma.card.create({ data: { listId: active.id, title: 'Black Friday promotion', position: 1, dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) } }),
    prisma.card.create({ data: { listId: active.id, title: 'Google Ads campaign', position: 2 } }),
    prisma.card.create({ data: { listId: completed.id, title: 'Brand refresh guidelines', position: 1 } }),
    prisma.card.create({ data: { listId: completed.id, title: 'Product launch press release', position: 2 } }),
  ]);

  // ─── BOARD 3: Dev Sprint #12 ───
  const board3 = await prisma.board.create({
    data: {
      title: 'Dev Sprint #12',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
  });
  const [todo, inProgress3, testing, deployed] = await Promise.all([
    prisma.list.create({ data: { boardId: board3.id, title: 'Todo', position: 1 } }),
    prisma.list.create({ data: { boardId: board3.id, title: 'In Progress', position: 2 } }),
    prisma.list.create({ data: { boardId: board3.id, title: 'Testing', position: 3 } }),
    prisma.list.create({ data: { boardId: board3.id, title: 'Deployed', position: 4 } }),
  ]);
  await Promise.all([
    prisma.card.create({ data: { listId: todo.id, title: 'Refactor auth module', position: 1 } }),
    prisma.card.create({ data: { listId: todo.id, title: 'Add Redis caching layer', position: 2 } }),
    prisma.card.create({ data: { listId: todo.id, title: 'Write unit tests for API', position: 3 } }),
    prisma.card.create({ data: { listId: inProgress3.id, title: 'Fix memory leak in worker', position: 1, dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) } }),
    prisma.card.create({ data: { listId: inProgress3.id, title: 'Migrate to PostgreSQL 16', position: 2 } }),
    prisma.card.create({ data: { listId: testing.id, title: 'End-to-end test suite', position: 1 } }),
    prisma.card.create({ data: { listId: testing.id, title: 'Load testing with k6', position: 2 } }),
    prisma.card.create({ data: { listId: deployed.id, title: 'Deploy v2.1 to production', position: 1 } }),
    prisma.card.create({ data: { listId: deployed.id, title: 'Setup monitoring alerts', position: 2 } }),
  ]);

  console.log('✅ Seed complete — 3 boards, 12 lists, 28 cards created');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
