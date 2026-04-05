import { Request, Response } from "express";
import db from '../../utils/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const [rows]: any = await db.query('SELECT * FROM admin WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(String(password).trim(), String(user.password).trim());
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email }
        });

    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
    }
};

export default login;