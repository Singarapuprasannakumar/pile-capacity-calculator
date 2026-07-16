/**
 * Tooltip component – wraps any element and shows a description bubble on hover.
 * Usage: <Tooltip text="Engineering definition here"><Label /></Tooltip>
 */
const Tooltip = ({ text, children }) => (
  <div className="tooltip-container">
    {children}
    <span className="tooltip-box">{text}</span>
  </div>
);

export default Tooltip;
