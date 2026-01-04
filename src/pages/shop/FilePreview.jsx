export default function FilePreview({ file }) {
  // PDF preview
  if (file.type === "application/pdf") {
    return (
      <iframe
        src={file.url}
        title={file.name}
        className="w-full h-[520px] rounded-lg border bg-white"
      />
    );
  }

  // Image preview
  if (file.type?.startsWith("image/")) {
    return (
      <img
        src={file.url}
        alt={file.name}
        className="mx-auto max-h-[520px] rounded-lg border bg-white"
      />
    );
  }

  return (
    <div className="text-sm text-gray-500 italic">
      Preview not available for this file type
    </div>
  );
}
