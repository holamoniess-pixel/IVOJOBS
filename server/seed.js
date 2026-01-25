const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Job = require('./models/Job');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Job.deleteMany({});

        // Create a demo admin/professional
        const hashedPassword = await bcrypt.hash('password123', 12);
        const admin = new User({
            name: 'IVO Admin',
            email: 'admin@ivo.com',
            password: hashedPassword,
            headline: 'Full Stack Engineer & IVO Architect',
            location: 'Accra, Ghana',
            contact: 'ivo.care25@gmail.com',
            about: 'I built the core architecture of IVO to help professionals connect world-wide.',
            skills: ['Node.js', 'React', 'MongoDB', 'AI Integration'],
            experience: [{ title: 'Lead Architect', company: 'IVO', duration: '2024 - Present' }],
            education: [{ degree: 'BSc Computer Science', institution: 'University of Ghana', duration: '2016-2020' }]
        });

        await admin.save();

        // Create some sample professionals
        const p1 = new User({
            name: 'Sarah Johnson',
            email: 'sarah.j@example.com',
            password: hashedPassword,
            headline: 'Senior UI/UX Designer',
            location: 'Lagos, Nigeria',
            contact: '+234 800 000 0000',
            about: 'Passionate about creating beautiful and functional interfaces.',
            skills: ['Figma', 'Adobe XD', 'Prototyping'],
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150'
        });

        const p2 = new User({
            name: 'Kwame Mensah',
            email: 'kwame.m@example.com',
            password: hashedPassword,
            headline: 'Backend Specialist',
            location: 'Kumasi, Ghana',
            contact: 'kwame.specialist@example.com',
            about: 'Expert in scaling distributed systems and database optimization.',
            skills: ['Go', 'Kubernetes', 'PostgreSQL'],
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150'
        });

        await Promise.all([p1.save(), p2.save()]);

        // Create some sample jobs
        const job1 = new Job({
            title: 'Senior Frontend Developer',
            company: 'TechFlow Solutions',
            description: 'We are looking for an expert in modern CSS and Javascript to build premium interfaces.',
            postedBy: admin._id
        });

        const job2 = new Job({
            title: 'Digital Marketing Lead',
            company: 'GrowthHub',
            description: 'Help us scale our client base across West Africa using data-driven strategies.',
            postedBy: admin._id
        });

        await Promise.all([job1.save(), job2.save()]);

        console.log('Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
