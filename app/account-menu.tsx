'use client';
/* eslint-disable next/no-img-element -- Reuses the existing pet photos. */
import { useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Bookmark,
  CalendarDays,
  ChevronRight,
  Clock3,
  EyeOff,
  Info,
  MapPin,
  PawPrint,
  Settings2,
  ScanLine,
  QrCode,
  Footprints,
  ShieldCheck,
  UsersRound,
  X,
} from 'lucide-react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { photos, type DemoState } from './demo-data';
import type { Place, Walk } from './walk-model';
import { DeviceStatusBar } from './device-preview';
import { PetScanner, PetCodeCard } from './pet-scanner';

type Props = {
  pet: DemoState['pet'];
  friends: number;
  walks: number;
  places: Place[];
  posts: DemoState['posts'];
  walk: Walk | null;
  duration: string;
  onDuration: (value: string) => void;
  onSharing: (value: boolean) => void;
  onNavigate: (section: string) => void;
  onEdit: () => void;
  onPlace: (id: string) => void;
  onPost: (id: string) => void;
  onPet: (id: string) => void;
  plans: {
    id: string;
    place: string;
    date: string;
    friend: string;
    status: string;
  }[];
  onInvitation: (id: string) => void;
};
function MenuRow({
  icon,
  title,
  detail,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  detail?: string;
  onClick: () => void;
}) {
  return (
    <button className="account-menu-row" onClick={onClick}>
      <span className="account-row-icon">{icon}</span>
      <span>
        <strong>{title}</strong>
        {detail && <small>{detail}</small>}
      </span>
      <ChevronRight size={18} />
    </button>
  );
}
export default function AccountMenu(props: Props) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('menu');
  const [privacyBack, setPrivacyBack] = useState('menu');
  const [collection, setCollection] = useState('地点');
  function leave(action: () => void) {
    setOpen(false);
    action();
  }
  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value) setView('menu');
      }}
    >
      <SheetTrigger
        className="account-trigger"
        aria-label="打开个人中心"
        title="个人中心"
      >
        <img src={photos.corgi} alt="" className="avatar small" />
      </SheetTrigger>
      <SheetContent
        className={'account-sheet account-view-' + view}
        showCloseButton={false}
      >
        <DeviceStatusBar />
        <header className="account-sheet-header">
          {view === 'menu' ? (
            <SheetClose
              className="account-icon-button"
              aria-label="关闭个人中心"
            >
              <ArrowLeft size={21} />
            </SheetClose>
          ) : (
            <button
              className="account-icon-button"
              aria-label={
                view === 'privacy' && privacyBack === 'settings'
                  ? '返回设置'
                  : '返回个人中心'
              }
              onClick={() => setView(view === 'privacy' ? privacyBack : 'menu')}
            >
              <ArrowLeft size={21} />
            </button>
          )}
          <SheetTitle>
            {
              (
                {
                  menu: '我的',
                  scan: '扫一扫',
                  mycode: '我的碰爪码',
                  plans: '我的约遛',
                  settings: '设置',
                  collections: '我的收藏',
                  privacy: '隐私与社交',
                  about: '关于碰爪',
                } as Record<string, string>
              )[view]
            }
          </SheetTitle>
          {view === 'menu' ? (
            <button
              className="account-icon-button"
              aria-label="打开设置"
              onClick={() => setView('settings')}
            >
              <Settings2 size={21} />
            </button>
          ) : (
            <SheetClose
              className="account-icon-button"
              aria-label="关闭个人中心"
            >
              <X size={21} />
            </SheetClose>
          )}
        </header>
        <SheetDescription className="sr-only">
          宠物档案、收藏与个人设置
        </SheetDescription>
        <div className="account-sheet-body">
          {view === 'menu' && (
            <>
              <button
                className="account-profile"
                onClick={() => leave(props.onEdit)}
                aria-label="编辑宠物档案"
              >
                <img src={photos.corgi} alt="" />
                <span className="account-profile-copy">
                  <small>和毛孩子，一起认识世界</small>
                  <strong>
                    {props.pet.name}
                    <span>的主人</span>
                  </strong>
                  <span>
                    {props.pet.breed} · {props.pet.age} · 查看宠物档案
                  </span>
                </span>
                <ChevronRight size={18} />
              </button>
              <div className="account-stats">
                <button
                  onClick={() => leave(() => props.onNavigate('宠物好友'))}
                >
                  <strong>{props.friends}</strong>
                  <span>宠物好友</span>
                </button>
                <button
                  onClick={() => leave(() => props.onNavigate('陪伴日历'))}
                >
                  <strong>{props.walks}</strong>
                  <span>一起出门</span>
                </button>
                <button
                  onClick={() => {
                    setCollection('地点');
                    setView('collections');
                  }}
                >
                  <strong>{props.places.length + props.posts.length}</strong>
                  <span>我的收藏</span>
                </button>
              </div>
              <div className="account-meet-tools">
                <button
                  className="account-scan-entry"
                  onClick={() => setView('scan')}
                >
                  <ScanLine size={30} />
                  <strong>扫一扫</strong>
                  <span>
                    见面了，碰个爪 <ChevronRight size={14} />
                  </span>
                </button>
                <button
                  className="account-code-entry"
                  onClick={() => setView('mycode')}
                >
                  <QrCode size={30} />
                  <strong>我的碰爪码</strong>
                  <span>
                    让新朋友认识它 <ChevronRight size={14} />
                  </span>
                </button>
              </div>
              <div className="account-section-heading">
                <h3>我的出门生活</h3>
                <Footprints size={18} />
              </div>
              <div className="account-menu-group">
                <MenuRow
                  icon={<UsersRound size={21} />}
                  title="我的约遛"
                  detail={
                    props.plans.length
                      ? `${props.plans.length} 个接下来的约定`
                      : '和宠物朋友，约好下一次'
                  }
                  onClick={() => setView('plans')}
                />
                <MenuRow
                  icon={<Bookmark size={21} />}
                  title="我的收藏"
                  detail="想去的地点，喜欢的日常"
                  onClick={() => {
                    setCollection('地点');
                    setView('collections');
                  }}
                />
                <MenuRow
                  icon={<CalendarDays size={21} />}
                  title="陪伴日历"
                  detail="记住每一次一起出门"
                  onClick={() => leave(() => props.onNavigate('陪伴日历'))}
                />
              </div>
              <div className="account-utility-links">
                <button
                  onClick={() => {
                    setPrivacyBack('menu');
                    setView('privacy');
                  }}
                >
                  <ShieldCheck size={18} />
                  隐私与权限
                </button>
                <button onClick={() => setView('about')}>
                  <Info size={18} />
                  关于碰爪
                </button>
              </div>
              <p className="account-footer-note">碰个爪，下次一起走。</p>
            </>
          )}
          {view === 'scan' && (
            <PetScanner
              onRecognized={(id) => leave(() => props.onPet(id))}
              onMyCode={() => setView('mycode')}
            />
          )}
          {view === 'mycode' && (
            <PetCodeCard name={props.pet.name} breed={props.pet.breed} />
          )}
          {view === 'plans' &&
            (props.plans.length ? (
              <div className="account-plans">
                {props.plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => leave(() => props.onInvitation(plan.id))}
                  >
                    <span className="account-plan-status">{plan.status}</span>
                    <h3>{plan.place}</h3>
                    <p>
                      {plan.friend} ·{' '}
                      {new Date(plan.date).toLocaleString('zh-CN', {
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <span>
                      查看约遛详情 <ChevronRight size={16} />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="account-empty">
                <UsersRound size={34} />
                <h3>一起走走，从一个约定开始</h3>
                <p>和好友约好时间、地点，下一次出门就有伴了。</p>
                <button
                  onClick={() => leave(() => props.onNavigate('宠物好友'))}
                >
                  看看宠物好友 <ChevronRight size={16} />
                </button>
              </div>
            ))}
          {view === 'settings' && (
            <>
              <p className="account-section-label">遛弯偏好</p>
              <div className="account-setting-card">
                <div className="account-setting-title">
                  <Clock3 size={21} />
                  <label id="default-walk-label" htmlFor="default-walk-select">
                    默认遛弯时长
                  </label>
                </div>
                <p>每次出发时会选用这个时长，也可以临时调整。</p>
                <Select
                  value={props.duration}
                  onValueChange={(value) => value && props.onDuration(value)}
                >
                  <SelectTrigger
                    id="default-walk-select"
                    aria-labelledby="default-walk-label"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['30 分钟', '60 分钟', '90 分钟'].map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="account-section-label">隐私与社交</p>
              <div className="account-menu-group">
                <MenuRow
                  icon={<ShieldCheck size={21} />}
                  title="地点共享与联系权限"
                  detail={
                    props.walk?.visibility === 'friends'
                      ? '本次地点对好友可见'
                      : '当前未共享地点'
                  }
                  onClick={() => {
                    setPrivacyBack('settings');
                    setView('privacy');
                  }}
                />
              </div>
              <p className="account-local-note">
                设置保存在当前浏览器，刷新后仍会保留。
              </p>
            </>
          )}
          {view === 'privacy' && (
            <>
              <div className="account-setting-card">
                <div className="account-setting-title">
                  <EyeOff size={21} />
                  <h3>本次遛弯地点</h3>
                </div>
                {props.walk ? (
                  <>
                    <div className="account-sharing-row">
                      <div>
                        <strong>
                          {props.walk.visibility === 'friends'
                            ? '对宠物好友可见'
                            : '隐身遛弯中'}
                        </strong>
                        <p>只分享所在公共地点。</p>
                      </div>
                      <Switch
                        aria-label="个人中心本次地点对好友可见"
                        checked={props.walk.visibility === 'friends'}
                        onCheckedChange={props.onSharing}
                      />
                    </div>
                    <p>关闭后立即隐身。本次遛弯结束或到期也会自动关闭。</p>
                  </>
                ) : (
                  <p>
                    还没有开始遛弯，当前没有共享地点。每次出发默认隐身，由你决定是否对好友可见。
                  </p>
                )}
              </div>
              <div className="account-setting-card">
                <div className="account-setting-title">
                  <UsersRound size={21} />
                  <h3>先成为好友，再联系</h3>
                </div>
                <p>
                  陌生人只能发起好友申请。双方同意后，才可以聊天和邀请一起遛弯。
                </p>
                <span className="account-rule-label">
                  <ShieldCheck size={15} />
                  始终开启
                </span>
              </div>
              <p className="account-local-note">
                演示版仅模拟好友可见状态，暂未向其他设备同步位置。
              </p>
            </>
          )}
          {view === 'collections' && (
            <>
              <Tabs value={collection} onValueChange={setCollection}>
                <TabsList className="account-collection-tabs">
                  <TabsTrigger value="地点">
                    地点 {props.places.length}
                  </TabsTrigger>
                  <TabsTrigger value="帖子">
                    帖子 {props.posts.length}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              {collection === '地点' ? (
                props.places.length ? (
                  <div className="account-menu-group">
                    {props.places.map((place) => (
                      <MenuRow
                        key={place.id}
                        icon={<MapPin size={21} />}
                        title={place.name}
                        detail={place.area}
                        onClick={() => leave(() => props.onPlace(place.id))}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="account-empty">
                    <Bookmark size={32} />
                    <h3>把想去的地方先收好</h3>
                    <p>在地点详情点收藏，就能在这里找到。</p>
                    <button
                      onClick={() => leave(() => props.onNavigate('遛宠地图'))}
                    >
                      去发现地点 <ChevronRight size={16} />
                    </button>
                  </div>
                )
              ) : props.posts.length ? (
                <div className="account-menu-group">
                  {props.posts.map((post) => (
                    <MenuRow
                      key={post.id}
                      icon={<PawPrint size={21} />}
                      title={post.title}
                      detail={`${post.author}的日常`}
                      onClick={() => leave(() => props.onPost(post.id))}
                    />
                  ))}
                </div>
              ) : (
                <div className="account-empty">
                  <PawPrint size={32} />
                  <h3>还没有收藏的帖子</h3>
                  <p>把喜欢的出门日常留在这里。</p>
                  <button
                    onClick={() => leave(() => props.onNavigate('宠友圈'))}
                  >
                    去宠友圈看看 <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
          {view === 'about' && (
            <div className="account-about">
              <span className="account-brand-mark">
                <PawPrint size={32} />
              </span>
              <h2>碰爪</h2>
              <p>从一起出门，到成为朋友。</p>
              <div className="account-setting-card">
                <h3>围绕毛孩子的相遇</h3>
                <p>发现北京宠物友好地点，认识宠物伙伴，记录每一次陪伴。</p>
              </div>
              <div className="account-setting-card">
                <h3>当前为 Web 演示版</h3>
                <p>
                  地图由高德提供。好友申请、聊天、邀约与地点共享在本浏览器模拟；宠物资料、收藏和设置保存在本机，尚未接入真实账号。
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="account-home-indicator" aria-hidden="true" />
      </SheetContent>
    </Sheet>
  );
}
