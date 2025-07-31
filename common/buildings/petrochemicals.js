config.buildings.petrochemicals = {
  name: "Petrochemicals",
  order: 13,
  taxable: true,

  acetic_acid_plants: {
    name: "Acetic Acid Plants",
    singular: "Acetic Acid Plant",
    type: "manufacturing",

    construction_turns: 5,
    cost: {
      machine_parts: 8,
      steel_beams: 6,
      copper: 5,
      electric_gear: 4,
      regular_steel: 4,
      reinforced_concrete: 4,
      stainless_steel: 3,
      money: 30000
    },
    maintenance: {
      production_choice_one: {
        carbon: 2,
        methanol: 3
      },
      production_choice_two: {
        ethylene: 2,
        ethanol: 1,
        oxygen: 1
      }
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      production_choice_one: {
        name: "Methanol Carbonylation",
        acetic_acid: 4
      },
      production_choice_two: {
        name: "Wacker Process",
        acetic_acid: 5
      }
    }
  },
  acetone_manufacturers: {
    name: "Acetone Manufacturers",
    singular: "Acetone Manufacturer",
    type: "manufacturing",

    construction_turns: 4,
    cost: {
      regular_steel: 5,
      stainless_steel: 3,
      glass: 2,
      machine_parts: 2,
      money: 25000
    },
    maintenance: {
      production_choice_one: {
        acetic_acid: 2,
        calcium: 1,
        salt: 1
      },
      production_choice_two: {
        benzene: 2,
        propylene: 2
      }
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      production_choice_one: {
        name: "Acetate Dry Distillation",
        acetone: 3
      },
      production_choice_two: {
        name: "Cumene Process",
        acetone: 2,
        phenol: 2
      }
    }
  },
  acid_manufacturers: {
    name: "Acid Manufacturers",
    singular: "Acid Manufacturer",
    type: "manufacturing",

    construction_turns: 4,
    cost: {
      steel_beams: 5,
      bricks: 5,
      stainless_steel: 4,
      copper: 3,
      machine_parts: 3,
      cement: 2,
      money: 20000
    },
    maintenance: {
      production_choice_phosphoric_acid_one: {
        calcium: 3,
        sulphuric_acid: 1
      },
      production_choice_phosphoric_acid_two: {
        phosphorus: 3,
        coal_coke: 1,
        silica: 1,
        gas: 1
      },
      production_choice_sulphuric_acid_one: {
        sulphur: 2,
        oxygen: 1,
        gas: 1
      },
      production_choice_sulphuric_acid_two: {
        sulphur: 2,
        coals: 1
      }
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      production_choice_phosphoric_acid_one: {
        name: "Wet Process",
        phosphoric_acid: 3
      },
      production_choice_phosphoric_acid_two: {
        name: "Dry Process",
        phosphoric_acid: 2
      },
      production_choice_sulphuric_acid_one: {
        name: "Contact Process",
        sulphuric_acid: 4
      },
      production_choice_sulphuric_acid_two: {
        name: "Wet Sulphuric Acid Process",
        sulphuric_acid: 2
      }
    }
  },
  ammonia_plants: {
    name: "Ammonia Plants",
    singular: "Ammonia Plant",
    type: "manufacturing",

    construction_turns: 5,
    cost: {
      bricks: 10,
      glass: 8,
      machine_parts: 6,
      stainless_steel: 6,
      copper: 4,
      lead: 4,
      cement: 3,
      lightbulbs: 3,
      money: 15000
    },
    maintenance: {
      hydrogen: 3,
      nitrogen: 2,
      gas: 1
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      ammonia: 5
    }
  },
  benzene_plants: {
    name: "Benzene Plants",
    singular: "Benzene Plant",
    type: "manufacturing",

    construction_turns: 4,
    cost: {
      bricks: 8,
      lumber: 6,
      copper: 5,
      stainless_steel: 5,
      lead: 4,
      ceramics: 4,
      cement: 3,
      lightbulbs: 2,
      money: 15000
    },
    maintenance: {
      production_choice_one: {
        methylbenzene: 6,
        chromium: 1
      },
      production_choice_two: {
        methylbenzene: 6,
        molybdenum: 1
      },
      production_choice_three: {
        hydrogen: 3,
        carbon: 2,
        gas: 1,
        platinum: 1,
        chloride: 1
      }
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      production_choice_one: {
        name: "Toluene Hydrodealkylation I",
        benzene: 10
      },
      production_choice_two: {
        name: "Toluene Hydrodealkylation II",
        benzene: 10
      },
      production_choice_three: {
        name: "Catalytic Reforming",
        benzene: 15
      }
    }
  },
  biofuel_plants: {
    name: "Biofuel Plants",
    singular: "Biofuel Plant",
    type: "manufacturing",

    construction_turns: 6,
    cost: {
      reinforced_concrete: 6,
      steel_beams: 5,
      copper: 5,
      copper_wire: 4,
      ceramics: 3,
      machine_parts: 3,
      money: 10000
    },
    maintenance: {
      production_choice_one: {
        sugarcane: 2,
        ethylene: 1
      },
      production_choice_two: {
        corn: 4,
        ethylene: 1
      },
      production_choice_three: {
        refined_petroil: 3
      }
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      production_choice_one: {
        name: "Sugarcane Biofuel",
        ethanol: 5
      },
      production_choice_two: {
        name: "Corn Biofuel",
        ethanol: 5
      },
      production_choice_three: {
        name: "Petroil-Ethanol Blending",
        ethanol: 4
      }
    }
  },
  bromine_distilleries: {
    name: "Bromine Distilleries",
    singular: "Bromine Distiller",
    type: "manufacturing",

    construction_turns: 4,
    cost: {
      steel_beams: 6,
      glass: 4,
      copper: 4,
      machine_parts: 4,
      lead: 3,
      money: 10000
    },
    maintenance: {
      salt: 3,
      chlorine: 2
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      bromine: 4
    }
  },
  calcium_preparators: {
    name: "Calcium Preparators",
    singular: "Calcium Preparator",
    type: "manufacturing",

    construction_turns: 5,
    cost: {
      regular_steel: 8,
      machine_parts: 6,
      steel_beams: 4,
      money: 12500
    },
    maintenance: {
      production_choice_calcium: {
        limestone: 3
      },
      production_choice_calcium_carbonate: {
        limestone: 3
      }
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      production_choice_calcium: {
        name: "Calcium",
        calcium: 5
      },
      production_choice_calcium_carbonate: {
        name: "Calcium Carbonate",
        calcium_carbonate: 5
      }
    }
  },
  charcoal_kilns: {
    name: "Charcoal Kilns",
    singular: "Charcoal Kiln",
    type: "manufacturing",

    construction_turns: 3,
    cost: {
      stone: 10,
      wood: 8,
      money: 6000
    },
    maintenance: {
      wood: 10,
    },
    manpower_cost: {
      any_pop: {
        labourers: 10000,
        peasants: 10000
      }
    },
    produces: {
      carbon: 5,
      charcoal: 5
    }
  },
  chloralkali_process_plants: {
    name: "Chloralkali Process Plants",
    singular: "Chloralkali Process Plant",
    type: "manufacturing",

    construction_turns: 4,
    cost: {
      reinforced_concrete: 8,
      machine_parts: 6,
      electric_gear: 5,
      steel_beams: 5,
      lamps: 4,
      money: 17500
    },
    maintenance: {
      production_choice_one: {
        salt: 3,
        machine_parts: 1,
        gas: 2
      },
      production_choice_two: {
        hydrogen: 4,
        copper: 1,
        mercury: 2
      }
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      production_choice_one: {
        name: "Membrane Cell",
        chlorine: 8
      },
      production_choice_two: {
        name: "Castner-Kellner Process",
        chlorine: 4
      }
    }
  },
  derricks: {
    name: "Derricks",
    singular: "Derrick",
    type: "manufacturing",

    construction_turns: 3,
    cost: {
      lumber: 5,
      machine_parts: 3,
      money: 8000
    },
    manpower_cost: {
      labourers: 10000
    },
    produces: {
      petroil: 5
    }
  },
  ethylene_glycol_boiling_plants: {
    name: "Ethylene Glycol Boiling Plants",
    singular: "Ethylene Glycol Boiling plant",
    type: "manufacturing",

    construction_turns: 6,
    cost: {
      stainless_steel: 6,
      machine_parts: 6,
      concrete: 5,
      lightbulbs: 5,
      electric_gear: 5,
      regular_steel: 4,
      money: 25000
    },
    maintenance: {
      ethylene: 3,
      carbon: 2,
      hydrogen: 2,
      gas: 2
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      ethylene_glycol: 5
    }
  },
  epoxyethane_works: {
    name: "Epoxyethane Works",
    singular: "Epoxyethane Work",
    type: "manufacturing",

    construction_turns: 6,
    cost: {
      machine_parts: 12,
      steel_beams: 8,
      machine_parts: 6,
      concrete: 5,
      lightbulbs: 5,
      electric_gear: 5,
      regular_steel: 4,
      money: 25000
    },
    maintenance: {
      production_choice_one: {
        calcium: 2,
        chlorine: 1,
        oxygen: 1,
        hydrogen: 1,
        gas: 2
      },
      production_choice_two: {
        ethylene: 4,
        oxygen: 2,
        gas: 1
      }
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      production_choice_one: {
        name: "Chlorohydrin Process",
        epoxyethane: 3
      },
      production_choice_two: {
        name: "Ethylene Direct Oxidation",
        epoxyethane: 5
      }
    }
  },
  fluorine_plants: {
    name: "Fluorine Plants",
    singular: "Fluorine Plant",
    type: "manufacturing",

    construction_turns: 5,
    cost: {
      stainless_steel: 6,
      regular_steel: 5,
      copper: 4,
      machine_parts: 4,
      electric_gear: 4,
      lightbulbs: 4,
      dyes: 2,
      money: 18000
    },
    maintenance: {
      hydrogen_fluoride: 2,
      sulphuric_acid: 1
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      fluorine: 4
    }
  },
  formaldehyde_plants: {
    name: "Formaldehyde Plants",
    singular: "Formaldehyde Plant",
    type: "manufacturing",

    construction_turns: 4,
    cost: {
      steel_beams: 5,
      stainless_steel: 5,
      regular_steel: 5,
      copper: 5,
      money: 20000
    },
    maintenance: {
      methanol: 3,
      oxygen: 2,
      iron: 1,
      molybdenum: 1
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      formaldehyde: 2
    }
  },
  gas_plants: {
    name: "Gas Plants",
    singular: "Gas Plant",
    type: "manufacturing",

    construction_turns: 4,
    cost: {
      machine_parts: 8,
      stainless_steel: 6,
      regular_steel: 6,
      reinforced_concrete: 5,
      lightbulbs: 3,
      copper_wire: 3,
      money: 30000
    },
    maintenance: {
      production_choice_argon_nitrogen_oxygen: {
        electric_gear: 2,
        machine_parts: 1
      },
      production_choice_krypton: {
        gas: 2,
        machine_parts: 1
      },
      production_choice_neon: {
        electric_gear: 2,
        machine_parts: 1
      },
      production_choice_xenon: {
        electric_gear: 2,
        machine_parts: 1
      }
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      production_choice_argon_nitrogen_oxygen: {
        name: "Argon-Nitrogen-Oxygen",
        argon: 3,
        nitrogen: 2,
        oxygen: 2
      },
      production_choice_krypton: {
        name: "Krypton",
        krypton: 3
      },
      production_choice_neon: {
        name: "Neon",
        neon: 4
      },
      production_choice_xenon: {
        name: "Xenon",
        xenon: 5
      }
    }
  },
  gas_refineries: {
    name: "Gas Refineries",
    singular: "Gas Refinery",
    type: "manufacturing",

    construction_turns: 6,
    cost: {
      machine_parts: 12,
      steel_beams: 8,
      reinforced_concrete: 6,
      lightbulbs: 4,
      aluminium: 4,
      electric_gear: 2,
      money: 12500
    },
    maintenance: {
      natural_gas: 5
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      gas: 8
    }
  },
  gas_works: {
    name: "Gas Works",
    singular: "Gas Works",
    type: "manufacturing",

    construction_turns: 8,
    cost: {
      machine_parts: 8,
      stainless_steel: 6,
      regular_steel: 6,
      reinforced_concrete: 5,
      lightbulbs: 3,
      copper_wire: 3,
      money: 30000
    },
    maintenance: {
      bituminous_coal: 10
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      coal_coke: 8,
      coal_tar: 2
    }
  },
  hydrogen_plants: {
    name: "Hydrogen Plants",
    singular: "Hydrogen Plant",
    type: "manufacturing",

    construction_turns: 5,
    cost: {
      machine_parts: 8,
      stainless_steel: 5,
      regular_steel: 6,
      reinforced_concrete: 5,
      lamps: 3,
      copper_wire: 3,
      money: 25000
    },
    maintenance: {
      production_choice_hydrochloric_acid: {
        gas: 2,
        hydrogen_chloride: 2
      },
      production_choice_hydrogen_one: {
        gas: 1,
        aluminium: 1
      },
      production_choice_hydrogen_two: {
        machine_parts: 1
      },
      production_choice_hydrogen_three: {
        coal_coke: 2,
        petroil: 1,
        gas: 1
      },
      production_choice_hydrogen_chloride_one: {
        chlorine: 2,
        hydrogen: 2
      },
      production_choice_hydrogen_chloride_two: {
        hydrogen: 2,
        sulphuric_acid: 1
      },
      production_choice_hydrogen_chloride_three: {
        acetic_acid: 4,
        hydrogen: 1
      },
      production_choice_hydrogen_fluoride: {
        sulphuric_acid: 4,
        fluorite: 2
      },
      production_choice_hydrogen_peroxide_one: {
        ammonium: 4,
        palladium: 1
      },
      production_choice_hydrogen_peroxide_two: {
        hydrogen: 2,
        oxygen: 2,
        sulphuric_acid: 2
      }
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      production_choice_hydrochloric_acid: {
        name: "Chloralkali Process",
        hydrochloric_acid: 4,
        hydrogen: 2,
        chloride: 1
      },
      production_choice_hydrogen_one: {
        name: "Metal-Acid",
        hydrogen: 5
      },
      production_choice_hydrogen_two: {
        name: "Water Electrolysis",
        hydrogen: 5,
        oxygen: 5
      },
      production_choice_hydrogen_three: {
        name: "Water Gas Shift Reaction",
        hydrogen: 12
      },
      production_choice_hydrogen_chloride_one: {
        name: "Direct Synthesis",
        hydrogen_chloride: 2
      },
      production_choice_hydrogen_chloride_two: {
        name: "Mannheim Process",
        hydrogen_chloride: 1,
        hydrogen: 2
      },
      production_choice_hydrogen_chloride_three: {
        name: "Organic Synthesis",
        hydrogen_chloride: 1,
        hydrogen: 1
      },
      production_choice_hydrogen_fluoride: {
        name: "Hydrogen Fluoride",
        hydrogen_fluoride: 4
      },
      production_choice_hydrogen_peroxide_one: {
        name: "Anthraquinone Process",
        hydrogen_peroxide: 4
      },
      production_choice_hydrogen_peroxide_two: {
        name: "Ammonium Perfulsate Hydrolysis",
        hydrogen_peroxide: 2
      }
    }
  },
  iodine_plants: {
    name: "Iodine Plants",
    singular: "Iodine Plant",
    type: "manufacturing",

    construction_turns: 4,
    cost: {
      steel_beams: 8,
      machine_parts: 6,
      regular_steel: 6,
      reinforced_concrete: 4,
      lamps: 2,
      money: 20000
    },
    maintenance: {
      salt: 3,
      oxygen: 1,
      sulphuric_acid: 1
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      iodine: 5
    }
  },
  lye_factories: {
    name: "Lye Factories",
    singular: "Lye Factory",
    type: "manufacturing",

    construction_turns: 3,
    cost: {
      bricks: 6,
      regular_steel: 4,
      cement: 3,
      machine_parts: 3,
      lumber: 2,
      copper: 2,
      money: 12000
    },
    maintenance: {
      calcium: 2,
      chlorine: 2,
      salt: 1,
      machine_parts: 1
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      sodium_hydroxide: 4
    }
  },
  methanol_plants: {
    name: "Methanol Plants",
    singular: "Methanol Plant",
    type: "manufacturing",

    construction_turns: 4,
    cost: {
      stainless_steel: 6,
      regular_steel: 6,
      machine_parts: 5,
      reinforced_concrete: 4,
      lamps: 3,
      copper_wire: 3,
      money: 8500
    },
    maintenance: {
      hydrogen: 3,
      carbon: 1,
      copper: 1,
      zinc: 1,
      alumina: 1
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      methanol: 3
    }
  },
  mtbe_manufacturing_plants: {
    name: "MTBE Manufacturing Plants",
    singular: "MTBE Manufacturing Plant",
    aliases: ["methyl tertiary-butyl ether", "methyl tert-butyl ether", "tert-butyl methyl ether", "methyl tertiary butyl ether"],
    type: "manufacturing",

    construction_turns: 5,
    cost: {
      steel_beams: 8,
      stainless_steel: 5,
      regular_steel: 5,
      reinforced_concrete: 4,
      lamps: 3,
      copper_wire: 3,
      money: 8500
    },
    maintenance: {
      methanol: 3,
      butadiene: 2,
      graphite: 1,
      refined_petroil: 1,
      gas: 1
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      methyl_tertiary_butyl_ether: 4
    }
  },
  natural_gas_extractors: {
    name: "Natural Gas Extractors",
    singular: "Natural Gas Extractor",
    type: "manufacturing",

    construction_turns: 6,
    cost: {
      electric_gear: 6,
      steel_beams: 6,
      machine_parts: 5,
      lightbulbs: 4,
      money: 10000
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      natural_gas: 5
    }
  },
  nitric_acid_plants: {
    name: "Nitric Acid Plants",
    singular: "Nitric Acid Plant",
    type: "manufacturing",

    construction_turns: 4,
    cost: {
      machine_parts: 8,
      tungsten: 6,
      glass: 5,
      stainless_steel: 5,
      steel_beams: 5,
      lamps: 2,
      money: 12500
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      nitric_acid: 2
    }
  },
  oxygen_chemical_factories: {
    name: "Oxygen Chemical Factories",
    singular: "Oxygen Chemical Factory",
    aliases: ["oxygen plants", "oxygen factories"],
    type: "manufacturing",

    construction_turns: 5,
    cost: {
      machine_parts: 7,
      reinforced_concrete: 6,
      regular_steel: 6,
      aluminium: 4,
      electric_gear: 3,
      money: 15000
    },
    maintenance: {
      nitrogen: 3,
      oxygen: 2
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      oxygen: 1
    }
  },
  phenol_plants: {
    name: "Phenol Plants",
    singular: "Phenol Plant",
    type: "manufacturing",

    construction_turns: 4,
    cost: {
      machine_parts: 12,
      bricks: 10,
      cement: 8,
      steel_beams: 8,
      copper: 7,
      lead: 5,
      lumber: 5,
      lamps: 4,
      money: 8500
    },
    maintenance: {
      production_choice_one: {
        bitumen_coal: 3
      },
      production_choice_two: {
        chloride: 3,
        benzene: 1
      },
      production_choice_three: {
        benzene: 2,
        propylene: 2
      },
      production_choice_four: {
        benzene: 2,
        methylbenzene: 2,
        oxygen: 1
      }
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      production_choice_one: {
        name: "Coal Pyrolysis",
        phenol: 3
      },
      production_choice_two: {
        name: "Benzene Hydrolysis",
        phenol: 4
      },
      production_choice_three: {
        name: "Cumene Process",
        phenol: 3,
        acetone: 2
      },
      production_choice_four: {
        name: "Catalytic Oxidation",
        phenol: 4
      }
    }
  },
  phosphate_works: {
    name: "Phosphate Works",
    singular: "Phosphate Works",
    type: "manufacturing",

    construction_turns: 4,
    cost: {
      machine_parts: 8,
      lumber: 8,
      steel_beams: 5,
      glass: 5,
      concrete: 3,
      money: 10000
    },
    maintenance: {
      calcium: 3,
      sand: 1,
      coal_coke: 1,
      gas: 5
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      phosphorus: 3
    }
  },
  plastic_factories: {
    name: "Plastic Factories",
    singular: "Plastic Factory",
    aliases: ["plastic works"],
    type: "manufacturing",

    construction_turns: 3,
    cost: {
      machine_parts: 12,
      reinforced_concrete: 10,
      electric_gear: 8,
      alumina: 6,
      copper: 4,
      lightbulbs: 3,
      money: 15000
    },
    maintenance: {
      refined_petroil: 5
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      plastics: 8
    }
  },
  refineries: {
    name: "Refineries",
    singular: "Refinery",
    type: "manufacturing",

    construction_turns: 6,
    cost: {
      iron: 15,
      steel_beams: 12,
      machine_parts: 8,
      concrete: 8,
      copper: 6,
      copper_wire: 5,
      lumber: 4,
      glass: 3,
      money: 8800
    },
    maintenance: {
      petroil: 5
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      refined_petroil: 4
    }
  },
  sodium_carbonate_works: {
    name: "Sodium Carbonate Works",
    singular: "Sodium Carbonate Works",
    type: "manufacturing",

    construction_turns: 6,
    cost: {
      bricks: 12,
      machine_parts: 10,
      iron: 9,
      glass: 8,
      cement: 8,
      lamps: 6,
      money: 12500
    },
    maintenance: {
      production_choice_one: {
        salt: 2,
        sulphuric_acid: 1,
        limestone: 1,
        coals: 1
      },
      production_choice_two: {
        salt: 2,
        carbon: 1,
        chloride: 1,
        ammonia: 1
      },
      production_choice_three: {
        salt: 2,
        carbon: 1,
        ammonia: 1
      }
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      production_choice_one: {
        name: "Solvay Process",
        sodium_carbonate: 5
      },
      production_choice_two: {
        name: "Leblanc Process",
        ammonia: 3,
        sodium_carbonate: 2
      },
      production_choice_three: {
        name: "Hou's Process",
        sodium_carbonate: 1,
        fertiliser: 1
      }
    }
  },
  steam_crackers: {
    name: "Steam Crackers",
    singular: "Steam Cracker",
    type: "manufacturing",

    construction_turns: 2,
    cost: {
      steel_beams: 10,
      machine_parts: 10,
      iron: 9,
      glass: 8,
      cement: 8,
      lamps: 6,
      money: 12500
    },
    maintenance: {
      production_choice_butadiene: {
        hydrogen: 2,
        carbon: 2,
        gas: 1
      },
      production_choice_ethylene: {
        hydrogen: 2,
        carbon: 2,
        gas: 1
      },
      production_choice_propylene: {
        hydrogen: 2,
        carbon: 2,
        gas: 1
      }
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      production_choice_butadiene: {
        name: "Butadiene",
        butadiene: 2,
        ethylene: 3,
        propylene: 1
      },
      production_choice_ethylene: {
        name: "Ethylene",
        butadiene: 2,
        ethylene: 3,
        propylene: 1
      },
      production_choice_propylene: {
        name: "Propylene",
        butadiene: 2,
        ethylene: 3,
        propylene: 1
      }
    }
  },
  titanium_dioxide_works: {
    name: "Titanium Dioxide Works",
    singular: "Titanium Dioxide Works",
    type: "manufacturing",

    construction_turns: 4,
    cost: {
      machine_parts: 8,
      reinforced_concrete: 6,
      electric_gear: 5,
      aluminium: 5,
      glass: 4,
      lightbulbs: 3,
      money: 15000
    },
    maintenance: {
      ilmenite: 2
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      titanium_dioxide: 1
    }
  },
  toluene_works: {
    name: "Toluene Works",
    singular: "Toluene Works",
    type: "manufacturing",

    construction_turns: 3,
    cost: {
      iron: 12,
      steel_beams: 10,
      machine_parts: 8,
      bricks: 8,
      glass: 5,
      copper_wire: 4,
      lightbulbs: 3,
      cement: 2,
      money: 12500
    },
    maintenance: {
      production_choice_one: {
        refined_petroil: 3
      },
      production_choice_two: {
        coal_coke: 2
      },
      production_choice_three: {
        benzene: 2,
        methanol: 2,
        alumina: 1
      }
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      production_choice_one: {
        name: "Catalytic Reformation",
        methylbenzene: 1
      },
      production_choice_two: {
        name: "Ethylene Cracker",
        methylbenzene: 1
      },
      production_choice_three: {
        name: "Benzene-Methanol Process",
        methylbenzene: 3
      }
    }
  },
  urea_factories: {
    name: "Urea Factories",
    singular: "Urea Factory",
    type: "manufacturing",

    construction_turns: 4,
    cost: {
      regular_steel: 9,
      steel_beams: 8,
      machine_parts: 8,
      lumber: 5,
      lightbulbs: 4,
      cement: 4,
      money: 15000
    },
    maintenance: {
      ammonia: 3,
      carbon: 2
    },
    manpower_cost: {
      engineers: 10000
    },
    produces: {
      urea: 10
    }
  }
};
