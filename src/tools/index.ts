import { remote, Cookie } from 'electron';

export function getPlatformCookies(partition: string): Promise<Cookie[]> {
  return remote.session.fromPartition(partition).cookies.get({});
}
