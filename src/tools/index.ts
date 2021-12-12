import { remote, Cookie } from 'electron';
import fs from 'fs';
import crypto from 'crypto';

/**
 * 获取cookies
 * @param partition
 */
export function getPlatformCookies(partition: string): Promise<Cookie[]> {
  return remote.session.fromPartition(partition).cookies.get({});
}

export async function clearWebviewCache(partition: string): Promise<void> {
  await remote.session.fromPartition(partition).clearCache();
  await remote.session.fromPartition(partition).clearStorageData();
}

/**
 * cookies格式转换
 * @param cookies
 */
export function stringifyCookies(cookies: Cookie[]): string {
  let cookiesStr = '';

  cookies.forEach((item) => {
    let cookieStr = '';

    Object.keys(item).forEach((key) => {
      if (key === 'name') {
        cookieStr += item[key] + '=';
      } else if (key === 'value') {
        cookieStr += item[key] + '; ';
      }
    });

    cookiesStr += cookieStr;
  });

  return cookiesStr;
}

/**
 * 获取文件md5
 * @param filePath
 */
export function getFileMd5(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('md5');
  hash.update(buffer);
  return hash.digest('hex');
}

/**
 * 下载图片
 * @param url
 */
export function autoDownloadPic(url: string): void {
  remote.getCurrentWebContents().downloadURL(url);
}
