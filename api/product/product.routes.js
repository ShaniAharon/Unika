import express from 'express'
import {
  requireAuth,
  requireAdmin,
} from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'
import {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  removeProduct,
  addProductMsg,
  removeProductMsg,
} from './product.controller.js'

const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getProducts)
router.get('/:id', getProductById)
router.post('/', requireAdmin, addProduct)
router.put('/:id', requireAdmin, updateProduct)
router.delete('/:id', requireAdmin, removeProduct)

router.post('/:id/msg', requireAuth, addProductMsg)
router.delete('/:id/msg/:msgId', requireAuth, removeProductMsg)

export const productRoutes = router
