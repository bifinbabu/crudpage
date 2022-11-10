const express = require('express')
const Category = require('../models/category')
const Product = require('../models/product')
const router = express.Router()

let limit = 5
// All Categories Route
router.get('/', paginatedResults(Category, limit), async (req, res) => {
    try {
        const categories = res.paginatedResults
        var page = req.params.page || 1
        let count = await Category.countDocuments().exec()
        let pages = Math.ceil(count / limit) // 3 is limit
        res.render('categories/index', { 
            categories: categories.results, 
            pages: pages,
            current: page
        })
    } catch (err) {
        console.log(err);
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
            results.results = await model.find().limit(limit).skip(startIndex).exec()
            res.paginatedResults = results
            next()
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}

module.exports = router