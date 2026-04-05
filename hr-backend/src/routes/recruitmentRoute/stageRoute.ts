import express from 'express';
import * as stagesCtrl from '../../controller/recruitmentController/stageController'; 

const router = express.Router();

router.get('/all', stagesCtrl.getAllStages);
router.post('/add', stagesCtrl.addStage);
router.put('/:id', stagesCtrl.updateStage);
router.delete('/:id', stagesCtrl.deleteStage);

export default router;