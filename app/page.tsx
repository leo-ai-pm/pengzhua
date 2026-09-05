'use client';
import { withBeijingPlaces } from './beijing-places';
/* eslint-disable next/no-img-element -- Sized CDN photos and device-local uploaded photos use ordinary image URLs. */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  PawPrint,
  MapPin,
  Footprints,
  UsersRound,
  House,
  BookOpen,
  ChevronRight,
  ArrowUpRight,
  ArrowLeft,
  Plus,
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
  Camera,
  CalendarDays,
  Settings2,
  Utensils,
  Navigation,
  Leaf,
  QrCode,
} from 'lucide-react';
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
import {
  photos,
  seedPosts,
  initialState,
  toggleItem,
  type DemoState,
} from './demo-data';
import {
  walkPlaces as basePlaces,
  petNetwork,
  seedPresences,
  visiblePresences,
  activeWalk,
  finishWalk,
  walkMinutes,
  type Walk,
  type Presence,
  type Visibility,
  type Place,
} from './walk-model';

import { MemoryEditor, PlaceContribution } from './walk-extras';
import MobileMap from './mobile-map';
import DevicePreview, { DeviceStatusBar } from './device-preview';
import { isLocated } from '@/lib/amap-client';
import { NavigationOptions } from './navigation-preview';
import { postDistance, selectFeedPosts } from './social-details';
import { contactAccess } from './contact-policy';
import { invitationLabel, isUpcomingInvitation, careForDate } from './qa-model';
import AccountMenu from './account-menu';

