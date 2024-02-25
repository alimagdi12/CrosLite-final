const Product = require('../models/product');
const Order = require('../models/order');

exports.getHome = (req,res,next)=>{
  Product.find()
    .then(products => {
      console.log(products);
      res.render('shop/home', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
}

exports.getSearch = (req, res, next) => {
  const search = req.session.search || [];
  res.render('shop/search', {
      pageTitle: 'search',
      search: search,
  });
};


exports.postSearch=async (req,res,next)=>{
  const search= req.body.search;
  if(!search){
    return res.redirect('/search')
  }
  const newSearch = await Product.find({ title: { "$regex": search, "$options": "i" } })
  .then(data=>{
    console.log('Data from DB', data);
    req.session.search = data;
  })
  .catch(err=>{
    console.log(err);
  })
  res.redirect('/search');
  
}


exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      // console.log(products);
      res.render('shop/shop', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/shop-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      console.log('this is cart',products);
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};

// exports.getOrders = (req, res, next) => {
//   Order.find({ 'user.userId': req.user._id })
//     .then(orders => {
//       res.render('shop/orders', {
//         path: '/orders',
//         pageTitle: 'Your Orders',
//         orders: orders
//       });
//     })
//     .catch(err => console.log(err));
// };


exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      const ordersWithTotalPrice = orders.map(order => {
        const total = order.products.reduce((acc, product) => {
          return acc + (product.quantity * product.product.price);
        }, 0);
        return { ...order.toObject(), totalPrice: total };
      });
      console.log(ordersWithTotalPrice);
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: ordersWithTotalPrice
      });
    })
    .catch(err => console.log(err));
};


