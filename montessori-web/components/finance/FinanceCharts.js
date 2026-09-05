'use client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function FinanceCharts({ monthlyData = {} }) {
  // monthlyData is like { "2026-08": { collected: 5000, expenses: 2000, month: "2026-08" }, ... }
  const sortedMonths = Object.keys(monthlyData).sort();

  const labels = sortedMonths.map(m => format(parseISO(`${m}-01`), 'MMM yyyy'));
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Collected Revenue',
        data: sortedMonths.map(m => monthlyData[m].collected),
        backgroundColor: '#10b981', // success
        borderRadius: 4,
      },
      {
        label: 'Expenses',
        data: sortedMonths.map(m => monthlyData[m].expenses),
        backgroundColor: '#f43f5e', // danger
        borderRadius: 4,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: { family: 'inherit', size: 12 },
          color: '#64748b' // slate-500
        }
      },
      tooltip: {
        backgroundColor: '#1e293b', // slate-800
        padding: 12,
        titleFont: { family: 'inherit', size: 13 },
        bodyFont: { family: 'inherit', size: 13 },
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { font: { family: 'inherit' }, color: '#94a3b8' } // slate-400
      },
      y: {
        grid: { color: '#f1f5f9', drawBorder: false }, // slate-100
        ticks: {
          font: { family: 'inherit' },
          color: '#94a3b8', // slate-400
          callback: (value) => {
            if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'k';
            return '$' + value;
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <div className="w-full h-80">
      {sortedMonths.length === 0 ? (
        <div className="flex items-center justify-center w-full h-full text-muted text-sm border border-dashed border-border rounded-xl">
          No financial data available for this period.
        </div>
      ) : (
        <Bar options={options} data={data} />
      )}
    </div>
  );
}
