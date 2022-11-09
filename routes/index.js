const express = require('express')
const router = express.Router()
const Product = require('../models/product')
const Category = require('../models/category')

router.get('/', async (req, res) => {
    let products
    try {
        products = await Product.find({}).populate('category').exec()
    } catch {
        products = []
    }
    res.render('index', {products: products})
})

module.exports = router