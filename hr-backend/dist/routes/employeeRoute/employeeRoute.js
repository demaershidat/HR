"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employeeController_1 = require("../../controller/employeeController/employeeController");
const router = (0, express_1.Router)();
router.get('/', employeeController_1.getAllEmployees);
router.post('/add', employeeController_1.createEmployee);
router.delete('/:id', employeeController_1.deleteEmployee);
exports.default = router;
