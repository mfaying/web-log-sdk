import { ua } from '../common/bom';
import platform from 'platform';

const getPlatform = () => {
  const platformInfo = {};

  platformInfo.os = `${platform.os.family} ${platform.os.version}` || '';
  platformInfo.bn = platform.name || '';
  platformInfo.bv = platform.version || '';
  platformInfo.bl = platform.layout || '';
  platformInfo.bd = platform.description || '';

  const wechatInfo = ua.match(/MicroMessenger\/([\d\.]+)/i);
  const wechatNetType = ua.match(/NetType\/([\w\.]+)/i);
  if (wechatInfo) {
    platformInfo.mmv = wechatInfo[1] || '';
  }
  if (wechatNetType) {
    platformInfo.net = wechatNetType[1] || '';
  }

  return platformInfo;
}

export default getPlatform;