import { createContext, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function showToast(message, type) {
    const id = Date.now();
    const toastType = type || "success";
    setToasts(function(prev) {
      return prev.concat([{ id, message, type: toastType }]);
    });
    setTimeout(function() {
      setToasts(function(prev) {
        return prev.filter(function(t) { return t.id !== id; });
      });
    }, 3500);
  }

  function getToastClass(type) {
    if (type === "error")   return "bg-red-500/10 border-red-500/30 text-red-400";
    if (type === "warning") return "bg-yellow-400/10 border-yellow-400/30 text-yellow-400";
    return "bg-brand-500/10 border-brand-500/30 text-brand-500";
  }

  function getIcon(type) {
    if (type === "error")   return "✕";
    if (type === "warning") return "⚠";
    return "✓";
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map(function(t) {
          const cls = "flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg backdrop-blur-sm animate-fade-in " + getToastClass(t.type);
          return (
            <div key={t.id} className={cls}>
              <span>{getIcon(t.type)}</span>
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}