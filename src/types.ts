export interface BriefData {
  companyName: string;
  projectType: string;
  projectDate: string;
  websiteUrl: string;
  scanSource: string;
  problemStatement: string;
  solutionDescription: string;
  competitors: Array<{ name: string; url: string; tagline: string; tags: string[]; tagCategory: 'similar' | 'different' }>;
  competitorScreenshots: Record<string, string>;
  uvp: string[];
  features: Array<{ title: string; desc: string }>;
  companyNameMeaning: string;
  logoRationale: string;
  logoRationaleChips: string[];
  visualLanguageMood: { liked: string[]; skipped: string[] };
  keywords: string[];
  keywordImages: Record<string, string>;
  brandMessages: Array<{ keyword: string; message: string; approved: boolean }>;
  selectedValues: string[];
  visualDirection: {
    value1: { valueName: string; moodLiked: string[]; moodSkipped: string[] };
    value2: { valueName: string; moodLiked: string[]; moodSkipped: string[] };
  };
  referenceBrands: Array<{ name: string; url: string; likes: string[]; dislikes: string[] }>;
  referenceScreenshots: Record<string, string>;
  logoStyle: string;
  logoOpenToRecommendations: boolean;
  colorPaletteRatings: Array<{ paletteName: string; swatches: string[]; rating: 'like' | 'skip' | '' }>;
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
  competitorScreenshots: {},
  uvp: [],
  features: [],
  companyNameMeaning: '',
  logoRationale: '',
  logoRationaleChips: [],
  visualLanguageMood: { liked: [], skipped: [] },
  keywords: [],
  keywordImages: {},
  brandMessages: [],
  selectedValues: [],
  visualDirection: {
    value1: { valueName: '', moodLiked: [], moodSkipped: [] },
    value2: { valueName: '', moodLiked: [], moodSkipped: [] },
  },
  referenceBrands: [],
  referenceScreenshots: {},
  logoStyle: '',
  logoOpenToRecommendations: false,
  colorPaletteRatings: [],
};

export type BriefStep =
  | 'setup'
  | 'problem_solution'
  | 'market_position'
  | 'product'
  | 'brand_audit'
  | 'brand_voice'
  | 'brand_values_direction'
  | 'visual_references'
  | 'summary';

export const STEPS_ORDER: BriefStep[] = [
  'setup',
  'problem_solution',
  'market_position',
  'product',
  'brand_audit',
  'brand_voice',
  'brand_values_direction',
  'visual_references',
  'summary',
];
