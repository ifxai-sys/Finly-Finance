import {
  Wallet,
  ShoppingCart,
  Play,
  Briefcase,
  Fuel,
  Home,
  UtensilsCrossed,
  Car,
  Clapperboard,
  ShieldCheck,
  Plane,
  Laptop,
  CircleDollarSign,
} from "lucide-react";

// Icon keys are plain strings so they can round-trip through the database
// (see backend `icon` columns). Add new keys here as needed.
export const ICON_MAP = {
  wallet: Wallet,
  shopping_cart: ShoppingCart,
  film: Play,
  briefcase: Briefcase,
  fuel: Fuel,
  home: Home,
  utensils: UtensilsCrossed,
  car: Car,
  clapperboard: Clapperboard,
  "shield-check": ShieldCheck,
  plane: Plane,
  laptop: Laptop,
};

export function iconFor(key) {
  return ICON_MAP[key] || CircleDollarSign;
}

export const ICON_OPTIONS = Object.keys(ICON_MAP);
