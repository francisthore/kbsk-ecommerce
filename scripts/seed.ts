import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and } from 'drizzle-orm';
import * as schema from '../src/lib/db/schema/index';

const DATABASE_URL = process.env.DRIZZLE_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Error: DRIZZLE_DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

type DB = typeof db;

interface SeedStats {
  genders: { inserted: number; updated: number };
  colors: { inserted: number; updated: number };
  sizes: { inserted: number; updated: number };
  brands: { inserted: number; updated: number };
  categories: { inserted: number; updated: number };
  products: { inserted: number; updated: number };
  variants: { inserted: number; updated: number };
  images: { inserted: number; updated: number };
  standards: { inserted: number; updated: number };
  compatibility: { inserted: number; updated: number };
}

const stats: SeedStats = {
  genders: { inserted: 0, updated: 0 },
  colors: { inserted: 0, updated: 0 },
  sizes: { inserted: 0, updated: 0 },
  brands: { inserted: 0, updated: 0 },
  categories: { inserted: 0, updated: 0 },
  products: { inserted: 0, updated: 0 },
  variants: { inserted: 0, updated: 0 },
  images: { inserted: 0, updated: 0 },
  standards: { inserted: 0, updated: 0 },
  compatibility: { inserted: 0, updated: 0 },
};

async function upsertGender(conn: DB, slug: string, label: string) {
  const existing = await conn.query.genders.findFirst({
    where: eq(schema.genders.slug, slug),
  });

  if (existing) {
    await conn.update(schema.genders).set({ label }).where(eq(schema.genders.slug, slug));
    stats.genders.updated++;
    return existing.id;
  } else {
    const [result] = await conn.insert(schema.genders).values({ slug, label }).returning({ id: schema.genders.id });
    stats.genders.inserted++;
    return result.id;
  }
}

async function upsertColor(conn: DB, slug: string, name: string, hex_code: string) {
  console.log(`Upserting color: slug=${slug}, name=${name}, hex_code=${hex_code}`);

  const existing = await conn.query.colors.findFirst({
    where: eq(schema.colors.slug, slug),
  });

  if (existing) {
    await conn.update(schema.colors).set({ name, hexCode: hex_code }).where(eq(schema.colors.slug, slug));
    stats.colors.updated++;
    return existing.id;
  } else {
    const [result] = await conn.insert(schema.colors)
      .values({ slug, name, hexCode: hex_code })
      .returning({ id: schema.colors.id });
    stats.colors.inserted++;
    return result.id;
  }
}

async function upsertSize(conn: DB, slug: string, label: string, sort_order: number) {
  const existing = await conn.query.sizes.findFirst({
    where: eq(schema.sizes.slug, slug),
  });

  if (existing) {
    await conn.update(schema.sizes).set({ name: label, sortOrder: sort_order }).where(eq(schema.sizes.slug, slug));
    stats.sizes.updated++;
    return existing.id;
  } else {
    const [result] = await conn.insert(schema.sizes)
      .values({ slug, name: label, sortOrder: sort_order })
      .returning({ id: schema.sizes.id });
    stats.sizes.inserted++;
    return result.id;
  }
}

async function upsertBrand(conn: DB, slug: string, name: string, description?: string) {
  const existing = await conn.query.brands.findFirst({
    where: eq(schema.brands.slug, slug),
  });

  if (existing) {
    await conn.update(schema.brands).set({ name, /* description ignored if not in schema */ }).where(eq(schema.brands.slug, slug));
    stats.brands.updated++;
    return existing.id;
  } else {
    const [result] = await conn.insert(schema.brands)
      .values({ slug, name /*, description*/ })
      .returning({ id: schema.brands.id });
    stats.brands.inserted++;
    return result.id;
  }
}

async function upsertCategory(conn: DB, slug: string, name: string, parent_id?: string): Promise<string> {
  const existing = await conn.query.categories.findFirst({
    where: eq(schema.categories.slug, slug),
  });

  if (existing) {
    await conn.update(schema.categories).set({ name, parentId: parent_id }).where(eq(schema.categories.slug, slug));
    stats.categories.updated++;
    return existing.id;
  } else {
    const [result] = await conn.insert(schema.categories)
      .values({ slug, name, parentId: parent_id })
      .returning({ id: schema.categories.id });
    stats.categories.inserted++;
    return result.id;
  }
}

