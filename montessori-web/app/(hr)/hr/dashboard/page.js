'use client';
import { Users, Calendar, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';

export default function HRDashboard() {
  const { user } = useSelector((s) => s.auth);
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          {greeting}, {user?.firstName}
        </h1>
        <p className="text-muted text-sm mt-1">Here is your Human Resources overview.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/hr/staff" className="card p-5 hover:shadow-md transition-shadow group">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
            <Users size={20} />
          </div>
          <h3 className="font-semibold text-ink group-hover:text-primary transition-colors">Staff Directory</h3>
          <p className="text-sm text-muted mt-1">Manage employee records and roles.</p>
        </Link>
        <Link href="/hr/leave" className="card p-5 hover:shadow-md transition-shadow group">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary mb-4">
            <Calendar size={20} />
          </div>
          <h3 className="font-semibold text-ink group-hover:text-secondary transition-colors">Leave Requests</h3>
          <p className="text-sm text-muted mt-1">Review and approve time off.</p>
        </Link>
        <div className="card p-5 bg-warning/5 border border-warning/20">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-warning shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-warning-dark">Pending Tasks</h3>
              <p className="text-sm text-muted mt-1">There are 3 pending leave requests requiring your approval.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
