'use client';
/* eslint-disable next/no-img-element -- Existing pet avatars. */
import { useEffect, useRef, useState } from 'react';
import {
  MapPin,
  Search,
  LocateFixed,
  Plus,
  Minus,
  Bookmark,
  Footprints,
  ChevronRight,
  X,
  Leaf,
  Map,
  RefreshCw,
  UsersRound,
} from 'lucide-react';
import {
  loadAMap,
  fromPOI,
  isLocated,
  type AMapSDK,
  type MapInstance,
  type Marker,
  type Coordinates,
} from '@/lib/amap-client';
import { type Place, type Presence, petNetwork } from './walk-model';
import { photos } from './demo-data';
import { beijingPlaces } from './beijing-places';
import NavigationPreview from './navigation-preview';

type Props = {
  places: Place[];
  selected: string;
  saved: string[];
  live: Presence[];
  walking: boolean;
  onSelect: (p: Place) => void;
  onSave: (id: string) => void;
  onStart: (p: Place) => void;
  onCurrentWalk: () => void;
  onContribute: (p: Place) => void;
  onPet: (id: string) => void;
};
export default function MobileMap({
  places,
  selected,
  saved,
  live,
  walking,
  onSelect,
  onSave,
  onStart,
  onCurrentWalk,
  onContribute,
  onPet,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapInstance | null>(null);
  const sdk = useRef<AMapSDK | null>(null);
  const request = useRef(0);
  const [status, setStatus] = useState<
    'loading' | 'missing' | 'ready' | 'error'
  >('loading');
  const [retry, setRetry] = useState(0);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('推荐');
  const [results, setResults] = useState<Place[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [locating, setLocating] = useState(false);
  const [chosen, setChosen] = useState<Place | null>(
    () => places.find((p) => p.id === selected && isLocated(p)) || null,
  );
  const [expanded, setExpanded] = useState(false);
  const [guideExpanded, setGuideExpanded] = useState(false);
  function collapseGuide() {
    setGuideExpanded(false);
    container.current?.closest('.app-main')?.scrollTo({ top: 0 });
  }
  function returnToList() {
    setChosen(null);
    setGuideExpanded(false);
    setExpanded(true);
    container.current?.closest('.app-main')?.scrollTo({ top: 0 });
  }
  const callbacks = useRef({ onSelect });
  useEffect(() => {
    callbacks.current = { onSelect };
  }, [onSelect]);
  useEffect(() => {
    let disposed = false;
    let ownedMap: MapInstance | null = null;
    let mapTimer: ReturnType<typeof setTimeout> | undefined;
    const mapRef = map;
    const searchCounter = request;
    const abort = new AbortController();
    fetch('/api/map-config', { signal: abort.signal })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<{ configured: boolean; key: string }>;
      })
      .then(async (config) => {
        if (disposed) return;
        if (!config.configured) {
          setStatus('missing');
          return;
        }
        const api = await loadAMap(config.key);
        if (disposed || !container.current) return;
        sdk.current = api;
        const m = new api.Map(container.current, {
          zoom: 14,
          center: [116.481, 39.998],
          viewMode: '2D',
          resizeEnable: true,
          showLabel: true,
        });
        map.current = m;
        ownedMap = m;
        m.addControl(new api.Scale());
        mapTimer = setTimeout(() => {
          if (!disposed) setStatus('error');
        }, 15000);
        m.on('complete', () => {
          if (!disposed) {
            clearTimeout(mapTimer);
            setStatus('ready');
          }
        });
      })
      .catch(() => {
        if (!disposed) setStatus('error');
      });
    return () => {
      disposed = true;
      abort.abort();
      searchCounter.current++;
      clearTimeout(mapTimer);
      ownedMap?.destroy();
      mapRef.current = null;
    };
  }, [retry]);
  const display =
    tab === '收藏'
      ? places.filter((p) => saved.includes(p.id) && isLocated(p))
      : tab === '推荐'
        ? beijingPlaces
        : tab === '宠物好友'
          ? []
          : results;
  // Only actual coordinates enter the real map. Legacy sample places are never geocoded implicitly.
  const pointKey = JSON.stringify([...display, ...(chosen ? [chosen] : [])]);
  useEffect(() => {
    if (status !== 'ready' || !map.current || !sdk.current) return;
    const m = map.current,
      api = sdk.current;
    const points: Place[] = JSON.parse(pointKey);
    const markers: Marker[] = [];
    for (const p of points.filter(
      (p, i, a) => isLocated(p) && a.findIndex((x) => x.id === p.id) === i,
    )) {
      const marker = new api.Marker({
        map: m,
        position: p.location,
        title: p.name,
      });
      marker.on('click', () => {
        setChosen(p);
        setGuideExpanded(false);
        callbacks.current.onSelect(p);
        setExpanded(false);
      });
      markers.push(marker);
    }
    return () => markers.forEach((marker) => marker.setMap(null));
  }, [pointKey, status]);
  useEffect(() => {
    if (status === 'ready' && tab === '推荐' && !chosen)
      map.current?.setFitView();
  }, [status, tab, chosen]);
  function choose(p: Place) {
    setChosen(p);
    setGuideExpanded(false);
    onSelect(p);
    setExpanded(false);
    setMessage('');
    if (isLocated(p)) map.current?.setZoomAndCenter(15, p.location);
  }
  function search(keyword = query) {
    if (!sdk.current || status !== 'ready' || !keyword.trim()) return;
    const token = ++request.current;
    setBusy(true);
    setMessage('');
    setTab('找地点');
    setExpanded(true);
    const timer = setTimeout(() => {
      if (request.current === token) {
        request.current++;
        setBusy(false);
        setMessage('地点搜索超时，请重试。');
      }
    }, 15000);
    new sdk.current.PlaceSearch({
      city: '010',
      citylimit: true,
      pageSize: 10,
      extensions: 'base',
    }).search(keyword.trim(), (s, r) => {
      clearTimeout(timer);
      if (request.current !== token) return;
      setBusy(false);
      if (s === 'complete' && r.poiList) {
        const list = r.poiList.pois
          .filter((p) => p.location)
          .map(fromPOI)
          .map((p) => beijingPlaces.find((seed) => seed.id === p.id) || p)
          .filter(isLocated);
        setResults(list);
        if (list.length) {
          choose(list[0]);
          setExpanded(true);
        } else setMessage('没有找到匹配的地点，试试附近的街道或公园名称。');
      } else {
        setResults([]);
        setMessage(
          s === 'no_data'
            ? '没有找到匹配地点，换个关键词试试。'
            : '地点搜索失败，请检查网络或服务配额后重试。',
        );
      }
    });
  }
  function locate(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!sdk.current) {
        reject(new Error('地图尚未就绪。'));
        return;
      }
      setLocating(true);
      setMessage('');
      let done = false;
      const finish = (value?: Coordinates) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        setLocating(false);
        if (value) {
          setPosition(value);
          map.current?.setCenter(value);
          resolve(value);
        } else {
          const text =
            '未能获取当前位置。请允许浏览器定位，或使用高德导航选择出发点。';
          setMessage(text);
          reject(new Error(text));
        }
      };
      const timer = setTimeout(() => finish(), 12000);
      new sdk.current.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        convert: true,
        showButton: false,
        showMarker: true,
        panToLocation: true,
      }).getCurrentPosition((s, r) => {
        if (s === 'complete' && r.position)
          finish([r.position.getLng(), r.position.getLat()]);
        else finish();
      });
    });
  }
  const selectedPlace = chosen
    ? places.find((p) => p.id === chosen.id) || chosen
    : null;
  return (
    <section className="phone-map-page">
      <div className="map-search-bar">
        <span>
          <MapPin size={16} />
          北京
        </span>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="搜索北京真实地点"
            placeholder="搜公园、步道或宠物友好空间"
          />
          <button aria-label="搜索" disabled={status !== 'ready' || busy}>
            <Search size={20} />
          </button>
        </form>
      </div>
      <div className="map-mode-tabs">
        {['推荐', '找地点', '宠物好友', '收藏'].map((t) => (
          <button
            key={t}
            aria-pressed={tab === t}
            onClick={() => {
              request.current++;
              setBusy(false);
              setGuideExpanded(false);
              setTab(t);
              setExpanded(true);
              setChosen(null);

              setMessage('');
            }}
          >
            {t === '宠物好友' && <UsersRound size={15} />} {t}
          </button>
        ))}
        {walking && (
          <button className="walking-pill" onClick={onCurrentWalk}>
            <Footprints size={15} />
            正在遛
          </button>
        )}
      </div>
      <div className="real-map-stage">
        <div
          ref={container}
          className="amap-surface"
          aria-label="高德北京地图"
        />
        {status !== 'ready' && (
          <div className="map-service-state" aria-live="polite">
            <span className="map-state-icon">
              <Map size={34} />
            </span>
            <h2>
              {status === 'loading'
                ? '正在连接高德地图'
                : status === 'missing'
                  ? '真实地图等待启用'
                  : '地图暂时无法加载'}
            </h2>
            <p>
              {status === 'missing'
                ? '项目尚未配置高德地图服务。启用后可在这里查看真实道路、搜索地点并规划步行路线。'
                : status === 'error'
                  ? '请检查网络连接与地图服务配置，然后重新尝试。'
                  : '地图以北京为初始视野。点击定位后才会请求你的位置。'}
            </p>
            {status !== 'loading' && (
              <>
                <button
                  className="secondary"
                  onClick={() => {
                    setStatus('loading');
                    setRetry((v) => v + 1);
                  }}
                >
                  <RefreshCw size={16} />
                  重新连接
                </button>
              </>
            )}
          </div>
        )}
        {status === 'ready' && (
          <>
            <div className="map-quick-search">
              {['公园绿地', '滨河步道', '宠物店'].map((t, i) => (
                <button
                  key={t}
                  onClick={() => {
                    const q = ['望京 公园', '北京 滨河步道', '望京 宠物店'][i];
                    setQuery(q);
                    search(q);
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="real-map-tools">
              <button
                aria-label="放大地图"
                onClick={() => map.current?.zoomIn()}
              >
                <Plus size={19} />
              </button>
              <button
                aria-label="缩小地图"
                onClick={() => map.current?.zoomOut()}
              >
                <Minus size={19} />
              </button>
              <button
                aria-label="获取我的位置"
                disabled={locating}
                onClick={() => void locate().catch(() => {})}
              >
                <LocateFixed size={20} />
              </button>
            </div>
            <div className="map-origin-label">
              {position ? '已定位 · 仅用于找路' : '北京 · 点击定位后找身边地点'}
            </div>
          </>
        )}
      </div>
      <div className={'phone-map-sheet ' + (expanded ? 'expanded' : '')}>
        <div className="place-sheet-toolbar">
          {chosen ? (
            <button onClick={returnToList}>← 返回地点列表</button>
          ) : (
            <strong>{tab === '推荐' ? '北京推荐' : tab}</strong>
          )}
          {chosen && (
            <button
              aria-expanded={guideExpanded}
              onClick={() =>
                guideExpanded ? collapseGuide() : setGuideExpanded(true)
              }
            >
              {guideExpanded ? '收起详情 ↑' : '展开详情 ↓'}
            </button>
          )}
        </div>
        {message && (
          <output className="map-feedback">
            {message}
            <button aria-label="关闭提示" onClick={() => setMessage('')}>
              <X size={15} />
            </button>
          </output>
        )}
        {tab === '宠物好友' ? (
          <>
            <h3>
              朋友们的此刻 <small>社交演示</small>
            </h3>
            <p className="map-sheet-note">
              好友状态暂为演示数据，不会放到真实地图上。
            </p>
            {live.length ? (
              live.map((l) => {
                const p = petNetwork.find((p) => p.id === l.petId)!;
                return (
                  <button
                    className="map-friend-row"
                    key={p.id}
                    onClick={() => onPet(p.id)}
                  >
                    <img src={photos[p.photo]} alt="" />
                    <span>
                      <strong>{p.name}</strong>
                      <small>正在遛弯 · 演示状态</small>
                    </span>
                    <ChevronRight size={17} />
                  </button>
                );
              })
            ) : (
              <p className="map-sheet-note">暂无好友共享本次遛弯地点。</p>
            )}
          </>
        ) : (
          <>
            {selectedPlace && (
              <article className="real-place-card">
                <div className="row">
                  <span className="real-poi-tag">
                    {selectedPlace.petGuide
                      ? '北京精选 · 有携宠信息来源'
                      : '真实地图地点'}
                  </span>
                  <button
                    className="icon-btn"
                    aria-label="收藏地点"
                    aria-pressed={saved.includes(selectedPlace.id)}
                    onClick={() => onSave(selectedPlace.id)}
                  >
                    <Bookmark
                      size={19}
                      fill={
                        saved.includes(selectedPlace.id)
                          ? 'currentColor'
                          : 'none'
                      }
                    />
                  </button>
                </div>
                <h2>{selectedPlace.name}</h2>
                <p>{selectedPlace.area}</p>
                <div className="real-pet-rule">
                  <Leaf size={16} />
                  {selectedPlace.petGuide
                    ? selectedPlace.petGuide.badge
                    : selectedPlace.contributed
                      ? '宠友补充 · 携宠规则待核实'
                      : '携宠规则待核实'}
                </div>
                {guideExpanded && (
                  <div className="curated-guide">
                    <p>{selectedPlace.desc}</p>
                    <div className="curated-tags">
                      {selectedPlace.features.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <p className="curated-scope">{selectedPlace.caution}</p>
                    {selectedPlace.petGuide && (
                      <div className="place-entry-rules">
                        <h3>入园条件与入口</h3>
                        <p>
                          <strong>入口</strong> {selectedPlace.petGuide.entry}
                        </p>
                        <p>
                          <strong>费用</strong> {selectedPlace.petGuide.fee}
                        </p>
                        <ul>
                          {selectedPlace.petGuide.rules.map((rule) => (
                            <li key={rule}>{rule}</li>
                          ))}
                        </ul>
                        <p className="curated-check">
                          资料核对：{selectedPlace.petGuide.checkedAt} ·
                          未实地核验，出发前确认当日安排。
                        </p>
                      </div>
                    )}
                    <button className="text-link" onClick={collapseGuide}>
                      收起详情 ↑
                    </button>
                  </div>
                )}
                {selectedPlace.experience && (
                  <section className="saved-experience">
                    <h3>我的携宠体验</h3>
                    <p>{selectedPlace.experience.note}</p>
                    <p>{selectedPlace.experience.features.join(' · ')}</p>
                    <small>个人体验，不代表场地官方准入规则</small>
                  </section>
                )}
                <div className="real-place-actions">
                  <NavigationPreview place={selectedPlace} />
                  <button
                    className="secondary"
                    onClick={() => onStart(selectedPlace)}
                  >
                    <Footprints size={17} />
                    我已到达
                  </button>
                </div>
                <div className="real-place-links">
                  <button onClick={() => onContribute(selectedPlace)}>
                    补充携宠体验 <Plus size={14} />
                  </button>
                </div>
              </article>
            )}
            {(expanded || !selectedPlace) && (
              <div className="real-poi-list">
                <h3>
                  {tab === '推荐'
                    ? '北京 · 先去这4处'
                    : tab === '收藏'
                      ? '收藏的真实地点'
                      : '找一处今天想去的地方'}
                  {busy && <small>搜索中…</small>}
                </h3>
                {tab === '推荐' && (
                  <p className="map-sheet-note">
                    首批宠物友好去处，以携犬场景为主。点开查看入园要求，再带毛孩子出发。
                  </p>
                )}
                {!display.length && !busy && (
                  <p className="map-sheet-note">
                    {tab === '收藏'
                      ? '搜索地点后点一下收藏，下次出门更方便。'
                      : '搜索北京的公园、步道或店铺，再确认是否适合带毛孩子前往。'}
                  </p>
                )}
                {display.map((p) => (
                  <button key={p.id} onClick={() => choose(p)}>
                    <MapPin size={20} />
                    <span>
                      <strong>{p.name}</strong>
                      <small>{p.area}</small>
                      {p.petGuide && (
                        <em className="curated-list-tag">
                          {p.petGuide.badge} ·{' '}
                          {p.features[p.features.length - 1]}
                        </em>
                      )}
                    </span>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
