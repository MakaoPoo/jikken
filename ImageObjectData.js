class ImageObjectData {
  constructor(imageList) {
    this.width = 0;
    this.height = 0;
    this.object = {};
    this.objectNum = imageList.length;
    this.objectIndex = [];
    this.isAlpha = false;
    this.onloadFunc = function(){};

    for(let data of imageList) {
      this.loadImage(data.id, data.src, data.defColor);
    }
  }

  loadImage(id, src, defColor) {
    this.objectIndex.push(id);
    let imgCanvas;
    let img = new Image();
    img.src = src;
    let thisClass = this;
    img.onload = function() {
      let width = this.width;
      let height = this.height;

      if(thisClass.width == 0) {
        thisClass.width = width;
      }
      if(thisClass.height == 0) {
        thisClass.height = height;
      }
      //キャンバスの用意-----------------------------------------
      let imgCanvas = $('<canvas />')[0];
      imgCanvas.width = width;
      imgCanvas.height = height;

      let imgCtx = imgCanvas.getContext('2d');
      imgCtx.drawImage(this, 0, 0, width, height);

      let imgData = imgCtx.getImageData(0, 0, width, height);
      let pixelData = new Array();
      //ピクセル情報の格納-----------------------------------------
      for (let y=0; y<height; y++) {
        for (let x=0; x<width; x++) {
          let pix = (y*width + x) * 4;
          let color = imgData.data.slice(pix, pix+3);
          let vData = rgbToV(color);
          let alphaData = imgData.data[pix+3];
          if(alphaData > 0) {
            let data = {
              x: x,
              y: y,
              v: vData
            }
            if(alphaData < 255) {
              data.alpha = alphaData;
              thisClass.isAlpha = true;
            }
            pixelData.push(data);
          }
        }
      }
      thisClass.object[id] = {
        defColor: {r:defColor[0], g:defColor[1], b:defColor[2]},
        color: {r:defColor[0], g:defColor[1], b:defColor[2]},
        pixel: pixelData
      };

      if(Object.keys(thisClass.object).length == thisClass.objectNum) {
        thisClass.onloadFunc();
      }
    };//img.on('load')
  }//loadImage(id, src)

  getImage(option) {
    let imgCanvas = $('<canvas />')[0];
    let imgCtx = imgCanvas.getContext('2d');
    let imgData = imgCtx.createImageData(this.width, this.height);

    for(let id of this.objectIndex) {
      let object = this.object[id];
      let r = object.color.r;
      let g = object.color.g;
      let b = object.color.b;

      for(let i in object.pixel) {
        let pixelData = object.pixel[i];
        let pix = (pixelData.y*this.width + pixelData.x) * 4;
        let overray = overrayColor([r, g, b], pixelData.v);
        if(typeof pixelData.alpha == "undefined") {
          if(option != 'alpha') {
            imgData.data[pix + 0] = overray[0];
            imgData.data[pix + 1] = overray[1];
            imgData.data[pix + 2] = overray[2];
            imgData.data[pix + 3] = 255;
          }else {
            imgData.data[pix + 0] = 0;
            imgData.data[pix + 1] = 0;
            imgData.data[pix + 2] = 0;
            imgData.data[pix + 3] = 0;
          }
        }else if(option != 'opacity'){
          let alpha = pixelData.alpha;
          if(imgData.data[pix + 3] > 0) {
            let alphaLevel = alpha/255;

            let originR = imgData.data[pix + 0];
            let originG = imgData.data[pix + 1];
            let originB = imgData.data[pix + 2];
            let originA = imgData.data[pix + 3];

            imgData.data[pix + 0] = originR + overray[0] * alphaLevel;
            imgData.data[pix + 1] = originG + overray[1] * alphaLevel;
            imgData.data[pix + 2] = originB + overray[2] * alphaLevel;
            imgData.data[pix + 3] = originA + alpha;
          }else {
            let originR = imgData.data[pix + 0];
            let originG = imgData.data[pix + 1];
            let originB = imgData.data[pix + 2];
            let originA = imgData.data[pix + 3];

            imgData.data[pix + 0] = originR + overray[0];
            imgData.data[pix + 1] = originG + overray[1];
            imgData.data[pix + 2] = originB + overray[2];
            imgData.data[pix + 3] = originA + alpha;
          }
        }
      }
    }
    imgCtx.putImageData(imgData, 0, 0);

    return imgCanvas;
  }

  onload(func) {
    this.onloadFunc = func;
  }

  setColor(id, rgb) {
    if(typeof this.object[id] == "undefined") {
      return;
    }
    this.object[id].color.r = rgb[0];
    this.object[id].color.g = rgb[1];
    this.object[id].color.b = rgb[2];
  }
  setColorR(id, r) {
    this.object[id].color.r = r;
  }
  setColorG(id, g) {
    this.object[id].color.g = g;
  }
  setColorB(id, b) {
    this.object[id].color.b = b;
  }
  setDefaultColor(id) {
    if(typeof this.object[id] == "undefined") {
      return;
    }
    this.object[id].color.r = this.object[id].defColor.r;
    this.object[id].color.g = this.object[id].defColor.g;
    this.object[id].color.b = this.object[id].defColor.b;
  }

  getColor(id) {
    if(typeof this.object[id] == "undefined") {
      return;
    }
    let color = this.object[id].color;
    return {r: color.r, g: color.g, b: color.b};
  }
  getDefaultColor(id) {
    if(typeof this.object[id] == "undefined") {
      return;
    }
    let color = this.object[id].defColor;
    return {r: color.r, g: color.g, b: color.b};
  }

  draw(ctx, x, y, width=this.width, height=this.height) {
    if(width == 0) {
      return;
    }
    let imageOpacity = this.getImage('opacity');
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(imageOpacity, 0, 0, 128, 128, x, y, width, height);
    if(this.isAlpha) {
      let imageAlpha = this.getImage('alpha');
      ctx.globalCompositeOperation = "hard-light";
      ctx.drawImage(imageAlpha, 0, 0, 128, 128, x, y, width, height);
    }
  }
}

