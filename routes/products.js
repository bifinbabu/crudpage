const express = require('express')
const Category = require('../models/category')
const Product = require('../models/product')
const router = express.Router()

// All Products Route
router.get('/', async (req, res) => {
    try {
        // const categories = await Category.find({})
        const products = await Product.find({}).populate('category').exec()
        res.render('products/index', {
            products: products,
            // categories: categories
        })
    } catch {
        res.redirect('/')
    }
})

// New Product Route
router.get('/new', async (req, res) =>{
    renderNewPage(res, new Product())
})

// Create Product Route
router.post('/', async (req, res) =>{
    const product = new Product({
        name: req.body.name,
        category: req.body.category
    })
    try {
        const newProduct = await product.save()
        // res.redirect(`/products/${newProduct.id}`)
        res.redirect('/products')
    } catch {
        renderNewPage(res, product, true)
    }
})

async function renderNewPage(res, product, hasError = false) {
    try {
        const categories = await Category.find({})
        const params =  {
            categories: categories,
            product: product
        }
        if (hasError) {
            params.errorMessage = 'Error Creating Product'
        }
        res.render('products/new', params)
    } catch {
        res.redirect('/products')
    }
}

module.exports = router