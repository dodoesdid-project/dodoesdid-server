import * as dayjs from 'dayjs';

export function formatDateTime(dateTime: Date): string {
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss');
}
