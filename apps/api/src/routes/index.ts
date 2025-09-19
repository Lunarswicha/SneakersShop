import { Router } from 'express';
import auth from './auth.js';
import products from './products.js';
import cart from './cart.js';
import cartSession from './cart-session.js';
import orders from './orders.js';
import users from './users.js';
import privacy from './privacy.js';

export const apiRouter = Router();

apiRouter.use('/auth', auth);
apiRouter.use('/products', products);
apiRouter.use('/cart', cart);
apiRouter.use('/cart-session', cartSession);
apiRouter.use('/orders', orders);
apiRouter.use('/users', users);
apiRouter.use('/privacy', privacy);
