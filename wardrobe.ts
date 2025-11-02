/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { WardrobeItem } from './types';

// The default wardrobe is now fetched from the Supabase database in App.tsx.
// This file is kept to avoid breaking imports, but it no longer defines the wardrobe items.
export const defaultWardrobe: WardrobeItem[] = [];
