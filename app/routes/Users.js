module.exports = (app) => {
    const user = require('../controllers/Users.js');

    // Create a new Note
    app.post('/users', user.create);
    
    app.post('/login', user.login)

    // Retrieve all Notes
    app.get('/users', user.findAll);

    // Retrieve a single Note with noteId
    app.get('/users/:userId', user.findOne);

    // Update a Note with noteId
    app.put('/users/:userId', user.update);

    // Delete a Note with noteId
    app.delete('/users/:userId', user.delete);
}