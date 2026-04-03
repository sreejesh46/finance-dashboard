const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const Joi = require('joi');

const router = express.Router();

const updateUserSchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid('Viewer', 'Analyst', 'Admin').required(),
    status: Joi.string().valid('active', 'inactive').required(),
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.route('/')
    .get(protect, authorize('Admin'), async (req, res) => {
        try {
            const users = await User.find({}).select('-password');
            res.json(users);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

router.route('/:id')
    /**
     * @swagger
     * /api/users/{id}:
     *   get:
     *     summary: Get user by ID
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: User profile
     */
    .get(protect, authorize('Admin'), async (req, res) => {
        try {
            const user = await User.findById(req.params.id).select('-password');
            if (user) {
                res.json(user);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    })
    /**
     * @swagger
     * /api/users/{id}:
     *   put:
     *     summary: Update user details or role
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Updated user profile
     */
    .put(protect, authorize('Admin'), async (req, res) => {
        try {
            const { error } = updateUserSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }

            const user = await User.findById(req.params.id);

            if (user) {
                if (req.body.email !== user.email) {
                    const existingUser = await User.findOne({ email: req.body.email });
                    if (existingUser) {
                        return res.status(400).json({ message: 'Email is already taken' });
                    }
                }

                const isAdminChange = user.role === 'Admin' && req.body.role !== 'Admin';
                const isAdminDeactivation = user.role === 'Admin' && req.body.status !== 'active';

                if (isAdminChange || isAdminDeactivation) {
                    const activeAdminCount = await User.countDocuments({
                        role: 'Admin',
                        status: 'active'
                    });

                    if (activeAdminCount <= 1) {
                        return res.status(400).json({
                            message: 'At least one active admin must remain in the system'
                        });
                    }
                }

                user.name = req.body.name;
                user.email = req.body.email;
                user.role = req.body.role;
                user.status = req.body.status;

                const updatedUser = await user.save();
                res.json({
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    status: updatedUser.status,
                    avatar: updatedUser.avatar
                });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    })
    /**
     * @swagger
     * /api/users/{id}:
     *   delete:
     *     summary: Delete a user
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: User removed
     */
    .delete(protect, authorize('Admin'), async (req, res) => {
        try {
            const user = await User.findById(req.params.id);

            if (user) {
                if (user.role === 'Admin') {
                    const activeAdminCount = await User.countDocuments({
                        role: 'Admin',
                        status: 'active'
                    });

                    if (user.status === 'active' && activeAdminCount <= 1) {
                        return res.status(400).json({
                            message: 'Cannot delete the last active admin account'
                        });
                    }

                    return res.status(400).json({ message: 'Cannot delete an Admin account' });
                }
                await User.deleteOne({ _id: user._id });
                res.json({ message: 'User removed' });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

module.exports = router;
