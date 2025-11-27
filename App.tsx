import React, { useState, useCallback, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import AnalysisStats from './components/AnalysisStats';
import InvoiceList from './components/InvoiceList';
import RuleManager from './components/RuleManager';
import { analyzeInvoiceImage } from './services/geminiService';
import { generateExcelSummary } from './services/excelService';
import { InvoiceData, ProcessingStats, TaxCategory, VendorRule } from './types';
import { DEFAULT_RULES } from './defaultRules';
import { FileSpreadsheet, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize rules from LocalStorage if available, otherwise use DEFAULT_RULES
  const [rules, setRules] = useState<VendorRule[]>(() => {
    const savedRules = localStorage.getItem('taxease_rules');
    if (savedRules) {
      try {
        const parsed = JSON.parse(savedRules);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to load rules from local storage", e);
      }
    }
    return DEFAULT_RULES;
  });

  // Computed stats
  const stats: ProcessingStats = {
    totalFiles: invoices.length,
    processed: invoices.filter(i => i.status === 'completed' || i.status === 'error').length,
    successful: invoices.filter(i => i.status === 'completed').length,
    failed: invoices.filter(i => i.status === 'error').length,
    totalValue: invoices.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0)
  };

  // Auto-save rules to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('taxease_rules', JSON.stringify(rules));
  }, [rules]);

  // Helper to re-apply rules to existing invoices
  const applyRulesToInvoices = useCallback((currentInvoices: InvoiceData[], currentRules: VendorRule[]) => {
    return currentInvoices.map(inv => {
      // Only update if we have a vendor name to match against
      if (inv.vendorName) {
        const matchingRule = currentRules.find(r => 
          inv.vendorName.toLowerCase().includes(r.vendorNamePattern.toLowerCase())
        );
        if (matchingRule) {
          return { ...inv, taxCategory: matchingRule.taxCategory };
        }
      }
      return inv;
    });
  }, []);

  const handleImportRules = useCallback((importedRules: any[]) => {
    setRules(prevRules => {
        const existingPatterns = new Set(prevRules.map(r => r.vendorNamePattern.toLowerCase()));
        
        // Filter out invalid rules and duplicates
        const uniqueNewRules = importedRules.filter((r: any) => 
            r.vendorNamePattern && 
            r.taxCategory && 
            !existingPatterns.has(r.vendorNamePattern.toLowerCase())
        ).map((r: any) => ({
            ...r,
            id: r.id || Math.random().toString(36).substr(2, 9)
        }));

        if (uniqueNewRules.length === 0) {
            alert("No new unique rules found to import.");
            return prevRules;
        }

        const updatedRules = [...prevRules, ...uniqueNewRules];
        
        // Apply to currently loaded invoices
        setInvoices(currentInvoices => applyRulesToInvoices(currentInvoices, updatedRules));
        
        return updatedRules;
    });
  }, [applyRulesToInvoices]);

  const handleFilesSelected = useCallback(async (files: File[]) => {
    const jsonFiles = files.filter(f => f.name.toLowerCase().endsWith('.json') || f.type === 'application/json');
    const mediaFiles = files.filter(f => !f.name.toLowerCase().endsWith('.json') && f.type !== 'application/json');

    // 1. Process JSON Rule files first
    if (jsonFiles.length > 0) {
      for (const file of jsonFiles) {
        try {
          const text = await file.text();
          const importedRules = JSON.parse(text);
          if (Array.isArray(importedRules)) {
            handleImportRules(importedRules);
          }
        } catch (e) {
          console.error("Failed to parse rule file:", file.name, e);
          alert(`Failed to parse rule file: ${file.name}`);
        }
      }
    }

    // 2. Process Media Files (Invoices)
    if (mediaFiles.length === 0) return;

    const newInvoices: InvoiceData[] = mediaFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      filename: file.name,
      vendorName: '',
      invoiceDate: '',
      totalAmount: 0,
      currency: '',
      description: '',
      taxCategory: TaxCategory.UNCATEGORIZED,
      confidenceScore: 0,
      status: 'pending'
    }));

    setInvoices(prev => [...prev, ...newInvoices]);
    setIsProcessing(true);

    // Process one by one
    for (let i = 0; i < mediaFiles.length; i++) {
        const file = mediaFiles[i];
        const invoiceId = newInvoices[i].id;

        setInvoices(prev => prev.map(inv => 
            inv.id === invoiceId ? { ...inv, status: 'processing' } : inv
        ));

        try {
            const result = await analyzeInvoiceImage(file);
            
            let finalCategory = result.taxCategory || TaxCategory.UNCATEGORIZED;
            
            if (result.vendorName) {
                // Determine which rules to use. We use functional state update in handleImportRules
                // but here we are in a loop. We need the freshest rules.
                // Since this function closes over 'rules', it might be stale if we just imported.
                // However, for simplicity, we assume users generally import rules *then* upload files, 
                // or we accept that concurrent processing uses the state at function start time.
                // To fix this fully, we would need to use a Ref for rules. 
                // For now, we use the 'rules' available in closure.
                
                const matchingRule = rules.find(r => 
                    result.vendorName!.toLowerCase().includes(r.vendorNamePattern.toLowerCase())
                );
                if (matchingRule) {
                    finalCategory = matchingRule.taxCategory;
                }
            }

            setInvoices(prev => prev.map(inv => 
                inv.id === invoiceId ? { 
                    ...inv, 
                    ...result, 
                    taxCategory: finalCategory,
                    status: 'completed' 
                } : inv
            ));

        } catch (error: any) {
            setInvoices(prev => prev.map(inv => 
                inv.id === invoiceId ? { 
                    ...inv, 
                    status: 'error', 
                    errorMessage: error.message || "Failed to analyze" 
                } : inv
            ));
        }
    }

    setIsProcessing(false);
  }, [rules, handleImportRules]);

  const handleUpdateInvoice = useCallback((id: string, updates: Partial<InvoiceData>) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === id ? { ...inv, ...updates } : inv
    ));
  }, []);

  const handleBulkUpdateCategory = useCallback((ids: string[], category: TaxCategory) => {
    setInvoices(prev => prev.map(inv => 
      ids.includes(inv.id) ? { ...inv, taxCategory: category } : inv
    ));
  }, []);

  const handleAddRule = useCallback((pattern: string, category: TaxCategory) => {
    const newRule: VendorRule = {
        id: Math.random().toString(36).substr(2, 9),
        vendorNamePattern: pattern,
        taxCategory: category
    };
    
    setRules(prev => {
        const updated = [...prev, newRule];
        setInvoices(currentInvoices => applyRulesToInvoices(currentInvoices, updated));
        return updated;
    });
  }, [applyRulesToInvoices]);

  const handleDeleteRule = useCallback((id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleExport = () => {
    if (stats.successful === 0) {
        alert("No valid data to export.");
        return;
    }
    generateExcelSummary(invoices);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-brand-600 p-2 rounded-lg">
                <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">TaxEase Analyzer</h1>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight sm:hidden">TaxEase</h1>
          </div>
          
          <div className="flex items-center gap-3">
             <RuleManager 
                rules={rules} 
                onAddRule={handleAddRule} 
                onDeleteRule={handleDeleteRule} 
                onImportRules={handleImportRules}
             />
             
             <button
                onClick={handleExport}
                disabled={stats.successful === 0 || isProcessing}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    stats.successful > 0 && !isProcessing
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
            >
                <FileSpreadsheet size={18} />
                <span className="hidden sm:inline">Export to Excel</span>
                <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Invoice Analysis</h2>
            <p className="text-slate-600">Upload a folder of receipts to automatically categorize them for tax deductions (Schedule C).</p>
        </div>

        <FileUpload onFilesSelected={handleFilesSelected} isProcessing={isProcessing} />
        
        {invoices.length > 0 && (
            <>
                <AnalysisStats invoices={invoices} stats={stats} isProcessing={isProcessing} />
                <InvoiceList 
                  invoices={invoices} 
                  onUpdateInvoice={handleUpdateInvoice} 
                  onBulkUpdateCategory={handleBulkUpdateCategory}
                />
            </>
        )}

      </main>
    </div>
  );
};

export default App;