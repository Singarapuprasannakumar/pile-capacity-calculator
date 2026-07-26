import React from 'react';

export default function UnderReamedPileDiagram({ D, Du, Cp, Ca_dash, Ca }) {
  // Normalize values for rendering
  const stemWidth = 24; // base pixel width for stem
  const bulbWidth = Du > 0 ? stemWidth * 2.5 : stemWidth * 2.5;
  
  const centerX = 100;
  const stemLeft = centerX - stemWidth / 2;
  const stemRight = centerX + stemWidth / 2;
  
  const bulbLeft = centerX - bulbWidth / 2;
  const bulbRight = centerX + bulbWidth / 2;

  return (
    <div className="h-60 bg-slate-950/70 rounded-xl relative border border-slate-800/80 overflow-hidden flex items-center justify-center select-none">
      <svg width="100%" height="100%" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        
        {/* Ground Line */}
        <line x1="10" y1="30" x2="230" y2="30" stroke="#16a34a" strokeWidth="2" strokeDasharray="3 3" />
        <text x="15" y="25" fill="#16a34a" fontSize="8" fontWeight="bold">GL (Ground Level)</text>

        {/* Cohesion Zones Labels */}
        {/* Stem Cohesion Ca */}
        <rect x="15" y="60" width="65" height="26" rx="4" fill="#1e293b" stroke="#334155" />
        <text x="20" y="72" fill="#94a3b8" fontSize="7" fontWeight="bold">STEM FRICTION</text>
        <text x="20" y="82" fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace">Ca = {Ca.toFixed(1)} kPa</text>
        <path d="M 80 73 L 95 73" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" markerEnd="url(#arrow)" />

        {/* Bulb Cohesion Ca_dash */}
        <rect x="15" y="140" width="65" height="26" rx="4" fill="#1e293b" stroke="#334155" />
        <text x="20" y="152" fill="#94a3b8" fontSize="7" fontWeight="bold">BULB BEARING</text>
        <text x="20" y="162" fill="#34d399" fontSize="8" fontWeight="bold" fontFamily="monospace">Ca' = {Ca_dash.toFixed(1)} kPa</text>
        <path d="M 80 153 L 92 153" stroke="#34d399" strokeWidth="1" strokeDasharray="2 2" markerEnd="url(#arrow)" />

        {/* Tip Cohesion Cp */}
        <rect x="15" y="195" width="65" height="26" rx="4" fill="#1e293b" stroke="#334155" />
        <text x="20" y="207" fill="#94a3b8" fontSize="7" fontWeight="bold">TIP BEARING</text>
        <text x="20" y="217" fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace">Cp = {Cp.toFixed(1)} kPa</text>
        <path d="M 80 208 L 95 208" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" markerEnd="url(#arrow)" />

        {/* Pile Shaft & Bulb */}
        {/* Main Stem Upper */}
        <rect x={stemLeft} y="30" width={stemWidth} height="110" fill="#475569" stroke="#64748b" strokeWidth="1.5" />
        
        {/* Under-Reamed Bulb shape */}
        <path d={`
          M ${stemLeft} 140 
          L ${bulbLeft} 150 
          L ${bulbLeft} 165 
          L ${stemLeft} 175 
          L ${stemRight} 175 
          L ${bulbRight} 165 
          L ${bulbRight} 150 
          L ${stemRight} 140 
          Z
        `} fill="#475569" stroke="#64748b" strokeWidth="1.5" strokeLinejoin="round" />

        {/* Main Stem Lower */}
        <rect x={stemLeft} y="175" width={stemWidth} height="35" fill="#475569" stroke="#64748b" strokeWidth="1.5" />
        
        {/* Pile Base/Tip */}
        <path d={`M ${stemLeft} 210 Q ${centerX} 216 ${stemRight} 210`} stroke="#64748b" strokeWidth="1.5" fill="#475569" />

        {/* Dimension Lines */}
        {/* Stem Diameter D */}
        <line x1={stemLeft} y1="45" x2={stemRight} y2="45" stroke="#38bdf8" strokeWidth="1" />
        <circle cx={stemLeft} cy="45" r="1.5" fill="#38bdf8" />
        <circle cx={stemRight} cy="45" r="1.5" fill="#38bdf8" />
        <text x={centerX} y="41" fill="#38bdf8" fontSize="7.5" fontWeight="bold" textAnchor="middle">D = {D > 0 ? D.toFixed(2) : '-'}m</text>

        {/* Bulb Diameter Du */}
        <line x1={bulbLeft} y1="158" x2={bulbRight} y2="158" stroke="#34d399" strokeWidth="1" />
        <circle cx={bulbLeft} cy="158" r="1.5" fill="#34d399" />
        <circle cx={bulbRight} cy="158" r="1.5" fill="#34d399" />
        <text x={centerX} y="154" fill="#34d399" fontSize="7.5" fontWeight="bold" textAnchor="middle">Du = {D > 0 ? Du.toFixed(2) : '-'}m</text>

        {/* Bulb Height L1 */}
        <line x1="165" y1="140" x2="165" y2="175" stroke="#94a3b8" strokeWidth="1" />
        <path d="M 165 140 L 165 137" stroke="#94a3b8" strokeWidth="1" />
        <path d="M 165 175 L 165 178" stroke="#94a3b8" strokeWidth="1" />
        <text x="172" y="161" fill="#94a3b8" fontSize="7.5" fontWeight="bold">L1</text>

        {/* Additional Shaft Extension Le */}
        <line x1="165" y1="175" x2="165" y2="210" stroke="#a8a29e" strokeWidth="1" />
        <path d="M 165 210 L 165 213" stroke="#a8a29e" strokeWidth="1" />
        <text x="172" y="196" fill="#a8a29e" fontSize="7.5" fontWeight="bold">Le = 0.3m</text>

        {/* Markers Definition */}
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="context-stroke" />
          </marker>
        </defs>

      </svg>
    </div>
  );
}
