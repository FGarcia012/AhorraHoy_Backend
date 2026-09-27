import { Schema, model } from 'mongoose';
import { toQuetzales } from '../helpers/money.js';

const transactionSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    goal: {
        type: Schema.Types.ObjectId,
        ref: 'Meta',
        required: [true, 'Goal is required']
    },
    type: {
        type: String,
        enum: ['DEPOSIT', 'WITHDRAW'],
        required: [true, 'Transaction type is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [1, 'Amount must be greater than 0']
    }
},
{
    versionKey: false,
    timestamps: true
});

transactionSchema.methods.toJSON = function () {
    const { __v, _id, ...transaction } = this.toObject();
    transaction.tid = _id;
    transaction.amount = toQuetzales(transaction.amount);
    return transaction;
};

export default model('Transaction', transactionSchema);