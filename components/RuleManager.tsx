import React, { useState } from 'react';
import { VendorRule, TaxCategory } from '../types';
import { TAX_CATEGORIES_LIST } from '../constants';
import { Settings, Plus, Trash2, X, Download } from 'lucide-react';

interface RuleManagerProps {
  rules: VendorRule[];
  onAddRule: (pattern: string, category: TaxCategory) => void;
  onDeleteRule: (id: string) => void;
}

const RuleManager: React.FC<RuleManagerProps> = ({ rules, onAddRule, onDeleteRule }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newPattern, setNewPattern] = useState('');
  const [newCategory, setNewCategory] = useState<string>(TAX_CATEGORIES_LIST[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPattern && newCategory) {
      onAddRule(newPattern, newCategory as TaxCategory);
      setNewPattern('');
    }
  };

  const handleExportRules = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rules, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "taxease_rules.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors shadow-sm"
      >
        <Settings size={18} />
        <span className="hidden sm:inline">Automation Rules</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Vendor Automation Rules</h3>
                <p className="text-sm text-slate-500 mt-1">Automatically categorize invoices based on vendor name.</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-8 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">If Vendor Name Contains</label>
                    <input
                        type="text"
                        value={newPattern}
                        onChange={(e) => setNewPattern(e.target.value)}
                        placeholder="e.g. Bunnings"
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
                        required
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Set Category To</label>
                    <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white transition-shadow"
                    >
                        {TAX_CATEGORIES_LIST.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-end">
                    <button
                        type="submit"
                        className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium flex items-center justify-center gap-2 shadow-sm transition-colors"
                    >
                        <Plus size={18} />
                        Add Rule
                    </button>
                </div>
              </form>

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    Active Rules 
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{rules.length}</span>
                    </h4>
                    {rules.length > 0 && (
                        <button 
                            onClick={handleExportRules}
                            className="text-xs flex items-center gap-1 text-brand-600 hover:text-brand-700 font-medium"
                        >
                            <Download size={14} />
                            Export JSON
                        </button>
                    )}
                </div>

                {rules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <Settings size={48} className="mb-3 opacity-20" />
                        <p>No rules defined yet.</p>
                        <p className="text-sm opacity-60">Add a rule above or upload a JSON rules file.</p>
                    </div>
                ) : (
                    <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white shadow-sm overflow-hidden">
                        {rules.map(rule => (
                            <div key={rule.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-3 sm:gap-6">
                                    <div className="text-sm">
                                        <div className="text-slate-500 text-xs mb-1">If vendor contains</div>
                                        <div className="font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded inline-block">"{rule.vendorNamePattern}"</div>
                                    </div>
                                    <div className="text-slate-300 hidden sm:block">→</div>
                                    <div className="text-sm">
                                        <div className="text-slate-500 text-xs mb-1">Set category to</div>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100">
                                            {rule.taxCategory}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onDeleteRule(rule.id)}
                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    title="Delete Rule"
                                    aria-label="Delete Rule"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
                <button 
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors shadow-sm"
                >
                    Done
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RuleManager;