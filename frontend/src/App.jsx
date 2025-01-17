import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DonationForm from "./components/donationForm";
import SuccessPage from "./components/successPage";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<DonationForm />} />
                <Route path="/success" element={<SuccessPage />} />
            </Routes>
        </Router>
    );
};

export default App;
