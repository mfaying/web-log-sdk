import { WLS_STYLE_ID } from '../autoLogger/constant';

const appendStyle = (cssText) => {
  const style = document.createElement('style'),
    head = document.head || document.getElementsByTagName('head')[0];
  style.type = 'text/css';
  style.id = WLS_STYLE_ID;
  // IE
  if (style.styleSheet) {
    const setCssText = () => {
      try {
        style.styleSheet.cssText = cssText;
      } catch(e) {
        console.log(e);
      }
    }
    if (style.styleSheet.disabled) {
      setTimeout(setCssText, 10);
    } else {
      setCssText();
    }
  } else { // w3c
    const textNode = document.createTextNode(cssText);
    style.appendChild(textNode);
  }
  head.appendChild(style);
}

export default appendStyle;