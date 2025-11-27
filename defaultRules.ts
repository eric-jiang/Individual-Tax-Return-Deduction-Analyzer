import { VendorRule, TaxCategory } from './types';

export const DEFAULT_RULES: VendorRule[] = [
  { id: 'def-1', vendorNamePattern: 'Bunnings', taxCategory: TaxCategory.REPAIRS_MAINTENANCE },
  { id: 'def-2', vendorNamePattern: 'Officeworks', taxCategory: TaxCategory.OFFICE_EXPENSE },
  { id: 'def-3', vendorNamePattern: 'Uber', taxCategory: TaxCategory.TRAVEL },
  { id: 'def-4', vendorNamePattern: 'Chevron', taxCategory: TaxCategory.CAR_TRUCK },
  { id: 'def-5', vendorNamePattern: 'Shell', taxCategory: TaxCategory.CAR_TRUCK },
  { id: 'def-6', vendorNamePattern: 'Caltex', taxCategory: TaxCategory.CAR_TRUCK },
  { id: 'def-7', vendorNamePattern: 'Woolworths', taxCategory: TaxCategory.SUPPLIES },
  { id: 'def-8', vendorNamePattern: 'Coles', taxCategory: TaxCategory.SUPPLIES },
  { id: 'def-9', vendorNamePattern: 'Adobe', taxCategory: TaxCategory.OFFICE_EXPENSE },
  { id: 'def-10', vendorNamePattern: 'Zoom', taxCategory: TaxCategory.OFFICE_EXPENSE },
  { id: 'def-11', vendorNamePattern: 'Telstra', taxCategory: TaxCategory.UTILITIES },
  { id: 'def-12', vendorNamePattern: 'Optus', taxCategory: TaxCategory.UTILITIES },
  { id: 'def-13', vendorNamePattern: 'Amazon', taxCategory: TaxCategory.SUPPLIES },
  { id: 'def-14', vendorNamePattern: 'Apple', taxCategory: TaxCategory.OFFICE_EXPENSE },
  { id: 'def-15', vendorNamePattern: 'Google', taxCategory: TaxCategory.ADVERTISING },
  { id: 'def-16', vendorNamePattern: 'Facebook', taxCategory: TaxCategory.ADVERTISING },
  { id: 'def-17', vendorNamePattern: 'LinkedIn', taxCategory: TaxCategory.ADVERTISING },
  { id: 'def-18', vendorNamePattern: 'Xero', taxCategory: TaxCategory.LEGAL_PROFESSIONAL },
  { id: 'def-19', vendorNamePattern: 'Quickbooks', taxCategory: TaxCategory.LEGAL_PROFESSIONAL },
  { id: 'def-20', vendorNamePattern: 'Upwork', taxCategory: TaxCategory.CONTRACT_LABOR }
];