async function upsertProduct(conn: DB, data: {
  slug: string;
  name: string;
  description: string;
  brandId: string;
  categoryId: string;
  productType: string;
  genderId?: string;
  specs?: any;
}) {
  const existing = await conn.query.products.findFirst({
    where: eq(schema.products.slug, data.slug),
  });

  if (existing) {
    await conn.update(schema.products)
      .set({
        name: data.name,
        description: data.description,
        brandId: data.brandId,
        categoryId: data.categoryId,
        productType: data.productType as any,
        genderId: data.genderId,
        specs: data.specs,
      })
      .where(eq(schema.products.slug, data.slug));
    stats.products.updated++;
    return existing.id;
  } else {
    const [result] = await conn.insert(schema.products)
      .values(data as any)
      .returning({ id: schema.products.id });
    stats.products.inserted++;
    return result.id;
  }
}

async function upsertVariant(conn: DB, data: {
  productId: string;
  sku: string;
  price: string;
  inStock: number;
  colorId?: string;
  sizeId?: string;
  genderId?: string;
  specs?: any;
}) {
  const existing = await conn.query.productVariants.findFirst({
    where: eq(schema.productVariants.sku, data.sku),
  });

  if (existing) {
    await conn.update(schema.productVariants)
      .set({
        price: data.price as any,
        inStock: data.inStock,
        colorId: data.colorId,
        sizeId: data.sizeId,
        genderId: data.genderId,
        specs: data.specs,
      })
      .where(eq(schema.productVariants.sku, data.sku));
    stats.variants.updated++;
    return existing.id;
  } else {
    const [result] = await conn.insert(schema.productVariants)
      .values(data as any)
      .returning({ id: schema.productVariants.id });
    stats.variants.inserted++;
    return result.id;
  }
}

async function upsertProductImage(conn: DB, product_id: string, url: string, kind: string = 'image', is_primary: boolean = true) {
  const existing = await conn.query.productImages.findFirst({
    where: and(
      eq(schema.productImages.productId, product_id),
      eq(schema.productImages.url, url)
    ),
  });

  if (existing) {
    stats.images.updated++;
    return existing.id;
  } else {
    const [result] = await conn.insert(schema.productImages)
      .values({ productId: product_id, url, kind: kind as any, isPrimary: is_primary })
      .returning({ id: schema.productImages.id });
    stats.images.inserted++;
    return result.id;
  }
}

async function upsertProductStandard(conn: DB, product_id: string, code: string, label: string) {
  const existing = await conn.query.productStandards.findFirst({
    where: and(
      eq(schema.productStandards.productId, product_id),
      eq(schema.productStandards.code, code)
    ),
  });

  if (existing) {
    await conn.update(schema.productStandards)
      .set({ label })
      .where(and(eq(schema.productStandards.productId, product_id), eq(schema.productStandards.code, code)));
    stats.standards.updated++;
  } else {
    await conn.insert(schema.productStandards).values({ productId: product_id, code, label });
    stats.standards.inserted++;
  }
}

async function upsertProductCompatibility(conn: DB, product_id: string, platform: string) {
  const existing = await conn.query.productCompatibility.findFirst({
    where: and(
      eq(schema.productCompatibility.productId, product_id),
      eq(schema.productCompatibility.platform, platform)
    ),
  });

  if (existing) {
    stats.compatibility.updated++;
  } else {
    await conn.insert(schema.productCompatibility).values({ productId: product_id, platform });
    stats.compatibility.inserted++;
  }
}

