const mongoose = require('mongoose');

const Item = require('../models/item');

module.exports = {};

module.exports.create = async (name) => {
    const item = await Item.create({ name });
    return item;
}

module.exports.getAll = async () => {
    const items = await Item.find().lean();
    return items;
}

module.exports.getById = async (itemId) => {
    const item = await Item.findOne({ _id: itemId }).lean();
    return item;
}
