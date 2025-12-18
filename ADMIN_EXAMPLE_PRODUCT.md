# 📝 Example: Creating Your First Product

This guide walks you through creating a complete product with variants using the admin dashboard.

---

## 🎯 Scenario: Creating a Power Drill Product

We'll create a "DeWalt 20V Cordless Drill" with multiple variants based on:
- **Battery Size**: 2.0Ah, 4.0Ah, 5.0Ah
- **Kit Type**: Tool Only, With Battery, Kit with 2 Batteries

This will auto-generate **9 variants** (3 × 3 combinations).

---

## Step 1: Access the Admin Panel

1. **Login** as an admin user
2. Navigate to: `http://localhost:3000/admin`
3. Click **"Products"** in the sidebar
4. Click **"Add Product"** button

---

## Step 2: Fill Basic Information

### **Product Name**
```
DeWalt 20V MAX Cordless Drill/Driver
```
*Slug auto-generates to:* `dewalt-20v-max-cordless-drill-driver`

### **Description**
```
Professional-grade cordless drill with 2-speed transmission (0-450/0-1500 RPM) 
and 1/2-inch ratcheting chuck. Delivers 300 unit watts out (UWO) of power with 
compact and lightweight design. Includes LED work light and belt hook.
```

### **Category**
Select: `Power Tools`

### **Brand**
Select: `DeWalt`

### **Product Type**
Select: `Tool`

---

## Step 3: Add Product Images

Click **"Add Image"** for each image:

```
Image 1 (Primary):
URL: /products/dewalt-drill-main.jpg
Alt Text: DeWalt 20V cordless drill front view

Image 2:
URL: /products/dewalt-drill-side.jpg
Alt Text: DeWalt cordless drill side angle

Image 3:
URL: /products/dewalt-drill-action.jpg
Alt Text: DeWalt drill in use on job site

Image 4:
URL: /products/dewalt-drill-kit.jpg
Alt Text: Complete DeWalt drill kit with batteries and case
```

---

## Step 4: Add Variant Options

### **Option Group 1: Battery Size**

Click **"Add Option Group"**

```
Option Name: Battery Size

Values:
- 2.0Ah Compact
- 4.0Ah Standard
- 5.0Ah Extended
```

### **Option Group 2: Kit Configuration**

Click **"Add Option Group"**

```
Option Name: Kit Configuration

Values:
- Tool Only
- With 1 Battery & Charger
- Kit with 2 Batteries, Charger & Bag
```

---

## Step 5: Review Auto-Generated Variants

The system automatically generates **9 variants**:

| SKU | Battery | Kit Config | Base Price |
|-----|---------|------------|------------|
| DEW-2C-TO-a1b2 | 2.0Ah Compact | Tool Only | *Fill in* |
| DEW-2C-W1-a1b3 | 2.0Ah Compact | With 1 Battery & Charger | *Fill in* |
| DEW-2C-KI-a1b4 | 2.0Ah Compact | Kit with 2 Batteries... | *Fill in* |
| DEW-4S-TO-a1b5 | 4.0Ah Standard | Tool Only | *Fill in* |
| DEW-4S-W1-a1b6 | 4.0Ah Standard | With 1 Battery & Charger | *Fill in* |
| DEW-4S-KI-a1b7 | 4.0Ah Standard | Kit with 2 Batteries... | *Fill in* |
| DEW-5E-TO-a1b8 | 5.0Ah Extended | Tool Only | *Fill in* |
| DEW-5E-W1-a1b9 | 5.0Ah Extended | With 1 Battery & Charger | *Fill in* |
| DEW-5E-KI-a1c0 | 5.0Ah Extended | Kit with 2 Batteries... | *Fill in* |

---

## Step 6: Set Pricing and Stock

Fill in the auto-generated table:

### **Pricing Strategy Example:**

```
| SKU | Price | Sale Price | Stock |
|-----|-------|------------|-------|
| DEW-2C-TO-a1b2 | 99.00  | 89.99  | 50 |
| DEW-2C-W1-a1b3 | 149.00 | 139.99 | 30 |
| DEW-2C-KI-a1b4 | 229.00 | 199.99 | 20 |
| DEW-4S-TO-a1b5 | 129.00 | 119.99 | 45 |
| DEW-4S-W1-a1b6 | 199.00 | 179.99 | 35 |
| DEW-4S-KI-a1b7 | 279.00 | 249.99 | 15 |
| DEW-5E-TO-a1b8 | 149.00 | 139.99 | 40 |
| DEW-5E-W1-a1b9 | 229.00 | 209.99 | 25 |
| DEW-5E-KI-a1c0 | 329.00 | 299.99 | 10 |
```

