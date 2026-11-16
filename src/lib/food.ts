import { FoodData } from '@/components/types';

/**
 * What to show where a brand would go.
 * USDA "generic" foods (Foundation, SR Legacy, Survey/FNDDS) are reference foods averaged from lab
 * analysis, e.g. "Peanut butter, smooth" — they aren't a product from any company, so they have no brand.
 */
export const brandLabel = (info: FoodData['basic_info']): string => {
    if (info.brand) return info.brand;
    if (info.data_type && info.data_type !== 'Branded' && info.data_type !== 'Open Food Facts') {
        return 'Generic food (no brand)';
    }
    return 'Brand not listed';
};

export const GENERIC_FOOD_HELP =
    'Generic foods are USDA reference entries based on lab analysis of a typical version of the food, ' +
    'not a specific company\'s product. Search with the brand name or scan the barcode to find a specific product.';
