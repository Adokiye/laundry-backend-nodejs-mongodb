module.exports = (app) => {
    const dropbox = require('../controllers/Dropboxes.js');

    // Create a new Note
    app.post('/dropboxes', dropbox.create);

    // Retrieve all Notes
    app.get('/dropboxes', dropbox.findAll);

    // Retrieve a single Note with noteId
    app.get('/dropboxes/:dropboxId', dropbox.findOne);

    // Update a Note with noteId
    app.put('/dropboxes/:dropboxId', dropbox.update);

    // Delete a Note with noteId
    app.delete('/dropboxes/:dropboxId', dropbox.delete);
}