**Pricing Logic:**
- Tool Only = Base price
- With 1 Battery = +$50
- Kit = +$130 (2 batteries + charger + bag)
- Larger batteries add $30-50 premium

---

## Step 7: Publishing Options

Check these boxes:

```
☑️ Publish immediately
☐ Hazardous materials (not applicable)
```

---

## Step 8: Submit

Click **"Create Product"**

The system will:
1. ✅ Validate all fields
2. ✅ Check slug uniqueness
3. ✅ Create database transaction:
   - Insert product
   - Insert 4 images
   - Create 2 option groups
   - Create 6 option values
   - Insert 9 variants
   - Link option assignments
4. ✅ Revalidate cache
5. ✅ Redirect to product list

---

## Step 9: Verify Creation

Navigate to: `/admin/products`

You should see:
- **Product Name**: DeWalt 20V MAX Cordless Drill/Driver
- **Category**: Power Tools
- **Brand**: DeWalt
- **Price**: $99.00 (lowest variant)
- **Stock**: 50 (first variant)
- **Status**: 🟢 Published

---

## 🎨 What Customers See

On the shop page, customers will see:

```
DeWalt 20V MAX Cordless Drill/Driver

Starting at $89.99 (Sale Price - was $99.00)

[Product Image Gallery]

Select Battery Size:
○ 2.0Ah Compact
○ 4.0Ah Standard
○ 5.0Ah Extended

Select Kit Configuration:
○ Tool Only - $89.99
○ With 1 Battery & Charger - $139.99
○ Kit with 2 Batteries, Charger & Bag - $199.99

[Add to Cart]
```

Price updates dynamically based on selected variant combination!

---

## 🔄 Alternative: Simple Product (No Variants)

If you want a product with **NO variants** (e.g., a single wrench):

### **Skip Variant Options**
Don't add any option groups.

### **Fill Single Variant**
The form will show **1 variant** by default:

```
SKU: WRE-123abc
Price: 24.99
Sale Price: (leave empty)
Stock: 100
```

### **Submit**
Product created with single variant!

---

## 📊 Advanced Example: T-Shirt with 3 Options

For even more complex products:

**Options:**
- **Color**: Red, Blue, Green, Black (4 values)
- **Size**: XS, S, M, L, XL, XXL (6 values)
- **Fit**: Regular, Slim, Relaxed (3 values)

**Result:** 4 × 6 × 3 = **72 variants auto-generated!**

You can then:
- Set different prices per size (XL/XXL cost more)
- Mark some combinations as out of stock
- Add sale prices to specific colors

---

## ✨ Pro Tips

### **1. Use Descriptive Option Names**
❌ Bad: "Type 1", "Type 2"  
✅ Good: "Tool Only", "With Battery & Charger"

### **2. Order Options Logically**
Put the most important differentiator first:
1. Battery Size (major price difference)
2. Kit Configuration (secondary choice)

### **3. Set Realistic Stock Levels**
Don't over-promise. Set conservative stock and update regularly.

### **4. Use Sale Prices Strategically**
- Promote slow-moving variants with deeper discounts
- Use time-limited sales to create urgency

### **5. Fill SEO Fields**
```
Meta Title: DeWalt 20V Cordless Drill - Professional Grade | Your Store
Meta Description: Professional DeWalt 20V MAX cordless drill with 300 UWO 
power. Available in multiple battery sizes and kit configurations. Free 
shipping over $50.
```

---

## 🐛 Common Mistakes

### **Mistake 1: Forgetting Images**
❌ "At least one product image is required"  
✅ Always add at least 1 image URL

### **Mistake 2: Invalid Prices**
❌ "Price must be a valid positive number"  
✅ Use format: `99.00` or `99.99` (no $ symbol)

### **Mistake 3: Duplicate SKUs**
❌ "All variant SKUs must be unique"  
✅ Let the system auto-generate SKUs

### **Mistake 4: Sale Price Higher Than Price**
❌ "Sale price must be less than regular price"  
✅ Sale Price: $89.99, Price: $99.00

---

## 📈 Next Steps

After creating your first product:

1. **View on Shop** - Navigate to `/shop` to see it live
2. **Test Cart** - Add variants to cart and test checkout
3. **Create More Products** - Build out your catalog
4. **Monitor Stock** - Update inventory as sales occur
5. **Analyze Performance** - Track which variants sell best

---

**Happy Selling! 🚀**
