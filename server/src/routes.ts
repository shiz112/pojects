import { Router } from 'express';
import prisma from './db';

const router = Router();

// ================= BOARDS ================= //
router.get('/boards', async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      include: {
        lists: {
          include: { 
            cards: { 
              include: { 
                labels: { include: { label: true } },
                members: { include: { user: true } },
                checklists: { include: { items: true }, orderBy: { id: 'asc' } },
                comments: { include: { user: true }, orderBy: { createdAt: 'desc' } }
              },
              orderBy: { position: 'asc' }
            } 
          },
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

router.post('/boards', async (req, res) => {
  const { title, background } = req.body;
  try {
    const newBoard = await prisma.board.create({
      data: { 
        title, 
        background: background || '#0079bf'
      },
      include: { lists: true }
    });
    res.status(201).json(newBoard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create board' });
  }
});

router.put('/boards/:id', async (req, res) => {
  const { title, background } = req.body;
  try {
    const updated = await prisma.board.update({
      where: { id: parseInt(req.params.id) },
      data: { title, background }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update board' });
  }
});

router.delete('/boards/:id', async (req, res) => {
  try {
    await prisma.board.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete board' });
  }
});



// ================= LISTS ================= //
router.post('/boards/:boardId/lists', async (req, res) => {
  const boardId = parseInt(req.params.boardId);
  const { title, position } = req.body;
  try {
    const newList = await prisma.list.create({
      data: { title, position, boardId },
      include: { cards: true }
    });
    res.status(201).json(newList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create list' });
  }
});

router.put('/lists/:id', async (req, res) => {
  const { title } = req.body;
  try {
    const updated = await prisma.list.update({
      where: { id: parseInt(req.params.id) },
      data: { title }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update list' });
  }
});

router.delete('/lists/:id', async (req, res) => {
  try {
    await prisma.list.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete list' });
  }
});

router.patch('/lists/reorder', async (req, res) => {
  const { items } = req.body; // Array of { id, position }
  try {
    const updates = items.map((item: any) => prisma.list.update({
      where: { id: item.id },
      data: { position: item.position }
    }));
    await prisma.$transaction(updates);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder lists' });
  }
});


// ================= CARDS ================= //
router.post('/lists/:listId/cards', async (req, res) => {
  const listId = parseInt(req.params.listId);
  const { title, position } = req.body;
  try {
    const newCard = await prisma.card.create({
      data: { title, position, listId },
      include: { labels: true, members: true, checklists: true, comments: true }
    });
    res.status(201).json(newCard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create card' });
  }
});

router.put('/cards/:cardId', async (req, res) => {
  const cardId = parseInt(req.params.cardId);
  const { title, description, coverColor, dueDate, archived } = req.body;
  try {
    const dataToUpdate: any = { title, description, coverColor, archived };
    if (dueDate !== undefined) {
      dataToUpdate.dueDate = dueDate ? new Date(dueDate) : null;
    }
    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: dataToUpdate,
      include: { labels: { include: { label: true } }, members: { include: { user: true } }, checklists: { include: { items: true }, orderBy: { id: 'asc' } }, comments: { include: { user: true }, orderBy: { createdAt: 'desc' } } }
    });
    res.json(updatedCard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update card' });
  }
});

router.delete('/cards/:id', async (req, res) => {
  try {
    await prisma.card.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

router.patch('/cards/reorder', async (req, res) => {
  const { items } = req.body; // Array of { id, position, listId }
  try {
    const updates = items.map((item: any) => prisma.card.update({
      where: { id: item.id },
      data: { position: item.position, listId: item.listId }
    }));
    await prisma.$transaction(updates);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder cards' });
  }
});

router.patch('/cards/:id/move', async (req, res) => {
  const { listId, position } = req.body;
  try {
    const updated = await prisma.card.update({
      where: { id: parseInt(req.params.id) },
      data: { listId, position }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to move card' });
  }
});

// ================= LABELS & MEMBERS ================= //
router.post('/cards/:cardId/labels/:labelId', async (req, res) => {
  try {
    await prisma.cardLabel.create({
      data: { cardId: parseInt(req.params.cardId), labelId: parseInt(req.params.labelId) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add label' });
  }
});

router.delete('/cards/:cardId/labels/:labelId', async (req, res) => {
  try {
    await prisma.cardLabel.delete({
      where: { cardId_labelId: { cardId: parseInt(req.params.cardId), labelId: parseInt(req.params.labelId) } }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove label' });
  }
});

router.post('/cards/:cardId/members/:userId', async (req, res) => {
  try {
    await prisma.cardMember.create({
      data: { cardId: parseInt(req.params.cardId), userId: parseInt(req.params.userId) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add member' });
  }
});

router.delete('/cards/:cardId/members/:userId', async (req, res) => {
  try {
    await prisma.cardMember.delete({
      where: { cardId_userId: { cardId: parseInt(req.params.cardId), userId: parseInt(req.params.userId) } }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// ================= CHECKLISTS ================= //
router.post('/cards/:id/checklists', async (req, res) => {
  const { title } = req.body;
  try {
    const cl = await prisma.checklist.create({
      data: { cardId: parseInt(req.params.id), title },
      include: { items: true }
    });
    res.json(cl);
  } catch(e) { res.status(500).json({ error: 'Failed to add checklist'}); }
});

router.delete('/checklists/:id', async (req, res) => {
  try {
    await prisma.checklist.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: 'Failed to delete checklist'}); }
});

router.post('/checklists/:id/items', async (req, res) => {
  const { text } = req.body;
  try {
    const item = await prisma.checklistItem.create({
      data: { checklistId: parseInt(req.params.id), text }
    });
    res.json(item);
  } catch(e) { res.status(500).json({ error: 'Failed to add item'}); }
});

router.put('/checklist-items/:id', async (req, res) => {
  const { isCompleted } = req.body;
  try {
    const item = await prisma.checklistItem.update({
      where: { id: parseInt(req.params.id) },
      data: { isCompleted }
    });
    res.json(item);
  } catch(e) { res.status(500).json({ error: 'Failed to update item'}); }
});

router.delete('/checklist-items/:id', async (req, res) => {
  try {
    await prisma.checklistItem.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: 'Failed to delete item'}); }
});

// ================= GLOBALS ================= //
router.post('/seed-labels', async (req, res) => {
  try {
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
    }
    res.json({ success: true, message: "Labels seeded successfully" });
  } catch (error) {
    res.status(500).json({ error: 'Failed to seed labels' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/labels', async (req, res) => {
  try {
    const labels = await prisma.label.findMany();
    res.json(labels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch labels' });
  }
});

export default router;
