/**
 * Loading spinner overlay / inline spinner.
 */
const Spinner = ({ fullscreen = false, message = 'Calculating…' }) => {
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
        <SpinnerSVG size={48} />
        <p className="mt-4 text-sm font-medium text-slate-600 animate-pulse-subtle">{message}</p>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <SpinnerSVG size={18} />
      <span className="text-sm text-slate-600">{message}</span>
    </div>
  );
};

const SpinnerSVG = ({ size = 24 }) => (
  <svg
    className="animate-spin text-primary-600"
    style={{ width: size, height: size }}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export default Spinner;
