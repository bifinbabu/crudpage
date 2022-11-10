const express = require('express')
const router = express.Router()
const Product = require('../models/product')
const Category = require('../models/category')

let limit = 5
router.get('/', paginatedResults(Product, limit), async (req, res) => {
    let products
    try {
        let products = res.paginatedResults
        var page = req.params.page || 1
        let count = await Product.countDocuments().exec()
        let pages = Math.ceil(count / limit) // 3 is limit
        res.render('index', {
            products: products.results,
            pages: pages,
            current: page
        })
    } catch {
        products = []
        res.render('index', {products: products})
    }
})

function paginatedResults(model, lim) {
    return async (req, res, next) => {
        const page = parseInt(req.query.page)
        const limit = lim

        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        const results = {}

        if (endIndex < await model.countDocuments().exec()) {
            results.next = {
                page: page + 1,
                limit: limit
            }
        }
        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit
            }
        }
        try {
            results.results = await model.find().populate('category').limit(limit).skip(startIndex).exec()
            res.paginatedResults = results
            next()
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}

module.exports = router