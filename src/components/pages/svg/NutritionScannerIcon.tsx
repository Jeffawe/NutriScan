const NutritionScannerIcon = () => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        {/* Background Circle */}
        <circle cx="100" cy="100" r="90" fill="#f0fdf4" stroke="#22c55e" strokeWidth="6" />
  
        {/* Magnifying Glass */}
        <g transform="translate(40, 40) scale(0.8)">
          <circle cx="70" cy="70" r="40" fill="none" stroke="#22c55e" strokeWidth="12" />
          <line x1="100" y1="100" x2="135" y2="135" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" />
        </g>
  
        {/* Leaf in the center of the magnifying glass */}
        <path d="M70,60 C90,40 110,60 110,80 C110,100 90,120 70,100 C50,80 50,80 70,60" fill="#22c55e" />
  
        {/* Apple outline (representing food) */}
        <path
          d="M80,75 Q100,60 120,75 Q130,90 130,110 Q130,135 100,140 Q70,135 70,110 Q70,90 80,75"
          fill="none"
          stroke="#22c55e"
          strokeWidth="4"
          strokeLinecap="round"
        />
  
        {/* Apple stem */}
        <path d="M100,75 Q100,65 110,60" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  };
  
  export default NutritionScannerIcon;
  