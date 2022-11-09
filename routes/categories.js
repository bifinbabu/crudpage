const express = require('express')
const Category = require('../models/category')
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
router.get('/new', (req, res) =>{
    res.render('categories/new', { category: new Category() })
})

// Create Category route
router.post('/', async (req, res) =>{
    const category = new Category({
        name: req.body.name
    })
    try {
        const newCategory = await category.save()
        // res.redirect(`categories/${newCategory.id}`)
        res.redirect('categories')
    } catch {
        res.render('categories/new', { 
            category: category,
            errorMessage: 'Error creating category'
        })
    }
})

module.exports = router