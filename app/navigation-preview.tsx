'use client';
import { useState } from 'react';
import { Navigation, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Place } from './walk-model';

export function NavigationOptions({
  place,
  onClose,
}: {
  place: Place;
  onClose: () => void;
}) {
  const [mode, setMode] = useState('步行');
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div className="navigation-preview">
      <div className="navigation-destination">
        <MapPin size={22} />
        <div>
          <strong>{place.name}</strong>
          <p>{place.area}</p>
        </div>
      </div>
      <label>
        出发地
        <input value="我的位置（导航应用中确认）" readOnly />
      </label>
      <div className="navigation-modes" aria-label="出行方式">
        {['步行', '驾车', '骑行'].map((value) => (
          <button
            key={value}
            aria-pressed={mode === value}
            onClick={() => {
              setMode(value);
              setConfirmed(false);
            }}
          >
            {value}
          </button>
        ))}
      </div>
      <p>
        正式版将跳转高德，按所选方式设置路线。当前为演示，不会打开外部应用，也不会请求定位。
      </p>
      {confirmed && <output>已选择{mode}前往。导航跳转暂未启用。</output>}
      <button className="primary full-width" onClick={() => setConfirmed(true)}>
        确认路线（演示）
      </button>
      <button className="secondary full-width" onClick={onClose}>
        返回地点
      </button>
    </div>
  );
}

export default function NavigationPreview({ place }: { place: Place }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="primary" onClick={() => setOpen(true)}>
        <Navigation size={17} />
        怎么走
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="app-dialog">
          <DialogTitle>前往导航</DialogTitle>
          <DialogDescription>确认目的地与出行方式</DialogDescription>
          <NavigationOptions
            key={place.id + String(open)}
            place={place}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
