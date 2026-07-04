// SVG Food Illustrations
const FoodImage = ({ type, className }) => {
  const images = {
    burrata: (
      <svg viewBox="0 0 200 200" className={className}>
        <defs>
          <linearGradient id="plate1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5f5f5" />
            <stop offset="100%" stopColor="#e8e8e8" />
          </linearGradient>
        </defs>
        <ellipse cx="100" cy="110" rx="85" ry="30" fill="#d4d4d4" />
        <ellipse cx="100" cy="100" rx="85" ry="30" fill="url(#plate1)" />
        <ellipse cx="100" cy="90" rx="70" ry="22" fill="#fefefe" />
        <circle cx="100" cy="85" r="35" fill="#fff8e7" />
        <ellipse cx="100" cy="80" rx="30" ry="25" fill="#fffdf5" />
        <path
          d="M85 75 Q100 60 115 75"
          stroke="#3d3d3d"
          strokeWidth="0.5"
          fill="none"
        />
        <circle cx="90" cy="72" r="2" fill="#2d2d2d" />
        <circle cx="110" cy="72" r="2" fill="#2d2d2d" />
        <path
          d="M60 95 Q65 85 75 90"
          stroke="#5a8c3a"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M125 95 Q130 85 140 90"
          stroke="#5a8c3a"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M70 100 L130 85"
          stroke="#4a3728"
          strokeWidth="1"
          opacity="0.3"
        />
      </svg>
    ),
  };

  return images.burrata;
};

export default FoodImage;