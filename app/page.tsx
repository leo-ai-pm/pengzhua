'use client';
/* eslint-disable next/no-img-element -- CDN photos are already sized; local demo uploads use data URLs. */
import Link from 'next/link';
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  PawPrint,
  Compass,
  MapPin,
  MessageCircle,
  Plus,
  Heart,
  Bookmark,
  Search,
  Bell,
  ArrowUpRight,
  ChevronRight,
  Sun,
  Footprints,
  UserRound,
  ImagePlus,
  Send,
  Check,
  Coffee,
  Trees,
  CalendarDays,
  X,
  Settings2,
  Droplets,
  Utensils,
  Sparkles,
  Flag,
  ShieldCheck,
  Navigation,
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
import {
  photos,
  friends,
  places,
  initialState,
  toggleItem,
  filterPosts,
  type DemoState,
  type Post,
} from './demo-data';

const navItems = [
  { icon: Compass, label: '社区' },
  { icon: MapPin, label: '附近' },
  { icon: MessageCircle, label: '消息' },
  { icon: UserRound, label: '我的' },
];
const KEY = 'qunaliu-demo-v1';
function Photo({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [bad, setBad] = useState(false);
  return bad ? (
    <div className={`image-fallback ${className}`}>
      <PawPrint />
      <span>照片暂时无法加载</span>
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setBad(true)}
      loading="lazy"
    />
  );
}
function Picker({
  value,
  onChange,
  items,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  items: string[];
  label: string;
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
function TabBar({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (v: string) => void;
  items: string[];
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(String(v))}
      className="feed-tabs"
    >
      <TabsList variant="line" aria-label="内容分类">
        {items.map((x) => (
          <TabsTrigger key={x} value={x}>
            {x}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="empty">
      <PawPrint size={38} />
      <h3>这里还在等一段新故事</h3>
      <p>{children}</p>
    </div>
  );
}
export default function Home() {
  const [now, setNow] = useState(0);
  const [data, setData] = useState<DemoState>(initialState);
  const [ready, setReady] = useState(false);
  const [section, setSection] = useState('社区');
  const [tab, setTab] = useState('推荐');
  const [category, setCategory] = useState('全部');
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('上海');
  const [modal, setModal] = useState('');
  const [toast, setToast] = useState('');
  const [activePost, setActivePost] = useState<string | null>(null);
  const [activeFriend, setActiveFriend] = useState('doubao');
  const [activePlace, setActivePlace] = useState('p1');
  const [nearTab, setNearTab] = useState('宠物友好地图');
  const [petFilter, setPetFilter] = useState('全部');
  const [profileTab, setProfileTab] = useState('我的日记');
  const [chatText, setChatText] = useState('');
  const [comment, setComment] = useState('');
  const [draft, setDraft] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftImage, setDraftImage] = useState(photos.corgi);
  const [draftTopic, setDraftTopic] = useState('遛宠日常');
  const [inviteDate, setInviteDate] = useState('');
  const [inviteNote, setInviteNote] = useState('');
  const [editPet, setEditPet] = useState(data.pet);
  const fileInput = useRef<HTMLInputElement>(null);
  const chatBottom = useRef<HTMLDivElement>(null);
  // Hydrate explicitly device-local demo data after SSR.
  /* eslint-disable react/react-compiler -- Browser storage hydration and quota reporting require state updates. */
  useEffect(() => {
    setNow(Date.now());
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (Array.isArray(d.posts) && d.pet && Array.isArray(d.invitations))
          setData({ ...initialState(), ...d });
      }
    } catch {}
    setReady(true);
  }, []);
  // Sync local demo records with browser storage and report quota errors.
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      setToast('浏览器空间不足，本次修改仅保留到页面关闭。');
    }
  }, [data, ready]);
  /* eslint-enable react/react-compiler */
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    chatBottom.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [data.messages, section, activeFriend]);
  const notify = (s: string) => setToast(s);
  function go(s: string) {
    setSection(s);
    setQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function toggle(
    key: 'liked' | 'saved' | 'following' | 'placeSaved',
    id: string,
  ) {
    setData((d) => ({ ...d, [key]: toggleItem(d[key], id) }));
  }
  function friendProfile(id: string) {
    setActiveFriend(id);
    setModal('friend');
  }
  function startChat(id: string) {
    setActiveFriend(id);
    setModal('');
    go('消息');
  }
  function openInvite() {
    setModal('invite');
    if (!inviteDate) {
      const d = new Date(Date.now() + 86400000);
      d.setHours(17, 0, 0, 0);
      setInviteDate(
        new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16),
      );
    }
  }
  function publish() {
    if (!draftTitle.trim() || !draft.trim()) {
      notify('写上标题和今天的故事吧');
      return;
    }
    const p: Post = {
      id: crypto.randomUUID(),
      title: draftTitle.trim(),
      body: draft.trim(),
      image: draftImage,
      author: data.pet.name,
      pet: 'me',
      topic: draftTopic,
      category: '汪星人',
      likes: 0,
      city,
      time: '刚刚',
    };
    setData((d) => ({ ...d, posts: [p, ...d.posts] }));
    setDraft('');
    setDraftTitle('');
    setModal('');
    setTab('推荐');
    setCategory('全部');
    go('社区');
    notify('发布成功，毛孩子的快乐已记录在此浏览器');
  }
  function sendChat() {
    if (!chatText.trim()) return;
    const text = chatText.trim();
    setData((d) => ({
      ...d,
      messages: {
        ...d.messages,
        [activeFriend]: [
          ...(d.messages[activeFriend] || []),
          { id: crypto.randomUUID(), text, mine: true },
        ],
      },
    }));
    setChatText('');
  }
  function checkin(kind: string) {
    setData((d) => ({
      ...d,
      checkins: [
        {
          id: crypto.randomUUID(),
          kind,
          time: new Date().toLocaleString('zh-CN', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
        ...d.checkins,
      ],
    }));
    notify(`${kind}已记录，今天也是被爱的一天`);
  }
  function sendInvite() {
    if (!inviteDate || new Date(inviteDate).getTime() <= Date.now()) {
      notify('请选择未来的约遛时间');
      return;
    }
    setData((d) => ({
      ...d,
      invitations: [
        {
          id: crypto.randomUUID(),
          friend: activeFriend,
          place: activePlace,
          date: inviteDate,
          note: inviteNote,
          status: '待回应',
        },
        ...d.invitations,
      ],
    }));
    setModal('');
    go('消息');
    notify('约遛邀请已加入本地演示，可模拟对方回应');
  }
  async function upload(file?: File) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      notify('请选择 JPG、PNG 或 WebP 图片');
      return;
    }
    if (file.size > 1024 * 1024) {
      notify('演示版请使用小于 1 MB 的照片');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setDraftImage(reader.result);
    };
    reader.onerror = () => notify('照片读取失败，请重试');
    reader.readAsDataURL(file);
  }
  const post = data.posts.find((p) => p.id === activePost);
  const friend = friends.find((f) => f.id === activeFriend)!;
  const place = places.find((p) => p.id === activePlace)!;
  const filtered = filterPosts(data, tab, category, query, city);
  const nearby = friends.filter(
    (f) =>
      (petFilter === '全部' || f.type === petFilter) &&
      (!query || `${f.name}${f.breed}${f.tag}`.includes(query)),
  );
  const shownPlaces = places.filter(
    (p) => !query || `${p.name}${p.area}${p.tags.join('')}`.includes(query),
  );
  const headerText =
    section === '社区'
      ? [
          'THE PAW COMMUNITY',
          '每一次出门，都有新朋友',
          '发现身边的毛孩子，分享平凡又闪光的小日子。',
        ]
      : section === '附近'
        ? [
            'GOOD PLACES, GREAT FRIENDS',
            '下一站，和快乐碰个面',
            '找一片喜欢的草地，也找一个合拍的玩伴。',
          ]
        : section === '消息'
          ? [
              'A LITTLE HELLO',
              '从一句“你好”开始',
              '一起聊聊毛孩子，约定下一次散步。',
            ]
          : [
              'MY LITTLE WORLD',
              `${data.pet.name}的小小世界`,
              '把陪伴写进日常，把快乐慢慢收藏。',
            ];
  function renderPost(p: Post) {
    return (
      <article className="post-card" key={p.id}>
        <button
          className="post-image-button"
          onClick={() => {
            setActivePost(p.id);
            setModal('post');
          }}
          aria-label={'查看动态：' + p.title}
        >
          <Photo src={p.image} alt={p.title} className="post-image" />
          <span className="image-location">
            <MapPin size={11} />
            {p.city}
          </span>
        </button>
        <div className="post-body">
          <button
            className="post-topic"
            onClick={() => {
              setCategory(p.topic);
              setTab('推荐');
            }}
          >
            # {p.topic}
          </button>
          <button
            className="post-title"
            onClick={() => {
              setActivePost(p.id);
              setModal('post');
            }}
          >
            {p.title}
          </button>
          <div className="post-footer">
            <button
              className="post-author"
              onClick={() =>
                p.pet === 'me' ? go('我的') : friendProfile(p.pet)
              }
            >
              <Photo src={p.image} alt="" className="tiny-avatar" />
              {p.author}的日常
            </button>
            <button
              aria-label={data.liked.includes(p.id) ? '取消点赞' : '点赞'}
              aria-pressed={data.liked.includes(p.id)}
              className={
                data.liked.includes(p.id) ? 'like-button liked' : 'like-button'
              }
              onClick={() => toggle('liked', p.id)}
            >
              <Heart
                size={15}
                fill={data.liked.includes(p.id) ? 'currentColor' : 'none'}
              />
              {p.likes + (data.liked.includes(p.id) ? 1 : 0)}
            </button>
          </div>
        </div>
      </article>
    );
  }
  function renderInvitation(inv: DemoState['invitations'][number]) {
    const expired = new Date(inv.date).getTime() < now;
    return (
      <div className="invitation-card" key={inv.id}>
        <div className="row-between">
          <strong>
            <Footprints size={17} />
            一起去遛弯
          </strong>
          <span className="status-tag">
            {expired && inv.status === '待回应' ? '已过期' : inv.status}
          </span>
        </div>
        <p>
          {places.find((p) => p.id === inv.place)?.name} ·{' '}
          {friends.find((f) => f.id === inv.friend)?.name}
        </p>
        <span className="meta">
          <CalendarDays size={14} />
          {new Date(inv.date).toLocaleString('zh-CN', {
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        {inv.note && <p>{inv.note}</p>}
        {inv.status === '待回应' && !expired && (
          <div className="invite-actions">
            <small>模拟对方回应</small>
            <button
              onClick={() =>
                setData((d) => ({
                  ...d,
                  invitations: d.invitations.map((x) =>
                    x.id === inv.id ? { ...x, status: '已接受' } : x,
                  ),
                }))
              }
            >
              接受
            </button>
            <button
              onClick={() =>
                setData((d) => ({
                  ...d,
                  invitations: d.invitations.map((x) =>
                    x.id === inv.id ? { ...x, status: '已拒绝' } : x,
                  ),
                }))
              }
            >
              拒绝
            </button>
          </div>
        )}
        {(inv.status === '待回应' || inv.status === '已接受') && !expired && (
          <button
            className="text-button muted"
            onClick={() =>
              setData((d) => ({
                ...d,
                invitations: d.invitations.map((x) =>
                  x.id === inv.id ? { ...x, status: '已取消' } : x,
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
    <SidebarProvider style={{ '--sidebar-width': '216px' } as CSSProperties}>
      <Sidebar collapsible="none" className="app-sidebar">
        <Link className="brand" href="/">
          <span>
            <PawPrint size={26} />
          </span>
          去哪遛<i>·</i>
        </Link>
        <div className="brand-note">和毛孩子，一起交个朋友</div>
        <nav aria-label="主导航">
          {navItems.map(({ icon: Icon, label }) => (
            <button
              key={label}
              aria-current={section === label ? 'page' : undefined}
              className={section === label ? 'nav-link active' : 'nav-link'}
              onClick={() => go(label)}
            >
              <Icon size={21} />
              {label}
              {label === '消息' && <b>2</b>}
            </button>
          ))}
        </nav>
        <button className="primary publish" onClick={() => setModal('publish')}>
          <Plus size={20} />
          发布日常
        </button>
        <div className="sidebar-bottom">
          <button className="mini-pet" onClick={() => go('我的')}>
            <Photo src={photos.corgi} alt="芒果" className="avatar" />
            <div>
              <strong>{data.pet.name}的铲屎官</strong>
              <small>今天也要好好陪伴</small>
            </div>
          </button>
          <button className="demo-tag" onClick={() => setModal('about')}>
            WEB DEMO · 演示数据
          </button>
        </div>
      </Sidebar>
      <div className="workspace">
        <header className="topbar">
          <div className="location">
            <MapPin size={17} />
            <Picker
              value={city}
              onChange={(v) => {
                setCity(v);
                notify(`已切换到${v}，地点和宠友为演示内容`);
              }}
              items={['上海', '杭州', '北京', '深圳']}
              label="选择城市"
            />
          </div>
          <label className="search">
            <Search size={18} />
            <input
              aria-label="搜索宠友、地点和动态"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (section === '消息' || section === '我的')
                  setSection('社区');
              }}
              placeholder="搜索宠友、地点和新鲜事"
            />
            {query && (
              <button aria-label="清除搜索" onClick={() => setQuery('')}>
                <X size={16} />
              </button>
            )}
          </label>
          <button
            aria-label="查看通知"
            className="icon-button"
            onClick={() => setModal('notifications')}
          >
            <Bell size={20} />
            <i />
          </button>
          <button
            className="header-avatar"
            onClick={() => go('我的')}
            aria-label="个人主页"
          >
            <Photo src={photos.corgi} alt="芒果" className="avatar" />
          </button>
        </header>
        <div
          className={
            'page-grid ' + (section === '消息' ? 'message-layout' : '')
          }
        >
          <main>
            <div className="page-heading">
              <div>
                <span className="eyebrow">{headerText[0]}</span>
                <h1>
                  {headerText[1]}
                  <span>。</span>
                </h1>
                <p>{headerText[2]}</p>
              </div>
              {section === '社区' && (
                <span className="weather">
                  <Sun /> 26°<small>晴天 · 演示天气</small>
                </span>
              )}
            </div>
            {section === '社区' && (
              <>
                <div className="community-banner">
                  <Photo
                    src={photos.park}
                    alt="在绿地玩耍的柯基"
                    className="banner-photo"
                  />
                  <div className="banner-content">
                    <span className="pill">周末一起玩</span>
                    <h2>把快乐，遛大一点。</h2>
                    <p>带上毛孩子，去草地上认识新朋友。</p>
                    <button
                      className="dark-button"
                      onClick={() => {
                        setNearTab('附近宠友');
                        go('附近');
                      }}
                    >
                      发现附近宠友 <ArrowUpRight size={18} />
                    </button>
                  </div>
                  <span className="banner-caption">
                    <span className="online-dot" /> 今天也有好朋友在等你
                  </span>
                </div>
                <TabBar
                  value={tab}
                  onChange={setTab}
                  items={['推荐', '同城', '关注']}
                />
                <div className="feed-controls">
                  <div className="chips">
                    {['全部', '汪星人', '喵星人', '遛宠日常', '友好探店'].map(
                      (x) => (
                        <button
                          aria-pressed={category === x}
                          className={category === x ? 'selected' : ''}
                          key={x}
                          onClick={() => setCategory(x)}
                        >
                          {x}
                        </button>
                      ),
                    )}
                  </div>
                  <span className="small-note">
                    发现新鲜事 <Sparkles size={13} />
                  </span>
                </div>
                {query && (
                  <p className="search-result">
                    “{query}” 的搜索结果 · {filtered.length} 条
                  </p>
                )}
                {filtered.length ? (
                  <div className="post-grid">{filtered.map(renderPost)}</div>
                ) : (
                  <Empty>
                    {tab === '关注'
                      ? '关注感兴趣的宠友，他们的日常就会出现在这里。'
                      : '换一个关键词或分类，再找找看吧。'}
                    <button
                      className="text-button"
                      onClick={() => {
                        setTab('推荐');
                        setCategory('全部');
                        setQuery('');
                      }}
                    >
                      查看全部动态
                    </button>
                  </Empty>
                )}
                <p className="end-note">
                  已经看到这里啦，带毛孩子出去走走吧 <PawPrint size={13} />
                </p>
              </>
            )}
            {section === '附近' && (
              <>
                <TabBar
                  value={nearTab}
                  onChange={setNearTab}
                  items={['宠物友好地图', '附近宠友']}
                />
                <p className="demo-inline">
                  <Navigation size={14} />
                  {city} · 地图、距离及地点均为演示数据
                </p>
                {nearTab === '宠物友好地图' ? (
                  <>
                    <div className="map-surface">
                      <svg
                        viewBox="0 0 800 420"
                        preserveAspectRatio="none"
                        className="map-geometry"
                        aria-hidden="true"
                      >
                        <rect width="800" height="420" fill="#f0f0e7" />
                        <path
                          d="M0 90H800M0 190H800M0 320H800M180 0V420M410 0V420M680 0V420"
                          stroke="#fff"
                          strokeWidth="18"
                        />
                        <path
                          d="M545 -20Q470 130 570 210T580 450"
                          fill="none"
                          stroke="#c3dde5"
                          strokeWidth="78"
                        />
                        <path
                          d="M560 -20Q490 130 590 210T600 450"
                          fill="none"
                          stroke="#d4e8ef"
                          strokeWidth="26"
                        />
                        <rect
                          x="70"
                          y="218"
                          width="270"
                          height="76"
                          rx="23"
                          fill="#d0dec4"
                        />
                        <rect
                          x="210"
                          y="108"
                          width="172"
                          height="55"
                          rx="12"
                          fill="#d7e3ca"
                        />
                        <rect
                          x="700"
                          y="205"
                          width="90"
                          height="101"
                          rx="15"
                          fill="#d7e3ca"
                        />
                      </svg>
                      <span className="map-label map-label-one">徐汇滨江</span>
                      <span className="map-label map-label-two">龙腾大道</span>
                      <span className="map-label map-label-three">
                        黄 浦 江
                      </span>
                      {shownPlaces.map((p, i) => (
                        <button
                          className={
                            'map-pin ' +
                            (activePlace === p.id ? 'selected' : '')
                          }
                          style={{ left: p.x + '%', top: p.y + '%' }}
                          onClick={() => setActivePlace(p.id)}
                          key={p.id}
                        >
                          <span>
                            {i === 1 ? (
                              <Coffee size={17} />
                            ) : (
                              <Trees size={17} />
                            )}
                          </span>
                          {p.name}
                        </button>
                      ))}
                      <span className="map-demo-label">
                        示意地图 · 不用于实际导航
                      </span>
                    </div>
                    <div className="row-between section-label">
                      <h3>附近好去处</h3>
                      <span>{shownPlaces.length} 个演示地点</span>
                    </div>
                    {shownPlaces.length ? (
                      shownPlaces.map((p, i) => (
                        <button
                          key={p.id}
                          className={
                            'place-card ' +
                            (p.id === activePlace ? 'selected' : '')
                          }
                          onClick={() => {
                            setActivePlace(p.id);
                            setModal('place');
                          }}
                        >
                          <div className="place-icon">
                            {i === 1 ? <Coffee /> : <Trees />}
                          </div>
                          <div>
                            <h3>
                              {p.name}
                              <span>★ {p.rating}</span>
                            </h3>
                            <p>
                              {p.area} · {p.distance}
                            </p>
                            <div className="tag-row">
                              {p.tags.map((x) => (
                                <span key={x}>{x}</span>
                              ))}
                            </div>
                          </div>
                          <ChevronRight size={18} />
                        </button>
                      ))
                    ) : (
                      <Empty>没有找到这个地点，试试搜索“草坪”或“咖啡”。</Empty>
                    )}
                  </>
                ) : (
                  <>
                    <div className="chips">
                      {['全部', '汪星人', '喵星人'].map((x) => (
                        <button
                          key={x}
                          className={petFilter === x ? 'selected' : ''}
                          onClick={() => setPetFilter(x)}
                        >
                          {x}
                        </button>
                      ))}
                    </div>
                    <div className="friends-grid">
                      {nearby.map((f) => (
                        <article key={f.id} className="friend-card">
                          <button onClick={() => friendProfile(f.id)}>
                            <Photo
                              src={f.pic}
                              alt={f.name}
                              className="friend-photo"
                            />
                          </button>
                          <div>
                            <div className="row-between">
                              <h3>
                                {f.name} <span>♂</span>
                              </h3>
                              <small>
                                <MapPin size={12} />
                                {f.distance}
                              </small>
                            </div>
                            <p>
                              {f.breed} · {f.age}
                            </p>
                            <span className="pet-tag">{f.tag}</span>
                            <div className="friend-actions">
                              <button
                                className="soft-button"
                                onClick={() => friendProfile(f.id)}
                              >
                                认识一下
                              </button>
                              <button
                                className="round-button"
                                aria-label={'与' + f.name + '聊天'}
                                onClick={() => startChat(f.id)}
                              >
                                <MessageCircle size={19} />
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                    {!nearby.length && (
                      <Empty>这里暂时没有符合条件的宠友。</Empty>
                    )}
                  </>
                )}
              </>
            )}
            {section === '消息' && (
              <div className="messages-surface">
                <div className="conversation-list">
                  <h3>
                    聊天 <span>演示会话</span>
                  </h3>
                  {friends.map((f) => (
                    <button
                      className={
                        'conversation ' +
                        (f.id === activeFriend ? 'selected' : '')
                      }
                      key={f.id}
                      onClick={() => setActiveFriend(f.id)}
                    >
                      <Photo src={f.pic} alt="" className="avatar" />
                      <div>
                        <strong>{f.name}的铲屎官</strong>
                        <p>
                          {data.messages[f.id]?.at(-1)?.text ||
                            '聊聊毛孩子的日常吧'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="chat-panel">
                  <div className="chat-header">
                    <button onClick={() => friendProfile(activeFriend)}>
                      <Photo src={friend.pic} alt="" className="avatar" />
                      <div>
                        <strong>{friend.name}的铲屎官</strong>
                        <small>演示宠友 · {friend.breed}</small>
                      </div>
                    </button>
                    <button className="soft-button" onClick={openInvite}>
                      <Footprints size={17} />
                      约遛
                    </button>
                  </div>
                  <div className="chat-body">
                    <p className="chat-demo">
                      本地模拟会话，消息不会发送给真实用户
                    </p>
                    {(data.messages[activeFriend] || []).map((m) => (
                      <div
                        className={'message ' + (m.mine ? 'mine' : '')}
                        key={m.id}
                      >
                        {!m.mine && (
                          <Photo src={friend.pic} alt="" className="avatar" />
                        )}
                        <p>{m.text}</p>
                      </div>
                    ))}
                    {data.invitations
                      .filter((i) => i.friend === activeFriend)
                      .map(renderInvitation)}
                    <div ref={chatBottom} />
                  </div>
                  <form
                    className="chat-composer"
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendChat();
                    }}
                  >
                    <input
                      aria-label="聊天内容"
                      placeholder="聊聊毛孩子的日常…"
                      value={chatText}
                      maxLength={1000}
                      onChange={(e) => setChatText(e.target.value)}
                    />
                    <button
                      className="primary"
                      type="submit"
                      disabled={!chatText.trim()}
                      aria-label="发送消息"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </div>
            )}
            {section === '我的' && (
              <>
                <section className="profile-hero">
                  <Photo
                    src={photos.corgi}
                    alt={data.pet.name}
                    className="profile-avatar"
                  />
                  <div>
                    <span className="eyebrow">MY BEST FRIEND</span>
                    <h2>
                      {data.pet.name} <span>♂</span>
                    </h2>
                    <p>
                      {data.pet.breed} · {data.pet.age} · {city}
                    </p>
                    <p>{data.pet.bio}</p>
                  </div>
                  <button
                    className="outline-button"
                    onClick={() => {
                      setEditPet(data.pet);
                      setModal('editPet');
                    }}
                  >
                    <Settings2 size={16} />
                    编辑档案
                  </button>
                </section>
                <section className="daily-card">
                  <div className="row-between">
                    <h3>今天，也好好陪伴了</h3>
                    <span>{data.checkins.length} 条日常记录</span>
                  </div>
                  <div className="checkin-grid">
                    {[
                      { icon: Footprints, label: '遛弯' },
                      { icon: Utensils, label: '喂食' },
                      { icon: Droplets, label: '洗澡' },
                      { icon: Heart, label: '陪玩' },
                    ].map(({ icon: Icon, label }) => (
                      <button key={label} onClick={() => checkin(label)}>
                        <Icon />
                        <span>{label}</span>
                        <Plus size={14} />
                      </button>
                    ))}
                  </div>
                </section>
                <TabBar
                  value={profileTab}
                  onChange={setProfileTab}
                  items={['我的日记', '我的动态', '我的收藏', '约遛记录']}
                />
                <div className="profile-content">
                  {profileTab === '我的日记' &&
                    (data.checkins.length ? (
                      <div className="timeline">
                        {data.checkins.map((c) => (
                          <div key={c.id}>
                            <span className="timeline-dot" />
                            <small>{c.time}</small>
                            <h3>
                              {data.pet.name}的{c.kind}日常
                            </h3>
                            <p>又收集了一份小小的快乐。</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Empty>点一下上面的打卡，留下今天的第一条记录。</Empty>
                    ))}
                  {profileTab === '我的动态' &&
                    (data.posts.some((p) => p.pet === 'me') ? (
                      <div className="post-grid">
                        {data.posts
                          .filter((p) => p.pet === 'me')
                          .map(renderPost)}
                      </div>
                    ) : (
                      <Empty>
                        分享一张照片，开始记录你们的故事。
                        <button
                          className="text-button"
                          onClick={() => setModal('publish')}
                        >
                          发布第一条动态
                        </button>
                      </Empty>
                    ))}
                  {profileTab === '我的收藏' && (
                    <>
                      <div className="post-grid">
                        {data.posts
                          .filter((p) => data.saved.includes(p.id))
                          .map(renderPost)}
                      </div>
                      {places
                        .filter((p) => data.placeSaved.includes(p.id))
                        .map((p) => (
                          <button
                            className="place-card"
                            key={p.id}
                            onClick={() => {
                              setActivePlace(p.id);
                              setModal('place');
                            }}
                          >
                            <MapPin />
                            <div>
                              <h3>{p.name}</h3>
                              <p>{p.area}</p>
                            </div>
                            <ChevronRight />
                          </button>
                        ))}
                      {!data.saved.length && !data.placeSaved.length && (
                        <Empty>喜欢的动态和地点，都可以收藏在这里。</Empty>
                      )}
                    </>
                  )}
                  {profileTab === '约遛记录' &&
                    (data.invitations.length ? (
                      data.invitations.map(renderInvitation)
                    ) : (
                      <Empty>去附近认识一位宠友，约好下一次散步。</Empty>
                    ))}
                </div>
              </>
            )}
          </main>
          <aside className="right-rail">
            <section className="rail-card pet-summary">
              <span className="eyebrow">MY LITTLE WORLD</span>
              <h3>
                {data.pet.name}的小日常
                <PawPrint size={19} />
              </h3>
              <button
                className="pet-hero"
                onClick={() => go('我的')}
                aria-label="查看宠物档案"
              >
                <Photo src={photos.corgi} alt={data.pet.name} />
              </button>
              <h4>
                {data.pet.name} <span>♂</span>
              </h4>
              <p>
                {data.pet.breed} · {data.pet.age} · 快乐小社牛
              </p>
              <div className="pet-stats">
                <div>
                  <strong>28</strong>
                  <small>陪伴天数</small>
                </div>
                <div>
                  <strong>{data.following.length}</strong>
                  <small>关注宠友</small>
                </div>
                <div>
                  <strong>{data.checkins.length}</strong>
                  <small>日常记录</small>
                </div>
              </div>
              <button
                className="soft-button"
                onClick={() => setModal('checkin')}
              >
                <Footprints size={17} />
                记录今天的小事
              </button>
            </section>
            <section className="rail-card">
              <h3>
                附近的新朋友
                <button
                  aria-label="查看全部附近宠友"
                  onClick={() => {
                    setNearTab('附近宠友');
                    go('附近');
                  }}
                >
                  <ArrowUpRight size={18} />
                </button>
              </h3>
              {friends.map((f) => (
                <div className="friend-row" key={f.id}>
                  <button
                    className="friend-avatar"
                    onClick={() => friendProfile(f.id)}
                  >
                    <Photo src={f.pic} alt={f.name} />
                  </button>
                  <button
                    className="friend-info"
                    onClick={() => friendProfile(f.id)}
                  >
                    <strong>{f.name}</strong>
                    <small>
                      {f.breed} · {f.tag}
                    </small>
                  </button>
                  <button
                    aria-label={
                      data.following.includes(f.id)
                        ? '取消关注' + f.name
                        : '关注' + f.name
                    }
                    className={data.following.includes(f.id) ? 'following' : ''}
                    onClick={() => toggle('following', f.id)}
                  >
                    {data.following.includes(f.id) ? (
                      <Check size={16} />
                    ) : (
                      <Plus size={16} />
                    )}
                  </button>
                </div>
              ))}
            </section>
            <section className="topic-card">
              <span>本周话题</span>
              <h3># 毛孩子的快乐很简单</h3>
              <p>晒晒那些让 TA 开心的小事</p>
              <button
                onClick={() => {
                  setDraftTopic('遛宠日常');
                  setModal('publish');
                }}
              >
                带上照片，一起聊聊 <ArrowUpRight size={15} />
              </button>
            </section>
            <div className="rail-footer">
              友好相遇，文明养宠。
              <br />
              <button onClick={() => setModal('about')}>关于演示</button> ·{' '}
              <button onClick={() => setModal('privacy')}>隐私说明</button>
              <br />
              去哪遛 © 2026 · 照片来自 Unsplash
            </div>
          </aside>
        </div>
      </div>
      <nav className="mobile-nav" aria-label="手机导航">
        {navItems.slice(0, 2).map(({ icon: Icon, label }) => (
          <button
            key={label}
            className={section === label ? 'active' : ''}
            onClick={() => go(label)}
          >
            <Icon size={21} />
            <span>{label}</span>
          </button>
        ))}
        <button
          className="mobile-publish"
          aria-label="发布日常"
          onClick={() => setModal('publish')}
        >
          <Plus size={25} />
        </button>
        {navItems.slice(2).map(({ icon: Icon, label }) => (
          <button
            key={label}
            className={section === label ? 'active' : ''}
            onClick={() => go(label)}
          >
            <Icon size={21} />
            <span>{label}</span>
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
          className={'app-dialog ' + (modal === 'post' ? 'post-dialog' : '')}
        >
          <DialogTitle>
            {{
              publish: '分享毛孩子的快乐',
              post: '宠友日常',
              friend: '认识一位新朋友',
              place: '宠物友好地点',
              invite: '约好下一次散步',
              checkin: '记录今天的小事',
              editPet: '编辑宠物档案',
              notifications: '你的消息',
              about: '关于这个 Demo',
              privacy: '隐私与演示说明',
              report: '反馈内容',
            }[modal] || '去哪遛'}
          </DialogTitle>
          <DialogDescription>
            {modal === 'publish'
              ? '平凡的小事，也值得被认真记录。'
              : modal === 'invite'
                ? '选择一处公共地点，和宠友一起出发。'
                : '去哪遛 · 宠物交友社区演示'}
          </DialogDescription>
          {modal === 'publish' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                publish();
              }}
              className="demo-form"
            >
              <div className="upload-zone">
                <Photo src={draftImage} alt="待发布照片" />
                <div>
                  <button
                    type="button"
                    className="outline-button"
                    onClick={() => fileInput.current?.click()}
                  >
                    <ImagePlus size={17} />
                    更换照片
                  </button>
                  <small>
                    JPG / PNG / WebP · 小于 1 MB
                    <br />
                    照片只保存在当前浏览器
                  </small>
                </div>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={(e) => upload(e.target.files?.[0])}
                />
              </div>
              <label>
                标题
                <input
                  required
                  maxLength={40}
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="给今天的快乐起个名字"
                />
              </label>
              <label>
                今天的故事
                <textarea
                  required
                  rows={4}
                  maxLength={1000}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="今天和毛孩子发生了什么？"
                />
              </label>
              <div className="row-between">
                <Picker
                  value={draftTopic}
                  onChange={setDraftTopic}
                  items={['遛宠日常', '友好探店', '喵星人的日常']}
                  label="选择话题"
                />
                <span className="meta">
                  <MapPin size={14} />
                  {city} · 公开演示
                </span>
              </div>
              <button className="primary" type="submit" disabled={!ready}>
                <Plus size={17} />
                发布日常
              </button>
            </form>
          )}
          {modal === 'post' && post && (
            <div className="post-detail">
              <Photo
                src={post.image}
                alt={post.title}
                className="detail-image"
              />
              <div>
                <div className="row-between">
                  <button
                    className="post-author"
                    onClick={() =>
                      post.pet === 'me'
                        ? (setModal(''), go('我的'))
                        : friendProfile(post.pet)
                    }
                  >
                    <Photo src={post.image} alt="" className="avatar" />
                    <strong>{post.author}的日常</strong>
                  </button>
                  {post.pet !== 'me' && (
                    <button
                      className="outline-button"
                      onClick={() => toggle('following', post.pet)}
                    >
                      {data.following.includes(post.pet) ? '已关注' : '+ 关注'}
                    </button>
                  )}
                </div>
                <h2>{post.title}</h2>
                <p className="detail-body">{post.body}</p>
                <span className="post-topic"># {post.topic}</span>
                <p className="meta">
                  {post.city} · {post.time}
                </p>
                <div className="detail-actions">
                  <button
                    className={data.liked.includes(post.id) ? 'liked' : ''}
                    onClick={() => toggle('liked', post.id)}
                  >
                    <Heart
                      size={20}
                      fill={
                        data.liked.includes(post.id) ? 'currentColor' : 'none'
                      }
                    />
                    {post.likes + (data.liked.includes(post.id) ? 1 : 0)}
                  </button>
                  <button
                    className={data.saved.includes(post.id) ? 'liked' : ''}
                    onClick={() => toggle('saved', post.id)}
                  >
                    <Bookmark
                      size={20}
                      fill={
                        data.saved.includes(post.id) ? 'currentColor' : 'none'
                      }
                    />
                    {data.saved.includes(post.id) ? '已收藏' : '收藏'}
                  </button>
                  <button onClick={() => setModal('report')}>
                    <Flag size={17} />
                    反馈
                  </button>
                </div>
                <div className="comments">
                  <h3>聊两句 · {(data.comments[post.id] || []).length}</h3>
                  {(data.comments[post.id] || []).map((c, i) => (
                    <p key={i}>
                      <strong>{data.pet.name}的铲屎官</strong>
                      {c}
                    </p>
                  ))}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!comment.trim()) return;
                      setData((d) => ({
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
                      aria-label="评论内容"
                      placeholder="留下一句友善的话…"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      maxLength={300}
                    />
                    <button
                      aria-label="发送评论"
                      type="submit"
                      disabled={!comment.trim()}
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
          {modal === 'friend' && (
            <div className="friend-detail">
              <Photo
                src={friend.pic}
                alt={friend.name}
                className="friend-cover"
              />
              <h2>
                {friend.name} <span>♂</span>
              </h2>
              <p>
                {friend.breed} · {friend.age} · 距离 {friend.distance}（演示）
              </p>
              <span className="pet-tag">{friend.tag}</span>
              <p className="friend-bio">{friend.desc}</p>
              <div className="friend-actions">
                <button
                  className="outline-button"
                  onClick={() => toggle('following', friend.id)}
                >
                  {data.following.includes(friend.id) ? (
                    <Check size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                  {data.following.includes(friend.id) ? '已关注' : '关注宠友'}
                </button>
                <button
                  className="primary"
                  onClick={() => startChat(friend.id)}
                >
                  <MessageCircle size={17} />
                  聊一聊
                </button>
                <button className="outline-button" onClick={openInvite}>
                  <Footprints size={16} />
                  约遛
                </button>
              </div>
            </div>
          )}
          {modal === 'place' && (
            <div className="place-detail">
              <div className="place-detail-icon">
                <Trees size={42} />
                <span>宠物友好 · 演示地点</span>
              </div>
              <h2>{place.name}</h2>
              <p className="meta">
                <MapPin size={15} />
                {place.area} · {place.distance}
              </p>
              <div className="tag-row">
                {place.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <p>{place.desc}</p>
              <div className="friend-actions">
                <button
                  className="outline-button"
                  onClick={() => toggle('placeSaved', place.id)}
                >
                  <Bookmark size={17} />
                  {data.placeSaved.includes(place.id) ? '已收藏' : '收藏地点'}
                </button>
                <button className="primary" onClick={openInvite}>
                  <Footprints size={17} />
                  约宠友来这里
                </button>
              </div>
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
                <span>邀请宠友</span>
                <Picker
                  value={friend.name}
                  onChange={(n) =>
                    setActiveFriend(friends.find((f) => f.name === n)!.id)
                  }
                  items={friends.map((f) => f.name)}
                  label="邀请宠友"
                />
              </div>
              <div className="form-field">
                <span>见面地点</span>
                <Picker
                  value={place.name}
                  onChange={(n) =>
                    setActivePlace(places.find((p) => p.name === n)!.id)
                  }
                  items={places.map((p) => p.name)}
                  label="见面地点"
                />
              </div>
              <label>
                约遛时间
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
                  maxLength={200}
                  value={inviteNote}
                  onChange={(e) => setInviteNote(e.target.value)}
                  placeholder="比如：我会带上飞盘和水，一起玩吧！"
                />
              </label>
              <p className="form-note">
                <ShieldCheck size={16} />
                邀请仅在此 Demo 内演示，不会通知真实用户。
              </p>
              <button type="submit" className="primary">
                发起约遛 <ArrowUpRight size={17} />
              </button>
            </form>
          )}
          {modal === 'checkin' && (
            <div>
              <div className="checkin-grid dialog-checkins">
                {[
                  { icon: Footprints, label: '遛弯' },
                  { icon: Utensils, label: '喂食' },
                  { icon: Droplets, label: '洗澡' },
                  { icon: Heart, label: '陪玩' },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    onClick={() => {
                      checkin(label);
                      setModal('');
                    }}
                  >
                    <Icon />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <button
                className="text-button"
                onClick={() => {
                  setModal('');
                  setProfileTab('我的日记');
                  go('我的');
                }}
              >
                查看日常记录 <ChevronRight size={15} />
              </button>
            </div>
          )}
          {modal === 'editPet' && (
            <form
              className="demo-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!editPet.name.trim()) return;
                setData((d) => ({
                  ...d,
                  pet: { ...editPet, name: editPet.name.trim() },
                }));
                setModal('');
                notify('宠物档案已更新');
              }}
            >
              <label>
                宠物昵称
                <input
                  required
                  maxLength={12}
                  value={editPet.name}
                  onChange={(e) =>
                    setEditPet({ ...editPet, name: e.target.value })
                  }
                />
              </label>
              <label>
                品种
                <input
                  required
                  maxLength={20}
                  value={editPet.breed}
                  onChange={(e) =>
                    setEditPet({ ...editPet, breed: e.target.value })
                  }
                />
              </label>
              <label>
                年龄
                <input
                  required
                  maxLength={12}
                  value={editPet.age}
                  onChange={(e) =>
                    setEditPet({ ...editPet, age: e.target.value })
                  }
                />
              </label>
              <label>
                一句话介绍
                <textarea
                  maxLength={80}
                  rows={3}
                  value={editPet.bio}
                  onChange={(e) =>
                    setEditPet({ ...editPet, bio: e.target.value })
                  }
                />
              </label>
              <button type="submit" className="primary">
                保存档案
              </button>
            </form>
          )}
          {modal === 'notifications' && (
            <div className="notification-list">
              <button onClick={() => startChat('doubao')}>
                <MessageCircle />
                <div>
                  <strong>豆包的铲屎官打了个招呼</strong>
                  <p>周末可以一起散步～</p>
                </div>
                <ChevronRight />
              </button>
              <button onClick={() => startChat('cookie')}>
                <PawPrint />
                <div>
                  <strong>曲奇想认识新朋友</strong>
                  <p>找到同款小短腿了！</p>
                </div>
                <ChevronRight />
              </button>
              <small>以上为预置演示通知</small>
            </div>
          )}
          {modal === 'about' && (
            <div className="about-copy">
              <p>
                这是「去哪遛」的 Web
                产品演示，可体验社区、附近宠友、图文发布、模拟聊天、约遛与宠物日记。
              </p>
              <p>
                人物、地点、天气、距离与初始数据均用于演示。你的修改保存在当前浏览器，刷新后仍可继续体验。
              </p>
              <p>
                照片来自
                Unsplash；正式产品可替换为用户内容。当前未接入真实地图、账号系统或即时通讯。
              </p>
            </div>
          )}
          {modal === 'privacy' && (
            <div className="about-copy">
              <p>
                此 Demo
                不请求定位、手机号或账号登录。动态、照片、评论和消息保存在当前设备浏览器的本地存储。
              </p>
              <p>
                演示照片从 Unsplash
                加载。上传的照片仅在本地使用，不会发送到服务器；清除网站数据会删除你的演示记录。
              </p>
              <p>真实产品需要另行接入账号权限、内容审核和消息服务。</p>
            </div>
          )}
          {modal === 'report' && (
            <div className="about-copy">
              <p>
                演示版暂未接入内容审核服务。正式产品将在这里提供举报原因、补充说明和处理进度。
              </p>
              <button className="primary" onClick={() => setModal('post')}>
                返回动态
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
