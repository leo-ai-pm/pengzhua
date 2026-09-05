import type { Post } from './demo-data';

// Existing seed posts have no consented GPS coordinates. Never present their
// demonstration distances as the user's or another owner's live position.
const seedDistances: Record<string, string> = {
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
