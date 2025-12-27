"use client";

import { createContext, useContext } from 'react';

type CheckoutStep = "cart" | "review" | "checkout" | "success";

const CheckoutStepContext = createContext<CheckoutStep>("checkout");

export function CheckoutStepProvider({ 
  step, 
  children 
}: { 
  step: CheckoutStep; 
  children: React.ReactNode;
}) {
  return (
    <CheckoutStepContext.Provider value={step}>
      {children}
    </CheckoutStepContext.Provider>
  );
}

export function useCheckoutStep() {
  return useContext(CheckoutStepContext);
}
