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
exports.deleteBulkCandidates = exports.deleteCandidate = exports.updateCandidate = exports.addCandidate = exports.getAllCandidates = void 0;
const db_1 = __importDefault(require("../../utils/db"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const deleteFile = (filename) => {
    if (filename) {
        const filePath = path_1.default.join(process.cwd(), "uploads", filename);
        if (fs_1.default.existsSync(filePath))
            fs_1.default.unlinkSync(filePath);
    }
};
const getAllCandidates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [results] = yield db_1.default.query(`SELECT c.*, j.job_title FROM candidates c LEFT JOIN jobs j ON c.job_id = j.id ORDER BY c.created_at DESC`);
        res.status(200).json(results);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getAllCandidates = getAllCandidates;
const addCandidate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const files = req.files;
        const cv_url = (files === null || files === void 0 ? void 0 : files["cvFile"]) ? files["cvFile"][0].filename : null;
        const profile_image_url = (files === null || files === void 0 ? void 0 : files["photoFile"]) ? files["photoFile"][0].filename : null;
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
        yield db_1.default.query(query, values);
        res.status(201).json({ message: "Candidate Added" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.addCandidate = addCandidate;
const updateCandidate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    try {
        const id = Number(req.params.id);
        const data = req.body;
        const files = req.files;
        const [results] = yield db_1.default.query("SELECT * FROM candidates WHERE id = ?", [id]);
        if (!results || results.length === 0)
            return res.status(404).json({ error: "Candidate not found" });
        const old = results[0];
        let cv_url = old.cv_url;
        let profile_image_url = old.profile_image_url;
        if (files) {
            if (files["cvFile"]) {
                deleteFile(old.cv_url);
                cv_url = files["cvFile"][0].filename;
            }
            if (files["photoFile"]) {
                deleteFile(old.profile_image_url);
                profile_image_url = files["photoFile"][0].filename;
            }
        }
        if (data.removePhoto === "true") {
            deleteFile(old.profile_image_url);
            profile_image_url = null;
        }
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
            (_a = data.full_name) !== null && _a !== void 0 ? _a : old.full_name,
            (_b = data.email) !== null && _b !== void 0 ? _b : old.email,
            (_c = data.phone) !== null && _c !== void 0 ? _c : old.phone,
            (_d = data.address) !== null && _d !== void 0 ? _d : old.address,
            (_e = data.university_major) !== null && _e !== void 0 ? _e : old.university_major,
            (_f = data.graduation_year) !== null && _f !== void 0 ? _f : old.graduation_year,
            data.has_experience !== undefined ? (data.has_experience == "true" || data.has_experience == 1 ? 1 : 0) : old.has_experience,
            (_g = data.exp_company_name) !== null && _g !== void 0 ? _g : old.exp_company_name,
            (_h = data.exp_position) !== null && _h !== void 0 ? _h : old.exp_position,
            (_j = data.exp_period) !== null && _j !== void 0 ? _j : old.exp_period,
            jobId, customJob, cv_url, profile_image_url,
            (_k = data.interview_date) !== null && _k !== void 0 ? _k : old.interview_date,
            (_l = data.interview_time) !== null && _l !== void 0 ? _l : old.interview_time,
            (_m = data.interview_description) !== null && _m !== void 0 ? _m : old.interview_description,
            data.is_finished !== undefined ? (data.is_finished == "1" || data.is_finished == 1 ? 1 : 0) : old.is_finished,
            (_o = data.current_stage) !== null && _o !== void 0 ? _o : old.current_stage,
            (_p = data.rating) !== null && _p !== void 0 ? _p : old.rating,
            (_q = data.contract_status) !== null && _q !== void 0 ? _q : old.contract_status,
            (_r = data.contract_sent_date) !== null && _r !== void 0 ? _r : old.contract_sent_date,
            id
        ];
        yield db_1.default.query(query, values);
        res.status(200).json({ message: "Updated successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.updateCandidate = updateCandidate;
const deleteCandidate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const [results] = yield db_1.default.query("SELECT cv_url, profile_image_url FROM candidates WHERE id = ?", [id]);
        if (results === null || results === void 0 ? void 0 : results[0]) {
            deleteFile(results[0].cv_url);
            deleteFile(results[0].profile_image_url);
        }
        yield db_1.default.query("DELETE FROM candidates WHERE id = ?", [id]);
        res.status(200).json({ message: "Candidate deleted" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.deleteCandidate = deleteCandidate;
const deleteBulkCandidates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids))
            return res.status(400).json({ error: "No IDs provided" });
        const [results] = yield db_1.default.query("SELECT cv_url, profile_image_url FROM candidates WHERE id IN (?)", [ids]);
        results.forEach((row) => { deleteFile(row.cv_url); deleteFile(row.profile_image_url); });
        yield db_1.default.query("DELETE FROM candidates WHERE id IN (?)", [ids]);
        res.status(200).json({ message: "Bulk Deleted" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.deleteBulkCandidates = deleteBulkCandidates;
