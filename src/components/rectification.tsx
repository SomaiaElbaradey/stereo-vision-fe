import type React from "react"
import { useRef, useState } from "react"
import axios from "axios"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { CameraIcon } from "lucide-react"

interface StereoRectifyProps {
    leftBlob: Blob | null
    setLeftBlob: React.Dispatch<React.SetStateAction<Blob | null>>
    rightBlob: Blob | null
    setRightBlob: React.Dispatch<React.SetStateAction<Blob | null>>
    results: {
        left: string
        right: string
        matched: string
        pts2: any
        pts1: any
    } | null
    setResults: React.Dispatch<
        React.SetStateAction<{
            left: string
            right: string
            matched: string
            pts2: any
            pts1: any
        } | null>
    >
}

const StereoRectify: React.FC<StereoRectifyProps> = ({
    leftBlob,
    setLeftBlob,
    rightBlob,
    setRightBlob,
    results,
    setResults,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)

    const startCamera = async () => {
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({ video: true })
            if (videoRef.current) {
                videoRef.current.srcObject = newStream
            }
            setStream(newStream)
        } catch (err) {
            console.error(err)
            alert("Failed to access the webcam.")
        }
    }

    const stopCamera = () => {
        if (stream) {
            const tracks = stream.getTracks()
            tracks.forEach((track) => track.stop())
            setStream(null)
        }
    }

    const captureImage = (side: "left" | "right") => {
        const canvas = canvasRef.current
        const video = videoRef.current
        if (!canvas || !video) return

        const ctx = canvas.getContext("2d")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)

        canvas.toBlob((blob) => {
            if (!blob) return
            if (side === "left") setLeftBlob(blob)
            else setRightBlob(blob)
        }, "image/jpeg")
    }

    const handleProcess = async () => {
        if (!leftBlob || !rightBlob) {
            alert("Capture both left and right images.")
            return
        }

        const formData = new FormData()
        formData.append("left", leftBlob, "left.jpg")
        formData.append("right", rightBlob, "right.jpg")

        try {
            const res1 = await axios.post("http://localhost:8000/rectify/", formData)
            const res2 = await axios.post("http://localhost:8000/match-features/", formData)

            setResults({
                left: res1.data.left,
                right: res1.data.right,
                matched: res2.data.matched_image,
                pts1: res2.data.keypoints1,
                pts2: res2.data.keypoints2,
            })
        } catch (err) {
            console.error(err)
            alert("Processing failed.")
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto text-center">
            <Card>
                <CardHeader>
                    <CardTitle>Stereo Rectification & Feature Matching</CardTitle>
                    <CardDescription>Capture stereo images from camera, then rectify and match features.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="flex justify-center gap-6">
                        {stream ? (
                            <video ref={videoRef} autoPlay className="rounded shadow w-96 h-auto" />
                        ) : (
                            <div className="flex items-center justify-center bg-gray-100 rounded-lg w-96 h-[225px]">
                                <div className="text-center">

                                    <CameraIcon className="mx-auto h-16 w-16 text-gray-400" />
                                    <p className="text-sm text-gray-500">Camera not enabled</p>
                                </div>
                            </div>
                        )}
                        <canvas ref={canvasRef} style={{ display: "none" }} />
                    </div>

                    <div className="flex gap-4 justify-center">
                        <Button onClick={startCamera}>Start Camera</Button>
                        <Button onClick={stopCamera}>Stop Camera</Button>
                        <Button onClick={() => captureImage("left")}>Capture Left</Button>
                        <Button onClick={() => captureImage("right")}>Capture Right</Button>
                        <Button onClick={handleProcess} disabled={!leftBlob || !rightBlob}>
                            Rectify & Match
                        </Button>
                    </div>

                    <div className="flex justify-around">
                        <div className="text-sm text-gray-500">Left Image: {leftBlob ? "✅ Captured" : "❌ Not captured"}</div>
                        <div className="text-sm text-gray-500">Right Image: {rightBlob ? "✅ Captured" : "❌ Not captured"}</div>
                    </div>

                    {results && (
                        <div className="mt-8 space-y-8">
                            <div>
                                <h3 className="font-medium mb-2">Rectified Images</h3>
                                <div className="flex gap-4 justify-center">
                                    <img
                                        src={`data:image/jpeg;base64,${results.left}`}
                                        alt="Rectified Left"
                                        className="w-64 rounded shadow"
                                    />
                                    <img
                                        src={`data:image/jpeg;base64,${results.right}`}
                                        alt="Rectified Right"
                                        className="w-64 rounded shadow"
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">Feature Matching</h3>
                                <img
                                    src={`data:image/jpeg;base64,${results.matched}`}
                                    alt="Matched Features"
                                    className="rounded shadow mx-auto w-full max-w-4xl"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default StereoRectify
