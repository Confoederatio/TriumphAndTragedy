module.exports = {
  ignore_building_keys: [
    "always_display",
    "description",
    "disable_slots",
    "icon",
    "is_housing",
    "name",
    "order"
  ],

  /*
    applyProduction() - Used internally for getBuildingProduction() recursion
    options: {
      config_object: {}, //Passes original building_object to check for top-level fields
      current_scope: { name: "produces" }, //What the current scope being passed to the function is
      modifiers: {}, //Modifier scope, optional
    }
  */
  applyProduction: function (arg0_produces_scope, arg1_options) {
    //Convert from parameters
    var scope = arg0_produces_scope;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var all_good_keys = Object.keys(scope);
    var building_object = options.config_object;
    var current_scope_name;

    if (options.current_scope)
      current_scope_name = options.current_scope.name;

    //Initialise defaults for options
    if (!current_scope_name) current_scope_name = "produces"; //.produces by default
    if (!options.modifiers) options.modifiers = {};

    var production_efficiency_applicable = (
      building_object.produces && building_object.maintenance &&
      current_scope_name == "produces"
    );
    var research_efficiency_applicable = (
      building_object.produces &&
      current_scope_name == "produces"
    );
    var rgo_throughput_applicable = (
      building_object.produces && !building_object.maintenance &&
      current_scope_name == "produces"
    );

    if (building_object) {
      for (var i = 0; i < all_good_keys.length; i++) {
        var local_subobj = scope[all_good_keys[i]];
        var local_values = getList(local_subobj);

        if (all_good_keys[i] == "production_choice" || all_good_keys[i].startsWith("production_choice_")) {
          local_subobj = module.exports.applyProduction(local_subobj, options);
        } else {
          if (lookup.all_goods[all_good_keys[i]]) {
            var local_good = lookup.all_goods[all_good_keys[i]];

            if (all_good_keys[i] == "knowledge") {
              if (research_efficiency_applicable)
                if (options.modifiers.research_efficiency) {
                  for (var x = 0; x < local_values.length; x++)
                    local_values[x] = local_values[x]*options.modifiers.research_efficiency;
                  local_subobj = (local_values.length == 1) ?
                    local_values[0] : local_values;
                }
            } else {
              //production_efficiency
              if (production_efficiency_applicable)
                if (options.modifiers.production_efficiency) {
                  for (var x = 0; x < local_values.length; x++)
                    local_values[x] = local_values[x]*options.modifiers.production_efficiency;
                  local_subobj = (local_values.length == 1) ?
                    local_values[0] : local_values;
                }
              //<resource_key>_gain
              if (options.modifiers[`${all_good_keys[i]}_gain`]) {
                for (var x = 0; x < local_values.length; x++)
                  local_values[x] = local_values[x]*options.modifiers[`${all_good_keys[i]}_gain`];
                local_subobj = (local_values.length == 1) ?
                  local_values[0] : local_values;
              }
              //rgo_throughput
              if (rgo_throughput_applicable)
                if (options.modifiers.rgo_throughput) {
                  for (var x = 0; x < local_values.length; x++)
                    local_values[x] = local_values[x]*options.modifiers.rgo_throughput;
                  local_subobj = (local_values.length == 1) ?
                    local_values[0] : local_values;
                }
            }
          }
        }
      }
    } else {
      log.warn(`applyProduction() was passed with no options.building_object!`);
    }

    //Return statement
    return scope;
  },

  changeProductionValue: function (arg0_scope, arg1_good_key, arg2_min_max_argument, arg3_value) {
    //Convert from parameters
    var production_obj = arg0_scope;
    var good_key = arg1_good_key;
    var min_max_argument = (arg2_min_max_argument) ? arg2_min_max_argument : "both"; //Can be "minimum", "maximum", or "both"
    var value = parseInt(arg3_value);

    //Modify value
    if (production_obj[good_key]) {
      var local_good_value = production_obj[good_key];

      if (min_max_argument == "minimum")
        local_good_value[0] += value;
      if (min_max_argument == "maximum")
        local_good_value[1] += value;
      if (min_max_argument == "both") {
        local_good_value[0] += value;
        local_good_value[1] += value;
      }
    } else {
      if (min_max_argument == "minimum")
        production_obj[good_key] = [value, 0];
      if (min_max_argument == "maximum")
        production_obj[good_key] = [0, value];
      if (min_max_argument == "both")
        production_obj[good_key] = [value, value];
    }

    //Return statement
    return production_obj;
  },

  constructBuilding: function (arg0_amount, arg1_building_name, arg2_province, arg3_index) {
    //Convert from parameters
    var amount = Math.ceil(parseInt(arg0_amount));
    var building_name = arg1_building_name.trim();
    var province_id = arg2_province;
    var construction_index = arg3_index;

    //Declare local instance variables
    var building_obj = module.exports.getBuilding(building_name);
    var new_modifiers = {};
    var province_obj = main.provinces[province_id];
    var raw_building_name = module.exports.getBuilding(building_name, { return_key: true });

    if (province_obj)
      if (province_obj.buildings)
        if (building_obj)
          if (!isNaN(amount)) {
            //Remove index
            if (construction_index) {
              var local_user = main.users[province_obj.owner];

              local_user.under_construction.splice(construction_index, 1);
            }

            //Modifier handler
            if (building_obj.modifiers) {
              var all_modifiers = Object.keys(building_obj.modifiers);

              for (var i = 0; i < all_modifiers.length; i++) {
                var local_value = building_obj.modifiers[all_modifiers[i]];

                new_modifiers[all_modifiers[i]] = (isNaN(local_value)) ?
                  local_value :
                  local_value*amount;
              }

              //Apply new_modifiers
              applyModifiers(province_obj.owner, new_modifiers);
            }

            //Housing modifier
            if (building_obj.houses)
              province_obj.housing = (province_obj.housing) ?
                province_obj.housing + building_obj.houses*amount :
                building_obj.houses*amount;

            //Supply limit handler
            if (building_obj.supply_limit) {
              var supplied_provinces = getProvincesInRange(province_id, config.defines.combat.infrastructure_range);

              for (var i = 0; i < supplied_provinces.length; i++) {
                var local_province = main.provinces[supplied_provinces[i]];

                local_province.supply_limit = (local_province.supply_limit) ?
                  local_province.supply_limit + building_obj.supply_limit*amount :
                  building_obj.supply_limit*amount;
              }
            }

            //Push to buildings array
            if (!province_obj.buildings)
              province_obj.buildings = [];

            for (var i = 0; i < amount; i++) {
              var local_object = {
                id: module.exports.generateBuildingID(province_id),
                building_type: raw_building_name,
                order: province_obj.buildings.length,
                name: module.exports.generateBuildingName(province_obj.id, raw_building_name),

                //Random seeds
                zipf_seed: getZipfTerm(Math.random()*2)
              };

              if (building_obj.manpower_cost) local_object.employment = {};
              if (building_obj.manpower_cost) local_object.stockpile = {
                money: module.exports.getStartingStockpile(building_obj)
              };

              //Set starting production chocie if it has .produces
              if (building_obj.produces) {
                var default_production_choice = module.exports.getDefaultProductionChoice(province_obj.controller, building_obj);

                if (default_production_choice.length > 0)
                  local_object.production_choice = default_production_choice;
              }

              province_obj.buildings.push(local_object);
            }
          }
  },

  declareBuildingInsolvency: function (arg0_building) {
    //Convert from parameters
    var building_obj = arg0_building;

    //Declare local instance variables
    var config_obj = lookup.all_buildings[building_obj.building_type];
    var province_id = building_obj.id.split("-")[0];
    var province_obj = main.provinces[province_id];
    var worker_layoffs = {};

    if (config_obj.manpower_cost) {
      var all_flattened_keys = Object.keys(config_obj.flattened_manpower_cost);

      //Declare insolvency, lay off all workers unless subsidised. If subsidised, give a cash infusion
      if (!building_obj.subsidised || (province_obj.owner != province_obj.controller)) {
        for (var i = 0; i < all_flattened_keys.length; i++) {
          var total_value = config_obj.flattened_manpower_cost[all_flattened_keys[i]];

          modifyValue(worker_layoffs, all_flattened_keys[i], module.exports.layoffWorkers(building_obj, all_flattened_keys[i], total_value));
        }

        //Set as insolvent
        delete building_obj.insolvency_turns;
        building_obj.insolvent = true;
      } else {
        //Infuse as much money as needed and take it from the player's inventory
        var subsidy_infusion = config.defines.economy.subsidy_infusion;
        var money_lost = building_obj.stockpile.money*-1 + subsidy_infusion;
        var usr = main.users[province_obj.controller];

        usr.money -= money_lost;

        modifyValue(building_obj, "subsidies", money_lost);

        if (building_obj.stockpile)
          building_obj.stockpile.money = subsidy_infusion;
      }
    }

    //Return statement
    return worker_layoffs;
  },

  /*
    destroyBuildings() - Demolishes a set of buildings and returns the freed manpower.
    options: {
      province_id: "4406", - The province ID to demolish in
      amount: 2, - Optional. 1 by default
      building_type: "lumberjacks", - Optional. The building type to demolish. If not defined, building_object must be provided

      building_object: {} - The building object to demolish
    }
  */
  destroyBuildings: function (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var individual_id = false;

    var amount = options.amount;
    var building_obj;
    var freed_manpower = {};
    var layoffs = {};
    var province_id = options.province_id;
    var province_obj = main.provinces[province_id];
    var raw_building_name;
    var remaining_amount;

    if (!options.amount) {
      individual_id = true;

      amount = 1;
      building_obj = lookup.all_buildings[options.building_object.building_type];
      raw_building_name = options.building_object.building_type;
    } else {
      building_obj = module.exports.getBuilding(options.building_type);
      raw_building_name = module.exports.getBuilding(options.building_type, { return_key: true });
    }

    remaining_amount = JSON.parse(JSON.stringify(amount));

    //Remove buildings from local province
    if (province_obj)
      if (province_obj.buildings)
        if (building_obj)
          if (!isNaN(amount)) {
            var usr = main.users[province_obj.owner];

            //Supply limit handler
            if (building_obj.supply_limit) {
              var local_user = main.users[province_obj.controller];
              var supplied_provinces = getProvincesInRange(province_id, config.defines.combat.infrastructure_range);

              for (var i = 0; i < supplied_provinces.length; i++) {
                var local_province = main.provinces[supplied_provinces[i]];

                local_province.supply_limit = (local_province.supply_limit) ?
                  local_province.supply_limit - building_obj.supply_limit*amount :
                  0;
              }
            }

            //Splice from buildings array
            for (var i = province_obj.buildings.length - 1; i >= 0; i--)
              if (remaining_amount > 0) {
                var has_building_obj = false;
                var local_building = province_obj.buildings[i];

                if (!individual_id) {
                  has_building_obj = true;
                } else {
                  if (options.building_object.id == local_building.id)
                    has_building_obj = true;
                }

                if (has_building_obj)
                  if (local_building.building_type == raw_building_name) {
                    layoffs = mergeObjects(layoffs, module.exports.declareBuildingInsolvency(local_building));
                    province_obj.buildings.splice(i, 1);
                    remaining_amount--;
                  }
              }

            //Free up manpower
            if (building_obj.manpower_cost) {
              var all_manpower_keys = Object.keys(building_obj.flattened_manpower_cost);

              for (var i = 0; i < all_manpower_keys.length; i++) {
                var manpower_cost = returnSafeNumber(layoffs[all_manpower_keys[i]]);

                usr.pops[`used_${all_manpower_keys[i]}`] -= manpower_cost;

                //Add to tracker variable
                modifyValue(freed_manpower, all_manpower_keys[i], manpower_cost);
              }
            }

            //Make sure user's available pops can't be less than zero
            var all_pops = Object.keys(config.pops);

            for (var i = 0; i < all_pops.length; i++)
              usr.pops[`used_${all_pops[i]}`] = Math.max(0, usr.pops[`used_${all_pops[i]}`]);

            //Return statement
            return freed_manpower;
          }
  },

  generateBuildingID: function (arg0_province_id) {
    //Convert from parameters
    var province_id = arg0_province_id;

    //Declare local instance variables
    var province_obj = getProvince(province_id);

    //While loop to find ID just in case of conflicting random ID's:
    if (province_obj)
      while (true) {
        var duplicate_id = false;
        var local_id_suffix = generateRandomID();

        var full_id = `${province_obj.id}-${local_id_suffix}`;

        //Return and break once a true ID is found
        for (var i = 0; i < province_obj.buildings.length; i++)
          if (province_obj.buildings[i].id == full_id)
            duplicate_id = true;

        if (!duplicate_id) {
          return full_id;
          break;
        }
      }
  },

  /*
    generateBuildingName() - Returns a valid building name in a province as a string.
    options: {
      exclude_number: true/false - Whether to exclude the ending number (e.g. #15)
    }
  */
  generateBuildingName: function (arg0_province_id, arg1_building_type, arg2_options) {
    //Convert from parameters
    var province_id = arg0_province_id;
    var building_type = arg1_building_type.trim().toLowerCase();
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var building_key = module.exports.getBuilding(building_type, { return_key: true });
    var building_obj = module.exports.getBuilding(building_type);
    var building_string = "";
    var province_obj = getProvince(province_id);

    //Fetch building name
    if (province_obj) {
      building_name = `${(province_obj.name) ? province_obj.name : `Province ${province_obj.id}`}`;

      if (building_obj) {
        var total_building_count = 0;

        if (!options.exclude_number)
          total_building_count = module.exports.getTotalBuildings(province_obj.id, building_key);

        building_name = truncateString(`${building_name} ${(building_obj.name) ? building_obj.name : building_key}${(!options.exclude_number) ? ` #${total_building_count + 1}` : ""}`, 80);
      }
    }

    //Return statement
    return building_name;
  },

  getActualBuildingExpenditure: function (arg0_building_obj) {
    //Convert from parameters
    var building_obj = arg0_building_obj;

    //Return statement
    return returnSafeNumber(building_obj.wage_cost);
  },

  getActualBuildingRevenue: function (arg0_building_obj) {
    //Convert from parameters
    var building_obj = arg0_building_obj;

    //Return statement
    return returnSafeNumber(building_obj.goods_revenue);
  },

  //getAllBuildingGoods() - Returns a key array of all goods relevant to the set of a user's available_buildings
  getAllBuildingGoods: function (arg0_user) {
    //Convert from parameters
    var user_id = arg0_user;

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var all_building_goods = [];
    var all_building_keys = Object.keys(lookup.all_buildings);
    var usr = main.users[actual_id];

    //Iterate through all buildings to get all_building_goods
    for (var i = 0; i < all_building_keys.length; i++)
      if (usr.available_buildings.includes(all_building_keys[i])) {
        var local_building = lookup.all_buildings[all_building_keys[i]];

        for (var x = 0; x < reserved.building_good_keys.length; x++) {
          var local_goods_field = local_building[reserved.building_good_keys[x]];

          if (local_goods_field) {
            var local_good_keys = Object.keys(local_goods_field);

            for (var y = 0; y < local_good_keys.length; y++)
              if (!all_building_goods.includes(local_good_keys[y]))
                if (lookup.all_goods[local_good_keys[y]])
                  all_building_goods.push(local_good_keys[y]);
          }
        }
      }

    //Return statement
    return all_building_goods;
  },

  /*
    getBuilding() - Returns back a building object/key based on options
    options: {
      return_key: true/false - Whether to return a key or object. False by default
    }
  */
  getBuilding: function (arg0_name, arg1_options) {
    //Convert from parameters
    var building_name = (typeof arg0_name == "string") ? arg0_name.trim().toLowerCase() : arg0_name;
    var options = (arg1_options) ? arg1_options : {};

    //Guard clause
    if (typeof building_name == "object") return building_name;

    //Declare local instance variables
    var all_building_categories = Object.keys(config.buildings);
    var building_exists = [false, ""];

    //Guard clause for verbatim key
    if (lookup.all_buildings[building_name])
      return (!options.return_key) ? lookup.all_buildings[building_name] : building_name;

    //Iterate over all building categories and their respective buildings - debug key
    for (var i = 0; i < all_building_categories.length; i++) {
      var local_building_category = config.buildings[all_building_categories[i]];

      if (local_building_category[building_name])
        building_exists = [true, (!options.return_key) ? local_building_category[building_name] : building_name];
    }

    //If the building cannot be found verbatim, start a soft-hard search by parsed strings; aliases
    if (!building_exists[0]) {
      //Soft match first
      for (var i = 0; i < all_building_categories.length; i++) {
        var local_building_category = config.buildings[all_building_categories[i]];
        var local_buildings = Object.keys(local_building_category);

        for (var x = 0; x < local_buildings.length; x++) {
          if (!module.exports.ignore_building_keys.includes(local_buildings[x])) {
            var local_building = local_building_category[local_buildings[x]];

            if (local_building.name)
              if (local_building.name.toLowerCase().indexOf(building_name) != -1)
                building_exists = [true, (!options.return_key) ? local_building : local_buildings[x]];
          }
        }
      }

      //Hard match second
      for (var i = 0; i < all_building_categories.length; i++) {
        var local_building_category = config.buildings[all_building_categories[i]];
        var local_buildings = Object.keys(local_building_category);

        for (var x = 0; x < local_buildings.length; x++) {
          if (!reserved.building_category_keys.includes(local_buildings[x])) {
            var local_building = local_building_category[local_buildings[x]];

            if (local_building.name)
              if (local_building.name.toLowerCase() == building_name)
                building_exists = [true, (!options.return_key) ? local_building : local_buildings[x]];
          }
        }
      }
    }

    //If building still cannot be found by names alone, search by alias
    if (!building_exists[0]) {
      //Soft match first
      for (var i = 0; i < all_building_categories.length; i++) {
        var local_building_category = config.buildings[all_building_categories[i]];
        var local_buildings = Object.keys(local_building_category);

        for (var x = 0; x < local_buildings.length; x++) {
          if (!module.exports.ignore_building_keys.includes(local_buildings[x])) {
            var local_building = local_building_category[local_buildings[x]];

            if (local_building.aliases)
              for (var y = 0; y < local_building.aliases.length; y++)
                if (local_building.aliases[y].toLowerCase().indexOf(building_name) != -1)
                  building_exists = [true, (!options.return_key) ? local_building : local_buildings[x]];
          }
        }
      }

      //Hard match second
      for (var i = 0; i < all_building_categories.length; i++) {
        var local_building_category = config.buildings[all_building_categories[i]];
        var local_buildings = Object.keys(local_building_category);

        for (var x = 0; x < local_buildings.length; x++) {
          if (!module.exports.ignore_building_keys.includes(local_buildings[x])) {
            var local_building = local_building_category[local_buildings[x]];

            if (local_building.aliases)
              for (var y = 0; y < local_building.aliases.length; y++)
                if (local_building.aliases[y].toLowerCase() == building_name)
                  building_exists = [true, (!options.return_key) ? local_building : local_buildings[x]];
          }
        }
      }
    }

    //Return statement
    return (building_exists[0]) ? building_exists[1] : undefined;
  },

  getBuildingEffectiveProduction: function (arg0_building_obj) {
    //Convert from parameters
    var building_obj = arg0_building_obj;

    //Declare local instance variables
    var building_employment_level = module.exports.getBuildingEmploymentLevel(building_obj);
    var building_input_fulfilment = module.exports.getBuildingInputFulfilment(building_obj);

    //Return statement
    return [
      building_input_fulfilment[0]*building_employment_level,
      building_input_fulfilment[1]*building_employment_level
    ];
  },

  /*
    getBuildingByID() - Returns a building by its given ID
    options: {
      return_key: true/false - Whether to return the array element instead of the building object
    }
  */
  getBuildingByID: function (arg0_id, arg1_options) {
    //Convert from parameters
    var id = (typeof arg0_id != "object") ? arg0_id.trim().toLowerCase() : arg0_id;
    var options = (arg1_options) ? arg1_options : {};

    //Guard clause
    if (typeof id == "object") return id;

    //Declare local instance variables
    var building_obj;
    var split_id = id.split("-");

    var province_obj = main.provinces[split_id[0]];

    if (province_obj)
      if (province_obj.buildings)
        for (var i = 0; i < province_obj.buildings.length; i++)
          if (province_obj.buildings[i].id == id) {
            building_obj = (!options.return_key) ? province_obj.buildings[i] : i;
            break;
          }

    //Return statement
    return building_obj;
  },

  /*
    getBuildingByName() - Returns a building by its name string
    options: {
      return_key: true/false - Whether to return an array [province_id, building_element] instead of an object
    }
  */
  getBuildingByName: function (arg0_user, arg1_building_name, arg2_options) {
    //Convert from parameters
    var user_id = arg0_user;
    var building_name = (typeof arg1_building_name != "object") ? arg1_building_name.trim().toLowerCase() : arg1_building_name;
    var options = (arg2_options) ? arg2_options : {};

    //Guard clause
    if (typeof building_name == "object") return building_name;

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var building_obj;
    var provinces = getProvinces(user_id, { include_occupations: true });
    var usr = main.users[actual_id];

    //Fetch building by name
    {
      //Iterate over all provinces; soft search first
      for (var i = 0; i < provinces.length; i++)
        if (provinces[i].buildings)
          for (var x = 0; x < provinces[i].buildings.length; x++)
            if (provinces[i].buildings[x].name)
              if (provinces[i].buildings[x].name.trim().toLowerCase().indexOf(building_name) != -1)
                building_obj = provinces[i].buildings[x];

      //Iterate over all provinces; hard search second
      for (var i = 0; i < provinces.length; i++)
        if (provinces[i].buildings)
          for (var x = 0; x < provinces[i].buildings.length; x++)
            if (provinces[i].buildings[x].name)
              if (provinces[i].buildings[x].name.trim().toLowerCase() == building_name)
                building_obj = provinces[i].buildings[x];
    }

    //If building_obj could not be fetched, return by ID
    if (!building_obj) {
      var building_id_obj = module.exports.getBuildingByID(building_name);

      //Return statement
      if (building_id_obj)
        return (!options.return_key) ? building_id_obj : building_id_obj.id;
    }

    //Return statement
    if (building_obj)
      return (!options.return_key) ? building_obj : building_obj.id;
  },

  //Returns all building categories based on order (if it exists)
  getBuildingCategories: function () {
    //Declare local instance variables
    var all_building_categories = Object.keys(config.buildings);
    var building_categories = [];
    var no_order_cache = [];

    //Iterate over all building categories
    for (var i = 0; i < all_building_categories.length; i++) {
      var local_building_category = config.buildings[all_building_categories[i]];

      //Push to either no_order_cache or building_categories
      if (local_building_category.order) {
        if (!building_categories[local_building_category.order - 1]) {
          building_categories[local_building_category.order - 1] = all_building_categories[i];
        } else {
          log.error(`${all_building_categories[i]} has an invalid order number! .order: ${local_building_category.order-1} is already occupied by ${building_categories[local_building_category.order-1]}!\n\nCheck common/buildings for more information on resolving this error.`);
        }
      } else {
        no_order_cache.push(all_building_categories[i]);
      }
    }

    //Push no_order_cache onto the end
    for (var i = 0; i < no_order_cache.length; i++)
      building_categories.push(no_order_cache[i]);

    //Return statement
    return building_categories;
  },

  /*
    getBuildingCategory() - Returns back a building_category object/key based on options
    options: {
      return_key: true/false - Whether or not to return back the building category key instead of object. False by default
    }
  */
  getBuildingCategory: function (arg0_name, arg1_options) {
    //Convert from parameters
    var building_category_name = arg0_name.trim().toLowerCase();
    var options = (arg1_options) ? arg1_options : {};

    //Guard clause
    if (config.buildings[building_category_name])
      return (!options.return_key) ? config.buildings[building_category_name] : building_category_name;

    //Declare local instance variables
    var all_building_categories = Object.keys(config.buildings);
    var all_processed_building_categories = [];
    var building_category_exists = [false, ""]; //[building_category_exists, building_category_obj];

    //Initialise all_processed_building_categories
    for (var i = 0; i < all_building_categories.length; i++)
      (!config.buildings[all_building_categories[i]].name) ?
        all_processed_building_categories.push(parseString(all_building_categories[i])) :
        all_processed_building_categories.push(config.buildings[all_building_categories[i]].name);

    //Fetch config object
    if (config.buildings[building_category_name]) {
      return (!options.return_key) ? config.buildings[building_category_name] : building_category_name;
    } else {
      //If the building category cannot be found verbatim, start a soft-hard search by parsed strings
      //Soft match first
      for (var i = 0; i < all_processed_building_categories.length; i++)
        if (all_processed_building_categories[i].toLowerCase().indexOf(building_category_name) != -1)
          building_category_exists = [true, (!options.return_key) ? config.buildings[all_building_categories[i]] : all_building_categories[i]];

      //Hard match second
      for (var i = 0; i < all_processed_building_categories.length; i++)
        if (all_processed_building_categories[i].toLowerCase() == building_category_name)
          building_category_exists = [true, (!options.return_key) ? config.buildings[all_building_categories[i]] : all_building_categories[i]];

      //Return statement after soft-hard search
      return (building_category_exists[0]) ? building_category_exists[1] : undefined;
    }
  },

  getBuildingCategoryShare: function (arg0_user, arg1_category_name) {
    //Convert from parameters
    var user_id = arg0_user;
    var category_name = arg1_category_name;

    //Declare local instance variables
    var building_total = module.exports.getBuildingTotal(user_id, category_name, { type: "building_category" });
    var total_buildings = module.exports.getBuildingTotal(user_id);

    //Return statement
    return building_total/total_buildings;
  },

  /*
    getBuildingCategoryFromBuilding() - Returns back the building_category object/key based on the specified building name. Only supports raw building names
    options: {
      return_key: true/false - Whether or not to return back the building category key instead of object. False by default
    }
  */
  getBuildingCategoryFromBuilding: function (arg0_name, arg1_options) {
    //Convert from parameters
    var building_name = arg0_name;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var all_building_categories = Object.keys(config.buildings);
    var building_category_exists = [false, ""]; //[building_category_exists, category_name]

    //Guard clause if already category
    if (config.buildings[building_name])
      return (!options.return_key) ? config.buildings[building_name] : building_name;

    for (var i = 0; i < all_building_categories.length; i++)
      if (Object.keys(config.buildings[all_building_categories[i]]).includes(building_name))
        building_category_exists = [true, (!options.return_key) ? config.buildings[all_building_categories[i]] : all_building_categories[i]];

    //Return statement
    return (building_category_exists[0]) ? building_category_exists[1] : undefined;
  },

  /*
    getBuildingConsumption() - Fetches building maintenance relevant to throughput capacity.
    options: {
      employment_level: 0.83 - Optimisation. The current level of employment as a percentage
    }
  */
  getBuildingConsumption: function (arg0_user, arg1_building, arg2_options) {
    //Convert from parameters
    var user_id = arg0_user;
    var building_obj = arg1_building;
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var building_maintenance = {};
    var config_obj = (typeof building_obj == "object") ?
      module.exports.getBuilding(building_obj.building_type) :
      module.exports.getBuilding(building_obj);
    var employment_level;
    var maintenance_obj = {};
    var usr = main.users[actual_id];

    //Only start appending if the .maintenance object exists at all
    if (config_obj.maintenance) {
      //Initialise local instance variables
      {
        //Add employment_level parameter if applicable
        if (config_obj.manpower_cost) {
          employment_level = (options.employment_level) ? options.employment_level : module.exports.getBuildingEmploymentLevel(building_obj);
        } else {
          employment_level = 1;
        }

        //Get building_maintenance from production choice
        //Initialise maintenance_options
        var maintenance_options = {
          no_production: true,
          production_choice: (typeof building_obj == "object") ? building_obj.production_choice : undefined,
          province_id: getCapital(user_id).id
        };

        if (typeof building_obj == "object") {
          maintenance_options.building_object = building_obj;
        } else {
          maintenance_options.building_type = config_obj.id;
        }

        building_maintenance = (typeof building_obj == "object") ?
          module.exports.getProductionChoiceOutput(maintenance_options) : config_obj.maintenance;
        building_maintenance = multiplyObject(building_maintenance, -1);

        var all_building_maintenance_keys = Object.keys(building_maintenance);

        for (var i = 0; i < all_building_maintenance_keys.length; i++)
          if (building_maintenance[all_building_maintenance_keys[i]] < 0)
            delete building_maintenance[all_building_maintenance_keys[i]];
      }

      //Pay maintenance costs
      maintenance_obj = module.exports.applyProduction(
        JSON.parse(JSON.stringify(building_maintenance)),
        {
          config_object: config_obj,
          current_scope: { name: "maintenance" }
        }
      );

      maintenance_obj = multiplyObject(maintenance_obj, employment_level);
    }

    //Return statement
    return maintenance_obj;
  },

  /*
    getBuildingCost() - Returns the cost of a building for the specified user as a JSON object/integer.
    options: {
      type: "all", "money", "goods", "pops" - Returns either all cost arguments, only money (as an integer), goods, or pop costs only.
      amount: - The number of buildings to check the cost for.
    }
  */
  getBuildingCost: function (arg0_user, arg1_building, arg2_options) {
    //Convert from parameters
    var user_id = arg0_user;
    var building_name = arg1_building;

    //Initialise options
    var options = (arg2_options) ? arg2_options : {};
      if (!options.type) options.type = "all";
      if (!options.amount) options.amount = 1;

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var building_obj = module.exports.getBuilding(building_name);
    var costs_obj = {};
    var usr = main.users[actual_id];

    //Only start appending if the .cost object exists at all
    if (building_obj.cost) {
      var all_costs = Object.keys(building_obj.cost);

      for (var i = 0; i < all_costs.length; i++) {
        //Check to make sure that this is an actual resource, and not just a pop value
        var building_cost_modifier = (!Object.keys(config.pops).includes(all_costs[i])) ? returnSafeNumber(usr.modifiers.building_cost, 1) : 1;
        var current_resource_demand = Math.ceil(building_obj.cost[all_costs[i]]*building_cost_modifier*options.amount);

        //Fetch resource_type
        var resource_type = {
          is_money: (all_costs[i] == "money"),
          is_resource: lookup.all_good_names.includes(all_costs[i])
        };
        var valid_resource = false;

        if (resource_type.is_money) {
          if (["all", "money"].includes(options.type))
            valid_resource = true;
        } else if (resource_type.is_resource) {
          if (["all", "goods"].includes(options.type))
            valid_resource = true;
        } else {
          if (["all"].includes(options.type))
            valid_resource = true;
        }

        //Add valid resource to object
        if (valid_resource)
          costs_obj[all_costs[i]] = (!costs_obj[all_costs[i]]) ?
            current_resource_demand :
            costs_obj[all_costs[i]] + current_resource_demand;
      }
    }

    //Begin appending pops if options.type is either "all" or "pops"
    if (building_obj.manpower_cost && ["all", "pops"].includes(options.type)) {
      var all_manpower_costs = Object.keys(building_obj.manpower_cost);

      for (var i = 0; i < all_manpower_costs.length; i++) {
        var current_resource_demand = building_obj.manpower_cost[all_manpower_costs[i]]*options.amount;

        costs_obj[all_manpower_costs[i]] = (!costs_obj[all_manpower_costs[i]]) ?
          current_resource_demand :
          costs_obj[all_manpower_costs[i]] + current_resource_demand;
      }
    }

    //Return object
    return (options.type != "money") ? costs_obj : returnSafeNumber(costs_obj.money, 0);
  },

  /*
    getBuildingEmploymentLevel() - Returns percentage of employment fulfilment for a building
    options: {
      any_pop: true/false, - Optional. If the current scope is any_pop. False by default
      manpower_cost: {}, - The current manpower_cost subscope to compare things against
      return_employment_object: true/false - Returns both the employment object and percentage in { employment: {}, percentage: 0.67 } format.
    }
  */
  getBuildingEmploymentLevel: function (arg0_building_obj, arg1_options) {
    //Convert from parameters
    var building_obj = arg0_building_obj;
    var options = (arg1_options) ? arg1_options : {};

    if (building_obj.employment) {
      //Declare local instance variables
      var config_obj = lookup.all_buildings[building_obj.building_type];
      var fulfilment_percentages = [];
      var employment_obj = (options.employment_obj) ? options.employment_obj : building_obj.employment;
      var scope_fulfilled = false;

      //Initialise options
      if (!options.manpower_cost) options.manpower_cost = JSON.parse(JSON.stringify(config_obj.manpower_cost));

      if (config_obj)
        if (config_obj.manpower_cost) {
          var all_manpower_keys = Object.keys(options.manpower_cost);

          //Iterate over all_manpower_keys
          for (var i = 0; i < all_manpower_keys.length; i++) {
            var local_subobj = options.manpower_cost[all_manpower_keys[i]];

            if (all_manpower_keys[i] == "any_pop" || all_manpower_keys[i].startsWith("any_pop_")) {
              var subobj_fulfilment = module.exports.getBuildingEmploymentLevel(building_obj, {
                any_pop: true,
                manpower_cost: local_subobj,
                return_employment_object: true
              });

              employment_obj = mergeObjects(employment_obj, subobj_fulfilment.employment);
              fulfilment_percentages.push(subobj_fulfilment.percentage);
            } else {
              if (config.pops[all_manpower_keys[i]]) {
                var employment_value = returnSafeNumber(employment_obj[all_manpower_keys[i]]);

                if (options.any_pop) {
                  if (employment_value >= local_subobj) {
                    modifyValue(employment_value, all_manpower_keys[i], local_subobj*-1);
                    fulfilment_percentages = [1];
                    scope_fulfilled = true;
                  } else {
                    if (!scope_fulfilled) {
                      fulfilment_percentages = [Math.max(employment_value/local_subobj, returnSafeNumber(fulfilment_percentages[0]))];
                      employment_value[all_manpower_keys[i]] = 0;
                    }
                  }
                } else {
                  //Regular handler
                  if (employment_value >= local_subobj) {
                    modifyValue(employment_value, all_manpower_keys[i], local_subobj*-1);
                    fulfilment_percentages.push(1);
                  } else {
                    fulfilment_percentages.push(employment_value/local_subobj);
                    employment_value[all_manpower_keys[i]] = 0;
                  }
                }
              }
            }
          }

          //Return statement
          return (!options.return_employment_object) ?
            getAverage(fulfilment_percentages) : {
              employment: employment_obj,
              percentage: getAverage(fulfilment_percentages)
            };
        }
    }

    //Not applicable to an individual building
    return (!options.return_employment_object) ? 1 : {
      employment: {},
      percentage: 1
    };
  },

  getBuildingExpenditure: function (arg0_building_obj) {
    //Convert from parameters
    var building_obj = arg0_building_obj;

    //Declare local instance variables
    var split_key = building_obj.id.split("-");

    var province_obj = main.provinces[split_key[0]];
    var usr = main.users[province_obj.controller];

    var building_consumption = getBuildingConsumption(usr.id, building_obj);
    var config_obj = lookup.all_buildings[building_obj.building_type];
    var current_expenditure = 0;

    var all_building_consumption_keys = Object.keys(building_consumption);

    //See how much money is being spent on input goods
    for (var i = 0; i < all_building_consumption_keys.length; i++) {
      var local_value = building_consumption[all_building_consumption_keys[i]];

      if (local_value >= 0) {
        var local_market_good = main.market[all_building_consumption_keys[i]];

        if (local_market_good) {
          current_expenditure += local_value*local_market_good.buy_price;
        } else if (all_building_consumption_keys[i] == "money") {
          current_expenditure += local_value;
        }
      }
    }

    //See how much money are being spent on wages of each pop type
    if (config_obj.flattened_manpower_cost &&
      building_obj.employees && building_obj.wages
    ) {
      var all_pop_types = Object.keys(config_obj.flattened_manpower_cost);

      for (var i = 0; i < all_pop_types.length; i++)
        current_expenditure += returnSafeNumber(building_obj.employees[all_pop_types[i]])*returnSafeNumber(building_obj.wages[all_pop_types[i]]);
    }

    //Return statement
    return current_expenditure;
  },

  getBuildingFullEmploymentProduction: function (arg0_building_obj) {
    //Convert from parameters
    var building_obj = arg0_building_obj;

    //Declare local instance variables
    var province_id = building_obj.id.split("-")[0];

    //Return statement
    return module.exports.getProductionChoiceOutput({
      building_type: building_obj.building_type,
      province_id: province_id,

      production_choice: building_obj.production_choice
    });
  },

  /*
    getBuildingHiringPositions() - Gets the number of positions for hire of a given pop type.
    options: {
      pop_type: "engineers", - The pop type for which to get the total number of ideal hires for.

      employment_level: 0.50, - Optional. Optimisation parameter
      profit_obj: {}, - Optional. Optimisation parameter.
      remaining_positions: 0, - Optional. Optimisation parameter

      return_object: true/false - Whether to return an object with all local instance variables instead of a single number
    }
  */
  getBuildingHiringPositions: function (arg0_building_obj, arg1_options) {
    //Convert from parameters
    var building_obj = arg0_building_obj;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var config_obj = lookup.all_buildings[building_obj.building_type];
    var employment_level = (options.employment_level) ?
      options.employment_level : module.exports.getBuildingEmploymentLevel(building_obj);
    var wage_obj = module.exports.getBuildingWage(building_obj, {
      pop_type: options.pop_type,

      employment_level: employment_level,
      profit_obj: options.profit_obj,
      remaining_positions: options.remaining_positions,

      return_object: true
    });

    var has_deficit = (wage_obj.profit_obj.profit <= 0);
    var has_liquidity = (building_obj.stockpile.money >= config.defines.economy.minimum_liquidity);
    var has_full_employment_profit = (wage_obj.full_employment_profit > wage_obj.profit_obj.profit);
    var minimum_hiring_liquidity = module.exports.getBuildingMinHiringLiquidity(building_obj, {
      expenditure: wage_obj.profit_obj.expenditure
    });

    var open_positions = 0;

    //Get remaining positions in two hiring cases; make sure that divide by 0 doesn't happen by clamping to 1
    if (building_obj.subsidised) {
      if (returnSafeNumber(employment_level) < 1)
        open_positions = wage_obj.remaining_positions; //Continue hiring workers if employment_level isn't 100% if subsidised
    } else {
      if (
        (has_liquidity && has_deficit && has_full_employment_profit) ||
        (has_liquidity && employment_level < 0.05)
      ) {
        open_positions = minimum_hiring_liquidity/unzero(wage_obj.wage, 1);
      } else if (has_liquidity && !has_deficit) {
        open_positions = wage_obj.profit_obj.profit/unzero(wage_obj.wage, 1);
      }
    }

    //Cap open_positions to config_obj.upper_bound_manpower
    if (config_obj.upper_bound_manpower)
      open_positions = Math.min(open_positions, wage_obj.remaining_positions*config.defines.economy.max_hire_percentage);

    //Return statement
    return (!options.return_object) ? open_positions : {
      hiring_positions: open_positions,

      has_deficit: has_deficit,
      has_liquidity: has_liquidity,
      has_full_employment_profit: has_full_employment_profit,
      minimum_hiring_liquidity: minimum_hiring_liquidity,

      full_employment_profit: wage_obj.full_employment_profit,
      profit_obj: wage_obj.profit_obj,
      remaining_positions: wage_obj.remaining_positions,

      wage: wage_obj.wage
    };
  },

  /*
    getBuildingInputFulfilment() - Fetches maintenance fulfilment from maintenance shortfall scope. Returns an array of potential building fulfilment
    options: {
      maintenance: {}, - Optional. Optimisation parameter. The current maintenance goods scope of the building
      maintenance_shortfall: {}, - The current shortfall ranges of each good in a user's inventory
    }
  */
  getBuildingInputFulfilment: function (arg0_building_obj, arg1_options) {
    //Convert from parameters
    var building_obj = arg0_building_obj;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var input_fulfilments_high = 0;
    var input_fulfilments_low = 0;
    var maintenance_obj = (options.maintenance) ? options.maintenance : module.exports.getBuildingConsumption(user_id, building_obj, {
      employment_level: 1 //Assume full employment
    });
    var split_key = building_obj.id.split("-");

    var province_obj = main.provinces[split_key[0]];
    var usr = main.users[province_obj.controller];

    //Iterate over all_maintenance_keys
    var all_maintenance_keys = Object.keys(maintenance_obj);
    var input_fulfilments = {};

    if (all_maintenance_keys.length > 0) {
      for (var i = 0; i < all_maintenance_keys.length; i++) {
        var local_good_amount = returnSafeNumber(getGoodAmount(province_obj.controller, all_maintenance_keys[i]));
        var local_shortfall = [0, 0];
        var local_value = maintenance_obj[all_maintenance_keys[i]];

        var local_maintenance_cost = (Array.isArray(local_value)) ? local_value : [local_value, local_value];
        local_shortfall = [
          Math.max(local_maintenance_cost[0] - local_good_amount, 0),
          Math.max(local_maintenance_cost[1] - local_good_amount, 0)
        ];

        //Initialise local_shortfall
        if (options.maintenance_shortfall)
          if (options.maintenance_shortfall[all_maintenance_keys[i]])
            local_shortfall = options.maintenance_shortfall[all_maintenance_keys[i]];

        //Initialise local_fulfilment
        var local_fulfilment = [
          Math.min(1 - local_shortfall[0]/unzero(local_maintenance_cost[0], 1), 1),
          Math.min(1 - local_shortfall[1]/unzero(local_maintenance_cost[1], 1), 1)
        ];

        input_fulfilments[all_maintenance_keys[i]] = {
          good_type: all_maintenance_keys[i],
          maintenance: local_maintenance_cost, //[low_cost, high_cost]
          fulfilment: local_fulfilment //[low_fulfilment, high_fulfilment]
        };
      }

      var all_input_fulfilment_keys = Object.keys(input_fulfilments);
      var total_importance = 0;

      for (var i = 0; i < all_input_fulfilment_keys.length; i++) {
        var local_importance = 1/all_input_fulfilment_keys.length;
        var local_value = input_fulfilments[all_input_fulfilment_keys[i]];

        //Apply 50% maintenance cost to money
        if (all_input_fulfilment_keys[i] == "money")
          local_importance = all_input_fulfilment_keys.length*0.50;

        input_fulfilments_low += local_value.fulfilment[0]*local_importance;
        input_fulfilments_high += local_value.fulfilment[1]*local_importance;

        total_importance += local_importance;
      }

      //Return statement; weighted averages
      return [
        input_fulfilments_low/total_importance,
        input_fulfilments_high/total_importance
      ];
    } else {
      //Return statement
      return [1, 1]; //There's no maintenance required, so inputs are fulfilled by default
    }
  },

  getBuildingLastTurnExpenditures: function (arg0_building_obj) {
    //Convert from parameters
    var building_obj = arg0_building_obj;

    //Return statement
    return (returnSafeNumber(building_obj.wage_cost) + returnSafeNumber(building_obj.taxes));
  },

  getBuildingLastTurnRevenue: function (arg0_building_obj) {
    //Convert from parameters
    var building_obj = arg0_building_obj;

    //Return statement
    return (returnSafeNumber(building_obj.goods_revenue));
  },

  //getBuildingMap() - Returns a map of building IDs to building array keys in a given province
  getBuildingMap: function (arg0_province_id) {
    //Convert from parameters
    var province_id = arg0_province_id;

    //Declare local instance variables
    var building_map = {};
    var province_obj = main.provinces[province_id];

    if (province_obj.buildings)
      //Iterate over all buildings in province_obj
      for (var i = 0; i < province_obj.buildings.length; i++)
        building_map[province_obj.buildings[i].id] = i;

    //Return statement
    return building_map;
  },

  /*
    getBuildingMinHiringLiquidity() - Fetches the minimum hiring liquidity for a building.
    options: {
      expenditure: 10, - Optimisation parameter. Optional.
      return_object: true/false - If true, returns object in the format of {
        minimum_hiring_liquidity: 0,
        minimum_liquidity: 0
      }
    }
  */
  getBuildingMinHiringLiquidity: function (arg0_building_obj, arg1_options) {
    //Convert from parameters
    var building_obj = arg0_building_obj;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var current_liquidity = building_obj.stockpile.money;
    var minimum_liquidity = module.exports.getBuildingMinLiquidity(building_obj, { expenditure: options.expenditure });

    var minimum_hiring_liquidity = current_liquidity - minimum_liquidity;

    //Return statement
    return (!options.return_object) ? minimum_hiring_liquidity : {
      minimum_hiring_liquidity: minimum_hiring_liquidity,
      minimum_liquidity: minimum_liquidity
    };
  },

  /*
    getBuildingMinLiquidity() - Fetches the minimum liquidity amount for a building.
    options: {
      expenditure: 10 - Optimisation parameter. Optional.
    }
  */
  getBuildingMinLiquidity: function (arg0_building_obj, arg1_options) {
    //Convert from parameters
    var building_obj = arg0_building_obj;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var building_expenditure = (options.expenditure) ? options.expenditure : module.exports.getBuildingExpenditure(building_obj);
    var min_solvency_turns = module.exports.getBuildingMinSolvencyTurns(building_obj);

    //Return statement
    return Math.max(building_expenditure*min_solvency_turns, config.defines.economy.minimum_liquidity);
  },

  getBuildingMinSolvencyTurns: function (arg0_building_obj) {
    //Convert from parameters
    var building_obj = arg0_building_obj;

    //Return statement
    return Math.min(returnSafeNumber(building_obj.zipf_seed), 1);
  },

  /*
    This method only gets building production, not maintenance. See getBuildingConsumption() for maintenance costs instead.
    options: {
      building_object: {} - Optional. if not defined, defaults to full production for building_type
      building_type: "lumberjacks", - Optional. If not defined, defaults to building_object and factors in total employment
      province_id: "6607", - Required if building is drawn from building_type

      employment_fulfilment: 0.67, - Optimisation parameter. Current employment fulfilment %
      production_choice: "one" - The relevant production choice to check for
    }
  */
  getBuildingProduction: function (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var building_obj = options.building_object;
    var building_production = {};
    var config_obj = (building_obj) ?
      lookup.all_buildings[building_obj.building_type] :
      lookup.all_buildings[options.building_type];
    var production_obj = {};

    if (config_obj.produces) {
      var province_id = (options.building_object) ?
        building_obj.id.split("-")[0] : options.province_id;
      var province_obj = main.provinces[province_id];
      var usr = main.users[province_obj.controller];

      //Get building_production from production choice
      {
        var building_production_choice = (building_obj) ?
          building_obj.production_choice : options.production_choice;

        building_production = (typeof building_obj == "object") ?
          module.exports.getProductionChoiceOutput({
            building_object: building_obj,
            production_choice: building_production_choice,
            province_id: province_obj.id
          }) : config_obj.produces;

        var all_building_production_keys = Object.keys(building_production);

        for (var i = 0; i < all_building_production_keys.length; i++)
          if (building_production[all_building_production_keys[i]] < 0)
            delete building_production[all_building_production_keys[i]];
      }

      //Set production_obj
      var province_rgo_throughput = getCityRGOThroughput(province_obj);

      production_obj = module.exports.applyProduction(
        JSON.parse(JSON.stringify(building_production)),
        {
          config_object: config_obj,
          current_scope: { name: "produces" },
          province_id: province_obj.id,

          modifiers: {
            [`${province_obj.resource}_gain`]:
              (province_obj.resource && province_rgo_throughput) ? province_rgo_throughput : 1, //This serves as the RGO throughput modifier
            production_efficiency: usr.modifiers.production_efficiency,
            research_efficiency: usr.modifiers.research_efficiency
          }
        }
      );

      //Employment handler if valid
      if (options.building_object && config_obj.manpower_cost) {
        //Multiply production_obj by employment_value
        var employment_value = (options.employment_fulfilment) ?
          options.employment_fulfilment :
          module.exports.getBuildingEmploymentLevel(building_obj);

        production_obj = multiplyObject(production_obj, employment_value);
      }
    }

    //Return statement
    return production_obj;
  },

  //getBuildingProductionChoice() - Returns a production choice key for a given building by string smart search
  getBuildingProductionChoice: function (arg0_building, arg1_production_choice) {
    //Convert from parameters
    var building_type = arg0_building;
    var production_choice_name = arg1_production_choice;

    //Declare local instance variables
    var config_obj = lookup.all_buildings[building_type];
    var production_choice_key = [false, ""]; //[key_exists, key_name];

    if (typeof production_choice_name == "object") return production_choice_name; //Object guard clause
    production_choice_name = production_choice_name.trim().toLowerCase();

    //Iterate over all produces keys if they exist
    if (config_obj)
      if (config_obj.produces) {
        if (config_obj.produces[`production_choice_${production_choice_name}`])
          return production_choice_name; //Verbatim string guard clause

        var all_production_keys = Object.keys(config_obj.produces);
        production_choice_name = production_choice_name.toLowerCase().trim();

        //Key search - Soft
        for (var i = 0; i < all_production_keys.length; i++)
          if (all_production_keys[i].startsWith("production_choice_"))
            if (all_production_keys[i].replace("production_choice_", "").toLowerCase().trim().indexOf(production_choice_name) != -1)
              production_choice_key = [true, all_production_keys[i].replace("production_choice_", "")];
        //Key search - Hard
        for (var i = 0; i < all_production_keys.length; i++)
          if (all_production_keys[i].startsWith("production_choice_"))
            if (all_production_keys[i].replace("production_choice_", "").toLowerCase().trim() == production_choice_name)
              production_choice_key = [true, all_production_keys[i].replace("production_choice_", "")];

        //Name search - Soft
        for (var i = 0; i < all_production_keys.length; i++)
          if (all_production_keys[i].startsWith("production_choice_")) {
            var local_production_choice = config_obj.produces[all_production_keys[i]];
            var trimmed_string = all_production_keys[i].replace("production_choice_", "");

            var local_name = (!local_production_choice.name) ?
              parseString(trimmed_string) : local_production_choice.name;

            if (local_name.toLowerCase().trim().indexOf(production_choice_name) != -1)
              production_choice_key = [true, trimmed_string];
          }

        //Name search - Hard
        for (var i = 0; i < all_production_keys.length; i++)
          if (all_production_keys[i].startsWith("production_choice_")) {
            var local_production_choice = config_obj.produces[all_production_keys[i]];
            var trimmed_string = all_production_keys[i].replace("production_choice_", "");

            var local_name = (!local_production_choice.name) ?
              parseString(trimmed_string) : local_production_choice.name;

            if (local_name.toLowerCase().trim() == production_choice_name)
              production_choice_key = [true, trimmed_string];
          }

        //Return statement
        return (production_choice_key[0]) ? production_choice_key[1] : undefined;
      }
  },

  /*
    getBuildingProfit() - Fetches current building profit this turn
    options: {
      return_object: true/false - Returns { expenditure: 0, revenue: 0, profit: 0 }
    }
  */
  getBuildingProfit: function (arg0_building_obj, arg1_options) {
    //Convert from parameters
    var building_obj = arg0_building_obj;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var current_expenditure = module.exports.getBuildingExpenditure(building_obj);
    var current_revenue = module.exports.getBuildingRevenue(building_obj);

    var current_profit = current_revenue - current_expenditure;

    //Return statement
    return (!options.return_object) ? current_profit : {
      expenditure: current_expenditure,
      revenue: current_revenue,

      profit: current_profit
    };
  },

  /*
    getBuildingRemainingPositions() - Returns the number of remaining employee positions available in a building.
    options: {
      employment_level: 0.60, - The current percentage of employment fulfilment
      pop_type: "engineers" - Optional. The pop type for which to get remaining positions for. Uses all pops by default
    }
  */
  getBuildingRemainingPositions: function (arg0_building_obj, arg1_options) {
    //Convert from parameters
    var building_obj = arg0_building_obj;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var config_obj = lookup.all_buildings[building_obj.building_type];
    var remaining_positions = 0;

    if (config_obj.manpower_cost) {
      var all_pops = (options.pop_type) ? getList(options.pop_type) : Object.keys(building_obj.flattened_manpower_cost);

      var current_employees = getObjectSum(building_obj.employment);
      var upper_bound_employees = config_obj.upper_bound_manpower;

      if (current_employees < upper_bound_employees) {
        var employment_level = (options.employment_level) ? options.employment_level : module.exports.getBuildingEmploymentLevel(building_obj);

        for (var i = 0; i < all_pops.length; i++) {
          var local_employees = returnSafeNumber(building_obj.employment[all_pops[i]]);
          var local_value = config_obj.flattened_manpower_cost[all_pops[i]];

          //If current employment of pop type is 0, then push local value to remaining positions to incentivise hiring this pop type
          remaining_positions += (local_employees <= 0) ? local_value :
            Math.min(local_value, local_employees*(1/employment_level));
        }
      }
    }

    //Return statement
    return remaining_positions;
  },

  /*
    getBuildingRevenue() - Calculates total building revenue from produced goods.
    options: {
      goods: {} - Optional. Optimisation parameter. Specifies a theoretical alternate amount of produced goods
    }
  */
  getBuildingRevenue: function (arg0_building_obj, arg1_options) {
    //Convert from parameters
    var building_obj = arg0_building_obj;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var current_revenue = 0;
    var province_id = building_obj.id.split("-")[0];
    var province_obj = main.provinces[province_id];

    var goods_obj = (options.goods) ? options.goods : getBuildingProduction({
      building_object: building_obj,
      province_id: province_id
    });

    //Iterate over goods_obj and multiply by current market price, 0 if not sellable
    var all_good_keys = Object.keys(goods_obj);

    for (var i = 0; i < all_good_keys.length; i++) {
      var local_market_good = main.market[all_good_keys[i]];
      var local_value = goods_obj[all_good_keys[i]];

      if (local_value >= 0)
        if (local_market_good) {
          current_revenue += local_value*local_market_good.buy_price;
        } else if (all_good_keys[i] == "actions") {
          current_revenue += local_value*config.defines.economy.money_per_action;
        } else if (all_good_keys[i] == "money") {
          current_revenue += local_value;
        }
    }

    //Return statement
    return current_revenue;
  },

  /*
    getBuildings() - Returns an array of all valid building objects/keys.
    options: {
      return_names: true/false - Whether to return back keys or not
      return_object: true/false - Whether or not to return back a singular object.
    }
  */
  getBuildings: function (arg0_options) {
    //Convert from parameters; initialise options
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var all_building_categories = module.exports.getBuildingCategories();
    var all_buildings = [];
    var building_object = {};

    //Push all valid buildings to array
    for (var i = 0; i < all_building_categories.length; i++) {
      var local_category = config.buildings[all_building_categories[i]];
      var local_buildings = Object.keys(local_category);

      for (var x = 0; x < local_buildings.length; x++)
        if (!module.exports.ignore_building_keys.includes(local_buildings[x])) {
          var local_building = local_category[local_buildings[x]];

          if (local_building.manpower_cost) {
            local_building.flattened_manpower_cost = flattenObject(local_building.manpower_cost);

            local_building.upper_bound_manpower = getObjectSum(local_building.flattened_manpower_cost);
          }

          all_buildings.push((options.return_names) ?
            local_buildings[x] :
            local_category[local_buildings[x]]
          );
          building_object[local_buildings[x]] = local_category[local_buildings[x]];
        }
    }

    //Return statement
    return (!options.return_object) ? all_buildings : building_object;
  },

  //getBuildingsToCategoryMap() - Returns an object of building keys to their building category key
  getBuildingsToCategoryMap: function () {
    //Declare local instance variables
    var all_building_categories = Object.keys(config.buildings);
    var all_buildings = module.exports.getBuildings({ return_object: true });
    var category_map = {};

    var all_building_keys = Object.keys(all_buildings);

    //Iterate over all_building_keys and call module.exports.getBuildingCategoryFromBuilding()
    for (var i = 0; i < all_building_keys.length; i++)
      category_map[all_building_keys[i]] = module.exports.getBuildingCategoryFromBuilding({ return_key: true });

    //Return statement
    return category_map;
  },

  getBuildingShare: function (arg0_user, arg1_building_name) {
    //Convert from parameters
    var user_id = arg0_user;
    var building_name = arg1_building_name;

    //Declare local instance variables
    var building_total = module.exports.getBuildingTotal(user_id, building_name);
    var total_buildings = module.exports.getBuildingTotal(user_id);

    //Return statement
    return building_total/total_buildings;
  },

  //Gets building slots for a given category/building, returns -1 if unlimited
  /*
    getBuildingSlots() - Returns an object of various building slot statistics for a given category within a city.

    options: {
      type: "all", "available_slots", "total_buildings", "total_slots", "under_construction"; all returns entire object, under_construction returns only buildings under construction in that category
    }

    returns: {
      available_slots: -1, 0, -
      total_buildings: 0, -
      total_buildings_under_construction: 0, -
      total_slots: -1, 0, -
    }
  */
  getBuildingSlots: function (arg0_user, arg1_city_name, arg2_building_category, arg3_options) {
    //Convert from parameters
    var user_id = arg0_user;
    var city_name = arg1_city_name;
    var building_category_name = arg2_building_category;

    //Initialise options
    var options = (arg3_options) ? arg3_options : {
      type: "all"
    };

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var available_building_slots = [false, {
      available_slots: 0,
      total_buildings: 0,
      total_buildings_under_construction: 0,
      total_slots: 0
    }]; //[encountered_error, { available_slots: 0, total_buildings: 0, total_buildings_under_construction: 0, total_slots: 0}]
    var building_category = module.exports.getBuildingCategory(building_category_name);
    var building_obj = module.exports.getBuilding(building_category_name);
    var city_obj = (typeof city_name != "object") ?
      getCity(city_name, { users: user_id }) :
      city_name;
    var raw_building_category_name = module.exports.getBuildingCategory(building_category_name, { return_key: true });
    var raw_building_name = module.exports.getBuilding(building_category_name, { return_key: true });
    var usr = main.users[actual_id];

    //Check to see whether building_category_name is of type building or building_category
    try {
      if (building_category) {
        var all_buildings_in_category = Object.keys(building_category);

        //Count all buildings in category in city
        for (var i = 0; i < city_obj.buildings.length; i++)
          if (Object.keys(building_category).includes(city_obj.buildings[i].building_type))
            available_building_slots[1].total_buildings++;

        //Fetch total available slots in city for building_category
        available_building_slots[1].total_slots =
          Math.min(usr.modifiers[`${raw_building_category_name}_building_slots`], 1) +
            Math.max(city_obj[`${raw_building_category_name}_building_slots`] - usr.modifiers[`${raw_building_category_name}_building_slots`], 0) +
            returnSafeNumber(usr.modifiers[raw_building_name]) +
            returnSafeNumber(usr.modifiers[`${raw_building_category_name}_building_slots`]) + usr.modifiers.extra_building_slots;

        //Set .available_slots
        available_building_slots[1].available_slots =
          available_building_slots[1].total_slots -
          available_building_slots[1].total_buildings;

        //Reset available/total slots if building slots are disabled for this category
        if (building_category.disable_slots) {
          available_building_slots[1].available_slots = -1;
          available_building_slots[1].total_slots = -1;
        }

        available_building_slots[0] = true;
      } else if (building_obj) {
        //If building_category_name is of type building, fetch available slots for that local building
        //Declare local instance variables
        var all_building_categories = Object.keys(config.buildings);
        var actual_building_category;
        var total_building_type = 0;

        for (var i = 0; i < all_building_categories.length; i++)
          if (Object.keys(config.buildings[all_building_categories[i]]).includes(building_category_name))
            actual_building_category = all_building_categories[i];

        var local_building_category = module.exports.getBuildingCategory(actual_building_category);

        //Fetch total_buildings
        for (var i = 0; i < city_obj.buildings.length; i++)
          if (
            (Object.keys(local_building_category).includes(city_obj.buildings[i].building_type) && !local_building_category.disable_slots) ||
            (local_building_category.disable_slots && city_obj.buildings[i].building_type == raw_building_name)
          ) {
            available_building_slots[1].total_buildings++;

            //Increment for total_building_type
            if (city_obj.buildings[i].building_type == raw_building_name)
              total_building_type++;
          }

        //Fetch total available slots in city for that building type
        if (building_obj.separate_building_slots) {
          available_building_slots[1].total_slots = (usr.modifiers[raw_building_name]) ?
            usr.modifiers[raw_building_name] :
            0;

          //Set total number of available_slots
          available_building_slots[1].available_slots =
            available_building_slots[1].total_slots -
            available_building_slots[1].total_buildings;
        } else if (building_obj.unlimited_slots) {
          available_building_slots[1].available_slots = -1;
          available_building_slots[1].total_slots = -1;
        } else {
          var actual_raw_building_category_name = module.exports.getBuildingCategory(actual_building_category, { return_key: true });

          available_building_slots[1].total_slots =
            returnSafeNumber(usr.modifiers[raw_building_name]) + usr.modifiers.extra_building_slots;

            available_building_slots[1].total_slots = Math.min(city_obj[`${actual_raw_building_category_name}_building_slots`] - available_building_slots[1].total_buildings, available_building_slots[1].total_slots);
          available_building_slots[1].available_slots =
            available_building_slots[1].total_slots -
            available_building_slots[1].total_buildings;
        }

        available_building_slots[0] = true;
      }
    } catch {}

    //under_construction handler
    try {
      for (var i = 0; i < usr.under_construction.length; i++)
        if (usr.under_construction[i].province_id == city_obj.id)
          if (building_category) {
            var local_building_category = module.exports.getBuildingCategoryFromBuilding(usr.under_construction[i].building_type, { return_key: true });

            if (local_building_category == raw_building_category_name)
              available_building_slots[1].total_buildings_under_construction += usr.under_construction[i].building_amount;
          } else if (building_obj) {
            if (usr.under_construction[i].building_type == raw_building_name)
              available_building_slots[1].total_buildings_under_construction += usr.under_construction[i].building_amount;
          }

      //Update .available_slots
      available_building_slots[1].available_slots -= available_building_slots[1].total_buildings_under_construction;
    } catch {}

    //Return statement
    switch (options.type) {
      case "all":
        return (available_building_slots[0]) ? available_building_slots[1] : undefined;

        break;
      case "available_slots":
        return (available_building_slots[0]) ? available_building_slots[1].available_slots  : undefined;

        break;
      case "total_buildings":
        return (available_building_slots[0]) ? available_building_slots[1].total_buildings : undefined;

        break;
      case "total_slots":
        return (available_building_slots[0]) ? available_building_slots[1].total_slots : undefined;

        break;
      case "under_construction":
        return (available_building_slots[0]) ? available_building_slots[1].total_buildings_under_construction : undefined;

        break;
    }
  },

  /*
    getBuildingTotal() - Fetches the total number of buildings a user has of a specified building, category, or general total.
    options:{
      type: "building"/"building_category"/"total" - Resolves to "building" or "total" by default based on context
      include_hostile_occupations: true/false, - Whether to include hostile occupations or not.
      include_occupations: true/false - Whether to include occupations by the target user
    }
  */
  getBuildingTotal: function (arg0_user, arg1_building_name, arg2_options) {
    //Convert from parameters
    var user_id = arg0_user;
    var building_name = arg1_building_name;
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var provinces = getProvinces(user_id, {
      include_hostile_occupations: options.include_hostile_occupations,
      include_occupations: options.include_occupations
    });
    var total = 0;

    //Iterate over provinces
    for (var i = 0; i < provinces.length; i++)
      if (provinces[i].buildings) {
        if (options.type == "total" || !building_name) {
          total += provinces[i].buildings.length;
        } else {
          var category_obj = config.buildings[building_name];
          var is_category = (options.type == "building_category");

          for (var x = 0; x < provinces[i].buildings.length; x++) {
            var local_building_type = provinces[i].buildings[x].building_type;

            if (is_category) {
              if (category_obj[local_building_type])
                total++;
            } else if (local_building_type == building_name) {
              total++;
            }
          }
        }
      }

    //Return statement
    return total;
  },

  /*
    getBuildingWage() - Returns the wage for a certain pop type a building is hiring by accounting for competition and staple goods price.
    options: {
      pop_type: "engineers", - The pop type the building is hiring
      return_object: true/false, - Whether or not to return an object of all local instance variables and resultant employment. False by default

      employment_level: 0.50, - Optional. Optimisation parameter
      profit_obj: {}, - Optional. Optimisation parameter
      remaining_positions: 0 - Optional. Optimisation parameter
    }
  */
  getBuildingWage: function (arg0_building_obj, arg1_options) {
    //Convert from parameters
    var building_obj = arg0_building_obj;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var current_positions = 0;
    var full_employment_profit;
    var profit_obj = (options.profit_obj) ? options.profit_obj :
      module.exports.getBuildingProfit(building_obj, { return_object: true });
    var remaining_positions = (options.remaining_positions) ?
      options.remaining_positions :
      module.exports.getBuildingRemainingPositions(building_obj, {
        employment_level: options.employment_level, pop_type: options.pop_type
      });

    //current_positions should have employment
    current_positions += returnSafeNumber(remaining_positions);
    current_positions += returnSafeNumber(building_obj.employment[options.pop_type]);

    //Fetch full_employment_profit
    var full_employment_goods_obj = module.exports.getBuildingFullEmploymentProduction(building_obj);
    full_employment_profit = module.exports.getBuildingRevenue(building_obj, { goods: full_employment_goods_obj });

    //Get employment_liquidity
    var employment_liquidity = Math.abs(full_employment_profit - profit_obj.profit);
    var min_employment_liquidity = profit_obj.profit*config.defines.economy.min_employment_wage;

    if (employment_liquidity < min_employment_liquidity)
      employment_liquidity = min_employment_liquidity;

    //Fetch position_wage
    var position_wage = employment_liquidity/unzero(current_positions, 1);

    //Return statement
    return (!options.return_object) ? position_wage : {
      full_employment_profit: full_employment_profit,
      profit_obj: profit_obj,
      remaining_positions: remaining_positions,

      wage: position_wage
    };
  },

  //getBuildingWages() - Returns a sorted object of building wages in a province for a given pop type
  getBuildingWages: function (arg0_province_id, arg1_pop_type) {
    //Convert from parameters
    var province_id = arg0_province_id;
    var pop_type = arg1_pop_type;

    //Declare local instance variables
    var building_wages = {};
    var province_obj = main.provinces[province_id];

    if (province_obj) {
      if (province_obj.buildings)
        //Iterate over all buildings
        for (var i = 0; i < province_obj.buildings.length; i++) {
          var local_building = province_obj.buildings[i];

          if (local_building[`${pop_type}_wage`])
            building_wages[local_building.id] = local_building[`${pop_type}_wage`];
        }
    }

    building_wages = sortObject(building_wages);

    //Return statement
    return building_wages;
  },

  getDefaultProductionChoice: function (arg0_user, arg1_building) { //[WIP] - Allow user to custom set default production choice later
    //Convert from parameters
    var user_id = arg0_user;
    var building_name = arg1_building;

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var building_obj = (typeof building_name != "object") ? getBuilding(building_name) : building_name;
    var has_production_choice = [false, ""]; //[production_choice_exists, production_choice_name];
    var usr = main.users[actual_id];

    //Check if building has_production_choice in .produces
    if (building_obj.produces) {
      var all_production_keys = Object.keys(building_obj.produces);

      for (var i = 0; i < all_production_keys.length; i++)
        if (all_production_keys[i] == "production_choice" || all_production_keys[i].startsWith("production_choice_")) {
          has_production_choice = [true, all_production_keys[i].replace("production_choice_", "")];
          break;
        }
    }

    //Return statement
    return (has_production_choice[0]) ? has_production_choice[1] : "";
  },

  /*
    getMedianWage() - Returns the median wage for a given pop type in a province.
    options: {
      pop_type: "engineers", - The pop type to fetch the median wage for

      building_wage_obj: {} - Optional. Optimisation parameter fed in from getBuildingWages()
    }
  */
  getMedianWage: function (arg0_province_id, arg1_options) {
    //Convert from parameters
    var province_id = arg0_province_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var building_wage_obj = (options.building_wage_obj) ? options.building_wage_obj : module.exports.getBuildingWages(province_id, options.pop_type);
    var province_obj = main.provinces[province_id];

    var all_building_wages = Object.keys(building_wage_obj);

    if (all_building_wages.length % 2 == 0) {
      var index_one = all_building_wages[all_building_wages.length/2];
      var index_two = all_building_wages[all_building_wages.length/2 + 1];

      //Return statement
      return (building_wage_obj[index_one] + building_wage_obj[index_two])/2;
    } else {
      var index_one = all_building_wages[(all_building_wages.length + 1)/2];

      //Return statement
      return building_wage_obj[index_one];
    }
  },

  /*
    getProduction() - Returns the production value of a specific good or all goods for a user. Note that "all" for arg1_good returns an object of all goods with their minimum and maximum production values being stored in a 2-element array.

    options: {
      exclude_artisan_production: true/false, - Optional. Whether to exclude artisan production. False by default
      exclude_rgo_production: true/false, - Optional. Whether to exclude Subsistence RGO production. False by default
      include_pop_consumption: true/false, - Optional. Whether to include pop consumption. False by default
      is_real: true/false - Whether building effects should actually be applied to the user or not. False by default
    }
  */
  getProduction: function (arg0_user, arg1_good, arg2_options) {
    console.time(`getProduction()`);

    //Convert from parameters
    var user_id = arg0_user;
    var good_type = (arg1_good) ? arg1_good : "all";
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables, corresponding functions
    var actual_id = main.global.user_map[user_id];
    var all_goods = lookup.all_good_names;
    var production_obj = {};
    var usr = main.users[actual_id];

    //Note that deep copies are made to make sure not to effect the actual user variable and to run a valid simulation to simply fetch values instead of alter them
    var virtual_usr = JSON.parse(JSON.stringify(usr));

    var virtual_inventory = virtual_usr.inventory;

    //Get all goods production by default, filter only if good_type is not set to "all"
    if (usr) {
      try {
        var all_provinces = getProvinces(user_id, { include_hostile_occupations: true });
        var building_cache = {
          employment: {}, //ID - Employment level key map
          maintenance: {} //ID - Maintenance object map
        };
        var maintenance_obj = {};
        var maintenance_shortfalls = {};

        var army_maintenance_obj = getArmyMaintenance(user_id);
        var all_army_maintenance_costs = Object.keys(army_maintenance_obj);

        //Subtract army maintenance
        for (var i = 0; i < all_army_maintenance_costs.length; i++) {
          var local_amount = army_maintenance_obj[all_army_maintenance_costs[i]];

          changeProductionValue(maintenance_obj, `${all_army_maintenance_costs[i]}_upkeep`, "minimum", local_amount);
          changeProductionValue(maintenance_obj, `${all_army_maintenance_costs[i]}_upkeep`, "maximum", local_amount);
        }

        //Fetch maintenance_obj from all buildings first
        for (var i = 0; i < all_provinces.length; i++)
          //Iterate over all_buildings in a province
          if (all_provinces[i].buildings)
            for (var x = 0; x < all_provinces[i].buildings.length; x++) {
              var local_building = all_provinces[i].buildings[x];
              var local_employment = module.exports.getBuildingEmploymentLevel(local_building, { return_employment_object: true });
              var local_maintenance = module.exports.getBuildingConsumption(user_id, local_building, { employment_level: local_employment.level });

              //Initialise building_cache for building
              {
                building_cache.employment[local_building.id] = local_employment;
                building_cache.maintenance[local_building.id] = local_maintenance;
              }

              //Iterate over all_local_maintenance to push to maintenance_shortfalls
              var all_local_maintenance = Object.keys(local_maintenance);

              for (var y = 0; y < all_local_maintenance.length; y++) {
                var local_array = getList(local_maintenance[all_local_maintenance[y]]);
                if (local_array.length == 1) local_array.push(local_array[0]);

                changeProductionValue(maintenance_obj, `${all_local_maintenance[y]}_upkeep`, "minimum", local_array[0]);
                changeProductionValue(maintenance_obj, `${all_local_maintenance[y]}_upkeep`, "maximum", local_array[1]);
              }
            }

        //Fetch maintenance_shortfalls
        var all_maintenance_keys = Object.keys(maintenance_obj);

        for (var i = 0; i < all_maintenance_keys.length; i++) {
          var local_good_amount = getGoodAmount(user_id, all_maintenance_keys[i]);
          var local_value = maintenance_obj[all_maintenance_keys[i]];

          maintenance_shortfalls[all_maintenance_keys[i]] = [
            Math.max(Math.min(local_good_amount/local_value[0], 1), 0),
            Math.max(Math.min(local_good_amount/local_value[1], 1), 0)
          ];
          maintenance_shortfalls[all_maintenance_keys[i]].sort();
        }

        //Process production_obj from all buildings next
        for (var i = 0; i < all_provinces.length; i++)
          //Iterate over all_buildings in a province
          if (all_provinces[i].buildings) {
            for (var x = 0; x < all_provinces[i].buildings.length; x++) {
              var local_building = all_provinces[i].buildings[x];
              var local_employment = building_cache.employment[local_building.id]; //[WIP] - FIX this
              var local_input_fulfilment = module.exports.getBuildingInputFulfilment(local_building, {
                maintenance: building_cache.maintenance[local_building.id],
                maintenance_shortfall: maintenance_shortfalls
              });
              var local_production = module.exports.getBuildingProduction({
                building_object: local_building,
                employment_fulfilment: local_employment.percentage
              });

              var config_obj = lookup.all_buildings[local_building.building_type];

              //Iterate over all_local_production to push to production_obj; multiply production by maintenance shortfall
              var all_local_production = Object.keys(local_production);

              for (var y = 0; y < all_local_production.length; y++) {
                var local_array = getList(local_production[all_local_production[y]]);
                if (local_array.length == 1)
                  local_array.push(returnSafeNumber(local_array[0]));

                changeProductionValue(production_obj, all_local_production[y], "minimum", returnSafeNumber(local_array[0]*local_input_fulfilment[0]));
                changeProductionValue(production_obj, all_local_production[y], "maximum", returnSafeNumber(local_array[1]*local_input_fulfilment[1]));
              }

              //Special effect handler
              if (config_obj.special_effect) {
                var local_array = [
                  (local_input_fulfilment[0] >= 1), //True is 1 by default
                  (local_input_fulfilment[1] >= 1)
                ];
                var local_key = `${local_building.building_type}_special_effect`;

                if (production_obj[local_key]) {
                  production_obj[local_key][0] += local_array[0];
                  production_obj[local_key][1] += local_array[1];
                } else {
                  production_obj[local_key] = local_array;
                }
              }

              //Process building handler if this is real
              if (options.is_real)
                try {
                  all_provinces[i].buildings[x] = module.exports.processBuilding(local_building, local_production);
                } catch (e) {
                  console.log(e);
                }
            }

            //Fetch subsistence production
            if (all_provinces[i].subsistence) {
              var local_subsistence_obj = all_provinces[i].subsistence;
              var local_subsistence_production = module.exports.getSubsistenceProduction(all_provinces[i].id, local_subsistence_obj, {
                exclude_artisan_production: options.exclude_artisan_production,
                exclude_rgo_production: options.exclude_rgo_production
              });

              if (local_subsistence_production) {
                var all_subsistence_keys = Object.keys(local_subsistence_production);

                //Iterate over all_subsistence_keys
                for (var x = 0; x < all_subsistence_keys.length; x++) {
                  var local_value = local_subsistence_production[all_subsistence_keys[x]];

                  if (!production_obj[all_subsistence_keys[x]])
                    production_obj[all_subsistence_keys[x]] = [0, 0];
                  production_obj[all_subsistence_keys[x]][0] += local_value;
                  production_obj[all_subsistence_keys[x]][1] += local_value;
                }
              }
            }
          }

        //Merge maintenance_obj into production_obj; sort so that it really is [min, max]
        production_obj = mergeObjects(production_obj, maintenance_obj);

        var all_production_keys = Object.keys(production_obj);

        for (var i = 0; i < all_production_keys.length; i++)
          if (Array.isArray(production_obj[all_production_keys[i]]))
            production_obj[all_production_keys[i]].sort();

        //Fetch pop consumption (last turn)
        if (options.include_pop_consumption) {
          var pop_consumption_obj = getUserPopConsumption(user_id);

          var all_pop_consumption_keys = Object.keys(pop_consumption_obj);

          //Iterate over all_pop_consumption_keys
          for (var i = 0; i < all_pop_consumption_keys.length; i++) {
            var local_key = `${all_pop_consumption_keys[i]}_upkeep`;
            var local_value = pop_consumption_obj[all_pop_consumption_keys[i]];

            if (!production_obj[local_key])
              production_obj[local_key] = [0, 0];
            var local_production_value = production_obj[local_key];

            local_production_value[0] += local_value;
            local_production_value[1] += local_value;
          }
        }
      } catch (e) {
        log.error(`getProduction() - ran into an error whilst trying to parse production for User ID: ${e}.`);
        console.error(e);
      }
    }

    console.timeEnd(`getProduction()`);

    //Return statement
    return (good_type == "all") ?
      (Object.keys(production_obj).length > 0) ? production_obj : {} :
        (production_obj[good_type]) ? production_obj[good_type] : [0, 0];
  },

  /*
    getProductionChain() - Returns a special object mapping various stages of a good's production chain. Used recursively. Base production methods are referred to with the "base" key.

    Returns {
     steel: { //good
      building_1: { //building type
       base: { //production choice
        iron: -5,
        coal: -5,
        regular_steel: 5
       }
      }
      ..
    }
  */
  getProductionChain: function (arg0_user, arg1_good, arg2_used_goods, arg3_depth) {
    //Convert from parameters
    var user_id = arg0_user;
    var good_key = arg1_good;
    var used_goods = (arg2_used_goods) ? arg2_used_goods : []; //Used for tracking which goods have already been appended to avoid infinite loops if they exist
    var depth = (arg3_depth) ? arg3_depth : 1;

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var all_building_keys = Object.keys(lookup.all_buildings);
    var capital_obj;
    var production_chain_obj = {};

    if (user_id != "") capital_obj = getCapital(user_id);
    if (!capital_obj) capital_obj = main.provinces["1"];

    //Iterate over all buildings
    var dependent_goods = [];

    //Initialise 1st layer good_key object
    if (!production_chain_obj[good_key]) production_chain_obj[good_key] = {};

    //Append buildings and relevant production choices to production_chain_obj
    for (var i = 0; i < all_building_keys.length; i++) {
      var building_obj = lookup.all_buildings[all_building_keys[i]];
      var local_production_obj = {};

      //Check if building_obj.produces has good_key, if so append an object with all production methods
      if (building_obj.produces) {
        var all_production_keys = Object.keys(building_obj.produces);
        var base_has_good = false;
        var valid_production_choices = [];

        for (var x = 0; x < all_production_keys.length; x++) {
          var local_subobj = building_obj.produces[all_production_keys[x]];

          if (all_production_keys[x].startsWith("production_choice_")) {
            //Production choice handling
            if (local_subobj[good_key])
              if (local_subobj[good_key] > 0)
                valid_production_choices.push(all_production_keys[x].replace("production_choice_", ""));
          } else {
            if (all_production_keys[x] == good_key)
              if (local_subobj > 0)
                base_has_good = true;
          }
        }

        if (base_has_good || valid_production_choices.length > 0) {
          //Append base if applicable
          if (base_has_good)
            local_production_obj.base = getProductionChoiceOutput({
              province_id: capital_obj.id,
              building_type: all_building_keys[i]
            });

          //Iterate over valid_production_choices and use getProductionChoiceOutput() with capital_obj to get proper produces output
          for (var x = 0; x < valid_production_choices.length; x++) {
            var local_production_choice_obj = getProductionChoiceOutput({
              province_id: capital_obj.id,
              building_type: all_building_keys[i],
              production_choice: valid_production_choices[x]
            });

            local_production_obj[valid_production_choices[x]] = local_production_choice_obj;
          }

          //Add local_production_obj (building production) to production_chain_obj[good_key]
          production_chain_obj[good_key][all_building_keys[i]] = local_production_obj;
        }
      }
    }

    //Fetch dependent_goods
    var good_production = production_chain_obj[good_key];

    var all_production_buildings = Object.keys(good_production);

    //Iterate over all_production_buildings and all_production_choices
    for (var i = 0; i < all_production_buildings.length; i++) {
      var local_building = good_production[all_production_buildings[i]];
      var all_production_choices = Object.keys(local_building);

      for (var x = 0; x < all_production_choices.length; x++) {
        var local_production_choice = local_building[all_production_choices[x]];
        var all_production_keys = Object.keys(local_production_choice);

        for (var y = 0; y < all_production_keys.length; y++) {
          if (lookup.all_goods[all_production_keys[y]] || all_production_keys[y] == "money")
            if (!dependent_goods.includes(all_production_keys[y])) {
              var local_good = lookup.all_goods[all_production_keys[y]];

              dependent_goods.push(all_production_keys[y]);

              //Category handling
              if (local_good)
                if (local_good.type == "category") {
                  var all_subgoods = lookup.all_subgoods[all_production_keys[y]];

                  for (var z = 0; z < all_subgoods.length; z++)
                    if (!dependent_goods.includes(all_subgoods[z]))
                      dependent_goods.push(all_subgoods[z]);
                }
            }
        }
      }
    }

    //Iterate over dependent_goods and recursively merge
    for (var i = 0; i < dependent_goods.length; i++)
      if (
        lookup.all_goods[dependent_goods[i]] &&
        !used_goods.includes(dependent_goods[i])
      ) {
        var new_depth = JSON.parse(JSON.stringify(depth)) + 1;
        var new_used_goods = JSON.parse(JSON.stringify(used_goods));

        //Arbitrary depth braking at 10 recursions
        if (new_depth < 10) {
          //Push current good to new_used_goods
          //new_used_goods.push(good_key);
          new_used_goods = appendArrays(new_used_goods, dependent_goods);

          var local_production_chain = module.exports.getProductionChain(user_id, dependent_goods[i], new_used_goods, new_depth);

          //Merge local_production_chain with production_chain_obj
          production_chain_obj = mergeObjects(production_chain_obj, local_production_chain);
        }
      }

    //Return statement
    return production_chain_obj;
  },

  /*
    getProductionChoiceByKey() - Fetches a production choice object for either the .produces/.maintenance field
    options: {
      include_reserved: true/false, - Whether to include reserved words in the production choice fetched
      return_key: true/false - Whether to return the key instead
    }
  */
  getProductionChoiceByKey: function (arg0_building, arg1_production_choice, arg2_maintenance_production, arg3_options) {
    //Convert from parameters
    var building_name = arg0_building;
    var production_choice = (arg1_production_choice) ? arg1_production_choice.trim().toLowerCase() : "";
    var maintenance_production = (arg2_maintenance_production) ? arg2_maintenance_production : "produces";
    var options = (arg3_options) ? arg3_options : {};

    //Declare local instance variables
    var building_obj = (typeof building_name != "object") ? module.exports.getBuilding(building_name) : building_name;
    var found_production_choice_obj = false;
    var production_choice_obj = {};

    //Find production_choice_<key>
    if (building_obj[maintenance_production]) {
      var all_production_keys = Object.keys(building_obj[maintenance_production]);

      for (var i = 0; i < all_production_keys.length; i++)
        if (all_production_keys[i].startsWith("production_choice_")) {
          var local_subobj = building_obj[maintenance_production][all_production_keys[i]];
          var production_choice_name = all_production_keys[i].replace("production_choice_", "");

          if (production_choice_name == production_choice) {
            found_production_choice_obj = true;
            production_choice_obj = JSON.parse(JSON.stringify(local_subobj));

            //Return statement
            if (options.return_key)
              return all_production_keys[i];
          }
        }

      //If found_production_choice_obj could not be found, reduce to base scope and strip production_choice_ and reserved.production_choice keys
      if (!found_production_choice_obj) {
        production_choice_obj = JSON.parse(JSON.stringify(building_obj[maintenance_production]));

        for (var i = 0; i < all_production_keys.length; i++) {
          if (all_production_keys[i].startsWith("production_choice_"))
            delete production_choice_obj[all_production_keys[i]];

          if (!options.include_reserved)
            if (reserved.production_choice.includes(all_production_keys[i]))
              delete production_choice_obj[all_production_keys[i]];
        }
      } else {
        //Strip .reserved keys from production_choice_obj if .include_reserved is not specified
        var all_production_choice_keys = Object.keys(production_choice_obj);

        if (!options.include_reserved)
          for (var i = 0; i < all_production_choice_keys.length; i++)
            if (reserved.production_choice.includes(all_production_choice_keys[i]))
              delete production_choice_obj[all_production_choice_keys[i]];
      }
    }

    //Return statement
    return production_choice_obj;
  },

  /*
    getProductionChoiceByName() - Fetches a production choice by name alone from a building type
    options: {
      return_key: true/false - Whether to return a key
    }
  */
  getProductionChoiceByName: function (arg0_building, arg1_production_choice_name, arg2_options) {
    //Convert from parameters
    var building_name = arg0_building;
    var production_choice_name = (typeof arg1_production_choice_name != "object") ? arg1_production_choice_name.trim().toLowerCase() : arg1_production_choice_name;
    var options = (arg2_options) ? arg2_options : {};

    //Guard clause if production_choice_name is already object
    if (typeof production_choice_name == "object")
      return production_choice_name;

    //Declare local instance variables
    var building_obj = (typeof building_name != "object") ? module.exports.getBuilding(building_name) : building_name;
    var production_choice_exists = [false, ""]; //[production_choice_exists, production_choice_obj];

    //Name check first
    {
      //Check building_obj.produces first
      if (building_obj.produces) {
        var all_production_keys = Object.keys(building_obj.produces);

        //Soft search first
        for (var i = 0; i < all_production_keys.length; i++)
          if (all_production_keys[i].startsWith("production_choice_")) {
            var local_key = all_production_keys[i].replace("production_choice_", "");
            var local_production_choice = module.exports.getProductionChoiceByKey(building_obj, local_key, "produces", options);
            var local_value = building_obj.produces[all_production_keys[i]];


            if (local_value.name) {
              var local_name = local_value.name.trim().toLowerCase();

              if (local_name.indexOf(production_choice_name) != -1)
                production_choice_exists = [true, (!options.return_key) ? local_production_choice : local_key];
            }
          }

        //Hard search second
        for (var i = 0; i < all_production_keys.length; i++)
          if (all_production_keys[i].startsWith("production_choice_")) {
            var local_key = all_production_keys[i].replace("production_choice_", "");
            var local_production_choice = module.exports.getProductionChoiceByKey(building_obj, local_key, "produces", options);
            var local_value = building_obj.produces[all_production_keys[i]];


            if (local_value.name) {
              var local_name = local_value.name.trim().toLowerCase();

              if (local_name == production_choice_name)
                production_choice_exists = [true, (!options.return_key) ? local_production_choice : local_key];
            }
          }
      }

      //Check building_obj.maintenance next
      if (!production_choice_exists[0]) {
        var all_maintenance_keys = Object.keys(building_obj.maintenance);

        //Soft search first
        for (var i = 0; i < all_maintenance_keys.length; i++)
          if (all_maintenance_keys[i].startsWith("production_choice_")) {
            var local_key = all_production_keys[i].replace("production_choice_", "");

            var local_maintenance_choice = module.exports.getProductionChoiceByKey(building_obj, local_key, "maintenance", options);
            var local_value = building_obj.maintenance[all_maintenance_keys[i]];

            if (local_value.name) {
              var local_name = local_value.name.trim().toLowerCase();

              if (local_name.indexOf(production_choice_name) != -1)
                production_choice_exists = [true, (!options.return_key) ? local_production_choice : local_key];
            }
          }

        //Hard search second
        for (var i = 0; i < all_maintenance_keys.length; i++)
          if (all_maintenance_keys[i].startsWith("production_choice_")) {
            var local_key = all_production_keys[i].replace("production_choice_", "");

            var local_maintenance_choice = module.exports.getProductionChoiceByKey(building_obj, local_key, "maintenance", options);
            var local_value = building_obj.maintenance[all_maintenance_keys[i]];

            if (local_value.name) {
              var local_name = local_value.name.trim().toLowerCase();

              if (local_name == production_choice_name)
                production_choice_exists = [true, (!options.return_key) ? local_production_choice : local_key];
            }
          }
      }
    }

    //Key check next using module.exports.getProductionChoiceByKey();
    if (!production_choice_exists[0]) {
      var production_choice_obj = module.exports.getProductionChoiceByKey(building_obj, production_choice_name, "produces", options);

      //If still not there, check maintenance
      if (!production_choice_obj)
        production_choice_obj = module.exports.getProductionChoiceByKey(building_obj, production_choice_name, "maintenance", options);

      //Now that production_choice_obj is fetched; set production_choice_exists
      if (production_choice_obj)
        production_choice_exists = [true, (!options.return_key) ? production_choice_obj : production_choice_name];
    }

    //Return statement
    return (production_choice_exists[0]) ? production_choice_exists[1] : "";
  },

  /*
    getProductionChoiceOutput() - Returns a flattened good scope of produced goods.
    options: {
      province_id: "4407", - The province ID in which the building is located. Player modifiers are taken from the controller of the province if applicable, all production is negated if province is occupied
      building_object: {}, - Optional. Uses default options.building_type if not defined, and assumes full employment
      no_maintenance: true/false, - Optional. Whether or not to include maintenance in output calculations. False by default
      no_production: true/false, - Optional. Whether or not to include production in output calculations. False by default

      building_type: "lumberjacks", - Optional. Replaces building_object
      production_choice: "one" - Optional. The name of the production choice, excluding "production_choice_" prefix. If not defined, base scope is taken as production choice
    }
  */
  getProductionChoiceOutput: function (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var maintenance_obj = {};
    var produces_obj = {};
    var production_choice = (options.production_choice) ? options.production_choice : "";
    var raw_building_name = (options.building_object) ? options.building_object.building_type : getBuilding(options.building_type, { return_key: true });

    //Initialise local instance variables
    maintenance_obj = multiplyObject(module.exports.getProductionChoiceByKey(raw_building_name, production_choice, "maintenance"), -1);

    if (!options.no_production)
      produces_obj = module.exports.getProductionChoiceByKey(raw_building_name, production_choice);

    //Check if province exists
    if (options.province_id) {
      var province_id = options.province_id;
      var province_obj = main.provinces[province_id];

      //Make sure province isn't currently occupied
      if (province_obj.controller)
        if (province_obj.controller == province_obj.owner) {
          var usr;

          if (main)
            if (main.users)
              usr = main.users[province_obj.controller];

          var building_obj;
          var is_individual = (options.building_object);
          var modifiers = (usr) ? JSON.parse(JSON.stringify(usr.modifiers)) : {};

          //Initialise modifiers
          {
            //Override for local RGO throughput gain
            var province_rgo_throughput = getCityRGOThroughput(province_obj);

            //Remove modifiers
            delete modifiers.rgo_throughput;

            //Add local modifiers
            modifiers[`${province_obj.resource}_gain`] =
              (province_obj.resource && province_rgo_throughput) ? province_rgo_throughput : 1;
          }

          if (is_individual) {
            //This has a verbatim building_object we're talking about
            var local_building = options.building_object;

            building_obj = lookup.all_buildings[local_building.building_type];
            produces_obj = module.exports.applyProduction(produces_obj, {
              config_object: building_obj,
              current_scope: { name: "produces" },
              province_id: province_obj.id,

              modifiers: modifiers
            });

            //Account for maintenance
            if (!options.no_maintenance)
              produces_obj = mergeObjects(produces_obj, maintenance_obj);
          } else {
            //This is a generic building; assume full employment
            building_obj = module.exports.getBuilding(options.building_type);
            produces_obj = module.exports.applyProduction(produces_obj, {
              config_object: building_obj,
              current_scope: { name: "produces" },
              province_id: province_obj.id,

              modifiers: modifiers
            });

            //Account for maintenance
            if (!options.no_maintenance)
              produces_obj = mergeObjects(produces_obj, maintenance_obj);
          }
        }
    } else {
      log.warn(`No options.province_id argument provided for getProductionChoiceOutput()!`);
    }

    //Return statement
    return produces_obj;
  },

  /*
    getProductionObject() - Fetches good production as an object.
    options: {} - Same options as getProduction()
  */
  getProductionObject: function (arg0_user, arg1_options) {
    //Convert from parameters
    var user_id = arg0_user;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var all_produced_goods = [];
    var all_production = module.exports.getProduction(user_id, "all", options);
    var all_unprocessed_goods = Object.keys(all_production);
    var sorted_goods_cache = [];
    var usr = main.users[actual_id];

    //Sort goods first
    for (var i = 0; i < all_unprocessed_goods.length; i++) {
      var local_good = lookup.all_goods[all_unprocessed_goods[i]];

      (local_good) ?
        sorted_goods_cache.push([(local_good.name) ? local_good.name : all_unprocessed_goods[i], all_unprocessed_goods[i]]) :
        sorted_goods_cache.push([all_unprocessed_goods[i], all_unprocessed_goods[i]]);
    }

    sorted_goods_cache.sort(); //Only the first element in a nested array is sorted

    for (var i = 0; i < sorted_goods_cache.length; i++)
      all_produced_goods.push(sorted_goods_cache[i][1]);

    for (var i = 0; i < all_produced_goods.length; i++) {
      var local_good = lookup.all_goods[all_produced_goods[i]];
      var local_value = all_production[all_produced_goods[i]];

      if (local_good) {
        //Deduct upkeep from good production
        if (Array.isArray(local_value)) {
          var upkeep_array = (all_production[`${all_produced_goods[i]}_upkeep`]) ?
            all_production[`${all_produced_goods[i]}_upkeep`] :
            [0, 0];

          upkeep_array.sort(function (a, b) { return a - b; });

          all_production[all_produced_goods[i]] = [
            local_value[0] - upkeep_array[1],
            local_value[1] - upkeep_array[0],
          ].sort(function (a, b) { return a - b; });
        }
      }
    }

    //Make sure _upkeep keys are cloned to regular good if regular good doesn't exist
    var all_production_keys = Object.keys(all_production);

    for (var i = 0; i < all_production_keys.length; i++)
      if (all_production_keys[i].includes("_upkeep"))
        if (!all_production[all_production_keys[i].replace("_upkeep", "")]) {
          var new_value = all_production[all_production_keys[i]];

          //Invert upkeep since it's not production
          for (var x = 0; x < new_value.length; x++) new_value[x] = new_value[x]*-1;

          all_production[all_production_keys[i].replace("_upkeep", "")] = new_value;
        }

    //Return statement
    return all_production;
  },

  /*
    getProvinceBuildingModifier() - Returns the total modifier from buildings in a province. [REVISIT] - Only parses straight up numbers currently
    modifier: <modifier_key> - e.g. "hospital_capacity"
  */
  getProvinceBuildingModifier: function (arg0_province_id, arg1_modifier) {
    //Convert from parameters
    var province_id = arg0_province_id;
    var modifier = arg1_modifier;

    //Declare local instance variables
    var modifier_sum = 0;
    var province_obj = (typeof province_id != "object") ? getProvince(province_id) : province_id;

    //Iterate over all province_obj.buildings
    if (province_obj)
      if (province_obj.buildings)
        for (var i = 0; i < province_obj.buildings.length; i++) {
          var local_building = province_obj.buildings[i];
          var local_config = lookup.all_buildings[local_building.building_type];

          //Add to modifier_sum
          if (local_config.modifiers)
            if (local_config.modifiers[modifier]) {
              if (typeof local_value == "number") {
                //Scale by current production
                var local_employment = module.exports.getBuildingEmploymentLevel(local_employment);
                var local_fulfilment = module.exports.getBuildingInputFulfilment(local_building);
                var local_value = local_config.modifiers[modifier];

                modifier_sum += returnSafeNumber(local_value*local_employment*local_fulfilment);
              } else {
                modifier_sum++;
              }
            }
        }

    //Return statement
    return modifier_sum;
  },

  getProvinceGDP: function (arg0_province_id) {
    //Convert from parameters
    var province_id = arg0_province_id;

    //Declare local instance variables
    var gdp_e = 0;
    var gdp_i = 0;
    var gdp_p = 0;
    var province_obj = main.provinces[province_id];

    if (province_obj.buildings)
      for (var i = 0; i < province_obj.buildings.length; i++) {
        gdp_p += module.exports.getActualBuildingRevenue(province_obj.buildings[i]);
        gdp_i += returnSafeNumber(province_obj.buildings[i].profit);
        gdp_e += module.exports.getActualBuildingExpenditure(province_obj.buildings[i]);
      }
    if (province_obj.pops) {
      var all_pop_keys = Object.keys(province_obj.pops);

      for (var i = 0; i < all_pop_keys.length; i++)
        if (all_pop_keys[i].startsWith("wealth-")) {
          var local_wealth_pool = province_obj.pops[all_pop_keys[i]];

          gdp_e += Math.abs(returnSafeNumber(local_wealth_pool.spending));
          gdp_i += returnSafeNumber(local_wealth_pool.income);
        }
    }

    //Return statement - GDP(A)
    return (gdp_e + gdp_i + gdp_p)/3;
  },

  getReopenCost: function (arg0_building) {
    //Convert from parameters
    var building_obj = arg0_building;

    //Declare local instance variables
    var reopen_cost = building_obj.stockpile.money*-1 + config.defines.economy.subsidy_infusion;

    //Return statement
    (building_obj.insolvent) ? reopen_cost : 0;
  },

  getStartingStockpile: function (arg0_building) {
    //Convert from parameters
    var building_name = arg0_building;

    //Declare local instance variables
    var building_obj = (typeof building_name != "object") ? lookup.all_buildings[building_name.trim().toLowerCase()] : building_name;
    var starting_money_stockpile = config.defines.economy.starting_money_stockpile;

    //Check money cost
    if (building_obj.cost)
      if (building_obj.cost.money)
        if (config.defines.economy.starting_money_multiplier != 0)
          starting_money_stockpile = building_obj.cost.money*config.defines.economy.starting_money_multiplier;

    //Return statement
    return starting_money_stockpile;
  },

  //getSubsistenceBuilding() - Returns subsistence building key for a given province
  getSubsistenceBuilding: function (arg0_province) {
    //Convert from parameters
    var province_id = arg0_province;

    //Declare local instance variables
    var all_buildings = Object.keys(lookup.all_buildings);
    var province_obj = (typeof province_id != "object") ? main.provinces[province_id] : province_obj;
    var subsistence_building_key;

    //Iterate over all_building_categories to fetch subsistence_building_key
    for (var i = 0; i < all_buildings.length; i++) {
      var local_building = lookup.all_buildings[all_buildings[i]];

      if (local_building.subsistence_building) {
        //Check if limit is fulfilled
        var limit_fulfilled = true;

        if (local_building.limit) {
          var all_limit_keys = Object.keys(local_building.limit);

          for (var x = 0; x < all_limit_keys.length; x++) {
            var local_obj = local_building.limit[all_limit_keys[x]];

            //Terrain handler
            if (all_limit_keys[x] == "terrain_category" || all_limit_keys[x].startsWith("terrain_category_")) {
              var value_list = getList(local_obj);

              if (!value_list.includes(province_obj.type))
                limit_fulfilled = false;
            }
          }

          if (limit_fulfilled)
            subsistence_building_key = all_buildings[i];
        }
      }
    }

    //Return statement
    return subsistence_building_key;
  },

  getSubsistencePops: function (arg0_province, arg1_building_type) {
    //Convert from parameters
    var province_id = arg0_province;
    var subsistence_building_key = (arg1_building_type) ? arg1_building_type : module.exports.getSubsistenceBuilding(province_id);

    //Declare local instance variables
    var qualified_pops = [];
    var subsistence_building_obj = (typeof subsistence_building_key != "object") ? lookup.all_buildings[subsistence_building_key] : subsistence_building_key;

    if (subsistence_building_obj) {
      //Check for .allowed_pops
      if (subsistence_building_obj.allowed_pops) {
        var allowed_pops = getList(subsistence_building_obj.allowed_pops);

        for (var i = 0; i < allowed_pops.length; i++)
          if (!qualified_pops.includes(allowed_pops[i]))
            qualified_pops.push(allowed_pops[i]);
      }

      //Check for .allowed_classes
      if (subsistence_building_obj.allowed_classes) {
        var allowed_classes = getList(subsistence_building_obj.allowed_classes);

        for (var i = 0; i < allowed_classes.length; i++) {
          var pop_class_array = lookup.all_pop_classes[allowed_classes[i]];

          if (pop_class_array)
            for (var x = 0; x < pop_class_array.length; x++)
              if (!qualified_pops.includes(pop_class_array[x]))
                qualified_pops.push(pop_class_array[x]);
        }
      }
    }

    //Return statement
    return qualified_pops;
  },

  /*
    getSubsistenceProduction() - Fetches total subsistence production
    options: {
      exclude_artisan_production: true/false, - Optional. Whether to exclude artisan production. False by default
      exclude_rgo_production: true/false - Optional. Whether to exclude RGO production. False by default
    }
  */
  getSubsistenceProduction: function (arg0_province_id, arg1_subsistence_obj, arg2_options) {
    //Convert from parameters
    var province_id = arg0_province_id;
    var subsistence_obj = arg1_subsistence_obj;
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var employed_pops = getObjectSum(subsistence_obj.employment);
    var province_obj = (typeof province_id != "object") ? main.provinces[province_id] : province_id;
    var subsistence_production_obj = {};

    //Fetch artisan production for province
    if (!options.exclude_artisan_production) {
      var artisan_amount = 0;

      //Iterate over all artisan_pops
      for (var i = 0; i < lookup.artisan_pops.length; i++) {
        subsistence_production_obj = mergeObjects(subsistence_production_obj,
          getArtisanProduction(province_obj.id, lookup.artisan_pops[i]));
        artisan_amount += returnSafeNumber(subsistence_obj.employment[lookup.artisan_pops[i]]);
      }
    }

    //+RGO Production
    if (!options.exclude_rgo_production)
      subsistence_production_obj = mergeObjects(subsistence_production_obj, getProvinceRGOThroughput(province_obj.id));

    //Return statement
    return subsistence_production_obj;
  },

  getTotalBuildings: function (arg0_city_name, arg1_building_name) {
    //Convert from parameters
    var city_name = (typeof arg0_city_name != "object") ? arg0_city_name.toLowerCase().trim() : arg0_city_name;
    var building_name = arg1_building_name.toLowerCase().trim();

    //Declare local instance variables
    var city_obj = (typeof city_name != "object") ? getCity(city_name) : city_name;
    var raw_building_name = module.exports.getBuilding(building_name, { return_key: true });
    var total = 0;

    //Iterate over all buildings in province
    if (city_obj)
      for (var i = 0; i < city_obj.buildings.length; i++)
        if (city_obj.buildings[i].building_type == raw_building_name)
          total++;

    //Return statement
    return total;
  },

  getTotalMedianWage: function (arg0_province_id, arg1_pop_types) {
    //Convert from parameters
    var province_id = arg0_province_id;
    var all_pops = (arg1_pop_types) ? getList(arg1_pop_types) : Object.keys(config.pops);

    //Declare local instance variables
    var total_median_wage = 0;

    //Iterate over all_pops
    for (var i = 0; i < all_pops.length; i++)
      total_median_wage += returnSafeNumber(module.exports.getMedianWage(province_id, {
        pop_type: all_pops[i]
      }));

    //Return statement
    return total_median_wage/all_pops.length;
  },

  getTotalPositions: function (arg0_province_id, arg1_pop_type) {
    //Convert from parameters
    var province_id = arg0_province_id;
    var pop_type = getList(arg1_pop_type);

    //Declare local instance variables
    var open_positions = 0;
    var province_obj = main.provinces[province_id];

    //Iterate over province_obj.buildings
    for (var i = 0; i < province_obj.buildings.length; i++)
      for (var x = 0; x < pop_type.length; x++)
        open_positions += returnSafeNumber(province_obj.buildings[i][`${pop_type[x]}_positions`]);

    //Return statement
    return open_positions;
  },

  getTotalSubsidies: function (arg0_user) {
    //Convert from parameters
    var user_id = arg0_user;

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var total_subsidies = 0;
    var usr = main.users[actual_id];

    var user_provinces = getProvinces(user_id, { include_occupations: true });

    //Iterate over user_provinces
    for (var i = 0; i < user_provinces.length; i++) {
      var local_province = user_provinces[i];

      if (local_province.buildings)
        for (var x = 0; x < local_province.buildings.length; x++) {
          var local_building = local_province.buildings[x];

          total_subsidies += returnSafeNumber(local_building.subsidies);
        }
    }

    //Return statement
    return total_subsidies;
  },

  hasBaseProductionChoice: function (arg0_building) {
    //Convert from parameters
    var building_name = arg0_building;

    //Declare local instance variables
    var building_obj = lookup.all_buildings[building_name];

    //Check both produces and maintenance fields
    if (building_obj) {
      if (building_obj.produces) {
        var all_production_keys = Object.keys(building_obj.produces);

        for (var i = 0; i < all_production_keys.length; i++)
          if (!all_production_keys[i].startsWith("production_choice_")) return true;
      }
      if (building_obj.maintenance) {
        var all_maintenance_costs = Object.keys(building_obj.maintenance);

        for (var i = 0; i < all_maintenance_costs.length; i++)
          if (!all_maintenance_costs[i].startsWith("production_choice_")) return true;
      }
    }
  },

  hasNonSubsistenceBuildings: function (arg0_province_id) {
    //Convert from parameters
    var province_id = arg0_province_id;

    //Declare local instance variables
    var province_obj = main.provinces[province_id];

    //Iterate over province_obj.buildings
    if (province_obj)
      if (province_obj.buildings)
        for (var i = 0; i < province_obj.buildings.length; i++) {
          var local_config = lookup.all_buildings[province_obj.buildings[i].building_type];

          if (local_config.manpower_cost)
            //Return statement
            return true;
        }
  },

  hasProductionChoice: function (arg0_building_obj) {
    //Convert from parameters
    var building_obj = arg0_building_obj;

    //Declare local instance variables
    var config_obj = lookup.all_buildings[building_obj.building_type];

    if (config_obj.produces) {
      var all_production_keys = Object.keys(config_obj.produces);

      for (var i = 0; i < all_production_keys.length; i++)
        if (all_production_keys[i].startsWith("production_choice_"))
          return true;
    }
  },

  isBuildingHiring: function (arg0_building_obj) {
    //Convert from parameters
    var building_obj = arg0_building_obj;

    //Declare local instance variables
    var all_building_keys = Object.keys(building_obj);
    var all_pops = Object.keys(config.pops);
    var building_employment_level = getBuildingEmploymentLevel(building_obj);
    var is_hiring = false;
    var split_building_key = building_obj.id.split("-");

    var province_obj = main.provinces[split_building_key[0]];

    //Iterate over all_building_keys
    for (var i = 0; i < all_building_keys.length; i++)
      if (
        all_building_keys[i].endsWith("_positions") &&
        building_employment_level < 1
      ) {
        var local_pop_type = all_building_keys[i].replace("_positions", "");
        var local_value = building_obj[all_building_keys[i]];

        if (returnSafeNumber(province_obj.pops[local_pop_type]) > 0)
          if (local_value > 0)
            is_hiring = true;
      }

    //Return statement
    return is_hiring;
  },

  layoffWorkers: function (arg0_building, arg1_pop_type, arg2_amount) {
    //Convert from parameters
    var building_obj = arg0_building;
    var pop_type = arg1_pop_type;
    var amount = parseInt(arg2_amount);

    //Declare local instance variables
    var key = `wealth-${building_obj.id}-${pop_type}`;
    var layoffs = 0;
    var province_id = building_obj.id.split("-")[0];
    var province_obj = main.provinces[province_id];

    var local_wealth_pool = province_obj.pops[key];

    if (local_wealth_pool) {
      var local_percentage = amount/local_wealth_pool.size;
      var employed_workers = returnSafeNumber(building_obj.employment[pop_type]);

      //Subtract wealth; income proportionally from the pool
      local_wealth_pool.income -= local_wealth_pool.income*local_percentage;
      local_wealth_pool.wealth -= local_wealth_pool.wealth*local_percentage;

      //Set layoffs and reduce size
      layoffs = (employed_workers >= amount) ? amount : employed_workers;

      //Remove from wealth pool size
      local_wealth_pool.size -= layoffs;

      //Remove from building employment
      if (building_obj.employment[pop_type]) {
        building_obj.employment[pop_type] -= layoffs;

        if (building_obj.employment[pop_type] <= 0) {
          delete building_obj.employment[pop_type]; //Delete employment of this pop
          delete province_obj.pops[key]; //Delete wealth pool
        }
      }
    }

    //Return statement
    return layoffs;
  },

  parseProduction: function (arg0_user) {
    //Convert from parameters
    var user_id = arg0_user;

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var production_obj = module.exports.getProduction(user_id);
    var usr = main.users[actual_id];
    var virtual_inventory = {};
    var virtual_user = JSON.parse(JSON.stringify(usr));

    var all_produced_goods = Object.keys(production_obj);

    //Iterate over all goods; transform into min, max arrays
    for (var i = 0; i < lookup.all_good_names.length; i++)
      virtual_inventory[lookup.all_good_names[i]] = [0, 0];
    virtual_inventory.money = [0, 0];

    //Iterate over all_produced_goods
    for (var i = 0; i < all_produced_goods.length; i++) {
      var local_value = production_obj[all_produced_goods[i]];

      //Process upkeep
      if (all_produced_goods[i].includes("_upkeep")) {
        var upkeep_to_process = all_produced_goods[i].replace("_upkeep", "");

        virtual_inventory[upkeep_to_process] = (virtual_inventory[upkeep_to_process]) ?
          [
            virtual_inventory[upkeep_to_process][0] - local_value[1],
            virtual_inventory[upkeep_to_process][1] - local_value[0]
          ] :
          [
            local_value[1]*-1,
            local_value[0]*-1
          ];
      } else if (all_produced_goods[i].includes("_special_effect")) {
        //Process special effects
        var special_effect_to_process = all_produced_goods[i].replace("_special_effect", "");

        var building_obj = getBuilding(special_effect_to_process);

        if (building_obj.special_effect)
          building_obj.special_effect(virtual_user);
      } else {
        if (virtual_inventory[all_produced_goods[i]])
          virtual_inventory[all_produced_goods[i]] = (virtual_inventory[all_produced_goods[i]]) ?
            [
              virtual_inventory[all_produced_goods[i]][0] + local_value[0],
              virtual_inventory[all_produced_goods[i]][1] + local_value[1]
            ] :
            [
              local_value[0],
              local_value[1]
            ];
      }
    }

    //Check for any inventory changes
    var all_inventory_goods = Object.keys(virtual_user.inventory);

    for (var i = 0; i < all_inventory_goods.length; i++) {
      var local_simulation_value = returnSafeNumber(virtual_user.inventory[all_inventory_goods[i]]);
      var local_true_value = getGoodAmount(user_id, all_inventory_goods[i]);

      if (local_simulation_value != local_true_value) {
        var local_change = local_simulation_value - local_true_value;

        //Add to virtual_inventory
        virtual_inventory[all_inventory_goods[i]] = (virtual_inventory[all_inventory_goods[i]]) ?
          [
            virtual_inventory[all_inventory_goods[i]][0] + local_change,
            virtual_inventory[all_inventory_goods[i]][1] + local_change
          ] :
          [
            local_change,
            local_change
          ];
      }
    }

    //Add income
    var user_income = getIncome(virtual_user, production_obj);

    virtual_inventory.money[0] += user_income[0];
    virtual_inventory.money[1] += user_income[1];

    //Return statement
    return virtual_inventory;
  },

  processBuilding: function (arg0_building_obj, arg1_goods) {
    //Convert from parameters
    var building_obj = arg0_building_obj;
    var goods_obj = (arg1_goods) ? arg1_goods : {}; //The goods produced from this building

    //Make sure .stockpile exists; reset trackers
    if (!building_obj.stockpile)
      building_obj.stockpile = {};
    delete building_obj.subsidies;

    //Declare local instance variables
    var all_good_keys = Object.keys(goods_obj);
    var building_id = building_obj.id;
    var cache = {};
    var category_id = lookup.all_buildings_categories[building_obj.building_type];
    var category_obj = config.buildings[category_id];
    var config_obj = lookup.all_buildings[building_obj.building_type];
    var original_stockpile = JSON.parse(JSON.stringify(building_obj.stockpile));
    var pop_types;
    var province_id = building_obj.id.split("-")[0];
    var province_obj = main.provinces[province_id];

    //Initialise local instance variables
    {
      if (config_obj.flattened_manpower_cost)
        pop_types = Object.keys(config_obj.flattened_manpower_cost);
    }

    if (province_obj) {
      var building_employment_level = module.exports.getBuildingEmploymentLevel(building_obj);
      var building_money = 0;
      var profit_obj = module.exports.getBuildingProfit(building_obj, { return_object: true });
      var user_id = province_obj.controller;
      var usr = main.users[user_id];

      //Initialise local instance variables
      if (building_obj.stockpile)
        building_money = JSON.parse(JSON.stringify(returnSafeNumber(building_obj.stockpile.money)));

      //Iterate over pop_types and set wages for each pop type as well as offer sizes
      if (!building_obj.insolvent)
        if (pop_types)
          for (var i = 0; i < pop_types.length; i++) {
          var config_obj = config.pops[pop_types[i]];
          var local_employment_stats = module.exports.getBuildingHiringPositions(building_obj, {
            pop_type: pop_types[i],

            employment_level: building_employment_level,
            profit_obj: profit_obj,

            return_object: true
          });

          //Set wage and offer size
          building_obj[`${pop_types[i]}_positions`] = parseInt((local_employment_stats.hiring_positions)/pop_types.length);
          building_obj[`${pop_types[i]}_wage`] = (local_employment_stats.wage)*pop_types.length;

          //Initialise/update pop wealth pool
          var local_employees = returnSafeNumber(building_obj.employment[pop_types[i]]);
          var key_name = `wealth-${building_obj.id}-${pop_types[i]}`;

          if (local_employees > 0) {
            if (!province_obj.pops[key_name])
              province_obj.pops[key_name] = {};
            var local_building_pop = province_obj.pops[key_name];

            //Set .size, .income, .wealth
            local_building_pop.size = local_employees;
            local_building_pop.income = local_employment_stats.wage*local_employees;

            //Process income taxes
            var income_tax_amount = returnSafeNumber(usr[`${config_obj.class}_income_tax`])*local_building_pop.income;
            modifyValue(usr.trackers.tax, `${config_obj.class}_income_tax`, income_tax_amount);

            //Add wealth after taxes
            local_building_pop.income -= income_tax_amount;
            modifyValue(local_building_pop, "wealth", local_building_pop.income - income_tax_amount);

            //Set cache
            cache[`wages_${pop_types[i]}`] = local_building_pop.income;
          }
        }

      //Building expenditures
      if (!building_obj.insolvent) {
        var all_cache_keys = Object.keys(cache);
        var wage_cost = 0;

        //Wages
        for (var i = 0; i < all_cache_keys.length; i++) {
          var local_subobj = cache[all_cache_keys[i]];

          if (all_cache_keys[i].startsWith("wages_")) {
            wage_cost += returnSafeNumber(local_subobj);
            modifyValue(building_obj.stockpile, "money", wage_cost*-1);
          }
        }

        //Set building statistics to building_obj
        building_obj.wage_cost = wage_cost;
      }

      //Building insolvency
      {
        if (config.defines.economy.insolvency_turns != 0) {
          if (building_obj.stockpile.money <= config.defines.economy.insolvency_amount) {
            modifyValue(building_obj, "insolvency_turns", 1);
          } else {
            delete building_obj.insolvency_turns;
          }

          if (returnSafeNumber(building_obj.insolvency_turns) > config.defines.economy.insolvency_turns)
            module.exports.declareBuildingInsolvency(building_obj);
        }
      }

      //Building modifiers (only kicks in if building is not insolvent) [REVISIT] - Add .efficiency modifier to building based on input goods
      if (!building_obj.insolvent)
        if (config_obj.modifiers) {
          var all_modifier_keys = Object.keys(config_obj.modifiers);

          for (var i = 0; i < all_modifier_keys.length; i++) {
            var local_value = config_obj.modifiers[all_modifier_keys[i]];

            if (all_modifier_keys[i].startsWith("education_level_") || all_modifier_keys[i] == "education_level")
              applyModifiers(user_id, local_value, {
                province_id: province_id
              });
          }
        }

      //Building revenues
      if (!building_obj.insolvent) {
        var goods_revenue = 0;

        //Iterate over all_good_keys and sell to the government for World Market prices
        for (var i = 0; i < all_good_keys.length; i++) {
          var local_value = returnSafeNumber(goods_obj[all_good_keys[i]]);
          var market_good = main.market[all_good_keys[i]];

          if (market_good) {
            goods_revenue += local_value*market_good.sell_price;
            market_good.stock += Math.ceil(local_value*config.defines.economy.resource_production_scalar);
          }
        }

        //Add revenue to building stockpile; set building statistics to building_obj
        modifyValue(building_obj.stockpile, "money", goods_revenue);

        building_obj.goods_revenue = goods_revenue;
      }

      //Set profit
      building_obj.profit = building_obj.stockpile.money - returnSafeNumber(original_stockpile.money);

      //Building taxation
      if (building_obj.profit > 0) {
        var building_tax_amount = 0;
        var category_tax_amount = 0;
        var corporate_tax_amount = returnSafeNumber(building_obj.profit*usr.corporate_tax);

        //Initialise building_tax_amount; category_tax_amount
        if (usr.custom_taxes[`${category_id}-category_tax`])
          category_tax_amount = Math.ceil(building_obj.profit*usr.custom_taxes[`${category_id}-category_tax`]);
        if (usr.custom_taxes[`${building_id}-tax`])
          building_tax_amount = Math.ceil(building_obj.profit*usr.custom_taxes[`${building_id}-tax`]);

        //Set taxes
        building_obj.taxes = building_tax_amount + category_tax_amount + corporate_tax_amount;
        building_obj.taxes = building_obj.taxes*Math.min(usr.modifiers.tax_efficiency, 1); //Can only tax up to 100% of profit; PC cost is reduced with further tax efficiency

        //Set building_obj.profit after taxes
        building_obj.profit = building_obj.profit - building_obj.taxes;

        //Add to usr.money
        usr.money += building_obj.taxes;
        if (category_tax_amount > 0)
          modifyValue(usr.trackers.tax, `${category_id}-category_tax`, category_tax_amount);
        if (corporate_tax_amount > 0)
          modifyValue(usr.trackers.tax, "corporate_tax", corporate_tax_amount);
        if (building_tax_amount > 0)
          modifyValue(usr.trackers.tax, `${building_id}-tax`, building_tax_amount);
      }

      //Subsidies handler - covers all building losses
      {
        if (building_obj.subsidised)
          if (building_obj.stockpile) {
            var current_loss = building_money - building_obj.stockpile.money;

            if (current_loss > 0) {
              usr.money -= returnSafeNumber(current_loss);
              building_obj.stockpile.money += current_loss;
              modifyValue(building_obj, "subsidies", current_loss);
            } else {
              delete building_obj.subsidies;
            }
          }
      }

      //Return statement
      return building_obj;
    } else {
      log.warn(`processBuilding() - Could not find building in Province ${province_id}!`);
    }
  },

  refreshBuildingNames: function (arg0_province_id) {
    //Convert from parameters
    var province_id = arg0_province_id;

    //Declare local instance variables
    var building_count = {};
    var province_obj = main.provinces[province_id];

    if (province_obj.buildings)
      for (var i = 0; i < province_obj.buildings.length; i++) {
        var local_building = province_obj.buildings[i];

        var building_obj = getBuilding(local_building.building_type);

        modifyValue(building_count, local_building.building_type, 1);
        local_building.name = `${(province_obj.name) ? province_obj.name : `Province ${province_obj.id}`} ${(building_obj.name) ? building_obj.name : local_building.building_type} #${building_count[local_building.building_type]}`;
      }
  },

  /*
    sortBuildings() - Sorts a province array of buildings by mode: "alphabetical", "numeric", "cash_reserves", "category", "employment"
  */
  sortBuildings: function (arg0_building_array, arg1_mode) { //[WIP] - Finish function body
    //Convert from parameters
    var building_array = arg0_building_array;
    var mode = (arg1_mode) ? arg1_mode.trim().toLowerCase() : "category";

    //Declare local instance variables=
    var building_count = {};

    if (building_array) {
      //Initialise building_count
      for (var i = 0; i < building_array.length; i++)
        modifyValue(building_count, building_array[i].building_type, 1);

      for (var i = 0; i < building_array.length; i++) {
        var total_employees = 0;

        if (building_array[i].employment) {
          var all_employment_keys = Object.keys(building_array[i].employment);

          //Cash reserves
          if (building_array[i].stockpile)
            building_array[i].cash_reserves = returnSafeNumber(building_array[i].cash_reserves);
          if (!building_array[i].cash_reserves) building_array[i].cash_reserves = 0;

          //Category
          building_array[i].category = lookup.all_buildings_categories[building_array[i].building_type];

          //Employment
          for (var x = 0; x < all_employment_keys.length; x++)
            total_employees += returnSafeNumber(building_array[i].employment[all_employment_keys[x]]);
          building_array[i].total_employees = total_employees;

          //Number
          building_array[i].building_count = building_count[building_array[i].building_type];
        }
      }

      //Sort object
      if (mode == "alphabetical") {
        building_array.sort((a, b) => {
          var building_name_a = (a.name) ? a.name.toLowerCase() : a.id;
          var building_name_b = (b.name) ? b.name.toLowerCase() : b.id;

          if (building_name_a < building_name_b) return -1;
          if (building_name_a > building_name_b) return 1;
          return 0;
        });
      } else if (mode == "numeric") {
        building_array.sort((a, b) => {
          return b.building_count - a.building_count;
        });
      } else if (mode == "cash_reserves") {
        building_array.sort((a, b) => {
          return b.cash_reserves - a.cash_reserves;
        });
      } else if (mode == "category") {
        building_array.sort((a, b) => {
          var building_category_a = a.category;
          var building_category_b = b.category;

          if (building_category_a < building_category_b) return -1;
          if (building_category_a > building_category_b) return 1;
          return 0;
        });
      } else if (mode == "chronological") {
        building_array.sort((a, b) => {
          return a.order - b.order;
        });
      } else if (mode == "employment") {
        building_array.sort((a, b) => {
          return b.total_employees - a.total_employees;
        });
      }

      //Remove attributes you just sorted by
      for (var i = 0; i < building_array.length; i++) {
        delete building_array[i].building_count;
        delete building_array[i].cash_reserves;
        delete building_array[i].category;
        delete building_array[i].total_employees;
      }
    }

    //Return statement
    return building_array;
  }
};
