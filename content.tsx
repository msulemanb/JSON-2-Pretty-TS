import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import { useEffect, useState } from "react"

import { JSONNode } from "./components/JSONNode"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
    .jpt-root {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      background-color: #0b0f19;
      color: #f1f5f9;
      position: fixed;
      inset: 0;
      padding: 2.5rem;
      overflow-y: auto;
      scrollbar-gutter: stable;
      z-index: 9999999999;
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
    .btn-outline { 
      background-color: transparent; 
      color: #34d399; 
      border: 1px solid #34d399; 
    }
    .btn-outline:hover { 
      background-color: rgba(52, 211, 153, 0.1); 
    }
    
    .jpt-viewer {
      background-color: #020617;
      padding: 2rem;
      border-radius: 0.75rem;
      border: 1px solid #1e293b;
      font-size: 0.9rem;
      line-height: 1.6;
    }
  `
  return style
}

export default function JsonForgeContent() {
  const [isJsonPage, setIsJsonPage] = useState(false)
  const [parsedData, setParsedData] = useState<any>(null)
  const [copiedJson, setCopiedJson] = useState(false)
  const [copiedTs, setCopiedTs] = useState(false)

  const [rememberCollapse, setRememberCollapse] = useState(true)
  const [collapsedRegistry, setCollapsedRegistry] = useState<{
    [path: string]: boolean
  }>({})

  useEffect(() => {
    try {
      const rawText = document.body.innerText.trim()
      if (
        (rawText.startsWith("{") && rawText.endsWith("}")) ||
        (rawText.startsWith("[") && rawText.endsWith("]"))
      ) {
        const json = JSON.parse(rawText)
        setParsedData(json)
        setIsJsonPage(true)
        document.body.style.display = "none"
      }
    } catch (e) {
      // Not a pure JSON file endpoint
    }
  }, [])

  if (!isJsonPage) return null

  const handleOpenWorkspacePlayground = () => {
    // Safely ping the background worker to open the playground without hitting browser CSP blocks
    chrome.runtime.sendMessage({ action: "open_workspace" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Message passing failed:", chrome.runtime.lastError)
      }
    })
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
      <div className="jpt-container">
        <header className="jpt-header">
          <div className="jpt-title-area">
            <div className="jpt-title">⚡ JSON2PrettyTS (JPT)</div>
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
          </div>

          <div className="jpt-actions">
            {/* Added the workspace link button seamlessly to the header */}
            <button
              className="btn btn-outline"
              onClick={handleOpenWorkspacePlayground}>
              Edit your own JSON data ↗
            </button>
            <button className="btn btn-gray" onClick={handleCopyJson}>
              {copiedJson ? "Copied! ✓" : "Copy JSON"}
            </button>
            <button className="btn btn-primary" onClick={handleCopyTypeScript}>
              {copiedTs ? "Types Copied! ✓" : "Get TS Type"}
            </button>
          </div>
        </header>

        <div className="jpt-viewer">
          <JSONNode
            value={parsedData}
            isRoot={true}
            rememberCollapse={rememberCollapse}
            collapsedRegistry={collapsedRegistry}
            setCollapsedRegistry={setCollapsedRegistry}
          />
        </div>
      </div>
    </div>
  )
}
