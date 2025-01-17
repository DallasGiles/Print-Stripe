require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));

app.use((req, res, next) => {
    if (req.path === '/webhook') {
        next(); // Skip express.json() for the webhook route
    } else {
        express.json()(req, res, next);
    }
});

// Debugging Middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Create Checkout Session
app.post("/create-checkout-session", async (req, res) => {
    console.log("Incoming request to /create-checkout-session:");
    console.log("Request Body:", req.body);

    try {
        const { amount, email } = req.body;
        if (!amount || !email) {
            throw new Error("Missing required parameters: amount or email");
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: { name: "Donation" },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            customer_email: email,
            success_url: "http://localhost:5173/success",
            cancel_url: "http://localhost:5173/cancel",
        });

        console.log("Created Checkout Session:", session);
        res.json({ id: session.id });
    } catch (error) {
        console.error("Error in /create-checkout-session:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Webhook Endpoint
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
        // Verify webhook signature using raw body
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle event types
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        const customerEmail = session.customer_details.email;
        const amountTotal = (session.amount_total / 100).toFixed(2); // Convert cents to dollars

        console.log(`Payment received from ${customerEmail} for $${amountTotal}`);

        // Send receipt email
        try {
            await sendReceiptEmail(customerEmail, amountTotal);
            console.log(`Receipt email sent to ${customerEmail}`);
        } catch (err) {
            console.error(`Failed to send receipt email: ${err.message}`);
        }
    }

    res.json({ received: true });
});

// Send Receipt Email Function
async function sendReceiptEmail(toEmail, amount) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: `"Print A Smile" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Thank You for Your Donation!',
        text: `Dear Donor,

Thank you for your generous donation of $${amount}. Your contribution will help us bring smiles to children in need.

As a 501(c)(3) nonprofit organization, your donation is tax-deductible to the fullest extent allowed by law. No goods or services were provided in exchange for this donation.

Organization Name: Print A Smile Foundation
Tax ID (EIN): 33-1393181

Thank you again for your support!

Warm regards,
Print A Smile Team`,
    };

    await transporter.sendMail(mailOptions);
}

// Catch-All for Root POST
app.post('/', (req, res) => {
    console.log('Unexpected POST request to root detected.');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    res.status(400).send('Invalid POST request. Use /create-checkout-session or /webhook.');
});

// Welcome Route
app.get('/', (req, res) => {
    res.send('Welcome to the Print A Smile API. Try POST /create-checkout-session for Stripe Checkout or POST /webhook for webhooks.');
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});