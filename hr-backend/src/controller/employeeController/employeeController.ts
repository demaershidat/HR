import { Request, Response } from 'express';
import db from '../../utils/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import fs from "fs";
import path from "path";

const deleteCandidateFiles = async (connection: any, candidateId: number) => {
    try {
        const [rows]: any = await connection.query(
            "SELECT cv_url FROM candidates WHERE id = ?", 
            [candidateId]
        );
        if (rows.length > 0 && rows[0].cv_url) {
            const filePath = path.join(process.cwd(), "uploads", rows[0].cv_url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
    } catch (err) {
        console.error("File deletion error:", err);
    }
};

export const createEmployee = async (req: Request, res: Response) => {
    const { 
        candidate_id, 
        job_id, 
        custom_job, 
        full_name, 
        email, 
        phone, 
        salary, 
        profile_image_url 
    } = req.body;
    
    if (!full_name || !email || (!job_id && !custom_job)) {
        return res.status(400).json({ message: 'الاسم، البريد الإلكتروني، والوظيفة متطلبات أساسية' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query<ResultSetHeader>(
            `INSERT INTO employees (candidate_id, job_id, custom_job, full_name, email, phone, salary, profile_image_url, hire_date) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
             ON DUPLICATE KEY UPDATE 
             full_name = VALUES(full_name),
             phone = VALUES(phone),
             salary = VALUES(salary),
             profile_image_url = VALUES(profile_image_url),
             job_id = VALUES(job_id),
             custom_job = VALUES(custom_job)`,
            [
                candidate_id || null, 
                job_id || null, 
                custom_job || null, 
                full_name, 
                email, 
                phone || null, 
                salary || null, 
                profile_image_url || null
            ]
        );

        if (candidate_id) {
            await deleteCandidateFiles(connection, candidate_id);
            
            await connection.query('DELETE FROM candidates WHERE id = ?', [candidate_id]);
        }

        await connection.commit();
        res.status(201).json({
            message: 'تم نقل الموظف بنجاح وحذف سجل المرشح نهائياً',
            id: result.insertId || candidate_id
        });
    } catch (error: any) {
        await connection.rollback();
        console.error("Database Error:", error);
        res.status(500).json({ message: 'حدث خطأ أثناء معالجة الطلب', error: error.message });
    } finally {
        connection.release();
    }
};

export const getAllEmployees = async (req: Request, res: Response) => {
    try {
        const [rows] = await db.query<RowDataPacket[]>(`
            SELECT e.*, j.job_title 
            FROM employees e
            LEFT JOIN jobs j ON e.job_id = j.id
            ORDER BY e.id DESC
        `);
        res.status(200).json(rows);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching employees', error: error.message });
    }
};

export const deleteEmployee = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [result] = await db.query<ResultSetHeader>('DELETE FROM employees WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'الموظف غير موجود' });
        }
        res.status(200).json({ message: 'تم حذف الموظف بنجاح' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting employee', error: error.message });
    }
};