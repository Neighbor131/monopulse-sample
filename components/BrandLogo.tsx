import logoFull from '../assets/brand/monopulse-logo.svg';
import logoMark from '../assets/brand/monopulse-mark.svg';

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

const FULL_SIZE = {
  sm: 'h-5 w-[92px]',
  md: 'h-6 w-[112px]',
  lg: 'h-8 w-[148px]',
};

export default function BrandLogo({ showName = true, size = 'md', className = '' }: BrandLogoProps) {
  if (showName) {
    return (
      <img
        src={logoFull}
        alt="MonoPulse"
        className={`${FULL_SIZE[size]} shrink-0 object-contain object-left ${className}`}
      />
    );
  }

  return (
    <div className={`flex min-w-0 items-center gap-2.5 ${className}`}>
      <img src={logoMark} alt="MonoPulse logogram" className={`${SIZE[size]} shrink-0 object-contain`} />
    </div>
  );
}
