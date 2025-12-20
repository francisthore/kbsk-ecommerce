# 🎨 Brands & Categories S3 Upload Integration

Successfully upgraded the Brands and Categories admin forms to use the new S3 File Upload system!

## ✅ What Changed

### 1. **Brand Management** ([admin/brands/page.tsx](src/app/(admin)/admin/brands/page.tsx))
- ❌ **Removed:** Text input for `logo_url`
- ✅ **Added:** `<FileUpload>` component with drag & drop
- 📁 **S3 Folder:** `brands/`
- 🎯 **Features:**
  - Single file upload (logo only)
  - 5MB max file size
  - Image preview when editing existing brands
  - Auto-upload to S3 with presigned URLs
  - Recommended size: 200x200px

### 2. **Category Management** ([admin/categories/page.tsx](src/app/(admin)/admin/categories/page.tsx))
- ❌ **Removed:** Text input for `image_url`
- ✅ **Added:** `<FileUpload>` component with drag & drop
- 📁 **S3 Folder:** `categories/`
- 🎯 **Features:**
  - Single file upload (category image)
  - 5MB max file size
  - Image preview when editing existing categories
  - Auto-upload to S3 with presigned URLs
  - Recommended size: 400x300px

### 3. **S3 Configuration Updates**
- Added `"categories"` to allowed folders in [src/lib/actions/s3.ts](src/lib/actions/s3.ts)
- Updated `FolderType` in [file-upload.tsx](src/components/ui/file-upload.tsx)

## 🔄 How It Works

### Creating a New Brand/Category

```tsx
1. User clicks "Add Brand" or "Add Category"
2. Dialog opens with empty form
3. User drags/drops or clicks to select an image
4. FileUpload component:
   - Calls getPresignedUrl() server action
   - Uploads file to S3 using presigned URL
   - Shows progress bar during upload
   - Returns S3 public URL
5. S3 URL is set in form via setValue()
6. User submits form
7. Server action saves brand/category with S3 URL
```

### Editing an Existing Brand/Category

```tsx
1. User clicks "Edit" on existing item
2. Dialog opens with pre-populated form
3. If image exists, preview is shown above FileUpload
4. User can:
   - Keep existing image (don't upload new one)
   - Upload new image (replaces old one in form state)
5. On submit, new S3 URL (or original URL) is saved
```

## 📝 Code Examples

### Brand Form Integration

```tsx
<FileUpload
  folder="brands"
  accept="image/*"
  multiple={false}
  maxSize={5 * 1024 * 1024} // 5MB
  onUploadComplete={(urls) => {
    if (urls.length > 0) {
      setFormData({ ...formData, logoUrl: urls[0] });
    }
  }}
/>
```

### Category Form Integration

```tsx
<FileUpload
  folder="categories"
  accept="image/*"
  multiple={false}
  maxSize={5 * 1024 * 1024} // 5MB
  onUploadComplete={(urls) => {
    if (urls.length > 0) {
      setFormData({ ...formData, imageUrl: urls[0] });
    }
  }}
/>
```

## 🎯 Key Features Implemented

### 1. **Existing Image Preview**
When editing a brand/category with an existing image, users see a preview card:

```tsx
{brand?.logoUrl && formData.logoUrl === brand.logoUrl && (
  <div className="mb-3 flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
    <Image
      src={brand.logoUrl}
      alt={brand.name}
      width={60}
      height={60}
      className="rounded object-cover"
    />
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-700">Current Logo</p>
      <p className="text-xs text-gray-500 truncate">{brand.logoUrl}</p>
    </div>
  </div>
)}
```

This preview:
- Only shows if editing an existing item
- Disappears when a new image is uploaded
- Shows the actual image from S3

### 2. **Form State Management**
The upload callback updates the form state directly:

```tsx
onUploadComplete={(urls) => {
  if (urls.length > 0) {
    setFormData({ ...formData, logoUrl: urls[0] });
  }
}}
```

This ensures:
- Form validation works correctly
- Submit includes the S3 URL
- No manual URL entry needed

### 3. **Validation**
The existing Zod schemas handle validation:

```typescript
// Brand schema
logoUrl: z
  .string()
  .url("Invalid URL")
  .optional()
  .or(z.literal(""))
  .transform((val) => val || undefined)

// Category schema
imageUrl: z
  .string()
  .url("Invalid URL")
  .optional()
  .or(z.literal(""))
  .transform((val) => val || undefined)
```

