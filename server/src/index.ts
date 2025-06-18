import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import geoRoutes from './routes/geoRoutes';
import statsRoutes from './routes/statsRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 路由
app.use('/api/geo', geoRoutes);
app.use('/api/stats', statsRoutes);

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
}); 