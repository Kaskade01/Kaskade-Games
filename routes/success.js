const paypal = require("paypal-rest-sdk")
const config = require("../config")
const Cart = require("../cart")

exports.success = (request, response) => {
    var payerID = request.query.PayerID;
    var paymentId = request.query.paymentId;
    var cart = new Cart(request.session.cart);
    var execute_payment_json = {
        "payer_id": payerID,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": cart.totalPrice
            }
        }]
    }

    paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
        if(error){
            throw error;
        } else {
            // response.render('success', { title: config.TITLE + " - Payment Successful", msg: JSON.stringify(payment)})
            // var cart = new Cart(request.session.cart);
            var cartProducts = cart.generateArray();
            var data = [];

            cartProducts.forEach(function(product){ data.push({id:product.item.sku, inv:(parseInt(product.item.inventory) - parseInt(product.qty))}) })

            data.forEach(function(product){
                var update = {"inventory": parseInt(product.inv)};
                var id = product.id;
                config.DB_PRODUCTS.findAndModify( {query: {sku: id}, update: {$set:update}} , function(err, doc){
                    if(err) throw err;
                    console.log("UPDATE MADE...: " + product.id)
                    request.session.cart = undefined
                    response.render('success', { title: config.TITLE + " - Payment Successful", msg: JSON.stringify(payment)})
                })
            })
        }
    })

}