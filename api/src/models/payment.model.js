import mongoose from 'mongoose';

import toJSON from './plugins/toJSON.plugin';
import { PAYMENT_STATUS } from '../config/constants';

const paymentSchema = mongoose.Schema(
  {
    amount: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    redirectUrl: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.created,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.plugin(toJSON);

/**
 * @typedef Payment
 */
const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
