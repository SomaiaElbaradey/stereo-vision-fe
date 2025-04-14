import React, { useRef, useState } from "react";
import axios from "axios";
import { Button } from "../ui/button";
import { CameraIcon } from "lucide-react";

const Calibration: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<Blob[]>([]);
    const [calibrating, setCalibrating] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [stream, setStream] = useState<MediaStream | null>(null); // Store the media stream

    // Start the webcam stream
    const startCamera = async () => {
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) videoRef.current.srcObject = newStream;
            setStream(newStream); // Save the stream to stop it later
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            alert("Failed to access the webcam.");
        }
    };

    // Stop the webcam stream
    const stopCamera = () => {
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach((track) => track.stop()); // Stop all tracks
            setStream(null); // Reset stream state
        }
    };

    // Take a snapshot
    const takeSnapshot = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (canvas && video) {
            const ctx = canvas.getContext("2d");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                if (blob) setImages((prev) => [...prev, blob]);
            }, "image/jpeg");
        }
    };

    // Upload captured images to backend
    const uploadImages = async () => {
        if (images.length < 5) {
            alert("Please take at least 5 images of the chessboard for calibration.");
            return;
        }
        setCalibrating(true);
        const formData = new FormData();
        images.forEach((img, idx) => {
            formData.append("files", img, `cal${idx}.jpg`);
        });

        try {
            // https://stereo-vision-be.onrender.com
            const res = await axios.post("http://localhost:8000/upload/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setResult(res.data); // Assume the backend returns the calibrated images in the response
        } catch (err) {
            console.error(err);
            alert("Calibration failed.");
        } finally {
            setCalibrating(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6 max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-semibold">Camera Calibration</h2>

            {stream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    className="rounded-lg border border-gray-200 w-full max-h-[400px] object-contain bg-black"
                />
            ) : (
                <div className="flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200 w-full h-[300px]">
                    <div className="text-center">
                        <CameraIcon className="mx-auto h-16 w-16 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Camera not enabled</p>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} style={{ display: "none" }} />

            <div className="flex gap-2">
                <Button
                    onClick={startCamera}
                >
                    Start Camera
                </Button>
                <Button
                    onClick={stopCamera}
                >
                    Stop Camera
                </Button>
                <Button
                    onClick={takeSnapshot}
                >
                    Take Picture
                </Button>
                <Button
                    onClick={uploadImages}
                    disabled={calibrating}
                >
                    {calibrating ? "Calibrating..." : "Upload & Calibrate"}
                </Button>
            </div>

            <p>{images.length} image(s) captured</p>

            {result && (
                <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow w-full overflow-x-auto">
                    <h3 className="text-lg font-medium mb-2">Calibration Result</h3>
                    <h4 className="text-sm mb-2">Calibrated Images:</h4>
                    <div className="flex gap-4">
                        {result.visual_results?.map((imgBase64: any, i: number) => (
                            <img
                                key={i}
                                src={`data:image/jpeg;base64,${imgBase64}`}
                                alt={`Calibrated ${i}`}
                                className="rounded shadow max-h-64 object-contain"
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calibration;
