import { create } from 'zustand';

interface TitleData {
  text: string;
  length: number;
  status: 'optimal' | 'warning' | 'error';
  truncated: string;
}

interface DescriptionData {
  text: string;
  length: number;
  status: 'optimal' | 'warning' | 'error';
  truncated: string;
}

interface URLData {
  breadcrumb: string;
  status: 'optimal' | 'warning' | 'error';
}

interface Rule {
  id: string;
  name: string;
  status: 'pass' | 'warning' | 'error' | 'info';
  message: string;
  line?: number;
  value?: string | number;
  canFix?: boolean;
}

interface Category {
  id: string;
  name: string;
  score: number;
  passing: number;
  total: number;
  rules: Rule[];
}

interface ValidationData {
  title: TitleData;
  description: DescriptionData;
  url: URLData;
  score: number;
  categories: Category[];
}

interface ValidationState {
  // Data
  title: TitleData;
  description: DescriptionData;
  url: URLData;
  score: number;
  categories: Category[];

  // UI State
  mobilePreview: boolean;
  expandedCategories: string[];

  // Actions
  updateValidation: (data: ValidationData) => void;
  toggleMobilePreview: () => void;
  toggleCategory: (id: string) => void;
}

const initialTitle: TitleData = {
  text: '',
  length: 0,
  status: 'error',
  truncated: ''
};

const initialDescription: DescriptionData = {
  text: '',
  length: 0,
  status: 'error',
  truncated: ''
};

const initialURL: URLData = {
  breadcrumb: '',
  status: 'optimal'
};

export const useValidationStore = create<ValidationState>((set) => ({
  // Initial state
  title: initialTitle,
  description: initialDescription,
  url: initialURL,
  score: 0,
  categories: [],
  mobilePreview: false,
  expandedCategories: ['meta-tags', 'content', 'images', 'links'],

  // Actions
  updateValidation: (data: ValidationData) => set({
    title: data.title,
    description: data.description,
    url: data.url,
    score: data.score,
    categories: data.categories
  }),

  toggleMobilePreview: () => set((state) => ({
    mobilePreview: !state.mobilePreview
  })),

  toggleCategory: (id: string) => set((state) => ({
    expandedCategories: state.expandedCategories.includes(id)
      ? state.expandedCategories.filter(cat => cat !== id)
      : [...state.expandedCategories, id]
  }))
}));
