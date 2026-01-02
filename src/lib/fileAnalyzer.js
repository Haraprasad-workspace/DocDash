import { getPdfPageCount } from "./pdf";

export async function analyzeFiles(files) {
  if (!files || files.length === 0) {
    throw new Error("No files provided");
  }

  let totalPages = 0;
  const filesMeta = [];

  for (const file of files) {
    let pages = 1;
    let type = "image";

    if (file.type === "application/pdf") {
      pages = await getPdfPageCount(file);
      type = "pdf";
    } else if (file.type.startsWith("image/")) {
      pages = 1;
      type = "image";
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }

    totalPages += pages;

    filesMeta.push({
      originalName: file.name,
      mimeType: file.type,
      type,
      pages,
      size: file.size,
    });
  }

  return {
    totalPages,
    filesMeta,
  };
}
