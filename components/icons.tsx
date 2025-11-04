import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

const createIcon = (path: React.ReactNode) => {
  const IconComponent: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide ${className}`}
      {...props}
    >
      {path}
    </svg>
  );
  IconComponent.displayName = 'Icon';
  return IconComponent;
};

// FIX: Split path data into two path elements and wrapped in a fragment.
export const Leaf = createIcon(<><path d="M11 20A7 7 0 0 1 4 13H2a10 10 0 0 0 10 10z" /><path d="M2 13a10 10 0 0 1 10-10 7 7 0 0 1 7 7h2a10 10 0 0 0-10-10A10 10 0 0 0 2 13z" /></>);
// FIX: Wrapped multiple path elements in a fragment.
export const Recycle = createIcon(<><path d="M7 19H4.5a1.5 1.5 0 0 1 0-3H7"/><path d="M11 19h2.5a1.5 1.5 0 0 0 0-3H11"/><path d="M15 19h2.5a1.5 1.5 0 0 0 0-3H15"/><path d="M19.5 16.5 17 19"/><path d="M2 12h2.5a1.5 1.5 0 0 1 0 3H2"/><path d="M11 5.5 13 3h-2l-2 2.5"/><path d="m14 8 3-2.5h-2l-2 2.5"/><path d="M18 11.5 21 9h-2l-2 2.5"/><path d="M18 14h2.5a1.5 1.5 0 0 0 0-3H18"/><path d="M11.5 5H7l-2 3h2.5a1.5 1.5 0 0 1 0 3H7" /></>);
// FIX: Wrapped multiple path elements in a fragment.
export const Bell = createIcon(<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>);
// FIX: Wrapped multiple path elements in a fragment.
export const UtensilsCrossed = createIcon(<><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8Z" /><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 1.6.8 2.5.2l2.3-2.3a3 3 0 0 0 0-4.2Z" /></>);
export const Heart = createIcon(<path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.77-.77-.77a5.4 5.4 0 0 0-7.65 7.65l.77.77L12 21.23l7.65-7.65.77-.77a5.4 5.4 0 0 0 0-7.65z" />);
// FIX: Wrapped multiple SVG elements in a fragment.
export const Award = createIcon(<><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></>);
// FIX: Wrapped multiple polyline elements in a fragment.
export const TrendingUp = createIcon(<><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></>);
// FIX: Wrapped multiple path elements in a fragment.
export const ChefHat = createIcon(<><path d="M15 22H9a2 2 0 0 1-2-2v-3h10v3a2 2 0 0 1-2 2Z"/><path d="M6 17H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1Z"/><path d="M19 17h-1a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1Z"/><path d="M17.8 13.2a2.4 2.4 0 0 0-1.3-4.3 2.4 2.4 0 0 0-2-3.8 2.4 2.4 0 0 0-2.6 1 2.4 2.4 0 0 0-5 1.7A2.4 2.4 0 0 0 6 13h12a2.4 2.4 0 0 0-.2-.8Z" /></>);
// FIX: Wrapped multiple path elements in a fragment.
export const Plus = createIcon(<><path d="M5 12h14" /><path d="M12 5v14" /></>);
// FIX: Wrapped multiple SVG elements in a fragment.
export const Home = createIcon(<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>);
// FIX: Wrapped multiple path elements in a fragment.
export const ShoppingBasket = createIcon(<><path d="m5 11 4-7"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8c.9 0 1.8-.7 2-1.6l1.7-7.4"/><path d="m9 11 1 9"/><path d="M4.5 15.5h15"/><path d="m15 11-1 9"/></>);
// FIX: Wrapped multiple path elements in a fragment.
export const Sprout = createIcon(<><path d="M7 20h10" /><path d="M10 20c5.52 0 10-4.48 10-10a10 10 0 0 0-20 0c0 5.52 4.48 10 10 10Z" /><path d="M10 20a10 10 0 0 1-10-10h10v10Z" /></>);
// FIX: Wrapped multiple SVG elements in a fragment.
export const MapPin = createIcon(<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>);
// FIX: Wrapped multiple SVG elements in a fragment.
export const Info = createIcon(<><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></>);
// FIX: Wrapped multiple path elements in a fragment.
export const X = createIcon(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>);
// FIX: Wrapped multiple SVG elements in a fragment.
export const Calendar = createIcon(<><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></>);
// FIX: Wrapped multiple SVG elements in a fragment.
export const Users = createIcon(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>);
// FIX: Wrapped multiple path elements in a fragment.
export const Tree = createIcon(<><path d="M10 10v.2A3 3 0 0 1 7 13v1h10v-1a3 3 0 0 1-3-2.8V10a3 3 0 0 1-4 0Z" /><path d="M7 14h10" /><path d="M12 14V4.5" /><path d="M12 4.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5Z" /><path d="M12 22v-2" /></>);
// FIX: Wrapped multiple path elements in a fragment.
export const BarChart3 = createIcon(<><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></>);
// FIX: Wrapped multiple path elements in a fragment.
export const PieChart = createIcon(<><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></>);
// FIX: Wrapped multiple SVG elements in a fragment.
export const Clock = createIcon(<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>);
export const Check = createIcon(<polyline points="20 6 9 17 4 12" />);
// FIX: Wrapped multiple path elements in a fragment.
export const AlertTriangle = createIcon(<><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>);
// FIX: Wrapped multiple SVG elements in a fragment.
export const Image = createIcon(<><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></>);
// FIX: Wrapped multiple SVG elements in a fragment.
export const Search = createIcon(<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>);
// FIX: Wrapped multiple SVG elements in a fragment.
export const Camera = createIcon(<><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></>);
// FIX: Wrapped multiple path elements in a fragment.
export const Trash = createIcon(<><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>);
// FIX: Wrapped multiple path elements in a fragment.
export const LogOut = createIcon(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></>);
// FIX: Wrapped multiple SVG elements in a fragment.
export const Eye = createIcon(<><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>);
// FIX: Wrapped multiple path elements in a fragment.
export const EyeOff = createIcon(<><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></>);
// FIX: Wrapped multiple SVG elements in a fragment.
export const Moon = createIcon(<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />);
// FIX: Wrapped multiple SVG elements in a fragment.
export const Sun = createIcon(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></>);
export const Upload = createIcon(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></>);
export const Sparkles = createIcon(<path d="M9.9 2.1c.1-.3.4-.4.6-.4s.5.1.6.4l1 3.1c.1.2.2.3.4.4l3.1 1c.3.1.4.4.4.6s-.1.5-.4.6l-3.1 1c-.2.1-.3.2-.4.4l-1 3.1c-.1.3-.4.4-.6.4s-.5-.1-.6-.4l-1-3.1c-.1-.2-.2-.3-.4-.4l-3.1-1c-.3-.1-.4-.4-.4-.6s.1-.5.4-.6l3.1-1c.2-.1.3-.2.4-.4l1-3.1Z"/>);
export const ArrowLeft = createIcon(<><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></>);