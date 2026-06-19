const express = require('express');
const router = express.Router();
const Review = require('../../models/Review');

router.get('/', async (req, res, next) => {
    try {
        const reviews = await Review.findAll();
        res.json(reviews);
    } catch (error) {
        next(error);
    }
});

module.exports = router;