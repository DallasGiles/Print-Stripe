import React from "react";

const SuccessPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
            <h1 className="text-4xl font-bold text-green-700">Thank You!</h1>
            <p className="text-lg mt-4">Your donation has been successfully processed.</p>
            <a href="/" className="mt-6 text-blue-600 hover:underline">
                Return Home
            </a>
        </div>
    );
};

export default SuccessPage;