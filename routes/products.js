const express = require('express')
const Category = require('../models/category')
const Product = require('../models/product')
const router = express.Router()

let limit = 5
// All Products Route
router.get('/', paginatedResults(Product, limit), async (req, res) => {
    try {
        let products = res.paginatedResults
        var page = req.params.page || 1
        let count = await Product.countDocuments().exec()
        let pages = Math.ceil(count / limit) // 3 is limit
        res.render('products/index', {
            products: products.results,
            pages: pages,
            current: page
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
        res.redirect(`/products/${newProduct.id}`)
    } catch {
        renderNewPage(res, product, true)
    }
})

// Show Product Route
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category').exec()
        res.render('products/show', { product: product })
    } catch {
        res.redirect('/')
    }
})

// Edit Product Route
router.get('/:id/edit', async (req, res) =>{
    try {
        const product = await Product.findById(req.params.id)
        renderEditPage(res, product)
    } catch {
        res.redirect('/')
    }
})

// Update Product Route
router.put('/:id', async (req, res) =>{
    let product
    try {
        product = await Product.findById(req.params.id)
        product.name = req.body.name,
        product.category = req.body.category
        await product.save()
        res.redirect(`/products/${product.id}`)
    } catch {
        if (product != null) {
            renderEditPage(res, product, true)
        } else {
            res.redirect('/')
        }
    }
})

// Delete Product Route
router.delete('/:id', async (req, res) => {
    let product
    try {
        product = await Product.findById(req.params.id)
        await product.remove()
        res.redirect('/products')
    } catch {
        if (product != null) {
            res.render('products/show', {
                product: product,
                errorMessage: 'Could not delete Product'
            })
        } else {
            res.redirect('/')
        }
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

async function renderNewPage(res, product, hasError = false) {
    renderFormPage(res, product, 'new', hasError)
}

async function renderEditPage(res, product, hasError = false) {
   renderFormPage(res, product, 'edit', hasError)
}

async function renderFormPage(res, product, form, hasError = false) {
    try {
        const categories = await Category.find({})
        const params =  {
            categories: categories,
            product: product
        }
        if (hasError) {
            if (form === 'edit'){
                params.errorMessage = 'Error Updating Product'
            } else {
                params.errorMessage = 'Error Creating Product'
            }
        }
        res.render(`products/${form}`, params)
    } catch {
        res.redirect('/products')
    }
}

module.exports = router