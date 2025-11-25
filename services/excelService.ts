import * as XLSX from 'xlsx';
import { InvoiceData } from "../types";

export const generateExcelSummary = (invoices: InvoiceData[]) => {
  // 1. Create a detailed rows array
  const detailedRows = invoices
    .filter(inv => inv.status === 'completed')
    .map(inv => ({
      "Date": inv.invoiceDate,
      "Vendor": inv.vendorName,
      "Description": inv.description,
      "Tax Category": inv.taxCategory,
      "Amount": inv.totalAmount,
      "Currency": inv.currency,
      "Confidence": `${inv.confidenceScore}%`,
      "File Name": inv.filename
    }));

  // 2. Create a summary by category
  const categorySummary: Record<string, number> = {};
  invoices.forEach(inv => {
    if (inv.status === 'completed') {
        const cat = inv.taxCategory;
        categorySummary[cat] = (categorySummary[cat] || 0) + inv.totalAmount;
    }
  });

  const summaryRows = Object.entries(categorySummary).map(([category, total]) => ({
    "Tax Deduction Category": category,
    "Total Deductible Amount": total
  }));

  // 3. Create Workbook
  const wb = XLSX.utils.book_new();

  // 4. Add Summary Sheet
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Tax Summary");

  // 5. Add Detailed Sheet
  const wsDetail = XLSX.utils.json_to_sheet(detailedRows);
  XLSX.utils.book_append_sheet(wb, wsDetail, "Itemized Invoices");

  // 6. Write file
  XLSX.writeFile(wb, "Tax_Return_Summary.xlsx");
};
