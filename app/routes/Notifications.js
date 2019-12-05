module.exports = (app) => {
    const notification = require('../controllers/Notifications.js');
    let middleware = require('../middleware.js')
    // Create a new Note
    app.post('/notifications', middleware.checkToken, notification.create);

    // Retrieve all Notes
    app.get('/notifications/:userId', middleware.checkToken, notification.findAll);

    // Retrieve a single Note with noteId
    app.get('/notifications/:notificationId', middleware.checkToken, notification.findOne);

    // Update a Note with noteId
    app.put('/notifications/:notificationId', middleware.checkToken, notification.update);

    // Delete a Note with noteId
    app.delete('/notifications/:notificationId', middleware.checkToken, notification.delete);
}