const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

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
            const user = await User.findById(req.params.id);

            if (user) {
                user.name = req.body.name || user.name;
                user.email = req.body.email || user.email;
                user.role = req.body.role || user.role;
                user.status = req.body.status || user.status;

                const updatedUser = await user.save();
                res.json({
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    status: updatedUser.status
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
