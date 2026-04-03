const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};

const formatAuthUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    avatar: user.avatar,
    createdAt: user.createdAt,
    token: generateToken(user._id),
});

const registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully registered
 *       400:
 *         description: Validation error or user exists
 */
router.post('/register', async (req, res) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            // By default role is Viewer. For the first test user, we could make them Admin, but we will leave it default for security.
        });

        if (user) {
            res.status(201).json(formatAuthUser(user));
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const profileUpdateSchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    email: Joi.string().email().required(),
    avatar: Joi.string().allow('').optional(),
    currentPassword: Joi.string().allow('').optional(),
    newPassword: Joi.string().min(6).allow('').optional(),
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { email, password } = req.body;
        
        const user = await User.findOne({ email });

        if (user && user.status === 'inactive') {
            return res.status(401).json({ message: 'User account is inactive' });
        }

        if (user && (await user.matchPassword(password))) {
            res.json(formatAuthUser(user));
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current User Profile
 *       401:
 *         description: Not authorized
 */
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/profile', protect, async (req, res) => {
    try {
        const { error } = profileUpdateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            if (req.body.email && req.body.email !== user.email) {
                // If checking for unique emails manually is required
                const emailExists = await User.findOne({ email: req.body.email });
                if (emailExists) return res.status(400).json({ message: 'Email is already taken' });
                user.email = req.body.email;
            }
            if (req.body.avatar !== undefined) {
                user.avatar = req.body.avatar;
            }
            
            if (req.body.newPassword && req.body.currentPassword) {
                if (await user.matchPassword(req.body.currentPassword)) {
                    user.password = req.body.newPassword;
                } else {
                    return res.status(400).json({ message: 'Current password is incorrect' });
                }
            } else if (req.body.newPassword) {
                 return res.status(400).json({ message: 'Current password is required to set a new password' });
            }

            const updatedUser = await user.save();

            res.json(formatAuthUser(updatedUser));
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
