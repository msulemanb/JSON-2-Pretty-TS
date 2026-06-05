import { useState } from "react"

interface JSONNodeProps {
  nodeKey?: string | number
  value: any
  isRoot?: boolean
  path?: string
  rememberCollapse: boolean
  collapsedRegistry: { [path: string]: boolean }
  setCollapsedRegistry: React.Dispatch<
    React.SetStateAction<{ [path: string]: boolean }>
  >
}

export function JSONNode({
  nodeKey,
  value,
  isRoot = false,
  path = "root",
  rememberCollapse,
  collapsedRegistry,
  setCollapsedRegistry
}: JSONNodeProps) {
  const isObject = value !== null && typeof value === "object"
  const isArray = Array.isArray(value)

  const currentPath = isRoot
    ? "root"
    : `${path}.${nodeKey !== undefined ? nodeKey : "node"}`

  const initialExpansionState = rememberCollapse
    ? collapsedRegistry[currentPath] !== undefined
      ? collapsedRegistry[currentPath]
      : true
    : true

  const [isExpanded, setIsExpanded] = useState(initialExpansionState)
  const [isHovered, setIsHovered] = useState(false)
  const [copiedNode, setCopiedNode] = useState(false)
  const [copiedSubTs, setCopiedSubTs] = useState(false)

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    const nextState = !isExpanded
    setIsExpanded(nextState)

    if (rememberCollapse) {
      setCollapsedRegistry((prev) => ({
        ...prev,
        [currentPath]: nextState
      }))
    }
  }

  const handleCopyScopedJson = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(JSON.stringify(value, null, 2))
    setCopiedNode(true)
    setTimeout(() => setCopiedNode(false), 1500)
  }

  const handleCopyScopedTs = (e: React.MouseEvent) => {
    e.stopPropagation()

    const targetObj = Array.isArray(value) ? value[0] : value
    if (!targetObj || typeof targetObj !== "object") {
      navigator.clipboard.writeText(`type SubType = ${typeof value};`)
      setCopiedSubTs(true)
      setTimeout(() => setCopiedSubTs(false), 1500)
      return
    }

    let interfaceRegistry: { [name: string]: string } = {}
    let interfaceSequence: string[] = []

    const buildInterface = (name: string, obj: any): string => {
      const cleanName =
        typeof name === "string" && isNaN(Number(name)) ? name : "SubObject"
      const interfaceName =
        cleanName.charAt(0).toUpperCase() + cleanName.slice(1)

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

    const startingName =
      nodeKey !== undefined && typeof nodeKey === "string"
        ? nodeKey
        : "SubRootObject"
    buildInterface(startingName, targetObj)

    const finalTypeScriptCode = interfaceSequence
      .map((name) => interfaceRegistry[name])
      .join("\n\n")

    navigator.clipboard.writeText(finalTypeScriptCode)
    setCopiedSubTs(true)
    setTimeout(() => setCopiedSubTs(false), 1500)
  }

  const getValueStyle = (val: any) => {
    if (typeof val === "string") return { color: "#ce9178" }
    if (typeof val === "number") return { color: "#b5cea8" }
    if (typeof val === "boolean") return { color: "#569cd6" }
    if (val === null) return { color: "#808080" }
    return { color: "#f1f5f9" }
  }

  if (!isObject) {
    return (
      <div
        style={{
          paddingLeft: "2rem",
          margin: "0.25rem 0",
          display: "flex",
          alignItems: "center"
        }}>
        {nodeKey !== undefined && typeof nodeKey === "string" && (
          <span style={{ color: "#9cdcfe", marginRight: "0.35rem" }}>
            "{nodeKey}":
          </span>
        )}
        <span style={getValueStyle(value)}>
          {typeof value === "string" ? `"${value}"` : String(value)}
        </span>
      </div>
    )
  }

  const keys = Object.keys(value)
  const bracketOpen = isArray ? "[" : "{"
  const bracketClose = isArray ? "]" : "}"
  const calculatedPaddingLeft = isRoot ? "0px" : "1.25rem"

  return (
    <div style={{ paddingLeft: calculatedPaddingLeft, margin: "0.25rem 0" }}>
      <div
        onClick={handleToggleExpand}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          userSelect: "none",
          backgroundColor: isHovered ? "rgba(51, 65, 85, 0.4)" : "transparent",
          borderRadius: "0.25rem",
          padding: "0.25rem 0.5rem",
          marginLeft: "-0.5rem",
          transition: "background-color 0.15s ease",
          position: "relative"
        }}>
        <span
          style={{
            display: "inline-block",
            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.1s ease",
            marginRight: "0.5rem",
            width: "12px",
            fontSize: "0.85rem",
            color: isHovered ? "#34d399" : "#94a3b8",
            textAlign: "center"
          }}>
          ▶
        </span>

        {nodeKey !== undefined && !isArray && typeof nodeKey === "string" && (
          <span style={{ color: "#9cdcfe", marginRight: "0.35rem" }}>
            "{nodeKey}":
          </span>
        )}

        <span style={{ color: "#cbd5e1", fontWeight: "600" }}>
          {bracketOpen}
          {!isExpanded && (
            <span
              style={{
                color: "#64748b",
                fontSize: "0.8rem",
                fontWeight: "normal"
              }}>
              {" "}
              ... {keys.length} {keys.length === 1 ? "item" : "items"}{" "}
            </span>
          )}
        </span>
        {!isExpanded && (
          <span style={{ color: "#cbd5e1", fontWeight: "600" }}>
            {bracketClose}
          </span>
        )}

        {isHovered && (
          <div
            style={{ display: "flex", gap: "0.35rem", marginLeft: "1rem" }}
            onClick={(e) => e.stopPropagation()} // Safety block against accidental tree folding
          >
            <button
              onClick={handleCopyScopedJson}
              style={{
                padding: "0.1rem 0.4rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                backgroundColor: copiedNode ? "#059669" : "#1e293b",
                color: copiedNode ? "#ffffff" : "#94a3b8",
                border: "1px solid #334155",
                borderRadius: "0.25rem",
                cursor: "pointer",
                zIndex: 10
              }}>
              {copiedNode ? "Copied! ✓" : "Copy Sub-JSON"}
            </button>

            <button
              onClick={handleCopyScopedTs}
              style={{
                padding: "0.1rem 0.4rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                backgroundColor: copiedSubTs ? "#059669" : "#3178c6",
                color: "#ffffff",
                border: "1px solid #1e293b",
                borderRadius: "0.25rem",
                cursor: "pointer",
                zIndex: 10
              }}>
              {copiedSubTs ? "Types Copied! ✓" : "Get Sub-TS"}
            </button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div
          style={{
            borderLeft: "1px dashed rgba(51, 65, 85, 0.5)",
            marginLeft: "0.15rem"
          }}>
          {keys.map((key, index) => (
            <JSONNode
              key={index}
              nodeKey={isArray ? index : key}
              value={value[key]}
              path={currentPath}
              rememberCollapse={rememberCollapse}
              collapsedRegistry={collapsedRegistry}
              setCollapsedRegistry={setCollapsedRegistry}
            />
          ))}
          <div
            style={{
              paddingLeft: "1.25rem",
              color: "#cbd5e1",
              margin: "0.25rem 0",
              fontWeight: "600"
            }}>
            {bracketClose}
          </div>
        </div>
      )}
    </div>
  )
}
