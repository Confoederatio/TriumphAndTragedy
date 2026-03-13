config.goods = { //[WIP] - Redo mine chances, buy/sell prices
  //Special scope - these goods are entirely hidden from public view
  hidden: {
    knowledge: {
      name: "Knowledge",
      icon: "knowledge",

      doesnt_stack: true,
      research_good: true,
      worth: 500
    }
  },

  //Crafting Points - Represents training capacity for military units
  crafting_points: {
    name: "Crafting Points",
    icon: "labourers",
    type: "category",

    ground_units_cp: {
      name: "Army CP",
      icon: "active_personnel",

      is_cp: true,
      doesnt_stack: true,
      worth: 200
    },
    ground_artillery_cp: {
      name: "Artillery CP",
      icon: "artillery",

      is_cp: true,
      doesnt_stack: true,
      worth: 250
    },
    ground_vehicles_cp: {
      name: "Armour CP",
      icon: "land_vehicles",

      is_cp: true,
      doesnt_stack: true,
      worth: 350
    },
    aeroplanes_cp: {
      name: "Air CP",
      icon: "aeroplanes",

      is_cp: true,
      doesnt_stack: true,
      worth: 500
    },
    naval_units_cp: {
      name: "Naval CP",
      icon: "naval_units",

      is_cp: true,
      doesnt_stack: true,
      worth: 250
    }
  },

  raw_resources: {
    name: "Raw Materials",
    icon: "government",
    type: "category",

    animal_products: {
      name: "Animal Products",
      type: "category",

      beeswax: {
        name: "Beeswax",
        icon: "beeswax",
        type: "inferior",
        buy_price: 50
      },
      eggs: {
        name: "Eggs",
        icon: "eggs",
        type: "necessary",
        buy_price: 10
      },
      goat_milk: {
        name: "Goat Milk",
        icon: "goat_milk",
        type: "normal",
        buy_price: 100
      },
      ivory: {
        name: "Ivory",
        icon: "ivory",
        type: "luxury",
        buy_price: 100000
      },
      leather: {
        name: "Leather",
        icon: "leather",
        type: "luxury",
        buy_price: 100
      },
      milk: {
        name: "Milk",
        icon: "milk",
        type: "giffen",
        buy_price: 80
      },
      pearls: {
        name: "Pearls",
        icon: "pearls",
        type: "veblen",
        buy_price: 50000
      },
      whale_oil: {
        name: "Whale Oil",
        icon: "whale_oil",
        type: "normal",
        buy_price: 2000
      }
    },
    caoutchouc: {
      name: "Caoutchouc",
      icon: "caoutchouc",
      type: "normal",
      buy_price: 5000
    },
    cotton: {
      name: "Cotton",
      icon: "cotton",
      type: "normal",
      buy_price: 1000
    },
    grains: {
      name: "Grains/Starchy Foods",
      type: "category",

      corn: {
        name: "Corn",
        icon: "corn",
        type: "giffen",
        buy_price: 500
      },
      potatoes: {
        name: "Potatoes",
        icon: "potatoes",
        type: "giffen",
        buy_price: 50
      },
      rice: {
        name: "Rice",
        icon: "rice",
        type: "giffen",
        buy_price: 200
      },
      teff: {
        name: "Teff",
        icon: "teff",
        type: "necessary",
        buy_price: 300
      },
      wheat: {
        name: "Wheat",
        icon: "wheat",
        type: "giffen",
        buy_price: 400
      }
    },
    feathers: {
      name: "Feathers",
      icon: "feathers",
      type: "normal",
      buy_price: 50
    },
    fruits: {
      name: "Fruits",
      type: "category",

      apples: {
        name: "Apples",
        icon: "apples",
        type: "necessary",
        buy_price: 150
      },
      grapes: {
        name: "Grapes",
        icon: "grapes",
        type: "necessary",
        buy_price: 300
      },
      olives: {
        name: "Olives",
        icon: "olives",
        type: "normal",
        buy_price: 250
      },
      pumpkins: {
        name: "Pumpkins",
        icon: "pumpkins",
        type: "normal",
        buy_price: 100
      },
      strawberries: {
        name: "Strawberries",
        icon: "strawberries",
        type: "necessary",
        buy_price: 200
      },
      sunflowers: {
        name: "Sunflowers",
        icon: "sunflowers",
        type: "normal",
        buy_price: 50
      },
      watermelons: {
        name: "Watermelons",
        icon: "watermelons",
        type: "necessary",
        buy_price: 100
      }
    },
    furs: {
      name: "Furs",
      icon: "furs",
      type: "luxury",
      buy_price: 1500
    },
    meat: {
      name: "Meat",
      type: "category",

      beef: {
        name: "Beef",
        icon: "beef",
        type: "necessary",
        buy_price: 300
      },
      camel_meat: {
        name: "Camel Meat",
        icon: "camel_meat",
        type: "inferior",
        buy_price: 350
      },
      chicken: {
        name: "Chicken",
        icon: "chicken",
        type: "necessary",
        buy_price: 250
      },
      crab: {
        name: "Crab",
        icon: "crab",
        type: "normal",
        buy_price: 400
      },
      cuy: {
        name: "Cuy",
        icon: "cuy",
        type: "normal",
        buy_price: 150
      },
      duck: {
        name: "Duck",
        icon: "duck",
        type: "luxury",
        buy_price: 300
      },
      fish: {
        name: "Fish",
        icon: "fish",
        type: "inferior",
        buy_price: 200
      },
      goat_meat: {
        name: "Goat Meat",
        icon: "goat_meat",
        type: "normal",
        buy_price: 250
      },
      lobster: {
        name: "Lobster",
        icon: "lobster",
        type: "luxury",
        buy_price: 500
      },
      mutton: {
        name: "Mutton",
        icon: "mutton",
        type: "luxury",
        buy_price: 300
      },
      oyster: {
        name: "Oyster",
        icon: "oyster",
        type: "normal",
        buy_price: 200
      },
      pork: {
        name: "Pork",
        icon: "pork",
        type: "inferior",
        buy_price: 200
      },
      rabbit_meat: {
        name: "Rabbit Meat",
        icon: "rabbit_meat",
        type: "luxury",
        buy_price: 250
      },
      reindeer: {
        name: "Reindeer",
        icon: "reindeer",
        type: "luxury",
        buy_price: 650
      },
      shrimp: {
        name: "Shrimp",
        icon: "shrimp",
        type: "normal",
        buy_price: 400
      },
      venison: {
        name: "Venison",
        icon: "venison",
        type: "luxury",
        buy_price: 350
      },
      yak: {
        name: "Yak",
        icon: "yak",
        type: "necessary",
        buy_price: 400
      }
    },
    nuts: {
      name: "Nuts",
      type: "category",

      peanuts: {
        name: "Peanuts",
        icon: "peanuts",
        type: "inferior",
        buy_price: 100
      },
      walnuts: {
        name: "Walnuts",
        icon: "walnuts",
        type: "normal",
        buy_price: 150
      }
    },
    other_crops: {
      name: "Other Crops",
      type: "category",

      blue_agaves: {
        name: "Blue Agaves",
        icon: "blue_agaves",
        type: "normal",
        buy_price: 200
      },
      hemp: {
        name: "Hemp",
        icon: "hemp",
        type: "inferior",
        buy_price: 120
      },
      hops: {
        name: "Hops",
        icon: "hops",
        type: "normal",
        buy_price: 180
      },
      poppies: {
        name: "Poppies",
        icon: "poppies",
        type: "normal",
        buy_price: 230
      }
    },
    petroil: {
      name: "Petroil",
      icon: "petroil",
      type: "inferior",
      buy_price: 1250
    },
    raw_dyes: {
      name: "Raw Dyes",
      type: "category",

      carmine_bugs: {
        name: "Carmine Bugs",
        icon: "carmine_bugs",
        type: "luxury",
        buy_price: 1000
      },
      indigo: {
        name: "Indigo",
        icon: "indigo",
        type: "luxury",
        buy_price: 400
      },
      woad: {
        name: "Woad",
        icon: "woad",
        type: "luxury",
        buy_price: 300
      }
    },
    raw_minerals: {
      name: "Raw Minerals",
      type: "category",

      acanthite: {
        name: "Acanthite",
        icon: "acanthite",
        type: "normal",
        mine_action_chance: 14, //8,314 million tons
        buy_price: 2500
      },
      anthracite: {
        name: "Anthracite",
        icon: "anthracite",
        type: "normal",
        mine_action_chance: 34, //219 billion tonnes
        buy_price: 300
      },
      arsenopyrite: {
        name: "Arsenopyrite",
        icon: "arsenopyrite",
        type: "normal",
        mine_action_chance: 15, //25 million tons
        buy_price: 1800
      },
      baryte: {
        name: "Baryte",
        aliases: ["Barite"],
        icon: "baryte",
        type: "normal",
        mine_action_chance: 28, //2 billion tons
        buy_price: 100
      },
      bauxite: {
        name: "Bauxite",
        icon: "bauxite",
        type: "normal",
        mine_action_chance: 33, //31 billion tonnes
        buy_price: 150
      },
      beryl: {
        name: "Beryl",
        icon: "beryl",
        type: "normal",
        mine_action_chance: 5, //100 thousand tons
        buy_price: 500
      },
      bitumen: {
        name: "Bitumen",
        icon: "bitumen",
        type: "normal",
        mine_action_chance: 29, //10,513 billion tons
        buy_price: 80
      },
      bornite: {
        name: "Bornite",
        icon: "bornite",
        type: "normal",
        mine_action_chance: 20, //90 million tons
        buy_price: 2000
      },
      cassiterite: {
        name: "Cassiterite",
        icon: "cassiterite",
        type: "normal",
        mine_action_chance: 22, //155 million tons
        buy_price: 800
      },
      chalcocite: {
        name: "Chalcocite",
        icon: "chalcocite",
        type: "normal",
        mine_action_chance: 30, //12,5 billion tonnes
        buy_price: 2100
      },
      chalcopyrite: {
        name: "Chalcopyrite",
        icon: "chalcopyrite",
        type: "normal",
        mine_action_chance: 25, //700 million tonnes
        buy_price: 1200
      },
      chromite: {
        name: "Chromite",
        icon: "chromite",
        type: "normal",
        mine_action_chance: 24, //560 million tonnes
        buy_price: 400
      },
      cinnabar: {
        name: "Cinnabar",
        icon: "cinnabar",
        type: "normal",
        mine_action_chance: 6, //147 thousand tons
        buy_price: 1800
      },
      cobaltite: {
        name: "Cobalt",
        icon: "cobalt",
        type: "normal",
        mine_action_chance: 16, //25 million tonnes
        buy_price: 3000
      },
      coltan: {
        name: "Coltan",
        icon: "coltan",
        type: "normal",
        mine_action_chance: 1, //1 thousand tonnes
        buy_price: 4500
      },
      cooperite: {
        name: "Cooperite",
        icon: "cooperite",
        type: "normal",
        mine_action_chance: 3, //10 thousand tonnes
        buy_price: 2400
      },
      fluorite: {
        name: "Fluorite",
        icon: "fluorite",
        type: "normal",
        mine_action_chance: 26, //1 billion tonnes
        buy_price: 500
      },
      galena: {
        name: "Galena",
        icon: "galena",
        type: "normal",
        mine_action_chance: 19, //85 million tonnes
        buy_price: 800
      },
      hematite: {
        name: "Hematite",
        icon: "hematite",
        type: "normal",
        mine_action_chance: 32, //28,31 billion tons
        buy_price: 100
      },
      ilmenite: {
        name: "Ilmenite",
        icon: "ilmenite",
        type: "normal",
        mine_action_chance: 23, //160 million tonnes
        buy_price: 150
      },
      kimberlite: {
        name: "Kimberlite",
        icon: "kimberlite",
        type: "luxury",
        mine_action_chance: 17, //26 million tonnes
        buy_price: 2000
      },
      lignite: {
        name: "Lignite",
        icon: "lignite",
        type: "normal",
        mine_action_chance: 35, //400 billion tonnes
        buy_price: 50
      },
      magnetite: {
        name: "Magnetite",
        icon: "magnetite",
        type: "normal",
        mine_action_chance: 31, //13,8 billion tons
        buy_price: 120
      },
      malachite: {
        name: "Malachite",
        icon: "malachite",
        type: "normal",
        mine_action_chance: 1, //1 thousand tonnes
        buy_price: 900
      },
      molybdenite: {
        name: "Molybdenite",
        icon: "molybdenite",
        type: "normal",
        mine_action_chance: 4, //20 million tonnes
        buy_price: 2500
      },
      native_gold: {
        name: "Native Gold",
        type: "category",

        placer_gold: {
          name: "Placer Gold",
          icon: "placer_gold",
          type: "luxury",
          mine_action_chance: 5, //180 tons prod.
          buy_price: 5600
        },
        quartz_gold: {
          name: "Quartz Gold",
          icon: "quartz_gold",
          type: "luxury",
          mine_action_chance: 7, //244 thousand tonnes
          buy_price: 5000
        }
      },
      nitre: {
        name: "Nitre",
        icon: "nitre",
        type: "normal",
        mine_action_chance: 9, //1 million tons
        buy_price: 50
      },
      pentlandite: {
        name: "Pentlandite",
        icon: "pentlandite",
        type: "normal",
        mine_action_chance: 21, //100 million tonnes
        buy_price: 1800
      },
      pyrolusite: {
        name: "Pyrolusite",
        icon: "pyrolusite",
        type: "normal",
        mine_action_chance: 13, //6,4 million tonnes
        buy_price: 400
      },
      quartz_sand: {
        name: "Quartz Sand",
        icon: "quartz_sand",
        type: "normal",
        mine_action_chance: 27, //1,665 billion tonnes
        buy_price: 50
      },
      ruby: {
        name: "Ruby",
        icon: "ruby",
        type: "luxury",
        mine_action_chance: 2, //10 thousand tons
        buy_price: 5000
      },
      scheelite: {
        name: "Scheelite",
        icon: "scheelite",
        type: "normal",
        mine_action_chance: 11, //3 million tons
        buy_price: 800
      },
      sperrylite: {
        name: "Sperrylite",
        icon: "sperrylite",
        type: "normal",
        mine_action_chance: 8, //900 thousand tons
        buy_price: 3000
      },
      sphalerite: {
        name: "Sphalerite",
        icon: "sphalerite",
        type: "normal",
        mine_action_chance: 12, //5,256 million tonnes
        buy_price: 900
      },
      uraninite: {
        name: "Uraninite",
        icon: "uraninite",
        type: "normal",
        mine_action_chance: 10, //1,5 million tons
        buy_price: 1800
      },
      wolframite: {
        name: "Wolframite",
        icon: "wolframite",
        type: "normal",
        mine_action_chance: 18, //42 million tonnes
        buy_price: 1000
      }
    },
    seasoning: {
      name: "Seasoning",
      type: "category",

      bell_peppers: {
        name: "Bell Peppers",
        icon: "bell_peppers",
        type: "normal",
        buy_price: 80
      },
      camphor: {
        name: "Camphor",
        icon: "camphor",
        type: "normal",
        buy_price: 2500
      },
      cardamom: {
        name: "Cardamom",
        icon: "cardamom",
        type: "normal",
        buy_price: 3000
      },
      cayenne: {
        name: "Cayenne",
        icon: "cayenne",
        type: "normal",
        buy_price: 100
      },
      chilli: {
        name: "Chilli",
        icon: "chilli",
        type: "normal",
        aliases: ["chili"],
        buy_price: 90
      },
      cinnamon: {
        name: "Cinnamon",
        icon: "cinnamon",
        type: "luxury",
        buy_price: 2200
      },
      cloves: {
        name: "Cloves",
        icon: "cloves",
        type: "luxury",
        buy_price: 1800
      },
      fennel: {
        name: "Fennel",
        icon: "fennel",
        type: "normal",
        buy_price: 1500
      },
      fenugreek: {
        name: "Fenugreek",
        icon: "fenugreek",
        type: "normal",
        buy_price: 1200
      },
      garlic: {
        name: "Garlic",
        icon: "garlic",
        type: "normal",
        buy_price: 800
      },
      ginger: {
        name: "Ginger",
        icon: "ginger",
        type: "normal",
        buy_price: 1300
      },
      linseed: {
        name: "Linseed",
        icon: "linseed",
        type: "normal",
        buy_price: 100
      },
      mustard: {
        name: "Mustard",
        icon: "mustard",
        type: "normal",
        buy_price: 400
      },
      nutmeg: {
        name: "Nutmeg",
        icon: "nutmeg",
        type: "normal",
        buy_price: 2500
      },
      oil_palm_fruit: {
        name: "Oil Palm Fruit",
        icon: "oil_palm_fruit",
        type: "normal",
        buy_price: 1200
      },
      paprika: {
        name: "Paprika",
        icon: "paprika",
        type: "normal",
        buy_price: 150
      },
      pepper: {
        name: "Pepper",
        icon: "pepper",
        type: "normal",
        buy_price: 2800
      },
      rapeseed: {
        name: "Rapeseed",
        icon: "rapeseed",
        type: "normal",
        buy_price: 200
      },
      sugarcane: {
        name: "Sugarcane",
        icon: "sugarcane",
        type: "normal",
        buy_price: 300
      }
    },
    stone: {
      name: "Stone",
      type: "category",

      andesite: {
        name: "Andesite",
        icon: "andesite",
        type: "normal",
        quarry_action_chance: 4,
        buy_price: 50
      },
      basalt: {
        name: "Basalt",
        icon: "basalt",
        type: "normal",
        quarry_action_chance: 6,
        buy_price: 60
      },
      chalk: {
        name: "Chalk",
        icon: "chalk",
        type: "normal",
        quarry_action_chance: 2,
        buy_price: 30
      },
      clay: {
        name: "Clay",
        icon: "clay",
        type: "normal",
        quarry_action_chance: 6,
        buy_price: 20
      },
      diorite: {
        name: "Diorite",
        icon: "diorite",
        type: "normal",
        quarry_action_chance: 3,
        buy_price: 40
      },
      dolomite: {
        name: "Dolomite",
        icon: "dolomite",
        type: "normal",
        quarry_action_chance: 3,
        buy_price: 70
      },
      fieldstone: {
        name: "Fieldstone",
        icon: "fieldstone",
        type: "normal",
        quarry_action_chance: 2,
        buy_price: 25
      },
      flagstone: {
        name: "Flagstone",
        icon: "flagstone",
        type: "normal",
        quarry_action_chance: 1,
        buy_price: 25
      },
      flint: {
        name: "Flint",
        icon: "flint",
        type: "normal",
        quarry_action_chance: 2,
        buy_price: 40
      },
      granite: {
        name: "Granite",
        icon: "granite",
        type: "normal",
        quarry_action_chance: 6,
        buy_price: 50
      },
      limestone: {
        name: "Limestone",
        icon: "limestone",
        type: "normal",
        quarry_action_chance: 7,
        buy_price: 30
      },
      marble: {
        name: "Marble",
        icon: "marble",
        type: "normal",
        quarry_action_chance: 4,
        buy_price: 80
      },
      sandstone: {
        name: "Sandstone",
        icon: "sandstone",
        type: "normal",
        quarry_action_chance: 8,
        buy_price: 40
      },
      shale: {
        name: "Shale",
        icon: "shale",
        type: "normal",
        quarry_action_chance: 8,
        buy_price: 20
      },
      slate: {
        name: "Slate",
        icon: "slate",
        type: "normal",
        quarry_action_chance: 5,
        buy_price: 45
      }
    },
    tropical_crops: {
      name: "Tropical Crops",
      type: "category",

      bananas: {
        name: "Bananas",
        icon: "bananas",
        type: "normal",
        buy_price: 50
      },
      cacao: {
        name: "Cacao",
        icon: "coffee_beans",
        type: "normal",
        buy_price: 180
      },
      citrus: {
        name: "Citrus",
        icon: "citrus",
        type: "normal",
        buy_price: 70
      },
      coffee_beans: {
        name: "Coffee Beans",
        icon: "coffee_beans",
        type: "normal",
        buy_price: 300
      },
      dates: {
        name: "Dates",
        icon: "dates",
        type: "normal",
        buy_price: 100
      },
      guavas: {
        name: "Guavas",
        icon: "guavas",
        type: "normal",
        buy_price: 80
      },
      mangoes: {
        name: "Mangoes",
        aliases: ["Mangos"],
        icon: "mangoes",
        type: "normal",
        buy_price: 120
      },
      mangosteens: {
        name: "Mangosteens",
        icon: "mangosteens",
        type: "normal",
        buy_price: 200
      },
      sweet_potatoes: {
        name: "Sweet Potatoes",
        icon: "sweet_potatoes",
        type: "normal",
        buy_price: 60
      },
      tobacco: {
        name: "Tobacco",
        icon: "tobacco",
        type: "normal",
        buy_price: 250
      },
      yam: {
        name: "Yam",
        icon: "yams",
        type: "normal",
        buy_price: 70
      }
    },
    vegetables: {
      name: "Vegetables",
      type: "category",

      cabbage: {
        name: "Cabbage",
        icon: "cabbage",
        type: "inferior",
        buy_price: 40
      },
      carrot: {
        name: "Carrot",
        icon: "carrot",
        type: "inferior",
        buy_price: 30
      },
      chicory: {
        name: "Chicory",
        icon: "chicory",
        type: "inferior",
        buy_price: 50
      },
      cucumbers: {
        name: "Cucumbers",
        icon: "cucumbers",
        type: "inferior",
        buy_price: 35
      },
      eggplants: {
        name: "Eggplants",
        icon: "eggplants",
        type: "inferior",
        buy_price: 45
      },
      lettuce: {
        name: "Lettuce",
        icon: "lettuce",
        type: "inferior",
        buy_price: 55
      },
      onions: {
        name: "Onions",
        icon: "onions",
        type: "inferior",
        buy_price: 25
      },
      peas: {
        name: "Peas",
        icon: "peas",
        type: "inferior",
        buy_price: 40
      },
      soybeans: {
        name: "Soybeans",
        icon: "soybeans",
        type: "inferior",
        buy_price: 70
      },
      spinach: {
        name: "Spinach",
        icon: "spinach",
        type: "inferior",
        buy_price: 50
      },
      tomatoes: {
        name: "Tomatoes",
        icon: "tomatoes",
        type: "normal",
        buy_price: 65
      },
      turnips: {
        name: "Turnips",
        icon: "turnips",
        type: "giffen",
        buy_price: 30
      }
    },
    wood: {
      name: "Wood",
      type: "category",

      acacia: {
        name: "Acacia",
        icon: "acacia",
        type: "normal",
        chop_action_chance: 6,
        buy_price: 80
      },
      ash: {
        name: "Ash",
        icon: "ash",
        type: "luxury",
        chop_action_chance: 6,
        buy_price: 90
      },
      balsa: {
        name: "Balsa",
        icon: "balsa",
        type: "inferior",
        chop_action_chance: 3,
        buy_price: 100
      },
      basswood: {
        name: "Basswood",
        icon: "basswood",
        type: "normal",
        chop_action_chance: 4,
        buy_price: 110
      },
      blackwood: {
        name: "Blackwood",
        icon: "blackwood",
        type: "normal",
        chop_action_chance: 3,
        buy_price: 120
      },
      bloodwood: {
        name: "Bloodwood",
        icon: "bloodwood",
        type: "luxury",
        chop_action_chance: 2,
        buy_price: 130
      },
      cedar: {
        name: "Cedar",
        icon: "cedar",
        type: "luxury",
        chop_action_chance: 7,
        buy_price: 140
      },
      cherry: {
        name: "Cherry",
        icon: "cherry",
        type: "normal",
        chop_action_chance: 5,
        buy_price: 150
      },
      chestnut: {
        name: "Chestnut",
        icon: "chestnut",
        type: "normal",
        chop_action_chance: 4,
        buy_price: 160
      },
      cottonwood: {
        name: "Cottonwood",
        icon: "cottonwood",
        type: "normal",
        chop_action_chance: 3,
        buy_price: 100
      },
      cypress: {
        name: "Cypress",
        icon: "cypress",
        type: "normal",
        chop_action_chance: 6,
        buy_price: 120
      },
      ebony: {
        name: "Ebony",
        icon: "ebony",
        type: "veblen",
        chop_action_chance: 2,
        buy_price: 250
      },
      elm: {
        name: "Elm",
        icon: "elm",
        type: "normal",
        chop_action_chance: 4,
        buy_price: 140
      },
      eucalyptus: {
        name: "Eucalyptus",
        icon: "eucalyptus",
        type: "normal",
        chop_action_chance: 8,
        buy_price: 110
      },
      fir: {
        name: "Fir",
        icon: "fir",
        type: "normal",
        chop_action_chance: 5,
        buy_price: 120
      },
      hickory: {
        name: "Hickory",
        icon: "hickory",
        type: "normal",
        chop_action_chance: 4,
        buy_price: 130
      },
      ironwood: {
        name: "Ironwood",
        icon: "ironwood",
        type: "luxury",
        chop_action_chance: 2,
        buy_price: 220
      },
      lacewood: {
        name: "Lacewood",
        icon: "lacewood",
        type: "normal",
        chop_action_chance: 1,
        buy_price: 170
      },
      mahogany: {
        name: "Mahogany",
        icon: "mahogany",
        type: "luxury",
        chop_action_chance: 5,
        buy_price: 180
      },
      maple: {
        name: "Maple",
        icon: "maple",
        type: "normal",
        chop_action_chance: 6,
        buy_price: 160
      },
      oak: {
        name: "Oak",
        icon: "oak",
        type: "normal",
        chop_action_chance: 8,
        buy_price: 150
      },
      pine: {
        name: "Pine",
        icon: "pine",
        type: "normal",
        chop_action_chance: 8,
        buy_price: 90
      },
      redwood: {
        name: "Redwood",
        icon: "redwood",
        type: "normal",
        chop_action_chance: 7,
        buy_price: 130
      },
      rosewood: {
        name: "Rosewood",
        icon: "rosewood",
        type: "luxury",
        chop_action_chance: 3,
        buy_price: 200
      },
      sandalwood: {
        name: "Sandalwood",
        icon: "sandalwood",
        type: "veblen",
        chop_action_chance: 2,
        buy_price: 210
      },
      spruce: {
        name: "Spruce",
        icon: "spruce",
        type: "normal",
        chop_action_chance: 7,
        buy_price: 100
      },
      turpentine: {
        name: "Turpentine",
        icon: "turpentine",
        type: "normal",
        chop_action_chance: 1,
        buy_price: 100
      },
      walnut: {
        name: "Walnut",
        icon: "walnut",
        type: "normal",
        chop_action_chance: 5,
        buy_price: 190
      },
      willow: {
        name: "Willow",
        icon: "willow",
        type: "normal",
        chop_action_chance: 6,
        buy_price: 80
      }
    },
    wool: {
      name: "Wool",
      type: "category",

      alpaca_wool: {
        name: "Alpaca Wool",
        icon: "alpaca_wool",
        type: "normal",
        buy_price: 120
      },
      goat_wool: {
        name: "Goat Wool",
        icon: "goat_wool",
        type: "normal",
        buy_price: 100
      },
      sheep_wool: {
        name: "Sheep Wool",
        icon: "sheep_wool",
        type: "inferior",
        buy_price: 80
      }
    }
  },

  intermediate_goods: {
    name: "Intermediate Goods",
    type: "category",

    aluminium: {
      name: "Aluminium",
      aliases: ["aluminum"],
      icon: "aluminium",
      buy_price: 2000
    },
    brass: {
      name: "Brass",
      icon: "brass",
      type: "normal",
      buy_price: 2500
    },
    bronze: {
      name: "Bronze",
      icon: "bronze",
      type: "normal",
      buy_price: 2300
    },
    cabins: {
      name: "Cabins",
      icon: "cabins",
      type: "normal",
      buy_price: 3000
    },
    coals: {
      name: "Coals",
      type: "category",

      bituminous_coal: {
        name: "Bituminous Coal",
        icon: "bituminous_coal",
        type: "normal",
        buy_price: 70
      },
      brown_coal: {
        name: "Brown Coal",
        icon: "brown_coal",
        type: "normal",
        buy_price: 50
      },
      charcoal: {
        name: "Charcoal",
        icon: "charcoal",
        type: "normal",
        buy_price: 100
      },
      coal_coke: {
        name: "Coal Coke",
        icon: "coal_coke",
        type: "normal",
        buy_price: 120
      },
      hard_coal: {
        name: "Hard Coal",
        icon: "hard_coal",
        type: "normal",
        buy_price: 80
      },
      peat: {
        name: "Peat",
        icon: "peat",
        type: "inferior",
        buy_price: 40
      }
    },
    concrete: {
      name: "Concrete",
      icon: "concrete",
      type: "normal",
      buy_price: 100
    },
    copper_wire: {
      name: "Copper Wire",
      icon: "copper_wire",
      type: "normal",
      buy_price: 3000
    },
    electric_gear: {
      name: "Electric Gear",
      icon: "electric_gear",
      type: "normal",
      buy_price: 2500
    },
    electronics: {
      name: "Electronics",
      type: "category",

      capacitors: {
        name: "Capacitors",
        icon: "capacitors",
        type: "normal",
        buy_price: 4000
      },
      resistors: {
        name: "Resistors",
        icon: "resistors",
        type: "normal",
        buy_price: 3500
      },
      transistors: {
        name: "Transistors",
        icon: "transistors",
        type: "normal",
        buy_price: 5000
      }
    },
    engines: {
      name: "Engines",
      icon: "engines",
      type: "normal",
      buy_price: 3000
    },
    explosives: {
      name: "Explosives",
      type: "category",

      anfo: {
        name: "ANFO",
        icon: "anfo",
        type: "normal",
        buy_price: 800
      },
      dynamite: {
        name: "Dynamite",
        icon: "dynamite",
        type: "normal",
        buy_price: 2500
      },
      plastic_explosives: {
        name: "Plastic Explosives",
        icon: "plastic_explosives",
        type: "normal",
        buy_price: 3500
      },
      tnt: {
        name: "TNT",
        icon: "tnt",
        type: "normal",
        buy_price: 4000
      }
    },
    fabric: {
      name: "Fabric",
      type: "category",

      cloth: {
        name: "Cloth",
        icon: "cloth",
        type: "normal",
        buy_price: 90
      },
      linen: {
        name: "Linen",
        icon: "linen",
        type: "normal",
        buy_price: 110
      },
      synthetic_fabric: {
        name: "Synthetic Fabric",
        icon: "synthetic_fabric",
        type: "normal",
        buy_price: 120
      }
    },
    felt: {
      name: "Felt",
      icon: "felt",
      type: "normal",
      buy_price: 80
    },
    filaments: {
      name: "Filaments",
      icon: "filaments",
      type: "normal",
      buy_price: 150
    },
    flour: {
      name: "Flour",
      icon: "flour",
      type: "inferior",
      buy_price: 40
    },
    glass: {
      name: "Glass",
      icon: "glass",
      type: "normal",
      buy_price: 100
    },
    gunpowder: {
      name: "Gunpowder",
      icon: "gunpowder",
      type: "normal",
      buy_price: 300
    },
    industrial_chemicals: {
      name: "Industrial Chemicals",
      type: "category",

      acetic_acid: {
        name: "Acetic Acid",
        icon: "acetic_acid",
        type: "normal",
        buy_price: 2000
      },
      acetone: {
        name: "Acetone",
        icon: "acetone",
        type: "normal",
        buy_price: 1800
      },
      ammonia: {
        name: "Ammonia",
        icon: "ammonia",
        type: "normal",
        buy_price: 1200
      },
      argon: {
        name: "Argon",
        icon: "argon",
        type: "normal",
        buy_price: 5000
      },
      benzene: {
        name: "Benzene",
        icon: "benzene",
        type: "normal",
        buy_price: 2500
      },
      bromine: {
        name: "Bromine",
        icon: "bromine",
        type: "normal",
        buy_price: 2800
      },
      butadiene: {
        name: "Butadiene",
        icon: "butadiene",
        type: "normal",
        buy_price: 3200
      },
      calcium: {
        name: "Calcium",
        icon: "calcium",
        type: "normal",
        buy_price: 800
      },
      calcium_carbonate: {
        name: "Calcium Carbonate",
        icon: "calcium_carbonate",
        type: "normal",
        buy_price: 900
      },
      carbon: {
        name: "Carbon",
        icon: "carbon",
        type: "normal",
        buy_price: 1000
      },
      chlorine: {
        name: "Chlorine",
        icon: "chlorine",
        type: "normal",
        buy_price: 2200
      },
      epoxyethane: {
        name: "Epoxyethane",
        icon: "epoxyethane",
        type: "normal",
        buy_price: 3500
      },
      ethanol: {
        name: "Ethanol",
        icon: "ethanol",
        type: "normal",
        buy_price: 1800
      },
      ethylene: {
        name: "Ethylene",
        icon: "ethylene",
        type: "normal",
        buy_price: 2500
      },
      ethylene_glycol: {
        name: "Ethylene Glycol",
        icon: "ethylene_glycol",
        type: "normal",
        buy_price: 2700
      },
      fluorine: {
        name: "Fluorine",
        icon: "fluorine",
        type: "normal",
        buy_price: 4000
      },
      formaldehyde: {
        name: "Formaldehyde",
        icon: "formaldehyde",
        type: "normal",
        buy_price: 3000
      },
      hydrochloric_acid: {
        name: "Hydrochloric Acid",
        icon: "hydrochloric_acid",
        type: "normal",
        buy_price: 2200
      },
      hydrogen: {
        name: "Hydrogen",
        icon: "hydrogen",
        type: "normal",
        buy_price: 1500
      },
      hydrogen_fluoride: {
        name: "Hydrogen Fluoride",
        icon: "hydrogen_fluoride",
        type: "normal",
        buy_price: 3800
      },
      hydrogen_peroxide: {
        name: "Hydrogen Peroxide",
        icon: "hydrogen_peroxide",
        type: "normal",
        buy_price: 2600
      },
      iodine: {
        name: "Iodine",
        icon: "iodine",
        type: "normal",
        buy_price: 3200
      },
      krypton: {
        name: "Krypton",
        icon: "krypton",
        type: "normal",
        buy_price: 5000
      },
      methanol: {
        name: "Methanol",
        icon: "methanol",
        type: "normal",
        buy_price: 1900
      },
      methylbenzene: {
        name: "Methylbenzene",
        icon: "methylbenzene",
        type: "normal",
        buy_price: 2400
      },
      methyl_tertiary_butyl_ether: {
        name: "Methyl Tertiary-butyl Ether",
        icon: "methyl_tertiary_butyl_ether",
        type: "normal",
        aliases: ["MTBE"],
        buy_price: 3000
      },
      neon: {
        name: "Neon",
        icon: "neon",
        type: "normal",
        buy_price: 4500
      },
      nitric_acid: {
        name: "Nitric Acid",
        icon: "nitric_acid",
        type: "normal",
        buy_price: 2800
      },
      nitrogen: {
        name: "Nitrogen",
        icon: "nitrogen",
        type: "normal",
        buy_price: 800
      },
      oxygen: {
        name: "Oxygen",
        icon: "oxygen",
        type: "normal",
        buy_price: 700
      },
      phenol: {
        name: "Phenol",
        icon: "phenol",
        type: "normal",
        buy_price: 2700
      },
      propylene: {
        name: "Propylene",
        icon: "propylene",
        type: "normal",
        buy_price: 2800
      },
      phosphoric_acid: {
        name: "Phosphoric Acid",
        icon: "phosphoric_acid",
        type: "normal",
        buy_price: 2100
      },
      phosphorus: {
        name: "Phosphorus",
        icon: "phosphorus",
        type: "normal",
        buy_price: 1200
      },
      sodium_carbonate: {
        name: "Sodium Carbonate",
        icon: "sodium_carbonate",
        type: "normal",
        buy_price: 900
      },
      sodium_hydroxide: {
        name: "Sodium Hydroxide",
        icon: "sodium_hydroxide",
        type: "normal",
        buy_price: 1000
      },
      sulphur: {
        name: "Sulphur",
        icon: "sulphur",
        type: "normal",
        buy_price: 600
      },
      sulphuric_acid: {
        name: "Sulphuric Acid",
        icon: "sulphuric_acid",
        type: "normal",
        buy_price: 2200
      },
      titanium_dioxide: {
        name: "Titanium Dioxide",
        icon: "titanium_dioxide",
        type: "normal",
        buy_price: 1800
      },
      urea: {
        name: "Urea",
        icon: "urea",
        type: "normal",
        buy_price: 1100
      },
      xenon: {
        name: "Xenon",
        icon: "xenon",
        type: "normal",
        buy_price: 5000
      }
    },
    integrated_circuits: {
      name: "Integrated Circuits",
      icon: "integrated_circuits",
      type: "normal",
      buy_price: 6000
    },
    locomotives: {
      name: "Locomotives",
      icon: "locomotives",
      type: "normal",
      buy_price: 3500
    },
    machine_parts: {
      name: "Machine Parts",
      icon: "machine_parts",
      type: "normal",
      buy_price: 2500
    },
    malt: {
      name: "Malt",
      icon: "malt",
      type: "normal",
      buy_price: 100
    },
    molasses: {
      name: "Molasses",
      icon: "molasses",
      type: "normal",
      buy_price: 80
    },
    natural_gas: {
      name: "Natural Gas",
      icon: "natural_gas",
      type: "normal",
      buy_price: 200
    },
    processed_hops: {
      name: "Processed Hops",
      icon: "processed_hops",
      type: "normal",
      buy_price: 250
    },
    processed_ores: {
      name: "Processed Ores",
      type: "category",

      alumina: {
        name: "Alumina",
        icon: "alumina",
        type: "normal",
        buy_price: 1800
      },
      arsenic: {
        name: "Arsenic",
        icon: "arsenic",
        type: "normal",
        buy_price: 2800
      },
      barium: {
        name: "Barium",
        icon: "barium",
        type: "normal",
        buy_price: 2200
      },
      beryllium: {
        name: "Beryllium",
        icon: "beryllium",
        type: "normal",
        buy_price: 3500
      },
      chromium: {
        name: "Chromium",
        icon: "chromium",
        type: "normal",
        buy_price: 2700
      },
      cobalt: {
        name: "Cobalt",
        icon: "cobalt",
        type: "normal",
        buy_price: 3200
      },
      copper: {
        name: "Copper",
        icon: "copper",
        type: "normal",
        buy_price: 2800
      },
      gold: {
        name: "Gold",
        icon: "gold",
        type: "veblen",
        buy_price: 5000
      },
      ferrochromium: {
        name: "Ferrochromium",
        icon: "ferrochromium",
        type: "normal",
        buy_price: 3000
      },
      iron: {
        name: "Iron",
        icon: "iron",
        type: "normal",
        buy_price: 1200
      },
      lead: {
        name: "Lead",
        icon: "lead",
        type: "normal",
        buy_price: 2400
      },
      nickel: {
        name: "Nickel",
        icon: "nickel",
        type: "normal",
        buy_price: 3000
      },
      niobium: {
        name: "Niobium",
        icon: "niobium",
        type: "normal",
        buy_price: 3800
      },
      manganese: {
        name: "Manganese",
        icon: "manganese",
        type: "normal",
        buy_price: 1600
      },
      mercury: {
        name: "Mercury",
        icon: "mercury",
        type: "normal",
        buy_price: 4000
      },
      molybdenum: {
        name: "Molybdenum",
        icon: "molybdenum",
        type: "normal",
        buy_price: 3200
      },
      palladium: {
        name: "Palladium",
        icon: "palladium",
        type: "normal",
        buy_price: 4500
      },
      pig_iron: {
        name: "Pig Iron",
        icon: "pig_iron",
        type: "normal",
        buy_price: 1400
      },
      platinum: {
        name: "Platinum",
        icon: "platinum",
        type: "normal",
        buy_price: 4800
      },
      saltpetre: {
        name: "Saltpetre",
        aliases: ["saltpeter"],
        icon: "saltpetre",
        type: "normal",
        buy_price: 1000
      },
      silicon: {
        name: "Silicon",
        icon: "silicon",
        type: "normal",
        buy_price: 2200
      },
      silver: {
        name: "Silver",
        icon: "silver",
        type: "normal",
        buy_price: 3500
      },
      tantalum: {
        name: "Tantalum",
        icon: "tantalum",
        type: "normal",
        buy_price: 4000
      },
      tin: {
        name: "Tin",
        icon: "tin",
        type: "normal",
        buy_price: 1800
      },
      titanium: {
        name: "Titanium",
        icon: "titanium",
        type: "normal",
        buy_price: 3500
      },
      tungsten: {
        name: "Tungsten",
        icon: "tungsten",
        type: "normal",
        buy_price: 3700
      },
      zinc: {
        name: "Zinc",
        icon: "zinc",
        type: "normal",
        buy_price: 1600
      }
    },
    silk: {
      name: "Silk",
      icon: "silk",
      type: "luxury",
      buy_price: 2000
    },
    steel: {
      name: "Steel",
      type: "category",

      regular_steel: {
        name: "Regular Steel",
        icon: "regular_steel",
        type: "normal",
        buy_price: 1400
      },
      stainless_steel: {
        name: "Stainless Steel",
        icon: "stainless_steel",
        type: "luxury",
        buy_price: 2200
      }
    },
    tallow: {
      name: "Tallow",
      icon: "tallow",
      type: "normal",
      buy_price: 50
    },
    turbines: {
      name: "Turbines",
      icon: "turbines",
      type: "normal",
      buy_price: 3000
    },
    velvet: {
      name: "Velvet",
      icon: "velvet",
      type: "normal",
      buy_price: 1800
    }
  },

  processed_goods: {
    name: "Processed Goods",
    icon: "construction_time",
    type: "category",

    aeroplanes: {
      name: "Aeroplanes",
      icon: "aeroplanes",
      type: "luxury",
      buy_price: 7800
    },
    alcohol: {
      name: "Alcohol",
      type: "category",

      beer: {
        name: "Beer",
        icon: "beer",
        type: "normal",
        buy_price: 60
      },
      gin: {
        name: "Gin",
        icon: "gin",
        type: "normal",
        buy_price: 150
      },
      schnapps: {
        name: "Schnapps",
        icon: "schnapps",
        type: "normal",
        buy_price: 120
      },
      rum: {
        name: "Rum",
        icon: "rum",
        type: "luxury",
        buy_price: 180
      },
      tequila: {
        name: "Tequila",
        icon: "tequila",
        type: "normal",
        buy_price: 200
      },
      tonics: {
        name: "Tonics",
        icon: "tonics",
        type: "normal",
        buy_price: 100
      },
      vodka: {
        name: "Vodka",
        icon: "vodka",
        type: "normal",
        buy_price: 160
      },
      whiskey: {
        name: "Whiskey",
        icon: "whiskey",
        type: "normal",
        buy_price: 250
      },
      wine: {
        name: "Wine",
        type: "category",

        champagne: {
          name: "Champagne",
          icon: "champagne",
          type: "luxury",
          buy_price: 400
        },
        red_wine: {
          name: "Red Wines",
          type: "category",

          barbera: {
            name: "Barbera",
            icon: "barbera",
            type: "luxury",
            buy_price: 2200
          },
          cabernet_franc: {
            name: "Cabernet Franc",
            icon: "cabernet_franc",
            type: "luxury",
            buy_price: 2400
          },
          cabernet_sauvignon: {
            name: "Cabernet Sauvignon",
            icon: "cabernet_sauvignon",
            type: "luxury",
            buy_price: 2600
          },
          charbono: {
            name: "Charbono",
            icon: "charbono",
            type: "luxury",
            buy_price: 2000
          },
          dolcetto: {
            name: "Dolcetto",
            icon: "dolcetto",
            type: "luxury",
            buy_price: 1800
          },
          gamay: {
            name: "Gamay",
            icon: "gamay",
            type: "luxury",
            buy_price: 2100
          },
          grenache: {
            name: "Grenache",
            icon: "grenache",
            type: "luxury",
            buy_price: 2300
          },
          malbec: {
            name: "Malbec",
            icon: "malbec",
            type: "luxury",
            buy_price: 2400
          },
          merlot: {
            name: "Merlot",
            icon: "merlot",
            type: "luxury",
            buy_price: 2500
          },
          mourvedre: {
            name: "Mourvedre",
            icon: "mourvedre",
            type: "luxury",
            buy_price: 2300
          },
          nehbyehlas: {
            name: "Nehbyehlas",
            icon: "nehbyehlas",
            type: "luxury",
            buy_price: 2800
          },
          petite_sirah: {
            name: "Petite Sirah",
            icon: "petite_sirah",
            type: "luxury",
            buy_price: 2600
          },
          pinot_gris: {
            name: "Pinot Gris",
            icon: "pinot_gris",
            type: "luxury",
            buy_price: 2200
          },
          pinot_noir: {
            name: "Pinot Noir",
            icon: "pinot_noir",
            type: "luxury",
            buy_price: 2800
          },
          port: {
            name: "Port",
            icon: "port",
            type: "luxury",
            buy_price: 3000
          },
          red_bordeaux: {
            name: "Red Bordeaux",
            icon: "red_bordeaux",
            type: "luxury",
            buy_price: 3200
          },
          sangiovese: {
            name: "Sangiovese",
            icon: "sangiovese",
            type: "luxury",
            buy_price: 2600
          },
          syrah: {
            name: "Syrah",
            icon: "syrah",
            type: "luxury",
            buy_price: 2700
          },
          zinfandel: {
            name: "Zinfandel",
            icon: "zinfandel",
            type: "luxury",
            buy_price: 2400
          }
        },
        white_wine: {
          name: "White Wine",
          type: "category",

          chardonnay: {
            name: "Chardonnay",
            icon: "chardonnay",
            type: "luxury",
            buy_price: 2500
          },
          gewurztraminer: {
            name: "Gewürztraminer",
            aliases: ["gewurztraminer", "gewuerztraminer"],
            icon: "gewurztraminer",
            type: "luxury",
            buy_price: 2300
          },
          gruner_veltliner: {
            name: "Grüner Veltliner",
            aliases: ["gruner veltliner", "gruener veltliner"],
            icon: "gruner_veltliner",
            type: "luxury",
            buy_price: 2200
          },
          malvasia: {
            name: "Malvasia",
            icon: "malvasia",
            type: "luxury",
            buy_price: 2100
          },
          marsanne: {
            name: "Marsanne",
            icon: "marsanne",
            type: "luxury",
            buy_price: 2400
          },
          muscat: {
            name: "Muscat",
            icon: "muscat",
            type: "luxury",
            buy_price: 2500
          },
          pinot_blanc: {
            name: "Pinot Blanc",
            icon: "pinot_blanc",
            type: "luxury",
            buy_price: 2200
          },
          prosecco: {
            name: "Prosecco",
            icon: "prosecco",
            type: "luxury",
            buy_price: 2500
          },
          riesling: {
            name: "Riesling",
            icon: "riesling",
            type: "luxury",
            buy_price: 2400
          },
          sauvignon_blanc: {
            name: "Sauvignon Blanc",
            icon: "sauvignon_blanc",
            type: "luxury",
            buy_price: 2500
          },
          semillon: {
            name: "Sémillon",
            icon: "semillon",
            type: "luxury",
            buy_price: 2300
          },
          vernaccia: {
            name: "Vernaccia",
            icon: "vernaccia",
            type: "luxury",
            buy_price: 2100
          },
          viognier: {
            name: "Viognier",
            icon: "viognier",
            type: "luxury",
            buy_price: 2600
          },
          white_bordeaux: {
            name: "White Bordeaux",
            icon: "white_bordeaux",
            type: "luxury",
            buy_price: 2800
          }
        },
        rice_wine: {
          name: "Rice Wine",
          type: "category",

          cheongju: {
            name: "Cheongju",
            icon: "cheongju",
            type: "luxury",

            buy_price: 800
          },
          chhaang: {
            name: "Chhaang",
            icon: "chhaang",
            type: "luxury",

            buy_price: 600
          },
          gwaha_ju: {
            name: "Gwaha-ju",
            icon: "gwaha_ju",
            type: "luxury",

            buy_price: 600
          },
          huangjiu: {
            name: "Huangjiu",
            icon: "huangjiu",
            type: "luxury",

            buy_price: 700
          },
          mirin: {
            name: "Mirin",
            icon: "mirin",
            type: "luxury",

            buy_price: 850
          },
          sake: {
            name: "Sake",
            icon: "sake",
            type: "luxury",

            buy_price: 1200
          },
          shaoxing: {
            name: "Shaoxing",
            icon: "shaoxing",
            type: "luxury",

            buy_price: 650
          },
          tapuy: {
            name: "Tapuy",
            icon: "tapuy",
            type: "luxury",

            buy_price: 400
          }
        }
      },
    },
    ammunition: {
      name: "Ammunition",
      type: "category",

      ap_rounds: {
        name: "AP Rounds",
        icon: "ap_rounds",
        type: "normal",
        buy_price: 3000
      },
      artillery_shells: {
        name: "Artillery Shells",
        type: "category",

        delayed_fuse_shells: {
          name: "Delayed-Fuse Shells",
          icon: "delayed_fuse_shells",
          type: "normal",
          buy_price: 2500
        },
        regular_shells: {
          name: "Regular Shells",
          icon: "regular_shells",
          type: "normal",
          buy_price: 2000
        }
      },
      high_calibre_ammunition: {
        name: "High-calibre Ammunition",
        aliases: ["high-caliber ammunition", "high caliber ammunition", "high calibre ammunition"],
        icon: "high_calibre_ammunition",
        type: "normal",
        buy_price: 2800
      },
      low_calibre_ammunition: {
        name: "Low-calibre Ammunition",
        aliases: ["low-caliber ammunition", "low caliber ammunition", "low calibre ammunition"],
        icon: "low_calibre_ammunition",
        type: "normal",
        buy_price: 2200
      },
      sabot_rounds: {
        name: "Sabot Rounds",
        icon: "sabot_rounds",
        type: "normal",
        buy_price: 3200
      }
    },
    automobiles: {
      name: "Automobiles",
      type: "category",

      cars: {
        name: "Cars",
        icon: "cars",
        type: "normal",
        buy_price: 3500
      },
      humvees: {
        name: "Humvees",
        icon: "humvees",
        type: "normal",
        buy_price: 5000
      },
      jeeps: {
        name: "Jeeps",
        icon: "jeeps",
        type: "normal",
        buy_price: 3000
      },
      lorries: {
        name: "Lorries",
        icon: "lorries",
        type: "normal",
        buy_price: 4000
      },
      luxury_cars: {
        name: "Luxury Cars",
        icon: "luxury_cars",
        type: "normal",
        buy_price: 6000
      },
      motorbikes: {
        name: "Motorbikes",
        icon: "motorbikes",
        type: "normal",
        buy_price: 1500
      },
      steam_carriages: {
        name: "Steam Carriages",
        icon: "steam_carriages",
        type: "normal",
        buy_price: 4500
      },
      tractors: {
        name: "Tractors",
        type: "normal",
        icon: "tractors",
        buy_price: 4000
      },
      vans: {
        name: "Vans",
        icon: "vans",
        type: "normal",
        buy_price: 2500
      }
    },
    batteries: {
      name: "Batteries",
      type: "normal",
      buy_price: 650
    },
    bicycles: {
      name: "Bicycles",
      icon: "bicycles",
      type: "normal",
      buy_price: 300
    },
    bricks: {
      name: "Bricks",
      icon: "bricks",
      type: "normal",
      buy_price: 200
    },
    cameras: {
      name: "Cameras",
      icon: "cameras",
      type: "normal",
      buy_price: 12000
    },
    cement: {
      name: "Cement",
      icon: "cement",
      type: "normal",
      buy_price: 300
    },
    ceramics: {
      name: "Ceramics",
      icon: "ceramics",
      type: "normal",
      buy_price: 2500
    },
    chassis: {
      name: "Chassis",
      icon: "chassis",
      type: "normal",
      buy_price: 1200
    },
    chinaware: {
      name: "Chinaware",
      type: "category",

      bone_china: {
        name: "Bone China",
        icon: "bone_china",
        type: "normal",
        buy_price: 3500
      },
      china: {
        name: "China",
        icon: "china",
        type: "normal",
        buy_price: 3000
      },
      doccia_porcelain: {
        name: "Doccia Porcelain",
        icon: "doccia_porcelain",
        type: "luxury",
        buy_price: 4000
      },
      lacquerware: {
        name: "Lacquerware",
        icon: "lacquerware",
        type: "luxury",
        buy_price: 2800
      },
      porcelain: {
        name: "Porcelain",
        icon: "porcelain",
        type: "luxury",
        buy_price: 3200
      }
    },
    chewing_gum: {
      name: "Chewing Gum",
      icon: "chewing_gum",
      type: "normal",
      buy_price: 100
    },
    chocolate: {
      name: "Chocolate",
      icon: "chocolate",
      type: "luxury",
      buy_price: 4500
    },
    cigars: {
      name: "Cigars",
      icon: "cigars",
      type: "luxury",
      buy_price: 2500
    },
    cigarettes: {
      name: "Cigarettes",
      icon: "cigarettes",
      type: "normal",
      buy_price: 300
    },
    clothes: {
      name: "Clothes",
      type: "category",

      luxury_clothes: {
        name: "Luxury Clothes",
        type: "category",

        bowler_hats: {
          name: "Bowler Hats",
          icon: "bowler_hats",
          type: "luxury",
          buy_price: 1600
        },
        finery: {
          name: "Finery",
          icon: "finery",
          type: "luxury",
          buy_price: 3000
        },
        fur_coats: {
          name: "Fur Coats",
          icon: "fur_coats",
          type: "luxury",
          buy_price: 6000
        },
        fur_hats: {
          name: "Fur Hats",
          icon: "fur_hats",
          type: "luxury",
          buy_price: 2000
        },
        leather_boots: {
          name: "Leather Boots",
          icon: "leather_boots",
          type: "luxury",
          buy_price: 2400
        },
        pocketwatches: {
          name: "Pocketwatches",
          aliases: ["pocket watches"],
          icon: "pocketwatches",
          type: "luxury",
          buy_price: 4000
        },
        tailored_suits: {
          name: "Tailored Suits",
          icon: "tailored_suits",
          type: "luxury",
          buy_price: 5000
        },
        wristwatches: {
          name: "Wristwatches",
          icon: "wristwatches",
          type: "luxury",
          buy_price: 3600
        }
      },
      staple_clothes: {
        name: "Staple Clothes",
        type: "category",

        boots: {
          name: "Boots",
          icon: "boots",
          type: "normal",
          buy_price: 1600
        },
        parkas: {
          name: "Parkas",
          icon: "parkas",
          type: "normal",
          buy_price: 2000
        },
        ponchos: {
          name: "Ponchos",
          icon: "ponchos",
          type: "normal",
          buy_price: 1400
        },
        work_clothes: {
          name: "Work Clothes",
          icon: "work_clothes",
          type: "normal",
          buy_price: 1000
        }
      }
    },
    clay_pipes: {
      name: "Clay Pipes",
      icon: "clay_pipes",
      type: "normal",
      buy_price: 800
    },
    coffee: {
      name: "Coffee",
      icon: "coffee",
      type: "luxury",
      buy_price: 3300
    },
    computers: {
      name: "Computers",
      icon: "computers",
      type: "luxury",
      buy_price: 40000
    },
    cosmetic_products: {
      name: "Cosmetic Products",
      icon: "cosmetic_products",
      type: "luxury",
      buy_price: 1600
    },
    dyes: {
      name: "Dyes",
      icon: "dyes",
      type: "luxury",
      buy_price: 60
    },
    enriched_uranium: {
      name: "Enriched Uranium",
      type: "category",

      depleted_uranium: {
        name: "Depleted Uranium",
        icon: "depleted_uranium",
        type: "normal",
        buy_price: 2500
      },
      uranium: {
        name: "Uranium",
        icon: "uranium",
        type: "normal",
        buy_price: 3000
      },
      highly_enriched_uranium: {
        name: "Highly Enriched Uranium",
        icon: "highly_enriched_uranium",
        type: "normal",
        aliases: ["HEU"],
        buy_price: 5000
      },
      weapons_grade_enriched_uranium: {
        name: "Weapons-Grade Enriched Uranium",
        aliases: ["weapons grade enriched uranium"],
        icon: "weapons_grade_enriched_uranium",
        type: "normal",
        buy_price: 8000
      }
    },
    fertiliser: {
      name: "Fertiliser",
      icon: "fertiliser",
      type: "necessary",
      buy_price: 100
    },
    film: {
      name: "Film",
      icon: "film",
      type: "inferior",
      buy_price: 60
    },
    foods: {
      name: "Foods",
      type: "category",

      bread: {
        name: "Bread",
        icon: "bread",
        type: "necessary",
        buy_price: 30
      },
      canned_food: {
        name: "Canned Food",
        icon: "canned_food",
        type: "necessary",
        buy_price: 50
      },
      cheese: {
        name: "Cheese",
        type: "category",
        aliases: ["cheeses"],

        american: {
          name: "American",
          icon: "american",
          type: "normal",
          buy_price: 120
        },
        blue: {
          name: "Blue",
          type: "category",

          gorgonzola: {
            name: "Gorgonzola",
            icon: "gorgonzola",
            type: "normal",
            buy_price: 180
          },
          roquefort: {
            name: "Roquefort",
            icon: "roquefort",
            type: "normal",
            buy_price: 200
          },
          stilton: {
            name: "Stilton",
            icon: "stilton",
            type: "normal",
            buy_price: 160
          }
        },
        brie: {
          name: "Brie",
          icon: "brie",
          type: "normal",
          buy_price: 140
        },
        butterkase: {
          name: "Butterkäse",
          aliases: ["butterkase", "butterkaese"],
          icon: "butterkase",
          type: "normal",
          buy_price: 150
        },
        cantal: {
          name: "Cantal",
          icon: "cantal",
          type: "normal",
          buy_price: 130
        },
        cascaval: {
          name: "Cascaval",
          icon: "cascaval",
          type: "normal",
          buy_price: 100
        },
        cheddar: {
          name: "Cheddar",
          icon: "cheddar",
          type: "normal",
          buy_price: 140
        },
        cheshire: {
          name: "Cheshire",
          icon: "cheshire",
          type: "normal",
          buy_price: 120
        },
        coulommiers: {
          name: "Coulommiers",
          icon: "coulommiers",
          type: "normal",
          buy_price: 110
        },
        cream_cheese: {
          name: "Cream Cheese",
          icon: "cream_cheese",
          type: "normal",
          buy_price: 100
        },
        edam: {
          name: "Edam",
          icon: "edam",
          type: "normal",
          buy_price: 130
        },
        feta: {
          name: "Feta",
          icon: "feta",
          type: "normal",
          buy_price: 120
        },
        gloucester: {
          name: "Gloucester",
          icon: "gloucester",
          type: "normal",
          buy_price: 140
        },
        gouda: {
          name: "Gouda",
          icon: "gouda",
          type: "normal",
          buy_price: 130
        },
        grana_padano: {
          name: "Grana Padano",
          icon: "grana_padano",
          type: "normal",
          buy_price: 150
        },
        havarti: {
          name: "Havarti",
          icon: "havarti",
          type: "normal",
          buy_price: 140
        },
        jarlsberg: {
          name: "Jarlsberg",
          icon: "jarlsberg",
          type: "normal",
          buy_price: 130
        },
        munster: {
          name: "Munster",
          icon: "munster",
          type: "normal",
          buy_price: 140
        },
        neufchatel: {
          name: "Neufchatel",
          icon: "neufchatel",
          type: "normal",
          buy_price: 100
        },
        parmesan: {
          name: "Parmesan",
          icon: "parmesan",
          type: "normal",
          buy_price: 150
        },
        pecorino: {
          name: "Pecorino",
          icon: "pecorino",
          type: "normal",
          buy_price: 140
        },
        port_salut: {
          name: "Port Salut",
          icon: "port_salut",
          type: "normal",
          buy_price: 120
        },
        ricotta: {
          name: "Ricotta",
          icon: "ricotta",
          type: "normal",
          buy_price: 110
        },
        swiss: {
          name: "Swiss",
          icon: "swiss",
          type: "normal",
          buy_price: 130
        }
      },
      dried_meat: {
        name: "Dried Meat",
        icon: "dried_meat",
        type: "normal",
        buy_price: 80
      },
      jam: {
        name: "Jam",
        icon: "jam",
        type: "normal",
        buy_price: 60
      },
      lemonade: {
        name: "Lemonade",
        icon: "lemonade",
        type: "normal",
        buy_price: 40
      },
      pemmican: {
        name: "Pemmican",
        icon: "pemmican",
        type: "normal",
        buy_price: 100
      },
      sausages: {
        name: "Sausages",
        icon: "sausages",
        type: "normal",
        buy_price: 80
      },
      soup: {
        name: "Soup",
        icon: "soup",
        type: "normal",
        buy_price: 60
      },
      stew: {
        name: "Stew",
        icon: "stew",
        type: "normal",
        buy_price: 70
      },
      syrup: {
        name: "Syrup",
        icon: "syrup",
        type: "normal",
        buy_price: 50
      },
      tortillas: {
        name: "Tortillas",
        icon: "tortillas",
        type: "normal",
        buy_price: 60
      }
    },
    furniture: {
      name: "Furniture",
      type: "category",

      common_furniture: {
        name: "Common Furniture",
        icon: "common_furniture",
        type: "normal",
        buy_price: 1000
      },
      luxury_furniture: {
        name: "Luxury Furniture",
        icon: "luxury_furniture",
        type: "normal",
        buy_price: 5000
      }
    },
    gas: {
      name: "Gas",
      icon: "gas",
      type: "normal",
      buy_price: 2000
    },
    gems: {
      name: "Gems",
      type: "category",

      cut_ruby: {
        name: "Cut Ruby",
        icon: "cut_ruby",
        type: "veblen",
        buy_price: 15000
      },
      diamond: {
        name: "Diamond",
        icon: "diamond",
        type: "veblen",
        buy_price: 30000
      },
      jewellery: {
        name: "Jewellery",
        aliases: ["jewelry"],
        icon: "jewellery",
        type: "veblen",
        buy_price: 25000
      }
    },
    glasses: {
      name: "Glasses",
      icon: "glasses",
      type: "normal",
      buy_price: 3000
    },
    gramophones: {
      name: "Gramophones",
      icon: "gramophones",
      type: "normal",
      buy_price: 6500
    },
    heavy_weaponry: {
      name: "Heavy Weaponry",
      icon: "heavy_weaponry",
      type: "normal",
      buy_price: 10000
    },
    honey: {
      name: "Honey",
      icon: "honey",
      type: "normal",
      buy_price: 500
    },
    illicit_drugs: {
      name: "Illicit Drugs",
      type: "category",

      cannabis: {
        name: "Cannabis",
        aliases: ["weed"],
        icon: "cannabis",
        type: "necessary",
        buy_price: 1000
      },
      carfentanil: {
        name: "Carfentanil",
        aliases: ["carfentanyl"],
        icon: "carfentanil",
        type: "necessary",
        buy_price: 10000
      },
      cocaine: {
        name: "Cocaine",
        aliases: ["coke"],
        icon: "cocaine",
        type: "veblen",
        buy_price: 5000
      },
      crack_cocaine: {
        name: "Crack Cocaine",
        icon: "crack_cocaine",
        type: "necessary",
        buy_price: 2500
      },
      fentanyl: {
        name: "Fentanyl",
        aliases: ["fentanil"],
        icon: "fentanyl",
        type: "necessary",
        buy_price: 20000
      },
      hashish: {
        name: "Hashish",
        icon: "hashish",
        type: "necessary",
        buy_price: 4000
      },
      heroin: {
        name: "Heroin",
        icon: "heroin",
        type: "necessary",
        buy_price: 6500
      },
      methamphetamine: {
        name: "Methamphetamine",
        icon: "methamphetamine",
        type: "necessary",
        buy_price: 7500
      },
      opium: {
        name: "Opium",
        icon: "opium",
        type: "veblen",
        buy_price: 5000
      },
      psychedelics: {
        name: "Psychedelics",
        icon: "psychedelics",
        type: "veblen",
        buy_price: 10000
      }
    },
    incense: {
      name: "Incense",
      icon: "incense",
      type: "luxury",
      buy_price: 5000
    },
    ink: {
      name: "Ink",
      icon: "ink",
      type: "luxury",
      buy_price: 3000
    },
    lamps: {
      name: "Lamps",
      type: "category",

      candles: {
        name: "Candles",
        icon: "candles",
        type: "normal",
        buy_price: 2000
      },
      electric_lamps: {
        name: "Electric Lamps",
        icon: "electric_lamps",
        type: "luxury",
        buy_price: 1000
      },
      lanterns: {
        name: "Lanterns",
        icon: "lanterns",
        type: "normal",
        buy_price: 1000
      },
      oil_lamps: {
        name: "Oil Lamps",
        icon: "oil_lamps",
        type: "normal",
        buy_price: 1500
      }
    },
    lasers: {
      name: "Lasers",
      icon: "lasers",
      type: "luxury",
      buy_price: 8000
    },
    lifts: {
      name: "Lifts",
      icon: "lifts",
      type: "normal",
      buy_price: 8500
    },
    lightbulbs: {
      name: "Lightbulbs",
      aliases: ["light bulbs"],
      icon: "lightbulbs",
      type: "normal",
      buy_price: 4000
    },
    lumber: {
      name: "Lumber",
      type: "category",

      acacia_lumber: {
        name: "Acacia Lumber",
        icon: "acacia_lumber",
        type: "normal",
        buy_price: 500
      },
      ash_lumber: {
        name: "Ash Lumber",
        icon: "ash_lumber",
        type: "normal",
        buy_price: 600
      },
      balsa_lumber: {
        name: "Balsa Lumber",
        icon: "balsa_lumber",
        type: "inferior",
        buy_price: 200
      },
      basswood_lumber: {
        name: "Basswood Lumber",
        icon: "basswood_lumber",
        type: "normal",
        buy_price: 400
      },
      blackwood_lumber: {
        name: "Blackwood Lumber",
        icon: "blackwood_lumber",
        type: "normal",
        buy_price: 800
      },
      bloodwood_lumber: {
        name: "Bloodwood Lumber",
        icon: "bloodwood_lumber",
        type: "luxury",
        buy_price: 700
      },
      cedar_lumber: {
        name: "Cedar Lumber",
        icon: "cedar_lumber",
        type: "luxury",
        buy_price: 600
      },
      cherry_lumber: {
        name: "Cherry Lumber",
        icon: "cherry_lumber",
        type: "normal",
        buy_price: 750
      },
      chestnut_lumber: {
        name: "Chestnut Lumber",
        icon: "chestnut_lumber",
        type: "normal",
        buy_price: 700
      },
      cottonwood_lumber: {
        name: "Cottonwood Lumber",
        icon: "cottonwood_lumber",
        type: "normal",
        buy_price: 300
      },
      cypress_lumber: {
        name: "Cypress Lumber",
        icon: "cypress_lumber",
        type: "normal",
        buy_price: 650
      },
      ebony_lumber: {
        name: "Ebony Lumber",
        icon: "ebony_lumber",
        type: "veblen",
        buy_price: 1200
      },
      elm_lumber: {
        name: "Elm Lumber",
        icon: "elm_lumber",
        type: "normal",
        buy_price: 500
      },
      eucalyptus_lumber: {
        name: "Eucalyptus Lumber",
        icon: "eucalyptus_lumber",
        type: "normal",
        buy_price: 550
      },
      fir_lumber: {
        name: "Fir Lumber",
        icon: "fir_lumber",
        type: "normal",
        buy_price: 450
      },
      hickory_lumber: {
        name: "Hickory Lumber",
        icon: "hickory_lumber",
        type: "normal",
        buy_price: 650
      },
      ironwood_lumber: {
        name: "Ironwood Lumber",
        icon: "ironwood_lumber",
        type: "normal",
        buy_price: 1000
      },
      lacewood_lumber: {
        name: "Lacewood Lumber",
        icon: "lacewood_lumber",
        type: "normal",
        buy_price: 900
      },
      mahogany_lumber: {
        name: "Mahogany Lumber",
        icon: "mahogany_lumber",
        type: "luxury",
        buy_price: 800
      },
      maple_lumber: {
        name: "Maple Lumber",
        icon: "maple_lumber",
        type: "normal",
        buy_price: 600
      },
      oak_lumber: {
        name: "Oak Lumber",
        icon: "oak_lumber",
        type: "normal",
        buy_price: 700
      },
      pine_lumber: {
        name: "Pine Lumber",
        icon: "pine_lumber",
        type: "normal",
        buy_price: 400
      },
      redwood_lumber: {
        name: "Redwood Lumber",
        icon: "redwood_lumber",
        type: "normal",
        buy_price: 550
      },
      rosewood_lumber: {
        name: "Rosewood Lumber",
        icon: "rosewood_lumber",
        type: "luxury",
        buy_price: 1100
      },
      sandalwood_lumber: {
        name: "Sandalwood Lumber",
        icon: "sandalwood_lumber",
        type: "veblen",
        buy_price: 1500
      },
      spruce_lumber: {
        name: "Spruce Lumber",
        icon: "spruce_lumber",
        type: "normal",
        buy_price: 450
      },
      turpentine_lumber: {
        name: "Turpentine Lumber",
        icon: "turpentine_lumber",
        type: "normal",
        buy_price: 350
      },
      walnut_lumber: {
        name: "Walnut Lumber",
        icon: "walnut_lumber",
        type: "normal",
        buy_price: 900
      },
      willow_lumber: {
        name: "Willow Lumber",
        icon: "willow_lumber",
        type: "normal",
        buy_price: 400
      }
    },
    medicines: {
      name: "Medicines",
      type: "category",

      pharmaceuticals: {
        name: "Pharmaceuticals",
        type: "category",

        antipyretics: {
          name: "Antipyretics",
          icon: "antipyretics",
          type: "necessary",
          buy_price: 5000
        },
        analgesics: {
          name: "Analgesics",
          icon: "analgesics",
          type: "necessary",
          buy_price: 6000
        },
        antimalarial_drugs: {
          name: "Antimalarial Drugs",
          icon: "antimalarial_drugs",
          type: "necessary",
          buy_price: 15000
        },
        antibiotics: {
          name: "Antibiotics",
          icon: "antibiotics",
          type: "necessary",
          buy_price: 20000
        },
        antiseptics: {
          name: "Antiseptics",
          icon: "antiseptics",
          type: "necessary",
          buy_price: 5000
        },
        contraceptives: {
          name: "Contraceptives",
          icon: "contraceptives",
          type: "necessary",
          buy_price: 10000
        },
        hormone_medications: {
          name: "Hormone Medications",
          icon: "hormone_medications",
          type: "necessary",
          buy_price: 30000
        },
        mood_stabilisers: {
          name: "Mood Stabilisers",
          aliases: ["mood stabilizers"],
          icon: "mood_stabilisers",
          type: "necessary",
          buy_price: 25000
        },
        statins: {
          name: "Statins",
          icon: "statins",
          type: "necessary",
          buy_price: 18000
        },
        stimulants: {
          name: "Stimulants",
          icon: "stimulants",
          type: "necessary",
          buy_price: 22000
        },
        tranquilisers: {
          name: "Tranquilisers",
          aliases: ["tranquilizers"],
          icon: "tranquilisers",
          type: "necessary",
          buy_price: 18000
        },
        vaccines: {
          name: "Vaccines",
          icon: "vaccines",
          type: "necessary",
          buy_price: 20000
        }
      },
      traditional_medicines: {
        name: "Traditional Medicines",
        icon: "traditional_medicines",
        type: "necessary",
        buy_price: 5500
      }
    },
    naval_supplies: {
      name: "Naval Supplies",
      icon: "naval_supplies",
      type: "normal",
      buy_price: 10000
    },
    olive_oil: {
      name: "Olive Oil",
      icon: "olive_oil",
      type: "normal",
      buy_price: 1500
    },
    paper: {
      name: "Paper",
      icon: "paper",
      type: "normal",
      buy_price: 500
    },
    plastics: {
      name: "Plastics",
      icon: "plastics",
      type: "normal",
      buy_price: 2350
    },
    radios: {
      name: "Radios",
      icon: "radios",
      type: "luxury",
      buy_price: 16000
    },
    recording_devices: {
      name: "Recording Devices",
      icon: "recording_devices",
      type: "luxury",
      buy_price: 12000
    },
    refined_petroil: {
      name: "Refined Petroil",
      icon: "refined_petroil",
      type: "necessary",
      buy_price: 1200
    },
    reinforced_concrete: {
      name: "Reinforced Concrete",
      icon: "reinforced_concrete",
      type: "normal",
      buy_price: 1800
    },
    rubber: {
      name: "Rubber",
      icon: "rubber",
      type: "normal",
      buy_price: 1500
    },
    salt: {
      name: "Salt",
      icon: "salt",
      type: "normal",
      buy_price: 4000
    },
    sewing_machines: {
      name: "Sewing Machines",
      icon: "sewing_machines",
      type: "normal",
      buy_price: 8000
    },
    shampoo: {
      name: "Shampoo",
      icon: "shampoo",
      type: "normal",
      buy_price: 4500
    },
    sleeping_bags: {
      name: "Sleeping Bags",
      icon: "sleeping_bags",
      type: "normal",
      buy_price: 1000
    },
    souvenirs: {
      name: "Souvenirs",
      icon: "souvenirs",
      type: "normal",
      buy_price: 3500
    },
    small_arms: {
      name: "Small Arms",
      icon: "small_arms",
      type: "normal",
      buy_price: 4500
    },
    soap: {
      name: "Soap",
      icon: "soap",
      type: "normal",
      buy_price: 2200
    },
    steel_beams: {
      name: "Steel Beams",
      icon: "steel_beams",
      type: "normal",
      buy_price: 1600
    },
    sugar: {
      name: "Sugar",
      icon: "sugar",
      type: "normal",
      buy_price: 500
    },
    tapestries: {
      name: "Tapestries",
      icon: "tapestries",
      type: "normal",
      buy_price: 750
    },
    tea: {
      name: "Tea",
      type: "category",

      black_tea: {
        name: "Black Tea",
        icon: "black_tea",
        type: "normal",
        buy_price: 2000
      },
      chai_tea: {
        name: "Chai Tea",
        icon: "chai_tea",
        type: "normal",
        buy_price: 2500
      },
      green_tea: {
        name: "Green Tea",
        icon: "green_tea",
        type: "normal",
        buy_price: 3000
      },
      herbal_tea: {
        name: "Herbal Tea",
        icon: "herbal_tea",
        type: "normal",
        buy_price: 2500
      },
      hibiscus_tea: {
        name: "Hibiscus Tea",
        icon: "hibiscus_tea",
        type: "normal",
        buy_price: 3500
      },
      oolong_tea: {
        name: "Oolong Tea",
        icon: "oolong_tea",
        type: "normal",
        buy_price: 4000
      },
      puerh_tea: {
        name: "Pu-erh Tea",
        aliases: ["puerh tea", "pu erh tea"],
        icon: "pu_erh_tea",
        type: "normal",
        buy_price: 5000
      },
      white_tea: {
        name: "White Tea",
        icon: "white_tea",
        type: "normal",
        buy_price: 4500
      }
    },
    telephones: {
      name: "Telephones",
      icon: "telephones",
      type: "luxury",
      buy_price: 6000
    },
    televisions: {
      name: "Televisions",
      aliases: ["TVs"],
      icon: "televisions",
      type: "luxury",
      buy_price: 12000
    },
    tools: {
      name: "Tools",
      icon: "tools",
      type: "necessary",
      buy_price: 4000
    },
    torpedoes: {
      name: "Torpedoes",
      icon: "torpedoes",
      type: "normal",
      buy_price: 10000
    },
    trains: {
      name: "Trains",
      icon: "trains",
      type: "normal",
      buy_price: 12500
    },
    typewriters: {
      name: "Typewriters",
      icon: "typewriters",
      type: "normal",
      buy_price: 8000
    },
    tyres: {
      name: "Tyres",
      icon: "tyres",
      type: "normal",
      buy_price: 2000
    },
    uniforms: {
      name: "Uniforms",
      icon: "uniforms",
      type: "normal",
      buy_price: 2000
    },
    violins: {
      name: "Violins",
      icon: "violins",
      type: "luxury",
      buy_price: 3500
    },
    wood_veneers: {
      name: "Wood Veneers",
      icon: "wood_veneers",
      type: "normal",
      buy_price: 400
    }
  }
};
