import { Request, Response } from "express";
import db from '../utils/db';

export const createJob = (req: Request, res: Response) => {
    const { job_title, company_name, job_description, publish_date, expiry_date, require_profile_image, require_cv } = req.body;
    const query = `INSERT INTO jobs (job_title, company_name, job_description, publish_date, expiry_date, require_profile_image, require_cv) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [job_title, company_name, job_description, publish_date, expiry_date, require_profile_image ? 1 : 0, require_cv ? 1 : 0];
    db.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ error: 'DB Error' });
        res.status(201).json({ message: 'Created', jobId: (result as any).insertId });
    });
};

export const getAllJobs = (req: Request, res: Response) => {
    const query = `SELECT id, job_title, company_name, job_description, DATE_FORMAT(publish_date, '%Y-%m-%d') as publish_date, DATE_FORMAT(expiry_date, '%Y-%m-%d') as expiry_date, require_profile_image, require_cv FROM jobs ORDER BY id DESC`;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'DB Error' });
        res.status(200).json(results);
    });
};

export const updateJob = (req: Request, res: Response) => {
    const { id } = req.params;
    const { job_title, company_name, job_description, publish_date, expiry_date, require_profile_image, require_cv } = req.body;
    const query = `UPDATE jobs SET job_title = ?, company_name = ?, job_description = ?, publish_date = ?, expiry_date = ?, require_profile_image = ?, require_cv = ? WHERE id = ?`;
    const values = [job_title, company_name, job_description, publish_date, expiry_date, require_profile_image ? 1 : 0, require_cv ? 1 : 0, id];
    db.query(query, values, (err) => {
        if (err) return res.status(500).json({ error: 'DB Error' });
        res.status(200).json({ message: 'Updated' });
    });
};

export const deleteJob = (req: Request, res: Response) => {
    db.query('DELETE FROM jobs WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'DB Error' });
        res.status(200).json({ message: 'Deleted' });
    });
};