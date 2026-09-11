const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
require("dotenv").config();

const app = express();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const PORT = process.env.PORT || 4242;


// =========================
// MIDDLEWARE
// =========================

app.use(cors({
    origin: "*"
}));

app.use(express.json());


// =========================
// PRODUCTS
// =========================

const PRODUCTS = {

    product1: {
        name: "Black Essentials Sweatpant",
        price: 6899
    },

    product2: {
        name: "Grey Essentials Sweatpant",
        price: 6899
    },

    product3: {
        name: "Coral Essentials Sweatpant",
        price: 6899
    }

};


// =========================
// CREATE CHECKOUT SESSION
// =========================

app.post("/create-checkout-session", async (req, res) => {

    try {

        const { cart } = req.body;


        // Check cart
        if (!Array.isArray(cart) || cart.length === 0) {

            return res.status(400).json({
                error: "Your cart is empty."
            });

        }


        const lineItems = [];


        // Build Stripe products
        for (const item of cart) {

            const product = PRODUCTS[item.id];


            if (!product) {

                return res.status(400).json({
                    error: "Invalid product: " + item.id
                });

            }


            const quantity = Number(item.quantity);


            if (
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > 20
            ) {

                return res.status(400).json({
                    error: "Invalid quantity."
                });

            }


            lineItems.push({

                price_data: {

                    currency: "usd",

                    product_data: {
                        name: product.name
                    },

                    unit_amount: product.price

                },

                quantity: quantity

            });

        }


        // Create Stripe Checkout
        const session =
            await stripe.checkout.sessions.create({

                mode: "payment",

                line_items: lineItems,

                billing_address_collection: "required",

                shipping_address_collection: {

                    allowed_countries: ["US"]

                },

                success_url:
                    "https://ShopTopSales.github.io/my-store/?payment=success",

                cancel_url:
                    "https://ShopTopSales.github.io/my-store/?payment=cancelled"

            });


        res.json({

            url: session.url

        });

    }


    catch (error) {

        console.error("STRIPE ERROR:");
        console.error(error);


        // TEMPORARY DEBUGGING MESSAGE
        res.status(500).json({

            error:
                error.message ||
                "Something went wrong creating checkout."

        });

    }

});


// =========================
// TEST SERVER
// =========================

app.get("/", (req, res) => {

    res.send(
        "ShopTopSales Stripe server is running!"
    );

});


// =========================
// START SERVER
// =========================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Server running on port ${PORT}`
    );

});
