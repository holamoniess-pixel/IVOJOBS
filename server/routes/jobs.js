const express = require('express');
const Job = require('../models/Job');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
    try {
        if (req.app.get('isUsingMockDB')) {
            return res.json(req.app.locals.mockJobs);
        }
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        console.error("Job Fetch Error:", error);
        res.status(500).json({ message: 'Error fetching jobs' });
    }
});

// Post a job
router.post('/', auth, async (req, res) => {
    try {
        const { title, company, description, location, salary } = req.body;
        
        if (req.app.get('isUsingMockDB')) {
            const newJob = {
                _id: Date.now().toString(),
                title,
                company,
                description,
                location,
                salary,
                postedBy: req.userData.userId,
                createdAt: new Date()
            };
            req.app.locals.mockJobs.unshift(newJob);
            return res.status(201).json(newJob);
        }

        const newJob = new Job({
            title,
            company,
            description,
            location,
            salary,
            postedBy: req.userData.userId
        });
        await newJob.save();
        res.status(201).json(newJob);
    } catch (error) {
        console.error("Job Post Error:", error);
        res.status(500).json({ message: 'Error posting job' });
    }
});

module.exports = router;