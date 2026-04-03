const express = require('express');
const Record = require('../models/Record');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/authMiddleware');
const Joi = require('joi');

const router = express.Router();

const recordSchema = Joi.object({
    amount: Joi.number().required(),
    type: Joi.string().valid('income', 'expense').required(),
    category: Joi.string().required(),
    date: Joi.date().iso().optional(),
    notes: Joi.string().max(500).allow('', null).optional()
});

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: Get all financial records (with filtering and pagination)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by type (income or expense)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: List of records
 */
router.route('/')
    .get(protect, authorize('Analyst', 'Admin'), async (req, res) => {
        try {
            const { type, category, startDate, endDate, search, page = 1, limit = 10 } = req.query;
            let query = {};

            if (type) query.type = type;
            if (category) query.category = category;
            
            if (startDate || endDate) {
                query.date = {};
                if (startDate) query.date.$gte = new Date(startDate);
                if (endDate) query.date.$lte = new Date(endDate);
            }

            if (search) {
                 query.$or = [
                     { category: { $regex: search, $options: 'i' } },
                     { notes: { $regex: search, $options: 'i' } }
                 ];
            }

            const records = await Record.find(query)
                .populate('user', 'name email')
                .sort({ date: -1 })
                .limit(parseInt(limit))
                .skip((parseInt(page) - 1) * parseInt(limit));

            const total = await Record.countDocuments(query);

            res.json({
                records,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    })
    /**
     * @swagger
     * /api/records:
     *   post:
     *     summary: Create a new financial record
     *     tags: [Records]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       201:
     *         description: Record created
     */
    .post(protect, authorize('Admin'), async (req, res) => {
        try {
            const { error } = recordSchema.validate(req.body);
            if (error) return res.status(400).json({ message: error.details[0].message });

            const record = new Record({
                ...req.body,
                user: req.user._id
            });

            const createdRecord = await record.save();

            // Auto-notify
            const formatCur = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num || 0);
            try {
                await Notification.create({
                    user: req.user._id,
                    message: `New ${createdRecord.type} logged: ${formatCur(createdRecord.amount)} for ${createdRecord.category}`,
                    type: createdRecord.type === 'income' ? 'success' : 'info'
                });
            } catch(e) {
                console.error("Failed to generate notification: ", e);
            }

            res.status(201).json(createdRecord);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

/**
 * @swagger
 * /api/records/analytics:
 *   get:
 *     summary: Get financial analytics
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 */
router.get('/analytics', protect, authorize('Viewer', 'Analyst', 'Admin'), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = {};
        
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const records = await Record.find(query);
        
        // Basic aggregations
        const totalIncome = records.filter(r => r.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
        const totalExpense = records.filter(r => r.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
        const netBalance = totalIncome - totalExpense;

        // Category breakdown
        const categoryBreakdown = records.reduce((acc, curr) => {
            if (!acc[curr.category]) acc[curr.category] = 0;
            acc[curr.category] += curr.amount;
            return acc;
        }, {});

        // Monthly trends
        const monthlyTrends = records.reduce((acc, curr) => {
            const date = new Date(curr.date);
            const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            if (!acc[monthYear]) acc[monthYear] = { income: 0, expense: 0 };
            acc[monthYear][curr.type] += curr.amount;
            return acc;
        }, {});

        res.json({
            totalIncome,
            totalExpense,
            netBalance,
            categoryBreakdown,
            monthlyTrends,
            totalRecords: records.length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.route('/:id')
    /**
     * @swagger
     * /api/records/{id}:
     *   put:
     *     summary: Update a financial record
     *     tags: [Records]
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
     *         description: Updated record
     */
    .put(protect, authorize('Admin'), async (req, res) => {
        try {
            const { error } = recordSchema.validate(req.body);
            if (error) return res.status(400).json({ message: error.details[0].message });

            const record = await Record.findById(req.params.id);

            if (record) {
                record.amount = req.body.amount || record.amount;
                record.type = req.body.type || record.type;
                record.category = req.body.category || record.category;
                record.date = req.body.date || record.date;
                record.notes = req.body.notes !== undefined ? req.body.notes : record.notes;

                const updatedRecord = await record.save();
                res.json(updatedRecord);
            } else {
                res.status(404).json({ message: 'Record not found' });
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    })
    /**
     * @swagger
     * /api/records/{id}:
     *   delete:
     *     summary: Delete a financial record
     *     tags: [Records]
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
     *         description: Record removed
     */
    .delete(protect, authorize('Admin'), async (req, res) => {
        try {
            const record = await Record.findById(req.params.id);

            if (record) {
                await Record.deleteOne({ _id: record._id });
                res.json({ message: 'Record removed' });
            } else {
                res.status(404).json({ message: 'Record not found' });
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

module.exports = router;
