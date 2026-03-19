"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../utils/db"));
const login = (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM admin WHERE email = ?';
    db_1.default.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error executing query: ', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const user = results[0];
        if (password === user.password) {
            const token = `auth_token_${user.id}_${Date.now()}`;
            return res.status(200).json({
                message: 'Login successful',
                token: token,
                user: { id: user.id, email: user.email }
            });
        }
        return res.status(401).json({ error: 'Invalid email or password' });
    });
};
exports.default = login;
