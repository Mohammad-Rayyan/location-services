
var m = new fabric.Canvas('pointer_div');
var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
var canvas_max_width = w;
var canvas_max_height = h;
var map;

function initialize(){
  var c = new fabric.Canvas("pointer_div");
  document.getElementById("pointer_div").fabric = c;
  document.getElementById('files').addEventListener('change', handleFileSelect, false);
}
function mapinit(){
  var myCenter=new google.maps.LatLng(32.760995,35.018563);
  var mapProp = {
    center:myCenter,
    zoom:9,
    mapTypeControlOptions: false,
    mapTypeId:google.maps.MapTypeId.ROADMAP
    };

  map=new google.maps.Map(document.getElementById("map"),mapProp);

  var marker=new google.maps.Marker({
    position:myCenter,
    });
  // Zoom to 9 when clicking on marker
  google.maps.event.addListener(marker,'click',function() {
    map.setZoom(15);
    map.setCenter(marker.getPosition());
    });
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
        var y = document.getElementById("pointer_div").fabric;
        y.clear();
        canvasFill(image,y);
      };

      })(f);

      // Read in the image file as a data URL.
      reader.readAsDataURL(f);    
  }

function canvasFill(img,canvas){
  console.log("width" +img.width)
  console.log("height" +img.height)
  var ratio = 1;
  if(img.width > canvas_max_width){
    ratio = canvas_max_width / img.width; 
    img.width = canvas_max_width;
  }
  img.height = ratio * img.height;
  console.log("width" +img.width)
  console.log("height" +img.height)
  ratio=1;
  if(img.height > canvas_max_height){
    ratio = canvas_max_height / img.height; 
    img.height = canvas_max_height;
  }
  img.width = ratio * img.width;
  console.log("width" +img.width)
  console.log("height" +img.height)
  var imgInstance = new fabric.Image(img);
  canvas.setBackgroundImage(imgInstance);
  canvas.setHeight(imgInstance.height);
  canvas.setWidth(imgInstance.width);
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
///////////////////////////////////////// location history
var SCALAR_E7 = 0.0000001;

function pad(num, size) {
  var s = num+"";
  while (s.length < size) s = "0" + s;
  return s;
}
var locations = Array();
var fileName="";
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
  var vector = [v1,v2,v3,v4,v5,v6];
  var index=find(vector);
  console.log(data[index].name);
  fileName = data[index].file;
  console.log(fileName);
  loadJSON(function(response) {
  // Parse JSON string into object
    locations=locations.concat(JSON.parse(response).locations);
 });
  init();
};

function find(vec){
  var minIndex = -1;
  var min = 100;
  var current =0;
  for (var i = 0; i < data.length; i++) {
    current =0;
    for (var j = 0; j < 6; j++) {
      current =current + Math.pow(data[i].detectionVector[j] - vec[j],2);
    }
    current = Math.sqrt(current);
    console.log("current " + current);
    if(current < min){
      min =current;
      minIndex = i;
    }
    console.log("min " + min);
    console.log("minIndex " + minIndex);
  }
  return minIndex;
}

 function loadJSON(callback) {   

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', 'data/'+fileName+'.json', false); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 };

    //init user interface 
function init(){

      //Sort be Time:
      locations.sort(function (a,b) {
        if (a.timestampMs < b.timestampMs)
        return -1;
        if (a.timestampMs > b.timestampMs)
        return 1;
        return 0;
      });
      
      //generate list:
      var year=-1;
      var month=-1;
      var day=-1;
      var stime=-1;
      var count=0;
      for(var i=0;i<locations.length;i++){
        var date = new Date(1*locations[i].timestampMs);
        count++;
        if( year!=date.getFullYear() || 
          month!=date.getMonth() ||
          day!=date.getDate()
          ){
          if(stime!=-1){
            var etime=locations[i].timestampMs;
            var element="";
            element+="<div class='listelement' stime='"+stime+"' etime='"+etime+"'>";
            element+="<li  role='presentation'><a onclick='display("+stime+","+etime+");return false;' href='#'>"
            element+=pad(day,2)+".";
            element+=pad(month+1,2)+" ";
            element+=year+" ";
            element+="<span class='badge'>"+count+"</span>";
            element+="</a></li>"
            element+="</div><li role='separator' class='divider'></li>";
            $("#list").append(element);
          }
          year=date.getFullYear(); 
          month=date.getMonth();
          day=date.getDate();
          count=0;
          stime=locations[i].timestampMs;
        }
      }
      
      console.log(""+locations.length+" Location laoded");
      $("#faceDetect").css("display","none");
      $("#locationHistory").css("display","block");
      $("#map").css("display","block");
      mapinit();
      setTimeout(function(){ google.maps.event.trigger(map, "resize"); }, 1000);
}

//Load data
var gmarkers = [];

function removeMarkers(){
  for(i=0; i<gmarkers.length; i++){
    gmarkers[i].setMap(null);
  }
};

var current = null;
function display(start,end){
  var cordinats =Array();
  //Load Path
  var sindex=-1;
  var eindex;
  removeMarkers();
  for(var i=0;i<locations.length;i++){
    if(locations[i].timestampMs>=start && locations[i].timestampMs<end){
      if(sindex==-1)
        sindex=i;
      eindex=i; 
      cordinats.push({lat: locations[i].latitudeE7*SCALAR_E7, lng: locations[i].longitudeE7*SCALAR_E7});
    }
  }
var bounds = new google.maps.LatLngBounds();
  for(var j=0;j<cordinats.length;j++){
    var marker = new google.maps.Marker({
    position: new google.maps.LatLng(cordinats[j].lat, cordinats[j].lng),
    map:map
    });

    // Push your newly created marker into the array:
    gmarkers.push(marker);
    bounds.extend(marker.getPosition());
  };
  //Center map:
  if($('#cb').is(':checked'))
    map.fitBounds(bounds);
  
  //Create slider:
  if(current != null){
    current.setMap(null);
  };
  $("#slider").slider({
      min: sindex,
      max: eindex,
      range: "min",
      value: sindex,
      slide: function( event, ui ) {
        if(current != null){
          current.setMap(null);
        };
        initialLocation = new google.maps.LatLng(locations[ui.value].latitudeE7*SCALAR_E7, locations[ui.value].longitudeE7*SCALAR_E7);
        map.setCenter(initialLocation);
        //Display information
        var info="";
        var date = new Date(1*locations[ui.value].timestampMs);
        info+=date.toLocaleString();
        info+=" Accuracy: "+locations[ui.value].accuracy+"m";
        $("#info").text(info);
        current = new google.maps.Marker({
          position: map.getCenter(),
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10
          },
          draggable: false,
          map: map
        });
      }
    });
};
function search(){
  //Rmove last search color
  $(".listelement").each(function (){
    $(this).css("background-color","white");
  });
  //Search for locations
  var timestamps=Array();
  for(var i=0;i<locations.length;i++){
    if(map.getBounds().contains( new google.maps.LatLng(parseFloat(locations[i].latitudeE7*SCALAR_E7),parseFloat(locations[i].longitudeE7*SCALAR_E7)))){
      timestamps.push(locations[i].timestampMs);
    }
  }
  //Display Dates
  $(".listelement").each(function (){
    var s=$(this).attr("stime");
    var e=$(this).attr("etime");
    for(var i=0;i<timestamps.length;i++){
      if(timestamps[i]>=s && timestamps[i]<e){
        $(this).css("background-color","orange");
        break;
      }
    }
  });   
}
google.maps.event.addDomListener(window, 'load', initialize);
