const Book = require('../models/Book');
const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all books (with optional search & filter)
// @route   GET /api/books?search=keyword&genre=Fiction&sort=rating
// @access  Public
exports.getAllBooks = asyncHandler(async (req, res) => {
  const { search, genre, sort } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } }
    ];
  }

  if (genre) {
    filter.genre = { $regex: `^${genre}$`, $options: 'i' };
  }

  let query = Book.find(filter);

  // Sorting
  if (sort === 'rating') {
    query = query.sort({ averageRating: -1, createdAt: -1 });
  } else if (sort === 'year') {
    query = query.sort({ year: -1 });
  } else if (sort === 'title') {
    query = query.sort({ title: 1 });
  } else {
    query = query.sort({ createdAt: -1 });
  }

  const books = await query;
  res.json({ success: true, count: books.length, data: books });
});

// @desc    Get single book by ID (with reviews)
// @route   GET /api/books/:id
// @access  Public
exports.getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return res.status(404).json({ success: false, message: 'Book not found' });
  }

  res.json({ success: true, data: book });
});

// @desc    Create new book
// @route   POST /api/books
// @access  Private/Admin
exports.createBook = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user._id;
  const book = await Book.create(req.body);
  res.status(201).json({ success: true, data: book });
});

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private/Admin
exports.updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!book) {
    return res.status(404).json({ success: false, message: 'Book not found' });
  }

  res.json({ success: true, data: book });
});

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private/Admin
exports.deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);

  if (!book) {
    return res.status(404).json({ success: false, message: 'Book not found' });
  }

  // Delete all reviews associated with this book
  await Review.deleteMany({ book: book._id });

  res.json({ success: true, message: 'Book and related reviews deleted' });
});

// @desc    Get reviews for a book
// @route   GET /api/books/:id/reviews
// @access  Public
exports.getBookReviews = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ success: false, message: 'Book not found' });
  }

  const reviews = await Review.find({ book: req.params.id })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: reviews.length, data: reviews });
});
