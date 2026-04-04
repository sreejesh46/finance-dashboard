import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { TrendingUp, TrendingDown, Wallet, BarChart, PieChart, ReceiptText } from 'lucide-react';
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
  const { isDark } = useTheme();
  const dashboardFontFamily = '"Manrope", "Inter", -apple-system, BlinkMacSystemFont, sans-serif';
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [timeFilter, setTimeFilter] = useState('7_days');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        let startDateValue = '';

        if (timeFilter !== 'all_time') {
          const days = timeFilter === '7_days' ? 7 : 30;
          const d = new Date();
          d.setDate(d.getDate() - days);
          startDateValue = d.toISOString();
        }

        const analyticsRes = await axios.get('/records/analytics', {
          params: { startDate: startDateValue || undefined },
        });
        setData(analyticsRes.data);

        if (user?.role !== 'Viewer') {
          const recordsRes = await axios.get('/records', {
            params: { limit: 6, startDate: startDateValue || undefined },
          });
          setRecentRecords(recordsRes.data.records || []);
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

  const formatCur = (num) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num || 0);

  const surfaceClass = isDark
    ? 'bg-[#26272E] border border-slate-800 shadow-[0_24px_60px_rgba(2,6,23,0.4)]'
    : 'bg-white border border-slate-200 shadow-[0_18px_40px_rgba(15,23,42,0.05)]';
  const headingClass = isDark ? 'text-slate-50' : 'text-slate-950';
  const bodyMutedClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const labelClass = isDark ? 'text-slate-500' : 'text-slate-400';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="relative">
          <div
            className={`w-16 h-16 border-4 rounded-full animate-spin ${
              isDark ? 'border-slate-700 border-t-sky-500' : 'border-indigo-200 border-t-indigo-600'
            }`}
          />
          <div
            className={`w-10 h-10 border-4 rounded-full animate-spin absolute top-3 left-3 ${
              isDark ? 'border-slate-800 border-b-indigo-400' : 'border-cyan-200 border-b-cyan-500'
            }`}
          />
        </div>
      </div>
    );
  }

  const { totalIncome = 0, totalExpense = 0, netBalance = 0, categoryBreakdown, monthlyTrends } =
    data || {};

  const months = monthlyTrends ? Object.keys(monthlyTrends) : [];
  const incomeTrend = months.map((month) => monthlyTrends[month].income);
  const expenseTrend = months.map((month) => monthlyTrends[month].expense);

  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: 'Income (INR)',
        data: incomeTrend,
        borderColor: '#6366f1',
        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.18)' : 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#6366f1',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Expense (INR)',
        data: expenseTrend,
        borderColor: '#f43f5e',
        backgroundColor: isDark ? 'rgba(244, 63, 94, 0.12)' : 'rgba(244, 63, 94, 0.05)',
        borderWidth: 3,
        borderDash: [5, 5],
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#f43f5e',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartTextColor = isDark ? '#cbd5e1' : '#475569';
  const chartTickColor = isDark ? '#94a3b8' : '#64748b';
  const chartGridColor = isDark ? 'rgba(148, 163, 184, 0.12)' : '#f1f5f9';

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          padding: 20,
          color: chartTextColor,
          font: { family: dashboardFontFamily, weight: '500' },
        },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(15, 23, 42, 0.9)',
        titleFont: { size: 13, family: dashboardFontFamily },
        bodyFont: { size: 14, weight: 'bold', family: dashboardFontFamily },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: chartTickColor, font: { family: dashboardFontFamily } },
      },
      y: {
        grid: { color: chartGridColor, drawBorder: false },
        ticks: { color: chartTickColor, font: { family: dashboardFontFamily }, beginAtZero: true },
      },
    },
  };

  const categories = categoryBreakdown ? Object.keys(categoryBreakdown) : [];
  const categoryValues = categories.map((category) => categoryBreakdown[category]);
  const pieColors = ['#6366f1', '#0ea5e9', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981'];

  const doughnutData = {
    labels: categories,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: pieColors,
        borderWidth: 2,
        borderColor: isDark ? '#26272E' : '#ffffff',
        hoverOffset: 4,
        cutout: '70%',
      },
    ],
  };

  const EmptyChartPlaceholder = ({ icon: Icon, text }) => (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed ${
        isDark ? 'bg-[#1f2025] border-slate-800' : 'bg-slate-50/50 border-slate-200'
      }`}
    >
      <div
        className={`w-16 h-16 shadow-sm rounded-full flex items-center justify-center mb-3 ${
          isDark ? 'bg-[#17191A] text-slate-600' : 'bg-white text-slate-300'
        }`}
      >
        <Icon className="w-8 h-8" strokeWidth={1.5} />
      </div>
      <p className={`font-medium text-sm ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{text}</p>
      <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        Add some records to visualize
      </p>
    </div>
  );

  return (
    <div className="min-w-0 pb-20 space-y-8 duration-700 ease-out animate-in slide-in-from-bottom-4 fill-mode-both">
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${headingClass}`}>Financial Overview</h1>
          <p className={`font-medium mt-1 ${bodyMutedClass}`}>
            Here's your comprehensive financial summary for today.
          </p>
        </div>
        {user?.role !== 'Viewer' && (
          <div
            className={`flex p-1.5 rounded-2xl border ${
              isDark
                ? 'bg-[#26272E] border-slate-800 shadow-[0_16px_40px_rgba(2,6,23,0.35)]'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            {[
              ['7_days', '7 Days'],
              ['30_days', '30 Days'],
              ['all_time', 'All Time'],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTimeFilter(value)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
                  timeFilter === value
                    ? 'bg-[#156EF3] text-white shadow-sm'
                    : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative z-10 grid min-w-0 grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            title: 'Net Balance',
            value: formatCur(netBalance),
            delta: '+14.2%',
            deltaClass: 'text-emerald-500 bg-emerald-50',
            icon: Wallet,
          },
          {
            title: 'Total Income',
            value: formatCur(totalIncome),
            delta: '+8.1%',
            deltaClass: 'text-emerald-500 bg-emerald-50',
            icon: TrendingUp,
          },
          {
            title: 'Total Expenses',
            value: formatCur(totalExpense),
            delta: '-2.4%',
            deltaClass: 'text-rose-500 bg-rose-50',
            icon: TrendingDown,
          },
        ].map((item) => (
          <div
            key={item.title}
            className={`${surfaceClass} rounded-[28px] p-6 relative overflow-hidden group transition-all duration-300`}
          >
            <div
              className={`absolute right-0 top-0 w-32 h-32 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 ${
                isDark ? 'bg-sky-500/10' : 'bg-sky-50'
              }`}
            />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className={`text-sm font-bold tracking-wide uppercase ${labelClass}`}>{item.title}</p>
                <h3 className={`text-4xl font-bold mt-2 tracking-tight ${headingClass}`}>
                  {item.value}
                </h3>
                <div className="flex items-center gap-1.5 mt-3 text-sm font-medium">
                  <span className={`${item.deltaClass} px-2 py-0.5 rounded-md flex items-center gap-1`}>
                    {item.delta.startsWith('-') ? (
                      <TrendingDown className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingUp className="w-3.5 h-3.5" />
                    )}
                    {item.delta}
                  </span>
                  <span className={labelClass}>vs last month</span>
                </div>
              </div>
              <div
                className={`w-14 h-14 rounded-2xl bg-[#156EF3] flex justify-center items-center text-white ${
                  isDark ? 'shadow-[0_14px_30px_rgba(21,110,243,0.35)]' : 'shadow-lg shadow-sky-200'
                }`}
              >
                <item.icon className="w-7 h-7" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`${surfaceClass} p-6 rounded-[28px] col-span-2 flex flex-col min-h-[400px] min-w-0`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${headingClass}`}>Cash Flow Trends</h2>
          </div>
          <div className="relative flex-1 w-full h-full min-w-0">
            {months.length > 0 ? (
              <Line data={lineChartData} options={commonOptions} />
            ) : (
              <EmptyChartPlaceholder icon={BarChart} text="No Cash Flow Data" />
            )}
          </div>
        </div>

        <div className={`${surfaceClass} p-6 rounded-[28px] col-span-1 flex flex-col min-h-[400px] min-w-0`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${headingClass}`}>Spending by Category</h2>
          </div>
          <div className="relative flex items-center justify-center flex-1 w-full h-full min-w-0">
            {categories.length > 0 ? (
              <div className="absolute inset-0 pb-4">
                <Doughnut
                  data={doughnutData}
                  options={{
                    ...commonOptions,
                    cutOut: '75%',
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                          color: chartTextColor,
                        },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <EmptyChartPlaceholder icon={PieChart} text="No Spending Data" />
            )}
          </div>
        </div>
      </div>

      {user?.role !== 'Viewer' && (
        <div className={`${surfaceClass} rounded-[28px] overflow-hidden relative z-10`}>
          <div
            className={`px-8 py-6 border-b flex justify-between items-center ${
              isDark ? 'border-slate-800 bg-[#1f2025]' : 'border-slate-200 bg-slate-50/70'
            }`}
          >
            <h3 className={`text-xl font-bold ${headingClass}`}>Recent Transactions</h3>
            <RouterLink to="/records" className="text-sm font-semibold transition-colors text-sky-600 hover:text-sky-700">
              View All
            </RouterLink>
          </div>

          {recentRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div
                className={`w-16 h-16 rounded-full flex justify-center items-center mb-4 ${
                  isDark ? 'bg-[#17191A] border border-slate-800' : 'bg-slate-50 border border-slate-100'
                }`}
              >
                <ReceiptText
                  className={`w-6 h-6 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}
                  strokeWidth={1}
                />
              </div>
              <p className={`font-medium ${bodyMutedClass}`}>No transactions recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className={`text-xs font-semibold uppercase tracking-wider border-b ${
                      isDark ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-100'
                    }`}
                  >
                    <th className="px-8 py-4">Transaction</th>
                    <th className="px-8 py-4">Date</th>
                    <th className="px-8 py-4">Notes</th>
                    <th className="px-8 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className={isDark ? 'divide-y divide-slate-800/80' : 'divide-y divide-slate-50'}>
                  {recentRecords.map((record) => (
                    <tr
                      key={record._id}
                      className={`transition-colors group cursor-default ${
                        isDark ? 'hover:bg-[#1f2025]' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                              record.type === 'income'
                                ? 'bg-gradient-to-br from-emerald-100 to-green-50 text-emerald-600 border border-emerald-100'
                                : 'bg-gradient-to-br from-rose-100 to-pink-50 text-rose-600 border border-rose-100'
                            }`}
                          >
                            {record.type === 'income' ? (
                              <TrendingUp className="w-5 h-5" />
                            ) : (
                              <TrendingDown className="w-5 h-5" />
                            )}
                          </div>
                          <span className={`font-bold tracking-tight ${headingClass}`}>{record.category}</span>
                        </div>
                      </td>
                      <td className={`px-8 py-4 text-sm font-medium ${bodyMutedClass}`}>
                        {new Date(record.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className={`px-8 py-4 text-sm max-w-[200px] truncate ${labelClass}`}>
                        {record.notes || <span className="italic opacity-50">No description</span>}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <p
                          className={`text-base font-black tracking-tight ${
                            record.type === 'income' ? 'text-emerald-500' : isDark ? 'text-slate-100' : 'text-slate-900'
                          }`}
                        >
                          {record.type === 'income' ? '+' : '-'}
                          {formatCur(record.amount)}
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
