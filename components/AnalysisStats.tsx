import React, { useMemo } from 'react';
import { InvoiceData, ProcessingStats } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Loader2, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react';

interface AnalysisStatsProps {
  invoices: InvoiceData[];
  stats: ProcessingStats;
  isProcessing: boolean;
}

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

const AnalysisStats: React.FC<AnalysisStatsProps> = ({ invoices, stats, isProcessing }) => {

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    invoices.forEach(inv => {
      if (inv.status === 'completed') {
        categories[inv.taxCategory] = (categories[inv.taxCategory] || 0) + inv.totalAmount;
      }
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort highest spend first
  }, [invoices]);

  const progressPercentage = stats.totalFiles > 0 
    ? Math.round((stats.processed / stats.totalFiles) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Overview Cards */}
      <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            {isProcessing ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Status</p>
            <p className="text-lg font-bold text-slate-800">
                {isProcessing ? `Processing ${progressPercentage}%` : 'Ready'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <DollarSign />
          </div>
           <div>
            <p className="text-sm text-slate-500 font-medium">Total Deductible</p>
            <p className="text-lg font-bold text-slate-800">${stats.totalValue.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
            <CheckCircle2 />
          </div>
           <div>
            <p className="text-sm text-slate-500 font-medium">Successful</p>
            <p className="text-lg font-bold text-slate-800">{stats.successful} / {stats.totalFiles}</p>
          </div>
        </div>

         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertCircle />
          </div>
           <div>
            <p className="text-sm text-slate-500 font-medium">Failed</p>
            <p className="text-lg font-bold text-slate-800">{stats.failed}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar if processing */}
      {isProcessing && (
        <div className="col-span-1 lg:col-span-3">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-brand-500 transition-all duration-300 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>
        </div>
      )}

      {/* Charts */}
      {categoryData.length > 0 && (
        <>
            {/* Pie Chart: Distribution */}
            <div className="col-span-1 lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[350px]">
                <h3 className="text-slate-800 font-semibold mb-4">Spend by Category</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} layout="vertical" align="right" verticalAlign="middle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Bar Chart: Magnitude */}
            <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[350px]">
                <h3 className="text-slate-800 font-semibold mb-4">Top Deductions</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={categoryData.slice(0, 8)} // Show top 8
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 11}} />
                        <Tooltip 
                             cursor={{fill: 'transparent'}}
                             formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </>
      )}
    </div>
  );
};

export default AnalysisStats;
