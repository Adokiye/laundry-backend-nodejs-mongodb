module.exports = (app) => {
    const notification = require('../controllers/Notifications.js');

    // Create a new Note
    app.post('/notifications', notification.create);

    // Retrieve all Notes
    app.get('/notifications/:userId', notification.findAll);

    // Retrieve a single Note with noteId
    app.get('/notifications/:notificationId', notification.findOne);

    // Update a Note with noteId
    app.put('/notifications/:notificationId', notification.update);

    // Delete a Note with noteId
    app.delete('/notifications/:notificationId', notification.delete);
}