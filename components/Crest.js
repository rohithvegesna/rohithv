/* The signature: a winged porcelain-enamel crest for R.V.V. Hand-drawn SVG,
   no external assets. Decorative sign text is enumerated in the v7 report. */
export default function Crest({ className = "" }) {
  return (
    <svg
      viewBox="0 0 340 200"
      className={className}
      role="img"
      aria-label="Winged service-station crest with the initials R V V"
    >
      {/* wings */}
      <g fill="var(--green)" stroke="var(--ink)" strokeWidth="3">
        <path d="M158 96 L30 60 C22 58 22 66 28 70 L96 112 Z" />
        <path d="M160 112 L44 92 C36 91 37 99 43 101 L104 124 Z" />
        <path d="M182 96 L310 60 C318 58 318 66 312 70 L244 112 Z" />
        <path d="M180 112 L296 92 C304 91 303 99 297 101 L236 124 Z" />
      </g>
      <g fill="var(--porcelain)" stroke="var(--ink)" strokeWidth="2">
        <path d="M150 90 L52 64 C46 62.5 46 68 51 71 L104 104 Z" />
        <path d="M190 90 L288 64 C294 62.5 294 68 289 71 L236 104 Z" />
      </g>
      {/* shield */}
      <path
        d="M170 22 C150 34 128 38 112 38 C112 96 118 138 170 168 C222 138 228 96 228 38 C212 38 190 34 170 22 Z"
        fill="var(--porcelain)"
        stroke="var(--ink)"
        strokeWidth="4"
      />
      <path
        d="M170 32 C153 42 136 46 122 46.5 C123 94 130 130 170 156 C210 130 217 94 218 46.5 C204 46 187 42 170 32 Z"
        fill="var(--green)"
      />
      <text
        x="170"
        y="102"
        textAnchor="middle"
        fontFamily="var(--font-jost), sans-serif"
        fontWeight="700"
        fontSize="52"
        letterSpacing="2"
        fill="var(--porcelain)"
      >
        RVV
      </text>
      <text
        x="170"
        y="126"
        textAnchor="middle"
        fontFamily="var(--font-jost), sans-serif"
        fontWeight="600"
        fontSize="11.5"
        letterSpacing="1.5"
        fill="var(--cream)"
      >
        EST. 2015
      </text>
      {/* banner */}
      <g>
        <path
          d="M96 158 L244 158 L252 176 L244 174 L96 174 L88 176 Z"
          fill="var(--red)"
          stroke="var(--ink)"
          strokeWidth="3"
        />
        <text
          x="170"
          y="170.5"
          textAnchor="middle"
          fontFamily="var(--font-jost), sans-serif"
          fontWeight="600"
          fontSize="12.5"
          letterSpacing="4.5"
          fill="var(--paper)"
        >
          FULL SERVICE
        </text>
      </g>
    </svg>
  );
}
