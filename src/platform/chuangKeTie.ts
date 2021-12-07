import { Cookie } from 'electron';
import request, { debug } from 'request';
import { getPlatformCookies } from '@/tools';
import fs from 'fs';

function stringifyCookies(cookies: Cookie[]): string {
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

export async function kouTou(
  partition: string,
  params: {
    [propName: string]: string;
  },
  filePath: string,
): Promise<any> {
  const cookies = await getPlatformCookies(partition);
  const cookiesStr = stringifyCookies(cookies);
  const url = 'https://api-v2.chuangkit.com/design/preUploadMattingImage.do';

  const data = await getConfig(url, cookiesStr, params);
  await uploadFile(filePath, data, cookiesStr);
  await getUrl(data, cookiesStr);
}

function getUrl(data: any, cookiesStr: string) {
  request.post(
    'https://api-v2.chuangkit.com/design/addImageCommonMattingTask.do',
    {
      form: {
        task_id: data.body.data.taskId,
        policy: data.body.data.uploadPms.policy,
        signature: data.body.data.uploadPms.signature,
      },
      headers: {
        cookie: cookiesStr,
      },
    },
    (error, response, body) => {
      console.log(body);
    },
  );
}

function uploadFile(filePath: string, data: any, cookiesStr: string) {
  const buffer = fs.readFileSync(filePath);
  const blob = new Blob([buffer]);

  const file = new File([blob], Date.now() + '', {
    type: 'image/png',
  });

  return new Promise((resolve) => {
    const req = request.post(
      'https://pri-cdn-oss.chuangkit.com/',
      {
        headers: {
          cookie: cookiesStr,
        },
      },
      (error, response, body) => {
        resolve(body);
      },
    );

    const form = req.form();
    form.append('key', data.body.data.uploadPms.fileKey);
    form.append('policy', data.body.data.uploadPms.policy);
    form.append('Signature', data.body.data.uploadPms.signature);
    form.append('OSSAccessKeyId', 'LTAI5tLA8R9gj4dHcVn23jMZ');
    form.append('Content-MD5', data.body.data.uploadPms.md5);
    form.append('file', buffer);
  });
}

function getConfig(
  url: string,
  cookiesStr: string,
  params: {
    [propName: string]: string;
  },
): Promise<any> {
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
          ...params,
        },
      },
      (error, response, body) => {
        const data = JSON.parse(body);
        resolve(data);
      },
    );
  });
}
