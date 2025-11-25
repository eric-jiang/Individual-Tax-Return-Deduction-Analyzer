import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import AnalysisStats from './components/AnalysisStats';
import InvoiceList from './components/InvoiceList';
import { analyzeInvoiceImage } from './services/geminiService';
import { generateExcelSummary } from './services/excelService';
import { InvoiceData, ProcessingStats, TaxCategory } from './types';
import { FileSpreadsheet, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Computed stats
  const stats: ProcessingStats = {
    totalFiles: invoices.length,
    processed: invoices.filter(i => i.status === 'completed' || i.status === 'error').length,
    successful: invoices.filter(i => i.status === 'completed').length,
    failed: invoices.filter(i => i.status === 'error').length,
    totalValue: invoices.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0)
  };

  const handleFilesSelected = useCallback(async (files: File[]) => {
    // 1. Initialize queue
    const newInvoices: InvoiceData[] = files.map(file => ({
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

    // 2. Process strictly one by one to respect rate limits and browser resources
    // For a real production app, we would implement a concurrent queue (e.g., p-limit)
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const invoiceId = newInvoices[i].id;

        // Update status to processing
        setInvoices(prev => prev.map(inv => 
            inv.id === invoiceId ? { ...inv, status: 'processing' } : inv
        ));

        try {
            const result = await analyzeInvoiceImage(file);
            
            // Update with result
            setInvoices(prev => prev.map(inv => 
                inv.id === invoiceId ? { 
                    ...inv, 
                    ...result, 
                    status: 'completed' 
                } : inv
            ));

        } catch (error: any) {
            // Update with error
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
  }, []);

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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 p-2 rounded-lg">
                <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">TaxEase Analyzer</h1>
          </div>
          
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
            Export to Excel
          </button>
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