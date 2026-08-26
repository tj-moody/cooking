import recipesData from '../recipes.json'
import saucesData from '../sauces.json'
import formFactorsData from "../form_factors.json";
import proteinsData from "../proteins.json";
import techniquesData from "../techniques.json";
import accessoriesData from "../accessories.json";
import type {
  Accessory,
  Build,
  Protein,
  RecipesData,
  Sauce,
} from "./types";

export const recipes = recipesData as RecipesData;
export const sauces = saucesData as Sauce[];
export const formFactors = formFactorsData as string[];
export const proteins = proteinsData as Protein[];
export const techniques = techniquesData as string[];
export const accessories = accessoriesData as Accessory[];

const STORAGE_KEY = 'cooking.builds'

export function loadBuilds(): Build[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Build[]
  } catch {
    return []
  }
}

export function saveBuild(build: Build): Build[] {
  const builds = [build, ...loadBuilds()]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(builds))
  return builds
}

export function removeBuild(id: number): Build[] {
  const builds = loadBuilds().filter((b) => b.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(builds))
  return builds
}
