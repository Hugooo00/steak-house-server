const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgetPassword', authController.forgetPasswordAndSendEmail);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.routeProtect);

router.get('/me', userController.getCurrentUser, userController.getOneUser);
router.patch('/updatePassword', authController.updatePassword);
router.patch('/updateUserData', userController.updateUserData);
router.delete('/setAccountActiveState', userController.setAccountActiveState);

// Only admin has permission after this middleware
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
