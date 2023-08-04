let img;

let output = document.getElementById("output");

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
      console.log(response.data.image)
  })
  .catch(function(error) {
      console.log(error.message);
  });
}
