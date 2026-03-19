interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className = "h-14 w-14" }: BrandMarkProps) {
  return (
    <div className={`aegis-brandmark-wrap ${className}`}>
      <svg
        viewBox="0 0 120 132"
        className="h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="aegis-shield-gradient" x1="16" y1="10" x2="104" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F39CCC" />
            <stop offset="0.45" stopColor="#C2186E" />
            <stop offset="1" stopColor="#7C0D49" />
          </linearGradient>
          <radialGradient id="aegis-core-gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60 64) rotate(90) scale(28)">
            <stop stopColor="#FFD9EA" />
            <stop offset="0.62" stopColor="#E867A2" />
            <stop offset="1" stopColor="#9C0C59" />
          </radialGradient>
        </defs>
        <path
          d="M60 8L104 28L95 80L60 124L25 80L16 28L60 8Z"
          stroke="url(#aegis-shield-gradient)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M16 28L60 64L104 28M25 80L60 64L95 80M60 8L60 124M36 46L84 46M42 94L78 94M16 28L25 80M104 28L95 80M36 46L25 80M84 46L95 80M60 8L36 46M60 8L84 46M42 94L16 28M78 94L104 28M42 94L60 124M78 94L60 124"
          stroke="url(#aegis-shield-gradient)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.92"
        />
        <circle cx="60" cy="64" r="19" fill="url(#aegis-core-gradient)" />
        <circle cx="60" cy="64" r="31" fill="url(#aegis-core-gradient)" opacity="0.14" />
        {[
          [60, 8],
          [104, 28],
          [95, 80],
          [60, 124],
          [25, 80],
          [16, 28],
          [36, 46],
          [84, 46],
          [42, 94],
          [78, 94],
          [60, 64],
        ].map(([cx, cy], index) => (
          <circle key={`${cx}-${cy}-${index}`} cx={cx} cy={cy} r="4.9" fill="#B11467" stroke="#FAD5E5" strokeWidth="1.5" />
        ))}
      </svg>
    </div>
  );
}
