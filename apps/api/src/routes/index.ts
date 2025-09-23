import { Router } from 'express';
import auth from './auth.js';
import products from './products.js';
import cart from './cart.js';
import cartSession from './cart-session.js';
import cartSync from './cart-sync.js';
import orders from './orders.js';
import users from './users.js';
import privacy from './privacy.js';
import inventory from './inventory.js';
import payments from './payments.js';

export const apiRouter = Router();

apiRouter.use('/auth', auth);
apiRouter.use('/products', products);
apiRouter.use('/cart', cart);
apiRouter.use('/cart-session', cartSession);
apiRouter.use('/cart-sync', cartSync);
apiRouter.use('/orders', orders);
apiRouter.use('/users', users);
apiRouter.use('/privacy', privacy);
apiRouter.use('/inventory', inventory);
apiRouter.use('/payments', payments);
