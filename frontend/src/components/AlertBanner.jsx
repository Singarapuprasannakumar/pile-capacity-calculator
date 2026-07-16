/**
 * Alert banner for success / error feedback.
 * type: 'success' | 'error' | 'info'
 */
const AlertBanner = ({ type = 'info', title, message, onClose }) => {
  const config = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: 'text-green-500',
      titleColor: 'text-green-800',
      msgColor: 'text-green-700',
      svg: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: 'text-red-500',
      titleColor: 'text-red-800',
      msgColor: 'text-red-700',
      svg: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-500',
      titleColor: 'text-blue-800',
      msgColor: 'text-blue-700',
      svg: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
  };

  const c = config[type];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${c.bg} animate-slide-up`}
      role="alert"
    >
      <svg
        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${c.icon}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {c.svg}
      </svg>
      <div className="flex-1 min-w-0">
        {title && <p className={`text-sm font-semibold ${c.titleColor}`}>{title}</p>}
        {message && <p className={`text-sm mt-0.5 ${c.msgColor}`}>{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
