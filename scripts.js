let img;
let elementClass = document.getElementById("elementClass");
var canvasBoundingBox = document.getElementById('myCanvas');
let canvasUploadedImage = document.getElementById('uploaded-image');
let container = document.getElementById("container")
let arrayOfPredSentences = [];


function loadImage (file) {
  return new Promise((resolve, reject) => {

    // Select all elements with class "output-txt"
    const elements = document.querySelectorAll('.output-txt');

    // Loop through the selected elements and remove them
    elements.forEach(function (element) {
      element.parentNode.removeChild(element);
    });
    // reset output text
    arrayOfPredSentences = [];

    let reader = new FileReader();

    reader.onloadend = function () {
      const img = new Image();
      img.onload = function () {

        // Create a canvas to resize the image
        let ctx = canvasUploadedImage.getContext('2d');
        canvasUploadedImage.width = 640;
        canvasUploadedImage.height = 640;
        ctx.drawImage(img, 0, 0, 640, 640);
        // Convert the canvas image to Base64
        let base64Image = canvasUploadedImage.toDataURL('image/jpeg');

        // return the image in base64 encoding to the API
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


document.getElementById('custom-file-upload').addEventListener('change', function (e) {
  var file = e.target.files[0];
  loadImage(file).then(result => {

    // set img to the result of the loadImage function which in this case
    // is the uploaded image
    img = result;
    sendToRoboflow();
  }).catch(error => {
    console.error(error);
  });
});

// calling the roboflow API
function sendToRoboflow () {
  axios({
    method: "POST",
    url: "https://detect.roboflow.com/garbagedetection2.0/5",
    params: {
      api_key: "q1kAr5r6SCtp1VXpbQO0",
      // interference hyperparameters
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
      // elementClass.textContent = response.data.predictions[0].class;

      // set the canvas to 640x640 dimensions
      canvasBoundingBox.width = canvasUploadedImage.width;
      canvasBoundingBox.height = canvasUploadedImage.height;
      let context = canvasBoundingBox.getContext('2d');

      // draw the uploaded image on the canvas
      // where the bounding box will be drawed on
      context.drawImage(canvasUploadedImage, 0, 0);



      // draw bounding box for every prediction
      response.data.predictions.forEach(element => {
        let x1 = element.x - (element.width / 2)
        let y1 = element.y - (element.height / 2)

        // Draw rectangle
        context.beginPath();
        context.rect(x1, y1, element.width, element.height);
        context.lineWidth = "2";
        let elementColor;
        // appoint a unique color for every class
        if (element.class == "battery") {
          context.strokeStyle = "red";
          elementColor = "red";
        } else if (element.class == "metal") {
          context.strokeStyle = "blue";
          elementColor = "blue";
        } else if (element.class == "paper") {
          context.strokeStyle = "yellow";
          elementColor = "yellow";
        } else if (element.class == "plastic") {
          context.strokeStyle = "green";
          elementColor = "green";
        } else if (element.class == "cardboard") {
          context.strokeStyle = "purple";
          elementColor = "purple";
        } else {
          context.strokeStyle = "brown";
          elementColor = "brown";
        }
        context.stroke();

        // turn confidence to 2 decimal number
        let twoDecConf = element.confidence.toString().slice(0,3);
        twoDecConf*= 100;

        arrayOfPredSentences.push(`The class of the element is: ${element.class}(${elementColor}), I am this much confident: ${twoDecConf}%`);

      });

      // build the string then output it
      // to list all items in the picture
      arrayOfPredSentences.forEach(element => {
        let outputTxt = document.createElement('h3');
        outputTxt.textContent = element;
        outputTxt.classList.add("output-txt")
        container.appendChild(outputTxt)

      })

    })
    .catch(function (error) {
      console.log(error.message);
    });
}

