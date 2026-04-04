import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gamified-edu';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    let admin = await User.findOne({ role: 'admin' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    if (admin) {
      console.log('Admin already exists, updating credentials...');
      admin.email = 'admin@eduplay.com';
      admin.username = 'admin';
      admin.password = hashedPassword;
      await admin.save();
    } else {
      admin = new User({
        username: 'admin',
        email: 'admin@eduplay.com',
        password: hashedPassword,
        role: 'admin',
        level: 10,
        xp: 500,
        achievements: ['System Architect', 'First Admin']
      });
      await admin.save();
    }
    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedAdmin();
