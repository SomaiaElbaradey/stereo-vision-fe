"use client"

import { useRef, useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, StopCircle, ImageIcon, Upload } from "lucide-react"

const CameraCalibration = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [images, setImages] = useState<Blob[]>([])
    const [calibrating, setCalibrating] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [result, setResult] = useState<any>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)

    // Clean up the media stream when component unmounts
    useEffect(() => {
        return () => {
            if (stream) {
                const tracks = stream.getTracks()
                tracks.forEach((track) => track.stop())
            }
        }
    }, [stream])

    // Start the webcam stream
    const startCamera = async () => {
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({ video: true })
            if (videoRef.current) {
                videoRef.current.srcObject = newStream
            }
            setStream(newStream)
        } catch (err) {
            console.error("Failed to access the webcam:", err)
            alert("Failed to access the webcam. Please ensure you have granted camera permissions.")
        }
    }

    // Stop the webcam stream
    const stopCamera = () => {
        if (stream) {
            const tracks = stream.getTracks()
            tracks.forEach((track) => track.stop())
            setStream(null)
            if (videoRef.current) {
                videoRef.current.srcObject = null
            }
        }
    }

    // Take a snapshot
    const takeSnapshot = () => {
        const canvas = canvasRef.current
        const video = videoRef.current

        if (canvas && video) {
            const ctx = canvas.getContext("2d")
            if (!ctx) return

            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

            canvas.toBlob((blob) => {
                if (blob) setImages((prev) => [...prev, blob])
            }, "image/jpeg")
        }
    }

    // Upload captured images to backend
    const uploadImages = async () => {
        if (images.length < 5) {
            alert("Please take at least 5 images of the chessboard for calibration.")
            return
        }

        setCalibrating(true)
        const formData = new FormData()
        images.forEach((img, idx) => {
            formData.append("files", img, `cal${idx}.jpg`)
        })

        try {
            // Update the URL to your backend service
            // For production, consider using environment variables
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
            const res = await axios.post(`${apiUrl}/upload/`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            setResult(res.data)
        } catch (err) {
            console.error("Calibration failed:", err)
            alert("Calibration failed. Please try again.")
        } finally {
            setCalibrating(false)
        }
    }

    // Reset the calibration process
    const resetCalibration = () => {
        setImages([])
        setResult(null)
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Camera Calibration</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
                {/* Video preview */}
                <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {stream ? (
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Camera is not active</p>
                        </div>
                    )}
                </div>

                {/* Hidden canvas for capturing images */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Camera controls */}
                <div className="flex flex-wrap gap-3 justify-center">
                    <Button onClick={startCamera} disabled={!!stream} className="flex items-center gap-2">
                        <Camera size={18} />
                        Start Camera
                    </Button>

                    <Button onClick={stopCamera} disabled={!stream} variant="outline" className="flex items-center gap-2">
                        <StopCircle size={18} />
                        Stop Camera
                    </Button>

                    <Button onClick={takeSnapshot} disabled={!stream} variant="secondary" className="flex items-center gap-2">
                        <ImageIcon size={18} />
                        Take Picture
                    </Button>

                    <Button
                        onClick={uploadImages}
                        disabled={calibrating || images.length < 5}
                        className="flex items-center gap-2"
                    >
                        <Upload size={18} />
                        {calibrating ? "Calibrating..." : "Upload & Calibrate"}
                    </Button>

                    {images.length > 0 && (
                        <Button onClick={resetCalibration} variant="destructive">
                            Reset
                        </Button>
                    )}
                </div>

                {/* Image count */}
                <div className="flex items-center gap-2">
                    <Badge variant={images.length >= 5 ? "success" : "secondary"}>
                        {images.length} image{images.length !== 1 ? "s" : ""} captured
                    </Badge>
                    {images.length < 5 && <span className="text-sm text-gray-500">(Need at least 5 images)</span>}
                </div>

                {/* Calibration results */}
                {result && (
                    <div className="mt-4 w-full bg-gray-50 p-4 rounded-lg shadow">
                        <h3 className="text-lg font-medium mb-3">Calibration Results</h3>

                        <div className="overflow-x-auto">
                            <div className="flex gap-4 pb-2">
                                {result.visual_results?.map((imgBase64: string, i: number) => (
                                    <div key={i} className="min-w-[200px]">
                                        <img
                                            src={`data:image/jpeg;base64,${imgBase64}`}
                                            alt={`Calibrated ${i}`}
                                            className="rounded shadow max-h-64 object-contain"
                                        />
                                        <p className="text-xs text-center mt-1">Result {i + 1}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default CameraCalibration
