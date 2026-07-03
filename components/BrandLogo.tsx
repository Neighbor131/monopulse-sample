import logoFull from '../assets/brand/monopulse-logo.svg';
import logoFullLight from '../assets/brand/monopulse-logo-light.svg';
import logoMark from '../assets/brand/monopulse-mark.svg';
import logoMarkLight from '../assets/brand/monopulse-mark-light.svg';

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
      <span className={`relative block ${FULL_SIZE[size]} shrink-0 ${className}`}>
        <img
          src={logoFull}
          alt="MonoPulse"
          className="brand-logo-dark absolute inset-0 h-full w-full object-contain object-left"
        />
        <img
          src={logoFullLight}
          alt="MonoPulse"
          className="brand-logo-light absolute inset-0 h-full w-full object-contain object-left"
        />
      </span>
    );
  }

  return (
    <span className={`relative block ${SIZE[size]} shrink-0 ${className}`}>
      <img src={logoMark} alt="MonoPulse logogram" className="brand-logo-dark absolute inset-0 h-full w-full object-contain" />
      <img src={logoMarkLight} alt="MonoPulse logogram" className="brand-logo-light absolute inset-0 h-full w-full object-contain" />
    </span>
  );
}
