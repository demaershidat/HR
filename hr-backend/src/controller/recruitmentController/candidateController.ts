import { Request, Response } from "express";
import db from "../../utils/db";
import fs from "fs";
import path from "path";

const deleteFile = (filename: string | null) => {
    if (filename) {
        const filePath = path.join(process.cwd(), "uploads", filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
};

export const getAllCandidates = async (req: Request, res: Response) => {
    try {
        const [results] = await db.query(`SELECT c.*, j.job_title FROM candidates c LEFT JOIN jobs j ON c.job_id = j.id ORDER BY c.created_at DESC`);
        res.status(200).json(results);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const addCandidate = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const cv_url = files?.["cvFile"] ? files["cvFile"][0].filename : null;
        const profile_image_url = files?.["photoFile"] ? files["photoFile"][0].filename : null;

        const gradYear = data.graduation_year && data.graduation_year !== "null" ? Number(data.graduation_year) : null;
        const isOtherJob = data.job_id === "other";
        const jobId = isOtherJob || !data.job_id || data.job_id === "null" ? null : Number(data.job_id);
        const customJob = isOtherJob ? data.custom_job : null;

        const query = `
            INSERT INTO candidates (
                full_name, email, phone, address, university_major, graduation_year,
                has_experience, exp_company_name, exp_position, exp_period,
                cv_url, profile_image_url, job_id, custom_job, current_stage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `;

        const values = [
            data.full_name || null, data.email || null, data.phone || null, data.address || null,
            data.university_major || null, gradYear,
            data.has_experience == "true" || data.has_experience == 1 ? 1 : 0,
            data.exp_company_name || null, data.exp_position || null, data.exp_period || null,
            cv_url, profile_image_url, jobId, customJob
        ];

        await db.query(query, values);
        res.status(201).json({ message: "Candidate Added" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateCandidate = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

        const [results]: any = await db.query("SELECT * FROM candidates WHERE id = ?", [id]);
        if (!results || results.length === 0) return res.status(404).json({ error: "Candidate not found" });

        const old = results[0];
        let cv_url = old.cv_url;
        let profile_image_url = old.profile_image_url;

        if (files) {
            if (files["cvFile"]) { deleteFile(old.cv_url); cv_url = files["cvFile"][0].filename; }
            if (files["photoFile"]) { deleteFile(old.profile_image_url); profile_image_url = files["photoFile"][0].filename; }
        }

        if (data.removePhoto === "true") { deleteFile(old.profile_image_url); profile_image_url = null; }

        const isOtherJob = data.job_id === "other";
        const jobId = isOtherJob ? null : (data.job_id ? Number(data.job_id) : old.job_id);
        const customJob = isOtherJob ? data.custom_job : (data.job_id ? null : old.custom_job);

        const query = `
            UPDATE candidates SET
            full_name = ?, email = ?, phone = ?, address = ?, university_major = ?, graduation_year = ?, 
            has_experience = ?, exp_company_name = ?, exp_position = ?, exp_period = ?,
            job_id = ?, custom_job = ?, cv_url = ?, profile_image_url = ?,
            interview_date = ?, interview_time = ?, interview_description = ?, 
            is_finished = ?, current_stage = ?, rating = ?, contract_status = ?, contract_sent_date = ?
            WHERE id = ?
        `;

        const values = [
            data.full_name ?? old.full_name, data.email ?? old.email, data.phone ?? old.phone, data.address ?? old.address,
            data.university_major ?? old.university_major, data.graduation_year ?? old.graduation_year,
            data.has_experience !== undefined ? (data.has_experience == "true" || data.has_experience == 1 ? 1 : 0) : old.has_experience,
            data.exp_company_name ?? old.exp_company_name, data.exp_position ?? old.exp_position, data.exp_period ?? old.exp_period,
            jobId, customJob, cv_url, profile_image_url,
            data.interview_date ?? old.interview_date, data.interview_time ?? old.interview_time, data.interview_description ?? old.interview_description,
            data.is_finished !== undefined ? (data.is_finished == "1" || data.is_finished == 1 ? 1 : 0) : old.is_finished,
            data.current_stage ?? old.current_stage, data.rating ?? old.rating, data.contract_status ?? old.contract_status, data.contract_sent_date ?? old.contract_sent_date,
            id
        ];

        await db.query(query, values);
        res.status(200).json({ message: "Updated successfully" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteCandidate = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const [results]: any = await db.query("SELECT cv_url, profile_image_url FROM candidates WHERE id = ?", [id]);
        if (results?.[0]) { deleteFile(results[0].cv_url); deleteFile(results[0].profile_image_url); }
        await db.query("DELETE FROM candidates WHERE id = ?", [id]);
        res.status(200).json({ message: "Candidate deleted" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteBulkCandidates = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "No IDs provided" });
        const [results]: any = await db.query("SELECT cv_url, profile_image_url FROM candidates WHERE id IN (?)", [ids]);
        results.forEach((row: any) => { deleteFile(row.cv_url); deleteFile(row.profile_image_url); });
        await db.query("DELETE FROM candidates WHERE id IN (?)", [ids]);
        res.status(200).json({ message: "Bulk Deleted" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};