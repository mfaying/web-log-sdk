import getElmByXPath from '../../utils/getElmByXPath';
import getBoundingClientRect from '../../utils/getBoundingClientRect'

const HEATMAP_CANVAS = 'heatmap-canvas';

class Heatmap {
  constructor(data) {
    const values = [];
    data.forEach((item) => {
      const { xpath, value } = item;
      const elm = getElmByXPath(xpath);
      if (!elm) {
        return;
      }
      const { left, top, width, height } = getBoundingClientRect(elm);
      item.x = left + width / 2;
      item.y = top + height / 2;
      item.w = width / 2;
      item.h = height / 2;
      values.push(value);
    });

    this._data = data;
    this._min = Math.min(...values);
    this._max = Math.max(...values);

    const canvas = document.createElement('canvas');
    canvas.style = 'position:absolute;left:0;top:0;z-index:100000';
    canvas.width = this._width = document.body.clientWidth;
    canvas.height = this._height = document.body.clientHeight;
    canvas.classList.add(HEATMAP_CANVAS);
    document.body.appendChild(canvas);
    this._ctx = canvas.getContext('2d');
  }

  draw() {
    const data = this._data;

    data.forEach((item) => {
      this.drawPointTemplate(item);
    })

    this._colorize();
  }

  drawPointTemplate(point) {
    const min = this._min;
    const max = this._max;
    const ctx = this._ctx;

    const alpha = (point.value - min) / (max - min);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.ellipse(point.x, point.y, point.w, point.h, 0, 0, Math.PI*2);
    try {
      const gradient = ctx.createRadialGradient(point.x, point.y, point.w, point.x, point.y, point.w * 0.5);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = gradient;
    } catch (e) {
      ctx.fillStyle = 'rgba(0,0,0,1)';
    }
    ctx.fill();
  }

  getColorPaint() {
    const paletteCanvas = document.createElement('canvas');
    const paletteCtx = paletteCanvas.getContext('2d');
    const gradientConfig = {
      0.25: 'rgb(0,0,255)',
      0.55: 'rgb(0,255,0)',
      0.85: 'yellow',
      1.0: 'rgb(255,0,0)',
    }
    paletteCanvas.width = 256;
    paletteCanvas.height = 1;
    const gradient = paletteCtx.createLinearGradient(0, 0, 256, 1);
    for (const key in gradientConfig) {
      gradient.addColorStop(key, gradientConfig[key])
    }
    paletteCtx.fillStyle = gradient;
    paletteCtx.fillRect(0, 0, 256, 1)
    return paletteCtx.getImageData(0, 0, 256, 1).data;
  }

  _colorize() {
    const width = this._width;
    const height = this._height;
    const ctx = this._ctx;

    const palette = this.getColorPaint();
    const img = ctx.getImageData(0, 0, width, height)
    const imgData = img.data;
    for (let i = 3, len = imgData.length; i < len; i += 4) {
      const alpha = imgData[i];
      const offset = alpha * 4;
      if (!offset) {
        continue;
      }
      imgData[i - 3] = palette[offset];
      imgData[i - 2] = palette[offset + 1];
      imgData[i - 1] = palette[offset + 2];
    }
    ctx.putImageData(img, 0, 0, 0, 0, width, height)
  }
}

export default Heatmap;