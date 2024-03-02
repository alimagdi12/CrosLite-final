const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user')
const Stripe = require("stripe");
const stripe = Stripe('sk_test_51OmeLSKnxvTYYIlSbsJaeNY5XyiliPJfGg6vA9JQev5T442TXqnEBg2OdZcFZx4Gs5EKVbA7lQ0GO4RyAiM0qbvj005mnOklV9');

exports.getHome = (req,res,next)=>{
  Product.find()
    .then(products => {
      console.log(products);
      res.render('shop/home', {
        prods: products,
        pageTitle: 'Home',
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
      const totalPrice = products.reduce((total, p) => total + (p.productId.price * p.quantity), 0); // Calculate total price
      console.log(totalPrice);
      console.log('this is cart',products);
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
        totalPrice: totalPrice // Pass total price to the template
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
      const totalPrice = products.reduce((acc, product) => {
        return acc + (product.quantity * product.product.price);
      }, 0);
      
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products,
        totalPrice: totalPrice // Add total price to the order
      });

      return order.save()
        .then(() => {
          return req.user.clearCart();
        });
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
      res.render('shop/orders2', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: ordersWithTotalPrice
      });
    })
    .catch(err => console.log(err));
};


exports.postPayement=async (req, res) => {
  const { totalPrice } = req.body;

  const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
          {
              price_data: {
                  currency: 'usd',
                  product_data: {
                      name: 'Your Product Name',
                  },
                  unit_amount: totalPrice,
              },
              quantity: 1,
          },
      ],     
      mode:'payment',
      success_url: `${req.protocol}://${req.get('host')}/ckeckout-success?success=true`,
      cancel_url: `${req.protocol}://${req.get('host')}/cart?canceled=true`,

  });

  res.send({ url: session.url });};

exports.getProfile= (req,res,next)=>{
  user = req.user;
  // User.findById(user).then(data=>{
  //   console.log('this is user',data);
  // })
  console.log('this is user',user);
  res.render('shop/userProfile',{
    pageTitle:'profile ',
    fName:user.firstName,
    lName:user.lastName,
    birthDay:user.birthDay.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
    gender:user.gender,
    email:user.email,
    phone:user.phoneNumber

  })
}

exports.postUpdateUser = async (req, res) => {
  try {
    const { username, fname, lname, birthDay, gender, email, mobile } = req.body;
    const user = await User.findOneAndUpdate(
      { username }, // Assuming username is a unique identifier for the user
      { firstName: fname, lastName: lname, birthDay: new Date(birthDay), gender, email, phoneNumber: mobile },
      { new: true } // Return the updated document
    );
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error updating user data' });
  }
}