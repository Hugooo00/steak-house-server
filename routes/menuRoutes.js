const express = require('express');
const menuController = require('../controller/menuController');
const authController = require('../controller/authController');

const router = express.Router();

router.route('/menu-stats').get(menuController.getMenuStats);
router
  .route('/top3-popular-steak')
  .get(menuController.aliasTopSteak, menuController.getAllMenu);
router
  .route('/')
  .get(menuController.getAllMenu)
  .post(authController.routeProtect, menuController.createMenu);
router
  .route('/:id')
  .get(menuController.getMenuItem)
  .patch(menuController.updateMenu)
  .delete(menuController.deleteMenu);

module.exports = router;
