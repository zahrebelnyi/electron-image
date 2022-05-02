import { useEffect, useRef, useState }         from "react";
import { IconClockwise, IconCounterClockwise } from "../Icons";
import { updateCanvas }                        from "../helpers/helpers";
import { Spinner }                             from "../components/spinner";

export const ImageUpload = () => {
    const [img, setImg] = useState('');
    const [pathImage, setPathImage] = useState('');
    const [processing, setProcessing] = useState(false);
    const canvasRef = useRef();

    const isDisabled = !Boolean(img) || processing;
    const withDPI = 600 * 2;
    const heightDPI = 500 * 2;

    async function rotateRight() {
        try {
            setProcessing(true);
            await window.image.rotate(+0.5, pathImage);
        } catch (e) {
            console.log('ERROR Rotate right', e);
        }
    }

    async function rotateLeft() {
        try {
            setProcessing(true);
            await window.image.rotate(-0.5, pathImage);
        } catch (e) {
            console.log('ERROR Rotate left', e);
        }
    }

    async function upload() {
        try {
            await window.image.upload();
            handleUpdateCanvas();
        } catch (e) {
            console.log('ERROR UPLOAD', e);
        }
    }

    function handleUpdateCanvas() {
        updateCanvas(canvasRef.current, img);
    }

    useEffect(() => {
        handleUpdateCanvas();
        setProcessing(false);
    }, [img]);

    const handleSetImage = (image, path) => {
        setImg(image);
        if (path) setPathImage(path);
        setProcessing(false);
    }

    useEffect(() => {
        window.electron.ipcRenderer.on('pathImage', handleSetImage);

        return () => {
            window.electron.ipcRenderer.removeListener('pathImage', handleSetImage);
        }
    }, []);

    return (
        <div className='wrapper'>
            <div className="upload-buttons">
                <span className="path" title={pathImage}>{pathImage}</span>
                <button id="upload" onClick={upload} disabled={processing}>Upload File</button>
            </div>
            <div className="wrapper-canvas">
                { img && isDisabled && <Spinner /> }
                <canvas id="preview" ref={canvasRef} width={withDPI} height={heightDPI} />
            </div>
            <div className='buttons'>
                <button id="toggle-rotate-negative" onClick={rotateLeft} disabled={isDisabled}>
                    <IconCounterClockwise />
                </button>
                <button id="toggle-rotate-positive" onClick={rotateRight} disabled={isDisabled}>
                    <IconClockwise />
                </button>
            </div>
        </div>
    );
};
