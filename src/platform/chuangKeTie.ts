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

export class ChuangKeTie {
  getConfigApi = 'https://api-v2.chuangkit.com/design/preUploadMattingImage.do';
  uploadFileApi = 'https://pri-cdn-oss.chuangkit.com';
  getUrlApi = 'https://api-v2.chuangkit.com/design/addImageCommonMattingTask.do';
  cookiesStr!: string;
  configData!: ConfigData;

  constructor(public partition: string, public filePath: string | string[]) {}

  /**
   * 抠图
   */
  async kouTou(): Promise<string[]> {
    const cookies = await getPlatformCookies(this.partition);
    this.cookiesStr = stringifyCookies(cookies);

    if (typeof this.filePath === 'string') {
      const imgUrl = 'https:' + (await this.handleFile(this.filePath));
      return [imgUrl];
    } else {
      const imgUrlList = [];

      for (const item of this.filePath) {
        imgUrlList.push('https:' + (await this.handleFile(item)));
      }

      return imgUrlList;
    }
  }

  async handleFile(filePath: string): Promise<string> {
    await this.getConfig(filePath);
    await this.uploadFile(filePath);
    return await this.getUrl();
  }

  /**
   * 获取抠图需要的配置
   */
  getConfig(filePath: string): Promise<undefined> {
    const md5 = getFileMd5(filePath);

    return new Promise((resolve) => {
      request.post(
        this.getConfigApi,
        {
          headers: {
            cookie: this.cookiesStr,
          },
          form: {
            _dataType: 'json',
            type: '0',
            md5,
          },
        },
        (error, response, body) => {
          const data = JSON.parse(body);
          console.log(data);
          this.configData = data.body.data;
          resolve(undefined);
        },
      );
    });
  }

  /**
   * 上传文件
   */
  uploadFile(filePath: string): Promise<undefined> {
    const buffer = fs.readFileSync(filePath);

    return new Promise((resolve) => {
      const req = request.post(
        this.uploadFileApi,
        {
          headers: {
            cookie: this.cookiesStr,
          },
        },
        () => {
          resolve(undefined);
        },
      );

      const form = req.form();

      form.append('key', this.configData.uploadPms.fileKey);
      form.append('policy', this.configData.uploadPms.policy);
      form.append('Signature', this.configData.uploadPms.signature);
      form.append('OSSAccessKeyId', 'LTAI5tLA8R9gj4dHcVn23jMZ');
      form.append('Content-MD5', this.configData.uploadPms.md5);
      form.append('file', buffer);
    });
  }

  /**
   * 文件上传完成之后获取文件的url
   */
  getUrl(): Promise<string> {
    return new Promise((resolve) => {
      request.post(
        this.getUrlApi,
        {
          form: {
            task_id: this.configData.taskId,
            policy: this.configData.uploadPms.policy,
            signature: this.configData.uploadPms.signature,
          },
          headers: {
            cookie: this.cookiesStr,
          },
        },
        (error, response, body) => {
          const data = JSON.parse(body);
          resolve(data.body.data.imageUrl);
        },
      );
    });
  }
}

export class CheckLoginStatus {
  checkLoginStatusApi = 'https://api.chuangkit.com/user/getUserInfo.do?_dataType=json';
  cookiesStr!: string;

  constructor(public partition: string) {}

  /**
   * 是否登录
   */
  async check(): Promise<boolean> {
    const cookies = await getPlatformCookies(this.partition);
    this.cookiesStr = stringifyCookies(cookies);

    return new Promise((resolve) => {
      request.post(
        this.checkLoginStatusApi,
        {
          headers: {
            cookie: this.cookiesStr,
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
}
