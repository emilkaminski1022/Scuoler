const utils = require("../utils/Utils");
const constants = require("../Constants");

let { setCorsHeaders } = utils;

const stripe = require("stripe")(constants.STRIPE_TEST_SECRET_KEY);

/* function for stripe session checkout */
exports.stripeSessionCheckout = async (req, res, next) => {
  let productName = req.body.productName;
  let productDescription = req.body.productDescription;
  let productUrl = req.body.productUrl;
  let productPrice = req.body.productPrice;
  try {
    let product = await stripe.products.create({
      name: productName,
      description: productDescription,
      images: [productUrl],
    });
    //console.log(product);
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: productPrice * 100,
      currency: "usd",
    });
    //let referrer = req.headers.referrer || req.headers.referer;
    let url = "";
    if (req.headers["x-forwarded-host"]) {
      url = "https://" + req.headers["x-forwarded-host"];
    } else {
      url = "https://scuoler.com";
    }

    console.log(url);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: price.id, quantity: 1 }],
      mode: "payment",
      success_url: `${url}/donateSuccess?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${url}/`,
    });
    console.log(session);
    setCorsHeaders(req, res);
    res.json({ checkoutstatus: "ok", session: session.id });
  } catch (e) {
    res.json({ checkoutstatus: "error", message: e.toString() });
  }
};
