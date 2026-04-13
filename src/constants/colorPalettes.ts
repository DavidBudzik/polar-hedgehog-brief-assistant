export interface ColorPalette {
  name: string;
  swatches: string[]; // 5 hex values, dark → light
}

export const COLOR_PALETTES: ColorPalette[] = [
  { name: 'Deep Blue',      swatches: ['#0F172A', '#1E40AF', '#3B82F6', '#93C5FD', '#F8FAFC'] },
  { name: 'Luxury Neutral', swatches: ['#1A1A1A', '#C9A96E', '#E8D5B7', '#F5F0E8', '#FAFAF8'] },
  { name: 'Forest Green',   swatches: ['#14532D', '#166534', '#4ADE80', '#BBF7D0', '#F0FDF4'] },
  { name: 'Vibrant Coral',  swatches: ['#7F1D1D', '#EF4444', '#FB923C', '#FED7AA', '#FFFBEB'] },
  { name: 'Tech Purple',    swatches: ['#1E1B4B', '#4F46E5', '#818CF8', '#C7D2FE', '#EFF6FF'] },
  { name: 'Bold Pink',      swatches: ['#831843', '#EC008C', '#F472B6', '#FBCFE8', '#FFF0F8'] },
  { name: 'Earthy Warm',    swatches: ['#451A03', '#92400E', '#D97706', '#FDE68A', '#FFFBEB'] },
  { name: 'Sage + Stone',   swatches: ['#1C1917', '#57534E', '#A8A29E', '#E7E5E4', '#FAFAF9'] },
];
