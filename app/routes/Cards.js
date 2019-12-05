module.exports = (app) => {
    const cards = require('../controllers/Cards.js');

    // Create a new card
    app.post('/cards', cards.create);

    // Retrieve all cards
    app.get('/cards/:userId', cards.findAll);

    // Retrieve a single card with cardId
    app.get('/cards/:cardId', cards.findOne);

    // Delete a card with cardId
    app.delete('/cards/:cardId', cards.delete);
}