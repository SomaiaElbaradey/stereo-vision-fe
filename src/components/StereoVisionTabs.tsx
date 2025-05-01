import { useState } from "react"
import { CameraIcon, ImageIcon, CuboidIcon as Cube3dIcon } from 'lucide-react'
import { Button } from "../ui/button"
import { TabsContent, TabsList, TabsTrigger, Tabs } from "../ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import Calibration from "./Calibration"
import StereoRectify from "./rectification"
import axios from "axios"

export default function StereoVisionTabs() {
    const [calibrationImages, setCalibrationImages] = useState<Blob[]>([])
    const [calibrationResult, setCalibrationResult] = useState<any>(null)

    const [leftBlob, setLeftBlob] = useState<Blob | null>(null)
    const [rightBlob, setRightBlob] = useState<Blob | null>(null)
    const [rectifyResults, setRectifyResults] = useState<{
        left: string;
        right: string;
        matched: string;
        pts2: any
        pts1: any
    } | null>(null)

    const [geometryResult, setGeometryResult] = useState<any>(null)
    const [reconstructionResult, setReconstructionResult] = useState<any>(null)

    const handleEstimateGeometry = async () => {
        if (!rectifyResults || !calibrationResult) {
            alert("Please complete calibration and rectification first.")
            return
        }

        try {
            const pts1 = rectifyResults?.pts1?.flat() || []
            const pts2 = rectifyResults?.pts2?.flat() || []
            const K = calibrationResult?.K?.flat() || []

            console.log(calibrationResult);

            if (!pts1.length || !pts2.length || !K.length) {
                alert("Missing point data or calibration matrix")
                return
            }

            const formData = new FormData()
            pts1.forEach((val: string | Blob) => formData.append("pts1", val.toString()))
            pts2.forEach((val: string | Blob) => formData.append("pts2", val.toString()))
            K.forEach((val: string | Blob) => formData.append("k", val.toString()))

            const res = await axios.post("http://localhost:8000/geometry/", formData)
            setGeometryResult(res.data)
        } catch (err) {
            console.error(err)
            alert("Failed to estimate geometry.")
        }
    }

    const handleReconstruct3D = async () => {
        if (!geometryResult || !leftBlob || !rightBlob) {
            alert("Geometry estimation and stereo capture required.")
            return
        }

        const formData = new FormData()
        formData.append("left_img_file", leftBlob, "left.jpg")
        formData.append("right_img_file", rightBlob, "right.jpg")

        geometryResult.inlier_pts1.flat().forEach((val: string | Blob) => formData.append("pts1", val))
        geometryResult.inlier_pts2.flat().forEach((val: string | Blob) => formData.append("pts2", val))
        geometryResult.R.flat().forEach((val: string | Blob) => formData.append("r", val))
        geometryResult.T.flat().forEach((val: string | Blob) => formData.append("t", val))
        calibrationResult.K.flat().forEach((val: string | Blob) => formData.append("k", val))

        try {
            const res = await axios.post("http://localhost:8000/reconstruct/", formData)
            setReconstructionResult(res.data)
        } catch (err) {
            console.error(err)
            alert("3D reconstruction failed.")
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
            <div className="w-full max-w-4xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Stereo Camera System</h1>
                    <p className="mt-2 text-gray-500">Calibrate, match features, and construct 3D models</p>
                </div>

                <Tabs defaultValue="calibration" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                        <TabsTrigger value="calibration" className="flex items-center gap-2">
                            <CameraIcon className="h-4 w-4" />
                            <span>Calibration</span>
                        </TabsTrigger>
                        <TabsTrigger value="rectify" className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            <span>Rectify & Match</span>
                        </TabsTrigger>
                        <TabsTrigger value="construction" className="flex items-center gap-2">
                            <Cube3dIcon className="h-4 w-4" />
                            <span>3D Construction</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="calibration">
                        <Card>
                            <CardHeader>
                                <CardTitle>Camera Calibration</CardTitle>
                                <CardDescription>
                                    Calibrate your camera to correct for lens distortion and establish intrinsic parameters.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Calibration
                                    images={calibrationImages}
                                    setImages={setCalibrationImages}
                                    result={calibrationResult}
                                    setResult={setCalibrationResult}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="rectify">
                        <StereoRectify
                            leftBlob={leftBlob}
                            setLeftBlob={setLeftBlob}
                            rightBlob={rightBlob}
                            setRightBlob={setRightBlob}
                            results={rectifyResults}
                            setResults={setRectifyResults}
                        />
                    </TabsContent>

                    <TabsContent value="construction">
                        <Card>
                            <CardHeader>
                                <CardTitle>3D Construction</CardTitle>
                                <CardDescription>
                                    Generate 3D point clouds and models from calibrated and matched images.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Button onClick={handleEstimateGeometry} className="w-full">Estimate Geometry</Button>
                                    <Button onClick={handleReconstruct3D} className="w-full">Generate 3D Model</Button>
                                </div>

                                {geometryResult && (
                                    <div className="mt-4 bg-gray-100 p-4 rounded">
                                        <h3 className="font-medium">Estimated Geometry</h3>
                                        <p className="text-sm text-gray-700">R: {JSON.stringify(geometryResult.R)}</p>
                                        <p className="text-sm text-gray-700">T: {JSON.stringify(geometryResult.T)}</p>
                                    </div>
                                )}

                                {reconstructionResult && (
                                    <div className="mt-4 bg-gray-100 p-4 rounded">
                                        <h3 className="font-medium">3D Points (first 5)</h3>
                                        <pre className="text-xs overflow-x-auto">
                                            {JSON.stringify(reconstructionResult.points.slice(0, 5), null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
