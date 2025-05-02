import { useState } from "react"
import { CameraIcon, ImageIcon, CuboidIcon as Cube3dIcon } from "lucide-react"
import { Button } from "../ui/button"
import { TabsContent, TabsList, TabsTrigger, Tabs } from "../ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import Calibration from "./Calibration"
import StereoRectify from "./rectification"
import axios from "axios"
import CompletedExample from "./CompleteExample"
import { BACKEND_API } from "../lib/constats"

export default function StereoVisionTabs() {
    const [calibrationImages, setCalibrationImages] = useState<Blob[]>([])
    const [calibrationResult, setCalibrationResult] = useState<any>(null)

    const [leftBlob, setLeftBlob] = useState<Blob | null>(null)
    const [rightBlob, setRightBlob] = useState<Blob | null>(null)
    const [rectifyResults, setRectifyResults] = useState<{
        // left: string
        // right: string
        matched: string
        pts1: number[][]
        pts2: number[][]
        good_matches: { queryIdx: number; trainIdx: number }[]
    } | null>(null)

    const [geometryResult, setGeometryResult] = useState<{
        E: number[][]
        R: number[][]
        t: number[]
        inlier_pts1: number[][]
        inlier_pts2: number[][]
    } | null>(null)

    const [reconstructionImg, setReconstructionImg] = useState<string | null>(null)
    const [disparityImg, setDisparityImg] = useState<string | null>(null)

    const handleEstimateGeometry = async () => {
        if (!rectifyResults || !calibrationResult) {
            alert("Please complete calibration and rectification first.")
            return
        }

        const { pts1, pts2, good_matches } = rectifyResults
        const { K } = calibrationResult

        if (!pts1.length || !pts2.length || !K) {
            alert("Missing point data or calibration matrix")
            return
        }

        try {
            const res = await axios.post(`${BACKEND_API}/estimate-geometry/`, {
                keypoints1: pts1,
                keypoints2: pts2,
                matches: good_matches,
                K,
            })
            setGeometryResult(res.data)
        } catch (err) {
            console.error(err)
            alert("Failed to estimate geometry.")
        }
    }

    const handleReconstruct3D = async () => {
        if (!geometryResult || !leftBlob || !rightBlob) {
            alert("Geometry estimation and stereo images required.")
            return
        }

        const formData = new FormData()
        formData.append("left", leftBlob, "left.jpg")
        formData.append("right", rightBlob, "right.jpg")
        formData.append("K", JSON.stringify(calibrationResult.K))
        formData.append("R", JSON.stringify(geometryResult.R))
        formData.append("t", JSON.stringify(geometryResult.t))
        formData.append("pts1", JSON.stringify(geometryResult.inlier_pts1))
        formData.append("pts2", JSON.stringify(geometryResult.inlier_pts2))

        try {
            const res = await axios.post(`${BACKEND_API}/reconstruct-3d/`, formData)
            setReconstructionImg(res.data.sparse_point_cloud)
        } catch (err) {
            console.error(err)
            alert("3D reconstruction failed.")
        }
    }

    const handleComputeDisparity = async () => {
        if (!leftBlob || !rightBlob) {
            alert("Please load both left and right images first.")
            return
        }

        const formData = new FormData()
        formData.append("left", leftBlob, "left.jpg")
        formData.append("right", rightBlob, "right.jpg")

        try {
            const res = await axios.post(`${BACKEND_API}/compute-disparity/`, formData)
            // expecting { disparity_map: "<base64_png>" }
            setDisparityImg(res.data.disparity_map)
        } catch (err) {
            console.error(err)
            alert("Disparity computation failed.")
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
                    <TabsList className="grid w-full grid-cols-4 mb-8">
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
                        <TabsTrigger value="example" className="flex items-center gap-2">
                            <Cube3dIcon className="h-4 w-4" />
                            <span>Example</span>
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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Button onClick={handleEstimateGeometry} className="w-full">
                                        Estimate Geometry
                                    </Button>
                                    <Button onClick={handleReconstruct3D} className="w-full">
                                        Generate 3D Model
                                    </Button>
                                    <Button onClick={handleComputeDisparity} className="w-full">
                                        Compute Disparity Map
                                    </Button>
                                </div>

                                {/* Geometry result */}
                                {geometryResult && (
                                    <div className="mt-4 bg-gray-100 p-4 rounded">
                                        <h3 className="font-medium">Estimated Geometry</h3>
                                        <p className="text-sm text-gray-700">
                                            <strong>R:</strong> {JSON.stringify(geometryResult.R)}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            <strong>T:</strong> {JSON.stringify(geometryResult.t)}
                                        </p>
                                    </div>
                                )}

                                {/* Reconstruction image */}
                                {reconstructionImg && (
                                    <div className="mt-4 bg-gray-100 p-4 rounded text-center">
                                        <h3 className="font-medium mb-2">Sparse 3D Reconstruction</h3>
                                        <img
                                            src={`data:image/png;base64,${reconstructionImg}`}
                                            alt="Sparse 3D point cloud"
                                            className="inline-block max-w-full h-auto rounded shadow"
                                        />
                                    </div>
                                )}

                                {/* Disparity map */}
                                {disparityImg && (
                                    <div className="mt-4 bg-gray-100 p-4 rounded text-center">
                                        <h3 className="font-medium mb-2">Disparity Map</h3>
                                        <img
                                            src={`data:image/png;base64,${disparityImg}`}
                                            alt="Disparity map"
                                            className="inline-block max-w-full h-auto rounded shadow"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </TabsContent>

                    <TabsContent value='example'>
                        <CompletedExample />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
