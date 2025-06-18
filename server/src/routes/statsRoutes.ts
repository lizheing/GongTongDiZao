import express, { Request, Response } from 'express';
import { statsService } from '../services/statsService';

const router = express.Router();

// 获取类别统计
router.get('/category', async (req: Request, res: Response) => {
  try {
    const stats = await statsService.getCategoryStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: '获取类别统计失败' });
  }
});

// 获取区域统计
router.get('/district', async (req: Request, res: Response) => {
  try {
    const stats = await statsService.getDistrictStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: '获取区域统计失败' });
  }
});

// 获取满意度统计
router.get('/satisfaction', async (req: Request, res: Response) => {
  try {
    const stats = await statsService.getSatisfactionStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: '获取满意度统计失败' });
  }
});

// 获取状态统计
router.get('/status', async (req: Request, res: Response) => {
  try {
    const stats = await statsService.getStatusStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: '获取状态统计失败' });
  }
});

export default router;