import request from 'request';
import fs from 'fs';
import { getFileMd5, getPlatformCookies, stringifyCookies } from '@/tools';

interface ConfigData {
  taskId: string;
  uploadPms: {
    policy: string;
    signature: string;
    fileKey: string;
    md5: string;
  };
}

/**
 * 是否登录
 * @param partition
 */
export async function checkLoginStatus(partition: string): Promise<boolean> {
  const cookies = await getPlatformCookies(partition);
  const cookiesStr = stringifyCookies(cookies);
  const url = 'https://api.chuangkit.com/user/getUserInfo.do?_dataType=json';

  return new Promise((resolve) => {
    request.post(
      url,
      {
        headers: {
          cookie: cookiesStr,
        },
        form: {
          client_type: 0,
          _dataClientType: 0,
        },
      },
      (error, response, body) => {
        const data = JSON.parse(body);

        if (data.body.LoginTimeOut) {
          resolve(false);
        } else {
          resolve(true);
        }
      },
    );
  });
}

/**
 * 抠图
 * @param partition
 * @param filePath
 */
export async function kouTou(partition: string, filePath: string): Promise<string> {
  const cookies = await getPlatformCookies(partition);
  const cookiesStr = stringifyCookies(cookies);
  const data = await getConfig(cookiesStr, filePath);
  await uploadFile(filePath, data, cookiesStr);
  return await getUrl(data, cookiesStr);
}

/**
 * 获取抠图需要的配置
 * @param cookiesStr
 * @param filePath
 */
function getConfig(cookiesStr: string, filePath: string): Promise<ConfigData> {
  const url = 'https://api-v2.chuangkit.com/design/preUploadMattingImage.do';
  const md5 = getFileMd5(filePath);

  return new Promise((resolve) => {
    request.post(
      url,
      {
        headers: {
          cookie: cookiesStr,
        },
        form: {
          _dataType: 'json',
          type: '0',
          md5,
        },
      },
      (error, response, body) => {
        const data = JSON.parse(body);
        resolve(data.body.data);
      },
    );
  });
}

/**
 * 上传文件
 * @param filePath
 * @param data
 * @param cookiesStr
 */
function uploadFile(filePath: string, data: ConfigData, cookiesStr: string) {
  const url = 'https://pri-cdn-oss.chuangkit.com/';
  const buffer = fs.readFileSync(filePath);

  return new Promise((resolve) => {
    const req = request.post(
      url,
      {
        headers: {
          cookie: cookiesStr,
        },
      },
      () => {
        resolve(undefined);
      },
    );

    const form = req.form();

    form.append('key', data.uploadPms.fileKey);
    form.append('policy', data.uploadPms.policy);
    form.append('Signature', data.uploadPms.signature);
    form.append('OSSAccessKeyId', 'LTAI5tLA8R9gj4dHcVn23jMZ');
    form.append('Content-MD5', data.uploadPms.md5);
    form.append('file', buffer);
  });
}

/**
 * 文件上传完成之后获取文件的url
 * @param data
 * @param cookiesStr
 */
function getUrl(data: ConfigData, cookiesStr: string): Promise<string> {
  const url = 'https://api-v2.chuangkit.com/design/addImageCommonMattingTask.do';

  return new Promise((resolve) => {
    request.post(
      url,
      {
        form: {
          task_id: data.taskId,
          policy: data.uploadPms.policy,
          signature: data.uploadPms.signature,
        },
        headers: {
          cookie: cookiesStr,
        },
      },
      (error, response, body) => {
        const data = JSON.parse(body);
        resolve(data.body.data.imageUrl);
      },
    );
  });
}
