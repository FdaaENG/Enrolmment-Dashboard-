import React from "react";
import Dashboard from "./Components/Dashboard";
import "./App.css";
import "./i18n";
import { useTranslation } from "react-i18next";

function App() {
  const { t } = useTranslation();

  return (
    <div className="App">
      <h1 style={{ textAlign: "center", marginTop: "1rem" }}>
        {t("dashboardTitle")}
      </h1>
      <Dashboard />
    </div>
  );
}

export default App;