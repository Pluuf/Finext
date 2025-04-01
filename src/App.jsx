import React, { useState } from "react";
import Papa from "papaparse";

const capabilityMap = [
  { category: "1 - Accounting", capabilities: [
    "1.1 Cost Accounting", "1.2 Enterprise Consolidation", "1.3 External Reporting",
    "1.4 Inventory Valuation", "1.5 Investor Relations", "1.6 Manage General Ledger",
    "1.7 Performance Reporting"
  ]},
  { category: "2 - Asset Management", capabilities: [
    "2.1 Asset Performance Mgmt", "2.2 Decommissioning", "2.3 Investment Planning",
    "2.4 Manage Asset Lifecycle"
  ]},
  { category: "3 - Financial Planning & Analysis", capabilities: [
    "3.1 Management Reporting", "3.2 Business Planning", "3.3 Cost Accounting", "3.4 Forecasting"
  ]},
  { category: "4 - Payroll", capabilities: [
    "4.1 Manage Payment", "4.2 Process Taxes", "4.3 Time Stamp Report"
  ]},
  { category: "5 - Settlements & Payments", capabilities: [
    "5.1 Account Payables", "5.2 Billing", "5.3 Revenue Cycle Management", "5.4 Travel & Expense Management"
  ]},
  { category: "6 - Tax Management", capabilities: [
    "6.1 Handle Trading", "6.2 Manage Tax Questionnaire", "6.3 Tax Determination",
    "6.4 Tax Planning Strategies", "6.5 Tax Returns Mgmt.", "6.6 Tax Settlements"
  ]},
  { category: "7 - Treasury", capabilities: [
    "7.1 Cash Management", "7.2 Financial Risk Management", "7.3 Foreign Exchange Management"
  ]},
  { category: "8 - ESG", capabilities: [
    "8.1 Stakeholder Management", "8.2 KPI Target Setting", "8.3 ESG Data Collection", "8.4 Taxonomy Management"
  ]},
  { category: "9 - Enterprise Risk Management", capabilities: [
    "9.1 Business Continuity", "9.2 Manage Compliance", "9.3 Manage Fraud",
    "9.4 Manage Insurance", "9.5 Manage Security"
  ]},
];

export default function App() {
  const [csvData, setCsvData] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [activeOverlay, setActiveOverlay] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleaned = results.data
          .filter((row) => row.Name && row.Name.trim() !== "")
          .map((row) => ({ ...row, Name: row.Name.trim() }));
        setCsvData(cleaned);
      },
    });
  };

  const toggleTool = (tool) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const getMappedCapabilitiesForTool = (toolName) => {
    const entry = csvData.find((row) => row.Name === toolName);
    if (!entry || !entry.Tags) return [];
    return entry.Tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  };

  const getCoverage = () => {
    const coverage = {};
    selectedTools.forEach((tool) => {
      getMappedCapabilitiesForTool(tool).forEach((cap) => {
        const normalized = cap.trim();
        if (!coverage[normalized]) coverage[normalized] = [];
        coverage[normalized].push(tool);
      });
    });
    return coverage;
  };

  const coverageMap = getCoverage();

  const getColor = (capability) => {
    if (!coverageMap[capability]) return "bg-red-100";
    if (coverageMap[capability].length > 1) return "bg-orange-300";
    return "bg-green-300";
  };

  const toolNames = [...new Set(csvData.map((row) => row.Name?.trim()).filter(Boolean))].sort();

  return (
    <div
      className="p-6 min-h-screen"
      style={{
        backgroundColor: "#0066CC",
        fontFamily: "'Inter', 'Open Sans', sans-serif",
        color: "white"
      }}
    >
      <h1 className="text-3xl font-bold mb-4">Finance Capability Dashboard</h1>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="mb-6 text-black"
      />

      <div className="grid grid-cols-3 gap-6">
        {capabilityMap.map((category) => (
          <div key={category.category} className="bg-white/10 p-3 rounded shadow space-y-1">
            <div
              className="text-white font-semibold px-2 py-1 rounded"
              style={{ backgroundColor: "#00C3C8" }}
            >
              {category.category}
            </div>
            {category.capabilities.map((cap) => (
              <div
                key={cap}
                className={`text-sm p-1 rounded shadow cursor-pointer ${getColor(cap)} text-black`}
                title={
                  coverageMap[cap]?.length > 1
                    ? `Dubbele dekking: ${coverageMap[cap].join(", ")}`
                    : coverageMap[cap]?.[0] || "Niet gedekt"
                }
                onClick={() =>
                  setActiveOverlay((prev) => (prev === cap ? null : cap))
                }
              >
                {cap}
                {activeOverlay === cap && coverageMap[cap]?.length > 1 && (
                  <div className="text-xs mt-1 text-gray-800 bg-white rounded p-1 shadow pointer-events-auto">
                    Dubbele dekking: {coverageMap[cap].join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {toolNames.length > 0 && (
        <div className="mt-10">
          <h2 className="font-semibold text-white mb-2">Selecteer tools:</h2>
          <div className="border rounded p-2 w-full max-w-xl max-h-64 overflow-y-auto bg-white shadow space-y-1 text-black">
            {toolNames.map((tool) => (
              <label key={tool} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTools.includes(tool)}
                  onChange={() => toggleTool(tool)}
                />
                <span>{tool}</span>
              </label>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {selectedTools.map((tool) => (
              <button
                key={tool}
                onClick={() => toggleTool(tool)}
                className="bg-gray-200 px-2 py-1 rounded text-black"
              >
                {tool} ✕
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
