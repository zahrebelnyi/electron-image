export function drawGrid(ctx, canvas) {
    ctx.beginPath();
    ctx.moveTo(1, 1);
    ctx.lineTo(canvas.width - 1, 1);
    ctx.lineTo(canvas.width - 1, canvas.height - 1);
    ctx.lineTo(1, canvas.height - 1);
    ctx.lineTo(1, 1);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#fdfdfd';
    ctx.stroke();
}

export async function getSizeImage(image) {
    const newImg = new Image();

    return new Promise((resolve, reject) => {
        try {
            newImg.src = image;

            newImg.onload = function() {
                 resolve({
                    width: newImg.width,
                    height: newImg.height
                });
            }

        } catch (e) {
            reject();
        }
    });
}

export function updateCanvas(canvasRef, img) {
    const canvas = canvasRef;
    const ctx = canvas.getContext('2d');
    const newImg = new Image();

    newImg.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if(newImg.width < canvas.width && newImg.height < canvas.height) {
            // Draw To the center
            ctx.drawImage(newImg, canvas.width / 2 - newImg.width / 2, canvas.height / 2 - newImg.width / 2);
        } else {
            // Draw fill canvas
            const scale = Math.min(canvas.width / newImg.width, canvas.height / newImg.height);
            // get the top left position of the image
            const x = (canvas.width / 2) - (newImg.width / 2) * scale;
            const y = (canvas.height / 2) - (newImg.height / 2) * scale;
            ctx.drawImage(newImg, x, y, newImg.width * scale, newImg.height * scale);
        }
        drawGrid(ctx, canvas);
    };
    newImg.src = img;
}