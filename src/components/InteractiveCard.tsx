"use client";

import Card, { CardProps } from "./Card";

interface InteractiveCardProps extends CardProps {
  onAddToCart: () => void;
}

export default function InteractiveCard({ onAddToCart, ...props }: InteractiveCardProps) {
  return <Card {...props} onAddToCart={onAddToCart} />;
}
