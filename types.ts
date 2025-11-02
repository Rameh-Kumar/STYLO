/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface WardrobeItem {
  id: string;
  name: string;
  image_urls: string[];
  product_url?: string;
  brand?: string;
  category?: string;
  price?: number | null;
  product_type?: string;
  description?: string | null;
}

// Represents a generated image for a specific pose,
// including a standard version and an optional enhanced (upscaled) version.
export interface PoseImage {
  standard: string;
  enhanced?: string;
}

export interface OutfitLayer {
  garment: WardrobeItem | null; // null represents the base model layer
  poseImages: Record<string, PoseImage>; // Maps pose instruction to a PoseImage object
}