import laptopSleeveImg from '../assets/images/item_laptop_sleeve_1794760818101.jpg';
import leatherWalletImg from '../assets/images/item_leather_wallet_1794760819591.jpg';
import navyHeadphonesImg from '../assets/images/item_navy_headphones_1794760820388.jpg';
import textbookPenImg from '../assets/images/item_textbook_pen_1794760819868.jpg';
import insulatedFlaskImg from '../assets/images/item_insulated_flask_1794760820710.jpg';
import tortoiseGlassesImg from '../assets/images/item_tortoise_glasses_1794760821185.jpg';
import type { ItemCategory } from '../types';

export const ITEM_IMAGE_ASSETS: Record<string, string> = {
  laptop_sleeve: laptopSleeveImg,
  leather_wallet: leatherWalletImg,
  navy_headphones: navyHeadphonesImg,
  textbook_pen: textbookPenImg,
  insulated_flask: insulatedFlaskImg,
  tortoise_glasses: tortoiseGlassesImg,
};

export function resolveItemImage(imageKey?: string, imageUrl?: string): string | null {
  if (imageUrl && (imageUrl.startsWith('data:image/') || imageUrl.startsWith('/') || imageUrl.startsWith('http'))) {
    return imageUrl;
  }
  if (imageKey && ITEM_IMAGE_ASSETS[imageKey]) {
    return ITEM_IMAGE_ASSETS[imageKey];
  }
  return null;
}

export const CAMPUS_LOCATIONS: string[] = [
  'Sterling Memorial Library',
  'Founders Humanities Hall',
  'North Science Atrium',
  'Harkness Student Union',
  'West Quad Courtyard',
  'Engineering & Design Center',
  'University Athletic Pavilion',
  'Conservatory Recital Hall',
  'Campus Transit Shuttle Stop',
];

export const ITEM_CATEGORIES: ItemCategory[] = [
  'Electronics',
  'Wallets & IDs',
  'Books & Notes',
  'Accessories',
  'Keys',
  'Bags & Apparel',
  'Everyday Gear',
];
