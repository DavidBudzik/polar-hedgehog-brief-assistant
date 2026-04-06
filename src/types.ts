export interface BriefData {
  companyName: string;
  projectType: string;
  projectDate: string;
  websiteUrl: string;
  scanSource: string;
  problemStatement: string;
  solutionDescription: string;
  competitors: Array<{ name: string; url: string; tagline: string; tags: string[]; tagCategory: 'similar' | 'different' }>;
  uvp: string[];
  features: Array<{ title: string; desc: string }>;
  companyNameMeaning: string;
  logoRationale: string;
  logoRationaleChips: string[];
  visualLanguageRationale: string;
  visualLanguageSliders: { modern: number; trustworthy: number; bold: number };
  keywords: string[];
  brandMessages: Array<{ keyword: string; message: string; approved: boolean }>;
  selectedValues: string[];
  visualDirection: {
    value1: { valueName: string; shape: string; color: string; motion: string; style: string };
    value2: { valueName: string; shape: string; color: string; motion: string; style: string };
  };
  referenceBrands: Array<{ name: string; url: string; likes: string[]; dislikes: string[] }>;
  logoStyle: string;
  logoOpenToRecommendations: boolean;
  colorPaletteApproach: string;
  colorSwatchRatings: Array<{ color: string; label: string; rating: 'like' | 'dislike' | '' }>;
}

export const INITIAL_BRIEF: BriefData = {
  companyName: '',
  projectType: 'Branding',
  projectDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  websiteUrl: '',
  scanSource: '',
  problemStatement: '',
  solutionDescription: '',
  competitors: [],
  uvp: [],
  features: [],
  companyNameMeaning: '',
  logoRationale: '',
  logoRationaleChips: [],
  visualLanguageRationale: '',
  visualLanguageSliders: { modern: 3, trustworthy: 3, bold: 3 },
  keywords: [],
  brandMessages: [],
  selectedValues: [],
  visualDirection: {
    value1: { valueName: '', shape: 'Organic', color: 'Vibrant', motion: 'Fluid', style: 'Minimal' },
    value2: { valueName: '', shape: 'Geometric', color: 'Muted', motion: 'Snappy', style: 'Futuristic' },
  },
  referenceBrands: [],
  logoStyle: '',
  logoOpenToRecommendations: false,
  colorPaletteApproach: '',
  colorSwatchRatings: [],
};

export type BriefStep =
  | 'setup' | 'kickoff'
  | 'problem_statement' | 'solution_description'
  | 'competitors' | 'uvp' | 'features'
  | 'company_name_meaning' | 'logo_rationale' | 'visual_language_rationale'
  | 'keywords' | 'brand_messages' | 'value_picker'
  | 'visual_direction_v1' | 'visual_direction_v2'
  | 'reference_brands' | 'logo_style' | 'color_palette'
  | 'summary';

export const STEPS_ORDER: BriefStep[] = [
  'setup', 'kickoff',
  'problem_statement', 'solution_description',
  'competitors', 'uvp', 'features',
  'company_name_meaning', 'logo_rationale', 'visual_language_rationale',
  'keywords', 'brand_messages', 'value_picker',
  'visual_direction_v1', 'visual_direction_v2',
  'reference_brands', 'logo_style', 'color_palette',
  'summary',
];
