const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('./models/Book');
const User = require('./models/User');
const Review = require('./models/Review');

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Create an admin user for createdBy
  let admin = await User.findOne({ email: 'admin@bookshelf.com' });
  if (!admin) {
    admin = await User.create({
      email: 'admin@bookshelf.com',
      password: 'admin123',
      role: 'admin',
      name: 'Admin'
    });
    console.log('Admin user created');
  }

  // Create a regular user for the review
  let user = await User.findOne({ email: 'reader@bookshelf.com' });
  if (!user) {
    user = await User.create({
      email: 'reader@bookshelf.com',
      password: 'reader123',
      role: 'user',
      name: 'Alex Reader'
    });
    console.log('Regular user created');
  }

  const books = [
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      genre: 'Fiction',
      year: 1960,
      pages: 281,
      description: 'A novel about racial injustice in the Deep South, seen through the eyes of a young girl.',
      createdBy: admin._id
    },
    {
      title: '1984',
      author: 'George Orwell',
      genre: 'Dystopian',
      year: 1949,
      pages: 328,
      description: 'A dystopian novel set in a totalitarian society ruled by Big Brother.',
      createdBy: admin._id
    },
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      genre: 'Fiction',
      year: 1925,
      pages: 180,
      description: 'A story of wealth, love, and the American Dream in the Jazz Age.',
      createdBy: admin._id
    },
    {
      title: 'Dune',
      author: 'Frank Herbert',
      genre: 'Science Fiction',
      year: 1965,
      pages: 412,
      description: 'An epic science fiction novel set on the desert planet Arrakis.',
      createdBy: admin._id
    },
    {
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      genre: 'Fantasy',
      year: 1937,
      pages: 310,
      description: 'A fantasy adventure following Bilbo Baggins on an unexpected journey.',
      createdBy: admin._id
    },
    {
      title: 'Brave New World',
      author: 'Aldous Huxley',
      genre: 'Dystopian',
      year: 1932,
      pages: 288,
      description: 'A futuristic society where humans are genetically modified and socially conditioned.',
      createdBy: admin._id
    },
    {
      title: 'The Catcher in the Rye',
      author: 'J.D. Salinger',
      genre: 'Fiction',
      year: 1951,
      pages: 234,
      description: 'A teenager navigates alienation and loss in New York City.',
      createdBy: admin._id
    },
    {
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      genre: 'Non-Fiction',
      year: 2011,
      pages: 443,
      description: 'A brief history of humankind from the Stone Age to the present.',
      createdBy: admin._id
    },
    {
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      genre: 'Fiction',
      year: 1988,
      pages: 197,
      description: 'A shepherd boy travels from Spain to Egypt in search of treasure and self-discovery.',
      createdBy: admin._id
    },
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      genre: 'Technology',
      year: 2008,
      pages: 464,
      description: 'A handbook of agile software craftsmanship and writing better code.',
      createdBy: admin._id
    }
  ];

  // Clear existing data
  await Book.deleteMany({});
  await Review.deleteMany({});
  console.log('Cleared existing books and reviews');

  // Insert books
  const insertedBooks = await Book.insertMany(books);
  console.log(`Inserted ${insertedBooks.length} books`);

  // Add a review to the first book
  const review = await Review.create({
    book: insertedBooks[0]._id,
    user: user._id,
    rating: 5,
    comment: 'An absolute masterpiece. The way Harper Lee captures the innocence of childhood while tackling serious social issues is remarkable. A must-read for everyone.'
  });

  // Update book's average rating and review count
  await Book.findByIdAndUpdate(insertedBooks[0]._id, {
    averageRating: 5,
    reviewCount: 1
  });

  console.log('Added review to "To Kill a Mockingbird"');
  console.log('Seed complete!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
