import { createAuthClient } from "better-auth/react";

const client = createAuthClient({
  baseURL: "http://localhost:3000"
});

console.log("Auth Client Methods:");
console.log(Object.getOwnPropertyNames(client));
console.log("\nChecking for password methods:");
console.log("forgetPassword:", typeof client.forgetPassword);
console.log("forgotPassword:", typeof client.forgotPassword);
console.log("resetPassword:", typeof client.resetPassword);
