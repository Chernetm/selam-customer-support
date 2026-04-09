/**
 * Helper to upload a file to Cloudinary.
 * Used for chat attachments (images, audio).
 */
export async function uploadToCloudinary(file: File) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dy5a4ffba";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "chat_upload";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const isAudio = file.type.startsWith("audio");
  const resourceType = isAudio ? "video" : "image";

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const errorData = await res.json();
    console.error("Cloudinary Error:", errorData);
    throw new Error("Cloudinary upload failed");
  }

  return await res.json(); // secure_url, public_id, duration
}
