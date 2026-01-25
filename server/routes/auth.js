const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (req.app.get('isUsingMockDB')) {
            const existingUser = req.app.locals.mockUsers.find(u => u.email === email);
            if (existingUser) return res.status(400).json({ message: 'User already exists' });

            const hashedPassword = await bcrypt.hash(password, 12);
            const newUser = {
                _id: Date.now().toString(),
                name,
                email,
                phone,
                password: hashedPassword,
                avatar: `https://placehold.co/120x120/0d47a1/ffffff?text=${encodeURIComponent(name.charAt(0))}`
            };
            req.app.locals.mockUsers.push(newUser);

            const token = jwt.sign(
                { email: newUser.email, userId: newUser._id },
                process.env.JWT_SECRET || 'secret_key_ivo',
                { expiresIn: '1h' }
            );
            return res.status(201).json({ token, userId: newUser._id });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            name,
            email,
            phone,
            password: hashedPassword
        });

        await newUser.save();

        // Create token
        const token = jwt.sign(
            { email: newUser.email, userId: newUser._id },
            process.env.JWT_SECRET || 'secret_key_ivo',
            { expiresIn: '1h' }
        );

        res.status(201).json({ token, userId: newUser._id });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: 'Server error during signup' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (req.app.get('isUsingMockDB')) {
            const user = req.app.locals.mockUsers.find(u => u.email === email);
            if (!user) return res.status(401).json({ message: 'Invalid credentials' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

            const token = jwt.sign(
                { email: user.email, userId: user._id },
                process.env.JWT_SECRET || 'secret_key_ivo',
                { expiresIn: '1h' }
            );
            return res.json({ token, userId: user._id });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { email: user.email, userId: user._id },
            process.env.JWT_SECRET || 'secret_key_ivo',
            { expiresIn: '1h' }
        );

        res.json({ token, userId: user._id });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;