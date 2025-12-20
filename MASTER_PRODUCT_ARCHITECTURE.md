# 🏗️ Master Product Creation Flow - Architecture Diagram

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Browser)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │         MasterProductCreateForm.tsx (Client Component)       │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │  React Hook Form + Zod Resolver                              │   │
│  │  ├── Product Mode State: simple | variable                   │   │
│  │  ├── Attribute Groups State: AttributeGroup[]               │   │
│  │  ├── Generated Variants State: GeneratedVariant[]           │   │
│  │  └── Form Values: CreateProductInput                         │   │
│  │                                                               │   │
│  │  UI Sections:                                                 │   │
│  │  ├── 📦 General Information Card                             │   │
│  │  ├── 🏷️  Specifications Card (Key-Value Pairs)               │   │
│  │  └── 💰 Pricing & Variants Card                              │   │
│  │      ├── Simple Mode: Single variant form                    │   │
│  │      └── Variable Mode:                                       │   │
│  │          ├── Attribute Group Builder                         │   │
│  │          ├── Generate Button → Cartesian Product             │   │
│  │          └── Editable Variants Table                         │   │
│  │                                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Validation Layer (Zod Schema)                   │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │  createProductFormSchema (Discriminated Union)               │   │
│  │  ├── productMode: 'simple' → simpleProductSchema             │   │
│  │  └── productMode: 'variable' → variableProductSchema         │   │
│  │                                                               │   │
│  │  Validation Rules:                                            │   │
│  │  ✓ Field-level (required, format, min/max)                   │   │
│  │  ✓ Cross-field (sale price < price, unique SKUs)             │   │
│  │  ✓ Structural (variants have complete attributes)            │   │
│  │                                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                       │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ Server Action Call
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                       SERVER LAYER (Next.js)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              product-master.ts (Server Actions)              │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │  1. verifyAdminRole() ← Auth check                           │   │
│  │  2. Validate input with Zod                                  │   │
│  │  3. checkSlugAvailability()                                  │   │
│  │  4. db.transaction(async (tx) => {                           │   │
│  │       ├── INSERT products                                     │   │
│  │       ├── INSERT product_to_categories                        │   │
│  │       ├── INSERT product_images (if any)                      │   │
│  │       │                                                        │   │
│  │       └── IF productMode === 'simple':                        │   │
│  │           └── INSERT 1 product_variant                        │   │
│  │                                                               │   │
│  │       └── IF productMode === 'variable':                      │   │
│  │           ├── FOR custom attribute groups:                    │   │
│  │           │   ├── INSERT variant_option_groups                │   │
│  │           │   ├── INSERT variant_option_values                │   │
│  │           │   └── INSERT product_variant_options              │   │
│  │           │                                                    │   │
│  │           └── FOR EACH variant:                               │   │
│  │               ├── Extract colorId/sizeId from attributes      │   │
│  │               ├── INSERT product_variants (with FKs)          │   │
│  │               └── FOR custom attributes:                      │   │
│  │                   └── INSERT variant_option_assignments       │   │
│  │     })                                                         │   │
│  │                                                               │   │
│  │  5. revalidatePath('/admin/products')                         │   │
│  │  6. Return { success: true, data }                            │   │
│  │                                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                       │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ Database Queries
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER (PostgreSQL)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────┐                                                  │
│  │   products     │                                                  │
│  ├────────────────┤                                                  │
│  │ id (PK)        │───┐                                              │
│  │ name           │   │                                              │
│  │ slug (UNIQUE)  │   │                                              │
│  │ brand_id (FK)  │   │ One-to-Many                                 │
│  │ specs (JSONB)  │   │                                              │
│  └────────────────┘   │                                              │
│                       │                                              │
│  ┌────────────────────────┐                                          │
│  │  product_variants      │                                          │
│  ├────────────────────────┤                                          │
│  │ id (PK)                │←──┘                                      │
│  │ product_id (FK)        │                                          │
│  │ sku (UNIQUE)           │                                          │
│  │ price                  │                                          │
│  │ color_id (FK) ─────────┼────→ colors (Predefined)                │
│  │ size_id (FK) ──────────┼────→ sizes (Predefined)                 │
│  │ in_stock               │                                          │
│  └────────────────────────┘                                          │
│           │                                                           │
│           │ Many-to-Many (for custom attributes)                     │
│           │                                                           │
│           ↓                                                           │
│  ┌──────────────────────────────┐                                    │
│  │ variant_option_assignments   │                                    │
│  ├──────────────────────────────┤                                    │
│  │ variant_id (FK)              │                                    │
│  │ option_value_id (FK)  ───────┼──→ variant_option_values          │
│  └──────────────────────────────┘                                    │
│                                                                       │
│  ┌─────────────────────────────┐                                     │
│  │  variant_option_groups      │                                     │
│  ├─────────────────────────────┤                                     │
│  │ id (PK)                     │                                     │
│  │ name (e.g., "Material")     │                                     │
│  └─────────────────────────────┘                                     │
│           │                                                           │
│           │ One-to-Many                                              │
│           ↓                                                           │
│  ┌─────────────────────────────┐                                     │
│  │  variant_option_values      │                                     │
│  ├─────────────────────────────┤                                     │
│  │ id (PK)                     │                                     │
│  │ group_id (FK)               │                                     │
│  │ value (e.g., "Wood")        │                                     │
│  └─────────────────────────────┘                                     │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow: Simple Product

