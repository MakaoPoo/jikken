let canvas;
let ctx;

let imageData;
let imageData2;

$(window).on('load', function() {
  canvas = $('#canvas')[0];
  ctx = canvas.getContext('2d');
  canvas.width = 128;
  canvas.height = 128;
  $(canvas).width(400);
  $(canvas).height(400);
  ctx.fillStyle  = "#000000";
  ctx.fillRect(0,0,10,10);

  imageDataTest();
});

function imageDataTest() {
  imageData = new ImageObjectData([
    {id: "test1", src: "resource/test1.png", defColor: [67, 111, 63] },
    {id: "test2", src: "resource/test2.png", defColor: [196, 14, 63] },
    {id: "test3", src: "resource/test3.png", defColor: [245, 245, 255] },
    {id: "test4", src: "resource/test4.png", defColor: [97, 108, 126] }
  ]);

  imageData2 = new ImageObjectData([
    {id: "test5", src: "resource/test5.png", defColor: [255, 82, 178] },
    {id: "test6", src: "resource/test6.png", defColor: [226, 0, 47] },
    {id: "test7", src: "resource/test7.png", defColor: [68, 68, 68] },
  ]);
  imageData2.onload(function() {
    draw();
  });
}

$('input[type="range"]').on('input', function() {
  let wrapper = $(this).parent('div.range_wrapper');
  let name = wrapper.data('name');

  let r = wrapper.children('.range-r').val();
  let g = wrapper.children('.range-g').val();
  let b = wrapper.children('.range-b').val();
  imageData.setColor(name, [Number(r), Number(g), Number(b)]);
  imageData2.setColor(name, [Number(r), Number(g), Number(b)]);
  draw();

  $('#link1').attr("href", 'data:application/json;charset=UTF-8,' +
  JSON.stringify(imageData));
});

$('.default_btn').on('click', function() {
  let wrapper = $(this).parent('div.range_wrapper');
  let name = wrapper.data('name');
  let color = imageData.getDefaultColor(name);
  if(name == "test5" || name == "test6" || name == "test7") {
    color = imageData2.getDefaultColor(name);
  }
  let a = imageData.getColor(name);
  wrapper.children('.range-r').val(color.r);
  wrapper.children('.range-g').val(color.g);
  wrapper.children('.range-b').val(color.b);
  imageData.setDefaultColor(name);
  draw();

  $('#link1').attr("href", 'data:application/json;charset=UTF-8,' +
  JSON.stringify(imageData));
});

function draw() {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle  = "#ffffff";
  ctx.fillRect(0, 0, canvas.width/2, canvas.height);
  ctx.fillStyle  = "#000000";
  ctx.fillRect(canvas.width/2, 0, canvas.width, canvas.height);

  imageData.draw(ctx, -20, -10, 128, 128);
  imageData.draw(ctx, -10, -10, 128, 128);

  imageData2.draw(ctx, 20, 10, 128, 128);
  ctx.save();
  ctx.translate(90, 80);
  ctx.rotate((10 * Math.PI) / 180);
  imageData2.draw(ctx, -64, -64, 128, 128);
  ctx.restore();
}
