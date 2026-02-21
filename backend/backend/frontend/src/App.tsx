/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { ConsultationPage } from './pages/ConsultationPage';
import { AdminDashboard } from './pages/AdminDashboard';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage type="doctor" />} />
            <Route path="/admin/login" element={<LoginPage type="admin" />} />

            {/* Doctor Routes */}
            <Route path="/dashboard" element={<DoctorDashboard />} />
            <Route path="/consultation/new" element={<ConsultationPage />} />
            <Route path="/patients" element={<div className="p-8 text-center">Patient List (Coming Soon)</div>} />
            <Route path="/patients/new" element={<div className="p-8 text-center">New Patient Registration (Coming Soon)</div>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <footer className="border-t border-slate-200 bg-white py-12 mt-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-medical-600 text-white">
                    <span className="text-xs font-bold">C</span>
                  </div>
                  <span className="text-lg font-bold tracking-tight text-slate-900">
                    CareAxis <span className="text-medical-600">CoPilot</span>
                  </span>
                </div>
                <p className="text-sm text-slate-500 max-w-xs">
                  Empowering healthcare providers with AI-assisted clinical documentation and compliance verification.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">System</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><button className="hover:text-medical-600">Status</button></li>
                  <li><button className="hover:text-medical-600">Security</button></li>
                  <li><button className="hover:text-medical-600">Compliance</button></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Legal</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><button className="hover:text-medical-600">Privacy Policy</button></li>
                  <li><button className="hover:text-medical-600">Terms of Service</button></li>
                  <li><button className="hover:text-medical-600">HIPAA Statement</button></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-slate-400">
                &copy; 2024 CareAxis Health Systems. All rights reserved. v1.2.4-stable
              </p>
              <div className="flex gap-6">
                <button className="text-slate-400 hover:text-medical-600 transition-colors">Twitter</button>
                <button className="text-slate-400 hover:text-medical-600 transition-colors">LinkedIn</button>
                <button className="text-slate-400 hover:text-medical-600 transition-colors">GitHub</button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
