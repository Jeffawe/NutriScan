const ScannerSVG = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      {/* Background */}
      <rect width="800" height="600" fill="none" rx="20" ry="20" />

      {/* Phone Outline */}
      <rect x="230" y="100" width="340" height="440" rx="30" ry="30" fill="#ffffff" stroke="#22c55e" strokeWidth="8" />

      {/* Phone Screen */}
      <rect x="250" y="130" width="300" height="360" rx="8" ry="8" fill="#f9fafb" />

      {/* Camera Lens */}
      <circle cx="400" cy="110" r="8" fill="#555555" />

      {/* Home Button */}
      <circle cx="400" cy="510" r="20" fill="#f0f0f0" stroke="#dddddd" strokeWidth="2" />

      {/* Scanning Frame */}
      <rect x="280" y="170" width="240" height="240" rx="10" ry="10" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="15,10" />

      {/* Scanning Line (animated) */}
      <rect x="280" y="270" width="240" height="4" fill="#22c55e">
        <animate attributeName="y" values="170;390;170" dur="3s" repeatCount="indefinite" />
      </rect>

      {/* Food Items */}
      {/* Apple */}
      <circle cx="350" cy="260" r="40" fill="#e34d4d" />
      <path d="M350,220 Q350,210 360,210" fill="none" stroke="#754c24" strokeWidth="4" />
      <path d="M320,255 Q330,240 340,255" fill="none" stroke="#22c55e" strokeWidth="2" />

      {/* Broccoli */}
      <path d="M430,290 C440,270 450,280 450,300 C460,280 470,290 470,310 C480,290 490,300 480,320 C470,330 460,325 450,320 C440,325 430,330 420,320 C410,300 420,310 430,290" fill="#22c55e" />
      <rect x="445" y="320" width="10" height="20" fill="#754c24" />

      {/* Nutrition Labels */}
      {/* Apple */}
      <g transform="translate(140, 230)">
        <rect x="0" y="0" width="100" height="120" rx="10" ry="10" fill="white" stroke="#22c55e" strokeWidth="2" />
        <text x="50" y="25" fontFamily="Arial" fontSize="14" textAnchor="middle" fill="#22c55e" fontWeight="bold">Apple</text>
        <line x1="10" y1="35" x2="90" y2="35" stroke="#22c55e" strokeWidth="1" />
        <text x="10" y="55" fontFamily="Arial" fontSize="10" fill="#333333">Calories: 95</text>
        <text x="10" y="75" fontFamily="Arial" fontSize="10" fill="#333333">Carbs: 25g</text>
        <text x="10" y="95" fontFamily="Arial" fontSize="10" fill="#333333">Fiber: 4g</text>
        <text x="10" y="115" fontFamily="Arial" fontSize="10" fill="#333333">Vitamin C: 14%</text>
        <line x1="100" y1="60" x2="170" y2="30" stroke="#22c55e" strokeWidth="2" strokeDasharray="5,5" />
      </g>

      {/* Broccoli */}
      <g transform="translate(560, 260)">
        <rect x="0" y="0" width="100" height="120" rx="10" ry="10" fill="white" stroke="#22c55e" strokeWidth="2" />
        <text x="50" y="25" fontFamily="Arial" fontSize="14" textAnchor="middle" fill="#22c55e" fontWeight="bold">Broccoli</text>
        <line x1="10" y1="35" x2="90" y2="35" stroke="#22c55e" strokeWidth="1" />
        <text x="10" y="55" fontFamily="Arial" fontSize="10" fill="#333333">Calories: 55</text>
        <text x="10" y="75" fontFamily="Arial" fontSize="10" fill="#333333">Protein: 3.7g</text>
        <text x="10" y="95" fontFamily="Arial" fontSize="10" fill="#333333">Fiber: 2.4g</text>
        <text x="10" y="115" fontFamily="Arial" fontSize="10" fill="#333333">Vitamin K: 116%</text>
        <line x1="0" y1="60" x2="-90" y2="50" stroke="#22c55e" strokeWidth="2" strokeDasharray="5,5" />
      </g>

      {/* Scanning Result Text */}
      <rect x="280" y="420" width="240" height="40" rx="5" ry="5" fill="#22c55e" />
      <text x="400" y="445" fontFamily="Arial" fontSize="16" textAnchor="middle" fill="white" fontWeight="bold">View Nutrition Facts</text>
    </svg>
  );
};

export default ScannerSVG;
