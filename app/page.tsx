'use client';
/* eslint-disable next/no-img-element -- Sized CDN photos and device-local uploaded photos use ordinary image URLs. */
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  PawPrint,
  MapPin,
  Footprints,
  UsersRound,
  House,
  BookOpen,
  Search,
  ChevronRight,
  ArrowUpRight,
  ArrowLeft,
  Plus,
  Minus,
  LocateFixed,
  Eye,
  EyeOff,
  Bookmark,
  Trees,
  Droplets,
  Sun,
  ShieldCheck,
  Heart,
  MessageCircle,
  Send,
  Check,
  X,
  Camera,
  CalendarDays,
  Settings2,
  Utensils,
  Coffee,
  Navigation,
  Leaf,
  CircleHelp,
  QrCode,
} from 'lucide-react';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { photos, initialState, toggleItem, type DemoState } from './demo-data';
import {
  walkPlaces as basePlaces,
  petNetwork,
  seedPresences,
  visiblePresences,
  activeWalk,
  finishWalk,
  walkMinutes,
  filterPlaces,
  type Walk,
  type Presence,
  type Visibility,
  type Place,
} from './walk-model';

import { MemoryEditor, PlaceContribution } from './walk-extras';

type State = {
  legacy: DemoState;
  buddyIds: string[];
  requests: string[];
  presences: Presence[];
  walk: Walk | null;
  history: Walk[];
  customPlaces: Place[];
};
const KEY = 'qunaliu-walk-demo-v2';
const sections = [
  { name: '遛宠地图', icon: MapPin },
  { name: '我的宠物', icon: House },
  { name: '宠物好友', icon: UsersRound },
  { name: '宠友圈', icon: PawPrint },
  { name: '陪伴日历', icon: CalendarDays },
];
function initial(now = 0): State {
  return {
    legacy: initialState(),
    buddyIds: ['doubao', 'cookie', 'niangao'],
    requests: [],
    presences: seedPresences(now),
    walk: null,
    history: [],
    customPlaces: [],
  };
}
function Photo({
  src,
  alt = '',
  className = '',
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className={'photo-fallback ' + className}>
      <PawPrint size={24} />
    </span>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
function SelectOne({
  value,
  items,
  label,
  onChange,
}: {
  value: string;
  items: string[];
  label: string;
  onChange: (s: string) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((v) => (
          <SelectItem key={v} value={v}>
            {v}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function Segments({
  value,
  items,
  onChange,
}: {
  value: string;
  items: string[];
  onChange: (s: string) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(String(v))}>
      <TabsList className="segments">
        {items.map((v) => (
          <TabsTrigger key={v} value={v}>
            {v}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="empty-state">
      <PawPrint />
      <p>{children}</p>
    </div>
  );
}
function timeLabel(timestamp: number) {
  return timestamp
    ? new Date(timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';
}
export default function Home() {
  const [state, setState] = useState<State>(initial);
  const [now, setNow] = useState(0);
  const [ready, setReady] = useState(false);
  const [section, setSection] = useState('遛宠地图');
  const [filter, setFilter] = useState('全部');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('p1');
  const [modal, setModal] = useState('');
  const [activePet, setActivePet] = useState('doubao');
  const [toast, setToast] = useState('');
  const [zoom, setZoom] = useState(1);
  const [friendTab, setFriendTab] = useState('正在遛弯');
  const [feedTab, setFeedTab] = useState('好友圈');
  const [privacy, setPrivacy] = useState<Visibility>('private');
  const [duration, setDuration] = useState('60 分钟');
  const [note, setNote] = useState('');
  const [chat, setChat] = useState('');
  const [inviteDate, setInviteDate] = useState('');
  const [draft, setDraft] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftPhoto, setDraftPhoto] = useState(photos.corgi);
  const [edit, setEdit] = useState(state.legacy.pet);
  const [memoryId, setMemoryId] = useState('');
  const [postId, setPostId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [calendarDay, setCalendarDay] = useState('');
  const [calendarOffset, setCalendarOffset] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  /* eslint-disable react/react-compiler -- Hydrating explicitly local demo state and synchronizing expiry are external-system effects. */
  useEffect(() => {
    const t = Date.now();
    setNow(t);
    let next = initial(t);
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed.legacy?.pet &&
          Array.isArray(parsed.buddyIds) &&
          Array.isArray(parsed.presences)
        )
          next = { ...next, ...parsed };
      } else {
        const old = localStorage.getItem('qunaliu-demo-v1');
        if (old) {
          const legacy = JSON.parse(old);
          if (legacy.pet && Array.isArray(legacy.posts))
            next.legacy = { ...initialState(), ...legacy };
        }
      }
    } catch {}
    if (next.walk && !activeWalk(next.walk, t)) {
      next.history = [finishWalk(next.walk, t), ...next.history];
      next.walk = null;
    }
    // Refresh seeded demo post locations while retaining user-authored records.
    next.legacy.posts = next.legacy.posts.map((p) =>
      /^s[1-6]$/.test(p.id) ? { ...p, city: '北京' } : p,
    );
    setState(next);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      setToast('浏览器空间不足，当前修改将只保留到关闭页面。');
    }
  }, [state, ready]);
  useEffect(() => {
    if (state.walk && now >= state.walk.expiresAt) {
      setState((s) =>
        s.walk
          ? {
              ...s,
              history: [finishWalk(s.walk, now), ...s.history],
              walk: null,
            }
          : s,
      );
      setToast('本次遛弯已到时，地点共享已关闭，记录已保存。');
    }
  }, [now, state.walk]);
  /* eslint-enable react/react-compiler */
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 4200);
    return () => clearTimeout(id);
  }, [toast]);
  const data = state.legacy;
  const walkPlaces = [...basePlaces, ...state.customPlaces];
  const memoryWalk = state.history.find((w) => w.id === memoryId);
  const live = visiblePresences(state.presences, state.buddyIds, now);
  const walking = activeWalk(state.walk, now);
  const visiblePlaces = filterPlaces(
    walkPlaces,
    filter,
    query,
    data.placeSaved,
    live,
  );
  const place = walkPlaces.find((p) => p.id === selected)!;
  const pet = petNetwork.find((p) => p.id === activePet)!;
  const atPlace = live.filter((p) => p.placeId === place.id);
  const petLive = live.find((p) => p.petId === pet.id);
  const post = data.posts.find((p) => p.id === postId);
  const isBuddy = state.buddyIds.includes(pet.id);
  const update = (fn: (d: DemoState) => DemoState) =>
    setState((s) => ({ ...s, legacy: fn(s.legacy) }));
  const notify = (s: string) => setToast(s);
  function go(name: string) {
    setSection(name);
    setModal('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function showPlace(id: string) {
    setSelected(id);
    setFilter('全部');
    setQuery('');
    go('遛宠地图');
  }
  function showPet(id: string) {
    setActivePet(id);
    setModal('pet');
  }
  function savePlace(id: string) {
    update((d) => ({ ...d, placeSaved: toggleItem(d.placeSaved, id) }));
  }
  function begin() {
    if (walking) {
      setModal('walk');
      return;
    }
    setPrivacy('private');
    setModal('start');
  }
  function startWalk() {
    const t = Date.now();
    if (activeWalk(state.walk, t)) {
      notify('已经在遛弯中，请先结束本次记录。');
      return;
    }
    setState((s) => ({
      ...s,
      walk: {
        id: crypto.randomUUID(),
        petId: 'me',
        placeId: selected,
        startedAt: t,
        expiresAt: t + parseInt(duration) * 60000,
        visibility: privacy,
      },
    }));
    setNow(t);
    setModal('');
    notify(
      privacy === 'friends'
        ? '开始遛弯，好友可以看到你们所在的公共地点。'
        : '开始遛弯，只有自己可见，没有通知任何好友。',
    );
  }
  function endWalk() {
    if (!state.walk) return;
    const ended = finishWalk(state.walk, Date.now());
    setState((s) => ({ ...s, history: [ended, ...s.history], walk: null }));
    setMemoryId(ended.id);
    setModal('memory');
    notify('已回家，地点共享已关闭。再留下一点今天的回忆吧。');
  }
  function openMemory(id: string) {
    setMemoryId(id);
    setModal('memory');
  }
  function changeSharing(share: boolean) {
    setState((s) =>
      s.walk
        ? {
            ...s,
            walk: { ...s.walk, visibility: share ? 'friends' : 'private' },
          }
        : s,
    );
    notify(
      share ? '本次地点已对宠物好友可见。' : '已隐身，好友看不到本次遛弯地点。',
    );
  }
  function requestFriend() {
    if (isBuddy) return;
    setState((s) => ({
      ...s,
      requests: [...new Set([...s.requests, activePet])],
    }));
    notify('好友申请已保存，可在演示中模拟对方接受。');
  }
  function acceptFriend() {
    setState((s) => ({
      ...s,
      buddyIds: [...new Set([...s.buddyIds, activePet])],
      requests: s.requests.filter((x) => x !== activePet),
    }));
    notify(`${pet.name}成为${data.pet.name}的好友啦！`);
  }
  function openInvite() {
    setNote('');
    const d = new Date(Date.now() + 86400000);
    d.setHours(17, 0, 0, 0);
    setInviteDate(
      new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16),
    );
    setModal('invite');
  }
  function sendInvite() {
    if (new Date(inviteDate).getTime() <= Date.now() || !inviteDate) {
      notify('请选择未来的约遛时间。');
      return;
    }
    update((d) => ({
      ...d,
      invitations: [
        {
          id: crypto.randomUUID(),
          friend: activePet,
          place: selected,
          date: inviteDate,
          note,
          status: '待回应',
        },
        ...d.invitations,
      ],
    }));
    setModal('chat');
    notify('邀请已加入演示会话，没有发送给真实用户。');
  }
  function sendMessage() {
    if (!chat.trim()) return;
    update((d) => ({
      ...d,
      messages: {
        ...d.messages,
        [activePet]: [
          ...(d.messages[activePet] || []),
          { id: crypto.randomUUID(), text: chat.trim(), mine: true },
        ],
      },
    }));
    setChat('');
  }
  function checkin(kind: string) {
    const t = new Date();
    update((d) => ({
      ...d,
      checkins: [
        {
          id: crypto.randomUUID(),
          kind,
          time: t.toLocaleString('zh-CN', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
        ...d.checkins,
      ],
    }));
    notify(`${data.pet.name}的${kind}日常已记好。`);
  }
  function publish() {
    if (!draft.trim() || !draftTitle.trim()) return;
    update((d) => ({
      ...d,
      posts: [
        {
          id: crypto.randomUUID(),
          title: draftTitle.trim(),
          body: draft.trim(),
          image: draftPhoto,
          author: d.pet.name,
          pet: 'me',
          topic: '一起遛过的日子',
          category: '汪星人',
          likes: 0,
          city: '北京',
          time: '刚刚',
        },
        ...d.posts,
      ],
    }));
    setDraft('');
    setDraftTitle('');
    setFeedTab('我的日常');
    go('宠友圈');
    notify('日常已收进宠友圈。');
  }
  function upload(file?: File) {
    if (!file) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 1024 * 1024
    ) {
      notify('请选择小于 1 MB 的 JPG、PNG 或 WebP 照片。');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setDraftPhoto(reader.result);
    };
    reader.onerror = () => notify('照片读取失败，请重试。');
    reader.readAsDataURL(file);
  }
  function resetPresences() {
    setState((s) => ({ ...s, presences: seedPresences(Date.now()) }));
    setNow(Date.now());
    notify('已重置演示好友的遛弯状态。');
  }
  const relevantPosts = data.posts.filter((p) =>
    feedTab === '我的收藏'
      ? data.saved.includes(p.id)
      : feedTab === '我的日常'
        ? p.pet === 'me'
        : p.pet === 'me' || state.buddyIds.includes(p.pet),
  );
  const calDate = new Date(now || '2026-09-05T12:00:00');
  calDate.setDate(1);
  calDate.setMonth(calDate.getMonth() + calendarOffset);
  const monthKey = `${calDate.getFullYear()}-${calDate.getMonth() + 1}`;
  const dayCount = new Date(
    calDate.getFullYear(),
    calDate.getMonth() + 1,
    0,
  ).getDate();
  const monthWalks = state.history.filter((w) => {
    const d = new Date(w.startedAt);
    return (
      d.getFullYear() === calDate.getFullYear() &&
      d.getMonth() === calDate.getMonth()
    );
  });
  function buddyRow(id: string, compact = false) {
    const b = petNetwork.find((p) => p.id === id)!;
    const presence = live.find((p) => p.petId === id);
    return (
      <div className={'buddy-row ' + (compact ? 'compact' : '')} key={id}>
        <button onClick={() => showPet(id)} className="pet-avatar-button">
          <Photo src={photos[b.photo]} className="avatar" alt={b.name} />
          {presence && <i />}
        </button>
        <button
          className="buddy-text"
          onClick={() => (presence ? showPlace(presence.placeId) : showPet(id))}
        >
          <strong>
            {b.name}
            <small>{b.breed}</small>
          </strong>
          <span>
            {presence
              ? walkPlaces.find((p) => p.id === presence.placeId)?.name
              : b.status === 'home'
                ? '今天已回家'
                : '未共享遛弯状态'}
          </span>
        </button>
        {presence ? (
          <button
            className="go-link"
            onClick={() => showPlace(presence.placeId)}
          >
            去这里
            <ArrowUpRight size={14} />
          </button>
        ) : (
          <span className="muted-label">休息中</span>
        )}
      </div>
    );
  }
  function inviteCard(inv: DemoState['invitations'][number]) {
    const expired = new Date(inv.date).getTime() <= now;
    return (
      <div className="invite-card" key={inv.id}>
        <div className="row">
          <Footprints size={18} />
          <strong>下次一起遛</strong>
          <span className="status">
            {expired && inv.status === '待回应' ? '已过期' : inv.status}
          </span>
        </div>
        <h4>
          {walkPlaces.find((p) => p.id === inv.place)?.name || '演示地点'}
        </h4>
        <p>
          {petNetwork.find((p) => p.id === inv.friend)?.name} ·{' '}
          {new Date(inv.date).toLocaleString('zh-CN', {
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
        {inv.note && <p>{inv.note}</p>}
        {inv.status === '待回应' && !expired && (
          <div className="simulate">
            <span>模拟好友回应</span>
            {['已接受', '已拒绝'].map((s) => (
              <button
                key={s}
                onClick={() =>
                  update((d) => ({
                    ...d,
                    invitations: d.invitations.map((i) =>
                      i.id === inv.id
                        ? { ...i, status: s as '已接受' | '已拒绝' }
                        : i,
                    ),
                  }))
                }
              >
                {s === '已接受' ? '接受' : '婉拒'}
              </button>
            ))}
          </div>
        )}
        {['待回应', '已接受'].includes(inv.status) && !expired && (
          <button
            className="text-link subtle"
            onClick={() =>
              update((d) => ({
                ...d,
                invitations: d.invitations.map((i) =>
                  i.id === inv.id ? { ...i, status: '已取消' } : i,
                ),
              }))
            }
          >
            取消邀请
          </button>
        )}
      </div>
    );
  }
  return (
    <SidebarProvider style={{ '--sidebar-width': '196px' } as CSSProperties}>
      <Sidebar collapsible="none" className="nav-rail">
        <button className="wordmark" onClick={() => go('遛宠地图')}>
          <span>
            <PawPrint size={25} />
          </span>
          去哪遛<small>pet & places</small>
        </button>
        <div className="rail-caption">让毛孩子的世界，大一点。</div>
        <div className="pet-switch">
          <Photo src={photos.corgi} alt={data.pet.name} className="avatar" />
          <div>
            <strong>{data.pet.name}</strong>
            <small>我的快乐小短腿</small>
          </div>
          <PawPrint size={15} />
        </div>
        <nav aria-label="主要功能">
          {sections.map(({ name, icon: Icon }) => (
            <button
              className={section === name ? 'nav-item active' : 'nav-item'}
              aria-current={section === name ? 'page' : undefined}
              key={name}
              onClick={() => go(name)}
            >
              <Icon size={20} />
              {name}
              {name === '宠物好友' && !!live.length && (
                <span>{live.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="rail-bottom">
          <div className="rail-tip">
            <Leaf size={22} />
            <p>
              不用特意打招呼，
              <br />
              刚好一起走走，也很好。
            </p>
          </div>
          <button onClick={() => setModal('about')}>
            <CircleHelp size={16} />
            演示说明
          </button>
          <small>去哪遛 · WEB DEMO 02</small>
        </div>
      </Sidebar>
      <div className="app-main">
        <header className="app-header">
          <div className="breadcrumb">
            <span>和 {data.pet.name} 一起</span>
            <ChevronRight size={14} />
            <strong>{section}</strong>
          </div>
          <div className="header-right">
            <span className="demo-badge">
              <i />
              交互演示
            </span>
            <button
              className="icon-btn"
              aria-label="好友消息"
              onClick={() => {
                setActivePet('doubao');
                setModal('chat');
              }}
            >
              <MessageCircle size={20} />
            </button>
            <button onClick={() => go('我的宠物')} aria-label="我的宠物">
              <Photo src={photos.corgi} className="avatar small" />
            </button>
          </div>
        </header>
        {section === '遛宠地图' ? (
          <div className="map-page">
            <div className="map-heading">
              <div>
                <span className="kicker">A LITTLE WALK, A BIGGER WORLD</span>
                <h1>
                  今天，去哪遛<span>？</span>
                </h1>
                <p>
                  <MapPin size={14} />
                  北京 · 朝阳望京 <span className="divider">/</span>{' '}
                  从一片好草地，认识一个好朋友
                </p>
              </div>
              <button
                className={'walk-top ' + (walking ? 'in-progress' : '')}
                disabled={!ready}
                onClick={begin}
              >
                <Footprints size={19} />
                {walking
                  ? '正在遛弯 · ' + walkMinutes(state.walk!, now) + ' 分钟'
                  : '带 ' + data.pet.name + ' 出门'}
                <ArrowUpRight size={17} />
              </button>
            </div>
            <div className="map-workspace">
              <section className="place-explorer">
                <label className="place-search">
                  <Search size={19} />
                  <input
                    aria-label="搜索遛宠地点"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="找公园、绿地或友好空间"
                  />
                  {query && (
                    <button aria-label="清空搜索" onClick={() => setQuery('')}>
                      <X size={16} />
                    </button>
                  )}
                </label>
                <div className="place-filters">
                  {[
                    '全部',
                    '好友在遛',
                    '安静一点',
                    '我的收藏',
                    '草地公园',
                    '河畔步道',
                    '友好店铺',
                  ].map((f) => (
                    <button
                      key={f}
                      aria-pressed={filter === f}
                      className={filter === f ? 'selected' : ''}
                      onClick={() => setFilter(f)}
                    >
                      {f === '好友在遛' && <span className="live-dot" />}
                      {f}
                    </button>
                  ))}
                </div>
                <button
                  className="contribute-entry"
                  onClick={() => setModal('contribute')}
                >
                  <Plus size={17} />
                  <span>
                    补充一个遛宠好去处<small>一起画出北京的宠物友好地图</small>
                  </span>
                  <ChevronRight size={16} />
                </button>
                <div className="list-heading">
                  <strong>
                    {filter === '好友在遛'
                      ? '跟着朋友去遛弯'
                      : '适合今天的小去处'}
                  </strong>
                  <span>{visiblePlaces.length} 个地点</span>
                </div>
                <div className="place-list">
                  {visiblePlaces.map((p) => {
                    const buddies = live.filter((l) => l.placeId === p.id);
                    return (
                      <article
                        className={
                          'place-result ' +
                          (selected === p.id ? 'selected' : '')
                        }
                        key={p.id}
                      >
                        <button
                          className="place-result-main"
                          onClick={() => setSelected(p.id)}
                        >
                          <span className="place-kind-icon">
                            {p.kind === '友好店铺' ? (
                              <Coffee size={20} />
                            ) : p.kind === '河畔步道' ? (
                              <Footprints size={20} />
                            ) : (
                              <Trees size={20} />
                            )}
                          </span>
                          <div>
                            <span className="place-kind">
                              {p.kind} ·{' '}
                              {p.contributed ? '我补充的 · 待核实' : p.distance}
                            </span>
                            <h3>{p.name}</h3>
                            <p>{p.features.slice(0, 2).join(' · ')}</p>
                          </div>
                        </button>
                        <button
                          className={
                            'save-spot ' +
                            (data.placeSaved.includes(p.id) ? 'saved' : '')
                          }
                          onClick={() => savePlace(p.id)}
                          aria-label={
                            (data.placeSaved.includes(p.id)
                              ? '取消收藏'
                              : '收藏') + p.name
                          }
                        >
                          <Bookmark
                            size={17}
                            fill={
                              data.placeSaved.includes(p.id)
                                ? 'currentColor'
                                : 'none'
                            }
                          />
                        </button>
                        {buddies.length > 0 && (
                          <button
                            className="friends-here"
                            onClick={() => setSelected(p.id)}
                          >
                            <span className="avatar-stack">
                              {buddies.map((b) => (
                                <Photo
                                  key={b.petId}
                                  src={
                                    photos[
                                      petNetwork.find((p) => p.id === b.petId)!
                                        .photo
                                    ]
                                  }
                                />
                              ))}
                            </span>
                            <span>
                              {buddies
                                .map(
                                  (b) =>
                                    petNetwork.find((p) => p.id === b.petId)
                                      ?.name,
                                )
                                .join('、')}
                              正在遛
                            </span>
                            <span className="live-dot" />
                          </button>
                        )}
                      </article>
                    );
                  })}
                  {!visiblePlaces.length && (
                    <Empty>
                      这里暂时没有匹配的地点。
                      <button
                        className="text-link"
                        onClick={() => {
                          setFilter('全部');
                          setQuery('');
                        }}
                      >
                        看看全部地点
                      </button>
                    </Empty>
                  )}
                </div>
                <div className="explorer-note">
                  <ShieldCheck size={15} />
                  <span>地点设施、距离及好友状态均为演示数据</span>
                </div>
              </section>
              <section
                className="map-canvas"
                aria-label="宠物好友与友好地点示意地图"
              >
                <div
                  className="map-world"
                  style={{ transform: `scale(${zoom})` }}
                >
                  <svg
                    viewBox="0 0 1000 760"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <defs>
                      <pattern
                        id="blockGrid"
                        width="165"
                        height="145"
                        patternUnits="userSpaceOnUse"
                      >
                        <rect
                          x="10"
                          y="12"
                          width="132"
                          height="114"
                          rx="13"
                          fill="#e6e4d9"
                        />
                        <path
                          d="M0 0H165M0 0V145"
                          stroke="#fffdf7"
                          strokeWidth="14"
                        />
                      </pattern>
                    </defs>
                    <rect width="1000" height="760" fill="#efeee5" />
                    <rect width="1000" height="760" fill="url(#blockGrid)" />
                    <path
                      d="M815 -70Q650 125 750 305T800 510T780 830"
                      fill="none"
                      stroke="#c6dcd9"
                      strokeWidth="205"
                    />
                    <path
                      d="M745 -60Q574 130 669 326T715 500T704 810"
                      fill="none"
                      stroke="#fbf8e9"
                      strokeWidth="15"
                    />
                    <path
                      d="M0 180L660 170M90 0L550 760M0 465L690 530M345 0L343 760"
                      fill="none"
                      stroke="#d4cfbf"
                      strokeWidth="27"
                    />
                    <path
                      d="M0 180L660 170M90 0L550 760M0 465L690 530M345 0L343 760"
                      fill="none"
                      stroke="#fffdf5"
                      strokeWidth="20"
                    />
                    <path
                      d="M570 258L676 275L705 400L566 413L470 350Z"
                      fill="#ccd9b8"
                    />
                    <path
                      d="M170 430L320 436L341 566L179 558Z"
                      fill="#d5ddc6"
                    />
                    <path
                      d="M543 588L672 570L656 699L544 700Z"
                      fill="#d3ddc2"
                    />
                    <path d="M418 43L577 39L572 119L419 120Z" fill="#d9dfcd" />
                    <path
                      d="M571 290Q610 320 639 364"
                      fill="none"
                      stroke="#edf0df"
                      strokeWidth="9"
                    />
                  </svg>
                  <span className="road-label road-one">望 京 北 路</span>
                  <span className="road-label road-two">阜 通 东 街</span>
                  <span className="road-label road-three">朝 阳 望 京</span>
                  <span className="road-label river-label">北 小 河</span>
                  <span className="map-area-tag">WANGJING · BEIJING</span>
                  {visiblePlaces.map((p) => {
                    const pals = live.filter((l) => l.placeId === p.id);
                    return (
                      <button
                        style={{ left: p.x + '%', top: p.y + '%' }}
                        key={p.id}
                        onClick={() => setSelected(p.id)}
                        aria-label={'地图地点：' + p.name}
                        className={
                          'spot-marker ' + (selected === p.id ? 'selected' : '')
                        }
                      >
                        <span className="marker-icon">
                          {p.kind === '友好店铺' ? (
                            <Coffee size={22} />
                          ) : (
                            <Trees size={22} />
                          )}
                        </span>
                        <span className="marker-name">{p.name}</span>
                        {pals.length > 0 && (
                          <span className="marker-buddies">
                            {pals.map((b) => (
                              <Photo
                                src={
                                  photos[
                                    petNetwork.find((x) => x.id === b.petId)!
                                      .photo
                                  ]
                                }
                                key={b.petId}
                              />
                            ))}
                            <b>{pals.length} 位好友</b>
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {walking && (
                    <span
                      className="my-map-pin"
                      style={{
                        left:
                          walkPlaces.find((p) => p.id === state.walk!.placeId)!
                            .x +
                          4 +
                          '%',
                        top:
                          walkPlaces.find((p) => p.id === state.walk!.placeId)!
                            .y +
                          12 +
                          '%',
                      }}
                    >
                      <Photo src={photos.corgi} />
                      <span>
                        {data.pet.name} ·{' '}
                        {state.walk!.visibility === 'friends'
                          ? '好友可见'
                          : '隐身中'}
                      </span>
                    </span>
                  )}
                </div>
                <div className="map-sharing">
                  <span
                    className={
                      walking && state.walk!.visibility === 'friends'
                        ? 'live-dot'
                        : 'quiet-dot'
                    }
                  />
                  {walking
                    ? state.walk!.visibility === 'friends'
                      ? '本次地点对好友可见'
                      : '本次遛弯仅自己可见'
                    : '未开启地点共享'}
                  <button
                    onClick={() => setModal(walking ? 'walk' : 'privacy')}
                    aria-label="位置共享设置"
                  >
                    {walking && state.walk!.visibility === 'friends' ? (
                      <Eye size={16} />
                    ) : (
                      <EyeOff size={16} />
                    )}
                  </button>
                </div>
                <div className="live-friends-panel">
                  <div className="panel-heading">
                    <span className="live-dot" />
                    <strong>{live.length} 位宠物好友正在遛</strong>
                    <button
                      aria-label="查看宠物好友"
                      onClick={() => go('宠物好友')}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  {live.length ? (
                    live.slice(0, 2).map((p) => buddyRow(p.petId, true))
                  ) : (
                    <p className="nobody-live">
                      朋友们暂时没有共享地点，自己也可以去走走。
                    </p>
                  )}
                  <div className="quiet-social">
                    <Leaf size={14} />
                    <span>看看 TA 在哪，想去就去，不用发消息。</span>
                  </div>
                </div>
                <div className="map-controls">
                  <button
                    aria-label="放大地图"
                    disabled={zoom >= 1.6}
                    onClick={() => setZoom((z) => Math.min(1.6, z + 0.2))}
                  >
                    <Plus size={20} />
                  </button>
                  <button
                    aria-label="缩小地图"
                    disabled={zoom <= 0.8}
                    onClick={() => setZoom((z) => Math.max(0.8, z - 0.2))}
                  >
                    <Minus size={20} />
                  </button>
                  <button
                    aria-label="回到演示区域"
                    onClick={() => {
                      setZoom(1);
                      notify('已回到朝阳望京演示区域。');
                    }}
                  >
                    <LocateFixed size={20} />
                  </button>
                </div>
                {visiblePlaces.some((p) => p.id === selected) ? (
                  <div className="selected-place-card">
                    <div className="selected-title">
                      <div>
                        <span className="place-kind">
                          {place.kind} ·{' '}
                          {place.minutes
                            ? `步行约 ${place.minutes} 分钟`
                            : '步行时间待核实'}
                        </span>
                        <h2>{place.name}</h2>
                      </div>
                      <button
                        aria-label="查看地点详情"
                        className="circle-button"
                        onClick={() => setModal('place')}
                      >
                        <ArrowUpRight size={20} />
                      </button>
                    </div>
                    <div className="facility-row">
                      <span>
                        <Trees size={15} />
                        {place.features[0]}
                      </span>
                      <span>
                        <ShieldCheck size={15} />
                        全程牵绳
                      </span>
                      <span>{place.features[1]}</span>
                    </div>
                    {atPlace.length > 0 ? (
                      <div className="meet-line">
                        <span className="live-dot" />
                        {atPlace
                          .map(
                            (l) =>
                              petNetwork.find((p) => p.id === l.petId)?.name,
                          )
                          .join('、')}
                        在这里，预计还遛{' '}
                        {Math.max(
                          1,
                          Math.ceil(
                            (Math.max(...atPlace.map((p) => p.expiresAt)) -
                              now) /
                              60000,
                          ),
                        )}{' '}
                        分钟
                      </div>
                    ) : (
                      <p className="meet-line muted">{place.desc}</p>
                    )}
                    <div className="place-actions">
                      <button
                        className="primary"
                        onClick={() => setModal('route')}
                      >
                        <Navigation size={17} />
                        就去这里
                        <ArrowUpRight size={17} />
                      </button>
                      <button className="secondary" onClick={begin}>
                        <Footprints size={17} />
                        到达，开始遛
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="map-empty-hint">
                    选择左侧地点，查看适合毛孩子的环境与设施。
                  </div>
                )}
                <div className="map-legend">
                  <span>
                    <i className="green" />
                    宠物友好地点
                  </span>
                  <span>
                    <i className="gold" />
                    好友正在遛
                  </span>
                  <small>示意地图 · 非实际导航</small>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="content-page">
            <div className="content-heading">
              <div>
                <span className="kicker">
                  {section === '我的宠物'
                    ? 'A SOFT LIFE TOGETHER'
                    : section === '宠物好友'
                      ? 'FRIENDS OF MY LITTLE FRIEND'
                      : section === '宠友圈'
                        ? 'MOMENTS WE SHARE'
                        : 'EVERY WALK BECOMES A PAGE'}
                </span>
                <h1>
                  {section === '我的宠物'
                    ? data.pet.name + '的每一天'
                    : section === '宠物好友'
                      ? data.pet.name + '的好朋友'
                      : section === '宠友圈'
                        ? '一起遛过的日子'
                        : '把陪伴，收进日历'}
                </h1>
                <p>
                  {section === '宠物好友'
                    ? '宠物先成为朋友，主人自然熟悉。'
                    : section === '宠友圈'
                      ? '分享散步和相遇，看看老朋友的近况。'
                      : '从每一次出门，到每一件小事。'}
                </p>
              </div>
              {section === '宠友圈' ? (
                <button className="primary" onClick={() => setModal('publish')}>
                  <Plus size={17} />
                  记录日常
                </button>
              ) : (
                <button className="secondary" onClick={() => go('遛宠地图')}>
                  <MapPin size={16} />
                  去地图看看
                </button>
              )}
            </div>
            {section === '我的宠物' && (
              <div className="pet-home-grid">
                <div>
                  <section className="pet-passport">
                    <div className="pet-passport-text">
                      <span className="mini-label">MY LITTLE COMPANION</span>
                      <h2>
                        {data.pet.name}
                        <span>♂</span>
                      </h2>
                      <p>
                        {data.pet.breed} · {data.pet.age}
                      </p>
                      <span className="pet-temper">快乐小社牛 · 喜欢嗅闻</span>
                      <p className="pet-bio">{data.pet.bio}</p>
                      <button
                        className="text-link"
                        onClick={() => {
                          setEdit(data.pet);
                          setModal('edit');
                        }}
                      >
                        编辑宠物档案
                        <Settings2 size={14} />
                      </button>
                    </div>
                    <Photo
                      src={photos.corgi}
                      alt={data.pet.name}
                      className="passport-photo"
                    />
                    <div className="passport-stats">
                      <div>
                        <strong>{state.buddyIds.length}</strong>
                        <span>宠物好友</span>
                      </div>
                      <div>
                        <strong>{state.history.length}</strong>
                        <span>一起出门</span>
                      </div>
                      <div>
                        <strong>
                          {state.history.reduce(
                            (sum, w) => sum + walkMinutes(w, now),
                            0,
                          )}
                        </strong>
                        <span>陪伴分钟</span>
                      </div>
                    </div>
                  </section>
                  <section className="surface daily-care">
                    <div className="section-title">
                      <h3>今天也被好好照顾了</h3>
                      <span>一点一滴，都是陪伴</span>
                    </div>
                    <div className="care-grid">
                      {[
                        { name: '遛弯', icon: Footprints },
                        { name: '喂食', icon: Utensils },
                        { name: '陪玩', icon: Heart },
                        { name: '洗澡', icon: Droplets },
                      ].map(({ name, icon: Icon }) => (
                        <button
                          key={name}
                          onClick={() =>
                            name === '遛弯' ? go('遛宠地图') : checkin(name)
                          }
                        >
                          <Icon size={25} />
                          <strong>{name}</strong>
                          <small>
                            {name === '遛弯' ? '去找好去处' : '记一次'}
                            <Plus size={12} />
                          </small>
                        </button>
                      ))}
                    </div>
                  </section>
                  <section className="surface">
                    <div className="section-title">
                      <h3>最近一起出过的门</h3>
                      <button
                        className="text-link"
                        onClick={() => go('陪伴日历')}
                      >
                        全部记录
                        <ChevronRight size={14} />
                      </button>
                    </div>
                    {state.history.length ? (
                      state.history.slice(0, 3).map((w) => (
                        <div className="history-row" key={w.id}>
                          <span>
                            <Footprints size={19} />
                          </span>
                          <div>
                            <strong>
                              {walkPlaces.find((p) => p.id === w.placeId)?.name}
                            </strong>
                            <p>
                              {new Date(w.startedAt).toLocaleDateString(
                                'zh-CN',
                              )}{' '}
                              · {walkMinutes(w, now)} 分钟
                            </p>
                          </div>
                          <button
                            className="text-link"
                            onClick={() => openMemory(w.id)}
                          >
                            {w.memory ? '翻开回忆' : '补记回忆'}
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <Empty>
                        带 {data.pet.name} 开始一次遛弯，结束后会自动记在这里。
                      </Empty>
                    )}
                  </section>
                </div>
                <aside>
                  <section className="surface home-friends">
                    <div className="section-title">
                      <h3>朋友们的此刻</h3>
                      <span className="live-dot" />
                    </div>
                    {state.buddyIds.map((id) => buddyRow(id))}
                    <button
                      className="wide-link"
                      onClick={() => go('宠物好友')}
                    >
                      看看所有宠物好友
                      <ArrowUpRight size={15} />
                    </button>
                  </section>
                  <section className="home-walk-note">
                    <Leaf />
                    <h3>不用约，也可以遇见。</h3>
                    <p>
                      朋友开启本次遛弯共享后，你就能在地图上看见 TA
                      正在哪个公共地点玩。
                    </p>
                    <button
                      className="text-link"
                      onClick={() => go('遛宠地图')}
                    >
                      打开地图
                      <ArrowUpRight size={15} />
                    </button>
                  </section>
                </aside>
              </div>
            )}
            {section === '宠物好友' && (
              <>
                <div className="friend-toolbar">
                  <Segments
                    value={friendTab}
                    items={['正在遛弯', '所有好友', '好友申请']}
                    onChange={setFriendTab}
                  />
                  <button
                    className="secondary"
                    onClick={() => setModal('code')}
                  >
                    <QrCode size={16} />
                    添加宠物好友
                  </button>
                </div>
                <div className="friends-page-grid">
                  <div>
                    {friendTab === '好友申请' ? (
                      state.requests.length ? (
                        state.requests.map((id) => (
                          <article className="friend-request" key={id}>
                            <Photo
                              src={
                                photos[
                                  petNetwork.find((p) => p.id === id)!.photo
                                ]
                              }
                              className="avatar"
                            />
                            <div>
                              <strong>
                                {petNetwork.find((p) => p.id === id)?.name}
                              </strong>
                              <p>已发送申请 · 等待对方接受</p>
                            </div>
                            <button
                              className="secondary"
                              onClick={() => showPet(id)}
                            >
                              模拟对方回应
                            </button>
                          </article>
                        ))
                      ) : (
                        <Empty>
                          暂无待处理申请。去地点详情里认识常来玩的毛孩子。
                        </Empty>
                      )
                    ) : (
                      (friendTab === '正在遛弯'
                        ? live.map((p) => p.petId)
                        : state.buddyIds
                      ).map((id) => {
                        const b = petNetwork.find((p) => p.id === id)!;
                        const presence = live.find((p) => p.petId === id);
                        return (
                          <article className="network-card" key={id}>
                            <button onClick={() => showPet(id)}>
                              <Photo
                                src={photos[b.photo]}
                                alt={b.name}
                                className="network-photo"
                              />
                            </button>
                            <div className="network-info">
                              <div className="row">
                                <h3>{b.name}</h3>
                                <span className="small-tag">
                                  {b.breed} · {b.age}
                                </span>
                                {presence && (
                                  <span className="live-status">
                                    <i />
                                    正在遛
                                  </span>
                                )}
                              </div>
                              <p>
                                {b.temper} ·{' '}
                                {state.history.filter((w) =>
                                  w.memory?.metPetIds.includes(b.id),
                                ).length
                                  ? `已记录 ${state.history.filter((w) => w.memory?.metPetIds.includes(b.id)).length} 次相遇`
                                  : b.relation.replaceAll(
                                      '芒果',
                                      data.pet.name,
                                    )}
                              </p>
                              {presence ? (
                                <div className="friend-presence">
                                  <MapPin size={16} />
                                  <strong>
                                    {
                                      walkPlaces.find(
                                        (p) => p.id === presence.placeId,
                                      )?.name
                                    }
                                  </strong>
                                  <span>
                                    共享至 {timeLabel(presence.expiresAt)}
                                  </span>
                                </div>
                              ) : (
                                <div className="friend-presence resting">
                                  <House size={16} />
                                  {b.status === 'home'
                                    ? '今天已回家，好好休息中'
                                    : '未共享本次遛弯地点'}
                                </div>
                              )}
                              <div className="network-actions">
                                {presence && (
                                  <button
                                    className="primary"
                                    onClick={() => showPlace(presence.placeId)}
                                  >
                                    我也去这里
                                    <ArrowUpRight size={16} />
                                  </button>
                                )}
                                <button
                                  className="secondary"
                                  onClick={() => {
                                    setActivePet(id);
                                    openInvite();
                                  }}
                                >
                                  约下次
                                </button>
                                <button
                                  className="icon-btn"
                                  aria-label={'给' + b.name + '发消息'}
                                  onClick={() => {
                                    setActivePet(id);
                                    setModal('chat');
                                  }}
                                >
                                  <MessageCircle size={18} />
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })
                    )}
                    {friendTab === '正在遛弯' && !live.length && (
                      <Empty>
                        好友们暂时没有共享地点。下次出门时再看看，也可以先收藏一个喜欢的地方。
                      </Empty>
                    )}
                  </div>
                  <aside>
                    <section className="surface quiet-card">
                      <Leaf size={28} />
                      <h3>
                        刚好同路，
                        <br />
                        就一起走走。
                      </h3>
                      <p>
                        想过去就直接看地点。不会自动给好友发消息，也不需要先聊天。
                      </p>
                      <div>
                        <Eye size={17} />
                        <span>
                          仅好友主动分享的本次公共地点可见；结束或隐身后就会消失。
                        </span>
                      </div>
                    </section>
                    <section className="surface">
                      <h3 className="small-heading">可能会遇见的新朋友</h3>
                      <div className="new-friend">
                        <Photo src={photos.corgi} className="avatar" />
                        <div>
                          <strong>土豆</strong>
                          <p>常来望京宠友草坪</p>
                        </div>
                        <button
                          className="circle-button"
                          aria-label="认识土豆"
                          onClick={() => showPet('tudou')}
                        >
                          <Plus size={17} />
                        </button>
                      </div>
                    </section>
                  </aside>
                </div>
              </>
            )}
            {section === '宠友圈' && (
              <div className="moments-layout">
                <div>
                  <Segments
                    value={feedTab}
                    items={['好友圈', '我的日常', '我的收藏']}
                    onChange={setFeedTab}
                  />
                  <div className="moments-feed">
                    {relevantPosts.map((p) => (
                      <article className="moment" key={p.id}>
                        <header>
                          <button
                            onClick={() =>
                              p.pet === 'me' ? go('我的宠物') : showPet(p.pet)
                            }
                          >
                            <Photo src={p.image} className="avatar" />
                            <div>
                              <strong>
                                {p.pet === 'me' ? data.pet.name : p.author}
                              </strong>
                              <small>{p.time} · 宠物日常</small>
                            </div>
                          </button>
                        </header>
                        <button
                          className="moment-text"
                          onClick={() => {
                            setPostId(p.id);
                            setModal('post');
                          }}
                        >
                          <h3>{p.title}</h3>
                          <p>{p.body}</p>
                        </button>
                        <button
                          className="moment-image-button"
                          aria-label={'查看' + p.title}
                          onClick={() => {
                            setPostId(p.id);
                            setModal('post');
                          }}
                        >
                          <Photo
                            src={p.image}
                            alt={p.title}
                            className="moment-photo"
                          />
                        </button>
                        <footer>
                          <span>
                            <MapPin size={14} />
                            {p.city}
                          </span>
                          <button
                            className={data.liked.includes(p.id) ? 'liked' : ''}
                            aria-label="点赞动态"
                            onClick={() =>
                              update((d) => ({
                                ...d,
                                liked: toggleItem(d.liked, p.id),
                              }))
                            }
                          >
                            <Heart
                              size={18}
                              fill={
                                data.liked.includes(p.id)
                                  ? 'currentColor'
                                  : 'none'
                              }
                            />
                            {p.likes + (data.liked.includes(p.id) ? 1 : 0)}
                          </button>
                          <button
                            aria-label="查看评论"
                            onClick={() => {
                              setPostId(p.id);
                              setModal('post');
                            }}
                          >
                            <MessageCircle size={18} />
                            {(data.comments[p.id] || []).length}
                          </button>
                          <button
                            aria-label="收藏动态"
                            className={data.saved.includes(p.id) ? 'liked' : ''}
                            onClick={() =>
                              update((d) => ({
                                ...d,
                                saved: toggleItem(d.saved, p.id),
                              }))
                            }
                          >
                            <Bookmark size={18} />
                          </button>
                        </footer>
                      </article>
                    ))}
                    {!relevantPosts.length && (
                      <Empty>
                        把今天的散步和相遇，分享给熟悉的宠物朋友。
                        <button
                          className="text-link"
                          onClick={() => setModal('publish')}
                        >
                          记录第一件小事
                        </button>
                      </Empty>
                    )}
                  </div>
                </div>
                <aside className="surface moments-side">
                  <BookOpen size={30} />
                  <h3>
                    日常，因为一起
                    <br />
                    而变得特别。
                  </h3>
                  <p>
                    这里收藏你和宠物朋友的近况。下一次相遇，仍然从地图出发。
                  </p>
                  <button className="secondary" onClick={() => go('遛宠地图')}>
                    <MapPin size={17} />
                    朋友在哪遛
                  </button>
                </aside>
              </div>
            )}
            {section === '陪伴日历' && (
              <div className="calendar-layout">
                <section className="surface">
                  <div className="calendar-title">
                    <button
                      aria-label="上个月"
                      onClick={() => {
                        setCalendarOffset((o) => o - 1);
                        setCalendarDay('');
                      }}
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <h2>
                      {calDate.getFullYear()} 年 {calDate.getMonth() + 1} 月
                    </h2>
                    <button
                      aria-label="下个月"
                      onClick={() => {
                        setCalendarOffset((o) => o + 1);
                        setCalendarDay('');
                      }}
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                  <div className="calendar-grid">
                    {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
                      <span className="weekday" key={d}>
                        {d}
                      </span>
                    ))}
                    {Array.from({ length: calDate.getDay() }, (_, i) => (
                      <span key={'pad' + i} />
                    ))}
                    {Array.from({ length: dayCount }, (_, i) => {
                      const day = i + 1;
                      const has = monthWalks.some(
                        (w) => new Date(w.startedAt).getDate() === day,
                      );
                      return (
                        <button
                          key={day}
                          className={
                            calendarDay === `${monthKey}-${day}`
                              ? 'selected'
                              : ''
                          }
                          onClick={() => setCalendarDay(`${monthKey}-${day}`)}
                        >
                          {day}
                          {has && <i />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="calendar-legend">
                    <i />
                    记录过的遛弯日子
                  </div>
                  <div className="calendar-entries">
                    {(calendarDay
                      ? monthWalks.filter(
                          (w) =>
                            new Date(w.startedAt).getDate() ===
                            Number(calendarDay.split('-')[2]),
                        )
                      : monthWalks
                    ).map((w) => (
                      <div className="calendar-memory" key={w.id}>
                        <div className="history-row">
                          <span>
                            <Footprints size={20} />
                          </span>
                          <div>
                            <strong>
                              {walkPlaces.find((p) => p.id === w.placeId)?.name}
                            </strong>
                            <p>
                              {new Date(w.startedAt).toLocaleDateString(
                                'zh-CN',
                              )}{' '}
                              · {timeLabel(w.startedAt)}—
                              {timeLabel(w.endedAt || w.expiresAt)}
                            </p>
                          </div>
                          <b>{walkMinutes(w, now)} 分钟</b>
                        </div>
                        {w.memory && (
                          <div className="memory-preview">
                            {w.memory.photo && (
                              <Photo
                                src={w.memory.photo}
                                alt="这一天的记忆照"
                                className="memory-thumb"
                              />
                            )}
                            <div>
                              <div className="memory-stickers">
                                {w.memory.ownerMood && (
                                  <span>我 · {w.memory.ownerMood}</span>
                                )}
                                {w.memory.petMood && (
                                  <span>TA · {w.memory.petMood}</span>
                                )}
                              </div>
                              {w.memory.note && <p>{w.memory.note}</p>}
                              {!!w.memory.metPetIds.length && (
                                <small>
                                  遇见了{' '}
                                  {w.memory.metPetIds
                                    .map(
                                      (id) =>
                                        petNetwork.find((p) => p.id === id)
                                          ?.name,
                                    )
                                    .filter(Boolean)
                                    .join('、')}
                                </small>
                              )}
                            </div>
                          </div>
                        )}
                        <button
                          className="text-link"
                          onClick={() => openMemory(w.id)}
                        >
                          <BookOpen size={15} />
                          {w.memory ? '编辑这页回忆' : '补上一张照片、一点心情'}
                        </button>
                      </div>
                    ))}
                    {!(
                      calendarDay
                        ? monthWalks.filter(
                            (w) =>
                              new Date(w.startedAt).getDate() ===
                              Number(calendarDay.split('-')[2]),
                          )
                        : monthWalks
                    ).length && (
                      <Empty>
                        {calendarDay
                          ? '这一天还没有遛弯记录。'
                          : '这个月还没有遛弯记录，和毛孩子出门走走吧。'}
                      </Empty>
                    )}
                  </div>
                </section>
                <aside>
                  <section className="surface">
                    <h3 className="small-heading">照护小事</h3>
                    {data.checkins.length ? (
                      data.checkins.slice(0, 8).map((c) => (
                        <div className="care-log" key={c.id}>
                          <Heart size={15} />
                          <div>
                            <strong>{c.kind}</strong>
                            <span>{c.time}</span>
                          </div>
                          <Check size={14} />
                        </div>
                      ))
                    ) : (
                      <Empty>喂食、陪玩、洗澡，每一件小事都可以记下来。</Empty>
                    )}
                    <button
                      className="text-link"
                      onClick={() => go('我的宠物')}
                    >
                      去记录日常
                      <ChevronRight size={14} />
                    </button>
                  </section>
                  <section className="surface">
                    <h3 className="small-heading">下一次约定</h3>
                    {data.invitations.length ? (
                      data.invitations.map(inviteCard)
                    ) : (
                      <p className="muted-copy">
                        还没有约遛计划。偶遇很好，提前约定也可以。
                      </p>
                    )}
                  </section>
                </aside>
              </div>
            )}
          </div>
        )}
      </div>
      <nav className="mobile-nav" aria-label="手机导航">
        {sections.map(({ name, icon: Icon }) => (
          <button
            className={section === name ? 'active' : ''}
            key={name}
            onClick={() => go(name)}
          >
            <Icon size={21} />
            <span>
              {name === '遛宠地图'
                ? '去哪遛'
                : name === '我的宠物'
                  ? '我的宠物'
                  : name === '宠物好友'
                    ? '宠物好友'
                    : name === '陪伴日历'
                      ? '日历'
                      : name}
            </span>
          </button>
        ))}
      </nav>
      <Dialog
        open={!!modal}
        onOpenChange={(open) => {
          if (!open) setModal('');
        }}
      >
        <DialogContent
          className={'app-dialog ' + (modal === 'chat' ? 'chat-dialog' : '')}
        >
          <DialogTitle>
            {{
              place: place.name,
              route: '就去这里，刚好一起走走',
              start: '带 ' + data.pet.name + ' 开始遛弯',
              walk: '这一次，慢慢走',
              pet: pet.name + '的宠物名片',
              invite: '约好下一次散步',
              chat: pet.name + '的铲屎官',
              edit: '编辑宠物档案',
              publish: '记录一件小事',
              post: '一起遛过的日子',
              privacy: '地点共享，由你决定',
              about: '去哪遛 · 演示说明',
              code: '添加宠物好友',
              memory: '把这次出门，认真记下来',
              contribute: '补充遛宠好去处',
            }[modal] || '去哪遛'}
          </DialogTitle>
          <DialogDescription>
            {modal === 'chat'
              ? '本地模拟聊天，不会发送给真实用户。'
              : modal === 'pet'
                ? '先认识毛孩子，再自然熟悉彼此。'
                : modal === 'place'
                  ? '先看看环境适不适合，再带毛孩子出发。'
                  : '和毛孩子，把日子过得慢一点。'}
          </DialogDescription>
          {modal === 'memory' && memoryWalk && (
            <MemoryEditor
              key={memoryWalk.id}
              walk={memoryWalk}
              placeName={
                walkPlaces.find((p) => p.id === memoryWalk.placeId)?.name ||
                '一起出过的门'
              }
              petName={data.pet.name}
              buddyIds={state.buddyIds}
              onSave={(memory) => {
                setState((s) => ({
                  ...s,
                  history: s.history.map((w) =>
                    w.id === memoryWalk.id ? { ...w, memory } : w,
                  ),
                }));
                const day = new Date(memoryWalk.startedAt);
                const today = new Date();
                setCalendarOffset(
                  (day.getFullYear() - today.getFullYear()) * 12 +
                    day.getMonth() -
                    today.getMonth(),
                );
                setCalendarDay(
                  `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`,
                );
                go('陪伴日历');
                notify('照片、心情和相遇，已收进你的私人日历。');
              }}
            />
          )}
          {modal === 'contribute' && (
            <PlaceContribution
              onSave={(p) => {
                setState((s) => ({
                  ...s,
                  customPlaces: [...s.customPlaces, p],
                  legacy: {
                    ...s.legacy,
                    placeSaved: [...s.legacy.placeSaved, p.id],
                  },
                }));
                setSelected(p.id);
                setFilter('全部');
                setQuery('');
                setModal('place');
                notify('已保存并收藏你的地点，当前状态：待核实。');
              }}
            />
          )}
          {modal === 'place' && (
            <div className="place-detail">
              <div className="detail-lead">
                <span className="large-place-icon">
                  <Trees size={30} />
                </span>
                <div>
                  <h3>{place.kind}</h3>
                  <p>
                    {place.area} · {place.distance}
                  </p>
                </div>
                <button
                  className="icon-btn"
                  aria-label="收藏此地点"
                  onClick={() => savePlace(place.id)}
                >
                  <Bookmark
                    fill={
                      data.placeSaved.includes(place.id)
                        ? 'currentColor'
                        : 'none'
                    }
                  />
                </button>
              </div>
              {place.contributed && (
                <div className="contribution-status">
                  <span>我的贡献 · 待核实</span>
                  <p>只在本浏览器保存；尚未核实实际携宠规则。</p>
                </div>
              )}
              {place.photoUrl && (
                <Photo
                  src={place.photoUrl}
                  className="contribution-photo"
                  alt={place.name}
                />
              )}
              <p>{place.desc}</p>
              <div className="detail-facilities">
                {place.features.map((f, i) => (
                  <span key={f}>
                    {i === 0 ? (
                      <Trees size={18} />
                    ) : i === 1 ? (
                      <Droplets size={18} />
                    ) : i === 2 ? (
                      <ShieldCheck size={18} />
                    ) : (
                      <Sun size={18} />
                    )}
                    <strong>{f}</strong>
                  </span>
                ))}
              </div>
              <div className="place-advice">
                <ShieldCheck size={17} />
                <div>
                  <strong>出门前知道</strong>
                  <p>{place.caution}</p>
                  <p>适合：{place.size}</p>
                </div>
              </div>
              <h3 className="small-heading">宠物朋友的此刻</h3>
              {atPlace.length ? (
                atPlace.map((l) => buddyRow(l.petId))
              ) : (
                <p className="muted-copy">暂时没有好友在这里共享遛弯状态。</p>
              )}
              {place.id === 'p1' && (
                <div className="new-friend">
                  <Photo src={photos.corgi} className="avatar" />
                  <div>
                    <strong>常来这里的土豆</strong>
                    <p>温柔好奇 · 柯基 · 想交新朋友</p>
                  </div>
                  <button
                    className="text-link"
                    onClick={() => showPet('tudou')}
                  >
                    认识一下
                    <Plus size={15} />
                  </button>
                </div>
              )}
              <p className="demo-footnote">
                演示地点与设施信息，不作为实际出行依据。
              </p>
              <button
                className="primary full-width"
                onClick={() => setModal('route')}
              >
                <Navigation size={17} />
                就去这里
              </button>
            </div>
          )}
          {modal === 'route' && (
            <div className="route-detail">
              <div className="destination">
                <MapPin size={24} />
                <div>
                  <h3>{place.name}</h3>
                  <p>{place.area}</p>
                </div>
                <span>{place.distance}</span>
              </div>
              <div className="route-steps">
                <div>
                  <i />
                  <span>
                    社区出发点<small>当前为朝阳望京演示区域</small>
                  </span>
                </div>
                <div>
                  <Footprints size={16} />
                  <span>
                    {place.minutes
                      ? `步行约 ${place.minutes} 分钟`
                      : '步行时间待核实'}
                    <small>{place.route}</small>
                  </span>
                </div>
                <div>
                  <MapPin size={16} />
                  <span>
                    {place.name}
                    <small>
                      {atPlace.length
                        ? atPlace
                            .map(
                              (l) =>
                                petNetwork.find((p) => p.id === l.petId)?.name,
                            )
                            .join('、') + '正在这里遛'
                        : '去找一片喜欢的风景'}
                    </small>
                  </span>
                </div>
              </div>
              <div className="gentle-note">
                <Leaf size={18} />
                <p>
                  自己过去就好。查看地点和路线不会通知好友，也不会开启位置共享。
                </p>
              </div>
              <p className="demo-footnote">
                本页为路线流程演示，未接入地图导航。
              </p>
              <button className="primary full-width" onClick={begin}>
                <Check size={18} />
                演示：已到达，开始遛弯
              </button>
            </div>
          )}
          {modal === 'start' && (
            <div className="start-walk">
              <div className="start-pet">
                <Photo src={photos.corgi} className="avatar large" />
                <div>
                  <h3>{data.pet.name}要出门啦</h3>
                  <p>
                    <MapPin size={14} />
                    {place.name}
                  </p>
                </div>
              </div>
              <div className="form-field">
                <span>预计遛多久</span>
                <SelectOne
                  value={duration}
                  items={['30 分钟', '60 分钟', '90 分钟']}
                  onChange={setDuration}
                  label="预计遛弯时长"
                />
              </div>
              <div className="sharing-choice">
                <div>
                  <strong>
                    {privacy === 'friends'
                      ? '让宠物好友看见我们'
                      : '安安静静，自己遛'}
                  </strong>
                  <p>
                    {privacy === 'friends'
                      ? '好友能看见本次所在的公共地点，想来就来。'
                      : '不开启地点共享，也不会通知好友。'}
                  </p>
                </div>
                <Switch
                  checked={privacy === 'friends'}
                  onCheckedChange={(v) => setPrivacy(v ? 'friends' : 'private')}
                  aria-label="本次遛弯对好友可见"
                />
              </div>
              <div className="gentle-note">
                <ShieldCheck size={18} />
                <p>
                  只共享本次公共地点；不展示住宅地址或实时轨迹。到时、结束或隐身后，地点共享自动关闭。
                </p>
              </div>
              <button
                className="primary full-width"
                disabled={!ready}
                onClick={startWalk}
              >
                <Footprints size={19} />
                出发，开始记录
              </button>
            </div>
          )}
          {modal === 'walk' &&
            (walking ? (
              <div className="current-walk">
                <div className="walk-clock">
                  <span className="live-dot" />
                  正在遛弯
                  <strong>
                    {walkMinutes(state.walk!, now)}
                    <small>分钟</small>
                  </strong>
                  <p>
                    {walkPlaces.find((p) => p.id === state.walk!.placeId)?.name}
                  </p>
                </div>
                <div className="sharing-choice">
                  <div>
                    <strong>
                      {state.walk!.visibility === 'friends'
                        ? '本次地点对好友可见'
                        : '隐身遛弯中'}
                    </strong>
                    <p>
                      {state.walk!.visibility === 'friends'
                        ? '好友可以看到你们在哪个公共地点。'
                        : '仅自己可见，继续自在地走走吧。'}
                    </p>
                  </div>
                  <Switch
                    checked={state.walk!.visibility === 'friends'}
                    onCheckedChange={changeSharing}
                    aria-label="遛弯地点对好友可见"
                  />
                </div>
                <p className="demo-footnote">
                  本次记录与共享将在 {timeLabel(state.walk!.expiresAt)}{' '}
                  自动结束。
                </p>
                <button className="primary full-width" onClick={endWalk}>
                  <House size={18} />
                  遛好啦，回家
                </button>
              </div>
            ) : (
              <div>
                <Empty>本次遛弯已经结束，记录已收进日历。</Empty>
                <button
                  className="secondary full-width"
                  onClick={() => go('陪伴日历')}
                >
                  查看记录
                </button>
              </div>
            ))}
          {modal === 'pet' && (
            <div className="pet-detail">
              <Photo
                src={photos[pet.photo]}
                className="pet-cover"
                alt={pet.name}
              />
              <div className="pet-detail-heading">
                <h2>
                  {pet.name} <span>♂</span>
                </h2>
                <span className="small-tag">
                  {isBuddy ? '宠物好友' : '初次认识'}
                </span>
              </div>
              <p>
                {pet.breed} · {pet.age} · {pet.temper}
              </p>
              <p className="pet-description">{pet.desc}</p>
              {petLive ? (
                <button
                  className="pet-live-box"
                  onClick={() => showPlace(petLive.placeId)}
                >
                  <span className="live-dot" />
                  <div>
                    <strong>
                      正在{' '}
                      {walkPlaces.find((p) => p.id === petLive.placeId)?.name}
                    </strong>
                    <small>
                      好友共享 · 预计 {timeLabel(petLive.expiresAt)} 结束
                    </small>
                  </div>
                  <ArrowUpRight size={19} />
                </button>
              ) : (
                <div className="gentle-note">
                  <EyeOff size={18} />
                  <p>
                    {isBuddy
                      ? '现在没有共享遛弯地点。'
                      : '成为双方确认的好友后，才能看到对方主动共享的遛弯地点。'}
                  </p>
                </div>
              )}
              {isBuddy ? (
                <div className="dialog-actions">
                  <button
                    className="secondary"
                    onClick={() => setModal('chat')}
                  >
                    <MessageCircle size={17} />
                    聊两句
                  </button>
                  <button className="primary" onClick={openInvite}>
                    <CalendarDays size={17} />
                    约下次遛
                  </button>
                </div>
              ) : state.requests.includes(pet.id) ? (
                <div className="request-pending">
                  <p>
                    <Check size={17} />
                    好友申请已发出
                  </p>
                  <button
                    className="secondary full-width"
                    onClick={acceptFriend}
                  >
                    演示：对方接受申请
                  </button>
                </div>
              ) : (
                <button className="primary full-width" onClick={requestFriend}>
                  <UsersRound size={18} />让 TA 和 {data.pet.name} 成为好友
                </button>
              )}
            </div>
          )}
          {modal === 'chat' && (
            <div className="chat-box">
              <div className="chat-shortcut">
                <Photo src={photos[pet.photo]} className="avatar" />
                <span>关于 {pet.name} 的日常</span>
                <button className="text-link" onClick={openInvite}>
                  <Footprints size={15} />
                  约下次
                </button>
              </div>
              <div className="chat-messages">
                {(data.messages[pet.id] || []).map((m) => (
                  <div
                    className={'chat-bubble ' + (m.mine ? 'mine' : '')}
                    key={m.id}
                  >
                    {m.text}
                  </div>
                ))}
                {data.invitations
                  .filter((i) => i.friend === pet.id)
                  .map(inviteCard)}
              </div>
              <form
                className="chat-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
              >
                <input
                  aria-label="聊天内容"
                  value={chat}
                  onChange={(e) => setChat(e.target.value)}
                  placeholder="聊聊毛孩子的事…"
                  maxLength={1000}
                />
                <button
                  className="primary"
                  type="submit"
                  disabled={!chat.trim()}
                  aria-label="发送消息"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}
          {modal === 'invite' && (
            <form
              className="demo-form"
              onSubmit={(e) => {
                e.preventDefault();
                sendInvite();
              }}
            >
              <div className="form-field">
                <span>邀请宠物好友</span>
                <SelectOne
                  value={pet.name}
                  items={petNetwork
                    .filter((p) => state.buddyIds.includes(p.id))
                    .map((p) => p.name)}
                  label="选择宠物好友"
                  onChange={(v) =>
                    setActivePet(petNetwork.find((p) => p.name === v)!.id)
                  }
                />
              </div>
              <div className="form-field">
                <span>去哪里遛</span>
                <SelectOne
                  value={place.name}
                  items={walkPlaces.map((p) => p.name)}
                  label="约遛地点"
                  onChange={(v) =>
                    setSelected(walkPlaces.find((p) => p.name === v)!.id)
                  }
                />
              </div>
              <label>
                见面时间
                <input
                  type="datetime-local"
                  required
                  value={inviteDate}
                  onChange={(e) => setInviteDate(e.target.value)}
                />
              </label>
              <label>
                想说的话
                <textarea
                  rows={3}
                  value={note}
                  maxLength={200}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="明天下班带毛孩子一起走走？"
                />
              </label>
              <p className="demo-footnote">
                本地模拟邀请，可在会话里演示好友接受、婉拒或取消。
              </p>
              <button className="primary" type="submit">
                发起约遛
                <ArrowUpRight size={17} />
              </button>
            </form>
          )}
          {modal === 'edit' && (
            <form
              className="demo-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!edit.name.trim()) return;
                update((d) => ({
                  ...d,
                  pet: { ...edit, name: edit.name.trim() },
                }));
                setModal('');
                notify('宠物档案已保存。');
              }}
            >
              {[
                { name: 'name', label: '宠物名字' },
                { name: 'breed', label: '品种' },
                { name: 'age', label: '年龄' },
              ].map((f) => (
                <label key={f.name}>
                  {f.label}
                  <input
                    required
                    maxLength={20}
                    value={edit[f.name as keyof typeof edit]}
                    onChange={(e) =>
                      setEdit({ ...edit, [f.name]: e.target.value })
                    }
                  />
                </label>
              ))}
              <label>
                介绍一下 TA
                <textarea
                  rows={3}
                  maxLength={80}
                  value={edit.bio}
                  onChange={(e) => setEdit({ ...edit, bio: e.target.value })}
                />
              </label>
              <button className="primary" type="submit">
                保存宠物档案
              </button>
            </form>
          )}
          {modal === 'publish' && (
            <form
              className="demo-form"
              onSubmit={(e) => {
                e.preventDefault();
                publish();
              }}
            >
              <div className="upload-box">
                <Photo src={draftPhoto} />
                <div>
                  <button
                    className="secondary"
                    type="button"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Camera size={17} />
                    换一张照片
                  </button>
                  <small>小于 1 MB · 仅保存在当前浏览器</small>
                </div>
                <input
                  type="file"
                  hidden
                  ref={fileRef}
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => upload(e.target.files?.[0])}
                />
              </div>
              <label>
                今天的小事
                <input
                  required
                  maxLength={40}
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="今天和谁一起遛弯了？"
                />
              </label>
              <label>
                把这一天记下来
                <textarea
                  required
                  maxLength={1000}
                  rows={4}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="分享毛孩子的散步和相遇…"
                />
              </label>
              <button className="primary" type="submit">
                收进宠友圈
                <PawPrint size={17} />
              </button>
            </form>
          )}
          {modal === 'post' && post && (
            <div className="post-detail">
              <h3>{post.title}</h3>
              <p>{post.body}</p>
              <Photo src={post.image} alt={post.title} />
              <div className="post-detail-actions">
                <button
                  onClick={() =>
                    update((d) => ({
                      ...d,
                      liked: toggleItem(d.liked, post.id),
                    }))
                  }
                >
                  <Heart
                    size={19}
                    fill={
                      data.liked.includes(post.id) ? 'currentColor' : 'none'
                    }
                  />
                  喜欢
                </button>
                <button
                  onClick={() =>
                    update((d) => ({
                      ...d,
                      saved: toggleItem(d.saved, post.id),
                    }))
                  }
                >
                  <Bookmark size={19} />
                  {data.saved.includes(post.id) ? '已收藏' : '收藏'}
                </button>
              </div>
              <h4>朋友们的话</h4>
              {(data.comments[post.id] || []).map((c, i) => (
                <p className="comment-row" key={i}>
                  <strong>{data.pet.name}的铲屎官</strong>
                  {c}
                </p>
              ))}
              <form
                className="chat-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!comment.trim()) return;
                  update((d) => ({
                    ...d,
                    comments: {
                      ...d.comments,
                      [post.id]: [
                        ...(d.comments[post.id] || []),
                        comment.trim(),
                      ],
                    },
                  }));
                  setComment('');
                }}
              >
                <input
                  value={comment}
                  maxLength={300}
                  onChange={(e) => setComment(e.target.value)}
                  aria-label="评论"
                  placeholder="留下一句友善的话…"
                />
                <button
                  className="primary"
                  type="submit"
                  aria-label="发布评论"
                  disabled={!comment.trim()}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}
          {modal === 'privacy' && (
            <div className="explanation">
              <EyeOff size={30} />
              <h3>你还没有开启地点共享。</h3>
              <p>
                找到一个想去的地方，开始遛弯时可以选择“仅自己”或“好友可见”。
              </p>
              <p>
                好友只能看到本次所在的公共地点。隐身、结束遛弯或到达设定时间后，共享立即停止。
              </p>
              <button
                className="primary full-width"
                onClick={() => setModal('')}
              >
                知道了
              </button>
            </div>
          )}
          {modal === 'code' && (
            <div className="explanation">
              <UsersRound size={30} />
              <h3>从一次相遇，变成老朋友。</h3>
              <p>
                正式产品可用宠物伙伴码或现场扫码添加好友。本 Demo
                用「土豆」演示双方确认后建立好友关系。
              </p>
              <button
                className="primary full-width"
                onClick={() => showPet('tudou')}
              >
                认识土豆，体验加好友
                <ArrowUpRight size={17} />
              </button>
            </div>
          )}
          {modal === 'about' && (
            <div className="explanation">
              <p>
                去哪遛围绕宠物的出门和朋友展开：找宠物友好的地方，看看宠物朋友在哪遛，想过去就直接过去，也可以约好下一次。
              </p>
              <p>
                地图、路线、设施、宠物好友和遛弯状态均为演示。共享仅在本浏览器模拟；未接入
                GPS、即时通讯或真实地图服务。
              </p>
              <p>
                你的日常记录保存在本机。旧版已发布的动态、评论和宠物资料会迁移保留。照片由
                Unsplash 提供。
              </p>
              <button className="secondary full-width" onClick={resetPresences}>
                重新演示：好友刚出门遛弯
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {toast && (
        <output className="toast">
          <Check size={18} />
          {toast}
        </output>
      )}
    </SidebarProvider>
  );
}
