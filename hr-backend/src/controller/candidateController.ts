import { Request, Response } from "express";
import db from "../utils/db";
import fs from "fs";
import path from "path";

const deleteFile = (filename: string | null) => {
    if (filename) {
        const filePath = path.join(process.cwd(), 'uploads', filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
};

export const getAllCandidates = (req: Request, res: Response) => {
    const query = `
        SELECT c.*, j.job_title 
        FROM candidates c 
        LEFT JOIN jobs j ON c.job_id = j.id 
        ORDER BY c.created_at DESC`;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

export const addCandidate = (req: Request, res: Response) => {
    const data = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const cv_url = files?.['cvFile'] ? files['cvFile'][0].filename : null;
    const profile_image_url = files?.['photoFile'] ? files['photoFile'][0].filename : null;

    const gradYear = (data.graduation_year && data.graduation_year !== 'null') ? Number(data.graduation_year) : null;
    const isOtherJob = data.job_id === 'other';
    const jobId = (!data.job_id || ['all', 'null', 'other'].includes(data.job_id)) ? null : Number(data.job_id);
    const customJob = isOtherJob ? (data.custom_job || null) : null;

    const query = `INSERT INTO candidates (full_name, email, phone, address, university_major, graduation_year, has_experience, exp_company_name, exp_position, exp_period, cv_url, profile_image_url, job_id, custom_job, current_stage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`;
    
    const values = [
        data.full_name || null,
        data.email || null,
        data.phone || null,
        data.address || null,
        data.university_major || null,
        gradYear,
        (data.has_experience == 'true' || data.has_experience == 1) ? 1 : 0,
        data.exp_company_name || null,
        data.exp_position || null,
        data.exp_period || null,
        cv_url,
        profile_image_url,
        jobId,
        customJob
    ];

    db.query(query, values, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Candidate Added" });
    });
};

export const updateCandidate = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const data = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    db.query('SELECT * FROM candidates WHERE id = ?', [id], (err, results: any) => {
        if (err || !results || results.length === 0) {
            return res.status(404).json({ error: "Candidate not found" });
        }

        const old = results[0];

        let cv_url = old.cv_url;
        let profile_image_url = old.profile_image_url;

        if (files) {
            if (files['cvFile']) {
                deleteFile(old.cv_url);
                cv_url = files['cvFile'][0].filename;
            }
            if (files['photoFile']) {
                deleteFile(old.profile_image_url);
                profile_image_url = files['photoFile'][0].filename;
            }
        }

        if (data.removePhoto === 'true') {
            deleteFile(old.profile_image_url);
            profile_image_url = null;
        }

        const query = `
            UPDATE candidates SET
            full_name = ?, email = ?, phone = ?, address = ?, 
            university_major = ?, graduation_year = ?, has_experience = ?, 
            exp_company_name = ?, exp_position = ?, exp_period = ?,
            job_id = ?, custom_job = ?, cv_url = ?, profile_image_url = ?,
            interview_date = ?, interview_time = ?, interview_description = ?, 
            is_finished = ?, current_stage = ?, rating = ?, 
            contract_status = ?, contract_sent_date = ?
            WHERE id = ?
        `;

        const values = [
            data.full_name !== undefined ? data.full_name : old.full_name,
            data.email !== undefined ? data.email : old.email,
            data.phone !== undefined ? data.phone : old.phone,
            data.address !== undefined ? data.address : old.address,
            data.university_major !== undefined ? data.university_major : old.university_major,
            data.graduation_year !== undefined ? data.graduation_year : old.graduation_year,
            data.has_experience !== undefined 
                ? (data.has_experience == 'true' || data.has_experience == 1 ? 1 : 0) 
                : old.has_experience,
            data.exp_company_name !== undefined ? data.exp_company_name : old.exp_company_name,
            data.exp_position !== undefined ? data.exp_position : old.exp_position,
            data.exp_period !== undefined ? data.exp_period : old.exp_period,
            data.job_id !== undefined ? data.job_id : old.job_id,
            data.custom_job !== undefined ? data.custom_job : old.custom_job,
            cv_url,
            profile_image_url,
            data.interview_date !== undefined ? data.interview_date : old.interview_date,
            data.interview_time !== undefined ? data.interview_time : old.interview_time,
            data.interview_description !== undefined ? data.interview_description : old.interview_description,
            data.is_finished !== undefined 
                ? (data.is_finished == '1' || data.is_finished == 1 ? 1 : 0) 
                : old.is_finished,
            data.current_stage !== undefined ? data.current_stage : old.current_stage,
            data.rating !== undefined ? data.rating : old.rating,
            data.contract_status !== undefined ? data.contract_status : old.contract_status,
            data.contract_sent_date !== undefined ? data.contract_sent_date : old.contract_sent_date,
            id
        ];

        db.query(query, values, (err) => {
            if (err) {
                console.error("SQL Error:", err.message);
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: "Updated successfully" });
        });
    });
};

export const deleteCandidate = (req: Request, res: Response) => {
    const id = req.params.id;
    db.query('SELECT cv_url, profile_image_url FROM candidates WHERE id = ?', [id], (err, results: any) => {
        if (results?.[0]) {
            deleteFile(results[0].cv_url);
            deleteFile(results[0].profile_image_url);
        }
        db.query('DELETE FROM candidates WHERE id = ?', [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: "Deleted" });
        });
    });
};

export const deleteBulkCandidates = (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "No IDs provided" });

    db.query('SELECT cv_url, profile_image_url FROM candidates WHERE id IN (?)', [ids], (err, results: any) => {
        results?.forEach((row: any) => {
            deleteFile(row.cv_url);
            deleteFile(row.profile_image_url);
        });
        db.query('DELETE FROM candidates WHERE id IN (?)', [ids], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: "Bulk Deleted" });
        });
    });
};