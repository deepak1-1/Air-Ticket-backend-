const express  = require('express');
const router = express.Router()
const adminController = require('../controllers/adminController');


router.get('/check-admin', adminController.checkAdmin);

router.get('/count-today', adminController.getTodayCount);

router.post('/add-admin', adminController.addAdmin);

router.post('/add-flight-route', adminController.addRoute);

router.get('/get-destinations', adminController.getDestinations);

router.post('/my-data', adminController.getMyData);

router.post('/schedule-flight', adminController.scheduleFlight);

router.get('/get-route-data', adminController.getRouteData);

router.post('/update-password', adminController.updatePassword);

router.get('/get-flight-routes', adminController.getFlightRoutes);

router.post('/update-flight-route', adminController.UpdateFlightRoute);

router.post('/delete-flight-route', adminController.DeleteFlightRoute);

module.exports = router;