let img;
let x, y, width, height;
// let elementClass = document.getElementById("elementClass");
let output = document.getElementById("output");
var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');


function loadImage (file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onloadend = function () {
      const img = new Image();
      img.onload = function () {
        // Create a canvas to resize the image
        let canvas = document.getElementById('output');
        let ctx = canvas.getContext('2d');
        canvas.width = 640;
        canvas.height = 640;
        ctx.drawImage(img, 0, 0, 640, 640);
        // Convert the canvas image to Base64
        let base64Image = canvas.toDataURL('image/jpeg');
        resolve(base64Image);
      }

      img.src = reader.result; // Set the img src to the reader's result
    }

    reader.onerror = function () {
      reject('There was an error reading the file!');
    }

    reader.readAsDataURL(file); // Move this outside of img.onload
  });
}


document.getElementById('imageUpload').addEventListener('change', function (e) {
  var file = e.target.files[0];
  loadImage(file).then(result => {
    img = result;
    sendToRoboflow();
  }).catch(error => {
    console.error(error);
  });
});

function sendToRoboflow () {
  axios({
    method: "POST",
    url: "https://detect.roboflow.com/garbagedetection2.0/5",
    params: {
      api_key: "q1kAr5r6SCtp1VXpbQO0",
      confidence: "25",
      overlap: "50"
    },
    data: img,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
    .then(function (response) {
      console.log(response.data);
      x = response.data.predictions[0].x;
      y = response.data.predictions[0].y;
      width = response.data.predictions[0].width;
      height = response.data.predictions[0].height;
      console.log(`x is: ${x} and y is: ${y} and height is: ${height} and width is: ${width}`)

      // elementClass.textContent = response.data.predictions[0].class;

      canvas.width = output.width;
      canvas.height = output.height;

      context.drawImage(output, 0, 0);

      response.data.predictions.forEach(element => {
        let x1 = element.x - (element.width / 2)
        let y1 = element.y - (element.height / 2)

        // Draw rectangle
        context.beginPath();
        context.rect(x1, y1, element.width, element.height);
        context.lineWidth = "2";
        context.strokeStyle = "red";
        context.stroke();
      });



    })
    .catch(function (error) {
      console.log(error.message);
    });
}

