import { Request, Response } from "express";
import db from '../utils/db';

const login = (req: Request, res: Response) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM admin WHERE email = ?';

    db.query(query, [email], (err, results: any[]) => {
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

export default login;