function hsvToRgb(hsv) {
  let h = hsv[0] % 360;
  let s = hsv[1] / 255;
  let v = hsv[2] / 255;

  let c = v * s;
  let Hp = h / 60;
  let x = c * (1 - Math.abs(Hp % 2 - 1));

  let r, g, b;
  if (0 <= Hp && Hp < 1) {[r,g,b]=[c,x,0]};
  if (1 <= Hp && Hp < 2) {[r,g,b]=[x,c,0]};
  if (2 <= Hp && Hp < 3) {[r,g,b]=[0,c,x]};
  if (3 <= Hp && Hp < 4) {[r,g,b]=[0,x,c]};
  if (4 <= Hp && Hp < 5) {[r,g,b]=[x,0,c]};
  if (5 <= Hp && Hp < 6) {[r,g,b]=[c,0,x]};

  let m = v - c;
  [r, g, b] = [r+m, g+m, b+m];

  r = Math.floor(r * 255);
  g = Math.floor(g * 255);
  b = Math.floor(b * 255);

  return [r ,g , b];
}

function rgbToHsv(rgb) {
  let r = rgb[0];
  let g = rgb[1];
  let b = rgb[2];

	let max = Math.max( r, g, b ) ;
	let min = Math.min( r, g, b ) ;
	let diff = max - min ;
	let h = 0 ;

  switch( min ) {
    case max:
    h = 0 ;
    break ;

    case r:
    h = (60 * ((b - g) / diff)) + 180 ;
    break ;

    case g:
    h = (60 * ((r - b) / diff)) + 300 ;
    break ;

    case b:
    h = (60 * ((g - r) / diff)) + 60 ;
    break ;
  }

  let s = (max == 0)? 0 : diff/max ;
	let v = max ;

  h = Math.floor(h) % 360;
  s = Math.floor(s * 255);
  v = Math.floor(v);

	return [h, s, v] ;
}

function rgbToV(rgb) {
  let r = rgb[0];
  let g = rgb[1];
  let b = rgb[2];

  let v = Math.max( r, g, b ) ;
  v = Math.floor(v);

  return v;
}

function overrayColor(color, v) {
  let overrayHSV = [0, 0, 0];
  let colorHSV = rgbToHsv(color);
  overrayHSV[0] = colorHSV[0];

  if(v < 123) {
    let vRange = colorHSV[2];
    let vLevel = v/122;
    overrayHSV[1] = colorHSV[1];
    overrayHSV[2] = vRange * vLevel;
  }else {
    let vRange = 255 - colorHSV[2];
    let vLevel = (v - 123)/122;

    overrayHSV[1] = colorHSV[1] * (1.0 - vLevel);
    overrayHSV[2] = colorHSV[2] + vRange * vLevel;
  }

  let overrayRGB = hsvToRgb(overrayHSV);
  return overrayRGB;
}
