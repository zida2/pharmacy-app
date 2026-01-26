import { Meal, DietCondition } from "./nutritionTypes";

// Base de données complète de repas par condition
export const mealDatabase: Record<DietCondition, Meal[]> = {
    diabete: [
        {
            id: "db-pd-1",
            name: "Bouillie de Mil au Lait Écrémé",
            time: "petit-dejeuner",
            description: "Bouillie traditionnelle à faible indice glycémique",
            calories: 280,
            ingredients: ["Mil", "Lait écrémé", "Cannelle", "Noix de cajou"],
            tips: "La cannelle aide à réguler la glycémie",
            image: "🥣"
        },
        {
            id: "db-pd-2",
            name: "Omelette aux Légumes",
            time: "petit-dejeuner",
            description: "Riche en protéines, faible en glucides",
            calories: 220,
            ingredients: ["2 œufs", "Tomates", "Oignons", "Poivrons", "Huile d'olive"],
            tips: "Évitez le pain blanc, préférez le pain complet",
            image: "🍳"
        },
        {
            id: "db-dej-1",
            name: "Riz Complet au Poisson Braisé",
            time: "dejeuner",
            description: "Glucides complexes avec protéines maigres",
            calories: 450,
            ingredients: ["Riz complet", "Tilapia", "Sauce tomate légère", "Haricots verts", "Citron"],
            tips: "Portion de riz limitée à 150g cuit",
            image: "🍚"
        },
        {
            id: "db-dej-2",
            name: "Tô de Mil avec Sauce Gombo",
            time: "dejeuner",
            description: "Plat traditionnel adapté pour diabétiques",
            calories: 380,
            ingredients: ["Farine de mil", "Gombo frais", "Poisson fumé", "Tomates", "Oignons"],
            tips: "Le gombo aide à stabiliser la glycémie",
            image: "🍲"
        },
        {
            id: "db-din-1",
            name: "Salade de Poulet Grillé",
            time: "diner",
            description: "Léger et nutritif pour le soir",
            calories: 320,
            ingredients: ["Poulet grillé", "Laitue", "Concombre", "Tomates", "Avocat", "Citron"],
            tips: "Dîner léger pour éviter les pics nocturnes",
            image: "🥗"
        },
        {
            id: "db-col-1",
            name: "Arachides Grillées",
            time: "collation",
            description: "Collation riche en protéines",
            calories: 150,
            ingredients: ["Arachides non salées"],
            tips: "Portion contrôlée : 30g maximum",
            image: "🥜"
        }
    ],

    hypertension: [
        {
            id: "ht-pd-1",
            name: "Bouillie de Fonio au Lait",
            time: "petit-dejeuner",
            description: "Céréale locale riche en magnésium",
            calories: 260,
            ingredients: ["Fonio", "Lait", "Dattes", "Amandes"],
            tips: "Le fonio est excellent pour la tension",
            image: "🥣"
        },
        {
            id: "ht-pd-2",
            name: "Fruits Frais Variés",
            time: "petit-dejeuner",
            description: "Banane, papaye, mangue",
            calories: 180,
            ingredients: ["Banane", "Papaye", "Mangue", "Jus de citron"],
            tips: "Riches en potassium, aident à réguler la tension",
            image: "🍌"
        },
        {
            id: "ht-dej-1",
            name: "Riz Blanc avec Sauce Arachide Légère",
            time: "dejeuner",
            description: "Version allégée du plat traditionnel",
            calories: 420,
            ingredients: ["Riz", "Pâte d'arachide naturelle", "Poulet", "Légumes variés"],
            tips: "Sans sel ajouté, utilisez des épices",
            image: "🍛"
        },
        {
            id: "ht-dej-2",
            name: "Poisson au Four avec Patates Douces",
            time: "dejeuner",
            description: "Oméga-3 pour la santé cardiovasculaire",
            calories: 400,
            ingredients: ["Capitaine", "Patates douces", "Ail", "Gingembre", "Citron"],
            tips: "Le poisson est meilleur que la viande rouge",
            image: "🐟"
        },
        {
            id: "ht-din-1",
            name: "Soupe de Légumes Verts",
            time: "diner",
            description: "Riche en potassium et magnésium",
            calories: 180,
            ingredients: ["Épinards", "Oseille", "Carottes", "Oignons", "Ail"],
            tips: "Sans bouillon cube (trop de sodium)",
            image: "🥬"
        },
        {
            id: "ht-col-1",
            name: "Bissap Naturel",
            time: "collation",
            description: "Infusion d'hibiscus sans sucre",
            calories: 20,
            ingredients: ["Fleurs d'hibiscus", "Gingembre", "Menthe"],
            tips: "Le bissap aide à baisser la tension",
            image: "🍵"
        }
    ],

    ulcere: [
        {
            id: "ul-pd-1",
            name: "Bouillie de Riz Crémeuse",
            time: "petit-dejeuner",
            description: "Douce pour l'estomac",
            calories: 240,
            ingredients: ["Riz blanc", "Lait", "Miel"],
            tips: "Évitez les épices fortes le matin",
            image: "🥣"
        },
        {
            id: "ul-pd-2",
            name: "Banane Mûre avec Yaourt",
            time: "petit-dejeuner",
            description: "Protège la muqueuse gastrique",
            calories: 200,
            ingredients: ["Banane bien mûre", "Yaourt nature"],
            tips: "La banane tapisse l'estomac",
            image: "🍌"
        },
        {
            id: "ul-dej-1",
            name: "Purée de Patates Douces au Poulet Bouilli",
            time: "dejeuner",
            description: "Facile à digérer",
            calories: 380,
            ingredients: ["Patates douces", "Poulet bouilli", "Carottes cuites"],
            tips: "Évitez les fritures et sauces piquantes",
            image: "🍠"
        },
        {
            id: "ul-dej-2",
            name: "Riz Blanc avec Poisson Vapeur",
            time: "dejeuner",
            description: "Cuisson douce sans irritation",
            calories: 360,
            ingredients: ["Riz blanc", "Tilapia vapeur", "Courgettes", "Carottes"],
            tips: "Pas de tomate ni de piment",
            image: "🍚"
        },
        {
            id: "ul-din-1",
            name: "Soupe de Légumes Mixée",
            time: "diner",
            description: "Velouté apaisant",
            calories: 160,
            ingredients: ["Carottes", "Pommes de terre", "Courgettes", "Lait"],
            tips: "Texture lisse pour éviter l'irritation",
            image: "🥣"
        },
        {
            id: "ul-col-1",
            name: "Lait Tiède au Miel",
            time: "collation",
            description: "Calme l'acidité",
            calories: 120,
            ingredients: ["Lait", "Miel"],
            tips: "À boire entre les repas",
            image: "🥛"
        }
    ],

    "perte-poids": [
        {
            id: "pp-pd-1",
            name: "Omelette aux Légumes et Avocat",
            time: "petit-dejeuner",
            description: "Protéines et bonnes graisses",
            calories: 280,
            ingredients: ["2 œufs", "Épinards", "Tomates", "1/4 avocat"],
            tips: "Les protéines augmentent la satiété",
            image: "🍳"
        },
        {
            id: "pp-pd-2",
            name: "Smoothie Vert Énergisant",
            time: "petit-dejeuner",
            description: "Vitamines et fibres",
            calories: 180,
            ingredients: ["Épinards", "Mangue", "Banane", "Graines de chia"],
            tips: "Riche en fibres, coupe la faim",
            image: "🥤"
        },
        {
            id: "pp-dej-1",
            name: "Salade Complète au Poulet",
            time: "dejeuner",
            description: "Légère mais rassasiante",
            calories: 350,
            ingredients: ["Poulet grillé", "Laitue", "Concombre", "Tomates", "Haricots verts", "Vinaigrette légère"],
            tips: "Beaucoup de volume, peu de calories",
            image: "🥗"
        },
        {
            id: "pp-dej-2",
            name: "Tô de Mil Portion Contrôlée",
            time: "dejeuner",
            description: "Plat traditionnel adapté",
            calories: 320,
            ingredients: ["Farine de mil (100g)", "Sauce feuilles", "Poisson maigre"],
            tips: "Portion réduite, sauce légère",
            image: "🍲"
        },
        {
            id: "pp-din-1",
            name: "Poisson Grillé aux Légumes Vapeur",
            time: "diner",
            description: "Protéines maigres",
            calories: 280,
            ingredients: ["Tilapia grillé", "Brocolis", "Carottes", "Haricots verts", "Citron"],
            tips: "Dîner léger pour favoriser la perte de poids",
            image: "🐟"
        },
        {
            id: "pp-col-1",
            name: "Fruits Frais",
            time: "collation",
            description: "Collation naturelle",
            calories: 80,
            ingredients: ["Papaye ou Orange"],
            tips: "Évitez les jus, mangez le fruit entier",
            image: "🍊"
        }
    ],

    "prise-masse": [
        {
            id: "pm-pd-1",
            name: "Bouillie de Mil Enrichie",
            time: "petit-dejeuner",
            description: "Haute en calories et protéines",
            calories: 450,
            ingredients: ["Mil", "Lait entier", "Arachides moulues", "Miel", "Banane"],
            tips: "Ajoutez des noix pour plus de calories",
            image: "🥣"
        },
        {
            id: "pm-pd-2",
            name: "Omelette 4 Œufs avec Igname",
            time: "petit-dejeuner",
            description: "Protéines et glucides complexes",
            calories: 520,
            ingredients: ["4 œufs", "Igname bouillie", "Fromage", "Avocat"],
            tips: "Mangez dans les 30min après le réveil",
            image: "🍳"
        },
        {
            id: "pm-dej-1",
            name: "Riz au Gras avec Viande",
            time: "dejeuner",
            description: "Plat complet riche en calories",
            calories: 650,
            ingredients: ["Riz", "Viande de bœuf", "Huile", "Légumes", "Arachides"],
            tips: "Grande portion pour la prise de masse",
            image: "🍛"
        },
        {
            id: "pm-dej-2",
            name: "Tô avec Sauce Arachide Complète",
            time: "dejeuner",
            description: "Protéines végétales et glucides",
            calories: 580,
            ingredients: ["Farine de mil", "Pâte d'arachide", "Viande", "Légumes"],
            tips: "Plat traditionnel très calorique",
            image: "🍲"
        },
        {
            id: "pm-din-1",
            name: "Poulet Rôti avec Riz et Haricots",
            time: "diner",
            description: "Protéines complètes",
            calories: 550,
            ingredients: ["Poulet entier", "Riz", "Haricots rouges", "Légumes"],
            tips: "Mangez 2-3h avant le coucher",
            image: "🍗"
        },
        {
            id: "pm-col-1",
            name: "Smoothie Protéiné Maison",
            time: "collation",
            description: "Entre les repas",
            calories: 380,
            ingredients: ["Lait", "Banane", "Arachides", "Miel", "Avoine"],
            tips: "2-3 collations par jour",
            image: "🥤"
        }
    ],

    enceinte: [
        {
            id: "en-pd-1",
            name: "Bouillie de Fonio au Lait",
            time: "petit-dejeuner",
            description: "Riche en fer et calcium",
            calories: 320,
            ingredients: ["Fonio", "Lait", "Dattes", "Amandes"],
            tips: "Le fonio est riche en acide folique",
            image: "🥣"
        },
        {
            id: "en-pd-2",
            name: "Œufs Brouillés avec Épinards",
            time: "petit-dejeuner",
            description: "Fer et protéines",
            calories: 280,
            ingredients: ["2 œufs", "Épinards frais", "Tomates", "Fromage"],
            tips: "Les épinards apportent du fer",
            image: "🍳"
        },
        {
            id: "en-dej-1",
            name: "Riz avec Sauce Feuilles et Poisson",
            time: "dejeuner",
            description: "Oméga-3 pour le bébé",
            calories: 480,
            ingredients: ["Riz", "Feuilles d'oseille", "Poisson", "Huile de palme rouge"],
            tips: "L'huile rouge apporte de la vitamine A",
            image: "🍚"
        },
        {
            id: "en-dej-2",
            name: "Haricots Rouges avec Igname",
            time: "dejeuner",
            description: "Protéines végétales et fer",
            calories: 420,
            ingredients: ["Haricots rouges", "Igname", "Tomates", "Oignons"],
            tips: "Combinez avec de la vitamine C (citron)",
            image: "🫘"
        },
        {
            id: "en-din-1",
            name: "Soupe de Légumes Variés",
            time: "diner",
            description: "Vitamines et minéraux",
            calories: 240,
            ingredients: ["Carottes", "Épinards", "Pommes de terre", "Poulet"],
            tips: "Hydratation importante",
            image: "🥣"
        },
        {
            id: "en-col-1",
            name: "Yaourt avec Fruits Secs",
            time: "collation",
            description: "Calcium et énergie",
            calories: 180,
            ingredients: ["Yaourt nature", "Dattes", "Noix de cajou"],
            tips: "3 collations par jour recommandées",
            image: "🥛"
        }
    ],

    normal: [
        {
            id: "nm-pd-1",
            name: "Bouillie de Mil Traditionnelle",
            time: "petit-dejeuner",
            description: "Petit-déjeuner équilibré",
            calories: 300,
            ingredients: ["Mil", "Lait", "Sucre", "Arachides"],
            tips: "Énergie pour toute la matinée",
            image: "🥣"
        },
        {
            id: "nm-pd-2",
            name: "Pain avec Omelette",
            time: "petit-dejeuner",
            description: "Classique et nutritif",
            calories: 320,
            ingredients: ["Pain", "2 œufs", "Tomates", "Oignons"],
            tips: "Ajoutez des légumes pour plus de vitamines",
            image: "🥖"
        },
        {
            id: "nm-dej-1",
            name: "Riz Sauce Tomate avec Poulet",
            time: "dejeuner",
            description: "Plat complet équilibré",
            calories: 480,
            ingredients: ["Riz", "Tomates", "Poulet", "Légumes variés"],
            tips: "Plat national burkinabè",
            image: "🍛"
        },
        {
            id: "nm-dej-2",
            name: "Tô avec Sauce Gombo",
            time: "dejeuner",
            description: "Traditionnel et nutritif",
            calories: 420,
            ingredients: ["Farine de mil", "Gombo", "Poisson fumé", "Tomates"],
            tips: "Riche en fibres",
            image: "🍲"
        },
        {
            id: "nm-din-1",
            name: "Riz Gras",
            time: "diner",
            description: "Savoureux et rassasiant",
            calories: 450,
            ingredients: ["Riz", "Viande", "Légumes", "Huile", "Épices"],
            tips: "Version modérée pour le soir",
            image: "🍚"
        },
        {
            id: "nm-col-1",
            name: "Fruits de Saison",
            time: "collation",
            description: "Vitamines naturelles",
            calories: 100,
            ingredients: ["Mangue, Papaye ou Orange"],
            tips: "Variez les fruits selon la saison",
            image: "🥭"
        }
    ]
};

