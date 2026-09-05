import type { Invitation, DemoState } from './demo-data';

export function invitationLabel(inv: Invitation, now: number): string {
  if (new Date(inv.date).getTime() <= now) {
    if (inv.status === '待回应') return '已过期';
    if (inv.status === '已接受') return '已到约定时间';
  }
  return inv.status;
}
export function isUpcomingInvitation(inv: Invitation, now: number): boolean {
  return (
    ['待回应', '已接受'].includes(inv.status) &&
    new Date(inv.date).getTime() > now
  );
}
export function careForDate(
  checkins: DemoState['checkins'],
  year: number,
  month: number,
  day?: number,
) {
  return checkins.filter((c) => {
    if (!Number.isFinite(c.recordedAt)) return false;
    const date = new Date(c.recordedAt!);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      (!day || date.getDate() === day)
    );
  });
}
