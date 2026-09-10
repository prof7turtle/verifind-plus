import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Loader2, X, ExternalLink } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = "info", title, message, txHash, duration = 5000 }) => {
    const id = Date.now() + Math.random().toString();
    const newToast = { id, type, title, message, txHash };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    info: (title, message) => addToast({ type: "info", title, message }),
    success: (title, message, txHash) => addToast({ type: "success", title, message, txHash }),
    error: (title, message) => addToast({ type: "error", title, message, duration: 8000 }),
    pending: (title, message) => addToast({ type: "pending", title, message, duration: 0 }),
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-5 ${
              t.type === "success"
                ? "bg-slate-900/95 border-emerald-500/30 text-emerald-100"
                : t.type === "error"
                ? "bg-slate-900/95 border-rose-500/30 text-rose-100"
                : t.type === "pending"
                ? "bg-slate-900/95 border-sky-500/30 text-sky-100"
                : "bg-slate-900/95 border-slate-700 text-slate-100"
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {t.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {t.type === "pending" && <Loader2 className="w-5 h-5 text-sky-400 animate-spin" />}
              {t.type === "info" && <AlertCircle className="w-5 h-5 text-slate-400" />}
            </div>

            <div className="flex-1 min-w-0">
              {t.title && <h4 className="text-sm font-semibold text-white leading-snug">{t.title}</h4>}
              {t.message && <p className="text-xs text-slate-300 mt-0.5 break-words">{t.message}</p>}
              {t.txHash && (
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-1.5 text-xs text-sky-400 font-mono">
                  <span>Tx: {t.txHash.slice(0, 10)}...{t.txHash.slice(-8)}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white p-1 -mr-1 -mt-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
