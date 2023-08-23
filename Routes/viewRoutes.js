const express = require('express');
const viewsController = require('./../Controller/viewsController');
const authController = require('./../Controller/authController');

const router = express.Router();

router.get('/', 
// authController.isLoggedIn,
 viewsController.getOverview);
router.get('/tour/:slug',
//  authController.isLoggedIn,
 viewsController.getTour);
router.get('/login',
//  authController.isLoggedIn, 
viewsController.getLoginForm);
// router.get('/me', authController.Protect, viewsController.getAccount);

router.post(
  '/submit-user-data',
  authController.Protect,
  viewsController.updateUserData
);

module.exports = router;
