import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { auth } from '../middleware/auth.js';
import { validate, objectId } from '../middleware/validate.js';
import * as authController from '../controllers/authController.js';
import * as userController from '../controllers/userController.js';
import * as categoryController from '../controllers/categoryController.js';
import * as transactionController from '../controllers/transactionController.js';
import * as budgetController from '../controllers/budgetController.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = Router();
const idSchema = z.object({ id: objectId });

// Only login is public; it is also the only rate-limited endpoint.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later' },
});

router.post(
  '/auth/login',
  loginLimiter,
  validate({ body: authController.loginSchema }),
  authController.login
);

// Every route below this line requires a valid JWT.
router.use(auth);

router.get('/auth/me', authController.me);

router.post(
  '/auth/change-password',
  validate({ body: authController.changePasswordSchema }),
  authController.changePassword
);

router.get('/users', userController.listUsers);

router.get(
  '/categories',
  validate({ query: categoryController.listCategoriesQuerySchema }),
  categoryController.listCategories
);
router.post(
  '/categories',
  validate({ body: categoryController.createCategorySchema }),
  categoryController.createCategory
);
router.put(
  '/categories/:id',
  validate({ params: idSchema, body: categoryController.updateCategorySchema }),
  categoryController.updateCategory
);
router.delete(
  '/categories/:id',
  validate({ params: idSchema }),
  categoryController.deleteCategory
);

// IMPORTANT: /export must be registered before /transactions/:id.
router.get(
  '/transactions',
  validate({ query: transactionController.transactionListQuerySchema }),
  transactionController.listTransactions
);
router.get(
  '/transactions/export',
  validate({ query: transactionController.transactionFilterSchema }),
  transactionController.exportTransactions
);
router.post(
  '/transactions',
  validate({ body: transactionController.createTransactionSchema }),
  transactionController.createTransaction
);
router.get(
  '/transactions/:id',
  validate({ params: idSchema }),
  transactionController.getTransaction
);
router.put(
  '/transactions/:id',
  validate({ params: idSchema, body: transactionController.updateTransactionSchema }),
  transactionController.updateTransaction
);
router.delete(
  '/transactions/:id',
  validate({ params: idSchema }),
  transactionController.deleteTransaction
);

router.get(
  '/budgets',
  validate({ query: budgetController.budgetQuerySchema }),
  budgetController.listBudgets
);
router.put(
  '/budgets',
  validate({ body: budgetController.upsertBudgetSchema }),
  budgetController.upsertBudget
);

router.get(
  '/dashboard',
  validate({ query: dashboardController.dashboardQuerySchema }),
  dashboardController.getDashboard
);

export default router;
