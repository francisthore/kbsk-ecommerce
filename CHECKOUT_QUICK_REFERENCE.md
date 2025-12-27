# 🚀 Checkout - Quick Reference

## 📍 Routes

- **Checkout Page**: `/checkout`
- **Auth Redirect**: `/auth?mode=signin&redirect=/checkout`

## 🎯 Key Files

```
src/app/(checkout)/checkout/
  ├── page.tsx                # Server component
  └── CheckoutPageClient.tsx  # Client component

src/components/checkout/
  ├── CheckoutProgress.tsx    # Progress indicator
  ├── ShippingForm.tsx        # Form component
  ├── CartReview.tsx          # Cart sidebar
  └── index.ts                # Barrel export
```

## 🛠️ Quick Tasks

### Add Checkout Button to Cart Page

```tsx
import { useRouter } from 'next/navigation';

const router = useRouter();

<button 
  onClick={() => router.push('/checkout')}
  className="w-full bg-[#4169E1] text-white py-4 rounded-lg"
>
  Proceed to Checkout
</button>
```

### Access Cart State in Checkout

```tsx
import { useCartStore } from '@/store/cart.store';

const { items, totals, itemCount } = useCartStore();
```

### Check if User is Authenticated

```tsx
// Server component
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const session = await auth.api.getSession({
  headers: await headers(),
});

if (!session) {
  // User not authenticated
}
```

### Merge Guest Cart After Login

```tsx
import { mergeGuestCartToUser } from '@/lib/actions/cart';

await mergeGuestCartToUser(userId);
```

## 🎨 Styling Classes

### Primary Blue (Checkout Accent)
```css
bg-[#4169E1]      /* Primary blue background */
text-[#4169E1]    /* Primary blue text */
hover:bg-[#3557C7] /* Hover state */
bg-[#4169E1]/5    /* Light blue background */
```

### Common Patterns
```tsx
// Form input
className="w-full rounded-lg border border-[var(--color-border)] 
           px-4 py-3 text-sm focus:border-[var(--color-primary)]"

// Primary button
className="w-full bg-[#4169E1] text-white py-4 rounded-lg 
           font-semibold hover:bg-[#3557C7]"

// Required indicator
<span className="text-[var(--color-error)]">*</span>
```

## 📋 Form Fields

### Required Fields (marked with *)
- Full name
- Email address
- Phone number
- Country
- City
- State
- ZIP Code
- Terms and Conditions checkbox

### Form ID
```tsx
<form id="checkout-form">
  {/* Form fields */}
</form>

{/* Submit button can be outside */}
<button type="submit" form="checkout-form">
  Pay Now
</button>
```

## 🧪 Test Scenarios

### 1. Guest Checkout Flow
```bash
1. Clear cookies
2. Add items to cart
3. Navigate to /checkout
4. Should redirect to /auth
5. Login/signup
6. Should return to /checkout
7. Cart should persist
```

### 2. Discount Code
```
Code: SAVE10
Expected: -$10.00 discount applied
```

### 3. Responsive Testing
```
Mobile:  375px width
Tablet:  768px width
Desktop: 1440px width
```

## 🔧 Configuration

### Shipping Cost
Edit in `CartReview.tsx`:
```tsx
const shipping = 5; // Change to your shipping cost
```

### Discount Codes
Edit in `CartReview.tsx`:
```tsx
if (discountCode.toUpperCase() === "SAVE10") {
  setAppliedDiscount(10);
}
// Add more codes here
```

### Country List
Edit in `ShippingForm.tsx`:
```tsx
<option value="US">United States</option>
<option value="CA">Canada</option>
<option value="ZA">South Africa</option>
// Add more countries
```

## 📱 Responsive Breakpoints

```tsx
// Hide on mobile, show on desktop
className="hidden lg:block"

// Full width on mobile, fixed on desktop
className="w-full lg:w-[450px]"

// Stack on mobile, grid on desktop
className="grid grid-cols-1 lg:grid-cols-2"
```

## 🚨 Common Errors

### Error: "Cannot find module './CheckoutPageClient'"
**Solution**: TypeScript cache issue. Restart VS Code or run:
```bash
rm -rf .next
npm run dev
```

### Error: Cart items not showing
**Solution**: Check if cart store is hydrated:
```tsx
const [isClient, setIsClient] = useState(false);
useEffect(() => setIsClient(true), []);

if (!isClient) return <Loading />;
```

### Error: Redirect loop
**Solution**: Clear sessionStorage:
```javascript
sessionStorage.clear();
```

## 💡 Tips

1. **Form Validation**: Use HTML5 validation attributes
   ```tsx
   <input type="email" required />
   ```

2. **Loading States**: Show spinner during async operations
   ```tsx
   const [isLoading, setIsLoading] = useState(false);
   ```

3. **Toast Notifications**: Use sonner for user feedback
   ```tsx
   import { toast } from 'sonner';
   toast.success("Discount applied!");
   toast.error("Invalid code");
   ```

4. **Image Optimization**: Always use Next.js Image
   ```tsx
   import Image from 'next/image';
   <Image src={url} alt={alt} fill className="object-cover" />
   ```

## 🔗 Quick Links

- [Full Implementation Docs](./CHECKOUT_IMPLEMENTATION.md)
- [Cart System Docs](./CART_IMPLEMENTATION.md)
- [Auth System Docs](./AUTH_SYSTEM_README.md)

---

**Need help?** Check [CHECKOUT_IMPLEMENTATION.md](./CHECKOUT_IMPLEMENTATION.md) for detailed documentation.
