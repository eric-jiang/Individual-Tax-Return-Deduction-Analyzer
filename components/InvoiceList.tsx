import React, { useState, useEffect } from 'react';
import { InvoiceData, TaxCategory } from '../types';
import { TAX_CATEGORIES_LIST } from '../constants';
import { AlertCircle, Check, Clock, Pencil, Save, X, Layers } from 'lucide-react';

interface InvoiceListProps {
  invoices: InvoiceData[];
  onUpdateInvoice: (id: string, updates: Partial<InvoiceData>) => void;
  onBulkUpdateCategory: (ids: string[], category: TaxCategory) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, onUpdateInvoice, onBulkUpdateCategory }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ description: string; taxCategory: TaxCategory } | null>(null);
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState<string>("");

  // Clear selection if invoices change drastically (optional safety)
  useEffect(() => {
    // If we wanted to clear selection when list changes, we could do it here
    // keeping it simple for now.
  }, [invoices.length]);

  const handleEditClick = (inv: InvoiceData) => {
    setEditingId(inv.id);
    setEditForm({ description: inv.description, taxCategory: inv.taxCategory });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSave = (id: string) => {
    if (editForm) {
      onUpdateInvoice(id, editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  // Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === invoices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(invoices.map(i => i.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkApply = () => {
    if (bulkCategory && selectedIds.size > 0) {
      onBulkUpdateCategory(Array.from(selectedIds), bulkCategory as TaxCategory);
      setSelectedIds(new Set()); // Clear selection after apply
      setBulkCategory("");
    }
  };

  if (invoices.length === 0) return null;

  const isAllSelected = invoices.length > 0 && selectedIds.size === invoices.length;
  const isBulkMode = selectedIds.size > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-20">
      
      {/* Dynamic Header: Either Title or Bulk Actions */}
      <div className={`px-6 py-4 border-b transition-colors ${isBulkMode ? 'bg-brand-50 border-brand-100' : 'border-slate-100'}`}>
        {isBulkMode ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-brand-700 font-medium">
              <Check size={18} />
              <span>{selectedIds.size} selected</span>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="text-sm border-slate-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full sm:w-64 p-2 bg-white"
              >
                <option value="" disabled>Change Tax Category to...</option>
                {TAX_CATEGORIES_LIST.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                onClick={handleBulkApply}
                disabled={!bulkCategory}
                className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Apply
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg"
                title="Clear selection"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ) : (
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            Processed Invoices
          </h3>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-900 font-semibold uppercase text-xs">
            <tr>
              <th className="px-4 py-4 w-12 text-center">
                <input 
                  type="checkbox" 
                  checked={isAllSelected} 
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="px-4 py-4 w-12">Status</th>
              <th className="px-4 py-4 max-w-[150px]">File Name</th>
              <th className="px-4 py-4">Date</th>
              <th className="px-4 py-4">Vendor</th>
              <th className="px-4 py-4 max-w-[200px]">Description</th>
              <th className="px-4 py-4 min-w-[180px]">Category</th>
              <th className="px-4 py-4 text-right">Amount</th>
              <th className="px-4 py-4 w-20 text-center">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv) => {
              const isEditing = editingId === inv.id;
              const isSelected = selectedIds.has(inv.id);

              return (
                <tr key={inv.id} className={`transition-colors ${isSelected ? 'bg-brand-50/30' : 'hover:bg-slate-50'}`}>
                   <td className="px-4 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => toggleSelectOne(inv.id)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-4">
                    {inv.status === 'processing' && <Clock size={16} className="text-blue-500 animate-pulse" />}
                    {inv.status === 'completed' && <Check size={16} className="text-green-500" />}
                    {inv.status === 'error' && (
                      <div className="group relative">
                        <AlertCircle size={16} className="text-red-500 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-10">
                          {inv.errorMessage || "Unknown error"}
                        </div>
                      </div>
                    )}
                    {inv.status === 'pending' && <span className="w-4 h-4 block rounded-full bg-slate-200" />}
                  </td>
                  
                  <td className="px-4 py-4 font-medium text-slate-900 truncate max-w-[150px]" title={inv.filename}>
                    {inv.filename}
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap">{inv.invoiceDate || "-"}</td>
                  
                  <td className="px-4 py-4 truncate max-w-[150px]" title={inv.vendorName}>{inv.vendorName || "-"}</td>

                  <td className="px-4 py-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm?.description || ''}
                        onChange={(e) => setEditForm(prev => prev ? { ...prev, description: e.target.value } : null)}
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:border-brand-500 focus:outline-none"
                      />
                    ) : (
                      <div className="truncate max-w-[200px]" title={inv.description}>
                        {inv.description || "-"}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {isEditing ? (
                      <select
                        value={editForm?.taxCategory}
                        onChange={(e) => setEditForm(prev => prev ? { ...prev, taxCategory: e.target.value as TaxCategory } : null)}
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:border-brand-500 focus:outline-none"
                      >
                        {TAX_CATEGORIES_LIST.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      inv.taxCategory !== "Uncategorized" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-brand-50 text-brand-700 whitespace-nowrap">
                          {inv.taxCategory}
                        </span>
                      )
                    )}
                  </td>
                  
                  <td className="px-4 py-4 text-right font-semibold whitespace-nowrap">
                    {inv.status === 'completed' ? `${inv.currency} ${inv.totalAmount.toFixed(2)}` : '-'}
                  </td>

                  <td className="px-4 py-4 text-center">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleSave(inv.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Save"
                        >
                          <Save size={16} />
                        </button>
                        <button 
                          onClick={handleCancel}
                          className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      inv.status === 'completed' && (
                        <button 
                          onClick={() => handleEditClick(inv)}
                          className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                      )
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceList;