"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { X, Upload, File, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { getPresignedUrl, deleteFile } from "@/lib/actions/s3";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type FolderType = "products" | "brands" | "categories" | "catalogues";

interface FileUploadProps {
  folder: FolderType;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  onUploadComplete: (urls: string[]) => void;
  className?: string;
}

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  fileKey?: string;
  publicUrl?: string;
}

export function FileUpload({
  folder,
  accept = "image/*",
  multiple = true,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB default
  onUploadComplete,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const uploadFile = async (fileObj: UploadedFile) => {
    try {
      // Mark as uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id ? { ...f, uploading: true, progress: 0 } : f
        )
      );

      // Get presigned URL from server
      const { uploadUrl, fileKey, publicUrl } = await getPresignedUrl(
        fileObj.file.name,
        fileObj.file.type,
        folder
      );

      // Upload to S3 with progress tracking
      await uploadToS3(uploadUrl, fileObj.file, fileObj.id, fileObj.file.type);

      // Mark as uploaded
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id
            ? {
                ...f,
                uploading: false,
                uploaded: true,
                progress: 100,
                fileKey,
                publicUrl,
              }
            : f
        )
      );

      // Notify parent component immediately with the URL we have
      onUploadComplete([publicUrl]);

      toast.success(`${fileObj.file.name} uploaded successfully`);
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id
            ? { ...f, uploading: false, uploaded: false, error: errorMessage }
            : f
        )
      );

      toast.error(`Failed to upload ${fileObj.file.name}: ${errorMessage}`);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Check if we've exceeded max files
      if (!multiple && acceptedFiles.length > 1) {
        toast.error("Only one file is allowed");
        return;
      }

      const totalFiles = files.length + acceptedFiles.length;
      if (totalFiles > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Create file objects with preview
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
        progress: 0,
        uploading: false,
        uploaded: false,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Start uploading each file
      for (const fileObj of newFiles) {
        await uploadFile(fileObj);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files, multiple, maxFiles, folder, onUploadComplete]
  );

  const uploadToS3 = async (
    uploadUrl: string,
    file: File,
    fileId: string,
    contentType: string
  ) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, progress: percentComplete } : f
            )
          );
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload cancelled"));
      });

      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", contentType);
      xhr.send(file);
    });
  };

  const removeFile = async (fileId: string) => {
    const fileToRemove = files.find((f) => f.id === fileId);
    
    if (!fileToRemove) return;

    // If file was uploaded to S3, delete it
    if (fileToRemove.uploaded && fileToRemove.fileKey) {
      try {
        await deleteFile(fileToRemove.fileKey);
        toast.success("File deleted successfully");
      } catch (error) {
        console.error("Failed to delete file:", error);
        toast.error("Failed to delete file from storage");
      }
    }

    // Revoke object URL to prevent memory leaks
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    // Remove from state
    setFiles((prev) => prev.filter((f) => f.id !== fileId));

    // Update parent with remaining URLs
    const remainingUrls = files
      .filter((f) => f.uploaded && f.id !== fileId)
      .map((f) => f.publicUrl)
      .filter(Boolean) as string[];
    
    onUploadComplete(remainingUrls);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept === "image/*" ? { "image/*": [] } : { "application/pdf": [] },
    multiple,
    maxSize,
    disabled: !multiple && files.length >= 1,
  });

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          (!multiple && files.length >= 1) && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        {isDragActive ? (
          <p className="text-sm text-muted-foreground">Drop files here...</p>
        ) : (
          <div>
            <p className="text-sm font-medium mb-1">
              Drag & drop files here, or click to select
            </p>
            <p className="text-xs text-muted-foreground">
              {accept === "image/*" ? "Images" : "PDFs"} up to{" "}
              {Math.round(maxSize / 1024 / 1024)}MB
              {multiple && ` (max ${maxFiles} files)`}
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileObj) => (
            <div
              key={fileObj.id}
              className="flex items-center gap-3 p-3 border rounded-lg bg-card"
            >
              {/* Preview or Icon */}
              <div className="flex-shrink-0">
                {fileObj.preview ? (
                  <Image
                    src={fileObj.preview}
                    alt={fileObj.file.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 object-cover rounded"
                  />
                ) : (
                  <div className="h-12 w-12 flex items-center justify-center bg-muted rounded">
                    <File className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {fileObj.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(fileObj.file.size / 1024).toFixed(1)} KB
                </p>

                {/* Progress Bar */}
                {fileObj.uploading && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${fileObj.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {fileObj.progress}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Success/Error Message */}
                {fileObj.uploaded && (
                  <p className="text-xs text-[var(--color-success)] dark:text-[var(--color-success)] mt-1">
                    ✓ Uploaded successfully
                  </p>
                )}
                {fileObj.error && (
                  <p className="text-xs text-destructive mt-1">
                    ✗ {fileObj.error}
                  </p>
                )}
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFile(fileObj.id)}
                disabled={fileObj.uploading}
                className="flex-shrink-0"
              >
                {fileObj.uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
