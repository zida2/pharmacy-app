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
    "db-pd-2": {
        ingredients: [
            { item: "Œufs", quantity: "2" },
            { item: "Tomate", quantity: "1" },
            { item: "Oignon", quantity: "1/2" },
            { item: "Poivron vert", quantity: "1/4" },
            { item: "Huile d'olive", quantity: "1 cuillère à café" },
            { item: "Sel et poivre", quantity: "une pincée" }
        ],
        steps: [
            "Battez les œufs dans un bol avec sel et sel",
            "Coupez les légumes en petits dés",
            "Faites chauffer l'huile dans une poêle antiadhésive",
            "Faites revenir les légumes 2-3 minutes",
            "Versez les œufs sur les légumes",
            "Laissez cuire à feu moyen jusqu'à la consistance désirée"
        ],
        prepTime: 5,
        cookTime: 5,
        difficulty: "facile",
        tips: ["Utilisez peu de matières grasses", "Accompagnez d'une tranche de pain complet"]
    },
    "db-dej-2": {
        ingredients: [
            { item: "Farine de petit mil", quantity: "200g" },
            { item: "Gombo frais", quantity: "150g" },
            { item: "Poisson fumé", quantity: "100g" },
            { item: "Tomates", quantity: "2" },
            { item: "Potasse", quantity: "une pincée" }
        ],
        steps: [
            "Préparez le tô en versant la farine dans l'eau bouillante et en tournant énergiquement",
            "Préparez la sauce : nettoyez et coupez les gombos",
            "Faites bouillir l'eau avec la potasse",
            "Ajoutez les gombos et laissez cuire 10min",
            "Ajoutez le poisson fumé émietté et les tomates",
            "Assaisonnez et laissez mijoter"
        ],
        prepTime: 15,
        cookTime: 30,
        difficulty: "moyen",
        tips: ["Le gombo a un effet bénéfique sur la glycémie", "Privilégiez le tô non sucré"]
    },
    "db-din-1": {
        ingredients: [
            { item: "Blanc de poulet", quantity: "150g" },
            { item: "Laitue", quantity: "1/2 pomme" },
            { item: "Concombre", quantity: "1/2" },
            { item: "Tomate", quantity: "1" },
            { item: "Avocat", quantity: "1/4" },
            { item: "Citron", quantity: "1/2" }
        ],
        steps: [
            "Faites griller le poulet assaisonné sans graisse",
            "Lavez et coupez tous les légumes",
            "Disposez dans une assiette",
            "Coupez le poulet grillé en lamelles",
            "Assaisonnez avec le jus de citron (pas d'huile le soir)"
        ],
        prepTime: 10,
        cookTime: 15,
        difficulty: "facile",
        tips: ["Dîner léger idéal", "Évitez les féculents le soir pour mieux contrôler la glycémie à jeun"]
    },
    "db-col-1": {
        ingredients: [
            { item: "Arachides grillées", quantity: "30g" }
        ],
        steps: [
            "Achetez des arachides non salées ou grillez-les vous-même au four",
            "Mesurez une petite poignée (30g)"
        ],
        prepTime: 0,
        cookTime: 0,
        difficulty: "facile",
        tips: ["Les arachides stabilisent la glycémie", "Attention à ne pas dépasser la dose"]
    },

    // HYPERTENSION
    "ht-pd-2": {
        ingredients: [
            { item: "Banane", quantity: "1" },
            { item: "Papaye", quantity: "1 tranche" },
            { item: "Mangue", quantity: "1/2" },
            { item: "Citron", quantity: "1/2" }
        ],
        steps: [
            "Lavez et pelez tous les fruits",
            "Coupez-les en dés de taille égale",
            "Mélangez délicatement dans un bol",
            "Arrosez de jus de citron pour la conservation"
        ],
        prepTime: 10,
        cookTime: 0,
        difficulty: "facile",
        tips: ["Riche en potassium", "Le citron ajoute de la saveur sans sodium"]
    },
    "ht-dej-2": {
        ingredients: [
            { item: "Filet de Capitaine", quantity: "200g" },
            { item: "Patates douces", quantity: "2 moyennes" },
            { item: "Ail", quantity: "2 gousses" },
            { item: "Gingembre", quantity: "1 morceau" },
            { item: "Herbes de Provence", quantity: "1 cuillère" }
        ],
        steps: [
            "Préchauffez le four à 180°C",
            "Disposez le poisson et les patates épluchées coupées sur une plaque",
            "Assaisonnez avec l'ail, le gingembre râpé et les herbes",
            "Enfournez pour 25 minutes",
            "Vérifiez la cuisson des patates"
        ],
        prepTime: 10,
        cookTime: 25,
        difficulty: "facile",
        tips: ["Cuisson au four préserve les nutriments", "Le gingembre remplace le sel"]
    },
    "ht-din-1": {
        ingredients: [
            { item: "Épinards frais", quantity: "300g" },
            { item: "Pommes de terre", quantity: "2" },
            { item: "Carottes", quantity: "2" },
            { item: "Oignon", quantity: "1" },
            { item: "Eau", quantity: "1L" }
        ],
        steps: [
            "Épluchez et coupez tous les légumes en morceaux",
            "Faites revenir l'oignon sans coloration",
            "Ajoutez les légumes et l'eau",
            "Laissez mijoter 30 minutes",
            "Mixez ou écrasez grossièrement",
            "Assaisonnez avec du poivre, sans sel"
        ],
        prepTime: 15,
        cookTime: 30,
        difficulty: "facile",
        tips: ["Potage riche en minéraux", "Hydratant pour la nuit"]
    },
    "ht-col-1": {
        ingredients: [
            { item: "Fleurs d'hibiscus (Bissap)", quantity: "1 poignée" },
            { item: "Eau", quantity: "1L" },
            { item: "Menthe fraîche", quantity: "1 branche" }
        ],
        steps: [
            "Rincez les fleurs de bissap",
            "Faites bouillir l'eau",
            "Ajoutez le bissap et la menthe hors du feu",
            "Laissez infuser 15 minutes",
            "Filtrez et mettez au frais"
        ],
        prepTime: 5,
        cookTime: 15,
        difficulty: "facile",
        tips: ["Boire froid", "Ne pas sucrer pour l'hypertension"]
    },

    // ULCERE
    "ul-pd-1": {
        ingredients: [
            { item: "Riz blanc", quantity: "100g" },
            { item: "Lait", quantity: "200ml" },
            { item: "Miel", quantity: "1 cuillère" },
            { item: "Eau", quantity: "500ml" }
        ],
        steps: [
            "Faites trop cuire le riz dans beaucoup d'eau jusqu'à ce qu'il soit très tendre",
            "Ajoutez le lait en fin de cuisson",
            "Laissez tiédir",
            "Ajoutez le miel avant de servir"
        ],
        prepTime: 2,
        cookTime: 25,
        difficulty: "facile",
        tips: ["Texture douce pour l'estomac", "Le riz blanc est facile à digérer"]
    },
    "ul-pd-2": {
        ingredients: [
            { item: "Banane très mûre", quantity: "2" },
            { item: "Yaourt nature", quantity: "1 pot" }
        ],
        steps: [
            "Écrasez grossièrement les bananes à la fourchette",
            "Mélangez avec le yaourt nature",
            "Mangez lentement"
        ],
        prepTime: 2,
        cookTime: 0,
        difficulty: "facile",
        tips: ["La banane tapisse la paroi gastrique", "Yaourt doux pour l'acidité"]
    },
    "ul-dej-1": {
        ingredients: [
            { item: "Patates douces", quantity: "300g" },
            { item: "Blanc de poulet", quantity: "150g" },
            { item: "Carottes", quantity: "2" },
            { item: "Huile de tournesol", quantity: "1 cuillère" }
        ],
        steps: [
            "Faites bouillir les patates et carottes jusqu'à ce qu'elles soient fondantes",
            "Écrasez-les en purée avec un peu d'huile",
            "Pochez le poulet dans de l'eau bouillante",
            "Coupez le poulet finement"
        ],
        prepTime: 15,
        cookTime: 25,
        difficulty: "facile",
        tips: ["Aucune épice forte", "Texture purée idéale"]
    },
    "ul-dej-2": {
        ingredients: [
            { item: "Riz blanc", quantity: "150g" },
            { item: "Filet de poisson", quantity: "150g" },
            { item: "Courgettes", quantity: "1" }
        ],
        steps: [
            "Cuisez le riz à l'eau",
            "Cuisez le poisson et les courgettes à la vapeur",
            "Assaisonnez avec un peu de sel uniquement",
            "Servez tiède"
        ],
        prepTime: 10,
        cookTime: 15,
        difficulty: "facile",
        tips: ["Cuisson vapeur préserve sans irriter", "Mangez calmement"]
    },
    "ul-din-1": {
        ingredients: [
            { item: "Légumes variés (carotte, pomme de terre)", quantity: "300g" },
            { item: "Lait ou crème légère", quantity: "50ml" }
        ],
        steps: [
            "Faites bouillir les légumes",
            "Passez le tout au mixeur",
            "Ajoutez le lait pour adoucir",
            "Servez tiède"
        ],
        prepTime: 10,
        cookTime: 20,
        difficulty: "facile",
        tips: ["Le liquide passe mieux le soir", "Adoucit l'estomac"]
    },
    "ul-col-1": {
        ingredients: [
            { item: "Lait demi-écrémé", quantity: "200ml" },
            { item: "Miel", quantity: "1 cuillère à café" }
        ],
        steps: ["Chauffez légèrement le lait", "Ajoutez le miel"],
        prepTime: 2,
        cookTime: 2,
        difficulty: "facile",
        tips: ["Apaise les brûlures nocturnes"]
    },

    // PERTE DE POIDS
    "pp-pd-2": {
        ingredients: [
            { item: "Épinards frais", quantity: "1 poignée" },
            { item: "Mangue", quantity: "1/2" },
            { item: "Banane", quantity: "1/2" },
            { item: "Graines de chia", quantity: "1 cuillère" },
            { item: "Eau", quantity: "200ml" }
        ],
        steps: [
            "Mettez tous les ingrédients dans un mixeur",
            "Mixez jusqu'à obtenir une texture lisse",
            "Buvez immédiatement"
        ],
        prepTime: 5,
        cookTime: 0,
        difficulty: "facile",
        tips: ["Boost de vitamines", "Les fibres des épinards aident au transit"]
    },
    "pp-dej-2": {
        ingredients: [
            { item: "Farine de mil", quantity: "100g" },
            { item: "Feuilles d'épinard ou oseille", quantity: "200g" },
            { item: "Poisson maigre fumé", quantity: "100g" },
            { item: "Ail, Oignon", quantity: "au goût" }
        ],
        steps: [
            "Faites un tô léger (plus d'eau)",
            "Préparez une sauce feuilles avec très peu d'huile",
            "Ajoutez le poisson pour le goût",
            "Servez une petite portion de tô avec beaucoup de sauce"
        ],
        prepTime: 15,
        cookTime: 25,
        difficulty: "moyen",
        tips: ["Le volume des légumes remplit l'estomac", "Réduisez la part de féculent"]
    },
    "pp-din-1": {
        ingredients: [
            { item: "Tilapia entier", quantity: "1" },
            { item: "Brocolis ou chou", quantity: "200g" },
            { item: "Citron", quantity: "1" },
            { item: "Épices kan kan", quantity: "1 pincée" }
        ],
        steps: [
            "Grillez le poisson au charbon ou four sans huile",
            "Faites cuire les légumes à la vapeur",
            "Assaisonnez avec citron et épices"
        ],
        prepTime: 10,
        cookTime: 20,
        difficulty: "facile",
        tips: ["Protéines pures le soir", "Favorise le déstockage nocturne"]
    },
    "pp-col-1": {
        ingredients: [{ item: "Orange", quantity: "1" }],
        steps: ["Épluchez et mangez les quartiers entiers"],
        prepTime: 1,
        cookTime: 0,
        difficulty: "facile",
        tips: ["Les fibres de l'orange sont dans la pulpe", "Mieux que le jus"]
    },

    // PRISE DE MASSE
    "pm-pd-2": {
        ingredients: [
            { item: "Œufs entiers", quantity: "4" },
            { item: "Igname", quantity: "300g" },
            { item: "Huile de friture", quantity: "pour l'igname" },
            { item: "Oignon", quantity: "1" }
        ],
        steps: [
            "Faites frire ou bouillir l'igname",
            "Faites une omelette baveuse avec les 4 œufs",
            "Servez généreusement"
        ],
        prepTime: 10,
        cookTime: 20,
        difficulty: "facile",
        tips: ["Protéines de haute qualité", "Glucides denses pour l'énergie"]
    },
    "pm-dej-1": {
        ingredients: [
            { item: "Riz", quantity: "250g" },
            { item: "Viande de bœuf", quantity: "200g" },
            { item: "Huile", quantity: "50ml" },
            { item: "Pâte de tomate", quantity: "1 boite" }
        ],
        steps: [
            "Faites frire la viande",
            "Préparez le riz au gras classiquement avec beaucoup de légumes",
            "Servez une grande assiette"
        ],
        prepTime: 15,
        cookTime: 45,
        difficulty: "moyen",
        tips: ["Plat complet", "Ne pas hésiter sur la quantité"]
    },
    "pm-dej-2": {
        ingredients: [
            { item: "Farine de mil", quantity: "200g" },
            { item: "Pâte d'arachide", quantity: "100g" },
            { item: "Viande", quantity: "150g" }
        ],
        steps: [
            "Faites un tô consistant",
            "Préparez une sauce arachide riche avec la viande",
            "L'arachide doit être abondante"
        ],
        prepTime: 20,
        cookTime: 40,
        difficulty: "moyen",
        tips: ["L'arachide est très calorique", "Excellent pour la masse"]
    },
    "pm-din-1": {
        ingredients: [
            { item: "Poulet", quantity: "1/2" },
            { item: "Riz", quantity: "200g" },
            { item: "Haricots rouges", quantity: "100g" }
        ],
        steps: [
            "Rôtissez le poulet",
            "Cuisez riz et haricots ensemble (waakye)",
            "Mangez avant 21h"
        ],
        prepTime: 10,
        cookTime: 40,
        difficulty: "moyen",
        tips: ["Combo riz+haricots = protéines complètes", "Récupération musculaire"]
    },
    "pm-col-1": {
        ingredients: [
            { item: "Lait entier", quantity: "300ml" },
            { item: "Banane", quantity: "2" },
            { item: "Pâte d'arachide", quantity: "1 cuillère" },
            { item: "Flocons d'avoine", quantity: "50g" }
        ],
        steps: ["Mixez tout ensemble", "Buvez frais"],
        prepTime: 5,
        cookTime: 0,
        difficulty: "facile",
        tips: ["Gainer maison naturel", "1000 calories potentielles"]
    },

    // ENCEINTE
    "en-pd-1": {
        ingredients: [
            { item: "Fonio", quantity: "150g" },
            { item: "Lait enrichi", quantity: "300ml" }
        ],
        steps: ["Bouillie de fonio au lait classique"],
        prepTime: 5,
        cookTime: 10,
        difficulty: "facile",
        tips: ["Digeste et nutritif", "Bon pour le bébé"]
    },
    "en-pd-2": {
        ingredients: [
            { item: "Œufs", quantity: "2" },
            { item: "Épinards", quantity: "100g" },
            { item: "Fromage", quantity: "30g" }
        ],
        steps: ["Brouillade d'œufs aux épinards bien cuits"],
        prepTime: 5,
        cookTime: 8,
        difficulty: "facile",
        tips: ["Bien cuire les œufs (salmonelle)", "Fer calcium"]
    },
    "en-dej-2": {
        ingredients: [
            { item: "Haricots rouges (niébé)", quantity: "200g" },
            { item: "Igname", quantity: "200g" },
            { item: "Huile rouge", quantity: "1 cuillère" }
        ],
        steps: ["Ragoût haricots et igname (Benga)"],
        prepTime: 15,
        cookTime: 45,
        difficulty: "facile",
        tips: ["Le Benga est très nutritif", "L'association légumineuse/tubercule est bonne"]
    },
    "en-din-1": {
        ingredients: [
            { item: "Légumes variés", quantity: "300g" },
            { item: "Poulet", quantity: "100g" }
        ],
        steps: ["Soupe épaisse de légumes et poulet"],
        prepTime: 15,
        cookTime: 30,
        difficulty: "facile",
        tips: ["Facile à manger", "Hydratant"]
    },
    "en-col-1": {
        ingredients: [
            { item: "Yaourt", quantity: "1 pot" },
            { item: "Fruits secs", quantity: "1 poignée" }
        ],
        steps: ["Mélangez"],
        prepTime: 1,
        cookTime: 0,
        difficulty: "facile",
        tips: ["Calcium pour les os du bébé"]
    },

    // NORMAL
    "nm-pd-1": {
        ingredients: [{ item: "Mil", quantity: "150g" }, { item: "Lait", quantity: "200ml" }],
        steps: ["Bouillie classique"],
        prepTime: 5,
        cookTime: 15,
        difficulty: "facile",
        tips: ["Énergie durable"]
    },
    "nm-pd-2": {
        ingredients: [{ item: "Pain", quantity: "1/2 baguette" }, { item: "Œufs", quantity: "2" }],
        steps: ["Omelette dans le pain"],
        prepTime: 5,
        cookTime: 5,
        difficulty: "facile",
        tips: ["Rapide et efficace"]
    },
    "nm-dej-2": {
        ingredients: [{ item: "Tô", quantity: "200g" }, { item: "Sauce gombo", quantity: "1 bol" }],
        steps: ["Préparation traditionnelle"],
        prepTime: 30,
        cookTime: 45,
        difficulty: "moyen",
        tips: ["Le classique burkinabè"]
    },
    "nm-din-1": {
        ingredients: [{ item: "Riz", quantity: "150g" }, { item: "Sauce", quantity: "1 louche" }],
        steps: ["Riz sauce simple"],
        prepTime: 10,
        cookTime: 20,
        difficulty: "facile",
        tips: ["Manger léger le soir"]
    },
    "nm-col-1": {
        ingredients: [{ item: "Mangue", quantity: "1" }],
        steps: ["Coupez et mangez"],
        prepTime: 2,
        cookTime: 0,
        difficulty: "facile",
        tips: ["Vitamines C"]
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
