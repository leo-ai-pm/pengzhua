export type Visibility = 'private' | 'friends';
export type Presence = {
  petId: string;
  placeId: string;
  startedAt: number;
  expiresAt: number;
  visibility: Visibility;
  endedAt?: number;
};
export type Walk = {
  id: string;
  petId: string;
  placeId: string;
  startedAt: number;
  expiresAt: number;
  visibility: Visibility;
  endedAt?: number;
  memory?: WalkMemory;
};
export type WalkMemory = {
  ownerMood: string;
  petMood: string;
  note: string;
  photo: string;
  metPetIds: string[];
};
export type Place = {
  id: string;
  name: string;
  area: string;
  distance: string;
  minutes: number;
  kind: '草地公园' | '河畔步道' | '友好店铺';
  desc: string;
  features: string[];
  caution: string;
  size: string;
  x: number;
  y: number;
  route: string;
  photo: 'park' | 'golden' | 'corgi';
  quiet: boolean;
  contributed?: boolean;
  photoUrl?: string;
  location?: [number, number];
  source?: 'amap';
  petGuide?: {
    district: string;
    badge: string;
    fee: string;
    entry: string;
    rules: string[];
    checkedAt: string;
    sources: { title: string; url: string; publishedAt?: string }[];
  };
};
export const walkPlaces: Place[] = [
  {
    id: 'p1',
    name: '望京宠友草坪',
    area: '朝阳望京 · 望京北路段',
    distance: '800 m',
    minutes: 12,
    kind: '草地公园',
    desc: '开阔的草地，旁边就是沿河步道。小短腿也能轻松走一圈。',
    features: ['开阔草地', '宠物饮水', '全程牵绳', '有遮阴'],
    caution: '草坪无围栏，靠近步道；请全程牵绳。',
    size: '小型 / 中大型犬',
    x: 47,
    y: 45,
    route: '从街区入口沿望京北路向南，进入河畔步道后抵达草坪入口。',
    photo: 'park',
    quiet: false,
  },
  {
    id: 'p2',
    name: '北小河慢行步道',
    area: '朝阳望京 · 沿河绿道',
    distance: '1.2 km',
    minutes: 18,
    kind: '河畔步道',
    desc: '沿河慢慢走，不赶时间。适合喜欢嗅闻、想轻松散步的毛孩子。',
    features: ['平整路面', '沿河步道', '全程牵绳', '适合慢走'],
    caution: '与跑步、自行车路线相邻，留意过往行人。',
    size: '小型 / 中大型犬',
    x: 69,
    y: 24,
    route: '从社区东侧出口前往北小河绿道，沿步行道抵达集合入口。',
    photo: 'golden',
    quiet: true,
  },
  {
    id: 'p3',
    name: '口袋花园',
    area: '望京街区 · 社区绿地',
    distance: '600 m',
    minutes: 9,
    kind: '草地公园',
    desc: '安静的小花园，树荫多，适合慢热宠物先熟悉周围环境。',
    features: ['树荫充足', '人流较少', '全程牵绳', '短途散步'],
    caution: '场地较小，建议错峰前往，不适合追逐奔跑。',
    size: '小型犬 / 慢热宠物',
    x: 28,
    y: 65,
    route: '沿街区步行道向西，到社区花园入口进入。',
    photo: 'corgi',
    quiet: true,
  },
  {
    id: 'p4',
    name: '爪爪咖啡·户外区',
    area: '望京北路 · 休息补给',
    distance: '1.6 km',
    minutes: 22,
    kind: '友好店铺',
    desc: '遛累了歇歇脚，毛孩子可以在户外座位旁一起休息。',
    features: ['户外座位', '宠物饮水', '全程牵绳', '休息补给'],
    caution: '仅户外区域允许携宠，实际开放规则需向店员确认。',
    size: '需能安静停留',
    x: 34,
    y: 23,
    route: '沿望京北路步行至街角户外座位区。',
    photo: 'corgi',
    quiet: false,
  },
  {
    id: 'p5',
    name: '河畔树荫小径',
    area: '北小河绿道 · 南段',
    distance: '2.1 km',
    minutes: 30,
    kind: '河畔步道',
    desc: '一段被树荫覆盖的小路，适合只想和毛孩子安安静静待一会儿的傍晚。',
    features: ['有遮阴', '人流较少', '全程牵绳', '长线散步'],
    caution: '部分路段照明较少，建议白天前往。',
    size: '喜欢安静的宠物',
    x: 66,
    y: 73,
    route: '从北小河主步道向南，进入树荫支线。',
    photo: 'park',
    quiet: true,
  },
];
export const petNetwork = [
  {
    id: 'tangyuan',
    name: '汤圆',
    breed: '金毛',
    age: '2 岁',
    photo: 'golden' as const,
    temper: '温和亲人',
    desc: '喜欢傍晚散步，先熟悉彼此的散步习惯，再一起出门。',
    relation: '广场认识的新朋友',
    placeId: '',
    remaining: 0,
    status: 'home',
    size: '中大型',
  },
  {
    id: 'zhima',
    name: '芝麻',
    breed: '狸花猫',
    age: '3 岁',
    photo: 'cat' as const,
    temper: '慢热好奇',
    desc: '喜欢安静地观察世界，出门时需要自己的空间。',
    relation: '广场认识的新朋友',
    placeId: '',
    remaining: 0,
    status: 'home',
    size: '小型',
  },
  {
    id: 'doubao',
    name: '豆包',
    breed: '金毛',
    age: '3 岁',
    photo: 'golden' as const,
    temper: '热情友善',
    desc: '喜欢捡球，也喜欢和小朋友一起玩。我们常在傍晚去北小河。',
    relation: '和芒果一起遛过 3 次',
    placeId: 'p1',
    remaining: 42,
    status: 'live',
    size: '中大型',
  },
  {
    id: 'cookie',
    name: '曲奇',
    breed: '柯基',
    age: '1 岁半',
    photo: 'park' as const,
    temper: '快乐小短腿',
    desc: '腿短也要探索世界！闻闻草地，就是曲奇最快乐的事。',
    relation: '和芒果一起遛过 2 次',
    placeId: 'p1',
    remaining: 28,
    status: 'live',
    size: '小型',
  },
  {
    id: 'niangao',
    name: '年糕',
    breed: '狸花猫',
    age: '2 岁',
    photo: 'cat' as const,
    temper: '慢热安静',
    desc: '更喜欢安静的陪伴。先在宠友圈认识，熟悉之后再见面。',
    relation: '芒果的邻居朋友',
    placeId: 'p3',
    remaining: 0,
    status: 'home',
    size: '小型',
  },
  {
    id: 'tudou',
    name: '土豆',
    breed: '柯基',
    age: '2 岁半',
    photo: 'corgi' as const,
    temper: '温柔好奇',
    desc: '散步以嗅闻为主，喜欢慢慢认识新朋友。',
    relation: '常来望京宠友草坪',
    placeId: 'p1',
    remaining: 36,
    status: 'live',
    size: '小型',
  },
];
export function seedPresences(now: number): Presence[] {
  return petNetwork
    .filter((p) => p.status === 'live')
    .map((p) => ({
      petId: p.id,
      placeId: p.placeId,
      startedAt: now - 12 * 60000,
      expiresAt: now + p.remaining * 60000,
      visibility: 'friends',
    }));
}
export function visiblePresences(
  presences: Presence[],
  friendIds: string[],
  now: number,
): Presence[] {
  return presences.filter(
    (p) =>
      friendIds.includes(p.petId) &&
      p.visibility === 'friends' &&
      !p.endedAt &&
      p.startedAt <= now &&
      p.expiresAt > now,
  );
}
export function activeWalk(walk: Walk | null, now: number): walk is Walk {
  return (
    !!walk && !walk.endedAt && walk.startedAt <= now && walk.expiresAt > now
  );
}
export function finishWalk(walk: Walk, now: number): Walk {
  return {
    ...walk,
    endedAt:
      walk.endedAt ?? Math.min(Math.max(now, walk.startedAt), walk.expiresAt),
    visibility: 'private',
  };
}
export function walkMinutes(walk: Walk, now: number): number {
  return Math.max(
    0,
    Math.floor(
      (Math.min(walk.endedAt ?? now, walk.expiresAt) - walk.startedAt) / 60000,
    ),
  );
}
export function filterPlaces(
  places: Place[],
  filter: string,
  query: string,
  saved: string[],
  live: Presence[],
): Place[] {
  const q = query.trim();
  return places.filter(
    (p) =>
      (!q || `${p.name}${p.area}${p.features.join('')}`.includes(q)) &&
      (filter === '全部' ||
        (filter === '好友在遛' && live.some((l) => l.placeId === p.id)) ||
        (filter === '安静一点' && p.quiet) ||
        (filter === '我的收藏' && saved.includes(p.id)) ||
        p.kind === filter),
  );
}
