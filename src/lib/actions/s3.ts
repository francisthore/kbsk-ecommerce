"use server";

import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { s3Client, AWS_BUCKET_NAME, getPublicUrl } from "@/lib/s3";
import { getCurrentUser } from "@/lib/auth/actions";
import { db } from "@/lib/db";
import { users as userTable } from "@/lib/db/schema/user";
import { eq } from "drizzle-orm";

/**
 * Verify that the current user is an admin
 */
async function verifyAdmin() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser?.id) {
    throw new Error("Unauthorized: You must be logged in");
  }

  // Fetch user with role from database
  const [dbUser] = await db
    .select({ role: userTable.role })
    .from(userTable)
    .where(eq(userTable.id, currentUser.id))
    .limit(1);

  if (!dbUser || dbUser.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  return currentUser;
}

/**
 * Sanitize filename to prevent path traversal and special characters
 */
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

/**
 * Generate a presigned URL for uploading a file to S3
 * @param fileName - Original file name
 * @param fileType - MIME type of the file
 * @param folder - Destination folder (e.g., "products", "brands", "catalogues")
 * @returns Object containing the upload URL and file key
 */
export async function getPresignedUrl(
  fileName: string,
  fileType: string,
  folder: string
): Promise<{ uploadUrl: string; fileKey: string; publicUrl: string }> {
  // Verify admin access
  await verifyAdmin();

  // Validate inputs
  if (!fileName || !fileType || !folder) {
    throw new Error("Missing required parameters: fileName, fileType, and folder are required");
  }

  // Validate folder to prevent arbitrary paths
  const allowedFolders = ["products", "brands", "categories", "catalogues"];
  if (!allowedFolders.includes(folder)) {
    throw new Error(`Invalid folder. Must be one of: ${allowedFolders.join(", ")}`);
  }

  // Sanitize filename and generate unique key
  const sanitizedFileName = sanitizeFileName(fileName);
  const uniqueId = uuidv4();
  const fileKey = `${folder}/${uniqueId}-${sanitizedFileName}`;

  // Create PUT command
  const command = new PutObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
    // Set Cache-Control for better performance
    CacheControl: "public, max-age=31536000, immutable",
  });

  // Generate presigned URL (valid for 5 minutes)
  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 300,
  });

  // Generate public URL
  const publicUrl = getPublicUrl(fileKey);

  return {
    uploadUrl,
    fileKey,
    publicUrl,
  };
}

/**
 * Delete a file from S3
 * @param fileKey - The S3 object key to delete
 */
export async function deleteFile(fileKey: string): Promise<{ success: boolean }> {
  // Verify admin access
  await verifyAdmin();

  if (!fileKey) {
    throw new Error("File key is required");
  }

  // Validate that fileKey starts with an allowed folder
  const allowedFolders = ["products", "brands", "categories", "catalogues"];
  const startsWithAllowedFolder = allowedFolders.some((folder) =>
    fileKey.startsWith(`${folder}/`)
  );

  if (!startsWithAllowedFolder) {
    throw new Error("Invalid file key: must be in an allowed folder");
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: fileKey,
    });

    await s3Client.send(command);

    return { success: true };
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw new Error("Failed to delete file");
  }
}
