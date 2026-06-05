import { useState } from "react"

import { JSONNode } from "./components/JSONNode"

// We can reuse the exact same styles you love!
const styles = `
  body {
    margin: 0;
    background-color: #0b0f19;
  }
  .jpt-root {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    background-color: #0b0f19;
    color: #f1f5f9;
    min-height: 100vh;
    padding: 2.5rem;
    box-sizing: border-box;
  }
  .jpt-container {
    max-width: 64rem;
    margin: 0 auto;
  }
  .jpt-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #1e293b;
    padding-bottom: 1.25rem;
    margin-bottom: 1.5rem;
  }
  .jpt-title-area {
    display: flex;
    align-items: center;
    gap: 2rem;
  }
  .jpt-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #34d399;
  }
  .jpt-toggle-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: sans-serif;
    font-size: 0.85rem;
    color: #94a3b8;
    user-select: none;
    cursor: pointer;
  }
  .jpt-checkbox {
    cursor: pointer;
    accent-color: #34d399;
    width: 1rem;
    height: 1rem;
  }
  .jpt-actions {
    display: flex;
    gap: 0.75rem;
  }
  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 600;
    font-family: sans-serif;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-primary { background-color: #34d399; color: #0b0f19; }
  .btn-primary:hover { background-color: #059669; }
  .btn-gray { background-color: #334155; color: #f8fafc; }
  .btn-gray:hover { background-color: #475569; }
  .btn-danger { background-color: #ef4444; color: #ffffff; }
  .btn-danger:hover { background-color: #dc2626; }
  
  .jpt-viewer {
    background-color: #020617;
    padding: 2rem;
    border-radius: 0.75rem;
    border: 1px solid #1e293b;
    font-size: 0.9rem;
    line-height: 1.6;
  }
  .jpt-input-area {
    background-color: #020617;
    padding: 2.5rem;
    border-radius: 0.75rem;
    border: 1px solid #1e293b;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .jpt-textarea {
    width: 100%;
    height: 22rem;
    background-color: #0b0f19;
    color: #34d399;
    border: 1px solid #334155;
    border-radius: 0.5rem;
    padding: 1rem;
    box-sizing: border-box;
    font-family: monospace;
    font-size: 0.9rem;
    resize: vertical;
    outline: none;
  }
  .jpt-textarea:focus {
    border-color: #34d399;
  }
  .error-msg {
    color: #f87171;
    font-size: 0.9rem;
    margin: 0;
  }
`

export default function OptionsPage() {
  const [parsedData, setParsedData] = useState<any>(null)
  const [rawInput, setRawInput] = useState("")
  const [error, setError] = useState<string | null>(null)

  const [copiedJson, setCopiedJson] = useState(false)
  const [copiedTs, setCopiedTs] = useState(false)
  const [rememberCollapse, setRememberCollapse] = useState(true)
  const [collapsedRegistry, setCollapsedRegistry] = useState<{
    [path: string]: boolean
  }>({})

  const handleProcessInput = () => {
    try {
      if (!rawInput.trim()) return
      const json = JSON.parse(rawInput.trim())
      setParsedData(json)
      setError(null)
    } catch (err: any) {
      setError(
        "Malformed JSON string object. Double check syntax commas and quotes!"
      )
    }
  }

  const handleClearWorkspace = () => {
    setParsedData(null)
    setRawInput("")
    setError(null)
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(parsedData, null, 2))
    setCopiedJson(true)
    setTimeout(() => setCopiedJson(false), 2000)
  }

  const handleCopyTypeScript = () => {
    const targetObj = Array.isArray(parsedData) ? parsedData[0] : parsedData
    if (!targetObj || typeof targetObj !== "object") {
      navigator.clipboard.writeText(
        "type RootType = " + typeof parsedData + ";"
      )
      setCopiedTs(true)
      setTimeout(() => setCopiedTs(false), 2000)
      return
    }

    let interfaceRegistry: { [name: string]: string } = {}
    let interfaceSequence: string[] = []

    const buildInterface = (name: string, obj: any): string => {
      const interfaceName = name.charAt(0).toUpperCase() + name.slice(1)
      if (interfaceRegistry[interfaceName]) return interfaceName

      let block = `interface ${interfaceName} {\n`
      for (const key in obj) {
        const val = obj[key]
        if (val === null) {
          block += `  ${key}: any;\n`
        } else if (Array.isArray(val)) {
          if (val.length > 0 && typeof val[0] === "object") {
            const childName = key.endsWith("s") ? key.slice(0, -1) : key
            const subInterface = buildInterface(childName, val[0])
            block += `  ${key}: ${subInterface}[];\n`
          } else {
            const primitiveType = val.length > 0 ? typeof val[0] : "any"
            block += `  ${key}: ${primitiveType}[];\n`
          }
        } else if (typeof val === "object") {
          const subInterface = buildInterface(key, val)
          block += `  ${key}: ${subInterface};\n`
        } else {
          block += `  ${key}: ${typeof val};\n`
        }
      }
      block += "}"
      interfaceRegistry[interfaceName] = block
      interfaceSequence.push(interfaceName)
      return interfaceName
    }

    buildInterface("RootObject", targetObj)
    const finalTypeScriptCode = interfaceSequence
      .map((name) => interfaceRegistry[name])
      .join("\n\n")
    navigator.clipboard.writeText(finalTypeScriptCode)
    setCopiedTs(true)
    setTimeout(() => setCopiedTs(false), 2000)
  }

  return (
    <div className="jpt-root">
      <style>{styles}</style>
      <div className="jpt-container">
        <header className="jpt-header">
          <div className="jpt-title-area">
            <div
              className="jpt-title"
              style={{ cursor: "pointer" }}
              onClick={handleClearWorkspace}>
              ⚡ JSON2PrettyTS (JPT) Workspace
            </div>
            {parsedData && (
              <label className="jpt-toggle-container">
                <input
                  type="checkbox"
                  className="jpt-checkbox"
                  checked={rememberCollapse}
                  onChange={(e) => {
                    setRememberCollapse(e.target.checked)
                    if (!e.target.checked) setCollapsedRegistry({})
                  }}
                />
                <span>Remember Collapse State</span>
              </label>
            )}
          </div>

          {parsedData && (
            <div className="jpt-actions">
              <button className="btn btn-danger" onClick={handleClearWorkspace}>
                Reset
              </button>
              <button className="btn btn-gray" onClick={handleCopyJson}>
                {copiedJson ? "Copied! ✓" : "Copy Pretty JSON"}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCopyTypeScript}>
                {copiedTs ? "Types Copied! ✓" : "Get TS Type"}
              </button>
            </div>
          )}
        </header>

        {!parsedData ? (
          <div className="jpt-input-area">
            <h3
              style={{ margin: 0, color: "#34d399", fontFamily: "sans-serif" }}>
              Paste Local JSON Payload
            </h3>
            <textarea
              className="jpt-textarea"
              placeholder='{\n  "paste_here": "your unformatted object logs"\n}'
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
            />
            {error && <p className="error-msg">⚠️ {error}</p>}
            <button
              className="btn btn-primary"
              style={{ width: "fit-content", padding: "0.75rem 2rem" }}
              onClick={handleProcessInput}
              disabled={!rawInput.trim()}>
              Build Tree & Typings
            </button>
          </div>
        ) : (
          <div className="jpt-viewer">
            <JSONNode
              value={parsedData}
              isRoot={true}
              rememberCollapse={rememberCollapse}
              collapsedRegistry={collapsedRegistry}
              setCollapsedRegistry={setCollapsedRegistry}
            />
          </div>
        )}
      </div>
    </div>
  )
}
