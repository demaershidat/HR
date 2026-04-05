import { Request, Response } from 'express';
import db from '../../utils/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export const getAllStages = async (req: Request, res: Response) => {
  try {
    const [results] = await db.query<RowDataPacket[]>('SELECT * FROM stages ORDER BY order_index ASC');
    res.json(results);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const addStage = async (req: Request, res: Response) => {
  try {
    const { name, is_interview, is_final } = req.body;
    if (!name) return res.status(400).json({ error: 'الاسم مطلوب' });

    const [existing] = await db.query<RowDataPacket[]>('SELECT * FROM stages WHERE name = ?', [name]);
    if (existing.length > 0) return res.status(400).json({ error: 'هذه المرحلة موجودة مسبقاً' });

    const [orderRows] = await db.query<RowDataPacket[]>('SELECT MAX(order_index) as maxIndex FROM stages');
    const next_index = (Number(orderRows[0]?.maxIndex) || 0) + 1;

    const [insertResult] = await db.query<ResultSetHeader>(
      'INSERT INTO stages (name, is_interview, is_final, order_index) VALUES (?, ?, ?, ?)',
      [name, is_interview ? 1 : 0, is_final ? 1 : 0, next_index]
    );

    res.status(201).json({ id: insertResult.insertId, name, order_index: next_index });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateStage = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { name, is_interview, is_final } = req.body;
    if (!name) return res.status(400).json({ error: 'الاسم مطلوب' });

    const [result] = await db.query<ResultSetHeader>(
      'UPDATE stages SET name = ?, is_interview = ?, is_final = ? WHERE id = ?',
      [name, is_interview ? 1 : 0, is_final ? 1 : 0, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: "المرحلة غير موجودة" });
    res.json({ message: "تم تحديث المرحلة بنجاح" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteStage = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (id === '1') return res.status(400).json({ error: "لا يمكن حذف المرحلة الأساسية" });

    const [resCandidates] = await db.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM candidates WHERE current_stage = ?', [id]);
    if (resCandidates[0].count > 0) return res.status(400).json({ error: "لا يمكن الحذف: يوجد مرشحون نشطون في هذه المرحلة" });

    await db.query('DELETE FROM stages WHERE id = ?', [id]);
    res.json({ message: "تم حذف المرحلة بنجاح" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};