const express = require('express');
const meunController = require('../controller/menuController');

const router = express.Router();
// router.param('id', meunController.checkID);

router
  .route('/')
  .get(meunController.getAllMenu)
  .post(meunController.createMenu);
router
  .route('/:id')
  .get(meunController.getMenuItem)
  .patch(meunController.updateMenu)
  .delete(meunController.deleteMenu);

module.exports = router;
