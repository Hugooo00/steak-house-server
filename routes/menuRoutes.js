const express = require('express');
const menuController = require('../controller/menuController');
const authController = require('../controller/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:menuId/reviews', reviewRouter);

router.route('/menu-stats').get(menuController.getMenuStats);

router
  .route('/top3-popular-steak')
  .get(menuController.aliasTopSteak, menuController.getAllMenu);

router
  .route('/')
  .get(menuController.getAllMenu)
  .post(
    authController.routeProtect,
    authController.restrictTo('admin', 'staff'),
    menuController.createMenu,
  );

router
  .route('/:id')
  .get(menuController.getMenuItem)
  .patch(
    authController.routeProtect,
    authController.restrictTo('admin', 'staff'),
    menuController.updateMenu,
  )
  .delete(
    authController.routeProtect,
    authController.restrictTo('admin'),
    menuController.deleteMenu,
  );

module.exports = router;
