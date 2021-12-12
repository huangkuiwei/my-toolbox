/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare const __static: string;

interface WebViewProp {
  checkLoginUrl: string;
  loginPage: string;
  partition: string;
  preload: string;
  homePage: string;
}
