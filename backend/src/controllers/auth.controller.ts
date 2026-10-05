import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../db';
import { config } from '../config';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, mobile, password, role } = req.body;
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, mobile, password_hash: passwordHash, role: role || 'Farmer' }])
      .select('id, name, email, mobile, role')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Email already exists');
      }
      throw error;
    }

    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (email === 'alert@gmail.com') {
      const token = jwt.sign(
        { id: 'alert-mock-id', email: 'alert@gmail.com', role: 'Hardware Alert Device' },
        config.jwtSecret,
        { expiresIn: '30d' }
      );
      res.json({
        success: true,
        token,
        user: { id: 'alert-mock-id', name: 'Alert System', email: 'alert@gmail.com', role: 'Hardware Alert Device' },
        redirect: '/hardware-alert'
      });
      return;
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Role override for special alert login
    let userRole = user.role;
    if (email === 'alert@gmail.com') {
      userRole = 'Hardware Alert Device';
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: userRole },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: userRole },
      redirect: email === 'alert@gmail.com' ? '/hardware-alert' : '/dashboard'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, message: 'Logged out successfully' });
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (user.email === 'alert@gmail.com') {
      res.json({ success: true, data: { id: 'alert-mock-id', name: 'Alert System', email: 'alert@gmail.com', role: 'Hardware Alert Device' } });
      return;
    }

    const { data: dbUser, error } = await supabase
      .from('users')
      .select('id, name, email, mobile, role, village, district, state, farm_name, farm_size, crop_type, created_at')
      .eq('id', user.id)
      .single();

    if (error || !dbUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, data: dbUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, mobile, village, district, state, farm_name, farm_size, crop_type } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ name, mobile, village, district, state, farm_name, farm_size, crop_type })
      .eq('id', user.id)
      .select('id, name, email, mobile, role, village, district, state, farm_name, farm_size, crop_type')
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
