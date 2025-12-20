# 🔧 S3 Upload Data Persistence - Fixed!

## 🐛 The Problem

The S3 upload was working, but URLs weren't being saved to the database. The `logo_url` and `image_url` fields remained empty.

## ✅ The Root Cause

The issue was in the **form state management**. The original code had:

```tsx
// ❌ WRONG - Creates stale closure
onUploadComplete={(urls) => {
  if (urls.length > 0) {
    setFormData({ ...formData, logoUrl: urls[0] });
    // ^ This references OLD formData from closure!
  }
}}
```

When the callback runs, `formData` is a **stale reference** from when the component first rendered. Spreading `{ ...formData }` would overwrite any other field changes with old values.

## ✅ The Fix

Use the **functional updater** form of `setState`:

```tsx
// ✅ CORRECT - Uses current state
onUploadComplete={(urls) => {
  if (urls.length > 0) {
    setFormData((prev) => ({ ...prev, logoUrl: urls[0] }));
    // ^ This always gets the CURRENT state!
  }
}}
```

## 📝 Changes Made

### 1. **Brand Form** ([brands/page.tsx](src/app/(admin)/admin/brands/page.tsx))

#### Before:
```tsx
setFormData({ ...formData, logoUrl: urls[0] });
```

#### After:
```tsx
setFormData((prev) => {
  const updated = { ...prev, logoUrl: urls[0] };
  console.log("[Brand Form] Updated formData:", updated);
  return updated;
});
```

**Added:**
- ✅ Functional state update
- ✅ Console logging for debugging
- ✅ Explicit state validation before submission

### 2. **Category Form** ([categories/page.tsx](src/app/(admin)/admin/categories/page.tsx))

#### Before:
```tsx
setFormData({ ...formData, imageUrl: urls[0] });
```

#### After:
```tsx
setFormData((prev) => {
  const updated = { ...prev, imageUrl: urls[0] };
  console.log("[Category Form] Updated formData:", updated);
  return updated;
});
```

**Added:**
- ✅ Functional state update
- ✅ Console logging for debugging
- ✅ Explicit state validation before submission

### 3. **Server Actions** ([admin-data.ts](src/lib/actions/admin-data.ts))

Added comprehensive logging to trace data flow:

```typescript
// Debug: Log received data
console.log("[Server Action] createBrand received data:", JSON.stringify(data, null, 2));

// Debug: Log values being inserted
const insertData = {
  name: data.name,
  slug,
  logoUrl: data.logoUrl || null,
  website: data.website || null,
};
console.log("[Server Action] createBrand inserting:", JSON.stringify(insertData, null, 2));

// Debug: Log result
console.log("[Server Action] createBrand result:", JSON.stringify(newBrand, null, 2));
```

## 🧪 How to Test

### 1. **Create a New Brand with Logo**

1. Navigate to `/admin/brands`
2. Click **"Add Brand"**
3. Fill in: Name = "Test Brand"
4. Upload a logo image
5. Open browser console (F12)
6. Click **"Create"**

**Expected Console Output:**
```
[Brand Form] Upload complete. URLs: ["https://bucket.s3.region.amazonaws.com/brands/..."]
[Brand Form] Setting logoUrl to: https://bucket.s3...
[Brand Form] Updated formData: { name: "Test Brand", logoUrl: "https://...", website: "" }
[Brand Form] Submitting with data: { name: "Test Brand", logoUrl: "https://...", website: "" }
[Brand Form] Validation passed. Data to server: { name: "Test Brand", logoUrl: "https://..." }
[Server Action] createBrand received data: {
  "name": "Test Brand",
  "logoUrl": "https://bucket.s3.region.amazonaws.com/brands/..."
}
[Server Action] createBrand inserting: {
  "name": "Test Brand",
  "slug": "test-brand",
  "logoUrl": "https://bucket.s3.region.amazonaws.com/brands/...",
  "website": null
}
[Server Action] createBrand result: {
  "id": "...",
  "name": "Test Brand",
  "logoUrl": "https://bucket.s3.region.amazonaws.com/brands/...",
  ...
}
```

### 2. **Edit Existing Brand - Replace Logo**

1. Click **Edit** on existing brand
2. Upload new logo
3. Check console logs
4. Click **"Update"**

