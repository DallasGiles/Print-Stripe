import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";

console.log("Checking ENV Variables:", import.meta.env); // Debugging all environment variables
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
        <div className="flex flex-col items-center bg-gray-100 min-h-screen p-8">
            <h1 className="text-3xl font-bold mb-4">Donate to Print A Smile</h1>
            <p className="text-lg mb-6">Your donation helps bring joy to children in need.</p>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <label className="block mb-2 font-medium">Donation Amount (USD):</label>
                <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                    required
                />

                <label className="block mb-2 font-medium">Your Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Donate"}
                </button>
            </form>
        </div>
    );
};

export default DonationForm;