import getPlatform from '../../utils/getPlatform';

const platform = getPlatform();

export default {
  appID: '',
  // 是否自动收集点击事件
  autoClick: true,
  debug: false,
  logUrl: '',
  heatmapUrl: '',
  sdk: {
    // 类型
    type: 'js',
    // 版本
    version: SDK_VERSION,
  },
  // 平台参数
  platform,
  optParams: {},
  postMsgOpts: [],
};
