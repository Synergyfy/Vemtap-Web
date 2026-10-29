/** Attribute badges a product can carry — saved as its `tags` (desktop and mobile add-product). */
export const PRODUCT_TAG_CHIPS: Array<{ label: string; icon: string; active: boolean; tone: 'default' | 'tertiary' }> = [
  { label: 'Gluten-free', icon: 'eco', active: false, tone: 'default' },
  { label: 'Halal certified', icon: 'verified', active: true, tone: 'default' },
  { label: 'Eco packaging', icon: 'recycling', active: false, tone: 'default' },
  { label: 'Medium Spicy', icon: 'local_fire_department', active: true, tone: 'tertiary' },
];
