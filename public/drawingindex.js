const canvas = document.getElementById('drawing-board');
const toolbar = document.getElementById('toolbar');
const ctx = canvas.getContext('2d');

const uploadInput = document.getElementById('upload');

const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;

canvas.width = window.innerWidth - canvasOffsetX;
canvas.height = window.innerHeight - canvasOffsetY;

let isPainting = false;
let lineWidth = 5;
let startX;
let startY;
let tool = 'brushSmall';

//Undo and Redo
let undoStack = [];
let redoStack = [];

//Uploaded Image Manipulation
let placedImage = null;
let isDraggingImage = false;
let isResizingImage = false;

//Click vs Drag detection

canvas.addEventListener('pointerdown', (e) => {
    const mouseX = e.clientX - canvasOffsetX;
    const mouseY = e.clientY - canvasOffsetY;

    // Save undo
    undoStack.push(canvas.toDataURL());
    redoStack = [];

    isPainting = false;
    isDraggingImage = false;
    isResizingImage = false;

    if (placedImage) {
        const handleSize = 10;

        const onHandle =
            mouseX > placedImage.x + placedImage.width - handleSize &&
            mouseY > placedImage.y + placedImage.height - handleSize;

        const onImage =
            mouseX > placedImage.x &&
            mouseX < placedImage.x + placedImage.width &&
            mouseY > placedImage.y &&
            mouseY < placedImage.y + placedImage.height;

        if (onHandle) {
            isResizingImage = true;
            return;
        }

        if (onImage) {
            isDraggingImage = true;
            return;
        }
    }

    isPainting = true;
});

//Clear Button
toolbar.addEventListener('click', e => {
    if (e.target.id === 'clear') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
});

//Stroke and Lineweight Buttons
toolbar.addEventListener('change', e => {
    if(e.target.id === 'stroke') {
        ctx.strokeStyle = e.target.value;
    }

    if(e.target.id === 'lineWidth') {
        lineWidth = e.target.value;
    }
    
});

//Draw and Erase funtions
const draw = (e) => {
    if(!isPainting) {
        return;
    }
   
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out'; // Drawing
    } else {
        ctx.globalCompositeOperation = 'source-over'; // Erase
    }
    
    // ctx.lineTo(e.clientX-Reflect.left, e.clientY - Reflect.top);
    ctx.lineTo(e.clientX - canvasOffsetX, e.clientY - canvasOffsetY);
    ctx.stroke();
}

canvas.addEventListener('pointerup', e => {
    
    isPainting = false;
    isDraggingImage = false;
    isResizingImage = false;
    ctx.stroke();
    ctx.beginPath();
});

//NEW Save button to upload to cloud instead of to computer--------
const saveButton = document.getElementById('save');
    saveButton.addEventListener('click', async () => {
    try { //async is so the code can wait for it to finsih b4 continuing
        canvas.toBlob(async (blob) => {  //canvas turns to blob aka file so we can upload to server
            if (!blob) {
                alert("couldnt turn drawing into image oops");
                return; }
            const fileName = `drawing-${Date.now()}.png`;
            
            const file = new File([blob], fileName, { 
                type: "image/png" //make it into a png file for multer to grab 
            });
            //put into a spical box aka formdata so fetch can grab it
            const formData = new FormData();
            formData.append("images", file);

            //send to backend
            const response = await fetch("/upload", {
                method: "POST",
                body: formData
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "upload faild");
            }
            //download to device
            const imageUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = imageUrl;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(imageUrl);

            alert("drawing uploaded and saveeeed yay");
        }, "image/png");
    } catch (error) {
        console.error("saveupload error:", error);
        alert("upload failedd");
    }
});

//OLD SAVE BUTTON CODE 
// const saveButton = document.getElementById('save');

// saveButton.addEventListener('click', () => {
//     const dataURL = canvas.toDataURL('image/png'); // convert canvas to image
//     const link = document.createElement('a');
//     link.href = dataURL;
//     link.download = `drawing-${Date.now()}.png`;
//     link.click();
// });

//Tool Switch

const eraserButton = document.getElementById('eraser');
const brushSmallButton = document.getElementById('brushSmall');
const brushMedButton = document.getElementById('brushMed');
const brushBigButton = document.getElementById('brushBig');


eraserButton.addEventListener('click', () => {
    tool = 'eraser';
    lineWidth = 15;
    canvas.style.cursor = 'crosshair';
});

brushSmallButton.addEventListener('click', () => {
    tool = 'brushSmall';
    lineWidth = 10;
    canvas.style.cursor = 'default';
});

brushMedButton.addEventListener('click', () => {
    tool = 'brushMed';
    lineWidth = 20;
    canvas.style.cursor = 'default';
});

brushBigButton.addEventListener('click', () => {
    tool = 'brushBig';
    lineWidth = 30;
    canvas.style.cursor = 'default';
});

//Undo and Redo 

const undoButton = document.getElementById('undo');
const redoButton = document.getElementById('redo');

undoButton.addEventListener('click', () => {
    if (undoStack.length === 0) return;

    redoStack.push(canvas.toDataURL());

    const imgData = undoStack.pop();
    const img = new Image();
    img.src = imgData;

    img.onload = () => {
        ctx.globalCompositeOperation = 'source-over'; // reset to normal drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
});

redoButton.addEventListener('click', () => {
    if (redoStack.length === 0) return;

    undoStack.push(canvas.toDataURL());

    const imgData = redoStack.pop();
    const img = new Image();
    img.src = imgData;

    img.onload = () => {
        ctx.globalCompositeOperation = 'source-over'; // reset to normal drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
});

//Photo Upload 

uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;

        img.onload = function() {
            placedImage = {
            img: img,
            x: 50,
            y: 50,
            width: img.width / 2,
            height: img.height / 2
        };
            render();
        };
    };
    reader.readAsDataURL(file);
});

//Render Photo

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw image if it exists
    if (placedImage) {
        ctx.drawImage(
            placedImage.img,
            placedImage.x,
            placedImage.y,
            placedImage.width,
            placedImage.height
        );

        drawResizeHandle();
    }
}

//Photo Resize

function drawResizeHandle() {
    const size = 10;

    ctx.fillStyle = 'blue';
    ctx.fillRect(
        placedImage.x + placedImage.width - size,
        placedImage.y + placedImage.height - size,
        size,
        size
    );
}

// Photo Movement
canvas.addEventListener('pointermove', (e) => {
    e.preventDefault ();
    const mouseX = e.clientX - canvasOffsetX;
    const mouseY = e.clientY - canvasOffsetY;
    canvas.style.cursor = 'default';
    
    if (isDraggingImage && placedImage) {
        placedImage.x = mouseX - placedImage.width / 2;
        placedImage.y = mouseY - placedImage.height / 2;
        render();
        return;
    }

    if (isResizingImage && placedImage) {
        const aspect = placedImage.img.width / placedImage.img.height;
        placedImage.width = mouseX - placedImage.x;
        placedImage.height = placedImage.width / aspect;
        render();
        return;
    }

    if (placedImage) {
    const handleSize = 10;

    if (
        mouseX > placedImage.x + placedImage.width - handleSize &&
        mouseY > placedImage.y + placedImage.height - handleSize
    ) {
        canvas.style.cursor = 'nwse-resize';
    } else if (
        mouseX > placedImage.x &&
        mouseX < placedImage.x + placedImage.width &&
        mouseY > placedImage.y &&
        mouseY < placedImage.y + placedImage.height
    ) {
        canvas.style.cursor = 'move';
    }
    }

    if (isPainting) {draw(e);}
});