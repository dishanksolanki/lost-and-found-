import React from 'react';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'dark',
  showTagline = false,
  size = 'md',
}) => {
  const iconDimensions = size === 'lg' ? 42 : size === 'sm' ? 28 : 34;
  const isLight = variant === 'light';

  return (
    <div className="flex items-center gap-3 select-none">
      <svg
        width={iconDimensions}
        height={iconDimensions}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        {/* Outer location pin silhouette */}
        <path
          d="M20 3.5C12.544 3.5 6.5 9.43 6.5 16.75C6.5 24.92 15.84 33.48 19.11 36.22C19.63 36.65 20.37 36.65 20.89 36.22C24.16 33.48 33.5 24.92 33.5 16.75C33.5 9.43 27.456 3.5 20 3.5Z"
          fill={isLight ? '#FFFFFF' : '#172B45'}
          stroke={isLight ? '#B99A55' : '#172B45'}
          strokeWidth="1.5"
        />
        {/* Search lens ring in Antique Gold */}
        <circle
          cx="18.5"
          cy="16"
          r="5.6"
          fill={isLight ? '#172B45' : '#F8F6F0'}
          stroke="#B99A55"
          strokeWidth="2.1"
        />
        {/* Search magnifier handle in Antique Gold */}
        <path
          d="M22.7 20.2L26.2 23.7"
          stroke="#B99A55"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
      </svg>

      <div className="min-w-0">
        <div
          className={`font-serif font-semibold tracking-tight leading-tight whitespace-nowrap ${
            size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-base' : 'text-lg'
          } ${isLight ? 'text-white' : 'text-[#172B45]'}`}
        >
          Lost &amp; Found
        </div>
        {showTagline && (
          <p
            className={`text-xs leading-snug mt-0.5 ${
              isLight ? 'text-[#E8E4DA]/80' : 'text-[#777777]'
            }`}
          >
            Every Lost Item Deserves to Find Its Way Home.
          </p>
        )}
      </div>
    </div>
  );
};