```
User Input                Form State              Server Action            Database
─────────────────────────────────────────────────────────────────────────────────

Name: "Hammer"     →    {                    →    createProduct()    →    INSERT INTO
Slug: "hammer"          productMode:                                        products
Price: R99.99           'simple',                                           VALUES (...)
Stock: 50               variants: [{
                          sku: 'HAM-001',        INSERT INTO               INSERT INTO
                          price: '99.99',        product_variants           product_variants
                          inStock: 50,           WITH                       VALUES (
                          variantType:           colorId: null,              product_id,
                          'simple'               sizeId: null                sku,
                        }]                                                   price,
                      }                                                      colorId: null,
                                                                             sizeId: null,
                                                                             inStock
                                                                           )

Result: 1 Product + 1 Variant (no attributes)
```

---

## 🔄 Data Flow: Variable Product (Predefined Attributes)

```
User Input                      Form State                 Server Action              Database
────────────────────────────────────────────────────────────────────────────────────────────

Attribute Group 1:        →    {                      →    createProduct()      →    INSERT INTO
Type: Color                    productMode:                                           products
Options:                       'variable',
- Red (colorId: uuid-1)        attributeGroups: [{        Extract IDs from          INSERT INTO
- Blue (colorId: uuid-2)         name: 'Color',           variant.attributes:        product_variants
                                 type: 'color',                                      VALUES (
Attribute Group 2:               options: [               for attr in attrs:          product_id,
Type: Size                         {value:'Red',            if attr.type=='color':    sku,
Options:                             colorId:'uuid-1'},       colorId = attr.colorId  price,
- S (sizeId: uuid-3)               {value:'Blue',          if attr.type=='size':      colorId: uuid-1,
- M (sizeId: uuid-4)                 colorId:'uuid-2'}        sizeId = attr.sizeId    sizeId: uuid-3,
                               ]},                                                    inStock
Generate Variants →            {name:'Size',           INSERT INTO                 )
                                 type:'size',           product_variants
Result: 4 Variants             options:[              WITH DIRECT FKs             Repeat for:
- Red/S                          {value:'S',                                        - Red/M
- Red/M                            sizeId:'uuid-3'},                                - Blue/S
- Blue/S                         {value:'M',                                        - Blue/M
- Blue/M                           sizeId:'uuid-4'}
                               ]}],
                               variants: [
                                 {
                                   displayName:'Red/S',
                                   attributes:[
                                     {groupType:'color',
                                      colorId:'uuid-1'},
                                     {groupType:'size',
                                      sizeId:'uuid-3'}
                                   ],
                                   sku:'TSHIRT-RED-S-001',
                                   ...
                                 },
                                 // ... 3 more
                               ]
                             }

Result: 1 Product + 4 Variants (with color_id & size_id FKs)
```

---

## 🔄 Data Flow: Variable Product (Custom Attributes)

```
User Input                    Form State               Server Action                 Database
──────────────────────────────────────────────────────────────────────────────────────────────

Attribute Group:        →    {                   →    createProduct()          →    INSERT INTO
Type: Custom                 productMode:                                            products
Name: "Material"             'variable',              1. Create Group:
Options:                     attributeGroups:[          INSERT INTO                 INSERT INTO
- Wood                         {name:'Material',         variant_option_groups       variant_option_groups
- Metal                        type:'custom',           VALUES ('Material')          VALUES ('Material')
                              options:[                 → groupId: uuid-G            → id: uuid-G
Generate Variants →            {value:'Wood'},
                              {value:'Metal'}]        2. Create Values:            INSERT INTO
Result: 2 Variants           }],                        INSERT INTO                 variant_option_values
- Wood                       variants:[                  variant_option_values       VALUES (
- Metal                        {displayName:'Wood',     VALUES                        groupId: uuid-G,
                                attributes:[              (uuid-G, 'Wood')            value: 'Wood'
                                 {groupType:'custom',     → valueId: uuid-V1         ) → id: uuid-V1
                                  groupName:'Material',
                                  value:'Wood'}          INSERT INTO                 INSERT INTO
                               ],                         variant_option_values       variant_option_values
                               sku:'CASE-WOOD-001',    VALUES                        VALUES (
                               ...                        (uuid-G, 'Metal')           groupId: uuid-G,
                              },                         → valueId: uuid-V2           value: 'Metal'
                              {displayName:'Metal',                                 ) → id: uuid-V2
                               attributes:[            3. Create Variants:
                                {groupType:'custom',     INSERT INTO                 INSERT INTO
                                 groupName:'Material',    product_variants            product_variants
                                 value:'Metal'}          VALUES (...)                 (no color_id/size_id)
                              ],                         → variantId: uuid-VAR1
                              sku:'CASE-METAL-002',
                              ...                      4. Create Assignments:       INSERT INTO
                             }]                          INSERT INTO                 variant_option_assignments
                           }                              variant_option_assignments VALUES (
                                                         VALUES                        variant_id: uuid-VAR1,
                                                          (uuid-VAR1, uuid-V1)        option_value_id: uuid-V1
                                                                                     )

Result: 1 Product + 2 Variants + 1 Option Group + 2 Option Values + 2 Assignments
```

