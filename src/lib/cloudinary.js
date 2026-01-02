export async function uploadSingleFile(file, orderId) {
  if (!file) throw new Error("No file provided");

  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  );
  formData.append("folder", `orders/${orderId}`);

  const resourceType = file.type === "application/pdf" ? "raw" : "image";

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${
      import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    }/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Cloudinary upload failed");
  }

  const data = await res.json();

  return {
    name: data.original_filename,
    url: data.secure_url,
    publicId: data.public_id,
    type: resourceType === "raw" ? "pdf" : "image",
    size: data.bytes,
    format: data.format,
  };
}

export async function uploadFilesToCloudinary(files, orderId) {
  if (!orderId) throw new Error("orderId required");
  if (!files || files.length === 0) throw new Error("No files to upload");

  const uploaded = [];

  for (const file of files) {
    const meta = await uploadSingleFile(file, orderId);
    uploaded.push(meta);
  }

  return uploaded;
}
