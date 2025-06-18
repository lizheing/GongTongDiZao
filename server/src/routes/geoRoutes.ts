import express, { Request, Response } from 'express';
import { geoService } from '../services/geoService';

const router = express.Router();

// 获取武汉市地图数据
router.get('/wuhan', async (req: Request, res: Response) => {
  try {
    const features = await geoService.getWuhanMap();
    res.json(features);
  } catch (error) {
    res.status(500).json({ error: '获取地图数据失败' });
  }
});

export default router;