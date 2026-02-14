const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Multer Config for Profile Photos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Get current user profile
router.get('/me', auth, async (req, res) => {
    try {
        if (req.app.get('isUsingMockDB')) {
            const user = req.app.locals.mockUsers.find(u => u._id === req.userData.userId);
            if (!user) return res.status(404).json({ message: 'User not found' });
            // remove password
            const { password, ...userWithoutPassword } = user;
            return res.json(userWithoutPassword);
        }

        const user = await User.findById(req.userData.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// Update profile (including avatar)
router.patch('/', auth, upload.single('avatar'), async (req, res) => {
    try {
        const updates = { ...req.body };
        if (req.file) {
            updates.avatar = `/uploads/${req.file.filename}`;
        }

        // Convert comma-separated skills to array if it's a string
        if (typeof updates.skills === 'string') {
            updates.skills = updates.skills.split(',').map(s => s.trim());
        }

        if (req.app.get('isUsingMockDB')) {
            const userIndex = req.app.locals.mockUsers.findIndex(u => u._id === req.userData.userId);
            if (userIndex === -1) return res.status(404).json({ message: 'User not found' });
            
            req.app.locals.mockUsers[userIndex] = { ...req.app.locals.mockUsers[userIndex], ...updates };
            const { password, ...userWithoutPassword } = req.app.locals.mockUsers[userIndex];
            return res.json(userWithoutPassword);
        }

        const user = await User.findByIdAndUpdate(
            req.userData.userId,
            { $set: updates },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Get professionals with search
router.get('/professionals', async (req, res) => {
    try {
        if (req.app.get('isUsingMockDB')) {
             const { search } = req.query;
             let professionals = req.app.locals.mockUsers || [];
             
             if (search) {
                 const lowerSearch = search.toLowerCase();
                 professionals = professionals.filter(p => 
                     (p.name && p.name.toLowerCase().includes(lowerSearch)) ||
                     (p.headline && p.headline.toLowerCase().includes(lowerSearch)) ||
                     (p.skills && Array.isArray(p.skills) && p.skills.some(s => s.toLowerCase().includes(lowerSearch)))
                 );
             }
             
             // Return simplified objects
             const safePros = professionals.map(p => {
                 const { password, ...rest } = p;
                 return rest;
             });
             return res.json(safePros);
        }

        const { search } = req.query;
        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: new RegExp(search, 'i') },
                    { headline: new RegExp(search, 'i') },
                    { about: new RegExp(search, 'i') },
                    { skills: new RegExp(search, 'i') }
                ]
            };
        }
        const professionals = await User.find(query).select('name headline company avatar skills about contact email');
        res.json(professionals);
    } catch (error) {
        console.error("Fetch Professionals Error:", error);
        // Ensure we don't return HTML by accident if something else fails
        res.status(500).json({ message: 'Error fetching professionals' });
    }
});

// Get single professional profile
router.get('/:id', async (req, res) => {
    try {
        if (req.app.get('isUsingMockDB')) {
            const user = req.app.locals.mockUsers.find(u => u._id === req.params.id);
            if (!user) return res.status(404).json({ message: 'Professional not found' });
            const { password, ...rest } = user;
            return res.json(rest);
        }
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'Professional not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching professional profile' });
    }
});

module.exports = router;