import recipesData from '../recipes.json'
import saucesData from '../sauces.json'
import type { RecipesData, Sauce } from './types'

export const recipes = recipesData as RecipesData
export const sauces = saucesData as Sauce[]
