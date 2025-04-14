import CameraCalibration from "@/components/camera-calibration";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6">
      <div className="w-full max-w-3xl">
        <CameraCalibration />
      </div>
    </main>
  )
}
