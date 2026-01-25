const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    headline: String,
    location: String,
    contact: String,
    avatar: String,
    about: String,
    skills: [String],
    experience: [{
        title: String,
        company: String,
        duration: String
    }],
    education: [{
        degree: String,
        institution: String,
        duration: String
    }],
    linkedin: String,
    github: String,
    twitter: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
