const express  = require('express');
const router = express.Router()
const adminController = require('../controllers/adminController');


router.get('/admin-page', adminController.getAdminPage);

router.get('/count-today', adminController.getFlightAndBookingCount);

router.get('/admin-count', adminController.getAdminCount);

router.post('/add-admin', adminController.addAdmin);

router.post('/add-route', adminController.addRoute);

router.get('/get-destinations', adminController.getPlaces);

router.post('/my-data', adminController.getMyData);

router.post('/schedule-flight', adminController.scheduleFlight);

router.get('/get-route-data', adminController.getRouteData);

module.exports = router;