import express, { Request, Response } from 'express';
import { messagesService } from '../services/messagesService';

const router = express.Router();

// 获取所有留言（分页+检索）
router.get('/', async (req: Request, res: Response) => {
  try {
    const data = await messagesService.getAll(req.query);
    res.json(data);
  } catch (err) {
    console.error('获取留言失败', err);
    res.status(500).json({ error: '获取留言失败' });
  }
});

// 新增留言
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = await messagesService.create(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: '新增留言失败' });
  }
});

// 编辑留言
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const data = await messagesService.update(Number(req.params.id), req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: '编辑留言失败' });
  }
});

// 删除留言
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await messagesService.remove(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '删除留言失败' });
  }
});

// 按区域查询留言
router.get('/district/:districtName', async (req: Request, res: Response) => {
  try {
    const data = await messagesService.getByDistrict(req.params.districtName, req.query);
    res.json(data);
  } catch (err) {
    console.error('按区域查询留言失败', err);
    res.status(500).json({ error: '按区域查询留言失败' });
  }
});

export default router; 