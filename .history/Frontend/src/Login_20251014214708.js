import React, { useState } from "react";


export default function Login({ isLoggedIn, setIsLoggedIn, handleLogin }) {
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginFade, setLoginFade] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [registerAnim, setRegisterAnim] = useState("");
  const [tokenContract, setTokenContract] = useState("");

  const [userFocused, setUserFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [tokenFocused, setTokenFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false)

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          minHeight: "100vh",
          minWidth: "100vw",
          background: "#131313",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <div
        className={`login-container${loginFade ? " fade-out" : ""}`}
        style={{
          minHeight: "100vh",
          position: "fixed",
          inset: 0,
          zIndex: 10,
          display: isLoggedIn ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "none",
          padding: "5px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 780,
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "row",
            background: "transparent",
            borderRadius: 16,
            boxShadow: "0 0 25px 4px #9b0018, 0 8px 32px rgba(0, 0, 0, 0.3)",
            overflow: "hidden",
            minHeight: 420,
          }}
        >
          <div
            style={{
              flex: "0 0 40%",
              background: "#131313",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "35px 25px",
            }}
          >
            <img
              src="/red_logo_OS.png"
              alt="OAK Services Logo"
              style={{
                maxWidth: "100%",
                width: "280px",
                height: "auto",
                display: "block",
              }}
            />
          </div>

          <div
            style={{
              flex: "1",
              background: "#ffffff",
              padding: "35px 30px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <form
              onSubmit={async e => {
              e.preventDefault();
              const user = loginUser.trim().toLowerCase();
              const pass = loginPass.trim();
              const token = tokenContract.trim();
              setLoginError("");

              try {
                const res = await fetch("http://127.0.0.1:5000/login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: user,
                    password: pass,
                    token_contract: token,
                  }),
                });

                const data = await res.json();
                if (res.ok && data.accessToken) {
                  sessionStorage.setItem("accessToken", data.accessToken);
                  sessionStorage.setItem("tokenContract", token);
                  sessionStorage.setItem("userPassword", pass); // Guardar contraseña
                  handleLogin({ email: user });
                  setIsLoggedIn(true);
                  setLoginFade(false);
                } else {
                  setLoginError(
                    data.error || "Usuario o contraseña incorrectos"
                  );
                }
              } catch (err) {
                setLoginError("No se pudo conectar con el backend");
              }
            }}
              style={{
                display: showRegister ? "none" : "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <h2
                style={{
                  color: "#131313",
                  marginBottom: 14,
                  marginTop: 8,
                  textAlign: "center",
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                }}
              >
                Iniciar sesión
              </h2>

              <div style={{ position: "relative", marginBottom: 4 }}>
                <label
                  style={{
                    position: "absolute",
                    left: 12,
                    top: userFocused || loginUser ? 7 : "50%",
                    transform: userFocused || loginUser ? "translateY(0)" : "translateY(-50%)",
                    color: userFocused ? "#4a90e2" : "#666666",
                    fontSize: userFocused || loginUser ? 10 : 13,
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                    pointerEvents: "none",
                    background: userFocused || loginUser ? "#ffffff" : "transparent",
                    padding: userFocused || loginUser ? "0 4px" : "0",
                  }}
                >
                  Usuario
                </label>
                <input
                  type="text"
                  value={loginUser}
                  onChange={e => setLoginUser(e.target.value)}
                  style={{
                    width: "93%",
                    background: "#f8f9fa",
                    color: "#1a1a1a",
                    border: `1px solid ${userFocused ? "#4a90e2" : "#d1d5db"}`,
                    borderRadius: 8,
                    padding: loginUser || userFocused ? "18px 12px 6px 12px" : "10px 12px",
                    fontSize: 13,
                    transition: "all 0.2s ease",
                    outline: "none",
                    boxShadow: userFocused ? "0 0 0 3px rgba(74, 144, 226, 0.2)" : "none",
                  }}
                  autoFocus
                />
              </div>

              <div style={{ position: "relative", marginBottom: 4 }}>
                <label
                  style={{
                    position: "absolute",
                    left: 12,
                    top: passFocused || loginPass ? 7 : "50%",
                    transform: passFocused || loginPass ? "translateY(0)" : "translateY(-50%)",
                    color: passFocused ? "#4a90e2" : "#666666",
                    fontSize: passFocused || loginPass ? 10 : 13,
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                    pointerEvents: "none",
                    background: passFocused || loginPass ? "#ffffff" : "transparent",
                    padding: passFocused || loginPass ? "0 4px" : "0",
                  }}
                >
                  Contraseña
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  style={{
                    width: "93%",
                    background: "#f8f9fa",
                    color: "#1a1a1a",
                    border: `1px solid ${passFocused ? "#4a90e2" : "#d1d5db"}`,
                    borderRadius: 8,
                    padding: loginPass || passFocused ? "18px 12px 6px 12px" : "10px 12px",
                    fontSize: 13,
                    transition: "all 0.2s ease",
                    outline: "none",
                    boxShadow: passFocused ? "0 0 0 3px rgba(74, 144, 226, 0.2)" : "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6b7280",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#131313"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#6b7280"
                  }}
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>                
              </div>

              <div style={{ position: "relative", marginBottom: 4 }}>
                <label
                  style={{
                    position: "absolute",
                    left: 12,
                    top: tokenFocused || tokenContract ? 7 : "50%",
                    transform: tokenFocused || tokenContract ? "translateY(0)" : "translateY(-50%)",
                    color: tokenFocused ? "#4a90e2" : "#666666",
                    fontSize: tokenFocused || tokenContract ? 10 : 13,
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                    pointerEvents: "none",
                    background: tokenFocused || tokenContract ? "#ffffff" : "transparent",
                    padding: tokenFocused || tokenContract ? "0 4px" : "0",
                  }}
                >
                  ID del Proyecto (Token Contract)
                </label>
                <input
                  type="text"
                  value={tokenContract}
                  onChange={e => setTokenContract(e.target.value)}
                  style={{
                    width: "93%",
                    background: "#f8f9fa",
                    color: "#1a1a1a",
                    border: `1px solid ${tokenFocused ? "#4a90e2" : "#d1d5db"}`,
                    borderRadius: 8,
                    padding: tokenContract || tokenFocused ? "18px 12px 6px 12px" : "10px 12px",
                    fontSize: 13,
                    transition: "all 0.2s ease",
                    outline: "none",
                    boxShadow: tokenFocused ? "0 0 0 3px rgba(74, 144, 226, 0.2)" : "none",
                  }}
                  required
                />
              </div>

              {loginError && (
                <div
                  style={{
                    color: "#dc2626",
                    background: "#fee2e2",
                    borderRadius: 8,
                    padding: "8px 12px",
                    marginBottom: 4,
                    textAlign: "center",
                    fontSize: 12,
                    border: "1px solid #fca5a5",
                  }}
                >
                  {loginError}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: "#9b0018",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    height: 38,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.2s, transform 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#680010"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#9b0018"
                  }}
                >
                  Entrar
                </button>

                <button
                  type="button"
                  style={{
                    flex: 1,
                    background: "#f8f9fa",
                    color: "#4b5563",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    height: 38,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                  onClick={async () => {
                    setLoginError("");
                    try {
                      const token = "oak_demo_9a01cfb26f"; // Token por defecto para invitado
                      const res = await fetch("http://127.0.0.1:5000/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          email: "Invitado",
                          password: "",
                          token_contract: token,
                        }),
                      });
                      const data = await res.json();
                      if (res.ok && data.accessToken) {
                        sessionStorage.setItem("accessToken", data.accessToken);
                        sessionStorage.setItem("tokenContract", token);
                        sessionStorage.setItem("userPassword", "");
                        handleLogin({ email: "Invitado" });
                        setIsLoggedIn(true);
                        setLoginFade(false);
                      } else {
                        setLoginError(data.error || "No se pudo iniciar sesión como invitado");
                      }
                    } catch (err) {
                      setLoginError("No se pudo conectar con el backend");
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e5e7eb"
                    e.currentTarget.style.borderColor = "#9ca3af"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f8f9fa"
                    e.currentTarget.style.borderColor = "#d1d5db"
                  }}
                >
                  Invitado
                </button>
              </div>

              <div style={{ textAlign: "center", marginTop: 6 }}>
                <span style={{ color: "#6b7280", fontWeight: 450, fontSize: 12 }}>Autenticación de Roble. </span>
                <button
                  type="button"
                  style={{
                    background: "none",
                    color: "#131313",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "none",
                    fontSize: 12,
                    padding: 0,
                  }}
                  onClick={() => {
                    window.open("https://roble.openlab.uninorte.edu.co/", "_blank", "noopener,noreferrer")
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = "underline"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = "none"
                  }}
                >
                  Ingresar aquí.
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-container > div {
            flex-direction: column;
            max-width: 420px;
          }
          
          .login-container > div > div:first-child {
            flex: 0 0 auto;
            padding: 30px 20px;
          }
          
          .login-container > div > div:first-child img {
            width: 200px;
          }
        }
        
        .fade-out {
          opacity: 0;
          transition: opacity 0.7s ease-out;
        }
        
        .login-fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}