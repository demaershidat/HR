import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import jobRoute from './routes/jobRoute';
import candidateRoute from './routes/candidateRoute';
import authRoute from './routes/authRoute';
import interviewRoutes from './routes/interviewRoutes'; 
import stageRoute from './routes/stageRoute';

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
});