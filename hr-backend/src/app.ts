import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import jobRoute from './routes/recruitmentRoute/jobRoute';
import candidateRoute from './routes/recruitmentRoute/candidateRoute';
import authRoute from './routes/recruitmentRoute/authRoute';
import interviewRoutes from './routes/recruitmentRoute/interviewRoutes';
import stageRoute from './routes/recruitmentRoute/stageRoute';
import employeeRoute from './routes/employeeRoute/employeeRoute';

dotenv.config();
const app = express();

const uploadsPath = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });

app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', express.static(uploadsPath));

app.use('/jobs', jobRoute);
app.use('/candidates', candidateRoute);
app.use('/login', authRoute);
app.use('/interviews', interviewRoutes);
app.use('/stages', stageRoute);
app.use('/employees', employeeRoute);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});