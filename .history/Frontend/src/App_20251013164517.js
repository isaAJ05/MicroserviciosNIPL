import React, { useState } from "react";
import Login from "./Login";
import PanelPrincipal from "./PanelPrincipal";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Maneja el login exitoso
  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  return (
    <>
      {!isLoggedIn ? (
        <Login isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} handleLogin={handleLogin} />
      ) : (
        <PanelPrincipal user={user} />
      )}
    </>
  );
}
