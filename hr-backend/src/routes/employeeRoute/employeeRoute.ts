import { Router } from 'express';
import { getAllEmployees, createEmployee, deleteEmployee } from '../../controller/employeeController/employeeController';

const router = Router();

router.get('/', getAllEmployees);        
router.post('/add', createEmployee);     
router.delete('/:id', deleteEmployee);   

export default router;