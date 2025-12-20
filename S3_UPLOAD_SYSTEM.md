# 🚀 S3 File Upload System

A complete, production-ready S3 file upload system for Next.js 15 with presigned URLs, admin authentication, and a beautiful drag-and-drop UI.

## 📦 Installed Packages

```json
{
  "@aws-sdk/client-s3": "^3.x",
  "@aws-sdk/s3-request-presigner": "^3.x",
  "react-dropzone": "^14.x",
  "uuid": "^11.x",
  "@types/uuid": "^10.x"
}
```

## 🔐 Environment Variables

Add these to your `.env.local` file:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_BUCKET_NAME=your-bucket-name
```

### AWS S3 Setup

1. **Create an S3 Bucket**
   - Go to AWS Console → S3 → Create bucket
   - Choose a unique bucket name
   - Region: Select your preferred region
   - Block Public Access: **Uncheck** "Block all public access" (we'll use specific permissions)

2. **Configure CORS**
   In your bucket → Permissions → CORS configuration:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

3. **Set Bucket Policy** (Optional - for public read access)
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```

4. **Create IAM User**
   - Go to IAM → Users → Create user
   - Attach policy: `AmazonS3FullAccess` (or create a custom policy)
   - Create access key → Save credentials

## 📁 File Structure

```
src/
├── lib/
│   ├── s3.ts                    # S3 client configuration
│   └── actions/
│       └── s3.ts                # Server actions (presigned URLs, delete)
└── components/
    └── ui/
        └── file-upload.tsx      # Reusable upload component
```

## 🎯 Usage Examples

### Basic Image Upload

```tsx
"use client";

import { FileUpload } from "@/components/ui/file-upload";
import { useState } from "react";

export default function ProductForm() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  return (
    <div>
      <h2>Upload Product Images</h2>
      <FileUpload
        folder="products"
        accept="image/*"
        multiple={true}
        maxFiles={5}
        onUploadComplete={(urls) => {
          console.log("Uploaded URLs:", urls);
          setImageUrls(urls);
        }}
      />
      
      {/* Display uploaded images */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {imageUrls.map((url, index) => (
          <img key={index} src={url} alt={`Upload ${index + 1}`} className="rounded-lg" />
        ))}
      </div>
    </div>
  );
}
```

### PDF Upload (Single File)

```tsx
"use client";

import { FileUpload } from "@/components/ui/file-upload";
import { useState } from "react";

export default function CatalogueUpload() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  return (
    <div>
      <h2>Upload Product Catalogue</h2>
      <FileUpload
        folder="catalogues"
        accept="application/pdf"
        multiple={false}
        maxSize={20 * 1024 * 1024} // 20MB
        onUploadComplete={(urls) => {
          setPdfUrl(urls[0] || null);
        }}
      />
      
      {pdfUrl && (
        <a 
          href={pdfUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 underline mt-4 inline-block"
        >
          View Uploaded PDF
        </a>
      )}
    </div>
  );
}
```

### Brand Logo Upload

```tsx
"use client";

import { FileUpload } from "@/components/ui/file-upload";
import { useState } from "react";
import Image from "next/image";

export default function BrandForm() {
  const [logoUrl, setLogoUrl] = useState<string>("");

  return (
    <div>
      <h2>Upload Brand Logo</h2>
      <FileUpload
        folder="brands"
        accept="image/*"
        multiple={false}
        maxSize={5 * 1024 * 1024} // 5MB
        onUploadComplete={(urls) => {
          setLogoUrl(urls[0] || "");
        }}
      />
      
      {logoUrl && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Preview:</p>
          <Image
            src={logoUrl}
            alt="Brand Logo"
            width={200}
            height={200}
            className="rounded-lg border"
          />
        </div>
      )}
    </div>
  );
}
```

### Integration with React Hook Form

```tsx
"use client";

import { useForm } from "react-hook-form";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";

interface ProductFormData {
  name: string;
  description: string;
  images: string[];
}

export default function ProductForm() {
  const { register, handleSubmit, setValue, watch } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      description: "",
      images: [],
    },
  });

  const images = watch("images");

  const onSubmit = async (data: ProductFormData) => {
    console.log("Form data:", data);
    // Save to database with image URLs
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label>Product Name</label>
        <input {...register("name")} className="border rounded px-3 py-2 w-full" />
      </div>

      <div>
        <label>Description</label>
        <textarea {...register("description")} className="border rounded px-3 py-2 w-full" />
      </div>

      <div>
        <label>Product Images</label>
        <FileUpload
          folder="products"
          accept="image/*"
          multiple={true}
          maxFiles={10}
          onUploadComplete={(urls) => {
            setValue("images", urls);
          }}
        />
      </div>

      <div className="text-sm text-muted-foreground">
        {images.length} image(s) uploaded
      </div>

      <Button type="submit">Create Product</Button>
    </form>
  );
}
```

