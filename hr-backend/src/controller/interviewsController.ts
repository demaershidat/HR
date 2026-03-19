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
            i.id AS interview_id,
            i.interview_date, 
            i.interview_time, 
            i.interview_description, 
            i.is_finished
        FROM candidates c
        LEFT JOIN interviews i ON c.id = i.candidate_id
        WHERE c.current_stage = 2
        ORDER BY i.interview_date DESC`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

export const addInterview = (req: Request, res: Response) => {
    const { candidate_id, interview_date, interview_time, interview_description, is_finished } = req.body;
    
    const insertQuery = `INSERT INTO interviews (candidate_id, interview_date, interview_time, interview_description, is_finished) VALUES (?, ?, ?, ?, ?)`;
    const updateCandidateQuery = `UPDATE candidates SET current_stage = 2 WHERE id = ?`;

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ error: err.message });

        db.query(insertQuery, [candidate_id, interview_date, interview_time, interview_description || null, is_finished ? 1 : 0], (err) => {
            if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

            db.query(updateCandidateQuery, [candidate_id], (err) => {
                if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

                db.commit((err) => {
                    if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
                    res.status(201).json({ message: "Interview scheduled and candidate moved to stage 2" });
                });
            });
        });
    });
};

export const updateInterview = (req: Request, res: Response) => {
    const id = req.params.id;
    const { interview_date, interview_time, interview_description, is_finished } = req.body;

    const query = `
        UPDATE interviews SET 
        interview_date = ?, 
        interview_time = ?, 
        interview_description = ?, 
        is_finished = ? 
        WHERE id = ?`;
    
    db.query(query, [interview_date, interview_time, interview_description, is_finished ? 1 : 0, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Interview updated" });
    });
};

export const deleteInterview = (req: Request, res: Response) => {
    const id = req.params.id;
    db.query('DELETE FROM interviews WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Interview deleted" });
    });
};