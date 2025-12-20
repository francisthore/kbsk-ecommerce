import { S3Client } from "@aws-sdk/client-s3";

// Validate environment variables
if (!process.env.AWS_REGION) {
  throw new Error("AWS_REGION is required");
}
if (!process.env.AWS_ACCESS_KEY_ID) {
  throw new Error("AWS_ACCESS_KEY_ID is required");
}
if (!process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error("AWS_SECRET_ACCESS_KEY is required");
}
if (!process.env.AWS_BUCKET_NAME) {
  throw new Error("AWS_BUCKET_NAME is required");
}

// Configure S3 client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
export const AWS_REGION = process.env.AWS_REGION;

// Utility function to get the public URL of an uploaded file
export function getPublicUrl(fileKey: string): string {
  return `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fileKey}`;
}
