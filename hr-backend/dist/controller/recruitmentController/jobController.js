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
exports.deleteJob = exports.updateJob = exports.getAllJobs = exports.createJob = void 0;
const db_1 = __importDefault(require("../../utils/db"));
const createJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const [result] = yield db_1.default.query(query, values);
        res.status(201).json({ message: 'Created', jobId: result.insertId });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB Error' });
    }
});
exports.createJob = createJob;
const getAllJobs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = `
      SELECT id, job_title, company_name, job_description, 
        DATE_FORMAT(publish_date, '%Y-%m-%d') as publish_date, 
        DATE_FORMAT(expiry_date, '%Y-%m-%d') as expiry_date, 
        require_profile_image, require_cv 
      FROM jobs 
      ORDER BY id DESC
    `;
        const [results] = yield db_1.default.query(query);
        res.status(200).json(results);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB Error' });
    }
});
exports.getAllJobs = getAllJobs;
const updateJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield db_1.default.query(query, values);
        res.status(200).json({ message: 'Updated' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB Error' });
    }
});
exports.updateJob = updateJob;
const deleteJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield db_1.default.query('DELETE FROM jobs WHERE id = ?', [id]);
        res.status(200).json({ message: 'Deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB Error' });
    }
});
exports.deleteJob = deleteJob;
