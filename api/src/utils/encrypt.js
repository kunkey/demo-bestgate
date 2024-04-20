import CryptoJS from 'crypto-js';

export const sha256 = (message) => {
  const hash = CryptoJS.SHA256(message).toString();
  return hash;
};

export const genAuthorization = (clientId, clientSecret) => {
  const hash = sha256(`${clientId}${clientSecret}`);
  return hash;
};

export const genPaymentIntenChecksum = (clientId, clientSecret, amount, clientIp, invoiceId, timestamp) => {
  const message = [clientId, clientSecret, amount, clientIp, invoiceId, timestamp].join('');
  const hash = sha256(message);
  return hash;
};

export const genNoticeChecksum = (clientSecret, amount, failureReason, invoiceId, payId, description, status) => {
  const message = [clientSecret, amount, failureReason, invoiceId, payId, description, status].join('');
  const hash = sha256(message);
  return hash;
};
