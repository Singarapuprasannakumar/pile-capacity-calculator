import Tooltip from './Tooltip';

/**
 * Reusable labelled input field with optional tooltip and validation error.
 */
const FormField = ({
  label,
  id,
  type = 'number',
  value,
  onChange,
  placeholder = '',
  tooltip,
  error,
  step = 'any',
  min,
  max,
  className = '',
  disabled = false,
}) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <div className="flex items-center gap-1.5">
      {tooltip ? (
        <Tooltip text={tooltip}>
          <label htmlFor={id} className="form-label cursor-help">
            {label}
          </label>
          <svg
            className="w-3 h-3 text-slate-400 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </Tooltip>
      ) : (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
    </div>
    <input
      id={id}
      type={type}
      step={step}
      min={min}
      max={max}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`form-input ${error ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : ''}`}
    />
    {error && (
      <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {error}
      </p>
    )}
  </div>
);

export default FormField;
