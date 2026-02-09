const express = require('express');
const { body, validationResult } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const reviewValidators = [
  body('book').notEmpty().withMessage('book is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 1000 }).withMessage('Comment too long')
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

// Public routes (GET)
router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReviewById);

// Protected routes - any authenticated user can create; ownership checked in controller
router.post('/', protect, reviewValidators, handleValidation, reviewController.createReview);
router.put('/:id', protect, reviewValidators, handleValidation, reviewController.updateReview);
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;
