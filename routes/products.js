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