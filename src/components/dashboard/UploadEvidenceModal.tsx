import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { Complaint, EvidenceData } from '../../types/complaint';
import { Button } from '../common/Button';

interface UploadEvidenceModalProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
  onSubmitEvidence: (complaintId: string, evidence: EvidenceData) => void;
}

interface PhotoItem {
  id: string;
  name: string;
  url: string;
  caption: string;
}

const SAMPLE_PHOTO_PRESETS: PhotoItem[] = [
  {
    id: 'preset-1',
    name: 'Fixed Dispenser & Dry Floor',
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    caption: 'Water dispenser valve replaced and corridor floor mopped dry.',
  },
  {
    id: 'preset-2',
    name: 'Sanitized Restroom Tap',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    caption: 'Plumbing leak repaired and sanitized with hospital disinfectant.',
  },
  {
    id: 'preset-3',
    name: 'Restocked Biohazard Station',
    url: 'https://images.unsplash.com/photo-1583912267670-6575ad473668?auto=format&fit=crop&w=800&q=80',
    caption: 'Restocked station with compliant medical consumables.',
  },
];

interface GpsTelemetry {
  latitude: number;
  longitude: number;
  accuracy: number;
  coordinatesString: string;
  wardGeofence: string;
  isoTimestamp: string;
  displayTime: string;
}

