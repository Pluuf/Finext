import React, { useState } from "react";
import Papa from "papaparse";

const capabilityMap = [
  {
    category: "5 - Settlements & Payments",
    capabilities: [
      "5.1 Account Payables",
      "5.2 Billing",
      "5.3 Revenue Cycle Management",
      "5.4 Travel & Expense Management",
    ],
  },
  {
    category: "1 - Accounting",
    capabilities: [
      "1.1 Cost Accounting",
      "1.2 Enterprise Consolidation",
      "1.3 External Reporting",
      "1.4 Inventory Valuation",
      "1.5 Investor Relations",
      "1.6 Manage General Ledger",
      "1.7 Performance Reporting",
    ],
  },
  {
    category: "3 - Financial Planning & Analysis",
    capabilities: [
      "3.1 Management Reporting",
      "3.2 Business Planning",
      "3.3 Cost Accounting",
      "3.4 Forecasting",
    ],
  },
  // voeg andere capabilities hier toe met juiste nummering
];

const tagToSubCapabilityMap = {
  "Accounts Payable": "5.1 Account Payables",
  "Billing": "5.2 Billing",
  "Revenue Cycle Management": "5.3 Revenue Cycle Management",
  "Expense Management": "5.4 Travel & Expense Management",
  "Cost Accounting": "1.1 Cost Accounting",
  "Enterprise Consolidation": "1.2 Enterprise Consolidation",
  "External Reporting": "1.3 External Reporting",
  "Inventory Valuation": "1.4 Inventory Valuation",
  "Investor Relations": "1.5 Investor Relations",
  "General Ledger": "1.6 Manage General Ledger",
  "Performance Reporting": "1.7 Performance Reporting",
  "Planning & Budgeting": "3.2 Business Planning",
  "Financial Close": "1.7 Performance Reporting",
};

export default function App() {
  const [csvData, setCsvData] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [activeOverlay, setActiveOverlay] = useState(null); // voor klikken op capabilities

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
    return entry.Tags.split(",")
      .map((tag) => tag.trim())
      .map((tag) => tagToSubCapabilityMap[tag])
      .filter(Boolean);
  };

  const getCoverage = () => {
    const coverage = {};
    selectedTools.forEach((tool) => {
      getMappedCapabilitiesForTool(tool).forEach((cap) => {
        if (!coverage[cap]) coverage[cap] = [];
        coverage[cap].push(tool);
      });
    });
    return coverage;
  };

  const coverageMap = getCoverage();

  const getColor = (capability) => {
    if (!coverageMap[capability]) return "bg-red-100";
    if (coverageMap[capability].length > 1) return "bg-orange-200";
    return "bg-green-200";
  };

  const toolNames = [...new Set(csvData.map((row) => row.Name?.trim()).filter(Boolean))].sort();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Finance Capability Dashboard</h1>

      <input type="file" accept=".csv" onChange={handleFileUpload} />

      <div className="relative mt-6">
        <img
          src="/finance%20capability%20map.png"
          alt="Finance Capability Map"
          className="w-full h-auto"
        />

        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="grid grid-cols-3 grid-rows-3 gap-4 p-8">
            {capabilityMap.map((category) => (
              <div key={category.category} className="space-y-1">
                <div className="font-bold text-white shadow-md">
                  {category.category}
                </div>
                {category.capabilities.map((cap) => (
                  <div
                    key={cap}
                    className={`text-sm p-1 rounded shadow cursor-pointer ${getColor(cap)} pointer-events-auto`}
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
                      <div className="text-xs mt-1 text-gray-800">
                        Dubbele dekking: {coverageMap[cap].join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {toolNames.length > 0 && (
        <div>
          <h2 className="font-semibold mt-6">Selecteer tools:</h2>
          <div className="border rounded p-2 w-full max-w-xl max-h-64 overflow-y-auto bg-white shadow mt-2 space-y-1">
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
                className="bg-gray-200 px-2 py-1 rounded"
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
