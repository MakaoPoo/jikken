let canvas;
let ctx;
let imgCanvas = [];
let pixelDataList = [];

$(function() {
  canvas = $('#canvas')[0];
  ctx = canvas.getContext('2d');
  canvas.width = 200;
  canvas.height = 400;
  ctx.style = "#000000";
  ctx.fillRect(0,0,10,10);

  imageDataTest();
});

function imageDataTest() {
  loadImage("test", 4);
}

function loadImage(name, num) {
  imgCanvas = new Array(num);
  pixelDataList = new Array(num);
  let img = new Array(num);
  for(let i=0; i<num; i++) {
    img[i] = $('<img src="resource/'+name + (i+1) + '.png">');
    img[i].on('load', function() {
      let width = this.width;
      let height = this.height;

      imgCanvas[i] = $('<canvas class="img_canvas"/>')[0];
      imgCanvas[i].width = width;
      imgCanvas[i].height = height;

      $(imgCanvas[i]).width(width*3);
      $(imgCanvas[i]).height(height*3);

      let imgCtx = imgCanvas[i].getContext('2d');
      imgCtx.drawImage(this, 0, 0, width, height);

      let imgData = imgCtx.getImageData(0, 0, width, height);
      let imgPixelData = [];
      for (let y=0; y<height; y++) {
        for (let x=0; x<width; x++) {
          let pix = (y*width + x) * 4;
          let color = imgData.data.slice(pix, pix+3);

          let vData = rgbToV(color);
          let alphaData = imgData.data.slice(pix+3, pix+4);
          imgPixelData.push({
            v: vData,
            alpha: alphaData
          });
        }
      }
      pixelDataList[i] = imgPixelData;

      $('body').append(imgCanvas[i]);
    });
  }
}

$('.color_btn-0').on('click', function() {
  changeColor(0);
});
$('.color_btn-1').on('click', function() {
  changeColor(1);
});
$('.color_btn-2').on('click', function() {
  changeColor(2);
});
$('.color_btn-3').on('click', function() {
  changeColor(3);
});

$('input[type="range"]').on('change', function() {
  let btn = $(this).nextAll('input[type="button"]').first();
  btn.trigger('click');
});

$('.default_btn-0').on('click', function() {
  $('.range-0.range-r').val(67);
  $('.range-0.range-g').val(111);
  $('.range-0.range-b').val(63);
  changeColor(0);
});

$('.default_btn-1').on('click', function() {
  $('.range-1.range-r').val(196);
  $('.range-1.range-g').val(14);
  $('.range-1.range-b').val(63);
  changeColor(1);
});

$('.default_btn-2').on('click', function() {
  $('.range-2.range-r').val(245);
  $('.range-2.range-g').val(245);
  $('.range-2.range-b').val(255);
  changeColor(2);
});

$('.default_btn-3').on('click', function() {
  $('.range-3.range-r').val(97);
  $('.range-3.range-g').val(108);
  $('.range-3.range-b').val(126);
  changeColor(3);
});

function changeColor(num) {
  let rangeR = Number($('.range-r.range-' + num).val());
  let rangeG = Number($('.range-g.range-' + num).val());
  let rangeB = Number($('.range-b.range-' + num).val());

  let width = imgCanvas[num].width;
  let height = imgCanvas[num].height;
  let imgCtx = imgCanvas[num].getContext('2d');

  let imgData = imgCtx.createImageData(width, height);
  for (let y=0; y<height; y++) {
    for (let x=0; x<width; x++) {
      let pix = (y*width + x) * 4;
      let pixelData = pixelDataList[num][y*width + x];
      if(pixelData.alpha > 0) {
        let overray = overrayColor([rangeR, rangeG, rangeB], pixelData.v);

        imgData.data[pix + 0] = overray[0];
        imgData.data[pix + 1] = overray[1];
        imgData.data[pix + 2] = overray[2];
        imgData.data[pix + 3] = pixelData.alpha;
      }else {
      }
    }
  }
  imgCtx.putImageData(imgData, 0, 0);
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
