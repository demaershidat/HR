"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInterview = exports.updateInterview = exports.addInterview = exports.getAllInterviews = void 0;
const db_1 = __importDefault(require("../utils/db"));
const getAllInterviews = (req, res) => {
    const query = `
        SELECT 
            c.id AS candidate_id, 
            c.full_name, 
            c.profile_image_url,
            c.job_id,
            c.custom_job,
            i.id AS interview_id,
            i.interview_date, 
            i.interview_time, 
            i.interview_description, 
            i.is_finished
        FROM candidates c
        LEFT JOIN interviews i ON c.id = i.candidate_id
        WHERE c.current_stage = 2
        ORDER BY i.interview_date DESC`;
    db_1.default.query(query, (err, results) => {
        if (err)
            return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};
exports.getAllInterviews = getAllInterviews;
const addInterview = (req, res) => {
    const { candidate_id, interview_date, interview_time, interview_description, is_finished } = req.body;
    const insertQuery = `INSERT INTO interviews (candidate_id, interview_date, interview_time, interview_description, is_finished) VALUES (?, ?, ?, ?, ?)`;
    const updateCandidateQuery = `UPDATE candidates SET current_stage = 2 WHERE id = ?`;
    db_1.default.beginTransaction((err) => {
        if (err)
            return res.status(500).json({ error: err.message });
        db_1.default.query(insertQuery, [candidate_id, interview_date, interview_time, interview_description || null, is_finished ? 1 : 0], (err) => {
            if (err)
                return db_1.default.rollback(() => res.status(500).json({ error: err.message }));
            db_1.default.query(updateCandidateQuery, [candidate_id], (err) => {
                if (err)
                    return db_1.default.rollback(() => res.status(500).json({ error: err.message }));
                db_1.default.commit((err) => {
                    if (err)
                        return db_1.default.rollback(() => res.status(500).json({ error: err.message }));
                    res.status(201).json({ message: "Interview scheduled and candidate moved to stage 2" });
                });
            });
        });
    });
};
exports.addInterview = addInterview;
const updateInterview = (req, res) => {
    const id = req.params.id;
    const { interview_date, interview_time, interview_description, is_finished } = req.body;
    const query = `
        UPDATE interviews SET 
        interview_date = ?, 
        interview_time = ?, 
        interview_description = ?, 
        is_finished = ? 
        WHERE id = ?`;
    db_1.default.query(query, [interview_date, interview_time, interview_description, is_finished ? 1 : 0, id], (err) => {
        if (err)
            return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Interview updated" });
    });
};
exports.updateInterview = updateInterview;
const deleteInterview = (req, res) => {
    const id = req.params.id;
    db_1.default.query('DELETE FROM interviews WHERE id = ?', [id], (err) => {
        if (err)
            return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Interview deleted" });
    });
};
exports.deleteInterview = deleteInterview;
