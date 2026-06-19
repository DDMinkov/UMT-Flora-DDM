const fs = require('fs');
const path = require('path');
const sequelize = require('./config/database');

const Bouquet = require('./models/Bouquet') || require('./models/bouquet') || require('./src/models/Bouquet');
const Review = require('./models/Review') || require('./models/review') || require('./src/models/Review');

const seedDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection successful. Preparing to seed...');

        // Force sync creates/updates tables to ensure reviews exists
        await sequelize.sync();

        const dbJsonPath = path.join(__dirname, 'db.json');
        const rawData = fs.readFileSync(dbJsonPath, 'utf-8');
        const database = JSON.parse(rawData);

        // --- 1. SEED BOUQUETS ---
        const bouquetsToInsert = database.bouquets || [];
        if (bouquetsToInsert.length > 0) {
            const cleanBouquets = bouquetsToInsert.map(item => {
                const { id, image, ...rest } = item; 
                return { ...rest, photoURL: image };
            });
            console.log(`Inserting ${cleanBouquets.length} bouquets...`);
            await Bouquet.bulkCreate(cleanBouquets);
        }

        // --- 2. SEED REVIEWS ---
        const reviewsToInsert = database.reviews || [];
        if (reviewsToInsert.length > 0) {
            const cleanReviews = reviewsToInsert.map(item => {
                const { id, ...rest } = item; // Stripe hardcoded string IDs so database generates serial IDs
                return rest;
            });
            console.log(`Inserting ${cleanReviews.length} reviews...`);
            await Review.bulkCreate(cleanReviews);
        }

        console.log('Database successfully populated with bouquets AND reviews!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error.message);
        process.exit(1);
    }
};

seedDatabase();