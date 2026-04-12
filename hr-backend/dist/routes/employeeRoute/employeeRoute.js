"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employeeController_1 = require("../../controller/employeeController/employeeController");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage });
router.get('/', employeeController_1.getAllEmployees);
router.post('/add', upload.fields([
    { name: 'photoFile', maxCount: 1 },
    { name: 'cvFile', maxCount: 1 }
]), employeeController_1.createEmployee);
router.put('/update/:id', upload.fields([
    { name: 'photoFile', maxCount: 1 },
    { name: 'cvFile', maxCount: 1 }
]), employeeController_1.updateEmployee);
router.delete('/:id', employeeController_1.deleteEmployee);
exports.default = router;
