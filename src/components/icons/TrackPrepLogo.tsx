import trackprepLogo from '@/assets/trackprep-logo.png';

interface TrackPrepLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

const TrackPrepLogo: React.FC<TrackPrepLogoProps> = ({ 
  size = 40, 
  className = '',
  showText = false 
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={trackprepLogo} 
        alt="TrackPrep" 
        style={{ width: size, height: size }}
        className="object-contain"
      />
      {showText && (
        <span className="font-display font-bold text-lg text-foreground">
          TrackPrep
        </span>
      )}
    </div>
  );
};

export default TrackPrepLogo;
