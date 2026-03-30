import { Request, Response } from "express";
import db from "../utils/db";

export const getAllInterviews = (req: Request, res: Response) => {
  const query = `
    SELECT 
      c.id AS candidate_id, 
      c.full_name, 
      c.profile_image_url,
      c.job_id, 
      c.custom_job, 
      c.current_stage,
      i.id AS interview_id, 
      i.interview_date, 
      i.interview_time, 
      i.interview_description, 
      i.is_finished,
      s.name as stage_name
    FROM interviews i
    INNER JOIN candidates c ON i.candidate_id = c.id
    LEFT JOIN stages s ON c.current_stage = s.id
    ORDER BY i.interview_date DESC, i.interview_time DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

export const addInterview = (req: Request, res: Response) => {
  const { candidate_id, interview_date, interview_time, interview_description, is_finished } = req.body;

  if (!candidate_id || !interview_date || !interview_time) {
    return res.status(400).json({ error: "المرشح، التاريخ، والوقت حقول مطلوبة" });
  }

  const insertQuery = `
    INSERT INTO interviews (candidate_id, interview_date, interview_time, interview_description, is_finished)
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [
    Number(candidate_id),
    interview_date,
    interview_time,
    interview_description || null,
    is_finished ? 1 : 0
  ];

  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: "فشل في حفظ المقابلة في قاعدة البيانات" });
    }
    res.status(201).json({ message: "تمت إضافة المقابلة بنجاح", id: (result as any).insertId });
  });
};

export const updateInterview = (req: Request, res: Response) => {
  const id = req.params.id;
  const { interview_date, interview_time, interview_description, is_finished } = req.body;

  const query = `UPDATE interviews SET interview_date = ?, interview_time = ?, interview_description = ?, is_finished = ? WHERE id = ?`;
  
  db.query(query, [interview_date, interview_time, interview_description || null, is_finished ? 1 : 0, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: "تم تحديث المقابلة بنجاح" });
  });
};

export const deleteInterview = (req: Request, res: Response) => {
  const id = req.params.id;
  db.query('DELETE FROM interviews WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: "تم حذف المقابلة" });
  });
};