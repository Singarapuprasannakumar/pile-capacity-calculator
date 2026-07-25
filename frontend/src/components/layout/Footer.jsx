import React from 'react';

const Footer = () => {
  return (
    <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-100 mt-auto no-print">
      Civil Engineering Design Suite &nbsp;·&nbsp; For engineering reference only. Consult a licensed geotechnical engineer for design decisions.
    </footer>
  );
};

export default React.memo(Footer);
