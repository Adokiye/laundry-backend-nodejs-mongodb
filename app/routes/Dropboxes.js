module.exports = (app) => {
    const dropbox = require('../controllers/Dropboxes.js');
    let middleware = require('../middleware.js')
    // Create a new Dropbox
    app.post('/dropbox', middleware.checkToken, dropbox.create);

    // Retrieve all Dropboxes
    app.get('/dropbox', middleware.checkToken, dropbox.findAll);

    // Retrieve a single Dropbox with dropboxId
    app.get('/dropbox/:dropboxId', middleware.checkToken, dropbox.findOne);

    // Delete a Dropbox with dropboxId
    app.delete('/dropbox/:dropboxId', middleware.checkToken, dropbox.delete);
}