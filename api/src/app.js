import express from 'express';
import cors from 'cors';
import moment from 'moment';
import axios from 'axios';
import { Server } from 'socket.io';
import { createServer } from 'http';

import { Payment } from './models';
import { PAYMENT_STATUS } from './config/constants';
import config from './config/config';
import { genPaymentIntenChecksum, genNoticeChecksum, genAuthorization } from './utils/encrypt';
import catchAsync from './utils/catchAsync';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  const { paymentId } = socket.handshake.query;
  if (paymentId) {
    socket.join(paymentId);
  }
});

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.options('*', cors());

app.post(
  '/create-payment-intent',
  catchAsync(async (req, res) => {
    const { amount, redirectUrl } = req.body;
    const payment = await Payment.create({
      amount,
      redirectUrl,
      status: PAYMENT_STATUS.created,
      description: `Nạp ${amount}. Thời gian: ${moment().format('DD-MM-YYYY HH:mm:ss')}`,
    });
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const timestamp = moment().valueOf();
    const checksum = genPaymentIntenChecksum(
      config.clientId,
      config.clientSecret,
      payment.amount,
      clientIp,
      payment.id,
      timestamp
    );
    const body = {
      clientId: config.clientId,
      amount: payment.amount,
      clientIp,
      invoiceId: payment.id,
      timestamp,
      description: payment.description,
      checksum,
      redirectUrl: payment.redirectUrl,
    };
    const signature = genAuthorization(config.clientId, config.clientSecret);
    try {
      const response = await axios.post(`${config.paymentGateUrl}/payment/create-order`, body, {
        headers: {
          signature,
        },
      });
      const result = {
        payment,
        paymentIntent: response.data,
      };
      res.send(result);
    } catch (error) {
      console.log(error);
      throw error;
    }
  })
);

app.post(
  '/ipn',
  catchAsync(async (req, res) => {
    const { checksum, result } = req.body;
    const { amount, invoiceId, payId, status, description, failureReason } = result;
    const checkChecksum = genNoticeChecksum(
      config.clientSecret,
      amount,
      failureReason,
      invoiceId,
      payId,
      description,
      status
    );
    if (checksum !== checkChecksum) {
      res.status(400).send('Invalid checksum');
    }
    const payment = await Payment.findById(invoiceId);
    Object.assign(payment, { status });
    await payment.save();
    io.to(payment.id.toString()).emit('UPDATE_PAYMENT_STATUS', payment);

    // Notice to web
    res.status(200).send('OK');
  })
);

export default httpServer;
