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
    const collection = await dbService.getCollection('toy')
    //sort({price:1}) from low to high
    //sort({name:1}) from a to z //sort({key:order})
    console.log('sortBy', sortBy)

    const toys = await collection.find(criteria).sort(sortBy).toArray()
    // console.log('toys', toys)
    return toys
  } catch (err) {
    logger.error('cannot find toys', err)
    throw err
  }
}

async function getById(toyId) {
  try {
    const collection = await dbService.getCollection('toy')
    const toy = collection.findOne({ _id: new ObjectId(toyId) })
    return toy
  } catch (err) {
    logger.error(`while finding toy ${toyId}`, err)
    throw err
  }
}

async function remove(toyId) {
  try {
    const collection = await dbService.getCollection('toy')
    await collection.deleteOne({ _id: new ObjectId(toyId) })
  } catch (err) {
    logger.error(`cannot remove toy ${toyId}`, err)
    throw err
  }
}

async function add(toy) {
  try {
    const collection = await dbService.getCollection('toy')
    const { insertedId } = await collection.insertOne(toy)
    toy._id = insertedId
    return toy
  } catch (err) {
    logger.error('cannot insert toy', err)
    throw err
  }
}

async function update(toy) {
  try {
    const toyToSave = {
      name: toy.name,
      price: toy.price,
      labels: toy.labels,
      inStock: toy.inStock,
    }
    const collection = await dbService.getCollection('toy')
    await collection.updateOne(
      { _id: new ObjectId(toy._id) },
      { $set: toyToSave }
    )
    return toy
  } catch (err) {
    logger.error(`cannot update toy ${toy._id}`, err)
    throw err
  }
}

async function addToyMsg(toyId, msg) {
  try {
    console.log('process.env.SECRET1 from toyMsg', process.env.SECRET1)

    msg.id = utilService.makeId()
    const collection = await dbService.getCollection('toy')
    await collection.updateOne(
      { _id: new ObjectId(toyId) },
      { $push: { msgs: msg } }
    )
    return msg
  } catch (err) {
    logger.error(`cannot add toy msg ${toyId}`, err)
    throw err
  }
}

async function removeToyMsg(toyId, msgId) {
  try {
    const collection = await dbService.getCollection('toy')
    await collection.updateOne(
      { _id: new ObjectId(toyId) },
      { $pull: { msgs: { id: msgId } } }
    )
    return msgId
  } catch (err) {
    logger.error(`cannot remove toy msg ${toyId}`, err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const { labels, txt, status } = filterBy

  const criteria = {}

  if (txt) {
    criteria.name = { $regex: txt, $options: 'i' }
  }

  if (labels && labels.length) {
    //every for objects labels
    // const labelsCrit = labels.map(label => ({
    //   labels: { $elemMatch: { title: label } },
    // }))

    //every for string labels
    // const labelsCrit = labels.map((label) => ({
    // 	labels: label,
    // }))
    // criteria.$and = labelsCrit
    // criteria.labels =  { $all: labels }

    // for some for string labels
    console.log('labels', labels)
    criteria.labels = { $in: labels } //['Doll']
  }

  if (status) {
    criteria.inStock = JSON.parse(status)  // ? true : false
  }
  console.log('criteria', criteria)

  return criteria
}

export const toyService = {
  remove,
  query,
  getById,
  add,
  update,
  addToyMsg,
  removeToyMsg,
}