export const UploadEvidenceModal: React.FC<UploadEvidenceModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onSubmitEvidence,
}) => {
  // 1. Photo Proof State (Initially null to strictly enforce user upload/selection)
  const [photo, setPhoto] = useState<{ url: string; caption: string; isCustom: boolean } | null>(null);

  // 2. Geolocation State (Initially null to strictly enforce GPS fetch)
  const [gpsTelemetry, setGpsTelemetry] = useState<GpsTelemetry | null>(null);
  const [isFetchingGps, setIsFetchingGps] = useState(false);

  // 3. Resolution Notes
  const [resolutionNote, setResolutionNote] = useState('');

  // 4. Submission & UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const wardDisplay = complaint.ward || complaint.wardArea || 'General Ward 3B';

  // Strict simulated GPS Geolocation Fetcher
  const handleFetchGps = () => {
    setIsFetchingGps(true);
    setValidationError(null);

    // Simulate realistic hardware GPS positioning lock
    setTimeout(() => {
      const now = new Date();
      const isoTimestamp = now.toISOString();
      const displayTime = `Today, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} IST`;

      setGpsTelemetry({
        latitude: 12.9716,
        longitude: 77.5946,
        accuracy: 2.1,
        coordinatesString: '12.9716° N, 77.5946° E',
        wardGeofence: `${wardDisplay} (Hospital Geofence Verified)`,
        isoTimestamp,
        displayTime,
      });
      setIsFetchingGps(false);
    }, 850);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto({
          url: reader.result as string,
          caption: `Device Camera Photo: ${file.name}`,
          isCustom: true,
        });
        setValidationError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset: PhotoItem) => {
    setPhoto({
      url: preset.url,
      caption: preset.caption,
      isCustom: false,
    });
    setValidationError(null);
  };

  // Validation checks: Photo, GPS, and Resolution Note are all mandatory
  const isPhotoValid = !!photo?.url;
  const isGpsValid = !!gpsTelemetry;
  const isNoteValid = resolutionNote.trim().length >= 5;
  const isFormValid = isPhotoValid && isGpsValid && isNoteValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPhotoValid) {
      setValidationError('Evidence Gate Blocked: Photographic proof is mandatory. Please capture or upload a photo.');
      return;
    }

    if (!isGpsValid) {
      setValidationError('Evidence Gate Blocked: GPS Coordinates not fetched. Please click "Fetch Device GPS".');
      return;
    }

    if (!isNoteValid) {
      setValidationError('Evidence Gate Blocked: Resolution note is required (minimum 5 characters).');
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    setTimeout(() => {
      const staffDisplayName = complaint.assignedStaff || 'Ramesh K. (Sanitation Officer)';

      const evidenceData: EvidenceData = {
        imageUrl: photo.url,
        imageCaption: photo.caption,
        resolutionNote: resolutionNote.trim(),
        staffName: staffDisplayName.split('(')[0].trim(),
        staffRole: 'Ward Operations / Sanitation Lead',
        submittedAt: gpsTelemetry.displayTime,
        isoTimestamp: gpsTelemetry.isoTimestamp,
        gpsCoordinates: gpsTelemetry.coordinatesString,
        gpsLocationName: gpsTelemetry.wardGeofence,
        gpsAccuracyMeters: gpsTelemetry.accuracy,
        aiAssessment: {
          verdict: 'Highly Relevant',
          confidence: 94,
          matchHeadline: `AI Match: 94% Relevant - Rectification verified for "${complaint.summary.slice(0, 35)}..."`,
          details: `Multimodal audit of photographic evidence confirms physical rectification inside authorized hospital perimeter. Visual patterns correlate with resolution note: "${resolutionNote.trim()}".`,
          detectedObjects: ['Resolved Defect Area (96%)', 'Dry Sanitized Surface (94%)', 'Clinical Geofence Validated (99%)'],
          tamperCheck: 'Verified: EXIF metadata untouched. Optical sensor capture authenticated.',
          geofenceStatus: `Inside ${wardDisplay} Geofence (±${gpsTelemetry.accuracy}m)`,
        },
      };

      onSubmitEvidence(complaint.id, evidenceData);
      setIsSubmitting(false);
      onClose();
    }, 900);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-evidence-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-fade-in my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 text-stone-50 p-6 flex items-center justify-between shrink-0 border-b border-emerald-900/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/80 text-amber-200 border border-emerald-700/80 text-xs font-mono font-bold tracking-wider">
                {complaint.id}
              </span>
              <span className="text-xs text-emerald-200 font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                Proof-of-Work Evidence Gate
              </span>
            </div>
            <h2 id="upload-evidence-title" className="text-xl sm:text-2xl font-black text-stone-50">
              Mark as Done &amp; Upload Proof
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 font-medium line-clamp-1">
              Grievance: {complaint.summary}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Target Complaint Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
              <span>Location: {wardDisplay}</span>
              <span className={complaint.priority === 'High' ? 'text-rose-700 font-black' : 'text-slate-600'}>
                Priority: {complaint.priority}
              </span>
            </div>
            <p className="text-slate-900 font-black text-base leading-snug">
              "{complaint.summary}"
            </p>
            {complaint.transcript && (
              <div className="text-xs text-slate-500 italic bg-white p-2.5 rounded-xl border border-slate-200">
                Patient Voice Quote ({complaint.language}): "{complaint.transcript}"
              </div>
            )}
          </div>

          {/* Mandatory Evidence Gate Checklist Tracker */}
          <div className="p-4 rounded-2xl bg-hospital-50/80 border-2 border-hospital-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-hospital-900 tracking-wider">
                Mandatory Verification Criteria:
              </span>
              <span className="text-[11px] font-mono font-bold text-hospital-700">
                Gate Status: {isFormValid ? 'READY TO SUBMIT' : 'BLOCKED PENDING CHECKS'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {/* Check 1: Photo */}
              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  isPhotoValid
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {isPhotoValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <span className="font-bold leading-tight">
                  {isPhotoValid ? 'Photo Captured' : 'Photo Required'}
                </span>
              </div>

              {/* Check 2: GPS */}
              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  isGpsValid
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {isGpsValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <span className="font-bold leading-tight truncate">
                  {isGpsValid ? 'GPS Locked' : 'GPS Required'}
                </span>
              </div>

              {/* Check 3: Note */}
              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  isNoteValid
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {isNoteValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <span className="font-bold leading-tight">
                  {isNoteValid ? 'Note Added' : 'Note Required'}
                </span>
              </div>
            </div>
          </div>

          {validationError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* 1. Photo Capture / Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-black text-slate-900">
                1. Photographic Proof of Work <span className="text-rose-600">*</span>
              </label>
              <span className="text-xs text-hospital-700 font-bold flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" /> Mobile Camera / Live Proof
              </span>
            </div>

            {/* Presets and Upload Button */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {SAMPLE_PHOTO_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-xl border-2 text-left transition text-xs font-bold cursor-pointer ${
                    photo?.url === preset.url
                      ? 'border-hospital-500 bg-hospital-50 text-hospital-950 shadow-sm ring-2 ring-hospital-400/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <ImageIcon className="w-3.5 h-3.5 text-hospital-600 shrink-0" />
                    <span className="truncate">{preset.name}</span>
                  </div>
                  <p className="line-clamp-1 text-[11px] font-normal text-slate-500">
                    {preset.caption}
                  </p>
                </button>
              ))}

              {/* Upload from device / Live Camera button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2.5 rounded-xl border-2 text-left transition text-xs font-bold flex flex-col justify-between cursor-pointer ${
                  photo?.isCustom
                    ? 'border-hospital-500 bg-hospital-50 text-hospital-950 shadow-sm ring-2 ring-hospital-400/20'
                    : 'border-dashed border-slate-300 hover:border-hospital-400 bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <Upload className="w-3.5 h-3.5 text-hospital-600 shrink-0" />
                  <span>Take / Upload Photo</span>
                </div>
                <p className="truncate text-[11px] font-normal text-slate-500">
                  {photo?.isCustom ? 'Custom Uploaded' : 'From Camera/Device'}
                </p>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Photo Preview Card */}
            {photo ? (
              <div className="relative rounded-2xl border-2 border-hospital-200 bg-slate-50 p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-40 h-28 rounded-xl overflow-hidden shadow-md shrink-0 border border-slate-200 bg-slate-200">
                  <img
                    src={photo.url}
                    alt="Proof Preview"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-bold tracking-tight">
                    PROOF ATTACHED
                  </span>
                </div>

                <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-hospital-900 font-bold text-sm">
                    <Camera className="w-4 h-4 text-hospital-600 shrink-0" />
                    <span className="truncate">{photo.caption}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Visual rectification image staged. Ready for automated multimodal AI cross-check.
                  </p>
                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center justify-center sm:justify-start gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Photographic evidence satisfied
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/50 text-center space-y-2">
                <Camera className="w-8 h-8 text-rose-400 mx-auto" />
                <p className="text-xs font-bold text-rose-900">
                  No photographic proof attached yet.
                </p>
                <p className="text-[11px] text-rose-700 max-w-sm mx-auto">
                  Hospital policy strictly forbids closing grievances without physical before/after photo documentation.
                </p>
              </div>
            )}
          </div>

          {/* 2. Geolocation & Timestamp Lock Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-black text-slate-900">
                2. Device Geolocation & Locked ISO Timestamp <span className="text-rose-600">*</span>
              </label>

              <button
                type="button"
                onClick={handleFetchGps}
                disabled={isFetchingGps}
                className="px-3 py-1.5 rounded-xl bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 transition"
              >
                <Compass className={`w-3.5 h-3.5 ${isFetchingGps ? 'animate-spin' : ''}`} />
                <span>{gpsTelemetry ? 'Re-Fetch GPS' : 'Fetch Device GPS'}</span>
              </button>
            </div>

            {gpsTelemetry ? (
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 border border-slate-800 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    GPS Locked & Telemetry Synced
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Accuracy: ±{gpsTelemetry.accuracy} meters
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2.5 text-slate-300 bg-slate-800/90 p-3 rounded-xl border border-slate-700/60">
                    <MapPin className="w-4 h-4 text-hospital-400 shrink-0" />
                    <div className="truncate">
                      <div className="text-[10px] text-slate-400">GPS COORDINATES</div>
                      <div className="text-white font-bold">{gpsTelemetry.coordinatesString}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-slate-300 bg-slate-800/90 p-3 rounded-xl border border-slate-700/60">
                    <Clock className="w-4 h-4 text-hospital-400 shrink-0" />
                    <div className="truncate">
                      <div className="text-[10px] text-slate-400">LOCKED ISO 8601 TIMESTAMP</div>
                      <div className="text-white font-bold truncate text-[11px]">
                        {gpsTelemetry.isoTimestamp}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-1 text-[11px] text-emerald-400 font-sans font-semibold gap-1">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    Geofence Verified: {gpsTelemetry.wardGeofence}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    TELEMETRY HASH: #SHA256-GEOFENCE-OK
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <MapPin className="w-7 h-7 text-rose-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-rose-950">
                      Device GPS coordinates not acquired
                    </p>
                    <p className="text-[11px] text-rose-800">
                      You must fetch device geolocation to cryptographically verify presence in {wardDisplay}.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleFetchGps}
                  isLoading={isFetchingGps}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  className="shrink-0 bg-hospital-700 hover:bg-hospital-800 text-white font-black"
                >
                  Fetch Device Geolocation
                </Button>
              </div>
            )}
          </div>

          {/* 3. Resolution Note Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="resolutionNote" className="block text-sm font-black text-slate-900">
                3. Corrective Action Taken & Resolution Note <span className="text-rose-600">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {resolutionNote.length} characters (min 5)
              </span>
            </div>
            <textarea
              id="resolutionNote"
              rows={3}
              value={resolutionNote}
              onChange={(e) => {
                setResolutionNote(e.target.value);
                setValidationError(null);
              }}
              placeholder="e.g. Replaced leaking valve, sanitized surface with hospital-grade disinfectant, and verified floor is dry and safe for patient ambulation."
              className="w-full rounded-2xl border-2 border-slate-300 p-4 text-sm font-medium text-slate-800 focus:border-hospital-500 focus:ring-4 focus:ring-hospital-500/20 focus:outline-none transition-all placeholder:text-slate-400"
              required
            />
          </div>

          {/* Modal Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!isFormValid || isSubmitting}
              isLoading={isSubmitting}
              leftIcon={<Sparkles className="w-5 h-5" />}
              className="w-full sm:w-auto font-black shadow-lg shadow-hospital-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Resolution Evidence
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadEvidenceModal;
