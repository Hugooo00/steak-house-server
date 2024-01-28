const express = require('express');
const menuController = require('../controller/menuController');

const router = express.Router();

router.route('/menu-stats').get(menuController.getMenuStats);
router
  .route('/top3-popular-steak')
  .get(menuController.aliasTopSteak, menuController.getAllMenu);
router
  .route('/')
  .get(menuController.getAllMenu)
  .post(menuController.createMenu);
router
  .route('/:id')
  .get(menuController.getMenuItem)
  .patch(menuController.updateMenu)
  .delete(menuController.deleteMenu);

module.exports = router;
