import React from 'react';
import {
  Heart,
  PhoneCall,
  Sparkles,
  HeartHandshake,
  Building2,
  ShieldCheck,
  LifeBuoy,
  ArrowUpRight,
} from 'lucide-react';

export const PatientReassurance: React.FC = () => {
  return (
    <section
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full"
      aria-label="Patient Reassurance and Support Resources"
    >
      {/* Alma-Inspired Empathetic Banner with Soft Emerald Tint (Task 2) */}
      <div className="relative overflow-hidden rounded-3xl bg-emerald-50/50 border border-emerald-100/90 shadow-sm p-6 sm:p-10 lg:p-12">
        {/* Soft Organic Ambient Background Circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-72 h-72 rounded-full bg-amber-100/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* ================================================================= */}
          {/* COLUMN 1: WARM, REASSURING HUMAN-CENTRIC MESSAGE                  */}
          {/* ================================================================= */}
          <div className="lg:col-span-7 space-y-5">
            {/* Soft Empathetic Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-950 text-xs font-semibold border border-emerald-200/80">
              <Heart className="w-3.5 h-3.5 text-emerald-800 fill-emerald-800/20" />
              <span>Community Dignity &bull; Patient-Centered Care</span>
            </div>

            {/* Alma-Style Editorial Heading */}
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-emerald-950 tracking-tight leading-snug">
                Your voice builds a better hospital.
              </h2>
              <p className="text-base sm:text-lg font-medium text-emerald-900 leading-relaxed border-l-2 border-emerald-800 pl-3.5">
                Every grievance reported helps us maintain the highest standard of care for our
                community.
              </p>
            </div>

            {/* Reassuring Prose */}
            <p className="text-sm text-stone-600 leading-relaxed max-w-xl">
              We believe quality healthcare extends beyond clinical prescriptions—it lives in how
              deeply we listen. Whether it is ensuring clean water on every floor, replenishing
              wheelchairs at the gate, or resolving prescription delays, your feedback directly
              shapes our daily standards. You are our partner in healing.
            </p>

            {/* Privacy & Dignity Guarantee */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-stone-500 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Strict Non-PII Safeguards
              </span>
              <span className="hidden sm:inline text-stone-300">&bull;</span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                Every Voice Valued &amp; Heard
              </span>
            </div>
          </div>

          {/* ================================================================= */}
          {/* COLUMN 2: EMERGENCY & SUPPORT RESOURCES (MUTED GOLD ICONS)        */}
          {/* ================================================================= */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-emerald-100/80 shadow-soft space-y-4">
              <div className="space-y-1 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-emerald-950 tracking-tight">
                    Emergency &amp; Support Resources
                  </h3>
                </div>
                <p className="text-[11px] text-stone-500">
                  Immediate assistance, emotional counseling, and direct leadership lines.
                </p>
              </div>

              {/* Resource 1: 108 Emergency Medical Services */}
              <a
                href="tel:108"
                className="group p-3.5 rounded-xl bg-stone-50/80 hover:bg-emerald-50/70 border border-stone-200/80 hover:border-emerald-300/80 transition-all flex items-center justify-between gap-3 block"
                title="Tap to call 108 Emergency Ambulance"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Muted Champagne Gold Icon */}
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-600/70 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-amber-500/20 group-hover:border-amber-500/60 transition-all">
                    <PhoneCall className="w-5 h-5 text-amber-600/70 group-hover:text-amber-700 transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-emerald-950 tracking-wide">
                        108
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-amber-50/90 text-amber-800/80 border border-amber-500/30 px-1.5 py-0.5 rounded">
                        24/7 Immediate
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-stone-800 truncate">
                      Emergency Ambulance &amp; Casualty
                    </p>
                    <p className="text-[10px] text-stone-500 truncate">
                      Citywide critical trauma &amp; hospital intake dispatch
                    </p>
                  </div>
                </div>

                <div className="p-1.5 rounded-lg bg-white text-stone-500 group-hover:bg-emerald-900 group-hover:text-amber-200 transition-colors shrink-0 border border-stone-200/70">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </a>

              {/* Resource 2: Local Mental Health Helpline */}
              <a
                href="tel:14416"
                className="group p-3.5 rounded-xl bg-stone-50/80 hover:bg-emerald-50/70 border border-stone-200/80 hover:border-emerald-300/80 transition-all flex items-center justify-between gap-3 block"
                title="Tap to call Tele-MANAS Mental Health Support"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Muted Champagne Gold Icon */}
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-600/70 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-amber-500/20 group-hover:border-amber-500/60 transition-all">
                    <LifeBuoy className="w-5 h-5 text-amber-600/70 group-hover:text-amber-700 transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-emerald-950 tracking-wide">
                        14416 &bull; Tele-MANAS
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-amber-50/90 text-amber-800/80 border border-amber-500/30 px-1.5 py-0.5 rounded">
                        Toll-Free &bull; Anonymous
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-stone-800 truncate">
                      Mental Health &amp; Emotional Helpline
                    </p>
                    <p className="text-[10px] text-stone-500 truncate">
                      Free 24/7 confidential psychological care &amp; guidance
                    </p>
                  </div>
                </div>

                <div className="p-1.5 rounded-lg bg-white text-stone-500 group-hover:bg-emerald-900 group-hover:text-amber-200 transition-colors shrink-0 border border-stone-200/70">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </a>

              {/* Resource 3: Hospital Superintendent's Direct Desk Line */}
              <a
                href="tel:08022984420"
                className="group p-3.5 rounded-xl bg-stone-50/80 hover:bg-emerald-50/70 border border-stone-200/80 hover:border-emerald-300/80 transition-all flex items-center justify-between gap-3 block"
                title="Tap to call Medical Superintendent Desk"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Muted Champagne Gold Icon */}
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-600/70 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-amber-500/20 group-hover:border-amber-500/60 transition-all">
                    <Building2 className="w-5 h-5 text-amber-600/70 group-hover:text-amber-700 transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-950 tracking-wide">
                        (080) 2298-4420
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-amber-50/90 text-amber-800/80 border border-amber-500/30 px-1.5 py-0.5 rounded">
                        Admin Desk
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-stone-800 truncate">
                      Medical Superintendent &amp; Grievance Desk
                    </p>
                    <p className="text-[10px] text-stone-500 truncate">
                      Room 101, Administrative Wing (Mon–Sat, 9 AM – 5 PM)
                    </p>
                  </div>
                </div>

                <div className="p-1.5 rounded-lg bg-white text-stone-500 group-hover:bg-emerald-900 group-hover:text-amber-200 transition-colors shrink-0 border border-stone-200/70">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PatientReassurance;
