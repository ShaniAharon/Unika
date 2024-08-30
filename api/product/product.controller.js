import { productService } from './product.service.js'
import { logger } from '../../services/logger.service.js'

export async function getProducts(req, res) {
  try {
    console.log('req.query', req.query)
    // {
    //   byName: 'aaa',
    //   inStock: '',
    //   sortBy: '', // name , price
    //   byLable: [ 'Doll', 'Battery Powered' ]
    // }
    const filterBy = {
      txt: req.query.byName || '',
      status: req.query.inStock || null,
      labels: req.query.byLable || null,
      category: req.query.category || null,
    }
    const sortBy = req.query.sortBy
      ? {
        [req.query.sortBy]: 1,
      }
      : {}

    logger.debug('Getting Products', filterBy)
    const products = await productService.query(filterBy, sortBy)
    res.json(products)
  } catch (err) {
    logger.error('Failed to get products', err)
    res.status(500).send({ err: 'Failed to get products' })
  }
}

export async function getProductById(req, res) {
  try {
    const productId = req.params.id
    const product = await productService.getById(productId)
    res.json(product)
  } catch (err) {
    logger.error('Failed to get product', err)
    res.status(500).send({ err: 'Failed to get product' })
  }
}

export async function addProduct(req, res) {
  const { loggedinUser } = req

  try {
    const product = req.body
    product.owner = loggedinUser
    const addedProduct = await productService.add(product)
    res.json(addedProduct)
  } catch (err) {
    logger.error('Failed to add product', err)
    res.status(500).send({ err: 'Failed to add product' })
  }
}

export async function updateProduct(req, res) {
  try {
    const product = req.body
    const updatedProduct = await productService.update(product)
    res.json(updatedProduct)
  } catch (err) {
    logger.error('Failed to update product', err)
    res.status(500).send({ err: 'Failed to update product' })
  }
}

export async function removeProduct(req, res) {
  try {
    const productId = req.params.id
    await productService.remove(productId)
    res.send()
  } catch (err) {
    logger.error('Failed to remove product', err)
    res.status(500).send({ err: 'Failed to remove product' })
  }
}

export async function addProductMsg(req, res) {
  const { loggedinUser } = req
  const { _id, fullname } = loggedinUser
  try {
    const productId = req.params.id
    const msg = {
      txt: req.body.txt,
      by: { _id, fullname },
    }
    const savedMsg = await productService.addProductMsg(productId, msg)
    res.json(savedMsg)
  } catch (err) {
    logger.error('Failed to update product', err)
    res.status(500).send({ err: 'Failed to update product' })
  }
}

export async function removeProductMsg(req, res) {
  const { loggedinUser } = req
  try {
    const productId = req.params.id
    const { msgId } = req.params

    const removedId = await productService.removeProductMsg(productId, msgId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove product msg', err)
    res.status(500).send({ err: 'Failed to remove product msg' })
  }
}
