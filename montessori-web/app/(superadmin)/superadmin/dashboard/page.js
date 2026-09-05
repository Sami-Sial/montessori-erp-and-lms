'use client';
import { useQuery } from '@tanstack/react-query';
import { superAdminApi } from '../../../../lib/api/superadmin';
import {
  Building2, Users, GraduationCap, GitBranch,
  ShieldCheck, ArrowRight, TrendingUp, TrendingDown,
} from 'lucide-react';
import { SkeletonStatCard, SkeletonCard } from '../../../../components/shared/Skeleton';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useSelector } from 'react-redux';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#5B5F6B', font: { size: 11 } } },
    y: { grid: { color: '#E2DFD8' }, ticks: { color: '#5B5F6B', font: { size: 11 } }, beginAtZero: true },
  },
};

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={16} aria-hidden="true" />
        </div>
      </div>
      <p className="font-display text-2xl font-bold text-ink mt-1">{value ?? '—'}</p>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

export default function SuperAdminDashboard() {
  const { user } = useSelector((s) => s.auth);
  const now = new Date();

  const { data: stats, isLoading: ls } = useQuery({ queryKey: ['sa','stats'], queryFn: superAdminApi.getStats });
  const { data: orgGrowth } = useQuery({ queryKey: ['sa','org-growth'], queryFn: superAdminApi.getOrgGrowth });
  const { data: roleData } = useQuery({ queryKey: ['sa','users-by-role'], queryFn: superAdminApi.getUsersByRole });
  const { data: activity } = useQuery({ queryKey: ['sa','activity'], queryFn: superAdminApi.getActivity });
  const { data: orgsData, isLoading: lo } = useQuery({ queryKey: ['sa','orgs'], queryFn: () => superAdminApi.listOrganizations() });

  const orgs = orgsData?.data ?? [];

  // Chart datasets
  const orgGrowthChart = orgGrowth ? {
    labels: orgGrowth.map(d => d.month.slice(5)),
    datasets: [{
      label: 'New orgs',
      data: orgGrowth.map(d => d.count),
      borderColor: '#3E4C8C',
      backgroundColor: 'rgba(62,76,140,0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
    }],
  } : null;

  const roleChart = roleData ? {
    labels: roleData.slice(0,8).map(d => d.displayName.replace(' / ', '/').replace(' Staff', '')),
    datasets: [{
      data: roleData.slice(0,8).map(d => d.count),
      backgroundColor: ['#3E4C8C','#5C7A5A','#C17E20','#3E6FA8','#C1694F','#4B8B6F','#7B5EA7','#52607A'],
    }],
  } : null;

  const activityChart = activity ? {
    labels: activity.filter((_,i) => i % 3 === 0).map(d => d.date.slice(5)),
    datasets: [
      {
        label: 'Attendance',
        data: activity.filter((_,i) => i % 3 === 0).map(d => d.attendance),
        borderColor: '#5C7A5A',
        backgroundColor: 'rgba(92,122,90,0.08)',
        fill: true, tension: 0.4, pointRadius: 2,
      },
      {
        label: 'Observations',
        data: activity.filter((_,i) => i % 3 === 0).map(d => d.observations),
        borderColor: '#3E4C8C',
        backgroundColor: 'rgba(62,76,140,0.08)',
        fill: true, tension: 0.4, pointRadius: 2,
      },
    ],
  } : null;

  const donutChart = stats ? {
    labels: ['Active', 'Inactive'],
    datasets: [{
      data: [stats.activeOrgs, (stats.totalOrgs - stats.activeOrgs)],
      backgroundColor: ['#4B8B6F', '#E2DFD8'],
      borderWidth: 0,
    }],
  } : null;

  return (
    <div className="space-y-8">

      {/* Greeting */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={15} className="text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Super Admin · Platform Level</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Good {now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'}, {user?.firstName}
        </h1>
        <p className="text-muted text-sm mt-0.5">Full visibility across all organizations on the platform.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {ls ? [0,1,2,3,4].map(i => <SkeletonStatCard key={i} />) : <>
          <StatCard label="Organizations"   value={stats?.totalOrgs}     sub={`${stats?.activeOrgs ?? 0} active`}  icon={Building2}     color="bg-primary/10 text-primary" />
          <StatCard label="Platform users"  value={stats?.totalUsers}    sub="All roles"                             icon={Users}         color="bg-warning/10 text-warning" />
          <StatCard label="Active students" value={stats?.totalStudents} sub="Enrolled"                              icon={GraduationCap} color="bg-info/10 text-info" />
          <StatCard label="Org health"
            value={stats ? `${Math.round((stats.activeOrgs/Math.max(stats.totalOrgs,1))*100)}%` : '—'}
            sub="Active rate"
            icon={stats && stats.activeOrgs/Math.max(stats.totalOrgs,1) >= 0.9 ? TrendingUp : TrendingDown}
            color={stats && stats.activeOrgs/Math.max(stats.totalOrgs,1) >= 0.9 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}
          />
        </>}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Org growth */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-ink text-sm">Organizations registered (last 12 months)</p>
          </div>
          <div className="h-48">
            {orgGrowthChart
              ? <Line data={orgGrowthChart} options={CHART_OPTS} />
              : <div className="h-full flex items-center justify-center text-muted text-xs">Loading chart…</div>
            }
          </div>
        </div>

        {/* Active vs Inactive donut */}
        <div className="card">
          <p className="font-semibold text-ink text-sm mb-4">Organization status</p>
          <div className="h-40 flex items-center justify-center">
            {donutChart
              ? <Doughnut data={donutChart} options={{ ...CHART_OPTS, scales: undefined, plugins: { legend: { display: true, position: 'bottom', labels: { font: { size: 11 }, color: '#5B5F6B', padding: 12 } } } }} />
              : <div className="text-muted text-xs">Loading…</div>
            }
          </div>
          {stats && (
            <div className="flex justify-around mt-3 pt-3 border-t border-border">
              <div className="text-center">
                <p className="font-display font-bold text-success text-xl">{stats.activeOrgs}</p>
                <p className="text-xs text-muted">Active</p>
              </div>
              <div className="text-center">
                <p className="font-display font-bold text-muted text-xl">{stats.totalOrgs - stats.activeOrgs}</p>
                <p className="text-xs text-muted">Inactive</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Users by role */}
        <div className="card">
          <p className="font-semibold text-ink text-sm mb-4">Users by role</p>
          <div className="h-48">
            {roleChart
              ? <Bar data={roleChart} options={{ ...CHART_OPTS, indexAxis: 'y', scales: { x: { grid: { color: '#E2DFD8' }, ticks: { color: '#5B5F6B', font: { size: 10 }, precision: 0, stepSize: 1 }, beginAtZero: true }, y: { grid: { display: false }, ticks: { color: '#5B5F6B', font: { size: 10 } } } } }} />
              : <div className="h-full flex items-center justify-center text-muted text-xs">Loading chart…</div>
            }
          </div>
        </div>

        {/* Platform activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-ink text-sm">Platform activity (last 30 days)</p>
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary inline-block" />Attendance</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" />Observations</span>
            </div>
          </div>
          <div className="h-48">
            {activityChart
              ? <Line data={activityChart} options={{ ...CHART_OPTS, plugins: { legend: { display: false } } }} />
              : <div className="h-full flex items-center justify-center text-muted text-xs">Loading chart…</div>
            }
          </div>
        </div>
      </div>

      {/* Recent organizations */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-lg text-ink flex items-center gap-2">
            <Building2 size={18} className="text-primary" /> Recent Organizations
          </h2>
          <Link href="/superadmin/organizations" className="text-xs text-primary hover:underline focusable flex items-center gap-1">
            Manage all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="card overflow-hidden p-0">
          {lo ? <div className="p-4"><SkeletonCard /></div> : orgs.length === 0 ? (
            <div className="py-10 text-center text-muted text-sm">No organizations yet</div>
          ) : (
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-border bg-bg">
                  {['School','Slug','Users','Status','Registered'].map(h => (
                    <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orgs.slice(0,8).map(org => (
                  <tr key={org.id} className="hover:bg-bg/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 size={13} className="text-primary" />
                        </div>
                        <Link href={`/superadmin/organizations/${org.id}`} className="font-semibold text-ink hover:text-primary transition-colors">
                          {org.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">{org.slug}</td>
                    <td className="px-4 py-3 font-semibold text-ink text-center">{org._count?.users ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`badge-chip text-xs ${org.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                        {org.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {formatDistanceToNow(new Date(org.createdAt), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
