'use client';
import { useEffect, useState, type ReactNode, type CSSProperties } from 'react';
import { BatteryFull, Signal, Wifi } from 'lucide-react';

// iPhone 15 Pro Max: 430 × 932 logical points. The desktop hardware bezel is outside the screen.
export function DeviceStatusBar() {
  return (
    <div className="device-status-bar" aria-hidden="true">
      <span>9:41</span>
      <i className="dynamic-island" />
      <div>
        <Signal size={17} />
        <Wifi size={17} />
        <BatteryFull size={24} />
      </div>
    </div>
  );
}
export default function DevicePreview({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    function resize() {
      const value =
        window.innerWidth >= 600
          ? Math.min(
              1,
              Math.max(0.3, (window.innerHeight - 48) / 948),
              (window.innerWidth - 48) / 446,
            )
          : 1;
      setScale(value);
      document.documentElement.style.setProperty(
        '--iphone-preview-scale',
        String(value),
      );
    }
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      document.documentElement.style.removeProperty('--iphone-preview-scale');
    };
  }, []);
  return (
    <div className="device-presentation">
      <div
        className="iphone-stage"
        style={{ '--device-scale': scale } as CSSProperties}
      >
        <div className="iphone-hardware">{children}</div>
      </div>
    </div>
  );
}
