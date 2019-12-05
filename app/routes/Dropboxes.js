module.exports = (app) => {
    const dropbox = require('../controllers/Dropboxes.js');
    let middleware = require('../middleware.js')
    // Create a new Note
    app.post('/dropboxes', middleware.checkToken, dropbox.create);

    // Retrieve all Notes
    app.get('/dropboxes', middleware.checkToken, dropbox.findAll);

    // Retrieve a single Note with noteId
    app.get('/dropboxes/:dropboxId', middleware.checkToken, dropbox.findOne);

    // Update a Note with noteId
    app.put('/dropboxes/:dropboxId', middleware.checkToken, dropbox.update);

    // Delete a Note with noteId
    app.delete('/dropboxes/:dropboxId', middleware.checkToken, dropbox.delete);
}