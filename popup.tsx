export default function Popup() {
  const handleOpenPlayground = () => {
    chrome.runtime.openOptionsPage()
  }

  return (
    <div
      style={{
        width: "240px",
        padding: "1rem",
        backgroundColor: "#020617",
        color: "#f1f5f9",
        fontFamily: "sans-serif",
        textAlign: "center"
      }}>
      <h4 style={{ color: "#34d399", margin: "0 0 0.5rem 0" }}>
        ⚡ JSON2PrettyTS - JPT
      </h4>
      <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0 0 1rem 0" }}>
        Parse objects and export TS typings instantly.
      </p>
      <button
        onClick={handleOpenPlayground}
        style={{
          width: "100%",
          padding: "0.5rem",
          backgroundColor: "#34d399",
          color: "#0b0f19",
          border: "none",
          borderRadius: "0.25rem",
          fontWeight: "bold",
          cursor: "pointer"
        }}>
        Edit your own JSON data
      </button>
    </div>
  )
}
