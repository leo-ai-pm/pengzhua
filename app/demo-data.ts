export const photos = {
  corgi:
    'https://images.unsplash.com/photo-1764660308072-f5f7bb8fb546?auto=format&fit=crop&w=1000&q=85',
  golden:
    'https://images.unsplash.com/photo-1513549054-cb3611a004fe?auto=format&fit=crop&w=1000&q=85',
  cat: 'https://images.unsplash.com/photo-1604604908343-49bb051dc0ce?auto=format&fit=crop&w=1000&q=85',
  park: 'https://images.unsplash.com/photo-1761532566304-59904b60e8cc?auto=format&fit=crop&w=1000&q=85',
};
export const friends = [
  {
    id: 'doubao',
    name: '豆包',
    breed: '金毛',
    age: '3 岁',
    tag: '热情好客',
    distance: '800m',
    pic: photos.golden,
    desc: '每天的快乐是捡球和交朋友，欢迎一起在草地上奔跑！',
    type: '汪星人',
  },
  {
    id: 'cookie',
    name: '曲奇',
    breed: '柯基',
    age: '1 岁半',
    tag: '快乐小短腿',
    distance: '1.2km',
    pic: photos.park,
    desc: '腿短也挡不住探索世界，最喜欢周末去公园。',
    type: '汪星人',
  },
  {
    id: 'niangao',
    name: '年糕',
    breed: '狸花猫',
    age: '2 岁',
    tag: '慢热乖巧',
    distance: '2.3km',
    pic: photos.cat,
    desc: '窗边晒太阳选手，想认识附近一起交流养猫日常的朋友。',
    type: '喵星人',
  },
];
export const places = [
  {
    id: 'p1',
    name: '望京宠友草坪',
    area: '朝阳望京 · 公共绿地',
    distance: '800m',
    rating: '4.9',
    tags: ['开阔草地', '需牵绳', '饮水点'],
    desc: '沿河步道和开阔草坪，适合傍晚散步。此为演示地点，设施与开放状态不代表真实情况。',
    x: 32,
    y: 43,
  },
  {
    id: 'p2',
    name: '爪爪咖啡',
    area: '望京北路 · 宠物友好店',
    distance: '1.6km',
    rating: '4.8',
    tags: ['室外座位', '宠物饮水', '需牵绳'],
    desc: '坐在户外喝一杯咖啡，让毛孩子也歇歇脚。此为虚构演示商家。',
    x: 68,
    y: 28,
  },
  {
    id: 'p3',
    name: '口袋花园',
    area: '望京街区 · 社区公园',
    distance: '2.1km',
    rating: '4.7',
    tags: ['遮阴步道', '安静休息', '需牵绳'],
    desc: '一条适合短距离散步的小径。此为演示地点，不提供实际导航。',
    x: 64,
    y: 72,
  },
];
export type Post = {
  id: string;
  title: string;
  body: string;
  image: string;
  author: string;
  pet: string;
  topic: string;
  category: string;
  likes: number;
  city: string;
  time: string;
};
export const seedPosts: Post[] = [
  {
    id: 's1',
    title: '今日份快乐，草地管够！',
    body: '没有什么烦恼是一次草地打滚解决不了的。豆包今天又交到了两个新朋友，你家毛孩子周末都去哪里玩？',
    image: photos.golden,
    author: '豆包',
    pet: 'doubao',
    topic: '遛宠日常',
    category: '汪星人',
    likes: 128,
    city: '北京',
    time: '20 分钟前',
  },
  {
    id: 's2',
    title: '小猫的周末，是晒太阳',
    body: '在家也有自己的小小宇宙。阳光刚刚好，年糕又睡成了一团。',
    image: photos.cat,
    author: '年糕',
    pet: 'niangao',
    topic: '喵星人的日常',
    category: '喵星人',
    likes: 96,
    city: '北京',
    time: '1 小时前',
  },
  {
    id: 's3',
    title: '腿虽短，快乐可一点不少',
    body: '曲奇的散步计划：闻一闻花，看看路人，然后等一个愿意一起玩的朋友。',
    image: photos.corgi,
    author: '曲奇',
    pet: 'cookie',
    topic: '遛宠日常',
    category: '汪星人',
    likes: 72,
    city: '北京',
    time: '2 小时前',
  },
  {
    id: 's4',
    title: '把周末留给草地和好朋友',
    body: '收藏这片小小的绿色。给毛孩子带上水，记得牵好绳子，把每一次出门变成小旅行。',
    image: photos.park,
    author: '曲奇',
    pet: 'cookie',
    topic: '友好探店',
    category: '汪星人',
    likes: 205,
    city: '北京',
    time: '3 小时前',
  },
  {
    id: 's5',
    title: '认真等饭，是小猫的必修课',
    body: '干饭前的眼神，永远这么专注。你家小猫最喜欢吃什么？',
    image: photos.cat,
    author: '年糕',
    pet: 'niangao',
    topic: '喵星人的日常',
    category: '喵星人',
    likes: 63,
    city: '北京',
    time: '昨天',
  },
  {
    id: 's6',
    title: '认识一只毛孩子，也认识一个朋友',
    body: '从互相闻闻到一起散步，友情有时候就是这么简单。期待下一次出门！',
    image: photos.golden,
    author: '豆包',
    pet: 'doubao',
    topic: '遛宠日常',
    category: '汪星人',
    likes: 89,
    city: '北京',
    time: '昨天',
  },
];
export type ChatMessage = { id: string; text: string; mine: boolean };
export type Invitation = {
  inviterName?: string;
  sourcePostId?: string;
  id: string;
  friend: string;
  place: string;
  date: string;
  note: string;
  status: '待回应' | '已接受' | '已拒绝' | '已取消';
};
export type DemoState = {
  posts: Post[];
  liked: string[];
  saved: string[];
  following: string[];
  comments: Record<string, string[]>;
  messages: Record<string, ChatMessage[]>;
  invitations: Invitation[];
  checkins: { id: string; kind: string; time: string }[];
  pet: { name: string; breed: string; age: string; bio: string };
  placeSaved: string[];
};
export function initialState(): DemoState {
  return {
    posts: seedPosts,
    liked: [],
    saved: [],
    following: [],
    comments: {},
    messages: {
      doubao: [
        {
          id: 'hi1',
          text: '你好呀！芒果也喜欢去草坪玩吗？周末可以一起散步～',
          mine: false,
        },
      ],
      cookie: [
        { id: 'hi2', text: '找到同款小短腿了，很高兴认识你们！', mine: false },
      ],
    },
    invitations: [],
    checkins: [],
    pet: {
      name: '芒果',
      breed: '柯基',
      age: '2 岁',
      bio: '快乐小社牛，最喜欢出门交朋友。',
    },
    placeSaved: [],
  };
}
export function toggleItem(items: string[], id: string) {
  return items.includes(id) ? items.filter((x) => x !== id) : [...items, id];
}
export function filterPosts(
  state: DemoState,
  tab: string,
  category: string,
  query: string,
  city: string,
) {
  return state.posts.filter(
    (p) =>
      (tab !== '关注' || state.following.includes(p.pet) || p.pet === 'me') &&
      (tab !== '同城' || p.city === city) &&
      (category === '全部' ||
        p.category === category ||
        p.topic === category) &&
      (!query.trim() ||
        `${p.title} ${p.body} ${p.author} ${p.topic}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())),
  );
}
