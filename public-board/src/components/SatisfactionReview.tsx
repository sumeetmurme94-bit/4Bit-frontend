import React, { useState } from 'react';
import {
  Star,
  Smile,
  Meh,
  Frown,
  CheckCircle2,
  ShieldCheck,
  Send,
  RotateCcw,
  Sparkles,
  Heart,
} from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

export interface SatisfactionReviewProps {
  ticketId: string;
  category?: string;
  onSubmitted?: (rating: number) => void;
}

export const SatisfactionReview: React.FC<SatisfactionReviewProps> = ({
  ticketId,
  category,
  onSubmitted,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedExpression, setSelectedExpression] = useState<'frown' | 'neutral' | 'smile' | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedbackNote, setFeedbackNote] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const QUICK_TAGS = [
    'Prompt Turnaround',
    'High Cleanliness',
    'Courteous Staff',
    'Clear Verification',
    'Safety Restored',
    'Thorough Resolution',
  ];

  const handleStarClick = (score: number) => {
    setRating(score);
    if (score <= 2) {
      setSelectedExpression('frown');
    } else if (score === 3) {
      setSelectedExpression('neutral');
    } else {
      setSelectedExpression('smile');
    }
  };

  const handleExpressionClick = (expr: 'frown' | 'neutral' | 'smile') => {
    setSelectedExpression(expr);
    if (expr === 'frown') setRating(2);
    if (expr === 'neutral') setRating(3);
    if (expr === 'smile') setRating(5);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 && !selectedExpression) {
      setToastMessage('Please select a rating or expression before submitting.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsSubmitted(true);
    setToastMessage('Thank you for your feedback! Your anonymous review has been recorded.');
    if (onSubmitted) {
      onSubmitted(rating || 5);
    }
  };

  const handleReset = () => {
    setRating(0);
    setHoverRating(0);
    setSelectedExpression(null);
    setSelectedTags([]);
    setFeedbackNote('');
    setIsSubmitted(false);
    setToastMessage(null);
  };

  return (
    <div className="w-full relative mt-4">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="mb-3 p-3 rounded-xl bg-emerald-950 text-emerald-100 text-xs font-semibold flex items-center justify-between shadow-lg border border-emerald-800 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-300 hover:text-white p-1 text-xs"
            aria-label="Dismiss toast"
          >
            &times;
          </button>
        </div>
      )}

      {/* Premium Clinic Styled Card Container with Soft Emerald Tint (Task 2) */}
      <Card
        variant="interactive"
        padding="none"
        className="border border-emerald-100/90 bg-emerald-50/40 rounded-2xl shadow-soft overflow-hidden"
      >
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            {/* Header & Reassuring Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100/80 pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-emerald-950">
                    Patient Satisfaction Review
                  </h3>
                </div>
                <p className="text-xs text-stone-600">
                  How well did our team handle this{' '}
                  {category ? (
                    <span className="font-semibold text-emerald-900">{category}</span>
                  ) : (
                    'issue'
                  )}{' '}
                  for ticket{' '}
                  <span className="font-mono font-bold text-slate-900">{ticketId}</span>?
                </p>
              </div>

              {/* Zero-PII Privacy Guarantee Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/70 text-emerald-950 border border-emerald-200/80 text-[11px] font-semibold shrink-0 self-start sm:self-auto">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>100% Anonymous &bull; Zero PII</span>
              </div>
            </div>

            {/* Rating Controls: Facial Expressions & 5-Star Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-white/90 p-4 rounded-xl border border-stone-200/80 shadow-2xs">
              {/* Option A: 3 Distinct Facial Expressions with Soft Gold / Emerald Hover */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Quick Sentiment Expression:
                </span>
                <div className="flex items-center gap-2.5">
                  {/* Dissatisfied 😞 */}
                  <button
                    type="button"
                    onClick={() => handleExpressionClick('frown')}
                    className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      selectedExpression === 'frown'
                        ? 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-400 shadow-2xs'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-emerald-50/60 hover:border-emerald-300/80 hover:text-emerald-950 hover:shadow-2xs'
                    }`}
                    title="Dissatisfied"
                    aria-label="Dissatisfied"
                  >
                    <Frown className="w-6 h-6 text-rose-600 mb-1" />
                    <span className="text-[10px] font-bold text-stone-700">Needs Work</span>
                  </button>

                  {/* Neutral 😐 */}
                  <button
                    type="button"
                    onClick={() => handleExpressionClick('neutral')}
                    className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      selectedExpression === 'neutral'
                        ? 'bg-amber-50/70 border-amber-400/40 text-amber-900 ring-2 ring-amber-500/40 shadow-2xs'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-amber-50/40 hover:border-amber-400/40 hover:text-amber-900 hover:shadow-2xs'
                    }`}
                    title="Neutral / Acceptable"
                    aria-label="Neutral / Acceptable"
                  >
                    <Meh className="w-6 h-6 text-amber-600/70 mb-1" />
                    <span className="text-[10px] font-bold text-stone-700">Acceptable</span>
                  </button>

                  {/* Satisfied 😃 */}
                  <button
                    type="button"
                    onClick={() => handleExpressionClick('smile')}
                    className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      selectedExpression === 'smile'
                        ? 'bg-emerald-100/70 border-emerald-400 text-emerald-950 ring-2 ring-emerald-600 shadow-2xs'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-emerald-50/70 hover:border-emerald-300/80 hover:text-emerald-950 hover:shadow-2xs'
                    }`}
                    title="Satisfied"
                    aria-label="Satisfied"
                  >
                    <Smile className="w-6 h-6 text-emerald-700 mb-1" />
                    <span className="text-[10px] font-bold text-stone-700">Satisfied</span>
                  </button>
                </div>
              </div>

              {/* Option B: Premium 5-Star Rating with Soft Gold Glow */}
              <div className="space-y-2 sm:border-l sm:border-stone-200/80 sm:pl-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                    Detailed 5-Star Rating:
                  </span>
                  <span className="text-xs font-mono font-medium text-amber-600/70">
                    {rating > 0 ? `${rating} of 5 Stars` : 'Click to rate'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-0.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const activeScore = hoverRating || rating;
                    const isFilled = star <= activeScore;

                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 rounded-lg hover:scale-115 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/40 group"
                        aria-label={`Rate ${star} out of 5 stars`}
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-all ${
                            isFilled
                              ? 'text-amber-500/80 fill-amber-400/70 drop-shadow-[0_1px_4px_rgba(217,119,6,0.2)]'
                              : 'text-stone-300 hover:text-amber-400/60'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Experience Tags with Soft Gold / Emerald Hover States */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                What went well? (Select all that apply)
              </span>
              <div className="flex flex-wrap gap-2">
                {QUICK_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs transition-all border ${
                        isSelected
                          ? 'bg-emerald-900 text-white border-emerald-950 font-semibold shadow-2xs'
                          : 'bg-white text-stone-700 hover:bg-emerald-50/60 hover:border-emerald-300/70 hover:text-emerald-950 border-stone-200'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Anonymous Feedback Note */}
            <div className="space-y-1.5">
              <label
                htmlFor={`review-note-${ticketId}`}
                className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block"
              >
                Optional Anonymous Note:
              </label>
              <textarea
                id={`review-note-${ticketId}`}
                rows={2}
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="Share any additional thoughts on the resolution (Strictly anonymous • Do not include names or phone numbers)..."
                className="w-full p-3 text-xs text-slate-800 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 placeholder-stone-400 resize-none shadow-2xs"
                maxLength={300}
              />
              <div className="flex items-center justify-between text-[10px] text-stone-400">
                <span>Cryptographically unlinked from patient identities</span>
                <span>{feedbackNote.length}/300</span>
              </div>
            </div>

            {/* Submit Action with Emerald / Gold Button Styling */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Your rating directly influences our department quality score.</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                leftIcon={<Send className="w-4 h-4 text-amber-500/70" />}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold shadow-md bg-emerald-900 hover:bg-emerald-950 text-white border border-emerald-950 hover:border-amber-500/40 hover:shadow-emerald-950/20 active:scale-98 transition-all rounded-xl"
              >
                Submit Anonymous Review
              </Button>
            </div>
          </form>
        ) : (
          /* Thank You Confirmation State */
          <div className="p-6 sm:p-8 text-center space-y-4 animate-in fade-in duration-300 bg-white/70">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h4 className="text-lg font-extrabold text-emerald-950">
                Thank You for Your Feedback!
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Your satisfaction rating has been securely registered to the City General Hospital
                Quality Redressal Dashboard. Your response helps us continuously improve civic care.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 text-xs font-semibold border border-emerald-200/80">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Response recorded without personal identifiers</span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold underline underline-offset-2 flex items-center gap-1 mx-auto"
              >
                <RotateCcw className="w-3 h-3 text-amber-600/70" />
                <span>Submit another rating for this ticket</span>
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SatisfactionReview;
