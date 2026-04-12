import { Router } from 'express';
import { getAllEmployees, createEmployee, deleteEmployee, updateEmployee } from '../../controller/employeeController/employeeController';
import multer from 'multer';
import path from 'path';

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.get('/', getAllEmployees);

router.post('/add', upload.fields([
    { name: 'photoFile', maxCount: 1 },
    { name: 'cvFile', maxCount: 1 }
]), createEmployee);

router.put('/update/:id', upload.fields([
    { name: 'photoFile', maxCount: 1 },
    { name: 'cvFile', maxCount: 1 }
]), updateEmployee);

router.delete('/:id', deleteEmployee);

export default router;