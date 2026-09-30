import React from "react";
import loginImage from "../../assests/login.png";
import LoginScreen from "./LoginScreen.jsx";
import RegisterScreen from "./RegisterScreen.jsx";

export default function AuthShell({ view, onSwitchView, onLogin, onRegister }) {
  return (
    <main className="auth-layout">
      <section className="auth-visual">
        <strong>智慧农业综合平台</strong>
        <div className="auth-map-preview">
          <img src={loginImage} alt="智慧农业登录展示" />
        </div>
      </section>
      <section className="auth-panel">
        {view === "login" ? (
          <LoginScreen onLogin={onLogin} onSwitchView={onSwitchView} />
        ) : (
          <RegisterScreen onRegister={onRegister} onSwitchView={onSwitchView} />
        )}
      </section>
    </main>
  );
}
