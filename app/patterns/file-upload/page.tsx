import { PatternDetail } from "@/components/showcase/pattern-detail"
import { FILE_UPLOAD_SAMPLES } from "@/components/patterns/file-upload-samples"

export default function FileUploadPatternsPage() {
  return <PatternDetail slug="file-upload" samples={FILE_UPLOAD_SAMPLES} />
}