type State = {
  legacy: DemoState;
  buddyIds: string[];
  requests: string[];
  requestNotes: Record<string, string>;
  presences: Presence[];
  walk: Walk | null;
  history: Walk[];
  customPlaces: Place[];
  preferences: { walkDuration: string };
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
    requestNotes: {},
    presences: seedPresences(now),
    walk: null,
    history: [],
    customPlaces: [],
    preferences: { walkDuration: '60 分钟' },
  };
}
function restoreStored(raw: string, defaults: State): State {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return defaults;
    const legacy =
      parsed.legacy && typeof parsed.legacy === 'object' ? parsed.legacy : {};
    const restored = {
      ...defaults,
      ...parsed,
      legacy: {
        ...defaults.legacy,
        ...legacy,
        pet: { ...defaults.legacy.pet, ...legacy.pet },
      },
    };
    for (const key of [
      'posts',
      'liked',
      'saved',
      'following',
      'invitations',
      'checkins',
      'placeSaved',
    ] as const) {
      if (!Array.isArray(restored.legacy[key]))
        restored.legacy[key] = defaults.legacy[key];
    }
    for (const key of [
      'buddyIds',
      'requests',
      'presences',
      'history',
      'customPlaces',
    ] as const) {
      if (!Array.isArray(restored[key])) restored[key] = defaults[key];
    }
    for (const key of ['comments', 'messages'] as const) {
      if (
        !restored.legacy[key] ||
        typeof restored.legacy[key] !== 'object' ||
        Array.isArray(restored.legacy[key])
      )
        restored.legacy[key] = defaults.legacy[key];
    }
    restored.requestNotes =
      restored.requestNotes && typeof restored.requestNotes === 'object'
        ? restored.requestNotes
        : {};
    restored.preferences = {
      walkDuration: ['30 分钟', '60 分钟', '90 分钟'].includes(
        parsed.preferences?.walkDuration,
      )
        ? parsed.preferences.walkDuration
        : defaults.preferences.walkDuration,
    };
    return restored;
  } catch {
    return defaults;
  }
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
  const [selected, setSelected] = useState('p1');
  const [mapVisit, setMapVisit] = useState(0);
  const [modal, setModal] = useState('');
  const [activePet, setActivePet] = useState('doubao');
  const [toast, setToast] = useState('');
  const [friendTab, setFriendTab] = useState('正在遛弯');
  const [feedTab, setFeedTab] = useState('广场');
  const [privacy, setPrivacy] = useState<Visibility>('private');
  const [duration, setDuration] = useState('60 分钟');
  const [note, setNote] = useState('');
  const [chatDrafts, setChatDrafts] = useState<Record<string, string>>({});
  const chat = chatDrafts[activePet] || '';
  const setChat = (value: string) =>
    setChatDrafts((drafts) => ({ ...drafts, [activePet]: value }));
  const [friendNote, setFriendNote] = useState('');
  const [inviteDate, setInviteDate] = useState('');
  const [activeInvitationId, setActiveInvitationId] = useState('');
  const [inviteSource, setInviteSource] = useState('');
  const [draft, setDraft] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftPhoto, setDraftPhoto] = useState(photos.corgi);
  const [edit, setEdit] = useState(state.legacy.pet);
  const [memoryId, setMemoryId] = useState('');
  const [postId, setPostId] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>(
    {},
  );
  const comment = commentDrafts[postId || ''] || '';
  const setComment = (value: string) =>
    setCommentDrafts((drafts) => ({ ...drafts, [postId || '']: value }));
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
        next = restoreStored(raw, next);
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
    // Merge new public demo posts without replacing user-authored records or reactions.
    for (const seed of seedPosts) {
      if (!next.legacy.posts.some((p) => p.id === seed.id))
        next.legacy.posts.push(seed);
    }
    setState(next);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      const serialized = JSON.stringify(state);
      if (localStorage.getItem(KEY) !== serialized)
        localStorage.setItem(KEY, serialized);
    } catch {
      setToast('浏览器空间不足，当前修改将只保留到关闭页面。');
    }
  }, [state, ready]);
  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key === KEY && event.newValue)
        setState(restoreStored(event.newValue, initial(Date.now())));
    }
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
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
  const realPlaces = withBeijingPlaces(state.customPlaces);
  const walkPlaces = [...basePlaces, ...realPlaces];
  const memoryWalk = state.history.find((w) => w.id === memoryId);
  const live = visiblePresences(state.presences, state.buddyIds, now);
  const walking = activeWalk(state.walk, now);
  const place = walkPlaces.find((p) => p.id === selected)!;
  const pet = petNetwork.find((p) => p.id === activePet)!;
  const atPlace = live.filter((p) => p.placeId === place.id);
  const petLive = live.find((p) => p.petId === pet.id);
  const post = data.posts.find((p) => p.id === postId);
  const activeInvitation = data.invitations.find(
    (i) => i.id === activeInvitationId,
  );
  const invitationPlace = walkPlaces.find(
    (p) => p.id === activeInvitation?.place,
  );
  const isBuddy = state.buddyIds.includes(pet.id);
  const update = (fn: (d: DemoState) => DemoState) =>
    setState((s) => ({ ...s, legacy: fn(s.legacy) }));
  const notify = (s: string) => setToast(s);
  function go(name: string) {
    setSection(name);
    setModal('');
    document
      .querySelector('.app-main')
      ?.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function showPlace(id: string) {
    setSelected(id);
    const target = walkPlaces.find((p) => p.id === id);
    if (target && !isLocated(target)) {
      setModal('place');
      return;
    }
    // A menu/detail link must open its place even if the map is already showing a list.
    setMapVisit((visit) => visit + 1);
    go('遛宠地图');
  }
  function showPet(id: string) {
    setActivePet(id);
    setModal('pet');
  }
  function savePlace(id: string) {
    update((d) => ({ ...d, placeSaved: toggleItem(d.placeSaved, id) }));
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
  function beginFriendRequest(id = activePet) {
    setActivePet(id);
    setFriendNote('');
    setModal('friend-request');
  }
  function requestFriend() {
    if (!contactAccess(state.buddyIds, state.requests, activePet).canRequest)
      return;
    setState((s) => ({
      ...s,
      requests: [...new Set([...s.requests, activePet])],
      requestNotes: {
        ...s.requestNotes,
        [activePet]: friendNote.trim().slice(0, 80),
      },
    }));
    setModal('pet');
    notify('申请已保存。等待对方同意后，才能聊天和约遛。');
  }
  function acceptFriend() {
    if (!state.requests.includes(activePet)) return;
    setState((s) => ({
      ...s,
      buddyIds: [...new Set([...s.buddyIds, activePet])],
      requests: s.requests.filter((x) => x !== activePet),
    }));
    notify(`${pet.name}成为${data.pet.name}的好友啦！`);
  }
  function openInvite(id = activePet) {
    if (!contactAccess(state.buddyIds, state.requests, id).canInvite) {
      beginFriendRequest(id);
      return;
    }
    setActivePet(id);
    setInviteSource('');
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
    if (!contactAccess(state.buddyIds, state.requests, activePet).canInvite) {
      notify('成为双方确认的好友后，才能邀请一起遛。');
      return;
    }
    if (
      !Number.isFinite(new Date(inviteDate).getTime()) ||
      new Date(inviteDate).getTime() <= Date.now()
    ) {
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
          inviterName: data.pet.name + '的主人',
          sourcePostId: inviteSource || undefined,
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
    if (!contactAccess(state.buddyIds, state.requests, activePet).canMessage) {
      notify('成为双方确认的好友后，才能私聊。');
      return;
    }
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
          recordedAt: t.getTime(),
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
  const relevantPosts = selectFeedPosts(
    data.posts,
    feedTab,
    state.buddyIds,
    data.saved,
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
  const selectedCare = careForDate(
    data.checkins,
    calDate.getFullYear(),
    calDate.getMonth(),
    calendarDay ? Number(calendarDay.split('-')[2]) : undefined,
  );
  const upcomingInvitations = data.invitations.filter((i) =>
    isUpcomingInvitation(i, now),
  );
  const previousInvitations = data.invitations.filter(
    (i) => !isUpcomingInvitation(i, now),
  );
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
        <button
          className="invite-card-open"
          aria-label="查看约遛详情"
          onClick={() => {
            setActiveInvitationId(inv.id);
            setModal('invitation-detail');
          }}
        >
          <div className="row">
            <Footprints size={18} />
            <strong>下次一起遛</strong>
            <span className="status">{invitationLabel(inv, now)}</span>
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
          <span className="invite-detail-link">
            查看地点、日期与邀约人 <ChevronRight size={16} />
          </span>
        </button>
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
    <DevicePreview>
      <div className="phone-app">
        <DeviceStatusBar />
        <div className="app-main">
          <header className="app-header">
            <div className="breadcrumb">
              <span>和 {data.pet.name} 一起</span>
              <ChevronRight size={14} />
              <strong>{section}</strong>
            </div>
            <div className="header-right">
              <button className="demo-badge" onClick={() => setModal('about')}>
                <i />
                手机演示
              </button>
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
              <AccountMenu
                pet={data.pet}
                friends={state.buddyIds.length}
                walks={state.history.length}
                places={walkPlaces.filter((p) =>
                  data.placeSaved.includes(p.id),
                )}
                posts={data.posts.filter((p) => data.saved.includes(p.id))}
                walk={walking ? state.walk : null}
                duration={state.preferences.walkDuration}
                onDuration={(walkDuration) =>
                  setState((s) => ({ ...s, preferences: { walkDuration } }))
                }
                onSharing={changeSharing}
                onNavigate={go}
                onEdit={() => {
                  setEdit(data.pet);
                  setModal('edit');
                }}
                onPlace={showPlace}
                onPost={(id) => {
                  setPostId(id);
                  setModal('post');
                }}
              />
            </div>
          </header>
          {section === '遛宠地图' ? (
            <MobileMap
              key={mapVisit}
              places={realPlaces}
              selected={selected}
              saved={data.placeSaved}
              live={live}
              walking={walking}
              onSelect={(p) => {
                setSelected(p.id);
                setState((s) => ({
                  ...s,
                  customPlaces: s.customPlaces.some((x) => x.id === p.id)
                    ? s.customPlaces
                    : [...s.customPlaces, p],
                }));
              }}
              onSave={savePlace}
              onStart={(p) => {
                setSelected(p.id);
                setState((s) => ({
                  ...s,
                  customPlaces: s.customPlaces.some((x) => x.id === p.id)
                    ? s.customPlaces
                    : [...s.customPlaces, p],
                }));
                if (walking) setModal('walk');
                else {
                  setPrivacy('private');
                  setDuration(state.preferences.walkDuration);
                  setModal('start');
                }
              }}
              onCurrentWalk={() => setModal('walk')}
              onContribute={(p) => {
                setSelected(p.id);
                setModal('contribute');
              }}
              onPet={showPet}
            />
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
                        ? '分享散步和相遇，认识更多毛孩子。'
                        : '从每一次出门，到每一件小事。'}
                  </p>
                </div>
                {section === '宠友圈' ? (
                  <button
                    className="primary"
                    onClick={() => setModal('publish')}
                  >
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
                        <span className="pet-temper">
                          快乐小社牛 · 喜欢嗅闻
                        </span>
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
                                {
                                  walkPlaces.find((p) => p.id === w.placeId)
                                    ?.name
                                }
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
                          带 {data.pet.name}{' '}
                          开始一次遛弯，结束后会自动记在这里。
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
                                      onClick={() =>
                                        showPlace(presence.placeId)
                                      }
                                    >
                                      我也去这里
                                      <ArrowUpRight size={16} />
                                    </button>
                                  )}
                                  <button
                                    className="secondary"
                                    onClick={() => {
                                      setActivePet(id);
                                      openInvite(id);
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
                      items={['广场', '好友圈', '我的日常', '我的收藏']}
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
                                <small>
                                  {p.time} ·{' '}
                                  {p.pet === 'me'
                                    ? '我的日常'
                                    : state.buddyIds.includes(p.pet)
                                      ? '宠物好友'
                                      : '还不是好友'}
                                </small>
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
                              {postDistance(p)}
                            </span>
                            <button
                              className={
                                data.liked.includes(p.id) ? 'liked' : ''
                              }
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
                              className={
                                data.saved.includes(p.id) ? 'liked' : ''
                              }
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
                    <button
                      className="secondary"
                      onClick={() => go('遛宠地图')}
                    >
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
                                {
                                  walkPlaces.find((p) => p.id === w.placeId)
                                    ?.name
                                }
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
                            {w.memory
                              ? '编辑这页回忆'
                              : '补上一张照片、一点心情'}
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
                      {selectedCare.length ? (
                        selectedCare.map((c) => (
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
                        <Empty>所选日期范围暂无照护记录。</Empty>
                      )}
                      {data.checkins.some(
                        (c) => !Number.isFinite(c.recordedAt),
                      ) && (
                        <details className="old-care-records">
                          <summary>未标注完整日期的旧记录</summary>
                          {data.checkins
                            .filter((c) => !Number.isFinite(c.recordedAt))
                            .map((c) => (
                              <p key={c.id}>
                                {c.kind} · {c.time}
                              </p>
                            ))}
                        </details>
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
                      {upcomingInvitations.length ? (
                        upcomingInvitations.map(inviteCard)
                      ) : (
                        <p className="muted-copy">
                          还没有约遛计划。偶遇很好，提前约定也可以。
                        </p>
                      )}
                      {!!previousInvitations.length && (
                        <details className="previous-invitations">
                          <summary>
                            历史与已取消约定（{previousInvitations.length}）
                          </summary>
                          {previousInvitations.map(inviteCard)}
                        </details>
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
                  ? '碰爪'
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
                'friend-request': '让毛孩子先认识一下',
                'invitation-detail': '约遛详情',
                chat: pet.name + '的铲屎官',
                edit: '编辑宠物档案',
                publish: '记录一件小事',
                post: '一起遛过的日子',
                privacy: '地点共享，由你决定',
                about: '碰爪 · 演示说明',
                code: '添加宠物好友',
                memory: '把这次出门，认真记下来',
                contribute: '补充遛宠好去处',
              }[modal] || '碰爪'}
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
                anchor={isLocated(place) ? place : undefined}
                onSave={(p) => {
                  setState((s) => ({
                    ...s,
                    customPlaces: [
                      ...s.customPlaces.filter((x) => x.id !== p.id),
                      p,
                    ],
                    legacy: {
                      ...s.legacy,
                      placeSaved: Array.from(
                        new Set([...s.legacy.placeSaved, p.id]),
                      ),
                    },
                  }));
                  setSelected(p.id);
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
                {place.experience && (
                  <section className="saved-experience">
                    <h3>我的携宠体验</h3>
                    <p>{place.experience.note}</p>
                    <p>{place.experience.features.join(' · ')}</p>
                    <small>个人体验，不代表场地官方准入规则</small>
                  </section>
                )}
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
                  {isLocated(place)
                    ? '真实地图地点，携宠规则与现场体验仍需核实。'
                    : '演示地点与设施信息，不作为实际出行依据。'}
                </p>
                <button
                  className="primary full-width"
                  onClick={() => setModal('route')}
                >
                  <Navigation size={17} />
                  怎么走
                </button>
              </div>
            )}
            {modal === 'route' && (
              <NavigationOptions
                key={place.id}
                place={place}
                onClose={() => setModal('place')}
              />
            )}
            {modal === 'invitation-detail' && activeInvitation && (
              <div className="invitation-detail">
                <span className="invitation-status">
                  {invitationLabel(activeInvitation, now)}
                </span>
                <h3>{invitationPlace?.name || '地点信息暂不可用'}</h3>
                <p>{invitationPlace?.area}</p>
                <dl>
                  <div>
                    <dt>见面日期</dt>
                    <dd>
                      {new Date(activeInvitation.date).toLocaleDateString(
                        'zh-CN',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long',
                        },
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>见面时间</dt>
                    <dd>
                      {new Date(activeInvitation.date).toLocaleTimeString(
                        'zh-CN',
                        { hour: '2-digit', minute: '2-digit' },
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>邀约人</dt>
                    <dd>
                      {activeInvitation.inviterName || data.pet.name + '的主人'}
                    </dd>
                  </div>
                  <div>
                    <dt>受邀伙伴</dt>
                    <dd>
                      {petNetwork.find((p) => p.id === activeInvitation.friend)
                        ?.name || '宠物好友'}
                      和TA的主人
                    </dd>
                  </div>
                  <div>
                    <dt>邀约留言</dt>
                    <dd>{activeInvitation.note || '一起带毛孩子散散步。'}</dd>
                  </div>
                </dl>
                <p className="demo-footnote">演示邀约，仅保存在当前浏览器。</p>
                {invitationPlace && (
                  <button
                    className="primary full-width"
                    onClick={() => showPlace(invitationPlace.id)}
                  >
                    查看具体地点 <MapPin size={17} />
                  </button>
                )}
                {activeInvitation.sourcePostId && (
                  <button
                    className="secondary full-width"
                    onClick={() => {
                      setPostId(activeInvitation.sourcePostId!);
                      setModal('post');
                    }}
                  >
                    查看发起邀约的帖子
                  </button>
                )}
                <button className="text-link" onClick={() => setModal('')}>
                  返回
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
                    onCheckedChange={(v) =>
                      setPrivacy(v ? 'friends' : 'private')
                    }
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
                      {
                        walkPlaces.find((p) => p.id === state.walk!.placeId)
                          ?.name
                      }
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
                    <button className="primary" onClick={() => openInvite()}>
                      <CalendarDays size={17} />
                      约下次遛
                    </button>
                  </div>
                ) : state.requests.includes(pet.id) ? (
                  <div className="request-pending">
                    <p>
                      <Check size={17} />
                      好友申请已发出 · 等待回应
                    </p>
                    <p>对方同意前，暂时不能私聊、约遛或追加申请。</p>
                    {state.requestNotes?.[activePet] && (
                      <p>申请留言：{state.requestNotes[activePet]}</p>
                    )}
                    <button
                      className="secondary full-width"
                      onClick={acceptFriend}
                    >
                      演示：对方接受申请
                    </button>
                  </div>
                ) : (
                  <button
                    className="primary full-width"
                    onClick={() => beginFriendRequest()}
                  >
                    <UsersRound size={18} />让 TA 和 {data.pet.name} 成为好友
                  </button>
                )}
              </div>
            )}
            {(modal === 'friend-request' ||
              ((modal === 'chat' || modal === 'invite') && !isBuddy)) && (
              <form
                className="demo-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  requestFriend();
                }}
              >
                <p>
                  向{pet.name}
                  的主人申请成为宠物好友。对方同意后，才能私聊和邀请一起遛。
                </p>
                {state.requests.includes(activePet) ? (
                  <output>
                    申请已发出，等待对方回应。暂时不能追加消息或重复申请。
                  </output>
                ) : (
                  <>
                    <label>
                      介绍一下毛孩子（选填）
                      <textarea
                        value={friendNote}
                        onChange={(e) => setFriendNote(e.target.value)}
                        maxLength={80}
                        placeholder="你好，我家芒果也喜欢散步，希望有机会认识一下。"
                      />
                    </label>
                    <small>{friendNote.length}/80 · 申请中不共享位置</small>
                    <button className="primary full-width" type="submit">
                      发送好友申请
                    </button>
                  </>
                )}
                <button
                  className="secondary full-width"
                  type="button"
                  onClick={() => setModal('pet')}
                >
                  查看宠物名片
                </button>
              </form>
            )}
            {modal === 'chat' && isBuddy && (
              <div className="chat-box">
                <div className="chat-shortcut">
                  <Photo src={photos[pet.photo]} className="avatar" />
                  <span>关于 {pet.name} 的日常</span>
                  <button className="text-link" onClick={() => openInvite()}>
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
            {modal === 'invite' && isBuddy && (
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
                <div className="post-person">
                  <Photo
                    src={
                      post.pet === 'me'
                        ? photos.corgi
                        : photos[
                            petNetwork.find((p) => p.id === post.pet)?.photo ||
                              'corgi'
                          ]
                    }
                    className="avatar"
                  />
                  <div>
                    <strong>
                      {post.pet === 'me' ? data.pet.name : post.author}的日常
                    </strong>
                    <p>
                      {post.time} · {postDistance(post)}
                    </p>
                  </div>
                </div>
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
                {post.pet !== 'me' &&
                  petNetwork.some((p) => p.id === post.pet) && (
                    <div className="post-walk-invite">
                      {contactAccess(state.buddyIds, state.requests, post.pet)
                        .friend ? (
                        <>
                          <small>已是宠物好友</small>
                          <strong>下次，带毛孩子一起走走</strong>
                          <p>和{post.author}的主人选个地点、约个时间。</p>
                          <div>
                            <button
                              className="primary"
                              onClick={() => {
                                openInvite(post.pet);
                                setInviteSource(post.id);
                                setSelected(realPlaces[0].id);
                              }}
                            >
                              邀请一起遛 <Footprints size={17} />
                            </button>
                            <button
                              className="secondary"
                              onClick={() => {
                                setActivePet(post.pet);
                                setModal('chat');
                              }}
                            >
                              聊一聊 <MessageCircle size={17} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <strong>先成为宠物好友</strong>
                          <p>
                            对方同意后，再聊天、约遛。地点仅在对方主动共享时可见。
                          </p>
                          <div>
                            <button
                              className="primary"
                              disabled={state.requests.includes(post.pet)}
                              onClick={() => beginFriendRequest(post.pet)}
                            >
                              {state.requests.includes(post.pet)
                                ? '申请已发出 · 等待回应'
                                : '申请成为好友'}
                            </button>
                            <button
                              className="secondary"
                              onClick={() => showPet(post.pet)}
                            >
                              看看宠物名片
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
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
                  碰爪围绕宠物的出门和朋友展开：找宠物友好的地方，看看宠物朋友在哪遛，想过去就直接过去，也可以约好下一次。
                </p>
                <p>
                  真实地图使用高德 JS
                  API，需配置项目地图服务后启用。宠物好友、聊天与地点共享仍只在本浏览器模拟，尚未接入多用户实时同步。
                </p>
                <p>
                  你的日常记录保存在本机。旧版已发布的动态、评论和宠物资料会迁移保留。照片由
                  Unsplash 提供。
                </p>
                <button
                  className="secondary full-width"
                  onClick={resetPresences}
                >
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
      </div>
    </DevicePreview>
  );
}
