import { Meal } from "./nutritionTypes";

// Recettes détaillées pour chaque plat
export const recipeDatabase: Record<string, {
    ingredients: { item: string; quantity: string }[];
    steps: string[];
    prepTime: number; // minutes
    cookTime: number;
    difficulty: "facile" | "moyen" | "difficile";
    tips: string[];
}> = {
    "db-pd-1": {
        ingredients: [
            { item: "Farine de mil", quantity: "200g" },
            { item: "Lait écrémé", quantity: "500ml" },
            { item: "Cannelle en poudre", quantity: "1 cuillère à café" },
            { item: "Noix de cajou concassées", quantity: "30g" },
            { item: "Eau", quantity: "200ml" }
        ],
        steps: [
            "Délayez la farine de mil dans un peu d'eau froide pour éviter les grumeaux",
            "Portez le lait à ébullition dans une casserole",
            "Versez progressivement le mélange de mil en remuant constamment",
            "Laissez cuire à feu doux pendant 10-15 minutes en remuant régulièrement",
            "Ajoutez la cannelle et mélangez bien",
            "Servez chaud avec les noix de cajou concassées sur le dessus"
        ],
        prepTime: 5,
        cookTime: 15,
        difficulty: "facile",
        tips: [
            "La cannelle aide à réguler la glycémie naturellement",
            "Vous pouvez remplacer le lait écrémé par du lait de soja non sucré",
            "Préparez la veille et réchauffez le matin pour gagner du temps"
        ]
    },
    "db-dej-1": {
        ingredients: [
            { item: "Riz complet", quantity: "150g (cru)" },
            { item: "Tilapia frais", quantity: "200g" },
            { item: "Tomates", quantity: "3 moyennes" },
            { item: "Oignons", quantity: "2" },
            { item: "Haricots verts", quantity: "150g" },
            { item: "Citron", quantity: "1" },
            { item: "Ail", quantity: "3 gousses" },
            { item: "Gingembre frais", quantity: "1 morceau" },
            { item: "Huile d'olive", quantity: "2 cuillères à soupe" }
        ],
        steps: [
            "Lavez le riz complet et faites-le cuire dans 2 fois son volume d'eau pendant 35-40 minutes",
            "Nettoyez le poisson, assaisonnez avec ail, gingembre, sel et citron",
            "Faites griller le poisson au four ou sur le grill pendant 15-20 minutes",
            "Pendant ce temps, préparez la sauce : mixez les tomates, oignons et ail",
            "Faites revenir la sauce dans l'huile d'olive pendant 10 minutes",
            "Faites cuire les haricots verts à la vapeur pendant 8 minutes",
            "Servez le riz avec le poisson grillé, la sauce et les haricots"
        ],
        prepTime: 15,
        cookTime: 40,
        difficulty: "moyen",
        tips: [
            "Le riz complet a un indice glycémique plus bas que le riz blanc",
            "Limitez la portion de riz à 150g cuit pour contrôler les glucides",
            "Le poisson apporte des oméga-3 bénéfiques pour le cœur"
        ]
    },
    "ht-pd-1": {
        ingredients: [
            { item: "Fonio", quantity: "150g" },
            { item: "Lait", quantity: "400ml" },
            { item: "Dattes dénoyautées", quantity: "4" },
            { item: "Amandes effilées", quantity: "20g" },
            { item: "Eau", quantity: "100ml" }
        ],
        steps: [
            "Rincez le fonio plusieurs fois jusqu'à ce que l'eau soit claire",
            "Faites bouillir l'eau et le lait ensemble",
            "Ajoutez le fonio et laissez cuire à feu doux pendant 10 minutes en remuant",
            "Coupez les dattes en petits morceaux",
            "Une fois le fonio cuit, ajoutez les dattes",
            "Servez chaud avec les amandes effilées"
        ],
        prepTime: 5,
        cookTime: 12,
        difficulty: "facile",
        tips: [
            "Le fonio est riche en magnésium, excellent pour la tension artérielle",
            "Pas besoin d'ajouter de sucre, les dattes suffisent",
            "Le fonio est une céréale ancestrale très nutritive"
        ]
    },
    "pp-dej-1": {
        ingredients: [
            { item: "Blanc de poulet", quantity: "150g" },
            { item: "Laitue", quantity: "100g" },
            { item: "Concombre", quantity: "1" },
            { item: "Tomates cerises", quantity: "10" },
            { item: "Haricots verts cuits", quantity: "80g" },
            { item: "Citron", quantity: "1" },
            { item: "Huile d'olive", quantity: "1 cuillère à soupe" },
            { item: "Moutarde", quantity: "1 cuillère à café" }
        ],
        steps: [
            "Assaisonnez le poulet avec du citron, ail et herbes",
            "Faites griller le poulet sans huile pendant 12-15 minutes",
            "Lavez et coupez tous les légumes en morceaux",
            "Préparez la vinaigrette : mélangez citron, huile d'olive et moutarde",
            "Disposez les légumes dans un grand bol",
            "Coupez le poulet en tranches et ajoutez-le à la salade",
            "Arrosez de vinaigrette et mélangez"
        ],
        prepTime: 10,
        cookTime: 15,
        difficulty: "facile",
        tips: [
            "Grande quantité de légumes pour un effet de satiété",
            "Le poulet grillé est une excellente source de protéines maigres",
            "Vous pouvez préparer le poulet à l'avance"
        ]
    },
    "pm-pd-1": {
        ingredients: [
            { item: "Farine de mil", quantity: "250g" },
            { item: "Lait entier", quantity: "500ml" },
            { item: "Pâte d'arachide", quantity: "50g" },
            { item: "Miel", quantity: "2 cuillères à soupe" },
            { item: "Banane", quantity: "2" },
            { item: "Eau", quantity: "200ml" }
        ],
        steps: [
            "Délayez la farine de mil dans l'eau froide",
            "Portez le lait à ébullition",
            "Versez le mélange de mil en remuant constamment",
            "Ajoutez la pâte d'arachide et mélangez bien",
            "Laissez cuire 15 minutes à feu doux",
            "Ajoutez le miel et les bananes écrasées",
            "Servez chaud avec des noix supplémentaires si désiré"
        ],
        prepTime: 5,
        cookTime: 18,
        difficulty: "facile",
        tips: [
            "Très calorique, parfait pour la prise de masse",
            "La pâte d'arachide ajoute protéines et bonnes graisses",
            "Mangez dans les 30 minutes après le réveil"
        ]
    },
    "en-dej-1": {
        ingredients: [
            { item: "Riz blanc", quantity: "200g" },
            { item: "Feuilles d'oseille fraîches", quantity: "300g" },
            { item: "Poisson (capitaine ou tilapia)", quantity: "200g" },
            { item: "Huile de palme rouge", quantity: "2 cuillères à soupe" },
            { item: "Tomates", quantity: "3" },
            { item: "Oignons", quantity: "2" },
            { item: "Ail", quantity: "4 gousses" },
            { item: "Piment (optionnel)", quantity: "1" }
        ],
        steps: [
            "Lavez et hachez finement les feuilles d'oseille",
            "Faites cuire le riz normalement",
            "Nettoyez et assaisonnez le poisson",
            "Faites revenir oignons et tomates dans l'huile de palme",
            "Ajoutez les feuilles d'oseille et un peu d'eau",
            "Laissez mijoter 20 minutes",
            "Ajoutez le poisson et laissez cuire 15 minutes supplémentaires",
            "Servez le riz avec la sauce feuilles et le poisson"
        ],
        prepTime: 20,
        cookTime: 40,
        difficulty: "moyen",
        tips: [
            "L'huile de palme rouge est riche en vitamine A, essentielle pour la grossesse",
            "Les feuilles vertes apportent du fer et de l'acide folique",
            "Le poisson fournit des oméga-3 pour le développement du bébé"
        ]
    },
    "nm-dej-1": {
        ingredients: [
            { item: "Riz", quantity: "200g" },
            { item: "Poulet", quantity: "300g" },
            { item: "Tomates", quantity: "5" },
            { item: "Concentré de tomate", quantity: "2 cuillères à soupe" },
            { item: "Oignons", quantity: "2" },
            { item: "Poivrons", quantity: "2" },
            { item: "Carottes", quantity: "2" },
            { item: "Haricots verts", quantity: "100g" },
            { item: "Huile", quantity: "3 cuillères à soupe" },
            { item: "Bouillon", quantity: "1 cube" },
            { item: "Ail et gingembre", quantity: "au goût" }
        ],
        steps: [
            "Coupez le poulet en morceaux et faites-le dorer dans l'huile",
            "Retirez le poulet et faites revenir les oignons",
            "Ajoutez les tomates mixées et le concentré",
            "Remettez le poulet et ajoutez de l'eau",
            "Laissez mijoter 30 minutes",
            "Ajoutez les légumes coupés et le bouillon",
            "Continuez la cuisson 15 minutes",
            "Servez avec le riz cuit à part"
        ],
        prepTime: 15,
        cookTime: 50,
        difficulty: "moyen",
        tips: [
            "Plat national burkinabè, équilibré et complet",
            "Vous pouvez ajouter d'autres légumes selon la saison",
            "Se conserve bien au réfrigérateur pour le lendemain"
        ]
    }
};

