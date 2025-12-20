# 🚀 Quick Start: S3 File Upload for Brands & Categories

## ✅ Setup Complete!

Your Brands and Categories management forms now use AWS S3 for image uploads instead of manual URL entry.

## 📋 Before You Start

### 1. Configure AWS Credentials

Add these environment variables to your `.env.local`:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_BUCKET_NAME=your-bucket-name-here
```

### 2. Set Up S3 Bucket

1. Create an S3 bucket in AWS Console
2. Add CORS configuration:

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

3. (Optional) Make bucket publicly readable:

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

## 🎯 Using the Forms

### Creating a Brand with Logo

1. Navigate to `/admin/brands`
2. Click **"Add Brand"**
3. Fill in:
   - **Name** (required): e.g., "DeWalt"
   - **Website**: e.g., "https://www.dewalt.com"
4. **Upload Logo:**
   - Drag & drop an image, or click to browse
   - Watch the progress bar
   - Wait for "✓ Uploaded successfully"
5. Click **"Create"**
6. Done! The S3 URL is automatically saved

### Creating a Category with Image

1. Navigate to `/admin/categories`
2. Click **"Add Category"**
3. Fill in:
   - **Name** (required): e.g., "Power Tools"
   - **Parent Category**: Select if subcategory
   - **Description**: Brief description
4. **Upload Image:**
   - Drag & drop an image, or click to browse
   - Watch the progress bar
   - Wait for "✓ Uploaded successfully"
5. (Optional) Fill in SEO fields
6. Click **"Create"**
7. Done! The S3 URL is automatically saved

### Editing with Image Replacement

1. Click **Edit** on any brand/category
2. See the **current image preview** at the top
3. To keep existing image: Don't upload anything
4. To replace: Upload a new image (old URL will be replaced)
5. Click **"Update"**

## 🎨 Features

- ✅ **Drag & Drop** - Drop images directly into the upload zone
- ✅ **Progress Tracking** - Real-time upload progress bar
- ✅ **Image Preview** - See what you're uploading
- ✅ **File Validation** - Only images allowed, 5MB max
- ✅ **Error Handling** - Clear error messages if upload fails
- ✅ **Admin Only** - Only admin users can upload

## 🔧 Troubleshooting

### Upload Fails with "Unauthorized"
- Ensure you're logged in as an admin user
- Check your user role in the database: `role = 'admin'`

### Upload Fails with "Forbidden"
- Verify AWS credentials in `.env.local`
- Check IAM user has S3 permissions
- Ensure bucket exists and is accessible

### CORS Error in Browser Console
- Verify CORS configuration in S3 bucket
- Ensure your domain is in `AllowedOrigins`
- Check that `PUT` method is allowed

### Images Don't Display
- Verify bucket policy allows public read
- Check Next.js config includes S3 domain
- Confirm file was uploaded (check S3 console)

### "Invalid folder" Error
- Only these folders are allowed:
  - `brands`
  - `categories`
  - `products`
  - `catalogues`

## 📊 File Organization in S3

Your files will be organized like this:

```
your-bucket-name/
├── brands/
│   ├── a1b2c3d4-dewalt-logo.png
│   ├── e5f6g7h8-bosch-logo.jpg
│   └── ...
├── categories/
│   ├── i9j0k1l2-power-tools.jpg
│   ├── m3n4o5p6-hand-tools.jpg
│   └── ...
└── products/
    └── (for product images)
```

Each file gets a unique UUID prefix to prevent overwrites.

## 🚀 What's Next?

### For Product Management
The same S3 upload system can be integrated into product forms:

```tsx
<FileUpload
  folder="products"
  accept="image/*"
  multiple={true}
  maxFiles={10}
  onUploadComplete={(urls) => {
    setFormData({ ...formData, images: urls });
  }}
/>
```

### For Better Performance
Consider adding:
- **Image optimization** (resize/compress before upload)
- **CloudFront CDN** (faster delivery)
- **Thumbnail generation** (smaller preview images)

## 📚 Documentation

- [S3_UPLOAD_SYSTEM.md](S3_UPLOAD_SYSTEM.md) - Complete technical guide
- [BRANDS_CATEGORIES_S3_UPGRADE.md](BRANDS_CATEGORIES_S3_UPGRADE.md) - Detailed upgrade notes

## ⚡ Tips

1. **Recommended Image Sizes:**
   - Brand logos: 200x200px
   - Category images: 400x300px

2. **File Formats:**
   - Use PNG for logos with transparency
   - Use JPG for photographs
   - Use WebP for modern browsers (best compression)

3. **File Naming:**
   - Original: `DeWalt Logo 2024.png`
   - Stored as: `brands/a1b2c3d4-dewalt-logo-2024.png`

---

**Need Help?** Check the full documentation or review the example code in [src/components/examples/s3-upload-examples.tsx](src/components/examples/s3-upload-examples.tsx)
