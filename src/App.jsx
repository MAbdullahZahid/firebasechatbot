import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ChatBot from "./views/ChatBox";
import LoginPage from "./views/LoginPage";
import { auth } from "./firebase";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>; // prevent flicker

  return (
    <Router>
      <Routes>
        {/* Protected route */}
        <Route
          path="/chatbot"
          element={user ? <ChatBot /> : <Navigate to="/login" replace />}
        />

        {/* Login route */}
        <Route
          path="/login"
          element={user ? <Navigate to="/chatbot" replace /> : <LoginPage onLogin={setUser} />}
        />

        {/* Default: redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