// Fonction pour obtenir une recette
export function getRecipe(mealId: string) {
    return recipeDatabase[mealId] || null;
}

// Conseils nutritionnels par condition
export const nutritionTips: Record<string, string[]> = {
    diabete: [
        "Mangez à heures régulières pour stabiliser votre glycémie",
        "Privilégiez les glucides complexes (mil, fonio, riz complet)",
        "Évitez les jus de fruits, préférez les fruits entiers",
        "Marchez 30 minutes après les repas principaux",
        "Contrôlez vos portions de féculents (150g cuit maximum)",
        "Buvez beaucoup d'eau (2L par jour minimum)"
    ],
    hypertension: [
        "Réduisez drastiquement le sel et les bouillons cubes",
        "Utilisez des épices et herbes pour assaisonner",
        "Mangez des fruits riches en potassium (banane, avocat)",
        "Le bissap naturel aide à baisser la tension",
        "Évitez les aliments transformés et conserves",
        "Pratiquez une activité physique régulière"
    ],
    ulcere: [
        "Mangez lentement et mâchez bien",
        "Évitez les repas trop épicés ou acides",
        "Privilégiez les cuissons douces (vapeur, bouilli)",
        "Mangez de petites portions mais plus fréquemment",
        "Évitez le café, l'alcool et le tabac",
        "Le lait tiède peut calmer les brûlures"
    ],
    "perte-poids": [
        "Créez un déficit calorique modéré (300-500 kcal/jour)",
        "Buvez de l'eau avant chaque repas",
        "Remplissez la moitié de votre assiette de légumes",
        "Évitez les boissons sucrées et sodas",
        "Dormez 7-8h par nuit pour réguler les hormones",
        "Pesez-vous une fois par semaine, pas tous les jours"
    ],
    "prise-masse": [
        "Mangez toutes les 3-4 heures",
        "Augmentez progressivement vos calories (+300-500/jour)",
        "Privilégiez les protéines à chaque repas",
        "N'oubliez pas les bonnes graisses (arachides, avocat)",
        "Buvez beaucoup d'eau (3L par jour)",
        "Combinez avec un entraînement de musculation"
    ],
    enceinte: [
        "Prenez de l'acide folique dès le début de grossesse",
        "Mangez du poisson 2-3 fois par semaine (oméga-3)",
        "Augmentez votre apport en fer (viande, épinards)",
        "Buvez 2-3L d'eau par jour",
        "Évitez les aliments crus ou mal cuits",
        "Prenez 3 collations par jour en plus des repas"
    ],
    normal: [
        "Variez votre alimentation pour tous les nutriments",
        "Mangez 5 fruits et légumes par jour",
        "Limitez les aliments transformés",
        "Buvez 1.5-2L d'eau par jour",
        "Pratiquez une activité physique régulière",
        "Écoutez vos sensations de faim et satiété"
    ]
};
