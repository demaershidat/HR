import { Request, Response } from 'express';
import db from '../../utils/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const cleanValue = (val: any) => (val === 'null' || val === 'undefined' || val === '') ? null : val;

export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM employees ORDER BY id DESC');
    res.status(200).json(rows);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching employees', error: error.message });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const data = req.body;

  let profile_image = null;
  let cv_file_name = null;

  if (files && files['photoFile']) {
    profile_image = files['photoFile'][0].filename;
  } else {
    profile_image = cleanValue(data.profile_image_url);
  }

  if (files && files['cvFile']) {
    cv_file_name = files['cvFile'][0].filename;
  } else {
    cv_file_name = cleanValue(data.cv_url);
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const bDate = cleanValue(data.birth_date);
    const hDate = cleanValue(data.hire_date) || new Date();

    const query = `INSERT INTO employees (
        candidate_id, job_id, custom_job, full_name, email, phone, salary, address,
        birth_date, age, university_major, graduation_year, profile_image_url, cv_url, 
        social_security, iban, contract_type, department, career_level, assets_notes, hire_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      cleanValue(data.candidate_id),
      (cleanValue(data.job_id) === 'other') ? null : cleanValue(data.job_id),
      cleanValue(data.custom_job), 
      data.full_name, 
      cleanValue(data.email), 
      cleanValue(data.phone), 
      data.salary || 0, 
      cleanValue(data.address),
      bDate, 
      cleanValue(data.age), 
      cleanValue(data.university_major), 
      cleanValue(data.graduation_year), 
      profile_image, 
      cv_file_name, 
      cleanValue(data.social_security), 
      cleanValue(data.iban), 
      data.contract_type || 'دوام كامل', 
      cleanValue(data.department), 
      data.career_level || 'Junior', 
      cleanValue(data.assets_notes), 
      hDate, 
      data.status || 'active'
    ];

    const [result] = await connection.query<ResultSetHeader>(query, values);

    if (data.candidate_id && data.candidate_id !== 'null') {
      await connection.query('DELETE FROM candidates WHERE id = ?', [data.candidate_id]);
    }

    await connection.commit();
    res.status(201).json({ message: 'Employee created successfully', id: result.insertId });
  } catch (error: any) {
    await connection.rollback();
    res.status(500).json({ message: 'Error creating employee', error: error.message });
  } finally {
    connection.release();
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  const { id } = req.params;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const data = req.body;

  let profile_image_url = cleanValue(data.profile_image_url);
  let cv_url = cleanValue(data.cv_url);

  if (files) {
    if (files['photoFile']) profile_image_url = files['photoFile'][0].filename;
    if (files['cvFile']) cv_url = files['cvFile'][0].filename;
  }

  try {
    const bDate = cleanValue(data.birth_date);
    const hDate = cleanValue(data.hire_date);

    const query = `UPDATE employees SET
        job_id = ?, custom_job = ?, full_name = ?, email = ?, phone = ?, salary = ?, 
        address = ?, birth_date = ?, age = ?, university_major = ?, graduation_year = ?, 
        profile_image_url = ?, cv_url = ?, social_security = ?, iban = ?, 
        contract_type = ?, department = ?, career_level = ?, assets_notes = ?, hire_date = ?, status = ?
      WHERE id = ?`;

    const values = [
      (cleanValue(data.job_id) === 'other') ? null : cleanValue(data.job_id),
      cleanValue(data.custom_job), 
      data.full_name, 
      cleanValue(data.email), 
      cleanValue(data.phone), 
      data.salary || 0, 
      cleanValue(data.address), 
      bDate, 
      cleanValue(data.age), 
      cleanValue(data.university_major), 
      cleanValue(data.graduation_year), 
      profile_image_url, 
      cv_url, 
      cleanValue(data.social_security), 
      cleanValue(data.iban), 
      data.contract_type, 
      cleanValue(data.department), 
      data.career_level, 
      cleanValue(data.assets_notes), 
      hDate, 
      data.status, 
      id
    ];

    await db.query(query, values);
    res.status(200).json({ message: 'Employee updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating employee', error: error.message });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM employees WHERE id = ?', [id]);
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting employee', error: error.message });
  }
};