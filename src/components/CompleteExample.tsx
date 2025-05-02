import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

import cali from "../assets/calibration.png"

import sampleLeft from "../assets/match.png"
import sampleDisparity from "../assets/disparity.png"
import sampleReconstruction from "../assets/3dmodel.png"

export default function CompletedExample() {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Precomputed Example</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="text-sm font-medium">Calibration</h4>
                    <img src={cali} alt="Example Left" className="w-full mt-2 rounded shadow" />
                </div>

                <div>
                    <h4 className="text-sm font-medium">Left / Right Rectification and Matchings</h4>
                    <img src={sampleLeft} alt="Example Left" className="w-full mt-2 rounded shadow" />
                </div>

                <div>
                    <h4 className="text-sm font-medium">Disparity Map</h4>
                    <img
                        src={sampleDisparity}
                        alt="Example Disparity"
                        className="w-full mt-2 rounded shadow"
                    />
                </div>

                <div>
                    <h4 className="text-sm font-medium">Sparse 3D Reconstruction</h4>
                    <img
                        src={sampleReconstruction}
                        alt="Example 3D Reconstruction"
                        className="w-full mt-2 rounded shadow"
                    />
                </div>
            </CardContent>
        </Card>
    )
}
