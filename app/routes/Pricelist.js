module.exports = (app) => {
    const pricelist = require('../controllers/Ppricelist.js');
    let middleware = require('../middleware.js')
    // Create a new pricelist
    app.post('/pricelist', middleware.checkToken, pricelist.create);

    // Retrieve all pricelist
    app.get('/pricelist', middleware.checkToken, pricelist.findAll);

    // Retrieve a single pricelist with pricelistId
    app.get('/pricelist/:pricelistId', middleware.checkToken, pricelist.findOne);

    // Delete a pricelist with pricelistId
    app.delete('/pricelist/:pricelistId', middleware.checkToken, pricelist.delete);
}