---

## 🧩 Component Hierarchy

```
/admin/products/create/page.tsx (Server Component)
└── Suspense
    └── FormData (async fetch)
        └── <MasterProductCreateForm attributes={data} />
            │
            ├── <Card> General Information
            │   ├── <Input name="name" />
            │   ├── <Input name="slug" />
            │   ├── <Textarea name="description" />
            │   ├── <Select name="productType" />
            │   └── <Switch name="isPublished" />
            │
            ├── <Card> Specifications
            │   ├── Specs State: Record<string, string>
            │   ├── Add Spec Button
            │   └── Spec List (map over specs)
            │
            └── <Card> Pricing & Variants
                ├── <Switch> VAT Included
                ├── <Switch> Product has variants?
                │
                ├── IF productMode === 'simple':
                │   ├── <Input sku />
                │   ├── <Input price />
                │   ├── <Input salePrice />
                │   ├── <Input inStock />
                │   └── <Button> Show Price Breakdown
                │
                └── IF productMode === 'variable':
                    ├── Attribute Groups Section
                    │   └── FOR EACH group:
                    │       ├── <Select type="color|size|custom" />
                    │       ├── <Input name /> (if custom)
                    │       ├── Options Display (badges)
                    │       └── <Button> Remove Group
                    │
                    ├── <Button> Generate Variants
                    │   └── onClick: generateVariantCombinations()
                    │
                    └── IF generatedVariants.length > 0:
                        ├── Bulk Operations Row
                        │   ├── <Input bulkPrice />
                        │   ├── <Button> Apply Price
                        │   ├── <Input bulkStock />
                        │   └── <Button> Apply Stock
                        │
                        └── <Table> Editable Variants
                            └── FOR EACH variant:
                                ├── <TableCell> {displayName}
                                ├── <Input value={sku} />
                                ├── <Input value={price} />
                                ├── <Input value={inStock} />
                                └── <Button> Delete
```

---

## 🔀 State Machine: Product Mode Toggle

```
┌─────────────┐                                      ┌─────────────┐
│   SIMPLE    │──── Toggle "has variants?" ON ───→  │  VARIABLE   │
│   MODE      │                                      │    MODE     │
└─────────────┘                                      └─────────────┘
      ↑                                                      │
      │                                                      │
      │           ┌────────────────────────────┐            │
      │           │  State Transitions:        │            │
      └───────────│  1. Clear attribute groups │←───────────┘
         Toggle   │  2. Clear generated variants│   Toggle
         OFF      │  3. Reset to single variant│   ON
                  └────────────────────────────┘
```

---

## 🎯 Variant Generation Algorithm

```
Input: AttributeGroups
─────────────────────────
[
  { name: 'Color', options: ['Red', 'Blue'] },
  { name: 'Size', options: ['S', 'M', 'L'] }
]

Step 1: Extract Option Arrays
─────────────────────────────
[
  ['Red', 'Blue'],
  ['S', 'M', 'L']
]

Step 2: Cartesian Product
─────────────────────────────
combinations = cartesian([
  ['Red', 'Blue'],
  ['S', 'M', 'L']
])

Result:
[
  ['Red', 'S'],
  ['Red', 'M'],
  ['Red', 'L'],
  ['Blue', 'S'],
  ['Blue', 'M'],
  ['Blue', 'L']
]

Step 3: Transform to Variant Objects
─────────────────────────────
FOR EACH combination:
  {
    combinationId: 'color:Red|size:S',
    displayName: 'Red / S',
    attributes: [
      { groupName: 'Color', groupType: 'color', value: 'Red', colorId: '...' },
      { groupName: 'Size', groupType: 'size', value: 'S', sizeId: '...' }
    ],
    sku: 'PRODUCT-RED-S-001',
    price: '0',
    inStock: 0,
    ...
  }

Output: GeneratedVariant[]
─────────────────────────────
6 variants ready for editing
```

