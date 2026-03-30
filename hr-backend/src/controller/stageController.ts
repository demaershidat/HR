import express from 'express';
import db from '../utils/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

const router = express.Router();

router.get('/all', (req, res) => {
    db.query('SELECT * FROM stages ORDER BY order_index ASC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.post('/add', (req, res) => {
    const { name, is_interview, is_final } = req.body;

    if (!name) return res.status(400).json({ error: 'الاسم مطلوب' });

    db.query('SELECT * FROM stages WHERE name = ?', [name], (err, existing) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const rows = existing as RowDataPacket[];
        if (rows.length > 0) {
            return res.status(400).json({ error: 'هذه المرحلة موجودة مسبقاً' });
        }

        db.query('SELECT MAX(order_index) as maxIndex FROM stages', (err, results) => {
            if (err) return res.status(500).json({ error: err.message });

            const orderRows = results as RowDataPacket[];
            const next_index = (orderRows[0]?.maxIndex || 0) + 1;

            const query = `INSERT INTO stages (name, is_interview, is_final, order_index) VALUES (?, ?, ?, ?)`;
            db.query(query, [name, is_interview ? 1 : 0, is_final ? 1 : 0, next_index], (err, insertResult) => {
                if (err) return res.status(500).json({ error: err.message });

                const header = insertResult as ResultSetHeader;
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
    if (id === '1') return res.status(400).json({ error: "لا يمكن حذف المرحلة الأساسية" });

    db.query('SELECT COUNT(*) as count FROM candidates WHERE current_stage = ?', [id], (err, results) => {
        const rows = results as RowDataPacket[];
        if (rows[0].count > 0) {
            return res.status(400).json({ error: "لا يمكن الحذف: يوجد مرشحون في هذه المرحلة" });
        }
        db.query('DELETE FROM stages WHERE id = ?', [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "تم الحذف بنجاح" });
        });
    });
});

export default router;