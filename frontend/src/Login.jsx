import { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const res = await fetch("http://127.0.0.1:8001/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      if (!res.ok) throw new Error("Incorrect username or password");

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", data.full_name);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* LEFT - Login Form */}
        <div style={styles.left}>
          <div style={styles.brandRow}>
            <div style={styles.logoCircle}>🏥</div>
            <span style={styles.brandName}>BioMonitor</span>
          </div>

          <h2 style={styles.welcome}>Sign In</h2>
          <p style={styles.subtitle}>Welcome back to Clinical Intelligence</p>

          {error && <div style={styles.error}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>Username</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>👤</span>
              <input
                style={styles.input}
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                style={styles.input}
                type={showPass ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                style={styles.eyeIcon}
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? "🙈" : "👁"}
              </span>
            </div>

            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Log In →"}
            </button>
          </form>

          <div style={styles.demoBox}>
            <p style={styles.demoHeader}>💡 Demo Accounts</p>
            <div style={styles.demoRow}>
              <code style={styles.code}>admin</code>
              <span style={styles.slash}>/</span>
              <code style={styles.code}>admin123</code>
            </div>
            <div style={styles.demoRow}>
              <code style={styles.code}>doctor</code>
              <span style={styles.slash}>/</span>
              <code style={styles.code}>doctor123</code>
            </div>
            <div style={styles.demoRow}>
              <code style={styles.code}>nurse</code>
              <span style={styles.slash}>/</span>
              <code style={styles.code}>nurse123</code>
            </div>
          </div>
        </div>

        {/* RIGHT - Doctor Image + Branding */}
        <div style={styles.right}>
          <div style={styles.hexBg}></div>

          <img
            src="https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt="Doctor"
            style={styles.doctorImg}
          />

          <div style={styles.floatCard}>
            <span style={styles.floatIcon}>📹</span>
            <div>
              <strong style={styles.floatTitle}>Connect with a Doctor</strong>
              <p style={styles.floatDesc}>AI-powered medical assistance</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <strong style={styles.statNum}>Real-Time</strong>
            <span style={styles.statLabel}>Patient Monitoring</span>
          </div>

          <div style={styles.rightText}>
            <h1 style={styles.rightHeading}>Advanced Medical Care</h1>
            <p style={styles.rightSub}>
              Real-time monitoring, AI diagnosis & smart analytics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #062b33 0%, #0d3b45 50%, #075985 100%)",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: 20,
  },
  container: {
    display: "flex",
    width: 940,
    maxWidth: "96%",
    minHeight: 560,
    background: "#ffffff",
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 30px 70px rgba(0,0,0,0.4)",
  },

  /* LEFT SIDE */
  left: {
    flex: 1,
    padding: "48px 44px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  brandRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 32 },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: "linear-gradient(135deg, #0891b2, #14b8a6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
  },
  brandName: { fontSize: 22, fontWeight: 800, color: "#0d3b45" },
  welcome: { fontSize: 30, margin: 0, color: "#0f172a", fontWeight: 800 },
  subtitle: { color: "#64748b", marginTop: 6, marginBottom: 28, fontSize: 14 },
  form: { display: "flex", flexDirection: "column" },
  label: { fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 8 },
  inputWrap: { position: "relative", display: "flex", alignItems: "center", marginBottom: 18 },
  inputIcon: { position: "absolute", left: 14, fontSize: 15 },
  eyeIcon: { position: "absolute", right: 14, fontSize: 15, cursor: "pointer" },
  input: {
    width: "100%",
    padding: "13px 42px",
    borderRadius: 12,
    border: "2px solid #e2e8f0",
    background: "#f8fafc",
    color: "#1e293b",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
  },
  button: {
    padding: 14,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #0891b2, #0e7490)",
    color: "white",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 10,
    fontFamily: "inherit",
  },
  error: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "11px 14px",
    borderRadius: 12,
    fontSize: 13,
    marginBottom: 18,
    border: "1px solid #fecaca",
  },
  demoBox: {
    marginTop: 24,
    padding: 16,
    background: "#ecfeff",
    border: "1px solid #a5f3fc",
    borderRadius: 12,
    textAlign: "center",
  },
  demoHeader: { fontSize: 12, color: "#64748b", marginBottom: 10 },
  demoRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 },
  code: {
    background: "#cffafe",
    padding: "4px 12px",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    color: "#0e7490",
  },
  slash: { color: "#94a3b8", fontWeight: 600 },

  /* RIGHT SIDE */
  right: {
    flex: 1,
    position: "relative",
    background: "linear-gradient(135deg, #0891b2 0%, #14b8a6 50%, #06b6d4 100%)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    overflow: "hidden",
  },
  hexBg: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 320,
    height: 320,
    background: "rgba(255,255,255,0.15)",
    borderRadius: "42% 58% 60% 40% / 45% 45% 55% 55%",
  },
  doctorImg: {
    position: "relative",
    zIndex: 2,
    height: "88%",
    objectFit: "cover",
    objectPosition: "top center",
  },
  floatCard: {
    position: "absolute",
    bottom: 90,
    left: 20,
    zIndex: 3,
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "white",
    padding: "10px 14px",
    borderRadius: 14,
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    maxWidth: 200,
  },
  floatIcon: {
    fontSize: 18,
    width: 36,
    height: 36,
    background: "#e0f2fe",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  floatTitle: { fontSize: 13, color: "#0f172a", display: "block" },
  floatDesc: { fontSize: 11, color: "#64748b", margin: 0 },
  statCard: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 3,
    background: "white",
    padding: "12px 18px",
    borderRadius: 14,
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    textAlign: "center",
  },
  statNum: { fontSize: 16, color: "#0891b2", display: "block", fontWeight: 800 },
  statLabel: { fontSize: 11, color: "#64748b" },
  rightText: {
    position: "absolute",
    top: 40,
    left: 30,
    zIndex: 3,
    maxWidth: 240,
  },
  rightHeading: { fontSize: 26, color: "white", fontWeight: 800, margin: 0, lineHeight: 1.2 },
  rightSub: { fontSize: 13, color: "rgba(255,255,255,0.9)", marginTop: 10 },
};