"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStage = exports.updateStage = exports.addStage = exports.getAllStages = void 0;
const db_1 = __importDefault(require("../../utils/db"));
const getAllStages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [results] = yield db_1.default.query('SELECT * FROM stages ORDER BY order_index ASC');
        res.json(results);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
exports.getAllStages = getAllStages;
const addStage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, is_interview, is_final } = req.body;
        if (!name)
            return res.status(400).json({ error: 'الاسم مطلوب' });
        const [existing] = yield db_1.default.query('SELECT * FROM stages WHERE name = ?', [name]);
        if (existing.length > 0)
            return res.status(400).json({ error: 'هذه المرحلة موجودة مسبقاً' });
        const [orderRows] = yield db_1.default.query('SELECT MAX(order_index) as maxIndex FROM stages');
        const next_index = (Number((_a = orderRows[0]) === null || _a === void 0 ? void 0 : _a.maxIndex) || 0) + 1;
        const [insertResult] = yield db_1.default.query('INSERT INTO stages (name, is_interview, is_final, order_index) VALUES (?, ?, ?, ?)', [name, is_interview ? 1 : 0, is_final ? 1 : 0, next_index]);
        res.status(201).json({ id: insertResult.insertId, name, order_index: next_index });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
exports.addStage = addStage;
const updateStage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { name, is_interview, is_final } = req.body;
        if (!name)
            return res.status(400).json({ error: 'الاسم مطلوب' });
        const [result] = yield db_1.default.query('UPDATE stages SET name = ?, is_interview = ?, is_final = ? WHERE id = ?', [name, is_interview ? 1 : 0, is_final ? 1 : 0, id]);
        if (result.affectedRows === 0)
            return res.status(404).json({ error: "المرحلة غير موجودة" });
        res.json({ message: "تم تحديث المرحلة بنجاح" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
exports.updateStage = updateStage;
const deleteStage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        if (id === '1')
            return res.status(400).json({ error: "لا يمكن حذف المرحلة الأساسية" });
        const [resCandidates] = yield db_1.default.query('SELECT COUNT(*) as count FROM candidates WHERE current_stage = ?', [id]);
        if (resCandidates[0].count > 0)
            return res.status(400).json({ error: "لا يمكن الحذف: يوجد مرشحون نشطون في هذه المرحلة" });
        yield db_1.default.query('DELETE FROM stages WHERE id = ?', [id]);
        res.json({ message: "تم حذف المرحلة بنجاح" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
exports.deleteStage = deleteStage;
