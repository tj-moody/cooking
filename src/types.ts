interface RecipeBase {
    name: string;
    cuisine: string;
    total_time: number;
    active_time: number;
    equipment: string[];
    calories_kcal: number;
    protein_g: number;
    sauce?: string | null;
    ingredients: string[];
    steps: string[];
}

export type QuickRecipe = RecipeBase;

export interface BatchRecipe extends RecipeBase {
    batch_servings: number;
    fridge_days: number;
    freezes_well: boolean;
    reheat: string;
}

export interface Sauce {
  name: string
  technique: 'blend' | 'simmer' | 'pan' | 'no-cook'
  flavor: string
  ingredients: string
  notes: string
  region: string
  profile: string
}

export interface RecipesData {
  quick: QuickRecipe[]
  batch: BatchRecipe[]
}

export interface Protein {
  name: string
  label: string
  cuts: string[]
}

export interface Accessory {
  name: string
  region: string
  type: string
}

export interface Build {
  id: number
  formFactor: string
  protein: string
  cut: string
  technique: string
  accessories: string[]
  sauce: string | null
  savedAt: string
}
