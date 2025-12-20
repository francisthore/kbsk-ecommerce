/**
 * S3 File Upload - Example Usage Component
 * 
 * This file demonstrates various ways to use the FileUpload component
 * in your Next.js application. Copy and modify these examples as needed.
 */

"use client";

import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";

// ============================================================================
// Example 1: Basic Product Image Upload
// ============================================================================
export function ProductImageUploadExample() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <h3 className="text-lg font-semibold">Product Images</h3>
      
      <FileUpload
        folder="products"
        accept="image/*"
        multiple={true}
        maxFiles={5}
        onUploadComplete={(urls) => {
          setImageUrls(urls);
        }}
      />

      {/* Display uploaded images */}
      {imageUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative aspect-square">
              <Image
                src={url}
                alt={`Product ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 2: Single Brand Logo Upload
// ============================================================================
export function BrandLogoUploadExample() {
  const [logoUrl, setLogoUrl] = useState<string>("");

  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <h3 className="text-lg font-semibold">Brand Logo</h3>
      
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
        <div className="flex items-center gap-4">
          <Image
            src={logoUrl}
            alt="Brand Logo"
            width={100}
            height={100}
            className="rounded-lg border"
          />
          <div>
            <p className="text-sm font-medium">Logo uploaded!</p>
            <a
              href={logoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              View full size
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 3: PDF Catalogue Upload
// ============================================================================
export function CatalogueUploadExample() {
  const [pdfUrl, setPdfUrl] = useState<string>("");

  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <h3 className="text-lg font-semibold">Product Catalogue (PDF)</h3>
      
      <FileUpload
        folder="catalogues"
        accept="application/pdf"
        multiple={false}
        maxSize={20 * 1024 * 1024} // 20MB
        onUploadComplete={(urls) => {
          setPdfUrl(urls[0] || "");
        }}
      />

      {pdfUrl && (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <div className="flex-1">
            <p className="text-sm font-medium">PDF uploaded successfully</p>
            <p className="text-xs text-muted-foreground">{pdfUrl}</p>
          </div>
          <Button asChild size="sm">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              Open PDF
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 4: Complete Form with Image Upload
// ============================================================================
interface ProductFormData {
  name: string;
  description: string;
  price: number;
  images: string[];
}

export function CompleteProductFormExample() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    images: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Submitting product:", formData);
    
    // Here you would:
    // 1. Validate form data
    // 2. Call your API/server action to save the product
    // 3. Include the image URLs from S3
    
    // Example:
    // await createProduct({
    //   name: formData.name,
    //   description: formData.description,
    //   price: formData.price,
    //   images: formData.images,
    // });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 border rounded-lg">
      <h3 className="text-lg font-semibold">Create New Product</h3>

      <div>
        <label className="text-sm font-medium">Product Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full mt-1 px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full mt-1 px-3 py-2 border rounded-md"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Price</label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
          className="w-full mt-1 px-3 py-2 border rounded-md"
          step="0.01"
          min="0"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Product Images</label>
        <FileUpload
          folder="products"
          accept="image/*"
          multiple={true}
          maxFiles={10}
          onUploadComplete={(urls) => {
            setFormData({ ...formData, images: urls });
          }}
        />
        <p className="text-xs text-muted-foreground mt-2">
          {formData.images.length} image(s) uploaded
        </p>
      </div>

      <Button type="submit" disabled={formData.images.length === 0}>
        Create Product
      </Button>
    </form>
  );
}

// ============================================================================
// Example 5: All Examples in One Page (Demo)
// ============================================================================
export function S3UploadExamplesPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">S3 File Upload Examples</h1>
        <p className="text-muted-foreground">
          Demonstrating various use cases for the FileUpload component
        </p>
      </div>

      <ProductImageUploadExample />
      <BrandLogoUploadExample />
      <CatalogueUploadExample />
      <CompleteProductFormExample />
    </div>
  );
}
