var canvas, context, drawing, doc = document, data;
window.onload = function () {
    initializaion();
    onColorSelect();
    clearCanvas();
    brushSize();
    //createColorPicker();
};

function initializaion() {
    // This demo depends on the canvas element
    if (!('getContext' in document.createElement('canvas'))) {
        alert('Sorry, it looks like your browser does not support canvas!');
    }
    canvas = document.getElementById("paper");
    context = canvas.getContext("2d");
    context.lineCap = "round";
    context.strokeStyle = "black";
    var fromx, fromy, tox, toy;
    canvas.addEventListener('mousedown', function (event) {
        event.preventDefault();
        fromx = event.offsetX;
        fromy = event.offsetY;
        drawing = true;
    });

    doc.addEventListener('mouseup', function () {
        drawing = false;
    });

    doc.onmousemove = function (event) {
        if (drawing) {
            drawLine(fromx, fromy, event.offsetX, event.offsetY);
            fromx = event.offsetX;
            fromy = event.offsetY;
          //  demo(data);
        }
    };
}

function drawLine(fromx, fromy, tox, toy) {
    context.beginPath();
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.stroke();
    context.closePath();

    data = context.getImageData(0, 0, canvas.getAttribute('width'), canvas.getAttribute('height'));
}

function demo(canvasData) {
    var destionation = document.getElementById("papers");
    var destinationContext = destionation.getContext("2d");
    destinationContext.putImageData(canvasData, 0, 0);
    //destionation.getAttribute('width'), destionation.getAttribute('height')
}

/* using simple colors
*/
function onColorSelect() {
    var colors = document.getElementById("colors").children;

    for (var i = 0; i < colors.length; i++) {
        colors[i].onclick = function (event) {
            context.strokeStyle = this.style.backgroundColor;
        };
    }
}

function clearCanvas() {
    document.getElementById("clear").onclick = function () {
        //resizeCvs();
        context.save();
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.restore();
        data = context.getImageData(0, 0, canvas.getAttribute('width'), canvas.getAttribute('height'));
        //demo(data);
    };
}

function brushSize() {
    document.getElementById("sizer").onchange = function () {
        var thickness = document.getElementById("sizer").value;
        context.lineWidth = parseInt(thickness, 10);
    };
}