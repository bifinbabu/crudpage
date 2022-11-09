const express = require('express')
const Category = require('../models/category')
const Product = require('../models/product')
const router = express.Router()

// All Categories Route
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({})
        res.render('categories/index', { categories: categories })
    } catch {
        res.redirect('/')
    }
})

// New Category Route
router.get('/new', async (req, res) =>{
    res.render('categories/new', { category: new Category() })
})

// Create Category Route
router.post('/', async (req, res) =>{
    const category = new Category({
        name: req.body.name
    })
    try {
        const newCategory = await category.save()
        res.redirect(`/categories/${newCategory.id}`)
    } catch {
        res.render('categories/new', { 
            category: category,
            errorMessage: 'Error creating category'
        })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
        const products = await Product.find({ category: category.id }).exec() 
        res.render('categories/show', {
            category: category,
            productsUnderCategory: products
        })
    } catch {
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
        res.render('categories/edit', { category: category })
    } catch {
        res.redirect('/categories')
    }
})

router.put('/:id', async (req, res) => {
    let category
    try {
        category = await Category.findById(req.params.id)
        category.name = req.body.name
        await category.save()
        res.redirect(`/categories/${category.id}`)
    } catch {
        if (category == null) {
            res.redirect('/')
        } else {
            res.render('categories/edit', { 
                category: category,
                errorMessage: 'Error updating category'
            })
        }
    }
})

router.delete('/:id', async (req, res) => {
    let category
    try {
        category = await Category.findById(req.params.id)
        await category.remove()
        res.redirect('/categories')
    } catch {
        if (category == null) {
            res.redirect('/')
        } else {
            res.redirect(`/categories/${category.id}`)
        }
    }
})

module.exports = router