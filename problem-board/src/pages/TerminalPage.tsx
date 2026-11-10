import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Siren,
  Building2,
  MapPin,
  Check,
  X,
  ShieldCheck,
  ShieldAlert,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import {
  PRESET_SCENARIOS,
  type SpeechScenario,
  simulateSpeechProcessing,
} from '../utils/speechSimulation';
import {
  detectEmergencyKeywords,
  getEmergencyInstructions,
} from '../utils/emergency';
import {
  stepTransitionVariants,
  scaleStepVariants,
} from '../components/animations';

// The 5 distinct states of the Patient Voice Terminal
export type TerminalStep =
  | 'language_select' // 1. Language Selection
  | 'idle'            // 1b. Idle State with absolute centered "Tap to Speak" button
  | 'recording'       // 2. Active Voice Recording with audio waves & Stop button
  | 'processing'      // 3a. Speech-to-text simulation with loading spinner
  | 'confirmation'    // 3b. Transcript & Extracted Summary with Confirm/Re-record
  | 'success'         // 4. Success state with unique Complaint ID (#VOC-XXXX)
  | 'emergency';      // 5. Emergency redirection to Casualty / Emergency Ward

export type Language = 'kn' | 'en';

/**
 * Task 2: Heavy Spring Physics Curve
 * Solid, tactile feel: transition={{ type: "spring", stiffness: 100, damping: 20 }}
 * Elements slide up slightly (y: 20 -> y: 0) as they fade in.
 */
const heavySpringTransition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 20,
};

const confirmationContainerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

const docketCardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: heavySpringTransition,
  },
};

const trustBadgeVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: heavySpringTransition,
  },
};

const actionButtonsVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: heavySpringTransition,
  },
};

const languageCardsContainerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const languageCardItemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: heavySpringTransition,
  },
};

/**
 * Task 2 Accents: Muted Champagne Pulse Rings radiating outward from button
 * Soft, low-opacity gentle expansion
 */
const sonarRingVariants = {
  animate: (delay: number) => ({
    scale: [1, 1.85],
    opacity: [0.4, 0],
    transition: {
      duration: 2.8,
      repeat: Infinity,
      ease: 'easeOut' as const,
      delay: delay,
    },
  }),
};

