import express from 'express';

import paymentController from '../../controllers/payment.controller';

const router = express.Router();

router
  .route('/intent')
  .post(paymentController.createPaymentIntent)

export default router;
