    const express = require('express');
    const {signup, login, logout} = require('../controllers/auth.controller')
    const multer = require('../middlewares/multer')

    const router = express.Router();

    // Signup api - POST /signup - create a new user
    router.post("/signup", multer.single('photo'), signup);

    // Login api - POST /login - login a user
    router.post("/login", login);

    // Logout api - POST /logout - logout a user
    router.post("/logout", logout);

    module.exports = router;