module.exports = (app) => {
    const dropbox = require('../controllers/Dropboxes.js');
    let middleware = require('../middleware.js')
    // Create a new Dropbox
    app.post('/dropboxes', middleware.checkToken, dropbox.create);

    // Retrieve all Dropboxes
    app.get('/dropboxes', middleware.checkToken, dropbox.findAll);

    // Retrieve a single Dropbox with dropboxId
    app.get('/dropboxes/:dropboxId', middleware.checkToken, dropbox.findOne);

    // Delete a Dropbox with dropboxId
    app.delete('/dropboxes/:dropboxId', middleware.checkToken, dropbox.delete);
}