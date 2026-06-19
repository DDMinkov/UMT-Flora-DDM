const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');
const bouquetsRouter = require('./routes/api/bouquetsRouter');
const reviewsRouter = require('./routes/api/reviewsRouter');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/photos', express.static(path.join(__dirname, 'public/photos')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/bouquets', bouquetsRouter);
app.use('/api/reviews', reviewsRouter);

app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

app.use((err, req, res, next) => {
    const { status = 500, message = "Internal Server Error" } = err;
    res.status(status).json({ message });
});

module.exports = app;