(function () {
  var API_URL = "https://hihiapi.fly.dev";
  var $ = function (id) {
    return document.getElementById(id);
  };
  var isMouseDown = false;
  var pointerBuffer = new Array();
  var previousBuffer = new Array();
  var isAnimationPlaying = false;

  function parseQuery(queryString) {
    var query = {};
    var pairs = (
      queryString[0] === "?" ? queryString.substr(1) : queryString
    ).split("&");
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split("=");
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
    }
    return query;
  }

  function decodeHihiText(text) {
    return text.split("\n").map((e) => JSON.parse(e));
  }

  function encodeHihi(buffer) {
    let lines = "";
    for (let i = 0; i < buffer.length; i++) {
      lines += JSON.stringify(buffer[i]) + "\n";
    }
    return lines;
  }

  function getAnimation(id) {
    return fetch(API_URL + "/v1/animations/" + id)
      .then((resp) => resp.json())
      .then((data) => {
        const hihiBuf = decodeHihiText(data.hihi_text);
        previousBuffer = hihiBuf;
        //console.log(decodeHihiText(data.hihi_text))
      });
  }

  var cursorCanvas = (this.__cursorCanvas = new fabric.StaticCanvas(
    "cursorCanvas",
    {
      isDrawingMode: false,
    }
  ));
  var canvas = (this.__canvas = new fabric.Canvas("c", {
    isDrawingMode: false,
    backgroundColor: "black",
  }));
  var circRadius = 10;
  var circ = new fabric.Circle({
    radius: circRadius,
    width: 50,
    height: 50,
    left: 100,
    top: 100,
    stroke: "pink",
    strokeWidth: 5,
    fill: "#fff", // '#faa',
    selectable: false,
    zIndex: 1000,
  });

  function onMouseDown(event) {
    playAnimation(previousBuffer, () => {
      fetch(API_URL + "/v1/animations/" + id + "/count_view", {
        method: "POST",
      }).catch((err) => console.error(err));
    });
  }

  canvas.on("mouse:down", onMouseDown);

  fabric.Object.prototype.transparentCorners = false;

  function resetCanvas() {
    canvas.clear();
    canvas.backgroundColor = "black";
  }

  function playAnimation(buffer, cb) {
    if (isAnimationPlaying) return;
    isAnimationPlaying = true;

    resetCanvas();
    var i = 0;

    var t = setInterval(function () {
      if (i >= buffer.length) {
        if (cb) cb();
        isAnimationPlaying = false;
        clearInterval(t);
        t = null;
        return;
      }
      var data = buffer[i];
      switch (data.e) {
        case 0:
          canvas.getContext().beginPath();
          canvas.getContext().lineCap = "round";
          canvas.getContext().lineJoin = "round";
          canvas.getContext().moveTo(data.x, data.y);

          canvas.getContext().strokeStyle = "pink";
          canvas.getContext().lineWidth = 10;
          circ.setOptions({
            left: data.x - 27,
            top: data.y - 27,
          });
          cursorCanvas.add(circ);
          break;
        case 1:
          canvas.getContext().lineTo(data.x, data.y);
          canvas.getContext().stroke();
          cursorCanvas.remove(circ);
          circ.setOptions({
            left: data.x - 27,
            top: data.y - 27,
          });
          cursorCanvas.add(circ);
          break;
        case 2:
          const prev = buffer[i - 1];
          if (prev && prev.e === 0) {
            // No movement, just a dot.
            canvas.getContext().lineTo(data.x + 0.01, data.y + 0.01);
            canvas.getContext().stroke();
            cursorCanvas.remove(circ);
          } else {
            canvas.getContext().lineTo(data.x, data.y);
            canvas.getContext().stroke();
            cursorCanvas.remove(circ);
          }
          break;
        default:
          console.warn("Unrecognized opcode", data.e);
          break;
      }

      i += 1;
    }, 1000 / 30);
  }

  if (canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush.color = "pink";
    canvas.freeDrawingBrush.width = 10;
  }

  // ENTRYPOINT

  const query = parseQuery(window.location.toString().split("?")[1]);
  let id = query.id;

  getAnimation(id)
    .then(() => {
      playAnimation(previousBuffer, () => {
        fetch(API_URL + "/v1/animations/" + id + "/count_view", {
          method: "POST",
        }).catch((err) => console.error(err));
      });
    })
    .catch((err) => console.error(err));
})();
