"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jobController_1 = require("../controller/jobController");
const router = express_1.default.Router();
router.get('/all', jobController_1.getAllJobs);
router.post('/add', jobController_1.createJob);
router.delete('/:id', jobController_1.deleteJob);
router.put('/:id', jobController_1.updateJob);
exports.default = router;
