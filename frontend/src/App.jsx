import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import "./App.css";
import Login from "./Login";

const API_URL = "http://127.0.0.1:8001";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [patients, setPatients] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);

  const [patientForm, setPatientForm] = useState({
    name: "",
    age: "",
    gender: "",
    medical_condition: "",
  });

  const [vitalForm, setVitalForm] = useState({
    patient_id: "",
    heart_rate: "",
    temperature: "",
    oxygen_level: "",
    systolic_bp: "",
    diastolic_bp: "",
  });

  const [analyticsPatient, setAnalyticsPatient] = useState("all");

  async function loadData() {
    try {
      setError("");

      const [patientsResponse, vitalsResponse] = await Promise.all([
        fetch(`${API_URL}/patients`),
        fetch(`${API_URL}/vitals`),
      ]);

      if (!patientsResponse.ok || !vitalsResponse.ok) {
        throw new Error("Could not load data from backend.");
      }

      const patientsData = await patientsResponse.json();
      const vitalsData = await vitalsResponse.json();

      setPatients(patientsData);
      setVitals(vitalsData);

      try {
        const alertsResponse = await fetch(`${API_URL}/alerts`);

        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json();

          if (Array.isArray(alertsData)) {
            setAlerts(alertsData);
          } else if (Array.isArray(alertsData.alerts)) {
            setAlerts(alertsData.alerts);
          } else {
            setAlerts([]);
          }
        } else {
          setAlerts([]);
        }
      } catch {
        setAlerts([]);
      }
    } catch (err) {
      setError(
        "Backend se connection nahi ho raha. Make sure FastAPI port 8001 par running hai."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoggedIn) return;

    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  async function handleAddPatient(e) {
    e.preventDefault();

    try {
      setError("");

      const response = await fetch(`${API_URL}/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: patientForm.name,
          age: Number(patientForm.age),
          gender: patientForm.gender,
          medical_condition: patientForm.medical_condition || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add patient");
      }

      setPatientForm({
        name: "",
        age: "",
        gender: "",
        medical_condition: "",
      });

      await loadData();
      setActiveSection("patients");
    } catch (err) {
      setError("Patient add nahi ho saka.");
    }
  }

  async function handleAddVital(e) {
    e.preventDefault();

    try {
      setError("");

      const response = await fetch(`${API_URL}/vitals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: Number(vitalForm.patient_id),
          heart_rate:
            vitalForm.heart_rate === ""
              ? null
              : Number(vitalForm.heart_rate),
          temperature:
            vitalForm.temperature === ""
              ? null
              : Number(vitalForm.temperature),
          oxygen_level:
            vitalForm.oxygen_level === ""
              ? null
              : Number(vitalForm.oxygen_level),
          systolic_bp:
            vitalForm.systolic_bp === ""
              ? null
              : Number(vitalForm.systolic_bp),
          diastolic_bp:
            vitalForm.diastolic_bp === ""
              ? null
              : Number(vitalForm.diastolic_bp),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add vital");
      }

      setVitalForm({
        patient_id: "",
        heart_rate: "",
        temperature: "",
        oxygen_level: "",
        systolic_bp: "",
        diastolic_bp: "",
      });

      await loadData();
      setActiveSection("dashboard");
    } catch (err) {
      setError("Vital record add nahi ho saka.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  }

  function handleDownloadReport(patientId) {
    window.open(`${API_URL}/report/patient/${patientId}`, "_blank");
  }

  function getPatientName(patientId) {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.name : `Patient #${patientId}`;
  }

  function getPatientVitals(patientId) {
    return vitals
      .filter((v) => v.patient_id === patientId)
      .sort(
        (a, b) =>
          new Date(a.recorded_at || 0) -
          new Date(b.recorded_at || 0)
      );
  }

  const latestVitals = useMemo(() => {
    const latest = {};

    vitals.forEach((vital) => {
      const current = latest[vital.patient_id];

      if (
        !current ||
        new Date(vital.recorded_at || 0) >
          new Date(current.recorded_at || 0)
      ) {
        latest[vital.patient_id] = vital;
      }
    });

    return latest;
  }, [vitals]);

  const averageHeartRate = useMemo(() => {
    const values = vitals
      .map((v) => v.heart_rate)
      .filter((v) => typeof v === "number");

    if (!values.length) return "--";

    return (
      values.reduce((sum, value) => sum + value, 0) / values.length
    ).toFixed(1);
  }, [vitals]);

  const averageTemperature = useMemo(() => {
    const values = vitals
      .map((v) => v.temperature)
      .filter((v) => typeof v === "number");

    if (!values.length) return "--";

    return (
      values.reduce((sum, value) => sum + value, 0) / values.length
    ).toFixed(1);
  }, [vitals]);

  const averageOxygen = useMemo(() => {
    const values = vitals
      .map((v) => v.oxygen_level)
      .filter((v) => typeof v === "number");

    if (!values.length) return "--";

    return (
      values.reduce((sum, value) => sum + value, 0) / values.length
    ).toFixed(1);
  }, [vitals]);

  const analyticsVitals = useMemo(() => {
    let filtered = vitals;

    if (analyticsPatient !== "all") {
      filtered = vitals.filter(
        (v) => String(v.patient_id) === String(analyticsPatient)
      );
    }

    return [...filtered]
      .sort(
        (a, b) =>
          new Date(a.recorded_at || 0) -
          new Date(b.recorded_at || 0)
      )
      .map((vital, index) => ({
        ...vital,
        point: index + 1,
        time: vital.recorded_at
          ? new Date(vital.recorded_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : `#${index + 1}`,
        patient: getPatientName(vital.patient_id),
      }));
  }, [vitals, analyticsPatient, patients]);

  const selectedAnalyticsPatient =
    analyticsPatient === "all"
      ? null
      : patients.find(
          (patient) =>
            String(patient.id) === String(analyticsPatient)
        );

  function openPatientHistory(patient) {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  }

  function closePatientHistory() {
    setShowPatientModal(false);
    setSelectedPatient(null);
  }

  function renderDashboard() {
    return (
      <>
        <div className="page-heading">
          <div>
            <p className="eyebrow">LIVE MONITORING</p>
            <h1>Patient Dashboard</h1>
            <p>Real-time biomedical patient monitoring and analytics.</p>
          </div>

          <button className="refresh-btn" onClick={loadData}>
            ↻ Refresh
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div>
              <span>Total Patients</span>
              <strong>{patients.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div>
              <span>Avg Heart Rate</span>
              <strong>
                {averageHeartRate}
                {averageHeartRate !== "--" && " bpm"}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🌡️</div>
            <div>
              <span>Avg Temperature</span>
              <strong>
                {averageTemperature}
                {averageTemperature !== "--" && " °C"}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🫁</div>
            <div>
              <span>Avg Oxygen</span>
              <strong>
                {averageOxygen}
                {averageOxygen !== "--" && "%"}
              </strong>
            </div>
          </div>
        </div>

        <section className="section-block">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">ALERT CENTER</p>
              <h2>Patient Alerts</h2>
            </div>
            <span className="count-badge">{alerts.length}</span>
          </div>

          {alerts.length === 0 ? (
            <div className="no-alerts">
              <span>✓</span>
              <div>
                <strong>No active alerts</strong>
                <p>
                  Current patient records do not contain any active
                  alerts.
                </p>
              </div>
            </div>
          ) : (
            <div className="alerts-list">
              {alerts.map((alert, index) => (
                <div className="alert-card" key={index}>
                  <div className="alert-symbol">!</div>
                  <div>
                    <strong>
                      {alert.patient_name ||
                        getPatientName(alert.patient_id)}
                    </strong>
                    <p>
                      {alert.severity && (
                        <span className={`severity-tag ${alert.severity?.toLowerCase()}`}>
                          {alert.severity}
                        </span>
                      )}{" "}
                      {alert.issues && alert.issues.length > 0
                        ? alert.issues.map((i) => i.message).join(", ")
                        : alert.message ||
                          "Patient vital requires attention."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="section-block">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">PATIENTS</p>
              <h2>Active Patients</h2>
            </div>
            <button
              className="small-btn"
              onClick={() => setActiveSection("patients")}
            >
              View All
            </button>
          </div>

          {patients.length === 0 ? (
            <div className="empty-state">
              No patients found. Add your first patient.
            </div>
          ) : (
            <div className="patients-grid">
              {patients.map((patient) => {
                const vital = latestVitals[patient.id];

                return (
                  <div className="patient-card" key={patient.id}>
                    <div className="patient-card-top">
                      <div className="avatar">
                        {patient.name?.charAt(0)?.toUpperCase() || "P"}
                      </div>

                      <div>
                        <h3>{patient.name}</h3>
                        <p>
                          ID #{patient.id} · {patient.gender} ·{" "}
                          {patient.age} years
                        </p>
                      </div>

                      <span className="status-dot">LIVE</span>
                    </div>

                    <div className="patient-condition">
                      {patient.medical_condition ||
                        "No medical condition specified"}
                    </div>

                    <div className="vitals-row">
                      <div>
                        <span>HR</span>
                        <strong>
                          {vital?.heart_rate ?? "--"}
                          {vital?.heart_rate != null && " bpm"}
                        </strong>
                      </div>

                      <div>
                        <span>Temp</span>
                        <strong>
                          {vital?.temperature ?? "--"}
                          {vital?.temperature != null && " °C"}
                        </strong>
                      </div>

                      <div>
                        <span>SpO₂</span>
                        <strong>
                          {vital?.oxygen_level ?? "--"}
                          {vital?.oxygen_level != null && "%"}
                        </strong>
                      </div>
                    </div>

                    <button
                      className="history-btn"
                      onClick={() => openPatientHistory(patient)}
                    >
                      View History →
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </>
    );
  }

  function renderPatients() {
    return (
      <>
        <div className="page-heading">
          <div>
            <p className="eyebrow">PATIENT MANAGEMENT</p>
            <h1>Patients</h1>
            <p>Manage registered patients and their latest vitals.</p>
          </div>
        </div>

        <div className="patients-grid">
          {patients.map((patient) => {
            const vital = latestVitals[patient.id];

            return (
              <div className="patient-card" key={patient.id}>
                <div className="patient-card-top">
                  <div className="avatar">
                    {patient.name?.charAt(0)?.toUpperCase() || "P"}
                  </div>

                  <div>
                    <h3>{patient.name}</h3>
                    <p>
                      Patient #{patient.id} · {patient.gender}
                    </p>
                  </div>

                  <span className="status-dot">LIVE</span>
                </div>

                <div className="patient-info">
                  <span>
                    <b>Age:</b> {patient.age}
                  </span>
                  <span>
                    <b>Condition:</b>{" "}
                    {patient.medical_condition || "Not specified"}
                  </span>
                </div>

                <div className="vitals-row">
                  <div>
                    <span>HR</span>
                    <strong>{vital?.heart_rate ?? "--"}</strong>
                  </div>
                  <div>
                    <span>SpO₂</span>
                    <strong>
                      {vital?.oxygen_level != null
                        ? `${vital.oxygen_level}%`
                        : "--"}
                    </strong>
                  </div>
                  <div>
                    <span>BP</span>
                    <strong>
                      {vital?.systolic_bp != null &&
                      vital?.diastolic_bp != null
                        ? `${vital.systolic_bp}/${vital.diastolic_bp}`
                        : "--"}
                    </strong>
                  </div>
                </div>

                <button
                  className="history-btn"
                  onClick={() => openPatientHistory(patient)}
                >
                  View Patient History →
                </button>

                <button
                  className="pdf-btn"
                  onClick={() => handleDownloadReport(patient.id)}
                >
                  📄 Download PDF Report
                </button>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  function renderForms() {
    return (
      <>
        <div className="page-heading">
          <div>
            <p className="eyebrow">DATA ENTRY</p>
            <h1>Add Records</h1>
            <p>Add patients and record their biomedical vital signs.</p>
          </div>
        </div>

        <div className="forms-section">
          <form className="form-card" onSubmit={handleAddPatient}>
            <div className="form-card-heading">
              <span>01</span>
              <div>
                <h2>Add Patient</h2>
                <p>Create a new patient record.</p>
              </div>
            </div>

            <label>Patient Name</label>
            <input
              type="text"
              placeholder="e.g. Ali Ahmed"
              value={patientForm.name}
              onChange={(e) =>
                setPatientForm({
                  ...patientForm,
                  name: e.target.value,
                })
              }
              required
            />

            <label>Age</label>
            <input
              type="number"
              placeholder="e.g. 35"
              value={patientForm.age}
              onChange={(e) =>
                setPatientForm({
                  ...patientForm,
                  age: e.target.value,
                })
              }
              required
            />

            <label>Gender</label>
            <select
              value={patientForm.gender}
              onChange={(e) =>
                setPatientForm({
                  ...patientForm,
                  gender: e.target.value,
                })
              }
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <label>Medical Condition</label>
            <input
              type="text"
              placeholder="e.g. Hypertension"
              value={patientForm.medical_condition}
              onChange={(e) =>
                setPatientForm({
                  ...patientForm,
                  medical_condition: e.target.value,
                })
              }
            />

            <button className="submit-btn" type="submit">
              + Add Patient
            </button>
          </form>

          <form className="form-card" onSubmit={handleAddVital}>
            <div className="form-card-heading">
              <span>02</span>
              <div>
                <h2>Record Vitals</h2>
                <p>Enter the latest patient measurements.</p>
              </div>
            </div>

            <label>Patient</label>
            <select
              value={vitalForm.patient_id}
              onChange={(e) =>
                setVitalForm({
                  ...vitalForm,
                  patient_id: e.target.value,
                })
              }
              required
            >
              <option value="">Select patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  #{patient.id} — {patient.name}
                </option>
              ))}
            </select>

            <label>Heart Rate (bpm)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 78"
              value={vitalForm.heart_rate}
              onChange={(e) =>
                setVitalForm({
                  ...vitalForm,
                  heart_rate: e.target.value,
                })
              }
            />

            <label>Temperature (°C)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 36.8"
              value={vitalForm.temperature}
              onChange={(e) =>
                setVitalForm({
                  ...vitalForm,
                  temperature: e.target.value,
                })
              }
            />

            <label>Oxygen Level (%)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 98"
              value={vitalForm.oxygen_level}
              onChange={(e) =>
                setVitalForm({
                  ...vitalForm,
                  oxygen_level: e.target.value,
                })
              }
            />

            <div className="two-inputs">
              <div>
                <label>Systolic BP</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="120"
                  value={vitalForm.systolic_bp}
                  onChange={(e) =>
                    setVitalForm({
                      ...vitalForm,
                      systolic_bp: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label>Diastolic BP</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="80"
                  value={vitalForm.diastolic_bp}
                  onChange={(e) =>
                    setVitalForm({
                      ...vitalForm,
                      diastolic_bp: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <button className="submit-btn" type="submit">
              + Record Vitals
            </button>
          </form>
        </div>
      </>
    );
  }

  function renderAnalytics() {
    const chartData = analyticsVitals;

    return (
      <>
        <div className="page-heading">
          <div>
            <p className="eyebrow">BIOMEDICAL ANALYTICS</p>
            <h1>Analytics</h1>
            <p>
              Visual analysis of patient vital signs over time.
            </p>
          </div>
        </div>

        <div className="analytics-filter">
          <label>Analyze Patient</label>
          <select
            value={analyticsPatient}
            onChange={(e) => setAnalyticsPatient(e.target.value)}
          >
            <option value="all">All Patients</option>

            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                #{patient.id} — {patient.name}
              </option>
            ))}
          </select>
        </div>

        {selectedAnalyticsPatient && (
          <div className="analytics-patient-banner">
            <div className="avatar">
              {selectedAnalyticsPatient.name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div>
              <strong>{selectedAnalyticsPatient.name}</strong>
              <span>
                Patient #{selectedAnalyticsPatient.id} ·{" "}
                {selectedAnalyticsPatient.age} years ·{" "}
                {selectedAnalyticsPatient.gender}
              </span>
            </div>
          </div>
        )}

        <div className="analytics-summary">
          <div>
            <span>Records</span>
            <strong>{chartData.length}</strong>
          </div>

          <div>
            <span>Avg HR</span>
            <strong>
              {chartData.length
                ? (
                    chartData
                      .filter((v) => v.heart_rate != null)
                      .reduce((sum, v) => sum + v.heart_rate, 0) /
                    Math.max(
                      chartData.filter((v) => v.heart_rate != null)
                        .length,
                      1
                    )
                  ).toFixed(1)
                : "--"}
            </strong>
          </div>

          <div>
            <span>Avg SpO₂</span>
            <strong>
              {chartData.length
                ? (
                    chartData
                      .filter((v) => v.oxygen_level != null)
                      .reduce(
                        (sum, v) => sum + v.oxygen_level,
                        0
                      ) /
                    Math.max(
                      chartData.filter(
                        (v) => v.oxygen_level != null
                      ).length,
                      1
                    )
                  ).toFixed(1)
                : "--"}
            </strong>
          </div>

          <div>
            <span>Avg Systolic</span>
            <strong>
              {chartData.length
                ? (
                    chartData
                      .filter((v) => v.systolic_bp != null)
                      .reduce((sum, v) => sum + v.systolic_bp, 0) /
                    Math.max(
                      chartData.filter(
                        (v) => v.systolic_bp != null
                      ).length,
                      1
                    )
                  ).toFixed(1)
                : "--"}
            </strong>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="empty-state">
            No vital records available for this selection.
          </div>
        ) : (
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-heading">
                <div>
                  <p className="eyebrow">CARDIAC</p>
                  <h2>Heart Rate Trend</h2>
                </div>
                <span>bpm</span>
              </div>

              <div className="chart-container-fixed">
                <LineChart
                  width={650}
                  height={300}
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 25,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="heart_rate"
                    name="Heart Rate"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    connectNulls
                  />
                </LineChart>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-heading">
                <div>
                  <p className="eyebrow">THERMAL</p>
                  <h2>Temperature Trend</h2>
                </div>
                <span>°C</span>
              </div>

              <div className="chart-container-fixed">
                <LineChart
                  width={650}
                  height={300}
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 25,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    name="Temperature"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    connectNulls
                  />
                </LineChart>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-heading">
                <div>
                  <p className="eyebrow">RESPIRATORY</p>
                  <h2>Oxygen Saturation</h2>
                </div>
                <span>%</span>
              </div>

              <div className="chart-container-fixed">
                <LineChart
                  width={650}
                  height={300}
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 25,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="oxygen_level"
                    name="Oxygen Saturation"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    connectNulls
                  />
                </LineChart>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-heading">
                <div>
                  <p className="eyebrow">HEMODYNAMIC</p>
                  <h2>Blood Pressure Trend</h2>
                </div>
                <span>mmHg</span>
              </div>

              <div className="chart-container-fixed">
                <LineChart
                  width={650}
                  height={300}
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 25,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="systolic_bp"
                    name="Systolic"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    connectNulls
                  />

                  <Line
                    type="monotone"
                    dataKey="diastolic_bp"
                    name="Diastolic"
                    stroke="#14b8a6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    connectNulls
                  />
                </LineChart>
              </div>
            </div>
          </div>
        )}

        <div className="analytics-insight">
          <div className="insight-icon">✦</div>
          <div>
            <strong>Monitoring Insight</strong>
            <p>
              BioMonitor continuously collects patient vital records
              and presents them visually so changes in heart rate,
              temperature, oxygen saturation, and blood pressure can
              be monitored more easily.
            </p>
          </div>
        </div>
      </>
    );
  }

  function renderHistoryModal() {
    if (!showPatientModal || !selectedPatient) return null;

    const patientVitals = getPatientVitals(selectedPatient.id);

    return (
      <div className="modal-overlay" onClick={closePatientHistory}>
        <div
          className="patient-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div>
              <p className="eyebrow">PATIENT HISTORY</p>
              <h2>{selectedPatient.name}</h2>
              <p>
                #{selectedPatient.id} · {selectedPatient.age} years ·{" "}
                {selectedPatient.gender}
              </p>
            </div>

            <button
              className="close-btn"
              onClick={closePatientHistory}
            >
              ×
            </button>
          </div>

          <div className="modal-condition">
            <strong>Medical Condition</strong>
            <span>
              {selectedPatient.medical_condition ||
                "Not specified"}
            </span>
          </div>

          {patientVitals.length === 0 ? (
            <div className="empty-state">
              No vital history available.
            </div>
          ) : (
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Heart Rate</th>
                    <th>Temperature</th>
                    <th>SpO₂</th>
                    <th>Blood Pressure</th>
                  </tr>
                </thead>

                <tbody>
                  {patientVitals.map((vital) => (
                    <tr key={vital.id}>
                      <td>
                        {vital.recorded_at
                          ? new Date(
                              vital.recorded_at
                            ).toLocaleString()
                          : "--"}
                      </td>

                      <td>
                        {vital.heart_rate != null
                          ? `${vital.heart_rate} bpm`
                          : "--"}
                      </td>

                      <td>
                        {vital.temperature != null
                          ? `${vital.temperature} °C`
                          : "--"}
                      </td>

                      <td>
                        {vital.oxygen_level != null
                          ? `${vital.oxygen_level}%`
                          : "--"}
                      </td>

                      <td>
                        {vital.systolic_bp != null &&
                        vital.diastolic_bp != null
                          ? `${vital.systolic_bp}/${vital.diastolic_bp} mmHg`
                          : "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============= LOGIN CHECK =============
  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <h2>BioMonitor</h2>
        <p>Loading patient monitoring system...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">B</div>
          <div>
            <h2>BioMonitor</h2>
            <span>Clinical Intelligence</span>
          </div>
        </div>

        <div className="sidebar-status">
          <span className="live-dot"></span>
          System Online
        </div>

        <nav className="navigation">
          <button
            className={
              activeSection === "dashboard" ? "nav-item active" : "nav-item"
            }
            onClick={() => setActiveSection("dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={
              activeSection === "patients" ? "nav-item active" : "nav-item"
            }
            onClick={() => setActiveSection("patients")}
          >
            <span>♙</span>
            Patients
          </button>

          <button
            className={
              activeSection === "forms" ? "nav-item active" : "nav-item"
            }
            onClick={() => setActiveSection("forms")}
          >
            <span>＋</span>
            Add Records
          </button>

          <button
            className={
              activeSection === "analytics" ? "nav-item active" : "nav-item"
            }
            onClick={() => setActiveSection("analytics")}
          >
            <span>⌁</span>
            Analytics
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="system-card">
            <span>API STATUS</span>
            <strong>
              <i></i> Connected
            </strong>
            <small>127.0.0.1:8001</small>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            ⎋ Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="topbar-label">BIOMEDICAL MONITORING PLATFORM</span>
          </div>

          <div className="topbar-time">
            <span>● LIVE</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </header>

        {activeSection === "dashboard" && renderDashboard()}
        {activeSection === "patients" && renderPatients()}
        {activeSection === "forms" && renderForms()}
        {activeSection === "analytics" && renderAnalytics()}

        <footer className="footer">
          <span>BioMonitor</span>
          <span>Real-Time Biomedical Patient Monitoring & Analytics Platform</span>
          <span>v1.0</span>
        </footer>
      </main>

      {renderHistoryModal()}
    </div>
  );
}

export default App;