
var m = new fabric.Canvas('pointer_div');

function initialize(){

  var myCenter=new google.maps.LatLng(32.760995,35.018563);

  var mapProp = {
    center:myCenter,
    zoom:9,
    mapTypeControlOptions: false,
    mapTypeId:google.maps.MapTypeId.ROADMAP
    };

  var map=new google.maps.Map(document.getElementById("map"),mapProp);

  var marker=new google.maps.Marker({
    position:myCenter,
    });

  marker.setMap(map);
  // Zoom to 9 when clicking on marker
  google.maps.event.addListener(marker,'click',function() {
    map.setZoom(15);
    map.setCenter(marker.getPosition());
    });

  document.getElementById('files').addEventListener('change', handleFileSelect, false);
}

function handleFileSelect(evt) {
    var f = evt.target.files[0]; // FileList object
      // Only process image files.
      if (!f.type.match('image.*')) {
        return;
      }
      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          

          var image = document.createElement("img");
          // var ctx = c.getContext("2d");
         image.src = e.target.result;
	      image.title = theFile.name;
        var c = new fabric.Canvas("pointer_div");
        document.getElementById("pointer_div").fabric = c;
        canvasFill(image,c);
      };

      })(f);

      // Read in the image file as a data URL.
      reader.readAsDataURL(f);    
  }

function canvasFill(img,canvas){
  var imgInstance = new fabric.Image(img);
            canvas.setBackgroundImage(imgInstance);
            var rect1= new fabric.Rect({
                          width: 350, height: 450,
                          left: 10, top: 10,opacity:0.3,hasRotatingPoint:false,
                        })
            var rect2= new fabric.Rect({
                          width: 100, height: 50,
                          left: 150, top: 290,opacity:0.4,fill: '#aac',hasRotatingPoint:false,
                        })
            canvas.add(rect1);
            canvas.add(rect2);
            rect1.bringToFront();
            rect2.bringToFront();
      var line = makeLine([ 150, 150, 250, 150 ]),
      line2 = makeLine([  175, 250, 225, 250 ]),
      line3 = makeLine([  150, 300, 250, 300 ]);

  canvas.add(line, line2, line3);

  canvas.add(
    makeCircle(5,line.get('x1'), line.get('y1'), null, line),
    makeCircle(5,line.get('x2'), line.get('y2'), line),
    makeCircle(2,line2.get('x1'), line2.get('y1'), null, line2),
    makeCircle(2,line2.get('x2'), line2.get('y2'), line2),
    makeCircle(2,line3.get('x1'), line3.get('y1'), null, line3),
    makeCircle(2,line3.get('x2'), line3.get('y2'), line3)
  );
canvas.on('object:moving', function(e) {
    var p = e.target;
    p.line1 && p.line1.set({ 'x2': p.left + p.radius, 'y2': p.top + p.radius});
    p.line2 && p.line2.set({ 'x1': p.left + p.radius, 'y1': p.top + p.radius});
    canvas.renderAll();
  });
}

function makeCircle(r,left, top, line1, line2) {
    var c = new fabric.Circle({
      left: left - r,
      top: top - r,
      strokeWidth: 5,
      radius: r,
      fill: '#fff',
      stroke: '#666'
    });
    c.hasControls = c.hasBorders = false;

    c.line1 = line1;
    c.line2 = line2;

    return c;
}

function makeLine(coords) {
  return new fabric.Line(coords, {
    fill: 'red',
    stroke: 'red',
    strokeWidth: 2,
    selectable: false
  });
}

function detect(){
  var y = document.getElementById("pointer_div").fabric;
  //Width
  Width = y._objects[0].width * y._objects[0].scaleX;
  //Height
  Height = y._objects[0].height * y._objects[0].scaleY;
  //EyesWidth
  EyesWidth = Math.sqrt(Math.pow(y._objects[2].height,2) + Math.pow(y._objects[2].width,2));
  //EyesNose
  EyesNose = y._objects[3].top - y._objects[2].top + 0.5*(y._objects[2].height + y._objects[3].height);
  //NostrilsWidth
  NostrilsWidth = Math.sqrt(Math.pow(y._objects[3].height,2) + Math.pow(y._objects[3].width,2));
  //NoseMouth
  NoseMouth = y._objects[4].top - y._objects[3].top + 0.5*(y._objects[4].height + y._objects[3].height);
  //MouthHeight
  MouthHeight = y._objects[1].height * y._objects[1].scaleY;
  //MouthWidth
  MouthWidth = y._objects[1].width * y._objects[1].scaleX;
  //Vector
  v1 = EyesWidth / Width;
  v2 = NostrilsWidth / Width;
  v3 = MouthWidth / Width;
  v4 = EyesNose / Height;
  v5 = NoseMouth / Height;
  v6 = MouthHeight / Height;
  console.log(v1,v2,v3,v4,v5,v6);
  console.log(y._objects);
}

google.maps.event.addDomListener(window, 'load', initialize);
