import React, { useState, useEffect } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  ArcElement,
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
  ArcElement,
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
  const [selectedTypes, setSelectedTypes] = useState([
    "fullTimeUG",
    "fullTimeGrad",
    "partTimeUG",
    "partTimeGrad",
  ]);
  const [selectedStudyLevel, setSelectedStudyLevel] = useState("UG");
  const [selectedStudyMode, setSelectedStudyMode] = useState("fullTime");
  const [data, setData] = useState([]);

  useEffect(() => {
    Papa.parse("/dataFile.csv", {
      download: true,
      header: true,
      complete: function (results) {
        const cleaned = results.data
          .filter((d) => d["University"])
          .map((d) => ({
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

  const handleLanguageToggle = () => {
    const newLang = language === "en" ? "fr" : "en";
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  const filteredData1 = data.filter((d) =>
    selectedProvinces ? d.province === selectedProvinces : true
  );

  const colors = [
    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"
  ];

  const chart1Data = {
    labels: filteredData1.map((d) => d.university),
    datasets: selectedTypes.map((type, index) => ({
      label: t(type),
      data: filteredData1.map((d) => d[type]),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length],
      tension: 0.3,
      fill: false,
    })),
  };

  const provincesSummary = provinces.map((province) => {
    const filtered = data.filter((d) => d.province === province);
    const key = `${selectedStudyMode}${selectedStudyLevel}`;
    const total = filtered.reduce((acc, d) => acc + (d[key] || 0), 0);
    return { province, total };
  });

  const chart2Data = {
    labels: provincesSummary.map((p) => p.province),
    datasets: [
      {
        label: t("totalEnrollment"),
        data: provincesSummary.map((p) => p.total),
        backgroundColor: [
          "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
          "#FF9F40", "#C9CBCF", "#36A2EB", "#FF6384", "#4BC0C0"
        ],
      },
    ],
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
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <div className="checkbox-group">
            {[
              "fullTimeUG",
              "fullTimeGrad",
              "partTimeUG",
              "partTimeGrad",
            ].map((type) => (
              <label key={type}>
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTypes([...selectedTypes, type]);
                    } else {
                      setSelectedTypes(selectedTypes.filter((t) => t !== type));
                    }
                  }}
                />
                {t(type)}
              </label>
            ))}
          </div>
        </div>
        <Line data={chart1Data} options={{ maintainAspectRatio: false }} height={300} />
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
        <Doughnut data={chart2Data} options={{ maintainAspectRatio: false }} height={300} />
      </div>
    </div>
  );
};

export default Dashboard;