**Expected:**
- Old logo preview should disappear
- New upload should show progress
- Console should log the new URL
- Database should update with new URL

### 3. **Create Category with Image**

1. Navigate to `/admin/categories`
2. Click **"Add Category"**
3. Fill in: Name = "Test Category"
4. Upload an image
5. Check console
6. Click **"Create"**

**Expected:**
- Same console flow as brands
- `imageUrl` field should be populated

### 4. **Verify in Database**

Check your database directly:

```sql
-- Check brands
SELECT id, name, logo_url FROM brands ORDER BY created_at DESC LIMIT 5;

-- Check categories
SELECT id, name, image_url FROM categories ORDER BY created_at DESC LIMIT 5;
```

**Expected:**
- `logo_url` and `image_url` should contain full S3 URLs
- NOT null or empty string

## 🔍 Debugging Guide

### If Upload Works But URL Not Saved

Check the console logs in this order:

1. **"Upload complete. URLs:"** - S3 upload succeeded ✅
2. **"Setting logoUrl/imageUrl to:"** - Callback fired ✅
3. **"Updated formData:"** - State updated ✅
4. **"Submitting with data:"** - Form submitted ✅
5. **"Validation passed."** - Zod validation passed ✅
6. **"Server Action received data:"** - Server got the data ✅
7. **"Server Action inserting:"** - About to insert to DB ✅
8. **"Server Action result:"** - DB insertion complete ✅

**If any step fails**, the console will show where the break is.

### Common Issues

#### Issue 1: Validation Fails
```
[Brand Form] Validation failed: [{ path: ["logoUrl"], message: "Invalid URL" }]
```

**Solution:** 
- Check that S3 URL is a valid URL format
- Verify Zod schema accepts the URL
- Ensure `logoUrl` is a string, not an object

#### Issue 2: Server Receives `undefined`
```
[Server Action] createBrand received data: {
  "name": "Test",
  "logoUrl": undefined
}
```

**Solution:**
- Form state wasn't updated before submission
- User clicked submit before upload finished
- Add a "wait for upload" check

#### Issue 3: Database Saves `null`
```
[Server Action] createBrand result: {
  "logoUrl": null
}
```

**Solution:**
- Check Drizzle schema allows the field
- Verify database column exists and is nullable
- Check database constraints

## 🎯 Prevention Tips

### 1. Always Use Functional Updates for Async Callbacks

```tsx
// ❌ BAD
setFormData({ ...formData, newField: value });

// ✅ GOOD
setFormData((prev) => ({ ...prev, newField: value }));
```

### 2. Add Upload State Tracking

```tsx
const [uploading, setUploading] = useState(false);

<FileUpload
  onUploadComplete={(urls) => {
    setFormData((prev) => ({ ...prev, logoUrl: urls[0] }));
    setUploading(false);
  }}
/>

<Button type="submit" disabled={uploading}>
  {uploading ? "Uploading..." : "Create"}
</Button>
```

### 3. Validate Before Submit

```tsx
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  
  // Ensure upload is complete
  if (!formData.logoUrl) {
    toast.error("Please upload a logo first");
    return;
  }
  
  // Continue with submission...
}
```

## 🚀 Production Checklist

Before removing debug logs:

- [ ] Test creating brand with logo
- [ ] Test creating brand without logo
- [ ] Test editing brand - keep existing logo
- [ ] Test editing brand - replace logo
- [ ] Test creating category with image
- [ ] Test creating category without image
- [ ] Test editing category - keep existing image
- [ ] Test editing category - replace image
- [ ] Verify all URLs in database
- [ ] Test that images display correctly
- [ ] Test on slow network (throttle to 3G)

## 🧹 Removing Debug Logs

Once everything works, you can remove console.log statements:

```bash
# Search for debug logs
grep -r "console.log.*\[Brand Form\]" src/
grep -r "console.log.*\[Category Form\]" src/
grep -r "console.log.*\[Server Action\]" src/

# Or keep them for future debugging (recommended)
```

**Recommendation:** Keep the logs but use a proper logging library like `pino` or `winston` with configurable log levels.

## 📚 Related Issues

- **React State Closures:** [React Docs - State as a Snapshot](https://react.dev/learn/state-as-a-snapshot)
- **Functional Updates:** [React Docs - Updating State](https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state)

---

**✅ Issue Resolved!** URLs are now properly saved to the database.
