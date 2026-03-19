"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteJob = exports.updateJob = exports.getAllJobs = exports.createJob = void 0;
const db_1 = __importDefault(require("../utils/db"));
const createJob = (req, res) => {
    const { job_title, company_name, job_description, publish_date, expiry_date, require_profile_image, require_cv } = req.body;
    const query = `INSERT INTO jobs (job_title, company_name, job_description, publish_date, expiry_date, require_profile_image, require_cv) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [job_title, company_name, job_description, publish_date, expiry_date, require_profile_image ? 1 : 0, require_cv ? 1 : 0];
    db_1.default.query(query, values, (err, result) => {
        if (err)
            return res.status(500).json({ error: 'DB Error' });
        res.status(201).json({ message: 'Created', jobId: result.insertId });
    });
};
exports.createJob = createJob;
const getAllJobs = (req, res) => {
    const query = `SELECT id, job_title, company_name, job_description, DATE_FORMAT(publish_date, '%Y-%m-%d') as publish_date, DATE_FORMAT(expiry_date, '%Y-%m-%d') as expiry_date, require_profile_image, require_cv FROM jobs ORDER BY id DESC`;
    db_1.default.query(query, (err, results) => {
        if (err)
            return res.status(500).json({ error: 'DB Error' });
        res.status(200).json(results);
    });
};
exports.getAllJobs = getAllJobs;
const updateJob = (req, res) => {
    const { id } = req.params;
    const { job_title, company_name, job_description, publish_date, expiry_date, require_profile_image, require_cv } = req.body;
    const query = `UPDATE jobs SET job_title = ?, company_name = ?, job_description = ?, publish_date = ?, expiry_date = ?, require_profile_image = ?, require_cv = ? WHERE id = ?`;
    const values = [job_title, company_name, job_description, publish_date, expiry_date, require_profile_image ? 1 : 0, require_cv ? 1 : 0, id];
    db_1.default.query(query, values, (err) => {
        if (err)
            return res.status(500).json({ error: 'DB Error' });
        res.status(200).json({ message: 'Updated' });
    });
};
exports.updateJob = updateJob;
const deleteJob = (req, res) => {
    db_1.default.query('DELETE FROM jobs WHERE id = ?', [req.params.id], (err) => {
        if (err)
            return res.status(500).json({ error: 'DB Error' });
        res.status(200).json({ message: 'Deleted' });
    });
};
exports.deleteJob = deleteJob;
