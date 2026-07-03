import logoMark from '../assets/brand/monopulse-logogram.png';

interface BrandLogoProps {
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
};

export default function BrandLogo({ showName = true, size = 'md', className = '' }: BrandLogoProps) {
  return (
    <div className={`flex min-w-0 items-center gap-2.5 ${className}`}>
      <img src={logoMark} alt="MonoPulse logogram" className={`${SIZE[size]} shrink-0 object-contain`} />
      {showName && (
        <span className="min-w-0 text-[15px] font-semibold tracking-tight">
          <span className="text-fg-primary">Mono</span>
          <span style={{ color: 'var(--accent)' }}>Pulse</span>
        </span>
      )}
    </div>
  );
}