async function seed() {
  console.log('🌱 Starting seed...\n');

  try {
    // Step 1: Seed genders
    console.log('📋 Seeding genders...');
    const genderIds = {
      men: await upsertGender(db, 'men', 'Men'),
      women: await upsertGender(db, 'women', 'Women'),
      unisex: await upsertGender(db, 'unisex', 'Unisex'),
    };

    // Step 2: Seed colors
    console.log('🎨 Seeding colors...');
    const colorIds = {
      red: await upsertColor(db, 'red', 'Red', '#FF0000'),
      black: await upsertColor(db, 'black', 'Black', '#000000'),
      yellow: await upsertColor(db, 'yellow', 'Yellow', '#FFD60A'),
      hiVisYellow: await upsertColor(db, 'hi-vis-yellow', 'Hi-Vis Yellow', '#E6FF00'),
    };

    // Step 3: Seed sizes
    console.log('📏 Seeding sizes...');
    const sizeIds = {
      S: await upsertSize(db, 'S', 'S', 1),
      M: await upsertSize(db, 'M', 'M', 2),
      L: await upsertSize(db, 'L', 'L', 3),
      XL: await upsertSize(db, 'XL', 'XL', 4),
    };

    // Step 4: Seed brands
    console.log('🏷️  Seeding brands...');
    const brandIds = {
      milwaukee: await upsertBrand(db, 'milwaukee', 'Milwaukee', 'Professional power tools and accessories'),
      raco: await upsertBrand(db, 'raco', 'RACO', 'Reliable tools for professionals'),
      javlin: await upsertBrand(db, 'javlin', 'Javlin', 'Quality PPE and workwear'),
    };

    // Step 5: Seed categories (hierarchical)
    console.log('📂 Seeding categories...');
    const categoryIds: Record<string, string> = {};
    categoryIds['power-tools'] = await upsertCategory(db, 'power-tools', 'Power Tools');
    categoryIds['hand-tools'] = await upsertCategory(db, 'hand-tools', 'Hand Tools');
    categoryIds['accessories'] = await upsertCategory(db, 'accessories', 'Accessories');
    categoryIds['ppe'] = await upsertCategory(db, 'ppe', 'PPE');
    categoryIds['drilling'] = await upsertCategory(db, 'drilling', 'Drilling', categoryIds['power-tools']);
    categoryIds['angle-grinders'] = await upsertCategory(db, 'angle-grinders', 'Angle Grinders', categoryIds['power-tools']);
    categoryIds['wrenches'] = await upsertCategory(db, 'wrenches', 'Wrenches', categoryIds['hand-tools']);
    categoryIds['screwdrivers'] = await upsertCategory(db, 'screwdrivers', 'Screwdrivers', categoryIds['hand-tools']);
    categoryIds['bits-and-blades'] = await upsertCategory(db, 'bits-and-blades', 'Bits and Blades', categoryIds['accessories']);
    categoryIds['gloves'] = await upsertCategory(db, 'gloves', 'Gloves', categoryIds['ppe']);
    categoryIds['workwear'] = await upsertCategory(db, 'workwear', 'Workwear', categoryIds['ppe']);

    // Step 6: Seed products
    console.log('🛠️  Seeding products...\n');

    const p1 = await upsertProduct(db, {
      slug: 'm12-fuel-12-drill-driver-kit',
      name: 'Milwaukee M12 FUEL 1/2" Drill Driver Kit',
      description: 'Compact and powerful 12V drill driver with superior torque and runtime',
      brandId: brandIds.milwaukee,
      categoryId: categoryIds['drilling'],
      productType: 'tool',
      specs: { voltage: '12V', torque_nm: 44, rpm: '0–1700', chuck: '13mm', battery_type: 'Li-ion', kit: true },
    });
    await upsertProductImage(db, p1, '/products/m12-fuel-12-drill-driver-kit.jpg');
    await upsertVariant(db, { productId: p1, sku: 'MW-M12-DRL-KIT', price: '3299.00', inStock: 35 });
    await upsertVariant(db, { productId: p1, sku: 'MW-M12-DRL-BARE', price: '2299.00', inStock: 20, specs: { kit: false } });
    await upsertProductCompatibility(db, p1, 'M12');

    const p2 = await upsertProduct(db, {
      slug: 'raco-18v-brushless-impact-driver',
      name: 'RACO 18V Brushless Impact Driver',
      description: 'High-torque brushless impact driver for demanding applications',
      brandId: brandIds.raco,
      categoryId: categoryIds['drilling'],
      productType: 'tool',
      specs: { voltage: '18V', torque_nm: 180, rpm: '0–3000', ipm: 4000, battery_type: 'Li-ion' },
    });
    await upsertProductImage(db, p2, '/products/raco-18v-brushless-impact-driver.jpg');
    await upsertVariant(db, { productId: p2, sku: 'RC-18V-ID-BARE', price: '2499.00', inStock: 28 });
    await upsertVariant(db, { productId: p2, sku: 'RC-18V-ID-KIT', price: '3599.00', inStock: 15 });

    const p3 = await upsertProduct(db, {
      slug: 'milwaukee-m18-125mm-angle-grinder',
      name: 'Milwaukee M18 125mm Angle Grinder',
      description: 'Cordless angle grinder with electronic brake for safety',
      brandId: brandIds.milwaukee,
      categoryId: categoryIds['angle-grinders'],
      productType: 'tool',
      specs: { voltage: '18V', disc_diameter_mm: 125, rpm: 8500, arbor_mm: 22.23, brake: true, platform: 'M18' },
    });
    await upsertProductImage(db, p3, '/products/milwaukee-m18-125mm-angle-grinder.jpg');
    await upsertVariant(db, { productId: p3, sku: 'MW-M18-AG125-BARE', price: '3199.00', inStock: 22 });
    await upsertProductCompatibility(db, p3, 'M18');

    const p4 = await upsertProduct(db, {
      slug: 'raco-230mm-heavy-duty-angle-grinder',
      name: 'RACO 230mm Heavy-Duty Angle Grinder',
      description: 'Powerful 2200W corded angle grinder for heavy-duty applications',
      brandId: brandIds.raco,
      categoryId: categoryIds['angle-grinders'],
      productType: 'tool',
      specs: { corded: true, power_w: 2200, disc_diameter_mm: 230, rpm: 6500, arbor_mm: 22.23 },
    });
    await upsertProductImage(db, p4, '/products/raco-230mm-heavy-duty-angle-grinder.jpg');
    await upsertVariant(db, { productId: p4, sku: 'RC-AG230-2200W', price: '2799.00', inStock: 12 });

    const p5 = await upsertProduct(db, {
      slug: 'milwaukee-shockwave-35pc-bit-set',
      name: 'Milwaukee Shockwave Impact Drill Bit Set 35pc',
      description: 'Impact-rated drill and driver bit set for maximum durability',
      brandId: brandIds.milwaukee,
      categoryId: categoryIds['bits-and-blades'],
      productType: 'accessory',
      specs: { pieces: 35, material: 'S2 steel', impact_rated: true },
    });
    await upsertProductImage(db, p5, '/products/milwaukee-shockwave-35pc-bit-set.jpg');
    await upsertVariant(db, { productId: p5, sku: 'MW-SHK-35PC', price: '549.00', inStock: 120 });

    const p6 = await upsertProduct(db, {
      slug: 'raco-cutoff-discs-125mm-pack-10',
      name: 'RACO Metal Cut-Off Discs 125mm (Pack of 10)',
      description: 'High-quality alumina cut-off discs for metal cutting',
      brandId: brandIds.raco,
      categoryId: categoryIds['bits-and-blades'],
      productType: 'consumable',
      specs: { disc_diameter_mm: 125, thickness_mm: 1.0, arbor_mm: 22.23, pack_size: 10, material: 'Alumina' },
    });
    await upsertProductImage(db, p6, '/products/raco-cutoff-discs-125mm-pack-10.jpg');
    await upsertVariant(db, { productId: p6, sku: 'RC-CO125-10PK', price: '229.00', inStock: 200 });

    const p7 = await upsertProduct(db, {
      slug: 'raco-pro-adjustable-wrench-300mm',
      name: 'RACO Pro Adjustable Wrench 300mm',
      description: 'Professional-grade adjustable wrench with wide jaw capacity',
      brandId: brandIds.raco,
      categoryId: categoryIds['wrenches'],
      productType: 'tool',
      specs: { length_mm: 300, jaw_capacity_mm: 36, material: 'Cr-V', scale: 'metric' },
    });
    await upsertProductImage(db, p7, '/products/raco-pro-adjustable-wrench-300mm.jpg');
    await upsertVariant(db, { productId: p7, sku: 'RC-AW300', price: '299.00', inStock: 95 });

    const p8 = await upsertProduct(db, {
      slug: 'milwaukee-cushion-grip-screwdriver-set-6pc',
      name: 'Milwaukee Cushion Grip Screwdriver Set 6pc',
      description: 'Ergonomic screwdriver set with magnetized tips',
      brandId: brandIds.milwaukee,
      categoryId: categoryIds['screwdrivers'],
      productType: 'tool',
      specs: { pieces: 6, tips: ['PH', 'SL'], magnetized: true, handle: 'cushion grip' },
    });
    await upsertProductImage(db, p8, '/products/milwaukee-cushion-grip-screwdriver-set-6pc.jpg');
    await upsertVariant(db, { productId: p8, sku: 'MW-SD-6PC', price: '449.00', inStock: 80 });

    const p9 = await upsertProduct(db, {
      slug: 'javlin-cut-resistant-gloves-nitrile',
      name: 'Javlin Nitrile-Dipped Cut-Resistant Gloves (EN388)',
      description: 'Cut-resistant work gloves with nitrile coating for superior grip',
      brandId: brandIds.javlin,
      categoryId: categoryIds['gloves'],
      productType: 'ppe',
      genderId: genderIds.unisex,
      specs: { coating: 'nitrile', cuff: 'knit', cut_level: 'C' },
    });
    await upsertProductImage(db, p9, '/products/javlin-cut-resistant-gloves-nitrile.jpg');
    await upsertProductStandard(db, p9, 'EN388', '4X43C');
    await upsertVariant(db, { productId: p9, sku: 'JV-GLV-CUTC-S', price: '119.00', inStock: 150, sizeId: sizeIds.S });
    await upsertVariant(db, { productId: p9, sku: 'JV-GLV-CUTC-M', price: '119.00', inStock: 180, sizeId: sizeIds.M });
    await upsertVariant(db, { productId: p9, sku: 'JV-GLV-CUTC-L', price: '119.00', inStock: 160, sizeId: sizeIds.L });

    const p10 = await upsertProduct(db, {
      slug: 'javlin-hi-vis-softshell-jacket',
      name: 'Javlin Hi-Vis Softshell Jacket (ANSI/ISEA 107)',
      description: 'Water-resistant hi-vis softshell jacket with reflective tape',
      brandId: brandIds.javlin,
      categoryId: categoryIds['workwear'],
      productType: 'ppe',
      specs: { material: 'softshell', color: 'hi-vis yellow', reflective_tape_in: 2, water_resistant: true },
    });
    await upsertProductImage(db, p10, '/products/javlin-hi-vis-softshell-jacket.jpg');
    await upsertProductStandard(db, p10, 'ANSI/ISEA 107', 'Class 2');
    await upsertVariant(db, { productId: p10, sku: 'JV-HVJKT-M-XL', price: '1399.00', inStock: 40, sizeId: sizeIds.XL, genderId: genderIds.men });
    await upsertVariant(db, { productId: p10, sku: 'JV-HVJKT-F-L', price: '1399.00', inStock: 35, sizeId: sizeIds.L, genderId: genderIds.women });

    // Print summary
    console.log('\n✅ Seed complete!\n');
    console.log('Summary:');
    console.log('--------');
    console.log(`Genders:        ${stats.genders.inserted} inserted, ${stats.genders.updated} updated`);
    console.log(`Colors:         ${stats.colors.inserted} inserted, ${stats.colors.updated} updated`);
    console.log(`Sizes:          ${stats.sizes.inserted} inserted, ${stats.sizes.updated} updated`);
    console.log(`Brands:         ${stats.brands.inserted} inserted, ${stats.brands.updated} updated`);
    console.log(`Categories:     ${stats.categories.inserted} inserted, ${stats.categories.updated} updated`);
    console.log(`Products:       ${stats.products.inserted} inserted, ${stats.products.updated} updated`);
    console.log(`Variants:       ${stats.variants.inserted} inserted, ${stats.variants.updated} updated`);
    console.log(`Images:         ${stats.images.inserted} inserted, ${stats.images.updated} updated`);
    console.log(`Standards:      ${stats.standards.inserted} inserted, ${stats.standards.updated} updated`);
    console.log(`Compatibility:  ${stats.compatibility.inserted} inserted, ${stats.compatibility.updated} updated`);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