This allows:
- Optional images (empty string = no image)
- Valid URL validation
- S3 URLs are automatically valid

## 🔒 Security

### Admin-Only Uploads
All S3 uploads require admin authentication:

```typescript
async function verifyAdmin() {
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    throw new Error("Unauthorized: You must be logged in");
  }
  
  const [dbUser] = await db
    .select({ role: userTable.role })
    .from(userTable)
    .where(eq(userTable.id, currentUser.id))
    .limit(1);

  if (!dbUser || dbUser.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
}
```

### Folder Validation
Only specific folders are allowed:

```typescript
const allowedFolders = ["products", "brands", "categories", "catalogues"];
if (!allowedFolders.includes(folder)) {
  throw new Error(`Invalid folder. Must be one of: ${allowedFolders.join(", ")}`);
}
```

### File Sanitization
Filenames are sanitized and given unique IDs:

```typescript
const sanitizedFileName = sanitizeFileName(fileName);
const uniqueId = uuidv4();
const fileKey = `${folder}/${uniqueId}-${sanitizedFileName}`;
// Example: brands/a1b2c3d4-dewalt-logo.png
```

## 🧪 Testing Checklist

### Brand Form Tests
- [ ] Create new brand with logo upload
- [ ] Create new brand without logo
- [ ] Edit brand without changing logo
- [ ] Edit brand and replace logo with new one
- [ ] Verify logo displays in brands table
- [ ] Verify S3 URL is saved correctly
- [ ] Test error handling (upload failure)
- [ ] Test file size limit (over 5MB)

### Category Form Tests
- [ ] Create new category with image upload
- [ ] Create new category without image
- [ ] Edit category without changing image
- [ ] Edit category and replace image with new one
- [ ] Verify image displays in categories table
- [ ] Verify S3 URL is saved correctly
- [ ] Test error handling (upload failure)
- [ ] Test file size limit (over 5MB)

### Security Tests
- [ ] Non-admin user cannot upload (403 error)
- [ ] Invalid folder names are rejected
- [ ] Only image/* files are accepted
- [ ] File size limits are enforced

## 🚀 Future Enhancements

### 1. **Image Optimization**
Add automatic image resizing before upload:

```tsx
import sharp from 'sharp';

// Resize brand logos to 200x200
const buffer = await sharp(file)
  .resize(200, 200, { fit: 'cover' })
  .webp({ quality: 80 })
  .toBuffer();
```

### 2. **Bulk Upload**
Allow uploading multiple brand logos at once:

```tsx
<FileUpload
  folder="brands"
  multiple={true}
  maxFiles={10}
  onUploadComplete={(urls) => {
    // Process multiple URLs
  }}
/>
```

### 3. **Image Cropper**
Add in-browser image cropping before upload:

```tsx
import Cropper from 'react-easy-crop';

// Allow admins to crop logos to exact size
<Cropper
  image={selectedImage}
  crop={crop}
  aspect={1} // Square for logos
  onCropComplete={onCropComplete}
/>
```

### 4. **Old Image Cleanup**
Automatically delete old images when replaced:

```tsx
// When updating a brand with new logo
if (brand.logoUrl && brand.logoUrl !== newLogoUrl) {
  await deleteFile(extractFileKey(brand.logoUrl));
}
```

### 5. **CDN Integration**
Use CloudFront for faster image delivery:

```typescript
export function getPublicUrl(fileKey: string): string {
  const cdnDomain = process.env.AWS_CLOUDFRONT_DOMAIN;
  return `https://${cdnDomain}/${fileKey}`;
}
```

## 📚 Related Documentation

- [S3 Upload System](S3_UPLOAD_SYSTEM.md) - Complete S3 setup guide
- [FileUpload Component](src/components/ui/file-upload.tsx) - Component source code
- [S3 Server Actions](src/lib/actions/s3.ts) - Presigned URL generation
- [Admin Validations](src/lib/validations/admin.ts) - Form schemas

## 🎓 Learning Resources

- [AWS S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [react-dropzone Documentation](https://react-dropzone.js.org/)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Zod Schema Validation](https://zod.dev/)

---

**✅ Upgrade Complete!** Your Brands and Categories now use modern S3 uploads instead of manual URL entry.
