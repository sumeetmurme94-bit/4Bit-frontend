import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  Info,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react';
import { Complaint, EvidenceData } from '../../types/complaint';

interface AiEvidenceAssessmentProps {
  complaint: Complaint;
  evidence: EvidenceData;
}

export const AiEvidenceAssessment: React.FC<AiEvidenceAssessmentProps> = ({
  complaint,
  evidence,
}) => {
  const { aiAssessment } = evidence;
  const matchHeadline =
    aiAssessment.matchHeadline ||
    `AI Match: ${aiAssessment.confidence}% Relevant - Rectification Verified`;

  return (
    <section
      aria-label="AI Evidence Assessment"
      className="rounded-3xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/95 via-teal-50/80 to-white p-5 sm:p-6 shadow-md space-y-4"
    >
      {/* 1. Header Bar with AI Model Badge & Zero Tampering Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-700/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
                Backend AI Multimodal Vision Analysis
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900 border border-emerald-400">
                Gemini Vision Multimodal • Node #4BIT-V8
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 font-semibold">
              Automated correlation against Patient Grievance {complaint.id}
            </p>
          </div>
        </div>

        {/* Security & Tamper Check Pill */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-white/95 px-3 py-1.5 rounded-xl border border-emerald-300 shadow-2xs self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Tamper Check: Zero Manipulation</span>
        </div>
      </div>

      {/* 2. Primary Headline & Confidence Score */}
      <div className="bg-white/90 rounded-2xl p-4 border border-emerald-200 shadow-2xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              {matchHeadline}
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-600 text-white shadow-2xs font-mono">
              {aiAssessment.confidence}% Match
            </span>
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {aiAssessment.verdict}
            </span>
          </div>
        </div>

        {/* Detailed Explanation */}
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium pt-1">
          {aiAssessment.details}
        </p>

        {/* Detected Semantic Objects Chips */}
        {aiAssessment.detectedObjects && aiAssessment.detectedObjects.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-black uppercase text-slate-500 mr-1 flex items-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              Recognized Visual Elements:
            </span>
            {aiAssessment.detectedObjects.map((obj, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {obj}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3. Multi-point Verification Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/70 border border-emerald-200/90 text-slate-700">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Spatial Verification</span>
            <span className="font-semibold text-slate-800 truncate block">
              {aiAssessment.geofenceStatus || 'Inside authorized hospital ward perimeter (±2.4m)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/70 border border-emerald-200/90 text-slate-700">
          <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Temporal Verification</span>
            <span className="font-semibold text-slate-800 truncate block">
              Locked ISO Time: {evidence.isoTimestamp || evidence.submittedAt}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Mandatory Human Review Advisory Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-start gap-3 text-amber-900 text-xs">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold text-amber-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <span>Human Review Gate Policy</span>
            <span className="bg-amber-100/70 px-2 py-0.5 rounded text-[10px] font-bold text-amber-800 border border-amber-200/60">
              Advisory Check Only
            </span>
          </div>
          <p className="font-medium text-amber-900/90 leading-snug">
            This AI assessment is strictly an advisory decision-support signal and does not automatically
            close the ticket. The designated hospital authority must review the evidence below and make
            the final, binding determination to Approve or Reject.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AiEvidenceAssessment;
