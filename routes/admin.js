const express = require('express');
const router =  express.Router();
const adminController = require('../controller/admin');

router.use(express.static("public"));

router.get('/admin',adminController.getAdminDashboard);

router.get('/users',adminController.getusers);

router.delete('/users/:userID',adminController.deleteUser);

module.exports = router;