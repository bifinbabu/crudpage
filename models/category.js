const mongoose = require('mongoose')
const Product = require('./product')

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

categorySchema.pre('remove', function(next) {
    Product.find({ category: this._id }, (err, products) => {
        if (err) {
            next(err)
        } else if (products.length > 0) {
            next(new Error('This category has still products under it'))
        } else {
            next()
        }
    })
})

module.exports = mongoose.model('Category', categorySchema)