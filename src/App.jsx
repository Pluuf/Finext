
import React, { useState } from "react";
import Papa from "papaparse";

const capabilityMap = [
  { category: "1 - Accounting", capabilities: ["Cost Accounting", "Enterprise Consolidation", "External Reporting", "Inventory Valuation", "Investor Relations", "Manage General Ledger", "Performance Reporting"] },
  { category: "2 - Asset Management", capabilities: ["Asset Performance Mgmt", "Decommissioning", "Investment Planning", "Manage Asset Lifecycle"] },
  { category: "3 - Financial Planning & Analysis", capabilities: ["Management Reporting", "Business Planning", "Cost Accounting", "Forecasting"] },
  { category: "4 - Payroll", capabilities: ["Manage Payment", "Process Taxes", "Time Stamp Report"] },
  { category: "5 - Settlements & Payments", capabilities: ["Account Payables", "Billing", "Revenue Cycle Management", "Travel & Expense Management"] },
  { category: "6 - Tax Management", capabilities: ["Handle Trading", "Manage Tax Questionnaire", "Tax Determination", "Tax Planning Strategies", "Tax Returns Mgmt.", "Tax Settlements"] },
  { category: "7 - Treasury", capabilities: ["Cash Management", "Financial Risk Management", "Foreign Exchange Management"] },
  { category: "8 - ESG", capabilities: ["Stakeholder Management", "KPI Target Setting", "ESG Data Collection", "Taxonomy Management"] },
  { category: "9 - Enterprise Risk Management", capabilities: ["Business Continuity", "Manage Compliance", "Manage Fraud", "Manage Insurance", "Manage Security"] }
];

const tagToSubCapabilityMap = {
  "Accounts Payable": "Account Payables",
  "Accounts Receivable": "Account Receivables",
  "Cashflow management": "Cash Management",
  "General Ledger": "Manage General Ledger",
  "Expense Management": "Travel & Expense Management",
  "Planning & Budgeting": "Business Planning",
  "Disclosure Management": "External Reporting",
  "Financial Close": "Performance Reporting",
  "Consolidation and reporting": "Enterprise Consolidation"
};

function App() {
  const [csvData, setCsvData] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);

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
    if (!coverageMap[capability]) return "red";
    if (coverageMap[capability].length > 1) return "orange";
    return "green";
  };

  const toolNames = [...new Set(csvData.map((row) => row.Name?.trim()).filter(Boolean))].sort();

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Finance Capability Dashboard</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {toolNames.length > 0 && (
        <div style={{ margin: "1rem 0" }}>
          {toolNames.map((tool) => (
            <label key={tool} style={{ display: "block" }}>
              <input
                type="checkbox"
                checked={selectedTools.includes(tool)}
                onChange={() => toggleTool(tool)}
              />
              {tool}
            </label>
          ))}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {capabilityMap.map((category) => (
          <div key={category.category}>
            <h3>{category.category}</h3>
            {category.capabilities.map((cap) => (
              <div key={cap} style={{ background: getColor(cap), padding: "4px", margin: "2px", color: "white" }}>
                {cap}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
