import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, LogOut, User, Bell, Search, Menu } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '@/src/lib/utils';

export const Navbar = () => {
  const location = useLocation();
  const isPublic = ['/', '/login', '/admin/login'].includes(location.pathname);

  if (isPublic && location.pathname !== '/') return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-medical-600 text-white">
              <Activity size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              CareAxis <span className="text-medical-600">CoPilot</span>
            </span>
          </Link>

          {!isPublic && (
            <div className="hidden md:flex md:items-center md:gap-4">
              <Link
                to="/dashboard"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-medical-600",
                  location.pathname.startsWith('/dashboard') ? "text-medical-600" : "text-slate-600"
                )}
              >
                Dashboard
              </Link>
              <Link
                to="/patients"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-medical-600",
                  location.pathname.startsWith('/patients') ? "text-medical-600" : "text-slate-600"
                )}
              >
                Patients
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!isPublic ? (
            <>
              <div className="hidden items-center rounded-full bg-slate-100 px-3 py-1.5 md:flex">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search health ID..."
                  className="ml-2 bg-transparent text-sm outline-hidden placeholder:text-slate-400"
                />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-status-severe" />
              </Button>
              <div className="h-8 w-px bg-slate-200 mx-1" />
              <div className="flex items-center gap-3">
                <div className="hidden text-right md:block">
                  <p className="text-sm font-semibold text-slate-900">Dr. Sarah Chen</p>
                  <p className="text-xs text-slate-500">General Physician</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-medical-100 flex items-center justify-center text-medical-700 font-bold border border-medical-200">
                  SC
                </div>
                <Button variant="ghost" size="icon" title="Logout">
                  <LogOut size={18} />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-3">
              <Link to="/login">
                <Button variant="ghost">Doctor Login</Button>
              </Link>
              <Link to="/admin/login">
                <Button variant="outline">Admin Portal</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
