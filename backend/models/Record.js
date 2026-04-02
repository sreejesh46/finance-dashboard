const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: [true, 'Type is required (income or expense)'],
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
    },
    date: {
        type: Date,
        default: Date.now,
        required: [true, 'Date is required'],
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500,
    }
}, {
    timestamps: true
});

const Record = mongoose.model('Record', recordSchema);
module.exports = Record;
