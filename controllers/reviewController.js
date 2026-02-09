const Review = require('../models/Review');
const Book = require('../models/Book');
const asyncHandler = require('../utils/asyncHandler');

// Helper: recalculate average rating for a book
const updateBookRating = async (bookId) => {
  const stats = await Review.aggregate([
    { $match: { book: bookId } },
    {
      $group: {
        _id: '$book',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Book.findByIdAndUpdate(bookId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount
    });
  } else {
    await Book.findByIdAndUpdate(bookId, {
      averageRating: 0,
      reviewCount: 0
    });
  }
};

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
exports.getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate('book', 'title author')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: reviews.length, data: reviews });
});

// @desc    Get single review by ID
// @route   GET /api/reviews/:id
// @access  Public
exports.getReviewById = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate('book', 'title author')
    .populate('user', 'name email');

  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  res.json({ success: true, data: review });
});

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private (any authenticated user)
exports.createReview = asyncHandler(async (req, res) => {
  const { book, rating, comment } = req.body;

  const bookExists = await Book.findById(book);
  if (!bookExists) {
    return res.status(404).json({ success: false, message: 'Book not found' });
  }

  // Check if user already reviewed this book
  const existing = await Review.findOne({ book, user: req.user._id });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this book'
    });
  }

  const review = await Review.create({
    book,
    user: req.user._id,
    rating,
    comment
  });

  await updateBookRating(review.book);

  const populated = await review.populate([
    { path: 'book', select: 'title author' },
    { path: 'user', select: 'name email' }
  ]);

  res.status(201).json({ success: true, data: populated });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (owner or admin)
exports.updateReview = asyncHandler(async (req, res) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  // Check ownership: only the review author or an admin can update
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this review'
    });
  }

  // Only allow updating rating and comment
  if (req.body.rating) review.rating = req.body.rating;
  if (req.body.comment !== undefined) review.comment = req.body.comment;

  await review.save();
  await updateBookRating(review.book);

  const populated = await review.populate([
    { path: 'book', select: 'title author' },
    { path: 'user', select: 'name email' }
  ]);

  res.json({ success: true, data: populated });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (owner or admin)
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  // Check ownership: only the review author or an admin can delete
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this review'
    });
  }

  const bookId = review.book;
  await Review.findByIdAndDelete(req.params.id);
  await updateBookRating(bookId);

  res.json({ success: true, message: 'Review deleted' });
});
