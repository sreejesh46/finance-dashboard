import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, Wallet, Loader2, Link, BarChart, PieChart, ReceiptText } from 'lucide-react';
import { toast } from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [timeFilter, setTimeFilter] = useState('7_days');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        let dateQuery = '';
        if (timeFilter !== 'all_time') {
           const days = timeFilter === '7_days' ? 7 : 30;
           const d = new Date();
           d.setDate(d.getDate() - days);
           dateQuery = `?startDate=${d.toISOString()}`;
        }

        // Fetch analytics
        const analyticsRes = await axios.get(`/records/analytics${dateQuery}`);
        setData(analyticsRes.data);

        if (user?.role !== 'Viewer') {
          // Fetch recent records for roles with record access
          const recordsQuery = dateQuery ? `&startDate=${dateQuery.split('=')[1]}` : '';
          const recordsRes = await axios.get(`/records?limit=6${recordsQuery}`);
          setRecentRecords(recordsRes.data.records);
        } else {
          setRecentRecords([]);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, timeFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
         <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="w-10 h-10 border-4 border-cyan-200 border-b-cyan-500 rounded-full animate-spin absolute top-3 left-3"></div>
         </div>
      </div>
    );
  }

  const { totalIncome = 0, totalExpense = 0, netBalance = 0, categoryBreakdown, monthlyTrends } = data || {};

  // Formatter
  const formatCur = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num || 0);

  // Chart Data prep
  const months = monthlyTrends ? Object.keys(monthlyTrends) : [];
  const incomeTrend = months.map(m => monthlyTrends[m].income);
  const expenseTrend = months.map(m => monthlyTrends[m].expense);

  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: 'Income (₹)',
        data: incomeTrend,
        borderColor: '#6366f1', // indigo-500
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#6366f1',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Expense (₹)',
        data: expenseTrend,
        borderColor: '#f43f5e', // rose-500
        backgroundColor: 'rgba(244, 63, 94, 0.05)',
        borderWidth: 3,
        borderDash: [5, 5],
        pointBackgroundColor: '#fff',
        pointBorderColor: '#f43f5e',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      }
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { usePointStyle: true, boxWidth: 6, padding: 20, font: { family: "'Inter', sans-serif", weight: '500' } }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { size: 13, family: "'Inter', sans-serif" },
        bodyFont: { size: 14, weight: 'bold', family: "'Inter', sans-serif" },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: "'Inter', sans-serif", color: '#64748b' } } },
      y: { grid: { color: '#f1f5f9', drawBorder: false }, ticks: { font: { family: "'Inter', sans-serif", color: '#64748b' }, beginAtZero: true } }
    }
  };

  const categories = categoryBreakdown ? Object.keys(categoryBreakdown) : [];
  const categoryValues = categories.map(c => categoryBreakdown[c]);
  const pieColors = ['#6366f1', '#0ea5e9', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981'];

  const doughnutData = {
    labels: categories,
    datasets: [{
      data: categoryValues,
      backgroundColor: pieColors,
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverOffset: 4,
      cutout: '70%',
    }]
  };

  // Decorative Empty State Placeholder
  const EmptyChartPlaceholder = ({ icon: Icon, text }) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
        <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center text-slate-300 mb-3">
            <Icon className="w-8 h-8" strokeWidth={1.5} />
        </div>
        <p className="text-slate-500 font-medium text-sm">{text}</p>
        <p className="text-slate-400 text-xs mt-1">Add some records to visualize</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both pb-20 min-w-0">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 relative z-10">
         <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500">
               Financial Overview
            </h1>
            <p className="text-slate-500 font-medium mt-1">Here's your comprehensive financial summary for today.</p>
         </div>
         {user?.role !== 'Viewer' && (
             <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                 <button onClick={() => setTimeFilter('7_days')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${timeFilter === '7_days' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>7 Days</button>
                 <button onClick={() => setTimeFilter('30_days')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${timeFilter === '30_days' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>30 Days</button>
                 <button onClick={() => setTimeFilter('all_time')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${timeFilter === 'all_time' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>All Time</button>
             </div>
         )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 min-w-0">
        
        {/* Net Balance Card */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)] transition-all duration-300">
            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative flex items-center justify-between z-10">
                <div>
                   <p className="text-sm font-bold tracking-wide text-slate-400 uppercase">Net Balance</p>
                   <h3 className="text-4xl font-black text-slate-900 mt-2 tracking-tight drop-shadow-sm">{formatCur(netBalance)}</h3>
                   <div className="flex items-center gap-1.5 mt-3 text-sm font-medium">
                       <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" /> +14.2%
                       </span>
                       <span className="text-slate-400">vs last month</span>
                   </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex justify-center items-center shadow-lg shadow-indigo-500/30 text-white">
                   <Wallet className="w-7 h-7" />
                </div>
            </div>
        </div>

        {/* Total Income Card */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(16,185,129,0.1)] transition-all duration-300">
            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative flex items-center justify-between z-10">
                <div>
                   <p className="text-sm font-bold tracking-wide text-slate-400 uppercase">Total Income</p>
                   <h3 className="text-4xl font-black text-slate-900 mt-2 tracking-tight drop-shadow-sm">{formatCur(totalIncome)}</h3>
                   <div className="flex items-center gap-1.5 mt-3 text-sm font-medium">
                       <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" /> +8.1%
                       </span>
                       <span className="text-slate-400">vs last month</span>
                   </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex justify-center items-center shadow-lg shadow-emerald-500/30 text-white">
                   <TrendingUp className="w-7 h-7" />
                </div>
            </div>
        </div>

        {/* Total Expense Card */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(244,63,94,0.1)] transition-all duration-300">
            <div className="absolute right-0 top-0 w-32 h-32 bg-rose-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative flex items-center justify-between z-10">
                <div>
                   <p className="text-sm font-bold tracking-wide text-slate-400 uppercase">Total Expenses</p>
                   <h3 className="text-4xl font-black text-slate-900 mt-2 tracking-tight drop-shadow-sm">{formatCur(totalExpense)}</h3>
                   <div className="flex items-center gap-1.5 mt-3 text-sm font-medium">
                       <span className="text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" /> -2.4%
                       </span>
                       <span className="text-slate-400">vs last month</span>
                   </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex justify-center items-center shadow-lg shadow-rose-500/30 text-white">
                   <TrendingDown className="w-7 h-7" />
                </div>
            </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 min-w-0">
         
         {/* Cash Flow Line Chart */}
         <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 col-span-2 flex flex-col min-h-[400px] min-w-0">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Cash Flow Trends</h2>
            </div>
            <div className="relative flex-1 w-full h-full min-w-0">
               {months.length > 0 ? (
                  <Line data={lineChartData} options={commonOptions} />
               ) : (
                  <EmptyChartPlaceholder icon={BarChart} text="No Cash Flow Data" />
               )}
            </div>
         </div>

         {/* Category Breakdown Doughnut Chart */}
         <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 col-span-1 flex flex-col min-h-[400px] min-w-0">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Spending by Category</h2>
            </div>
            <div className="relative flex-1 flex justify-center items-center w-full h-full min-w-0">
               {categories.length > 0 ? (
                 <div className="absolute inset-0 pb-4">
                   <Doughnut data={doughnutData} options={{...commonOptions, cutOut: '75%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }}} />
                 </div>
               ) : (
                 <EmptyChartPlaceholder icon={PieChart} text="No Spending Data" />
               )}
            </div>
         </div>
      </div>

      {/* Modern Transaction Ledger */}
      {user?.role !== 'Viewer' && (
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative z-10">
         <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xl font-bold text-slate-900">Recent Transactions</h3>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">View All →</button>
         </div>
         
         {recentRecords.length === 0 ? (
             <div className="p-12 text-center flex flex-col justify-center items-center">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex justify-center items-center border border-slate-100 mb-4">
                     <ReceiptText className="w-6 h-6 text-slate-300" strokeWidth={1} />
                 </div>
                 <p className="text-slate-500 font-medium">No transactions recorded yet.</p>
             </div>
         ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                            <th className="px-8 py-4">Transaction</th>
                            <th className="px-8 py-4">Date</th>
                            <th className="px-8 py-4">Notes</th>
                            <th className="px-8 py-4 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {recentRecords.map((record) => (
                          <tr key={record._id} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                             <td className="px-8 py-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                                        record.type === 'income' 
                                          ? 'bg-gradient-to-br from-emerald-100 to-green-50 text-emerald-600 border border-emerald-100' 
                                          : 'bg-gradient-to-br from-rose-100 to-pink-50 text-rose-600 border border-rose-100'
                                    }`}>
                                        {record.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5"/>}
                                    </div>
                                    <span className="font-bold text-slate-800 tracking-tight">{record.category}</span>
                                </div>
                             </td>
                             <td className="px-8 py-4 text-sm font-medium text-slate-500">
                                {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                             </td>
                             <td className="px-8 py-4 text-sm text-slate-400 max-w-[200px] truncate">
                                {record.notes || <span className="italic opacity-50">No description</span>}
                             </td>
                             <td className="px-8 py-4 text-right">
                               <p className={`text-base font-black tracking-tight ${record.type === 'income' ? 'text-emerald-500' : 'text-slate-900'}`}>
                                  {record.type === 'income' ? '+' : '-'}{formatCur(record.amount)}
                               </p>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                </table>
             </div>
         )}
      </div>
      )}
    </div>
  );
};

export default Dashboard;
