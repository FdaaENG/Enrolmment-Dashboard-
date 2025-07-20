import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { useTranslation } from "react-i18next";
import Papa from "papaparse";
import "../i18n";
import "../dashboardStyle.css";

ChartJS.register(
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const parseNumber = (val) => {
  if (!val || val === "" || isNaN(Number(String(val).replace(/,/g, "")))) return 0;
  return Number(String(val).replace(/,/g, ""));
};

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState("en");
  const [selectedProvinces, setSelectedProvinces] = useState("Nova Scotia");
  const [selectedType, setSelectedType] = useState("fullTimeUG");
  const [selectedStudyLevel, setSelectedStudyLevel] = useState("UG");
  const [selectedStudyMode, setSelectedStudyMode] = useState("fullTime");
  const [data, setData] = useState([]);

  useEffect(() => {
    Papa.parse("/dataFile.csv", {
      download: true,
      header: true,
      complete: function (results) {
        const cleaned = results.data
          .filter((d) => d["University"] && d["Year"])
          .map((d) => ({
            year: d["Year"],
            university: d["University"],
            fullTimeUG: parseNumber(d["Full-time Undergrad"]),
            fullTimeGrad: parseNumber(d["Full-time Graduate"]),
            partTimeUG: parseNumber(d["Part-time Undergrad"]),
            partTimeGrad: parseNumber(d["Part-time Graduate"]),
            province: d["Province"]?.trim() || "Unknown",
          }));
        setData(cleaned);
      },
    });
  }, []);

  const provinces = [...new Set(data.map((d) => d.province))];
  const years = [...new Set(data.map((d) => d.year))].sort();

  const handleLanguageToggle = () => {
    const newLang = language === "en" ? "fr" : "en";
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  const filteredData = data.filter((d) => d.province === selectedProvinces);

  const chart1Data = {
    labels: years,
    datasets: [
      {
        label: t(selectedType),
        data: years.map((year) =>
          filteredData
            .filter((d) => d.year === year)
            .reduce((sum, d) => sum + d[selectedType], 0)
        ),
        borderColor: "#36A2EB",
        backgroundColor: "#36A2EB",
        tension: 0.3,
        fill: false,
      },
    ],
  };

  const key = selectedStudyMode + selectedStudyLevel;

  const provincesSummary = provinces.map((province) => {
    const filtered = data.filter((d) => d.province === province);
    const total = filtered.reduce((acc, d) => acc + (d[key] || 0), 0);
    return { province, total };
  });

  const chart1Options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // hide legend on line chart
      },
    },
  };

  const chart2Data = {
    labels: provincesSummary.map((p) => p.province),
    datasets: [
      {
        label: "", // no label to avoid legend text
        data: provincesSummary.map((p) => p.total),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#C9CBCF",
          "#36A2EB",
          "#FF6384",
          "#4BC0C0",
        ],
      },
    ],
  };

  const chart2Options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // hide legend on bar chart
      },
    },
  };

  return (
    <div className="dashboard-container">
      <button className="lang-toggle" onClick={handleLanguageToggle}>
        {t("toggleLang")}
      </button>

      <div className="chart-column">
        <h2>{t("chart1Title")}</h2>
        <div className="filters">
          <label>{t("filterProvince")}</label>
          <select
            className="full-width"
            value={selectedProvinces}
            onChange={(e) => setSelectedProvinces(e.target.value)}
          >
            <option value="">{t("selectProvince")}</option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <label>{t("filterStudyType")}</label>
          <select
            className="full-width"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">{t("selectStudyType")}</option>
            {["fullTimeUG", "fullTimeGrad", "partTimeUG", "partTimeGrad"].map(
              (type) => (
                <option key={type} value={type}>
                  {t(type)}
                </option>
              )
            )}
          </select>
        </div>
        <Line data={chart1Data} options={chart1Options} height={300} />
        <p className="chart-description">
          {language === "en"
            ? "Shows total enrolment from 2020 to 2025, filtered by province and study type."
            : "Affiche les inscriptions totales de 2020 à 2025, filtrées par province et type d’études."}
        </p>
      </div>

      <div className="chart-column">
        <h2>{t("chart2Title")}</h2>
        <div className="filters">
          <label>{t("studyLevel")}</label>
          <select
            className="full-width"
            onChange={(e) => setSelectedStudyLevel(e.target.value)}
            value={selectedStudyLevel}
          >
            <option value="UG">{t("undergrad")}</option>
            <option value="Grad">{t("grad")}</option>
          </select>

          <label>{t("studyMode")}</label>
          <select
            className="full-width"
            onChange={(e) => setSelectedStudyMode(e.target.value)}
            value={selectedStudyMode}
          >
            <option value="fullTime">{t("fullTime")}</option>
            <option value="partTime">{t("partTime")}</option>
          </select>
        </div>
        <Bar data={chart2Data} options={chart2Options} height={300} />
        <p className="chart-description">
          {language === "en"
            ? "Displays total enrolment by province based on selected study level and mode."
            : "Affiche les inscriptions totales par province selon le niveau et le mode d’études sélectionnés."}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
