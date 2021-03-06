type WebViewPropList = {
  [propName: string]: WebViewProp;
};

const platformDataList: WebViewPropList = {
  chuangKeTie: {
    checkLoginUrl: 'https://api.chuangkit.com/user/getUserInfo.do',
    loginPage: 'https://www.chuangkit.com/',
    partition: 'persist:chuangKeTie',
    preload: __static + '\\preload\\chuangKeTie.js',
    homePage: 'https://www.chuangkit.com/designtools/designindex',
  },
};

export default platformDataList;
