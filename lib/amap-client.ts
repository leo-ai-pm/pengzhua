import type { Place } from '../app/walk-model';
export type Coordinates = [number, number];
export type LngLat = { getLng(): number; getLat(): number };
export type MapInstance = {
  destroy(): void;
  setZoomAndCenter(zoom: number, center: Coordinates): void;
  setCenter(center: Coordinates): void;
  zoomIn(): void;
  zoomOut(): void;
  add(items: unknown): void;
  addControl(control: unknown): void;
  remove(items: unknown): void;
  setFitView(items?: unknown): void;
  on(event: string, callback: () => void): void;
};
export type Marker = {
  on(event: string, cb: () => void): void;
  setMap(map: MapInstance | null): void;
};
export type POI = {
  id: string;
  name: string;
  address: string | string[];
  location: LngLat;
  type?: string;
  adname?: string;
};
export type Walking = {
  clear(): void;
  search(
    from: Coordinates,
    to: Coordinates,
    callback: (
      status: string,
      result: {
        routes?: {
          distance: number;
          time: number;
          steps?: { instruction: string }[];
        }[];
      },
    ) => void,
  ): void;
};
export type AMapSDK = {
  Map: new (
    container: HTMLElement,
    options: Record<string, unknown>,
  ) => MapInstance;
  Marker: new (options: Record<string, unknown>) => Marker;
  Scale: new (options?: Record<string, unknown>) => unknown;
  PlaceSearch: new (options: Record<string, unknown>) => {
    search(
      keyword: string,
      callback: (status: string, result: { poiList?: { pois: POI[] } }) => void,
    ): void;
  };
  Geolocation: new (options: Record<string, unknown>) => {
    getCurrentPosition(
      callback: (
        status: string,
        result: { position?: LngLat; accuracy?: number; message?: string },
      ) => void,
    ): void;
  };
  Walking: new (options: Record<string, unknown>) => Walking;
  plugin(names: string[], callback: () => void): void;
};
declare global {
  interface Window {
    AMap?: AMapSDK;
    _AMapSecurityConfig?: { serviceHost: string };
  }
}
let pending: Promise<AMapSDK> | null = null;
export async function loadAMap(key: string): Promise<AMapSDK> {
  if (window.AMap) return window.AMap;
  if (pending) return pending;
  window._AMapSecurityConfig = {
    serviceHost: window.location.origin + '/_AMapService',
  };
  pending = new Promise<AMapSDK>((resolve, reject) => {
    const script = document.createElement('script');
    let settled = false;
    const timer = setTimeout(() => fail(), 20000);
    const fail = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      script.remove();
      pending = null;
      reject(new Error('地图加载失败，请检查网络或地图配置。'));
    };
    script.src =
      'https://webapi.amap.com/maps?v=2.0&key=' +
      encodeURIComponent(key) +
      '&plugin=AMap.PlaceSearch,AMap.Geolocation,AMap.Walking,AMap.Scale';
    script.async = true;
    script.onerror = fail;
    script.onload = () => {
      if (settled) return;
      if (!window.AMap) {
        fail();
        return;
      }
      settled = true;
      clearTimeout(timer);
      resolve(window.AMap);
    };
    document.head.appendChild(script);
  });
  return pending;
}
export function isLocated(p: Place): p is Place & { location: Coordinates } {
  return (
    Array.isArray(p.location) &&
    p.location.length === 2 &&
    p.location.every(Number.isFinite) &&
    Math.abs(p.location[0]) <= 180 &&
    Math.abs(p.location[1]) <= 90
  );
}
export function fromPOI(poi: POI): Place {
  return {
    id: 'amap-' + poi.id,
    name: poi.name,
    area:
      [
        poi.adname,
        Array.isArray(poi.address) ? poi.address.join('') : poi.address,
      ]
        .filter(Boolean)
        .join(' · ') || '北京',
    kind: poi.type?.includes('公园') ? '草地公园' : '友好店铺',
    desc: '高德地图地点。是否允许携宠、可进入区域及现场要求，尚需向场地确认。',
    features: ['携宠规则待核实'],
    caution: '普通地图收录不代表允许携宠。出发前请核实。',
    size: '待核实',
    distance: '待定位',
    minutes: 0,
    x: 0,
    y: 0,
    route: '',
    photo: 'park',
    quiet: false,
    location: [poi.location.getLng(), poi.location.getLat()],
    source: 'amap',
  };
}
export function amapNavigation(place: Place): string | null {
  if (!isLocated(place)) return null;
  const url = new URL('https://uri.amap.com/navigation');
  url.search = new URLSearchParams({
    to: place.location.join(',') + ',' + place.name,
    mode: 'walk',
    coordinate: 'gaode',
    callnative: '1',
    src: 'qunaliu',
  }).toString();
  return url.toString();
}
