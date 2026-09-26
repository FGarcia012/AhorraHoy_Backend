import { Schema, model } from 'mongoose';

const expenseSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['HOUSING', 'FOOD', 'TRANSPORT', 'UTILITIES', 'HEALTH', 'EDUCATION', 'ENTERTAINMENT', 'DEBT', 'OTHER']
    },
    description: {
        type: String,
        maxLength: [100, 'Description cannot exceed 100 characters']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be greater than 0']
    },
    frequency: {
        type: String,
        required: [true, 'Frequency is required'],
        enum: ['WEEKLY', 'MONTHLY', 'BIMONTHLY', 'SEMESTERLY', 'YEARLY', 'IRREGULAR']
    }
},
{
    versionKey: false,
    timestamps: true
});

expenseSchema.methods.toJSON = function () {
    const { __v, _id, ...expense } = this.toObject();
    expense.eid = _id;
    return expense;
};

export default model('Expense', expenseSchema);