---

## 🛡️ Validation Flow

```
User Input → Zod Schema → Error Display
─────────────────────────────────────────

1. Field-Level Validation (onBlur)
   ├── name.length < 3 → "Name must be at least 3 characters"
   ├── slug !~ /^[a-z0-9-]+$/ → "Invalid slug format"
   └── price < 0 → "Price must be positive"

2. Cross-Field Validation (onSubmit)
   ├── salePrice >= price → "Sale price must be less than price"
   ├── SKUs not unique → "Duplicate SKUs found"
   └── variants missing attributes → "Incomplete attribute assignments"

3. Server-Side Validation
   ├── Admin role check → 401 Unauthorized
   ├── Slug availability → "Slug already exists"
   └── Transaction constraints → DB error messages

4. Display Errors
   ├── Field errors: Red border + message below input
   ├── Form errors: Alert banner at top
   └── Server errors: Toast notification
```

---

## 📊 Transaction Flow Diagram

```
BEGIN TRANSACTION
├── INSERT products
│   └── RETURNING id → productId
│
├── INSERT product_to_categories (batch)
│   └── VALUES (productId, categoryId1), (productId, categoryId2), ...
│
├── INSERT product_images (if any)
│   └── VALUES (productId, url, sortOrder), ...
│
└── IF productMode === 'variable':
    │
    ├── FOR custom attribute groups:
    │   ├── INSERT variant_option_groups → groupId
    │   ├── INSERT product_variant_options → link to product
    │   └── INSERT variant_option_values → valueIds (map for later)
    │
    └── FOR EACH variant:
        ├── Extract colorId/sizeId from attributes
        ├── INSERT product_variants → variantId
        │   └── WITH color_id, size_id (if predefined)
        │
        └── FOR custom attributes:
            └── INSERT variant_option_assignments
                └── VALUES (variantId, customValueId)
│
└── UPDATE products SET default_variant_id
│
COMMIT (or ROLLBACK on error)
```

---

## 🎨 UI Component Tree

```
<form onSubmit={handleSubmit}>
  │
  ├─ {errors.root && <Alert>Global Error</Alert>}
  │
  ├─ <Card id="general-info">
  │   └─ <CardContent>
  │       ├─ <Input {...register('name')} />
  │       ├─ <Input {...register('slug')} />
  │       ├─ <Textarea {...register('description')} />
  │       ├─ <Select value={productType} />
  │       └─ <Switch checked={isPublished} />
  │
  ├─ <Card id="specs">
  │   └─ <CardContent>
  │       ├─ {specs.map(([k,v]) => <SpecRow key={k} />)}
  │       └─ <AddSpecForm />
  │
  ├─ <Card id="pricing-variants">
  │   └─ <CardContent>
  │       ├─ <VATToggle />
  │       ├─ <ModeToggle checked={productMode === 'variable'} />
  │       │
  │       ├─ {productMode === 'simple' && (
  │       │    <SimpleVariantForm />
  │       │  )}
  │       │
  │       └─ {productMode === 'variable' && (
  │            <>
  │              <AttributeGroupsBuilder
  │                groups={attributeGroups}
  │                onAddGroup={addAttributeGroup}
  │                onUpdateGroup={updateAttributeGroup}
  │                onRemoveGroup={removeAttributeGroup}
  │              />
  │
  │              <Button onClick={generateVariants}>
  │                Generate Variants
  │              </Button>
  │
  │              {generatedVariants.length > 0 && (
  │                <>
  │                  <BulkOperationsRow />
  │                  <VariantsTable
  │                    variants={generatedVariants}
  │                    onUpdateVariant={updateVariant}
  │                    onDeleteVariant={deleteVariant}
  │                  />
  │                </>
  │              )}
  │            </>
  │          )}
  │
  └─ <FormActions>
      ├─ <Button type="button" onClick={cancel}>Cancel</Button>
      └─ <Button type="submit" disabled={isSubmitting}>
           {isSubmitting ? 'Creating...' : 'Create Product'}
         </Button>
```

---

## 🔐 Security & Authorization

```
Client Request
     ↓
Server Action: createProduct()
     ↓
1. verifyAdminRole()
   ├─ Get session from auth
   ├─ Check user.role === 'admin'
   └─ Throw error if unauthorized
     ↓
2. Validate input with Zod
   └─ Throw error if invalid
     ↓
3. Check slug availability
   └─ Return error if exists
     ↓
4. Execute transaction
   └─ Rollback on any error
     ↓
5. Revalidate paths
     ↓
6. Return success response
```

---

This architecture provides **scalability, maintainability, type safety, and excellent UX** for product creation! 🚀
