const event = {
  on: (target, type, handler) => {
    if (target.addEventListener) {
      target.addEventListener(type, handler, true);
    } else {
      target.attachEvent(
        'on' + type,
        (event) => handler.call(target, event),
        false,
      );
    }
  },
  off: (target, type, handler) => {
    if (target.removeEventListener) {
      target.removeEventListener(type, handler, true);
    } else {
      target.detachEvent(
        'on' + type,
        (event) => handler.call(target, event),
        false
      );
    }
  },
  stopDefault: (e) => {
    if (typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (typeof e.returnValue === 'boolean') {
      e.returnValue = false;
    }
  },
  stopBubble: (e) => {
    if (typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    if (typeof e.cancelBubble === 'boolean') {
      e.cancelBubble = true;
    }
  },
};

export default event;

