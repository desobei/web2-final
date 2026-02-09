const express = require('express');
const { body, validationResult } = require('express-validator');
const bookController = require('../controllers/bookController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

const bookValidators = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('genre').trim().notEmpty().withMessage('Genre is required'),
  body('year').optional().isInt({ min: 0 }).withMessage('Year must be a positive number'),
  body('pages').optional().isInt({ min: 1 }).withMessage('Pages must be 1 or greater'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description too long')
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
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);
router.get('/:id/reviews', bookController.getBookReviews);

// Protected routes (POST, PUT, DELETE) - Admin only
router.post('/', protect, admin, bookValidators, handleValidation, bookController.createBook);
router.put('/:id', protect, admin, bookValidators, handleValidation, bookController.updateBook);
router.delete('/:id', protect, admin, bookController.deleteBook);

module.exports = router;
