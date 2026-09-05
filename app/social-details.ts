import type { Post } from './demo-data';

// Existing seed posts have no consented GPS coordinates. Never present their
// demonstration distances as the user's or another owner's live position.
const seedDistances: Record<string, string> = {
  s8: '约 3 km',
  s9: '约 5 km',
  s7: '约 2 km',
  s1: '800 m',
  s2: '1.2 km',
  s3: '1.6 km',
  s4: '2.1 km',
  s5: '1.2 km',
  s6: '800 m',
};
export function postDistance(post: Pick<Post, 'id' | 'pet'>): string {
  return seedDistances[post.id]
    ? `距你 ${seedDistances[post.id]} · 示例`
    : post.pet === 'me'
      ? '我的日常 · 未共享位置'
      : '距离未知 · 未共享位置';
}

// Fixed seed ordering mixes public authors; user-authored posts retain their original order.
const seedOrder = ['s7', 's1', 's8', 's3', 's9', 's2', 's4', 's5', 's6'];
export function selectFeedPosts(
  posts: Post[],
  tab: string,
  buddies: readonly string[],
  saved: readonly string[],
): Post[] {
  const filtered = posts.filter((p) =>
    tab === '我的收藏'
      ? saved.includes(p.id)
      : tab === '我的日常'
        ? p.pet === 'me'
        : tab === '好友圈'
          ? p.pet === 'me' || buddies.includes(p.pet)
          : true,
  );
  if (tab !== '广场') return filtered;
  return filtered.sort(
    (a, b) => seedOrder.indexOf(a.id) - seedOrder.indexOf(b.id),
  );
}
