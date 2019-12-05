module.exports = (app) => {
    const cards = require('../controllers/Cards.js');
    let middleware = require('../middleware.js')
    // Create a new card
    app.post('/cards', middleware.checkToken, cards.create);

    // Retrieve all cards
    app.get('/cards/:userId', middleware.checkToken, cards.findAll);

    // Retrieve a single card with cardId
    app.get('/cards/:cardId', middleware.checkToken, cards.findOne);

    // Delete a card with cardId
    app.delete('/cards/:cardId', middleware.checkToken, cards.delete);
}