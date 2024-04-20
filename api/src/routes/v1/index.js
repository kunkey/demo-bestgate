import express from 'express';

import depositRoute from './deposit.route';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/deposit',
    route: depositRoute,
  },
];


defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
