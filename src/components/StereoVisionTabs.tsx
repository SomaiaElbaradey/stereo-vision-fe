import { useState } from "react"
import { CameraIcon, ImageIcon, CuboidIcon as Cube3dIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "@radix-ui/react-label"
import { Slider } from "../ui/slider"
import { TabsContent, TabsList, TabsTrigger, Tabs } from "../ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import Calibration from "./Calibration"

export default function StereoVisionTabs() {
    const [featureThreshold, setFeatureThreshold] = useState<number[]>([75])

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
                                <Calibration></Calibration>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="rectify">
                        <Card>
                            <CardHeader>
                                <CardTitle>Image Rectification & Feature Matching</CardTitle>
                                <CardDescription>Rectify images and detect matching features between image pairs.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Button className="w-full">Detect & Match Features</Button>

                                    <div className="flex items-center justify-center bg-gray-100 rounded-lg h-64">
                                        <div className="text-center">
                                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-2 text-sm text-gray-500">Feature matches will appear here</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
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

                                    <Button className="w-full">Generate 3D Model</Button>

                                    <div className="flex items-center justify-center bg-gray-100 rounded-lg h-64">
                                        <div className="text-center">
                                            <Cube3dIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-2 text-sm text-gray-500">3D model preview will appear here</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
