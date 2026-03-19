import express from 'express';
import * as interviewCtrl from '../controller/interviewsController';

const router = express.Router();

router.get('/all', interviewCtrl.getAllInterviews);
router.post('/add', interviewCtrl.addInterview);
router.put('/:id', interviewCtrl.updateInterview);
router.delete('/:id', interviewCtrl.deleteInterview);

export default router;