// Générateur de plan hebdomadaire
export function generateWeeklyPlan(condition: DietCondition, startDate: Date): any[] {
    const meals = mealDatabase[condition];
    const plan = [];

    for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + day);

        const dayMeals = [
            meals.filter(m => m.time === "petit-dejeuner")[day % 2], // Alterne entre 2 options
            meals.filter(m => m.time === "dejeuner")[day % 2],
            meals.filter(m => m.time === "diner")[0], // Toujours le même dîner
            meals.filter(m => m.time === "collation")[0]
        ].filter(Boolean);

        plan.push({
            date: currentDate.toISOString().split('T')[0],
            dayName: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"][currentDate.getDay()],
            theme: getThemeForDay(condition, day),
            meals: dayMeals
        });
    }

    return plan;
}

function getThemeForDay(condition: DietCondition, day: number): string {
    const themes: Record<DietCondition, string[]> = {
        diabete: ["Équilibre Glycémique", "Fibres & Protéines", "Contrôle Sucre", "Énergie Stable", "Jour Léger", "Nutrition Complète", "Repos Digestif"],
        hypertension: ["Cœur Sain", "Potassium+", "Sans Sel", "Détox Naturelle", "Circulation", "Légèreté", "Équilibre"],
        ulcere: ["Douceur Gastrique", "Protection Muqueuse", "Anti-Acidité", "Repos Digestif", "Cicatrisation", "Apaisement", "Régénération"],
        "perte-poids": ["Déficit Calorique", "Brûle-Graisse", "Satiété", "Métabolisme+", "Détox", "Léger & Nutritif", "Boost Énergie"],
        "prise-masse": ["Surplus Calorique", "Protéines Max", "Énergie Dense", "Croissance", "Force", "Récupération", "Masse Musculaire"],
        enceinte: ["Fer & Calcium", "Oméga-3", "Acide Folique", "Énergie Maman", "Vitamines", "Hydratation", "Nutrition Bébé"],
        normal: ["Équilibre", "Tradition", "Énergie", "Variété", "Plaisir", "Santé", "Bien-être"]
    };

    return themes[condition][day];
}
