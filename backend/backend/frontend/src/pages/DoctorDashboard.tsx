import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Users, ClipboardList, AlertCircle, Plus, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/src/lib/utils';

const MOCK_STATS = [
  { label: 'Total Patients', value: '1,284', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Consultations', value: '42', change: '+5%', icon: ClipboardList, color: 'text-medical-600', bg: 'bg-medical-50' },
  { label: 'Compliance Rate', value: '94%', change: '-2%', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Flagged Cases', value: '3', change: '-1', icon: AlertCircle, color: 'text-status-severe', bg: 'bg-red-50' },
];

const MOCK_RECENT_PATIENTS = [
  { id: '1', name: 'John Doe', healthId: 'CA-9283-X', lastVisit: '2 hours ago', status: 'Compliant' },
  { id: '2', name: 'Alice Smith', healthId: 'CA-1102-Y', lastVisit: '4 hours ago', status: 'Minor Deviation' },
  { id: '3', name: 'Robert Johnson', healthId: 'CA-4492-Z', lastVisit: 'Yesterday', status: 'Compliant' },
  { id: '4', name: 'Maria Garcia', healthId: 'CA-7721-A', lastVisit: 'Yesterday', status: 'Severe Deviation' },
];

const COMPLIANCE_DATA = [
  { name: 'Mon', compliant: 12, flagged: 1 },
  { name: 'Tue', compliant: 15, flagged: 0 },
  { name: 'Wed', compliant: 10, flagged: 2 },
  { name: 'Thu', compliant: 18, flagged: 1 },
  { name: 'Fri', compliant: 14, flagged: 0 },
];

export const DoctorDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, Dr. Chen</h1>
          <p className="text-slate-500">Here's what's happening in your clinic today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/patients/new')}>
            Register Patient
          </Button>
          <Button onClick={() => navigate('/consultation/new')}>
            <Plus size={18} className="mr-2" /> New Consultation
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {MOCK_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</h3>
                  <div className="mt-2 flex items-center gap-1">
                    {stat.change.startsWith('+') ? (
                      <ArrowUpRight size={14} className="text-emerald-600" />
                    ) : (
                      <ArrowDownRight size={14} className="text-status-severe" />
                    )}
                    <span className={cn(
                      "text-xs font-semibold",
                      stat.change.startsWith('+') ? "text-emerald-600" : "text-status-severe"
                    )}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-slate-400">vs last week</span>
                  </div>
                </div>
                <div className={cn("rounded-xl p-3", stat.bg)}>
                  <stat.icon className={stat.color} size={24} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Patients */}
        <div className="lg:col-span-2">
          <Card title="Recent Consultations" subtitle="Last 24 hours activity">
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pl-2">Patient</th>
                    <th className="pb-3">Health ID</th>
                    <th className="pb-3">Last Visit</th>
                    <th className="pb-3">Compliance</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {MOCK_RECENT_PATIENTS.map((patient) => (
                    <tr key={patient.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-slate-900">{patient.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-slate-600 font-mono">{patient.healthId}</td>
                      <td className="py-4 text-sm text-slate-500">{patient.lastVisit}</td>
                      <td className="py-4">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          patient.status === 'Compliant' ? "bg-emerald-100 text-emerald-700" :
                          patient.status === 'Severe Deviation' ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        )}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <Button variant="outline" className="w-full">View All Patients</Button>
            </div>
          </Card>
        </div>

        {/* Compliance Chart */}
        <div className="lg:col-span-1">
          <Card title="Weekly Compliance" subtitle="Consultation outcomes">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={COMPLIANCE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="compliant" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={30} />
                  <Bar dataKey="flagged" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">Compliant</span>
                </div>
                <span className="font-semibold text-slate-900">85%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-slate-600">Flagged</span>
                </div>
                <span className="font-semibold text-slate-900">15%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