## 🎨 Component Props

### `<FileUpload />` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `folder` | `"products" \| "brands" \| "catalogues"` | **Required** | S3 folder destination |
| `accept` | `string` | `"image/*"` | File type (MIME type) |
| `multiple` | `boolean` | `true` | Allow multiple files |
| `maxFiles` | `number` | `10` | Maximum number of files |
| `maxSize` | `number` | `10485760` (10MB) | Max file size in bytes |
| `onUploadComplete` | `(urls: string[]) => void` | **Required** | Callback with S3 URLs |
| `className` | `string` | `undefined` | Additional CSS classes |

## 🔒 Security Features

### Admin-Only Access
- Server actions verify user is logged in and has `admin` role
- Unauthorized requests are rejected with descriptive errors

### Input Validation
- Folder names are restricted to allowed values
- File names are sanitized to prevent path traversal
- File keys are validated before deletion

### Unique File Names
- Files are prefixed with UUIDs to prevent overwrites
- Format: `folder/uuid-sanitized-filename.ext`

## ⚡ Features

### 1. **Drag & Drop Interface**
- Beautiful, accessible dropzone
- Visual feedback on drag-over
- Click to browse files

### 2. **Real-Time Progress**
- Progress bar for each file
- Percentage indicator
- Loading states

### 3. **File Previews**
- Image thumbnails for photos
- File icons for PDFs
- File size display

### 4. **Error Handling**
- Toast notifications for success/errors
- Inline error messages
- Graceful failure recovery

### 5. **File Management**
- Remove files before saving
- Automatic S3 cleanup on remove
- Memory leak prevention (URL.revokeObjectURL)

## 🔧 Advanced Usage

### Programmatic File Deletion

```tsx
import { deleteFile } from "@/lib/actions/s3";

async function removeProductImage(fileKey: string) {
  try {
    await deleteFile(fileKey);
    console.log("File deleted successfully");
  } catch (error) {
    console.error("Delete failed:", error);
  }
}
```

### Custom S3 URLs

```tsx
import { getPublicUrl } from "@/lib/s3";

const fileKey = "products/123-uuid-shoe.jpg";
const publicUrl = getPublicUrl(fileKey);
// Returns: https://bucket-name.s3.region.amazonaws.com/products/123-uuid-shoe.jpg
```

### Generate Presigned URL Manually

```tsx
import { getPresignedUrl } from "@/lib/actions/s3";

const { uploadUrl, fileKey, publicUrl } = await getPresignedUrl(
  "my-image.jpg",
  "image/jpeg",
  "products"
);

// Upload file using fetch
await fetch(uploadUrl, {
  method: "PUT",
  body: file,
  headers: {
    "Content-Type": "image/jpeg",
  },
});
```

## 🐛 Troubleshooting

### CORS Errors
- Verify CORS configuration in S3 bucket
- Check that your domain is in `AllowedOrigins`
- Ensure `PUT` method is allowed

### 403 Forbidden
- Verify IAM user has S3 permissions
- Check AWS credentials in `.env.local`
- Ensure presigned URL hasn't expired (5 min default)

### Images Not Loading
- Verify Next.js config includes S3 domain
- Check bucket policy allows public read
- Confirm file was uploaded successfully

### Admin Access Denied
- Verify user has `role: "admin"` in database
- Check Better Auth session is valid
- Review server action error logs

## 🎯 Next Steps

1. **Add Image Optimization**
   - Use Sharp/ImageMagick to resize on upload
   - Generate thumbnails for faster loading

2. **Implement CloudFront CDN**
   - Add CloudFront distribution
   - Update `getPublicUrl()` to use CDN domain

3. **Add File Compression**
   - Compress images before upload
   - Use WebP format for better performance

4. **Implement Upload Queue**
   - Queue large batch uploads
   - Retry failed uploads automatically

5. **Add Metadata Storage**
   - Store file metadata in database
   - Track upload history and user attribution

## 📚 Related Documentation

- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [react-dropzone](https://react-dropzone.js.org/)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)

---

**Built with ❤️ for production-grade file uploads**
