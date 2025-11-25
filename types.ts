export enum TaxCategory {
  ADVERTISING = "Advertising",
  CAR_TRUCK = "Car and Truck Expenses",
  COMMISSIONS = "Commissions and Fees",
  CONTRACT_LABOR = "Contract Labor",
  DEPLETION = "Depletion",
  DEPRECIATION = "Depreciation",
  INSURANCE = "Insurance (other than health)",
  INTEREST = "Interest",
  LEGAL_PROFESSIONAL = "Legal and Professional Services",
  OFFICE_EXPENSE = "Office Expense",
  PENSION_PROFIT = "Pension and Profit-Sharing Plans",
  RENT_LEASE_VEHICLES = "Rent/Lease (Vehicles/Equipment)",
  RENT_LEASE_PROPERTY = "Rent/Lease (Other Business Property)",
  REPAIRS_MAINTENANCE = "Repairs and Maintenance",
  SUPPLIES = "Supplies",
  TAXES_LICENSES = "Taxes and Licenses",
  TRAVEL = "Travel",
  MEALS = "Deductible Meals",
  UTILITIES = "Utilities",
  WAGES = "Wages",
  OTHER = "Other Expenses",
  UNCATEGORIZED = "Uncategorized"
}

export interface InvoiceData {
  id: string;
  filename: string;
  vendorName: string;
  invoiceDate: string;
  totalAmount: number;
  currency: string;
  description: string;
  taxCategory: TaxCategory;
  confidenceScore: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

export interface ProcessingStats {
  totalFiles: number;
  processed: number;
  successful: number;
  failed: number;
  totalValue: number;
}

export interface VendorRule {
  id: string;
  vendorNamePattern: string;
  taxCategory: TaxCategory;
}