export interface PlatIngredient {
  id: string; // Référence à l'ingrédient dans la section ingredients
  quantite: number;
  unite: string;
  commentaire?: string; // Optionnel, spécifique au plat
}

export interface Plat {
  id: string;
  nom: string;
  type: 'camerounais' | 'européen'; // Type de plat
  image: string; // URL Cloudinary
  ingredients: PlatIngredient[];
}

export interface Ingredient {
  id: string;
  nom: string;
  image: string; // URL Cloudinary
  prixUnitaire?: number; // Optionnel si inutilisé
}