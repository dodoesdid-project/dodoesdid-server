import * as dayjs from 'dayjs';

export function formatDateTime(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

export function getTimeAgo(dateTime: Date) {
  const date = dayjs(dateTime);
  const now = dayjs();
  const diffInSeconds = now.diff(date, 'second');
  const diffInMinutes = now.diff(date, 'minute');
  const diffInHours = now.diff(date, 'hour');
  const diffInDays = now.diff(date, 'day');

  switch (true) {
    case diffInSeconds < 60:
      return '방금 전';
    case diffInMinutes < 60:
      return `${diffInMinutes}분 전`;
    case diffInHours < 24:
      return `${diffInHours}시간 전`;
    default:
      return `${diffInDays}일 전`;
  }
}
