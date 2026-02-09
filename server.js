const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandlers');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

app.get('/', (req, res) => {
	res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/health', (req, res) => {
	res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reviews', reviewRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
	try {
		await connectDB();
		const server = app.listen(PORT, () => {
			console.log(`🚀 Server ready at http://localhost:${PORT}`);
			console.log(`� Auth API: http://localhost:${PORT}/api/auth`);
			console.log(`�📚 Books API: http://localhost:${PORT}/api/books`);
			console.log(`⭐ Reviews API: http://localhost:${PORT}/api/reviews`);
		});

		const shutdown = () => {
			console.log('Shutting down gracefully...');
			server.close(() => {
				process.exit(0);
			});
		};

		process.on('SIGINT', shutdown);
		process.on('SIGTERM', shutdown);
	} catch (error) {
		console.error('Failed to start server:', error.message);
		process.exit(1);
	}
};

startServer();
