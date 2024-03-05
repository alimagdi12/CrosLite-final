const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getHome);

router.get('/search', shopController.getSearch);

router.post('/search',shopController.postSearch)

router.get('/products', shopController.getProducts);

router.get('/contact', shopController.getContact);

router.post('/contact', shopController.postContact);

router.get('/about', shopController.getAbout);

router.post('/footerSearch',shopController.postFooterSearch)

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.post('/create-order', isAuth, shopController.postOrder);

router.get('/orders', isAuth, shopController.getOrders);

// router.post('/payement', isAuth, shopController.postPayement);

router.get('/profile',isAuth,shopController.getProfile);

router.post('/updateUser',isAuth,shopController.postUpdateUser);

module.exports = router;
