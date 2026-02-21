import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Activity, FileText, CheckCircle, ArrowRight, Stethoscope, ClipboardCheck, LayoutDashboard } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { motion } from 'motion/react';

export const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-16 pb-24 lg:pt-32 lg:pb-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-medical-500 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-medical-300 blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-medical-50 px-3 py-1 text-sm font-semibold text-medical-700 mb-6 border border-medical-100">
                <Shield size={16} />
                <span>AI-Assisted Clinical Compliance</span>
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6">
                Clinical Excellence, <br />
                <span className="text-medical-600">AI-Verified.</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                CareAxis CoPilot empowers healthcare providers with real-time documentation 
                and automated guideline compliance checks. Focus on your patients, 
                while we ensure every decision meets the highest medical standards.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/login">
                  <Button size="lg" className="h-14 px-8 text-lg">
                    Get Started <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg">
                  Watch Demo
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-slate-50 py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Built for Modern Healthcare</h2>
            <p className="text-slate-600">A comprehensive suite of tools designed to streamline clinical workflows and improve patient outcomes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Stethoscope className="text-medical-600" />}
              title="Structured Documentation"
              description="Digitize consultations with intuitive forms for symptoms, diagnosis, and prescriptions."
            />
            <FeatureCard
              icon={<Shield className="text-medical-600" />}
              title="RAG-Based Compliance"
              description="Our AI engine validates treatment decisions against the latest medical guidelines in real-time."
            />
            <FeatureCard
              icon={<Activity className="text-medical-600" />}
              title="Patient Continuity"
              description="Maintain a seamless history for every patient with unique digital health IDs and QR follow-ups."
            />
            <FeatureCard
              icon={<ClipboardCheck className="text-medical-600" />}
              title="Quality Monitoring"
              description="Admins can review flagged cases and monitor clinic-wide compliance metrics effortlessly."
            />
            <FeatureCard
              icon={<FileText className="text-medical-600" />}
              title="Printable Summaries"
              description="Generate professional visit summaries and prescriptions ready for print or digital sharing."
            />
            <FeatureCard
              icon={<LayoutDashboard className="text-medical-600" />}
              title="Admin Insights"
              description="Advanced analytics to identify training needs and improve overall quality of care."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="w-12 h-12 rounded-xl bg-medical-50 flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);
