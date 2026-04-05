"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEmployee = exports.getAllEmployees = exports.createEmployee = void 0;
const db_1 = __importDefault(require("../../utils/db"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const deleteCandidateFiles = (connection, candidateId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield connection.query("SELECT cv_url FROM candidates WHERE id = ?", [candidateId]);
        if (rows.length > 0 && rows[0].cv_url) {
            const filePath = path_1.default.join(process.cwd(), "uploads", rows[0].cv_url);
            if (fs_1.default.existsSync(filePath))
                fs_1.default.unlinkSync(filePath);
        }
    }
    catch (err) {
        console.error("File deletion error:", err);
    }
});
const createEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { candidate_id, job_id, custom_job, full_name, email, phone, salary, profile_image_url } = req.body;
    if (!full_name || !email || (!job_id && !custom_job)) {
        return res.status(400).json({ message: 'الاسم، البريد الإلكتروني، والوظيفة متطلبات أساسية' });
    }
    const connection = yield db_1.default.getConnection();
    try {
        yield connection.beginTransaction();
        const [result] = yield connection.query(`INSERT INTO employees (candidate_id, job_id, custom_job, full_name, email, phone, salary, profile_image_url, hire_date) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
             ON DUPLICATE KEY UPDATE 
             full_name = VALUES(full_name),
             phone = VALUES(phone),
             salary = VALUES(salary),
             profile_image_url = VALUES(profile_image_url),
             job_id = VALUES(job_id),
             custom_job = VALUES(custom_job)`, [
            candidate_id || null,
            job_id || null,
            custom_job || null,
            full_name,
            email,
            phone || null,
            salary || null,
            profile_image_url || null
        ]);
        if (candidate_id) {
            yield deleteCandidateFiles(connection, candidate_id);
            yield connection.query('DELETE FROM candidates WHERE id = ?', [candidate_id]);
        }
        yield connection.commit();
        res.status(201).json({
            message: 'تم نقل الموظف بنجاح وحذف سجل المرشح نهائياً',
            id: result.insertId || candidate_id
        });
    }
    catch (error) {
        yield connection.rollback();
        console.error("Database Error:", error);
        res.status(500).json({ message: 'حدث خطأ أثناء معالجة الطلب', error: error.message });
    }
    finally {
        connection.release();
    }
});
exports.createEmployee = createEmployee;
const getAllEmployees = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_1.default.query(`
            SELECT e.*, j.job_title 
            FROM employees e
            LEFT JOIN jobs j ON e.job_id = j.id
            ORDER BY e.id DESC
        `);
        res.status(200).json(rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching employees', error: error.message });
    }
});
exports.getAllEmployees = getAllEmployees;
const deleteEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const [result] = yield db_1.default.query('DELETE FROM employees WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'الموظف غير موجود' });
        }
        res.status(200).json({ message: 'تم حذف الموظف بنجاح' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting employee', error: error.message });
    }
});
exports.deleteEmployee = deleteEmployee;
