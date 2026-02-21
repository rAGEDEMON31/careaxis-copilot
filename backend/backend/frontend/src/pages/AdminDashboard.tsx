import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Download, 
  Search,
  ChevronRight,
  ShieldAlert,
  Activity
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { cn } from '@/src/lib/utils';

const COMPLIANCE_BY_CLINIC = [
  { name: 'Central Clinic', rate: 92, flagged: 4 },
  { name: 'East Wing', rate: 85, flagged: 12 },
  { name: 'North Station', rate: 96, flagged: 2 },
  { name: 'South Medical', rate: 78, flagged: 18 },
];

const TREND_DATA = [
  { month: 'Jan', rate: 82 },
  { month: 'Feb', rate: 85 },
  { month: 'Mar', rate: 84 },
  { month: 'Apr', rate: 88 },
  { month: 'May', rate: 91 },
  { month: 'Jun', rate: 94 },
];

const FLAGGED_CASES = [
  { id: 'FC-102', doctor: 'Dr. Sarah Chen', patient: 'Maria Garcia', reason: 'Severe Antibiotic Overprescription', date: '2024-02-20', severity: 'severe' },
  { id: 'FC-103', doctor: 'Dr. James Wilson', patient: 'Robert Lee', reason: 'Missing Mandatory Vitals', date: '2024-02-19', severity: 'moderate' },
  { id: 'FC-104', doctor: 'Dr. Sarah Chen', patient: 'Alice Smith', reason: 'Off-label usage without justification', date: '2024-02-19', severity: 'moderate' },
];

export const AdminDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Health System Analytics</h1>
          <p className="text-slate-500">Monitoring quality and compliance across all facilities.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter size={18} className="mr-2" /> Filter
          </Button>
          <Button variant="outline">
            <Download size={18} className="mr-2" /> Export Report
          </Button>
        </div>
      </header>

      {/* High Level Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Avg Compliance" value="91.4%" trend="+2.4%" positive={true} icon={<Activity className="text-medical-600" />} />
        <StatCard title="Active Flagged Cases" value="34" trend="+5" positive={false} icon={<ShieldAlert className="text-status-severe" />} />
        <StatCard title="Total Consultations" value="12,482" trend="+12%" positive={true} icon={<TrendingUp className="text-emerald-600" />} />
        <StatCard title="Clinics Monitored" value="12" trend="Stable" positive={true} icon={<TrendingUp className="text-blue-600" />} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
        {/* Compliance Trend */}
        <Card title="Compliance Trend" subtitle="Overall system performance over 6 months">
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0c91e9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0c91e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[70, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="rate" stroke="#0c91e9" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Clinic Performance */}
        <Card title="Clinic Performance" subtitle="Compliance rate by facility">
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COMPLIANCE_BY_CLINIC} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={100} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="rate" fill="#0c91e9" radius={[0, 4, 4, 0]} barSize={20}>
                  {COMPLIANCE_BY_CLINIC.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.rate < 80 ? '#ef4444' : entry.rate < 90 ? '#f59e0b' : '#0c91e9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Flagged Cases Table */}
      <Card title="Urgent Flagged Cases" subtitle="Requires immediate administrative review">
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pl-2">Case ID</th>
                <th className="pb-3">Doctor</th>
                <th className="pb-3">Patient</th>
                <th className="pb-3">Violation Reason</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {FLAGGED_CASES.map((caseItem) => (
                <tr key={caseItem.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 pl-2 font-mono text-sm font-bold text-slate-900">{caseItem.id}</td>
                  <td className="py-4 text-sm text-slate-600">{caseItem.doctor}</td>
                  <td className="py-4 text-sm text-slate-600">{caseItem.patient}</td>
                  <td className="py-4 text-sm text-slate-500 max-w-xs truncate">{caseItem.reason}</td>
                  <td className="py-4">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      caseItem.severity === 'severe' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {caseItem.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 text-right pr-2">
                    <Button variant="ghost" size="sm">Review Case</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const StatCard = ({ title, value, trend, positive, icon }: { title: string, value: string, trend: string, positive: boolean, icon: React.ReactNode }) => (
  <Card>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="mt-1 text-2xl font-bold text-slate-900">{value}</h3>
        <p className={cn(
          "mt-2 text-xs font-semibold",
          positive ? "text-emerald-600" : "text-status-severe"
        )}>
          {trend} <span className="text-slate-400 font-normal">from last month</span>
        </p>
      </div>
      <div className="rounded-xl bg-slate-50 p-3">
        {icon}
      </div>
    </div>
  </Card>
);
