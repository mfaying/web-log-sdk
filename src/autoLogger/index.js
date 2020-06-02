import _ from 'lodash';
import axios from 'axios';

import bom from '../common/bom';
import eventUtil from '../common/eventUtil';
import getXPath from '../utils/getXPath';
import sliceText from '../utils/sliceText';
import defaultOption from './option';
import getEvent from '../common/getEvent';
import getBoundingClientRect from '../utils/getBoundingClientRect';
import appendStyle from '../utils/appendStyle';
import wlsCssText from '../wls-css-text';
import Heatmap from './utils/heatmap';
import { WLS_CLICK_SELECT, WLS_STYLE_ID, MODE, HEATMAP_CANVAS } from './constant';

const {
  doc,
  ref,
  title,
  loc,
  win,
} = bom;

class AutoLogger {
  constructor(option) {
    this.option = _.assign(this.defaultOption, option);
    this.mode = '';
    this._addMessageListener();
    this._init();
  }

  get defaultOption() {
    return defaultOption;
  }

  _addMessageListener = () => {
    eventUtil.on(win, 'message', (event) => {
      if(event.data){
        try {
          const data = JSON.parse(event.data);
          const { mode, status } = data;
          if (mode === MODE.CIRCLE_SELECT) {
            if (status === 'on') {
              this.mode = mode;
              this._autoHoverCollection();
              this._appendWLSStyle();
              this._removeHeatmapCanvas();
            } else if (status === 'off') {
              this.mode = '';
              this._autoHoverCollectionOff();
              this._removeWLSStyle();
            }
          } else if (mode === MODE.HEATMAP) {
            if (status === 'on') {
              this.mode = mode;
              this._autoHoverCollection();
              this._appendWLSStyle();
              this._fetchHeatmap().then((res) => {
                this._drawHeatmap(res.data.data);
              });
            } else if (status === 'off') {
              this.mode = '';
              this._autoHoverCollectionOff();
              this._removeWLSStyle();
              this._removeHeatmapCanvas();
            }
          }
        } catch (e) {
          console.log(e);
        }
      }
    })
  }

  _appendWLSStyle = () => {
    const wlsStyle = document.getElementById(WLS_STYLE_ID);
    if (!wlsStyle) {
      const cssText = wlsCssText;
      appendStyle(cssText);
    }
  }

  _removeWLSStyle = () => {
    const wlsStyle = document.getElementById(WLS_STYLE_ID);
    wlsStyle && wlsStyle.remove();
  }

  _removeHeatmapCanvas = () => {
    const heatmapCanvasList = document.getElementsByClassName(HEATMAP_CANVAS);
    for (let i = 0, len = heatmapCanvasList.length; i < len; i ++) {
      heatmapCanvasList[i].remove();
    }
  }

  _fetchHeatmap = () => {
    const { heatmapUrl } = this.option;
    return axios.post(heatmapUrl, {
      pageUrl: loc.href,
    });
  }

  _drawHeatmap = (data) => {
    data = data.data;
    this._removeHeatmapCanvas();
    const heatmap = new Heatmap(data);
    heatmap.draw();
  }

  _selectElement = (event, targetElement) => {
    const elems = doc.getElementsByClassName(WLS_CLICK_SELECT);
    for (let i = 0, len = elems.length; i < len; i ++) {
      elems[i].classList.remove(WLS_CLICK_SELECT);
    }
    eventUtil.stopDefault(event);
    targetElement.classList.add(WLS_CLICK_SELECT);
  }

  _postMessage = (logData) => {
    const { postMsgOpts } = this.option;
    postMsgOpts.forEach((opt) => {
      const { targetWindow, targetOrigin } = opt;
      targetWindow.postMessage({ logData: JSON.stringify(logData) }, targetOrigin);
    });
  }

  _autoHoverCollection = () => {
    eventUtil.on(doc.body, 'mouseenter', this._autoHoverHandle);
  }
  _autoHoverCollectionOff = () => {
    eventUtil.off(doc.body, 'mouseenter', this._autoHoverHandle);
  }

  _autoHoverHandle = (e) => {
    try {
      const { event, targetElement } = getEvent(e);
      const assignData = {
        et: 'mouseenter',
        ed: 'auto_hover',
      }
      const logData = this._getLogData(e, assignData);
      if (this.mode === MODE.CIRCLE_SELECT || this.mode === MODE.HEATMAP) {
        this._selectElement(event, targetElement);
        this._postMessage(logData);
      }
    } catch (err) {
      console.log(err);
    }
  }

  _autoClickCollection = () => {
    eventUtil.on(doc.body, 'click', this._autoClickHandle);
  }

  _autoClickHandle = (e) => {
    try {
      const { event, targetElement } = getEvent(e);
      const logData = this._getLogData(e);
      if (this.mode === MODE.CIRCLE_SELECT || this.mode === MODE.HEATMAP) {
        this._selectElement(event, targetElement);
        this._postMessage(logData);
      } else {
        this.log(logData);
      }
    } catch (err) {
      console.log(err);
    }
  }

  _getLogData = (e, assignData = {}) => {
    const { targetElement, event } = getEvent(e);
    const nodeName = targetElement.nodeName && targetElement.nodeName.toLocaleLowerCase() || '';
    const text = targetElement.innerText || targetElement.value;
    const xpath = getXPath(targetElement) || '';
    const rect = getBoundingClientRect(targetElement);
    const documentElement = document.documentElement || document.body.parentNode;
    const scrollX = (documentElement && typeof documentElement.scrollLeft == 'number' ? documentElement : document.body).scrollLeft;
    const scrollY = (documentElement && typeof documentElement.scrollTop == 'number' ? documentElement : document.body).scrollTop;
    const pageX = event.pageX || event.clientX + scrollX;
    const pageY = event.pageY || event.clientY + scrollY;

    const eventData = {
      // event type
      et: 'click',
      // event desc
      ed: 'auto_click',
      text: sliceText(text),
      nodeName,
      xpath,
      offsetX: ((pageX - rect.left - scrollX) / rect.width).toFixed(6),
      offsetY: ((pageY - rect.top - scrollY) / rect.height).toFixed(6),
      pageX,
      pageY,
      scrollX,
      scrollY,
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };

    const logData = this._buildLogData(_.assign(eventData, assignData));

    return logData;
  }

  _buildLogData = (eventData) => {
    const { optParams, platform, appID, sdk } = this.option;
    return {
      eventData: {
        ...eventData,
        rUrl: ref,
        docTitle: title,
        cUrl: loc.href,
        t: new Date().getTime(),
      },
      optParams,
      platform,
      appID,
      sdk,
    };
  }

  log = (data) => {
    const { debug, logUrl } = this.option;

    if (debug) {
      console.log(data);
    }

    logUrl && axios.post(logUrl, data);
  }

  _init() {
    try {
      if (this.option.autoClick) {
        this._autoClickCollection();
      }
    } catch (err) {
      console.log(err);
    }
  }

}

export default AutoLogger;