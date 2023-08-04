let img;
let x, y, width, height;
let output = document.getElementById("output");
var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');

function loadImage(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
  
    reader.onloadend = function() {
      console.log('Base64 String:', reader.result);
      resolve(reader.result);
      output.src = reader.result;
    }

    reader.onerror = function() {
      reject('There was an error reading the file!');
    }
  
    reader.readAsDataURL(file);
  });
}

document.getElementById('imageUpload').addEventListener('change', function(e) {
  var file = e.target.files[0];
  loadImage(file).then(result => {
    img = result;
    sendToRoboflow();
  }).catch(error => {
    console.error(error);
  });
});

function sendToRoboflow(){
  axios({
      method: "POST",
      url: "https://detect.roboflow.com/gargabedetection/2",
      params: {
          api_key: "TYfb9ac1XcCwNghAqhLW"
      },
      data: img,
      headers: {
          "Content-Type": "application/x-www-form-urlencoded"
      }
  })
  .then(function(response) {
      console.log(response.data);
      x = response.data.predictions[0].x;
      y = response.data.predictions[0].y;
      width = response.data.predictions[0].width;
      height = response.data.predictions[0].height;
      console.log(`x is: ${x} and y is: ${y} and height is: ${height} and width is: ${width}`)

     

      canvas.width = output.width;
      canvas.height = output.height;
      context.drawImage(output, 0, 0);

     let x1 = x - (width/2)
     let y1 = y - (height/2)

      // Draw rectangle
      context.beginPath();
      context.rect(x1, y1, width,height); // Change these values to adjust the position and size of the rectangle
      context.lineWidth = "2";
      context.strokeStyle = "red";
      context.stroke();
  })
  .catch(function(error) {
      console.log(error.message);
  });
}

