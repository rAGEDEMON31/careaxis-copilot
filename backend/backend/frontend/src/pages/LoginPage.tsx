import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Card } from '@/src/components/ui/Card';

export const LoginPage = ({ type }: { type: 'doctor' | 'admin' }) => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-medical-600 mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Home
        </Link>
        
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-medical-600 text-white mb-4">
              {type === 'doctor' ? <Activity size={24} /> : <ShieldCheck size={24} />}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {type === 'doctor' ? 'Provider Login' : 'Admin Portal'}
            </h1>
            <p className="text-slate-500 mt-2">Enter your credentials to access CareAxis</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href = type === 'doctor' ? '/dashboard' : '/admin/dashboard'; }}>
            <Input label="Email Address" type="email" placeholder="name@clinic.com" required />
            <Input label="Password" type="password" placeholder="••••••••" required />
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="rounded border-slate-300 text-medical-600 focus:ring-medical-500" />
                Remember me
              </label>
              <button type="button" className="text-sm font-medium text-medical-600 hover:text-medical-700">
                Forgot password?
              </button>
            </div>

            <Button className="w-full h-11" type="submit">
              Sign In
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Need access? <button className="font-medium text-medical-600 hover:text-medical-700">Contact your administrator</button>
            </p>
          </div>
        </Card>
        
        <p className="text-center text-xs text-slate-400 mt-8">
          &copy; 2024 CareAxis CoPilot. HIPAA Compliant & SECURE.
        </p>
      </div>
    </div>
  );
};
