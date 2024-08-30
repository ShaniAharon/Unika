import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'
import mongodb from 'mongodb'
const { ObjectId } = mongodb


async function query(filterBy, sortBy) {
  try {
    console.log('filterBy', filterBy)
    const criteria = _buildCriteria(filterBy)
    console.log(criteria)
    const collection = await dbService.getCollection('product')
    //sort({price:1}) from low to high
    //sort({name:1}) from a to z //sort({key:order})
    console.log('sortBy', sortBy)

    const products = await collection.find(criteria).sort(sortBy).toArray()
    // console.log('products', products)
    return products
  } catch (err) {
    logger.error('cannot find products', err)
    throw err
  }
}

async function getById(productId) {
  try {
    const collection = await dbService.getCollection('product')
    const product = collection.findOne({ _id: new ObjectId(productId) })
    return product
  } catch (err) {
    logger.error(`while finding product ${productId}`, err)
    throw err
  }
}

async function remove(productId) {
  try {
    const collection = await dbService.getCollection('product')
    await collection.deleteOne({ _id: new ObjectId(productId) })
  } catch (err) {
    logger.error(`cannot remove product ${productId}`, err)
    throw err
  }
}

async function add(product) {
  try {
    const collection = await dbService.getCollection('product')
    const { insertedId } = await collection.insertOne(product)
    product._id = insertedId
    return product
  } catch (err) {
    logger.error('cannot insert product', err)
    throw err
  }
}

async function update(product) {
  try {
    //maybe add category
    const productToSave = {
      name: product.name,
      price: product.price,
      category: product.category,
      inStock: product.inStock,
      img: product.img,
      description: product.description
    }
    const collection = await dbService.getCollection('product')
    await collection.updateOne(
      { _id: new ObjectId(product._id) },
      { $set: productToSave }
    )
    return product
  } catch (err) {
    logger.error(`cannot update product ${product._id}`, err)
    throw err
  }
}

async function addProductMsg(productId, msg) {
  try {
    console.log('process.env.SECRET1 from productMsg', process.env.SECRET1)

    msg.id = utilService.makeId()
    const collection = await dbService.getCollection('product')
    await collection.updateOne(
      { _id: new ObjectId(productId) },
      { $push: { msgs: msg } }
    )
    return msg
  } catch (err) {
    logger.error(`cannot add product msg ${productId}`, err)
    throw err
  }
}

async function removeProductMsg(productId, msgId) {
  try {
    const collection = await dbService.getCollection('product')
    await collection.updateOne(
      { _id: new ObjectId(productId) },
      { $pull: { msgs: { id: msgId } } }
    )
    return msgId
  } catch (err) {
    logger.error(`cannot remove product msg ${productId}`, err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const { category, txt, status } = filterBy

  const criteria = {}

  if (txt) {
    criteria.name = { $regex: txt, $options: 'i' }
  }

  if (category) {
    criteria.category = category;
  }

  // if (labels && labels.length) {
  //   //every for objects labels
  //   // const labelsCrit = labels.map(label => ({
  //   //   labels: { $elemMatch: { title: label } },
  //   // }))

  //   //every for string labels
  //   // const labelsCrit = labels.map((label) => ({
  //   // 	labels: label,
  //   // }))
  //   // criteria.$and = labelsCrit
  //   // criteria.labels =  { $all: labels }

  //   // for some for string labels
  //   console.log('labels', labels)
  //   criteria.labels = { $in: labels } //['Doll']
  // }

  if (status) {
    criteria.inStock = JSON.parse(status)  // ? true : false
  }
  console.log('criteria', criteria)

  return criteria
}

export const productService = {
  remove,
  query,
  getById,
  add,
  update,
  addProductMsg,
  removeProductMsg,
}
