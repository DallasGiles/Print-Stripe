import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";

import './donation.css';

console.log("Stripe Key:", import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

console.log("Stripe Key:", import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const DonationForm = () => {
    const [amount, setAmount] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [stripe, setStripe] = useState(null);

    useEffect(() => {
        async function initializeStripe() {
            const stripeInstance = await stripePromise;
            setStripe(stripeInstance);
        }
        initializeStripe();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
    
        try {
            const stripe = await stripePromise;
            if (!stripe) throw new Error("Stripe failed to initialize.");
    
            const response = await fetch("http://localhost:2000/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: amount * 100, email }),
            });
    
            if (!response.ok) throw new Error("Failed to create Stripe Checkout session");
    
            const { id } = await response.json();
            await stripe.redirectToCheckout({ sessionId: id });
    
        } catch (error) {
            alert(`An error occurred: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="donate-arch">
        <div className="donate-page">
            <h1 className="donate-header">Donate Today</h1>
            <p className="donate-text">Your donation helps bring joy to children in need.</p>

            <form onSubmit={handleSubmit} className="donate-form">
                <label className="donate-label">Donation Amount (USD):</label>
                <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="usd-input"
                    required
                />

                <label className="donate-label">Your Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="usd-input"
                    required
                />

                <button
                    type="submit"
                    className="donate-button"
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Donate"}
                </button>
            </form>
        </div>
        <div className="dollar-toys">
        <h3> How many toys will your donation fund?</h3>
        <p>$1 will get 4 kids toys.</p>
        <p>$10 will get 40 kids toys.</p>
        <p>$25 will give 100 toys to kids.</p>
        <p>$50 will put a smile on 200 kids faces</p>
        <p>$100 will give 400 kids a Christmas to remember.</p>
        </div>
        </div>
    );
};

export default DonationForm;