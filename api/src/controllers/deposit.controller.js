import httpStatus from 'http-status';

import catchAsync from '../utils/catchAsync';
import { paymentService } from '../services';

const createPaymentIntent = catchAsync(async (req, res) => {
  const payment = await paymentService.createPaymentIntent(req.body);
  res.status(httpStatus.CREATED).send(payment);
});

export default {
  createPaymentIntent,
};
