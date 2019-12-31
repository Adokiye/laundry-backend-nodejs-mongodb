
module.exports = (app) => {
    const user = require('../controllers/Users.js');
    let middleware = require('../middleware.js')
    // Create a new Note
    app.post('/users', user.create);
    
    app.post('/login', user.login)

    app.post('/login_admin', user.login)

    // Retrieve all Notes
    app.get('/users', middleware.checkToken, user.findAll);

    // Retrieve all Notes
    app.get('/admins', middleware.checkToken, user.findAllAdmins);

    // Retrieve a single Note with noteId
    app.get('/users/:userId', middleware.checkToken, user.findOne);

    /*// Update a Note with noteId
    app.put('/users/:userId', middleware.checkToken, user.update);  */

    // Delete a Note with noteId
    app.delete('/users/:userId', middleware.checkToken, user.delete);
}