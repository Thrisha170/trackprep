import trackprepLogo from '@/assets/trackprep-logo.png';

interface TrackPrepLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  withBackground?: boolean;
}

const TrackPrepLogo: React.FC<TrackPrepLogoProps> = ({ 
  size = 40, 
  className = '',
  showText = false,
  withBackground = false
}) => {
  const logoElement = (
    <img 
      src={trackprepLogo} 
      alt="TrackPrep" 
      style={{ width: size, height: size }}
      className="object-contain"
    />
  );

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {withBackground ? (
        <div className="logo-container flex items-center justify-center">
          {logoElement}
        </div>
      ) : (
        logoElement
      )}
      {showText && (
        <span className="font-display font-bold text-lg text-foreground">
          TrackPrep
        </span>
      )}
    </div>
  );
};

export default TrackPrepLogo;
