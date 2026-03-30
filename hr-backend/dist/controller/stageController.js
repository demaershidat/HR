"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../utils/db"));
const router = express_1.default.Router();
router.get('/all', (req, res) => {
    db_1.default.query('SELECT * FROM stages ORDER BY order_index ASC', (err, results) => {
        if (err)
            return res.status(500).json({ error: err.message });
        res.json(results);
    });
});
router.post('/add', (req, res) => {
    const { name, is_interview, is_final } = req.body;
    if (!name)
        return res.status(400).json({ error: 'الاسم مطلوب' });
    db_1.default.query('SELECT * FROM stages WHERE name = ?', [name], (err, existing) => {
        if (err)
            return res.status(500).json({ error: err.message });
        const rows = existing;
        if (rows.length > 0) {
            return res.status(400).json({ error: 'هذه المرحلة موجودة مسبقاً' });
        }
        db_1.default.query('SELECT MAX(order_index) as maxIndex FROM stages', (err, results) => {
            var _a;
            if (err)
                return res.status(500).json({ error: err.message });
            const orderRows = results;
            const next_index = (((_a = orderRows[0]) === null || _a === void 0 ? void 0 : _a.maxIndex) || 0) + 1;
            const query = `INSERT INTO stages (name, is_interview, is_final, order_index) VALUES (?, ?, ?, ?)`;
            db_1.default.query(query, [name, is_interview ? 1 : 0, is_final ? 1 : 0, next_index], (err, insertResult) => {
                if (err)
                    return res.status(500).json({ error: err.message });
                const header = insertResult;
                res.status(201).json({
                    id: header.insertId,
                    name,
                    order_index: next_index
                });
            });
        });
    });
});
router.delete('/:id', (req, res) => {
    const id = req.params.id;
    if (id === '1')
        return res.status(400).json({ error: "لا يمكن حذف المرحلة الأساسية" });
    db_1.default.query('SELECT COUNT(*) as count FROM candidates WHERE current_stage = ?', [id], (err, results) => {
        const rows = results;
        if (rows[0].count > 0) {
            return res.status(400).json({ error: "لا يمكن الحذف: يوجد مرشحون في هذه المرحلة" });
        }
        db_1.default.query('DELETE FROM stages WHERE id = ?', [id], (err) => {
            if (err)
                return res.status(500).json({ error: err.message });
            res.json({ message: "تم الحذف بنجاح" });
        });
    });
});
exports.default = router;
