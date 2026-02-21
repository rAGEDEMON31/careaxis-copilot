import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Stethoscope, 
  Pill, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Search,
  User,
  ShieldCheck
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

const consultationSchema = z.object({
  symptoms: z.string().min(10, 'Please provide detailed symptoms'),
  notes: z.string().min(5, 'Clinical notes are required'),
  diagnosis: z.string().min(3, 'Diagnosis is required'),
  prescription: z.string().min(5, 'Prescription details are required'),
});

type ConsultationFormValues = z.infer<typeof consultationSchema>;

export const ConsultationPage = () => {
  const [step, setStep] = useState<'patient' | 'form' | 'compliance' | 'summary'>('patient');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [complianceResult, setComplianceResult] = useState<any>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema),
  });

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    setStep('form');
  };

  const onSubmit = async (data: ConsultationFormValues) => {
    setIsAnalyzing(true);
    setStep('compliance');
    
    // Simulate AI Analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setComplianceResult({
        status: 'moderate',
        deviation: 'Prescribed antibiotic (Amoxicillin) for viral symptoms without secondary infection evidence.',
        guideline: 'NICE Guideline NG191: Do not offer antibiotics for self-limiting viral respiratory infections.',
        recommendation: 'Consider symptomatic treatment (Paracetamol) and safety-netting advice instead.'
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Progress Stepper */}
      <div className="mb-12 flex items-center justify-center">
        <div className="flex items-center gap-4">
          <StepIndicator active={step === 'patient'} completed={['form', 'compliance', 'summary'].includes(step)} label="Patient" />
          <div className="h-px w-12 bg-slate-200" />
          <StepIndicator active={step === 'form'} completed={['compliance', 'summary'].includes(step)} label="Consultation" />
          <div className="h-px w-12 bg-slate-200" />
          <StepIndicator active={step === 'compliance'} completed={['summary'].includes(step)} label="AI Compliance" />
          <div className="h-px w-12 bg-slate-200" />
          <StepIndicator active={step === 'summary'} completed={false} label="Summary" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'patient' && (
          <motion.div
            key="patient"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card title="Identify Patient" subtitle="Search by Health ID or Name">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <Input className="pl-10 h-12 text-lg" placeholder="Enter Health ID (e.g., CA-9283-X)" />
              </div>
              
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Recent Patients</p>
                {[
                  { name: 'John Doe', id: 'CA-9283-X', age: 45, gender: 'Male' },
                  { name: 'Alice Smith', id: 'CA-1102-Y', age: 29, gender: 'Female' }
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePatientSelect(p)}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-medical-300 hover:bg-medical-50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                        {p.name[0]}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-slate-900">{p.name}</p>
                        <p className="text-sm text-slate-500">{p.id} • {p.age}y • {p.gender}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-medical-500" />
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Card 
                title={`Consultation: ${selectedPatient?.name}`} 
                subtitle={`Health ID: ${selectedPatient?.id}`}
                footer={
                  <div className="flex justify-between">
                    <Button variant="ghost" type="button" onClick={() => setStep('patient')}>
                      <ChevronLeft className="mr-2" size={18} /> Back
                    </Button>
                    <div className="flex gap-3">
                      <Button variant="outline" type="button">Save Draft</Button>
                      <Button type="submit">
                        Analyze Compliance <ChevronRight className="ml-2" size={18} />
                      </Button>
                    </div>
                  </div>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Stethoscope size={16} className="text-medical-600" /> Symptoms
                      </label>
                      <textarea 
                        {...register('symptoms')}
                        className={cn(
                          "w-full min-h-[120px] rounded-lg border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-medical-500 outline-hidden",
                          errors.symptoms && "border-status-severe"
                        )}
                        placeholder="Describe patient symptoms in detail..."
                      />
                      {errors.symptoms && <p className="text-xs text-status-severe">{errors.symptoms.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <FileText size={16} className="text-medical-600" /> Clinical Notes
                      </label>
                      <textarea 
                        {...register('notes')}
                        className={cn(
                          "w-full min-h-[120px] rounded-lg border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-medical-500 outline-hidden",
                          errors.notes && "border-status-severe"
                        )}
                        placeholder="Physical examination findings, history..."
                      />
                      {errors.notes && <p className="text-xs text-status-severe">{errors.notes.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Input 
                      label="Diagnosis" 
                      {...register('diagnosis')} 
                      error={errors.diagnosis?.message}
                      placeholder="e.g., Acute Viral Rhinopharyngitis"
                    />
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Pill size={16} className="text-medical-600" /> Prescription
                      </label>
                      <textarea 
                        {...register('prescription')}
                        className={cn(
                          "w-full min-h-[120px] rounded-lg border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-medical-500 outline-hidden",
                          errors.prescription && "border-status-severe"
                        )}
                        placeholder="Medication, dosage, frequency..."
                      />
                      {errors.prescription && <p className="text-xs text-status-severe">{errors.prescription.message}</p>}
                    </div>
                  </div>
                </div>
              </Card>
            </form>
          </motion.div>
        )}

        {step === 'compliance' && (
          <motion.div
            key="compliance"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[400px]"
          >
            {isAnalyzing ? (
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border-4 border-medical-100 border-t-medical-600 animate-spin mx-auto" />
                  <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-medical-600" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">AI Compliance Check</h2>
                  <p className="text-slate-500">Validating against clinical guidelines (NICE, WHO, CDC)...</p>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-6">
                <div className={cn(
                  "p-6 rounded-2xl border-2 flex items-start gap-4",
                  complianceResult.status === 'moderate' ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"
                )}>
                  <div className={cn(
                    "p-3 rounded-xl",
                    complianceResult.status === 'moderate' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                  )}>
                    {complianceResult.status === 'moderate' ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {complianceResult.status === 'moderate' ? 'Moderate Deviation Detected' : 'Treatment Compliant'}
                    </h3>
                    <p className="mt-2 text-slate-700 leading-relaxed">{complianceResult.deviation}</p>
                  </div>
                </div>

                <Card title="Guideline Reference">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm font-semibold text-slate-900 mb-1">Standard Protocol:</p>
                      <p className="text-sm text-slate-600 italic">{complianceResult.guideline}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">Recommendation:</p>
                      <p className="text-sm text-slate-600">{complianceResult.recommendation}</p>
                    </div>
                  </div>
                </Card>

                {complianceResult.status === 'moderate' && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Doctor's Justification (Required for deviation)</label>
                    <textarea 
                      className="w-full min-h-[100px] rounded-lg border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-medical-500 outline-hidden"
                      placeholder="Explain why this deviation is necessary for this specific patient context..."
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setStep('form')}>Modify Consultation</Button>
                  <Button onClick={() => setStep('summary')}>Confirm & Submit</Button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {step === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="text-center py-12">
              <div className="h-20 w-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Consultation Completed</h2>
              <p className="text-slate-500 mb-8">The visit summary and prescription have been generated.</p>
              
              <div className="max-w-md mx-auto p-6 border border-slate-100 rounded-2xl bg-slate-50 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-left">
                    <p className="text-xs text-slate-400 uppercase font-bold">Health ID</p>
                    <p className="font-mono font-bold text-slate-900">{selectedPatient?.id}</p>
                  </div>
                  <div className="h-16 w-16 bg-white p-1 border border-slate-200 rounded-lg">
                    {/* Placeholder for QR Code */}
                    <div className="w-full h-full bg-slate-900 rounded-xs" />
                  </div>
                </div>
                <div className="text-left space-y-2">
                  <p className="text-sm text-slate-600"><span className="font-semibold">Patient:</span> {selectedPatient?.name}</p>
                  <p className="text-sm text-slate-600"><span className="font-semibold">Diagnosis:</span> Acute Viral Rhinopharyngitis</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="outline">Print Summary</Button>
                <Button variant="outline">Download PDF</Button>
                <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StepIndicator = ({ active, completed, label }: { active: boolean, completed: boolean, label: string }) => (
  <div className="flex flex-col items-center gap-2">
    <div className={cn(
      "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all",
      active ? "border-medical-600 bg-medical-50 text-medical-600" : 
      completed ? "border-emerald-600 bg-emerald-600 text-white" : 
      "border-slate-200 bg-white text-slate-400"
    )}>
      {completed ? <CheckCircle2 size={20} /> : <div className="h-2 w-2 rounded-full bg-current" />}
    </div>
    <span className={cn(
      "text-xs font-bold uppercase tracking-wider",
      active ? "text-medical-600" : completed ? "text-emerald-600" : "text-slate-400"
    )}>
      {label}
    </span>
  </div>
);
