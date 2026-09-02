import FaceVerificationCapture from "../../components/FaceVerificationCapture";

function FaceVerificationTestPage() {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
            Temporary test page
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Face Verification Capture Test
          </h1>
        </div>

        <div className="flex justify-center">
          <FaceVerificationCapture />
        </div>
      </div>
    </div>
  );
}

export default FaceVerificationTestPage;
