import axios from 'axios';

export function checkLoginStatus(): Promise<boolean> {
  const url = 'https://api.chuangkit.com/user/getUserInfo.do';

  return axios
    .post(
      url,
      {
        client_type: 0,
        _dataClientType: 0,
      },
      {
        params: {
          _dataType: 'json',
        },
      },
    )
    .then((res) => {
      return !res.data.body.LoginTimeOut;
    });
}
