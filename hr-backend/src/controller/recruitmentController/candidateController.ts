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

        const isOtherJob = data.job_id === "other";
        const jobId = isOtherJob || !data.job_id || data.job_id === "null" ? null : Number(data.job_id);
        const customJob = isOtherJob ? data.custom_job : null;

        const query = `
            INSERT INTO candidates (
                full_name, email, phone, birth_date, age, address, 
                university_major, graduation_year, job_id, custom_job, 
                has_experience, exp_company_name, exp_position, exp_period, 
                cv_url, profile_image_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.full_name,
            data.email,
            data.phone,
            data.birth_date || null,
            data.age ? Number(data.age) : null,
            data.address,
            data.university_major,
            data.graduation_year ? Number(data.graduation_year) : null,
            jobId,
            customJob,
            data.has_experience === 'true' || data.has_experience === '1' ? 1 : 0,
            data.exp_company_name,
            data.exp_position,
            data.exp_period,
            cv_url,
            profile_image_url
        ];

        await db.query(query, values);
        res.status(201).json({ message: "Candidate Added" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateCandidate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const [rows]: any = await db.query("SELECT * FROM candidates WHERE id = ?", [id]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: "المرشح غير موجود" });
        }
        const currentData = rows[0];

        const full_name = data.full_name !== undefined ? data.full_name : currentData.full_name;
        const email = data.email !== undefined ? data.email : currentData.email;
        const phone = data.phone !== undefined ? data.phone : currentData.phone;
        const address = data.address !== undefined ? data.address : currentData.address;
        const university_major = data.university_major !== undefined ? data.university_major : currentData.university_major;
        const custom_job = data.custom_job !== undefined ? data.custom_job : currentData.custom_job;
        const current_stage = data.current_stage !== undefined ? data.current_stage : currentData.current_stage;
        const contract_status = data.contract_status !== undefined ? data.contract_status : currentData.contract_status;
        const rating = data.rating !== undefined ? data.rating : currentData.rating;
        const interview_time = data.interview_time !== undefined ? data.interview_time : currentData.interview_time;
        const interview_description = data.interview_description !== undefined ? data.interview_description : currentData.interview_description;

        const bDate = data.birth_date !== undefined 
            ? (data.birth_date && data.birth_date !== 'null' ? data.birth_date.split('T')[0] : null)
            : currentData.birth_date;

        const iDate = data.interview_date !== undefined
            ? (data.interview_date && data.interview_date !== 'null' ? data.interview_date.split('T')[0] : null)
            : currentData.interview_date;

        const vAge = data.age !== undefined 
            ? (data.age === 'null' || data.age === '' ? null : Number(data.age))
            : currentData.age;

        const vJobId = data.job_id !== undefined
            ? (data.job_id === 'null' || data.job_id === 'other' ? null : Number(data.job_id))
            : currentData.job_id;

        const vGradYear = data.graduation_year !== undefined
            ? (data.graduation_year === 'null' ? null : Number(data.graduation_year))
            : currentData.graduation_year;

        const query = `
            UPDATE candidates 
            SET 
                full_name = ?, email = ?, phone = ?, address = ?, 
                birth_date = ?, age = ?, 
                university_major = ?, graduation_year = ?, 
                job_id = ?, custom_job = ?, current_stage = ?, 
                contract_status = ?, rating = ?,
                interview_date = ?, interview_time = ?, interview_description = ?
            WHERE id = ?
        `;

        const values = [
            full_name, email, phone, address, 
            bDate, vAge, 
            university_major, vGradYear, 
            vJobId, custom_job, current_stage, 
            contract_status, rating,
            iDate, interview_time, interview_description,
            id
        ];

        await db.query(query, values);
        res.status(200).json({ message: "تم التحديث بنجاح" });
    } catch (err: any) {
        console.error("UPDATE ERROR:", err);
        res.status(500).json({ error: "خطأ في تحديث البيانات", details: err.message });
    }
};

export const deleteCandidate = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const [results]: any = await db.query("SELECT cv_url, profile_image_url FROM candidates WHERE id = ?", [id]);
        if (results?.[0]) { 
            deleteFile(results[0].cv_url); 
            deleteFile(results[0].profile_image_url); 
        }
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
        results.forEach((row: any) => { 
            deleteFile(row.cv_url); 
            deleteFile(row.profile_image_url); 
        });
        await db.query("DELETE FROM candidates WHERE id IN (?)", [ids]);
        res.status(200).json({ message: "Bulk Deleted" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};