const app = require('./app');
const { PORT = 5000 } = process.env;

app.listen(PORT, () => {
    console.log(`Server is running smoothly on port: ${PORT}`);
});