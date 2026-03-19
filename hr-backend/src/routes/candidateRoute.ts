import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
    getAllCandidates, 
    addCandidate, 
    updateCandidate, 
    deleteCandidate, 
    deleteBulkCandidates 
} from '../controller/candidateController';

const router = express.Router();

const uploadPath = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, uniqueSuffix);
    }
});

const upload = multer({ storage });

const multiUpload = upload.fields([
    { name: 'cvFile', maxCount: 1 }, 
    { name: 'photoFile', maxCount: 1 }
]);

router.get('/all', getAllCandidates);
router.post('/add', multiUpload, addCandidate);
router.put('/:id', multiUpload, updateCandidate);
router.delete('/:id', deleteCandidate);
router.post('/delete-bulk', deleteBulkCandidates);

export default router;