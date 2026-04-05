import { Request, Response } from "express";
import db from '../../utils/db';

export const createJob = async (req: Request, res: Response) => {
  try {
    const { job_title, company_name, job_description, publish_date, expiry_date, require_profile_image, require_cv } = req.body;

    const query = `
      INSERT INTO jobs 
      (job_title, company_name, job_description, publish_date, expiry_date, require_profile_image, require_cv) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      job_title,
      company_name,
      job_description,
      publish_date,
      expiry_date,
      require_profile_image ? 1 : 0,
      require_cv ? 1 : 0
    ];

    const [result]: any = await db.query(query, values);
    res.status(201).json({ message: 'Created', jobId: result.insertId });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'DB Error' });
  }
};

export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT id, job_title, company_name, job_description, 
        DATE_FORMAT(publish_date, '%Y-%m-%d') as publish_date, 
        DATE_FORMAT(expiry_date, '%Y-%m-%d') as expiry_date, 
        require_profile_image, require_cv 
      FROM jobs 
      ORDER BY id DESC
    `;
    const [results] = await db.query(query);
    res.status(200).json(results);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'DB Error' });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { job_title, company_name, job_description, publish_date, expiry_date, require_profile_image, require_cv } = req.body;

    const query = `
      UPDATE jobs SET 
        job_title = ?, company_name = ?, job_description = ?, 
        publish_date = ?, expiry_date = ?, require_profile_image = ?, require_cv = ?
      WHERE id = ?
    `;
    const values = [
      job_title,
      company_name,
      job_description,
      publish_date,
      expiry_date,
      require_profile_image ? 1 : 0,
      require_cv ? 1 : 0,
      id
    ];

    await db.query(query, values);
    res.status(200).json({ message: 'Updated' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'DB Error' });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM jobs WHERE id = ?', [id]);
    res.status(200).json({ message: 'Deleted' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'DB Error' });
  }
};