export const TerminalPage: React.FC = () => {
  // Navigation & State Flow
  const [step, setStep] = useState<TerminalStep>('language_select');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('kn'); // Default to Kannada
  const [activeScenario] = useState<SpeechScenario>(PRESET_SCENARIOS[0]);

  // Recording state
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [generatedComplaintId, setGeneratedComplaintId] = useState<string>('');
  const timerRef = useRef<number | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle active audio wave & elapsed timer
  useEffect(() => {
    if (step === 'recording') {
      setRecordSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 11) {
            handleStopRecording();
            return 12;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [step]);

  /**
   * TASK 2: COMPLETELY REMOVED FRONTEND TTS (AUDIO)
   * The backend handles all voice connections and audio playback.
   * Selecting Kannada or English transitions INSTANTLY to the microphone state
   * without any local browser voice announcements or speech synthesis delays.
   */
  const handleSelectLanguage = (lang: Language) => {
    setSelectedLanguage(lang);
    setStep('idle');
  };

  // 1b. Idle -> Start Recording (Instant transition, zero frontend audio)
  const handleStartRecording = () => {
    setStep('recording');
  };

  // 2. Stop Recording -> Speech-to-Text Processing & Emergency Detection
  const handleStopRecording = () => {
    setStep('processing');

    // Simulate speech-to-text processing delay (2.2s)
    simulateSpeechProcessing(2200).then(() => {
      const fullTranscript = `${activeScenario.transcriptEn} ${activeScenario.transcriptKn}`;
      const isEmergency = activeScenario.isEmergency || detectEmergencyKeywords(fullTranscript);

      if (isEmergency) {
        triggerEmergencyFlow();
      } else {
        setStep('confirmation');
      }
    });
  };

  // 5. Emergency Trigger Path (Casualty redirection)
  const triggerEmergencyFlow = () => {
    setStep('emergency');
  };

  // 3b. Confirm -> Generate unique Complaint ID & Show Success
  const handleConfirmSubmission = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const id = `#VOC-${randomCode}`;
    setGeneratedComplaintId(id);
    setStep('success');
  };

  // 3b. Re-record -> Reset to Idle
  const handleRerecord = () => {
    setRecordSeconds(0);
    setStep('idle');
  };

  // Reset entirely back to language selection
  const handleResetTerminal = () => {
    setRecordSeconds(0);
    setGeneratedComplaintId('');
    setStep('language_select');
  };

  const emergencyInfo = getEmergencyInstructions();

  return (
    <div className={`relative w-full ${step === 'idle' ? 'h-screen overflow-hidden' : 'min-h-[calc(100vh-4rem)] flex flex-col justify-between p-3 sm:p-6 lg:p-8 pb-24 sm:pb-28 pt-20 sm:pt-24'}`}>
      {/* ------------------------------------------------------------- */}
      {/* KIOSK BACKGROUND TEXTURE & HOSPITAL WATERMARK                 */}
      {/* Soft off-white (bg-neutral-50) with subtle emerald texture    */}
      {/* ------------------------------------------------------------- */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 opacity-30"
        style={{
          backgroundImage: `radial-gradient(rgba(6, 78, 59, 0.10) 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      <div
        className="fixed inset-0 flex items-center justify-center pointer-events-none -z-10 select-none overflow-hidden"
        aria-hidden="true"
      >
        <svg
          className="w-[480px] h-[480px] sm:w-[620px] sm:h-[620px] text-emerald-900/[0.03] fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
        </svg>
      </div>

      {/* Main Terminal Frame */}
      <div className={`w-full ${step === 'idle' ? 'h-full' : 'max-w-4xl mx-auto flex-1 flex flex-col justify-center my-auto'}`}>
        <AnimatePresence mode="wait">
          {/* ------------------------------------------------------------- */}
          {/* STEP 1: LANGUAGE SELECTION (Off-White / Emerald / Champagne)  */}
          {/* ------------------------------------------------------------- */}
          {step === 'language_select' && (
            <motion.div
              key="language_select"
              variants={stepTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ willChange: 'transform, opacity' }}
              className="bg-neutral-50/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 md:p-14 shadow-xl border border-neutral-200/90 text-center space-y-8 sm:space-y-10"
            >
              {/* Header / Hospital Terminal Badge */}
              <div className="space-y-3 sm:space-y-4 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 text-amber-700/80 border border-amber-300/35 text-xs sm:text-sm font-semibold shadow-xs">
                  <Building2 className="w-4 h-4 text-amber-700/80" />
                  <span>City General Hospital • Terminal #01</span>
                </div>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-emerald-900 tracking-tight leading-tight">
                  ದಯವಿಟ್ಟು ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ
                </h1>
                <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-neutral-800">
                  Please select your language to begin
                </p>
                <p className="text-sm sm:text-base md:text-lg text-neutral-500 font-medium">
                  Direct voice recording • No writing or typing required
                </p>
              </div>

              {/* Task 2: Language Cards with Heavy Spring Physics & Muted Champagne */}
              <motion.div
                variants={languageCardsContainerVariants}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 max-w-2xl mx-auto pt-2"
              >
                {/* Kannada Option */}
                <motion.button
                  variants={languageCardItemVariants}
                  whileHover={{ scale: 1.02, translateY: -3 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => handleSelectLanguage('kn')}
                  className="group relative p-6 sm:p-8 md:p-10 rounded-3xl bg-white hover:bg-neutral-50 text-slate-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center space-y-3 sm:space-y-4 border border-neutral-200/90 hover:border-amber-400/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/25"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-900 to-emerald-950 text-amber-200/90 border border-amber-400/25 flex items-center justify-center text-3xl sm:text-4xl font-black shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
                    ಕ
                  </div>
                  <div className="space-y-1 text-center">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 block tracking-tight">
                      ಕನ್ನಡ
                    </span>
                    <span className="text-sm sm:text-base font-bold text-neutral-600 block">
                      Kannada (ಆಯ್ಕೆ ಮಾಡಲು ಸ್ಪರ್ಶಿಸಿ)
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 text-amber-700/80 border border-amber-300/35 text-[11px] sm:text-xs font-semibold">
                    <Mic className="w-3.5 h-3.5 text-amber-700/80" /> ಧ್ವನಿ ಮೂಲಕ ದೂರು ದಾಖಲಿಸಲು ಒತ್ತಿ
                  </span>
                </motion.button>

                {/* English Option */}
                <motion.button
                  variants={languageCardItemVariants}
                  whileHover={{ scale: 1.02, translateY: -3 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => handleSelectLanguage('en')}
                  className="group relative p-6 sm:p-8 md:p-10 rounded-3xl bg-white hover:bg-neutral-50 text-slate-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center space-y-3 sm:space-y-4 border border-neutral-200/90 hover:border-amber-400/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/25"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-900 to-emerald-950 text-amber-200/90 border border-amber-400/25 flex items-center justify-center text-2xl sm:text-3xl font-black shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
                    En
                  </div>
                  <div className="space-y-1 text-center">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 block tracking-tight">
                      English
                    </span>
                    <span className="text-sm sm:text-base font-bold text-neutral-600 block">
                      (Tap to Select)
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 text-amber-700/80 border border-amber-300/35 text-[11px] sm:text-xs font-semibold">
                    <Mic className="w-3.5 h-3.5 text-amber-700/80" /> Voice Complaint in English
                  </span>
                </motion.button>
              </motion.div>

              {/* Simple Hospital Help Guidance */}
              <div className="text-xs text-neutral-400 font-medium pt-2">
                Need physical help? Counter 1 assistance staff is stationed 10 feet away.
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 1b: IDLE STATE - BULLETPROOF ABSOLUTE CENTERING          */}
          {/* Task 1: Parent has `relative w-full h-screen`                 */}
          {/* Immediate wrapper has:                                        */}
          {/* `absolute top-1/2 left-1/2 transform -translate-x-1/2         */}
          {/*  -translate-y-1/2 flex flex-col items-center justify-center    */}
          {/*  w-full`                                                      */}
          {/* ------------------------------------------------------------- */}
          {step === 'idle' && (
            <motion.div
              key="idle"
              variants={stepTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ willChange: 'transform, opacity' }}
              className="relative w-full h-screen"
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full">
                <div className="flex flex-col items-center justify-center w-full px-4 text-center space-y-6 sm:space-y-8 max-w-3xl mx-auto">
                  {/* Header Information */}
                  <div className="space-y-2 sm:space-y-3 max-w-xl mx-auto flex flex-col items-center">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 text-amber-700/80 border border-amber-300/35 text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-2xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400/50 animate-ping" />
                    <span>Kiosk Ready • {selectedLanguage === 'kn' ? 'ಕನ್ನಡ (Kannada)' : 'English (Selected)'}</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-900 tracking-tight leading-tight">
                    {selectedLanguage === 'kn' ? 'ಮಾತನಾಡಲು ಹಸಿರು ಗುಂಡಿಯನ್ನು ಒತ್ತಿ' : 'Tap the Emerald Button to Speak'}
                  </h1>
                  <p className="text-base sm:text-xl text-neutral-600 font-medium">
                    {selectedLanguage === 'kn'
                      ? 'ನಿಮ್ಮ ಆಸ್ಪತ್ರೆಯ ಸಮಸ್ಯೆ ಮತ್ತು ವಾರ್ಡ್ ವಿವರಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ.'
                      : 'Describe your hospital grievance clearly. Voice AI will transcribe and route it.'}
                  </p>
                </div>

                {/* Task 2: Pulse Animation Parent Container */}
                <div className="relative flex justify-center items-center w-full py-4 sm:py-6">
                  {/* Task 2 Accents: Muted Champagne Pulse Rings */}
                  {[0, 0.9, 1.8].map((delay, index) => (
                    <motion.div
                      key={index}
                      custom={delay}
                      variants={sonarRingVariants}
                      animate="animate"
                      className="absolute inset-0 m-auto w-40 h-40 rounded-full border border-amber-400/30 bg-amber-400/10 pointer-events-none"
                    />
                  ))}

                  {/* Soft ambient champagne background glow */}
                  <div className="absolute inset-0 m-auto w-40 h-40 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />

                  {/* Task 1: Strict Centered Main Deep Emerald Green Button Container */}
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    aria-label="Start Voice Recording"
                    className="flex flex-col items-center justify-center w-40 h-40 rounded-full bg-emerald-900 hover:bg-emerald-950 active:scale-95 text-white shadow-xl mx-auto relative z-10 transition-transform p-0 m-0 border-0 cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-400/30"
                  >
                    <Mic className="w-12 h-12 text-amber-200/90 m-0 p-0 shrink-0" aria-hidden="true" />
                    <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white m-0 p-0 text-center leading-tight mt-1">
                      {selectedLanguage === 'kn' ? 'ಪ್ರಾರಂಭಿಸಿ' : 'TAP TO SPEAK'}
                    </span>
                  </button>
                </div>

                {/* High-Contrast Large Instruction Banner with Deep Emerald & Soft Champagne Accent */}
                <div className="w-full max-w-xl mx-auto space-y-3 flex flex-col items-center">
                  <div className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-950 text-white border-2 border-amber-400/30 shadow-xl w-full">
                    <span className="flex h-3 w-3 relative shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400/50 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400/70"></span>
                    </span>
                    <span className="text-base sm:text-lg md:text-xl font-black tracking-tight text-neutral-100 text-center">
                      {selectedLanguage === 'kn'
                        ? 'ನೇರ ಧ್ವನಿ ಮುದ್ರಣ • ಯಾವುದೇ ಬರವಣಿಗೆ ಅಥವಾ ಟೈಪಿಂಗ್ ಅಗತ್ಯವಿಲ್ಲ'
                        : 'Direct voice recording • No writing or typing required'}
                    </span>
                  </div>

                  {/* Change Language Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleResetTerminal}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-emerald-950 bg-neutral-100/90 hover:bg-neutral-200/90 border border-neutral-200/80 px-4 py-2 rounded-xl transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-700/80" />
                      <span>{selectedLanguage === 'kn' ? 'ಭಾಷೆ ಬದಲಾಯಿಸಿ (Change Language)' : 'Change Language / ಭಾಷೆ ಬದಲಿಸಿ'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 2: RECORDING STATE (Wave Animations & Red Stop Button)   */}
          {/* ------------------------------------------------------------- */}
          {step === 'recording' && (
            <motion.div
              key="recording"
              variants={stepTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ willChange: 'transform, opacity' }}
              className="bg-neutral-50/95 backdrop-blur-md rounded-3xl border-4 border-rose-500 p-6 sm:p-10 md:p-12 shadow-2xl text-center space-y-6 sm:space-y-8"
            >
              {/* Header with live timer */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs sm:text-sm font-black uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                  <span>RECORDING LIVE • ಧ್ವನಿ ಮುದ್ರಣವಾಗುತ್ತಿದೆ</span>
                </div>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-emerald-900 tracking-tight">
                  {selectedLanguage === 'kn' ? 'ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಹೇಳಿ...' : 'Listening to your grievance...'}
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-neutral-600 font-medium">
                  {selectedLanguage === 'kn'
                    ? 'ದಯವಿಟ್ಟು ಮೈಕ್ರೊಫೋನ್ ಕಡೆಗೆ ಮುಖಮಾಡಿ ಮಾತನಾಡಿ.'
                    : 'Speak naturally into the terminal. Tap the Red button when finished.'}
                </p>
              </div>

              {/* Audio Wave Simulation */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 h-24 sm:h-32 px-4">
                {[40, 75, 30, 95, 60, 85, 45, 90, 70, 35, 80, 50, 90, 65, 40].map((height, i) => (
                  <motion.span
                    key={i}
                    animate={{
                      height: [`${height * 0.3}%`, `${height}%`, `${height * 0.4}%`],
                    }}
                    transition={{
                      duration: 0.8 + (i % 5) * 0.15,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="w-1.5 sm:w-2.5 bg-gradient-to-t from-rose-600 to-rose-400 rounded-full"
                  />
                ))}
              </div>

              {/* Elapsed Timer Counter */}
              <div className="font-mono text-2xl sm:text-3xl font-black text-rose-600">
                00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds}
                <span className="text-xs text-neutral-400 font-sans block font-semibold mt-1">
                  (Auto-stops after 12 seconds)
                </span>
              </div>

              {/* Stop Recording Button */}
              <div className="pt-2 max-w-sm mx-auto">
                <Button
                  variant="danger"
                  size="xl"
                  fullWidth
                  onClick={handleStopRecording}
                  className="h-16 sm:h-20 text-xl sm:text-2xl font-black rounded-2xl shadow-lg hover:bg-rose-700 active:scale-95 transition-transform"
                >
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-white mr-3 shrink-0" />
                  <span>{selectedLanguage === 'kn' ? 'ನಿಲ್ಲಿಸಿ (STOP)' : 'STOP RECORDING'}</span>
                </Button>
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 3a: PROCESSING STATE (Simulation Spinner)                */}
          {/* ------------------------------------------------------------- */}
          {step === 'processing' && (
            <motion.div
              key="processing"
              variants={scaleStepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ willChange: 'transform, opacity' }}
              className="bg-neutral-50/95 backdrop-blur-md rounded-3xl p-8 sm:p-14 md:p-20 shadow-xl border border-neutral-200 text-center space-y-6 sm:space-y-8"
            >
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto">
                <div className="absolute inset-0 rounded-full border-8 border-amber-400/20 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-8 border-emerald-900 border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-amber-700/80">
                  <Sparkles className="w-10 h-10 sm:w-14 sm:h-14 animate-bounce text-amber-700/80" />
                </div>
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-2xl sm:text-4xl font-black text-emerald-900 tracking-tight">
                  {selectedLanguage === 'kn' ? 'ಧ್ವನಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Processing Grievance Voice...'}
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 font-medium">
                  {selectedLanguage === 'kn'
                    ? 'ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ (AI) ನಿಮ್ಮ ಮಾತಿನಿಂದ ಪ್ರಮುಖ ವಿವರಗಳನ್ನು ಸಂಗ್ರಹಿಸುತ್ತಿದೆ.'
                    : 'Transcribing speech, detecting department, and verifying safety keywords.'}
                </p>
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 3b: CONFIRMATION STATE - "OFFICIAL DOCKET" WITH STAGGER  */}
          {/* ------------------------------------------------------------- */}
          {step === 'confirmation' && (
            <motion.div
              key="confirmation"
              variants={confirmationContainerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ willChange: 'transform, opacity' }}
              className="bg-neutral-50/95 backdrop-blur-md rounded-3xl border-2 border-emerald-900/15 p-5 sm:p-8 md:p-10 shadow-card space-y-5 sm:space-y-6"
            >
              {/* Header Title */}
              <div className="text-center space-y-1.5 pb-2 border-b border-neutral-200/80">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 text-amber-700/80 border border-amber-300/35 text-xs font-semibold">
                  <Check className="w-4 h-4 text-amber-700/80" />
                  <span>Official Docket Review • ಅಧಿಕೃತ ದೃಢೀಕರಣ ಹಂತ</span>
                </span>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-emerald-900 tracking-tight">
                  {selectedLanguage === 'kn' ? 'ದಯವಿಟ್ಟು ಅಧಿಕೃತ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ' : 'Official Grievance Docket Review'}
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-neutral-600 font-medium">
                  {selectedLanguage === 'kn'
                    ? 'ನಿಮ್ಮ ಧ್ವನಿ ಮುದ್ರಣದಿಂದ ಗುರುತಿಸಲಾದ ಅಧಿಕೃತ ವಿವರಗಳು ಕೆಳಗಿವೆ.'
                    : 'Please review the official complaint details before final submission to hospital duty staff.'}
                </p>
              </div>

              {/* 1. First Animated Element: The "Official Docket" Pure White Card with Soft Shadow */}
              <motion.div
                variants={docketCardVariants}
                className="w-full"
              >
                <Card
                  variant="subtle"
                  padding="none"
                  className="bg-white border border-neutral-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm space-y-4"
                >
                  {/* Official Docket Header Strip */}
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-700/80" />
                      <span className="font-mono text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-950">
                        Official Docket • {activeScenario.id.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-700/80 border border-amber-300/35">
                      Kiosk Node #01
                    </span>
                  </div>

                  {/* 2. Second Animated Element: Trust Badge (Above Summary) with Spring Physics */}
                  <motion.div
                    variants={trustBadgeVariants}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200/90 text-xs sm:text-sm font-semibold shadow-2xs"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Secure Hospital Network - Privacy Protected</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-pulse hidden sm:inline" />
                  </motion.div>

                  {/* Complaint Details with Clear Visual Dividers */}
                  <div className="space-y-4 pt-1">
                    {/* Summary Section */}
                    <div className="space-y-1">
                      <span className="text-[11px] sm:text-xs uppercase font-extrabold text-amber-700/80 tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-700/80" />
                        <span>{selectedLanguage === 'kn' ? 'ದೂರಿನ ಸಾರಾಂಶ (Summary)' : 'Grievance Summary'}</span>
                      </span>
                      <p className="text-base sm:text-lg md:text-xl font-bold text-emerald-950 leading-snug">
                        {selectedLanguage === 'kn' ? activeScenario.summaryKn : activeScenario.summaryEn}
                      </p>
                    </div>

                    {/* Visual Divider 1 */}
                    <div className="border-t border-neutral-200/80 my-3" />

                    {/* Category Section */}
                    <div className="space-y-1">
                      <span className="text-[11px] sm:text-xs uppercase font-extrabold text-neutral-500 tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-700/80" />
                        <span>{selectedLanguage === 'kn' ? 'ವಿಭಾಗ / ವರ್ಗ (Category)' : 'Service Category'}</span>
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-neutral-900">
                          {selectedLanguage === 'kn'
                            ? activeScenario.category || activeScenario.departmentKn
                            : activeScenario.category || activeScenario.departmentEn}
                        </span>
                        <span className="text-xs font-semibold bg-amber-400/15 text-amber-700/80 border border-amber-300/35 px-2.5 py-0.5 rounded-md">
                          {selectedLanguage === 'kn' ? activeScenario.departmentKn : activeScenario.departmentEn}
                        </span>
                      </div>
                    </div>

                    {/* Visual Divider 2 */}
                    <div className="border-t border-neutral-200/80 my-3" />

                    {/* Location / Ward Section */}
                    <div className="space-y-1">
                      <span className="text-[11px] sm:text-xs uppercase font-extrabold text-neutral-500 tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-700/80" />
                        <span>{selectedLanguage === 'kn' ? 'ಸ್ಥಳ / ವಾರ್ಡ್ (Location / Ward)' : 'Hospital Location / Ward'}</span>
                      </span>
                      <p className="text-sm sm:text-base font-bold text-neutral-900">
                        {selectedLanguage === 'kn' ? activeScenario.wardKn : activeScenario.wardEn}
                      </p>
                    </div>

                    {/* Visual Divider 3 & Audio Transcript */}
                    <div className="border-t border-neutral-200/80 my-3" />
                    <div className="space-y-1 bg-neutral-50/80 p-3 rounded-xl border border-neutral-200/70">
                      <span className="text-[11px] uppercase font-extrabold text-neutral-400 tracking-wider block">
                        {selectedLanguage === 'kn' ? 'ನಿಮ್ಮ ನಿಖರ ಧ್ವನಿ ಮುದ್ರಣ (Audio Transcript)' : 'Exact Spoken Audio Transcript'}
                      </span>
                      <p className="text-xs sm:text-sm text-neutral-600 italic">
                        "{selectedLanguage === 'kn' ? activeScenario.transcriptKn : activeScenario.transcriptEn}"
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* 3. Third Animated Element: Action Buttons Sliding Up with Spring Physics */}
              <motion.div
                variants={actionButtonsVariants}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-3"
              >
                <Button
                  variant="primary"
                  size="xl"
                  fullWidth
                  onClick={handleConfirmSubmission}
                  leftIcon={<CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300/80" />}
                  className="h-14 sm:h-16 text-lg sm:text-xl font-black bg-emerald-900 hover:bg-emerald-950 shadow-lg"
                >
                  {selectedLanguage === 'kn' ? 'ಖಚಿತಪಡಿಸಿ ಮತ್ತು ಕಳುಹಿಸಿ (CONFIRM)' : 'CONFIRM & SUBMIT'}
                </Button>

                <Button
                  variant="outline"
                  size="xl"
                  onClick={handleRerecord}
                  leftIcon={<RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-600" />}
                  className="h-14 sm:h-16 text-base sm:text-lg font-bold border-2"
                >
                  {selectedLanguage === 'kn' ? 'ಮತ್ತೆ ಮಾತನಾಡಿ (RE-RECORD)' : 'RE-RECORD AUDIO'}
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 4: SUCCESS STATE (Unique Complaint ID & StatusBadge)      */}
          {/* ------------------------------------------------------------- */}
          {step === 'success' && (
            <motion.div
              key="success"
              variants={scaleStepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ willChange: 'transform, opacity' }}
              className="bg-neutral-50/95 backdrop-blur-md rounded-3xl border-4 border-emerald-600 p-6 sm:p-10 md:p-12 shadow-card text-center space-y-6 sm:space-y-8"
            >
              <div className="w-16 h-16 sm:w-22 sm:h-22 mx-auto rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-10 h-10 sm:w-14 sm:h-14 text-emerald-900" />
              </div>

              <div className="space-y-2 sm:space-y-3 max-w-xl mx-auto">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-emerald-900 tracking-tight">
                  {selectedLanguage === 'kn'
                    ? 'ದೂರು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ!'
                    : 'Complaint Successfully Registered!'}
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-neutral-600 font-medium">
                  {selectedLanguage === 'kn'
                    ? 'ನಿಮ್ಮ ದೂರನ್ನು ಆಸ್ಪತ್ರೆ ಕರ್ತವ್ಯ ಅಧಿಕಾರಿಗೆ ತಲುಪಿಸಲಾಗಿದೆ.'
                    : 'Your grievance has been assigned and logged in the hospital transparency system.'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 border-2 border-amber-400/30 rounded-3xl p-5 sm:p-7 md:p-8 max-w-lg mx-auto shadow-inner space-y-2.5">
                <div className="text-[11px] sm:text-xs uppercase font-extrabold text-amber-200/80 tracking-widest">
                  {selectedLanguage === 'kn' ? 'ನಿಮ್ಮ ದೂರು ಸಂಖ್ಯೆ (COMPLAINT ID)' : 'YOUR COMPLAINT REFERENCE ID'}
                </div>
                <div className="text-3xl sm:text-5xl md:text-6xl font-black font-mono text-amber-300/90 tracking-wider">
                  {generatedComplaintId || '#VOC-8291'}
                </div>
                <div className="pt-1.5 flex items-center justify-center gap-2.5">
                  <span className="text-xs font-semibold text-neutral-300">Initial State:</span>
                  <StatusBadge status="Received" size="lg" showDot={true} />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-sm text-left max-w-xl mx-auto space-y-2 text-xs sm:text-sm text-neutral-700">
                <div className="font-bold text-emerald-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-700/80" />
                  <span>{selectedLanguage === 'kn' ? 'ಮುಂದಿನ ಹಂತಗಳು:' : 'What happens next:'}</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-neutral-600">
                  <li>
                    {selectedLanguage === 'kn'
                      ? 'ಈ ದೂರು ಸಂಖ್ಯೆಯನ್ನು ನೆನಪಿಟ್ಟುಕೊಳ್ಳಿ ಅಥವಾ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ.'
                      : 'Please remember or take a picture of your Complaint ID.'}
                  </li>
                  <li>
                    {selectedLanguage === 'kn'
                      ? 'ಆಸ್ಪತ್ರೆಯ ಸಿಬ್ಬಂದಿ ಮುಂದಿನ 20 ನಿಮಿಷಗಳಲ್ಲಿ ಪರಿಶೀಲನೆ ಆರಂಭಿಸುತ್ತಾರೆ.'
                      : 'Responsible hospital staff is notified and required to acknowledge within 20 minutes.'}
                  </li>
                  <li>
                    {selectedLanguage === 'kn'
                      ? 'ಯಾವುದೇ ಕಿಯೋಸ್ಕ್ ಅಥವಾ ಸಾರ್ವಜನಿಕ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಬಹುದು.'
                      : 'You can check the live status at any hospital kiosk or the public transparency portal.'}
                  </li>
                </ul>
              </div>

              <div className="pt-2 sm:pt-4 max-w-md mx-auto">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleResetTerminal}
                  rightIcon={<ArrowRight className="w-5 h-5 text-amber-300/80" />}
                  className="h-14 sm:h-16 text-base sm:text-lg font-black bg-emerald-900 hover:bg-emerald-950"
                >
                  {selectedLanguage === 'kn' ? 'ಮುಗಿಸಿ / ಹೊಸ ದೂರು (FINISH)' : 'FINISH / RECORD ANOTHER'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 5: EMERGENCY PATH (Bold Red Screen to Casualty Ward)     */}
          {/* ------------------------------------------------------------- */}
          {step === 'emergency' && (
            <motion.div
              key="emergency"
              variants={scaleStepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ willChange: 'transform, opacity' }}
              className="bg-rose-700 text-white rounded-3xl border-8 border-rose-950 p-6 sm:p-10 md:p-14 shadow-2xl text-center space-y-6 sm:space-y-8 animate-pulse"
            >
              <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto rounded-full bg-white text-rose-700 flex items-center justify-center shadow-2xl animate-bounce">
                <Siren className="w-12 h-12 sm:w-16 sm:h-16" />
              </div>

              <div className="space-y-3 sm:space-y-4 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/20 text-white text-xs sm:text-sm font-black uppercase tracking-widest border border-white/30">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300/80" />
                  <span>CRITICAL MEDICAL EMERGENCY DETECTED • ತುರ್ತು ಅಪಾಯ</span>
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tight leading-tight uppercase">
                  DO NOT WAIT FOR A COMPLAINT!
                </h1>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-amber-200/90">
                  ದಯವಿಟ್ಟು ತಕ್ಷಣವೇ ತುರ್ತು ಚಿಕಿತ್ಸಾ (ಕ್ಯಾಶುಯಲ್ಟಿ) ಕೊಠಡಿಗೆ ತೆರಳಿ!
                </h2>

                <p className="text-base sm:text-xl md:text-2xl font-bold text-white/95 leading-relaxed">
                  Keywords indicating severe medical distress (such as heart attack, acute pain, or breathing failure) were detected.
                </p>
              </div>

              <div className="bg-white text-slate-900 rounded-3xl p-5 sm:p-7 md:p-8 max-w-2xl mx-auto shadow-2xl space-y-3 sm:space-y-4 text-left border-4 border-amber-400/40">
                <div className="flex items-center gap-3 border-b border-neutral-200 pb-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-lg sm:text-xl shrink-0">
                    !
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-2xl font-black text-rose-700 uppercase">
                      HOW TO REACH CASUALTY RIGHT NOW
                    </h3>
                    <p className="text-[11px] sm:text-sm text-neutral-600 font-bold">
                      {emergencyInfo.casualtyLocation}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 sm:space-y-3 text-sm sm:text-base md:text-lg font-bold text-slate-800">
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 font-extrabold text-xs sm:text-sm">
                      1
                    </span>
                    <p>
                      Follow the <span className="text-rose-600 font-black uppercase">BOLD RED LINE</span> marked on the hospital floor right outside this kiosk.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 font-extrabold text-xs sm:text-sm">
                      2
                    </span>
                    <p>
                      Casualty is <span className="font-black">50 meters straight ahead</span> on the Ground Floor (Near Ambulance Bay).
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 font-extrabold text-sm">
                      3
                    </span>
                    <p>
                      Hospital emergency code alert has been automatically dispatched to the duty doctor.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={`tel:${emergencyInfo.emergencyExtension}`}
                    className="w-full h-14 sm:h-16 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white flex items-center justify-center gap-2.5 sm:gap-3 text-lg sm:text-xl font-black shadow-lg transition"
                  >
                    <PhoneCall className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
                    <span>CALL EMERGENCY CODE RED: EXT {emergencyInfo.emergencyExtension}</span>
                  </a>
                </div>
              </div>

              <div className="pt-2 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={handleResetTerminal}
                  className="text-white/80 hover:text-white underline text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 mx-auto py-2"
                >
                  <X className="w-4 h-4" />
                  <span>False Alarm / Return to Voice Terminal (ತಪ್ಪು ಎಚ್ಚರಿಕೆ)</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* HOSPITAL REGULATIONS FIXED FOOTER                             */}
      {/* ------------------------------------------------------------- */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-50/95 backdrop-blur-md border-t border-neutral-200/90 py-2.5 px-4 shadow-sm text-center">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-[11px] sm:text-xs text-neutral-600 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-700/80 shrink-0 hidden sm:inline" />
          <p className="leading-tight">
            Official Hospital Grievance Terminal. Misuse of this facility is strictly prohibited. Emergency cases must proceed directly to the Casualty / Emergency Ward.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TerminalPage;
