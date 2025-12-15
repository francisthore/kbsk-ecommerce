
import "dotenv/config";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";

async function publishAllProducts() {
  console.log("Setting isPublished to true for all products...");

  try {
    const result = await db.update(products).set({ isPublished: true }).returning({ id: products.id });
    console.log(`Successfully updated ${result.length} products.`);
  } catch (error) {
    console.error("An error occurred while updating products:", error);
  } finally {
    console.log("Finished.");
    process.exit(0);
  }
}

publishAllProducts();
