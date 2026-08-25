import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  RotateCcw,
  Settings,
  X,
  Zap,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { QuotaErrorInfo } from '../utils/quotaParser';

interface QuotaAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotaInfo: QuotaErrorInfo | null;
  onRetry?: () => void;
  onOpenSettings?: () => void;
}

export const QuotaAlertModal: React.FC<QuotaAlertModalProps> = ({
  isOpen,
  onClose,
  quotaInfo,
  onRetry,
  onOpenSettings,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [autoRetry, setAutoRetry] = useState(true);

  useEffect(() => {
    if (quotaInfo?.retryAfterSeconds) {
      setSecondsRemaining(quotaInfo.retryAfterSeconds);
    } else {
      setSecondsRemaining(0);
    }
  }, [quotaInfo]);

  useEffect(() => {
    if (!isOpen || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (autoRetry && onRetry) {
            setTimeout(() => {
              onClose();
              onRetry();
            }, 500);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, secondsRemaining, autoRetry, onRetry, onClose]);

  if (!isOpen || !quotaInfo) return null;

  const formatCountdown = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isTimerReady = secondsRemaining === 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-amber-500/10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Alert Icon */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-950 border border-amber-800 text-amber-400 text-[10px] font-mono font-bold uppercase">
                  {quotaInfo.service}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  HTTP 429 Quota
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                {quotaInfo.headline}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Countdown Card (if timed rate limit) */}
        {quotaInfo.retryAfterSeconds ? (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                isTimerReady ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                <Clock className={`w-5 h-5 ${!isTimerReady ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-mono">Quota Limit Resets In:</p>
                <p className="text-xl sm:text-2xl font-mono font-extrabold text-white">
                  {isTimerReady ? 'LIFTED NOW' : formatCountdown(secondsRemaining)}
                </p>
              </div>
            </div>

            {quotaInfo.resetTimeIso && (
              <div className="text-right font-mono text-[11px] text-slate-400">
                <span className="text-slate-500 block">Exact Lift ETA:</span>
                <span className="text-amber-300 font-bold">
                  {new Date(quotaInfo.resetTimeIso).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        ) : null}

        {/* Description & Action Advice */}
        <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
          <p>{quotaInfo.userMessage}</p>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-emerald-300 flex items-start gap-2">
            <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{quotaInfo.actionAdvice}</span>
          </div>
        </div>

        {/* Auto-Retry Checkbox & Footer Actions */}
        <div className="space-y-3 pt-2">
          {quotaInfo.retryAfterSeconds && quotaInfo.retryAfterSeconds <= 120 && onRetry && (
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer font-mono select-none">
              <input
                type="checkbox"
                checked={autoRetry}
                onChange={(e) => setAutoRetry(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span>Automatically retry request when timer reaches 00:00</span>
            </label>
          )}

          <div className="flex items-center justify-between gap-3">
            {onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>API Settings</span>
              </button>
            )}

            {onRetry && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRetry();
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  isTimerReady
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isTimerReady ? 'Retry Request Now' : 'Retry Anyway'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
