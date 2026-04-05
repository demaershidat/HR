import express from 'express';
import { createJob, getAllJobs, deleteJob, updateJob } from '../../controller/recruitmentController/jobController';

const router = express.Router();

router.get('/all', getAllJobs); 
router.post('/add', createJob);
router.delete('/:id', deleteJob);
router.put('/:id', updateJob);

export default router;