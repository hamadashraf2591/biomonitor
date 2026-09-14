import { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      <div style={styles.left}>
        <div style={styles.brandBox}>
          <div style={styles.logoCircle}>B</div>
          <h1 style={styles.brandTitle}>BioMonitor</h1>
          <p style={styles.brandSub}>Clinical Intelligence Platform</p>
          <div style={styles.features}>
            <p style={styles.feat}>❤️ Real-Time Vital Monitoring</p>
            <p style={styles.feat}>🧠 AI Anomaly Detection</p>
            <p style={styles.feat}>📊 Advanced Analytics</p>
            <p style={styles.feat}>📄 Instant PDF Reports</p>
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <form style={styles.card} onSubmit={handleSubmit}>
          <h2 style={styles.welcome}>Welcome Back 👋</h2>
          <p style={styles.subtitle}>Sign in to your dashboard</p>

          {error && <div style={styles.error}>⚠️ {error}</div>}

          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            type="text"
            placeholder="admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          <p style={styles.hint}>
            Demo → <b>admin</b> / <b>admin123</b>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" },
  left: {
    flex: 1,
    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "white", padding: "40px",
  },
  brandBox: { maxWidth: 380 },
  logoCircle: {
    width: 60, height: 60, borderRadius: "16px",
    background: "rgba(255,255,255,0.2)", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontSize: 30, fontWeight: "bold", marginBottom: 20,
  },
  brandTitle: { fontSize: 42, margin: 0, fontWeight: 800 },
  brandSub: { fontSize: 16, opacity: 0.85, marginTop: 8, marginBottom: 40 },
  features: { display: "flex", flexDirection: "column", gap: 16 },
  feat: { fontSize: 16, margin: 0, opacity: 0.95 },
  right: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
    background: "#f1f5f9", padding: "40px",
  },
  card: {
    width: "100%", maxWidth: 380, background: "white", padding: "40px",
    borderRadius: "20px", boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
    display: "flex", flexDirection: "column",
  },
  welcome: { fontSize: 28, margin: 0, color: "#0f172a", fontWeight: 700 },
  subtitle: { color: "#64748b", marginTop: 6, marginBottom: 28 },
  label: { fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 },
  input: {
    padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1",
    fontSize: 15, marginBottom: 18, outline: "none",
  },
  button: {
    padding: "13px", borderRadius: "10px", border: "none",
    background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
    color: "white", fontSize: 16, fontWeight: 600, cursor: "pointer", marginTop: 8,
  },
  error: {
    background: "#fef2f2", color: "#dc2626", padding: "10px 14px",
    borderRadius: "10px", fontSize: 14, marginBottom: 18, border: "1px solid #fecaca",
  },
  hint: { textAlign: "center", fontSize: 13, color: "#94a3b8", marginTop: 20 },
};