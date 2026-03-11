module.exports = {
  getAllPopCategoriesNeeds: function () {
    //Declare local instance variables
    var all_pops = Object.keys(config.pops);
    var pop_needs_goods = {};

    //Iterate over all_pops
    for (var i = 0; i < all_pops.length; i++) {
      var local_pop = config.pops[all_pops[i]];

      if (local_pop.per_100k)
        if (local_pop.per_100k.needs) {
          var all_local_needs_categories = Object.keys(local_pop.per_100k.needs);

          for (var x = 0; x < all_local_needs_categories.length; x++) {
            var local_needs_category = local_pop.per_100k.needs[all_local_needs_categories[x]];

            if (!pop_needs_goods[all_local_needs_categories[x]])
              pop_needs_goods[all_local_needs_categories[x]] = [];

            //Flatten local object
            var local_array = pop_needs_goods[all_local_needs_categories[x]];
            var local_needs = flattenObject(local_needs_category);

            var all_local_needs = Object.keys(local_needs);

            //Iterate over all_local_needs
            for (var y = 0; y < all_local_needs.length; y++)
              if (!local_array.includes(all_local_needs[y]))
                local_array.push(all_local_needs[y]);
          }
        }
    }

    //Return statement
    return pop_needs_goods;
  },

  //getAllPopGoods() - Returns an array of all good keys demanded or produced by pop types w/ more than 0 people
  getAllPopGoods: function (arg0_user) {
    //Convert from parameters
    var user_id = arg0_user;

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var all_pop_goods = [];
    var relevant_pops = getRelevantPops(user_id);
    var usr = main.users[actual_id];

    //Iterate over relevant_pops and recursively parse objects and subobjects for goods
    for (var i = 0; i < relevant_pops.length; i++) {
      var local_pop = config.pops[relevant_pops[i]];

      //max_modifier_limit
      if (local_pop.max_modifier_limit) {
        var max_modifier_limit_keys = Object.keys(local_pop.max_modifier_limit);

        for (var x = 0; x < max_modifier_limit_keys.length; x++)
          if (!all_pop_goods.includes(max_modifier_limit_keys[x]))
            if (lookup.all_goods[max_modifier_limit_keys[x]])
              all_pop_goods.push(max_modifier_limit_keys[x]);
      }

      //per_100k handler
      if (local_pop.per_100k) {
        var all_relevant_subgoods = getAllSubgoods(local_pop.per_100k);

        for (var x = 0; x < all_relevant_subgoods.length; x++)
          if (!all_pop_goods.includes(all_relevant_subgoods[x]))
            all_pop_goods.push(all_relevant_subgoods[x]);
      }
    }

    //Return statement
    return all_pop_goods;
  },

  //getAllPopNeedCategories() - Returns a list of pop need categories such as luxury_goods, staple_goods, etc.
  getAllPopNeedCategories: function () {
    //Declare local instance variables
    var all_pops = Object.keys(config.pops);
    var pop_categories = [];

    //Iterate over all_pops
    for (var i = 0; i < all_pops.length; i++) {
      var local_pop = config.pops[all_pops[i]];

      if (local_pop.per_100k)
        if (local_pop.per_100k.needs) {
          var all_local_needs_categories = Object.keys(local_pop.per_100k.needs);

          for (var x = 0; x < all_local_needs_categories.length; x++)
            if (!pop_categories.includes(all_local_needs_categories[x]))
              pop_categories.push(all_local_needs_categories[x]);
        }
    }

    //Return statement
    return pop_categories;
  },

  //getAllPopNeeds() - Returns an object of all flattened pop needs
  getAllPopNeeds: function () {
    //Declare local instance variables
    var all_pops = Object.keys(config.pops);
    var all_pop_needs_obj = {};

    for (var i = 0; i < all_pops.length; i++) {
      var local_pop = config.pops[all_pops[i]];

      if (local_pop.per_100k)
        if (local_pop.per_100k.needs)
          all_pop_needs_obj[all_pops[i]] = flattenObject(local_pop.per_100k.needs);
    }

    return all_pop_needs_obj;
  },

  /*
    getArtisanProduction() - Fetches artisan production for a given province and pop type.
    options: {
      return_float: true/false - Optional. Whether to disable rounding. False by default.
    }
  */
  getArtisanProduction: function (arg0_province, arg1_pop_type, arg2_options) {
    //Convert from parameters
    var province_id = arg0_province;
    var pop_type = arg1_pop_type;
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var province_obj = (typeof province_id != "object") ? main.provinces[province_id] : province_id;
    var return_object = {};

    //Check if province_obj has pops
    if (province_obj)
      if (province_obj.pops) {
        var user_id = province_obj.owner;
        var usr = main.users[province_obj.owner];

        //Check artisan employment
        var artisan_amount = returnSafeNumber(province_obj.pops[pop_type]);
        var artisan_production_obj = (usr.artisan_production) ? usr.artisan_production : getUserArtisanProduction(user_id);
        var artisan_per_production = returnSafeNumber(config.defines.economy.artisan_per_production, 10000);
        var artisan_per_production_scale = returnSafeNumber(config.defines.economy.artisan_per_production_scale, 750);
        var used_artisans = returnSafeNumber(province_obj.pops[`used_${pop_type}`]);

        var all_artisan_goods = Object.keys(artisan_production_obj);
        var unemployed_artisans = artisan_amount - used_artisans;

        if (unemployed_artisans > 0) {
          //Linear scaling inefficiency for artisans
          if (unemployed_artisans >= 1000)
            artisan_per_production = artisan_per_production + Math.ceil((unemployed_artisans/1000)*artisan_per_production_scale);

          var artisan_production_capacity = unemployed_artisans/artisan_per_production;

          //Iterate over all_artisan_goods
          for (var i = 0; i < all_artisan_goods.length; i++) {
            var local_value = artisan_production_obj[all_artisan_goods[i]];

            var local_production_amount = local_value*artisan_production_capacity;

            //Urban/rural rounding handler
            var local_rounded_amount = (province_obj.type == "urban") ? Math.ceil(local_production_amount) : Math.floor(local_production_amount);

            return_object[all_artisan_goods[i]] = (!options.return_float) ?
              local_rounded_amount : local_production_amount;
          }
        }
      }

    //Return statement
    return return_object;
  },

  getArtisanProductionPercentage: function () {
    //Declare local instance variables
    var all_pop_needs_categories = (lookup.all_pop_needs_categories) ? lookup.all_pop_needs_categories : getAllPopNeedCategories();
    var production_complexity = lookup.all_production_complexity;
    var production_complexity_obj = {};

    if (production_complexity) {
      //Iterate over all_pop_needs_categories
      for (var i = 0; i < all_pop_needs_categories.length; i++) {
        var local_needs_category = lookup.all_pop_needs_goods[all_pop_needs_categories[i]];

        //Iterate over local_needs_category and add to production_complexity_obj
        if (local_needs_category)
          for (var x = 0; x < local_needs_category.length; x++) {
            var local_production_complexity = production_complexity[local_needs_category[x]];

            production_complexity_obj[local_needs_category[x]] = local_production_complexity;
          }
      }

      //Standardise to fraction and invert
      production_complexity_obj = standardisePercentage(standardiseFraction(production_complexity_obj));

      //Return statement
      return production_complexity_obj;
    } else {
      log.warn(`getArtisanProductionPercentage() - lookup.all_production_complexity is not defined!`);
    }
  },

  getProvinceRGOThroughput: function (arg0_province_id) {
    //Convert from parameters
    var province_id = arg0_province_id;

    //Declare local instance variables
    var artisan_amount = 0;
    var province_obj = (typeof province_id != "object") ? main.provinces[province_id] : province_id;
    var rgo_production = {};

    //Iterate over lookup.artisan_pops to determine artisan_amount
    if (province_obj.subsistence) {
      var subsistence_obj = province_obj.subsistence;

      var employed_pops = getObjectSum(subsistence_obj.employment);

      for (var i = 0; i < lookup.artisan_pops.length; i++)
        artisan_amount += returnSafeNumber(subsistence_obj.employment[lookup.artisan_pops[i]]);

      //Fetch RGO Production
      if (province_obj.resource) {
        var good_obj = lookup.all_goods[province_obj.resource];
        var non_artisan_amount = employed_pops - artisan_amount;
        var usr = main.users[province_obj.owner];

        //It takes good_obj.buy_price*config.defines.economy.rgo_per_production people to produce 1 good. (This is not the market price, but the base buy_price)
        var rgo_per_production = returnSafeNumber(good_obj.buy_price, 1)*config.defines.economy.rgo_per_production;

        var rgo_amount = (non_artisan_amount/rgo_per_production)*returnSafeNumber(usr.modifiers.rgo_throughput, 1);

        modifyValue(rgo_production, province_obj.resource, Math.ceil(rgo_amount));
      }
    }

    //Return statement
    return rgo_production;
  },

  /*
    processDemotion() - Processes demotion for a certain pop type.
    options: {
      building_map: {} - Optional. Optimisation parameter.
    }
  */
  processDemotion: function (arg0_province_id, arg1_pop_type, arg2_pop_scope, arg3_options) {
    //Convert from parameters
    var province_id = arg0_province_id;
    var pop_type = arg1_pop_type;
    var pop_scope = arg2_pop_scope;
    var options = (arg3_options) ? arg3_options : {};

    //Declare local instance variables
    var building_map = (options.building_map) ? options.building_map : getBuildingMap(province_id);
    var config_obj = config.pops[pop_type];
    var has_demotes = false;
    var province_obj = (typeof province_id != "object") ? main.provinces[province_id] : province_id;

    var pop_demotion_selectors = parsePopLimit(config.pop_mobility.demotion, {
      province_id: province_obj.id,
      pop_type: pop_type,
      pop_scope: pop_scope
    });

    //Initialise variables
    if (config_obj.demotes_to) has_demotes = true;

    if (pop_demotion_selectors.boolean) {
      //pop_demotion_selectors.selectors - [pop_value, value];
      for (var i = 0; i < pop_demotion_selectors.selectors.length; i++) {
        var local_pop_scope = pop_demotion_selectors.selectors[i][0];
        var local_value = pop_demotion_selectors.selectors[i][1];

        var all_local_tags = Object.keys(local_pop_scope.tags);

        if (has_demotes) {
          var all_demotes = Object.keys(config_obj.demotes_to);
          var demote_chances = {};

          for (var x = 0; x < all_demotes.length; x++)
            if (config.pops[all_demotes[x]]) {
              var local_pop_demote_chance = parsePopLimit(config_obj.demotes_to[all_demotes[x]], {
                province_id: province_id,
                pop_type: pop_type,
                pop_scope: pop_demotion_selectors.pop_scope
              });
              var weighted_total = 0;

              //Fetch weighted_total
              if (local_pop_demote_chance.boolean) {
                for (var y = 0; y < local_pop_demote_chance.selectors.length; y++)
                  weighted_total += local_pop_demote_chance.selectors[y][0].size*
                    local_pop_demote_chance.selectors[y][1];

                //Add weighted_total to demote_chances
                modifyValue(demote_chances, all_demotes[x], weighted_total, true);
              }
            }

          //Standardise percentage fro demote_chances; iterate over all of them and demote to respective pops
          demote_chances = standardisePercentage(demote_chances);

          var all_demote_chances = Object.keys(demote_chances);

          for (var x = 0; x < all_demote_chances.length; x++) {
            var local_percentage = demote_chances[all_demote_chances[x]];

            var local_demote_amount = Math.floor(returnSafeNumber(local_pop_scope[pop_type])*local_value*local_percentage);
            var local_used_demote = Math.floor(returnSafeNumber(local_pop_scope[`used_${pop_type}`])*local_value*local_percentage);

            //Layoff from wealth pools
            for (var y = 0; y < all_local_tags.length; y++)
              if (all_local_tags[y].startsWith("wealth-")) {
                var local_layoff_amount = local_pop_scope.tags[all_local_tags[y]]*local_value*local_percentage;
                var split_wealth_key = all_local_tags[y].split("-");

                var local_building = building_map[`${split_wealth_key[1]}-${split_wealth_key[2]}`];

                if (local_building) {
                  var local_building_obj = province_obj.buildings[local_building];

                  if (local_building)
                    layoffWorkers(local_building_obj, split_wealth_key[3], local_layoff_amount);
                }
              }

            //Add to chosen profession
            modifyValue(province_obj.pops, pop_type, local_demote_amount*-1, true);
            modifyValue(province_obj.pops, `used_${pop_type}`, local_used_demote*-1, true);
            modifyValue(province_obj.pops, all_demote_chances[x], local_demote_amount);

            //Set province tracker
            province_obj.trackers[`demote-${pop_type}-${all_demote_chances[x]}`] = local_demote_amount;
          }
        }
      }
    }
  },

  /*
    processEmployment() - Processes the job market for a given pop type in a province
    options: {
      sorted_wage_obj: {}, - Optimisation parameter. The sorted wage object for the province.
      unemployed_pops: 3194 - Optimisation parameter. The total number of unemployed pops sitting in this province
    }
  */
  processEmployment: function (arg0_province_id, arg1_type, arg2_options) {
    //Convert from parameters
    var province_id = arg0_province_id;
    var pop_type = arg1_type;
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var building_map = getBuildingMap(province_id);
    var province_obj = main.provinces[province_id];
    var unemployed_pops = (options.unemployed_pops) ? options.unemployed_pops : getUnemployedPops(province_id, pop_type);

    //All unemployed pops are looking for a job
    if (province_obj)
      if (province_obj.buildings) {
        var building_wages = (options.sorted_wage_obj) ? options.sorted_wage_obj : getBuildingWages(province_id, pop_type);

        //Iterate over all_building_wages and select the range from the top of the current number of keys
        var all_building_wages = Object.keys(building_wages);
        var end_index = all_building_wages.length - 1;
        var is_strict = config.defines.economy.strict_job_seeking;
        var job_seeking_range = config.defines.economy.job_seeking_range;

        var valid_building_range = [
          Math.floor(end_index*job_seeking_range[0]),
          Math.ceil(end_index*job_seeking_range[1])
        ];
        valid_building_range.sort(function (a, b) { return a - b });

        var actual_valid_building_range = (is_strict) ? valid_building_range[0] : 0;

        //Make sure that valid_building_range exists for the target pops searching for jobs
        if (valid_building_range[0] != -1 && valid_building_range[1] != -1)
          for (var i = valid_building_range[1]; i >= actual_valid_building_range; i--) {
            var building_id = all_building_wages[i];
            var local_building = province_obj.buildings[building_map[building_id]];
            var local_key = `wealth-${building_id}-${pop_type}`;

            //Declare wealth pool if it doesn't exist
            if (!province_obj.pops[local_key])
              province_obj.pops[local_key] = {};
            var local_wealth_pool = province_obj.pops[local_key];

            //If they're currently hiring, take all the workers you can according to random_chance_roll. If positions max out, the unemployed_pops figure rolls over
            if (local_building)
              if (local_building[`${pop_type}_positions`]) {
                var random_chance_roll = Math.random();
                var random_hirees = Math.floor(unemployed_pops*random_chance_roll);

                if (unemployed_pops > 0) {
                  var available_positions = returnSafeNumber(local_building[`${pop_type}_positions`]);

                  if (available_positions > random_hirees) {
                    modifyValue(local_building.employment, pop_type, random_hirees);
                    modifyValue(local_wealth_pool, "size", random_hirees);

                    modifyValue(local_building, `${pop_type}_positions`, random_hirees*-1);

                    unemployed_pops -= random_hirees;
                  } else {
                    modifyValue(local_building.employment, pop_type, available_positions, true);
                    modifyValue(local_wealth_pool, "size", available_positions);
                    unemployed_pops -= available_positions;

                    //Delete local_building[`${pop_type}_positions`] since all the positions have been hired
                    delete local_building[`${pop_type}_positions`];
                  }
                }
              }
          }
      }
  },

  processMigration: function (arg0_province_id, arg1_pop_type, arg2_pop_scope) {
    //Convert from parameters
    var province_id = arg0_province_id;
    var pop_type = arg1_pop_type;
    var pop_scope = (arg2_pop_scope) ? arg2_pop_scope : undefined;

    //Declare local instance variables
    var pop_obj = config.pops[pop_type];
    var province_obj = (typeof province_id != "object") ? main.provinces[province_id] : province_id;

    //Initialise pop_scope
    if (!pop_scope)
      pop_scope = selectPops({
        province_id: province_id,
        pop_types: [pop_type]
      });

    //Make sure external_migration_table and internal_migration_table are defined first before accessing them
    //Both maps have the format: { <province_id>: <migration_attraction_score> }
    var external_migration_table = lookup[`${province_obj.controller}-external_migration_attraction`];
    var internal_migration_table = lookup[`${province_obj.controller}-migration_attraction`];

    var all_external_provinces = Object.keys(external_migration_table);
    var all_internal_provinces = Object.keys(internal_migration_table);

    //Process internal migration
    if (all_internal_provinces.length > 0) {
      //Get internal migration chance
      var internal_migration_chance = parsePopLimit(config.pop_migration.internal_emigration, {
        pop_scope: pop_scope,
        province_id: province_id
      });

      //Apply internal migration to various pop scopes
      var internal_migration_scope = {};
      var internal_migration_scopes = [];
      var internal_percentage_taken = 0;

      for (var i = 0; i < internal_migration_chance.selectors.length; i++) {
        var local_value = internal_migration_chance.selectors[i];

        if (local_value[1] > 0) {
          var local_chance = local_value[1];
          var local_pop_scope = multiplyPops(local_value[0], local_chance);

          internal_migration_scopes.push(local_pop_scope);
        }
      }

      //Iterate over internal_migration_scopes and move them all out
      if (internal_migration_scopes.length > 0) {
        internal_migration_scope = internal_migration_scopes[0];

        if (internal_migration_scopes.length > 1)
          for (var i = 1; i < internal_migration_scopes.length; i++)
            internal_migration_scope = addPopScopes(internal_migration_scope, internal_migration_scopes[i]);

        //internal_migration_scope is now the total amount of people that want to move out, transfer pops proportionally to internal provinces
        if (internal_migration_scope.size > 0)
          for (var i = 0; i < all_internal_provinces.length; i++) {
            var local_value = internal_migration_table[all_internal_provinces[i]];
            var ot_province = main.provinces[all_internal_provinces[i]];

            //Make sure that local migration attraction for this internal province is greater than 0
            if (local_value > 0 && (internal_percentage_taken + local_value) <= 1) {
              var move_out_scope = multiplyPops(internal_migration_scope, local_value);

              internal_percentage_taken += local_value;
              modifyValue(province_obj.trackers, `emigration-${all_internal_provinces[i]}`, move_out_scope.size);
              modifyValue(ot_province.trackers, `immigration-${province_obj.id}`, move_out_scope.size);

              //Call movePops()
              movePops(province_obj.id, move_out_scope, all_internal_provinces[i]);
            }
          }
      }
    }

    //Process external migration
    if (all_external_provinces.length > 0) {
      //Get external migration chance
      var external_migration_chance = parsePopLimit(config.pop_migration.external_emigration, {
        pop_scope: pop_scope,
        province_id: province_id
      });

      //Apply external migration to various pop scopes - [WIP] REVISIT LOGIC TO ACCOUNT FOR NATION SELECTION
      var external_migration_scope = {};
      var external_migration_scopes = [];
      var external_percentage_taken = 0;

      for (var i = 0; i < external_migration_chance.selectors.length; i++) {
        var local_value = external_migration_chance.selectors[i];

        if (local_value[1] > 0) {
          var local_chance = local_value[1];
          var local_pop_scope = multiplyPops(local_value[0], local_chance);

          external_migration_scopes.push(local_pop_scope);
        }
      }

      //Iterate over external_migration_scopes and move them all out
      if (external_migration_scopes.length > 0) {
        external_migration_scope = external_migration_scopes[0];

        if (external_migration_scopes.length > 1)
          for (var i = 1; i < external_migration_scopes.length; i++)
            external_migration_scope = addPopScopes(external_migration_scope, external_migration_scopes[i]);

        //external_migration_scope is now the total amount of people that want to move out, transfer pops proportionally to external provinces
        if (external_migration_scope.size > 0)
          for (var i = 0; i < all_external_provinces.length; i++) {
            var local_value = external_migration_table[all_external_provinces[i]];
            var ot_province = main.provinces[all_external_provinces[i]];

            //Make sure that local migration attraction for this external province is greater than 0
            if (local_value > 0 && (external_percentage_taken + local_value) <= 1) {
              var move_out_scope = multiplyPops(external_migration_scope, local_value);

              external_percentage_taken += local_value;
              modifyValue(province_obj.trackers, `emigration-${all_external_provinces[i]}`, move_out_scope.size);
              modifyValue(ot_province.trackers, `immigration-${province_obj.id}`, move_out_scope.size);

              //Call movePops()
              movePops(province_obj.id, move_out_scope, all_external_provinces[i]);
            }
          }
      }
    }
  },

  /*
    processPromotion() - Processes promotion for a certain pop type.
    options: {
      building_map: {} - Optional. Optimisation parameter.
    }
  */
  processPromotion: function (arg0_province_id, arg1_pop_type, arg2_pop_scope, arg3_options) {
    //Convert from parameters
    var province_id = arg0_province_id;
    var pop_type = arg1_pop_type;
    var pop_scope = arg2_pop_scope;
    var options = (arg3_options) ? arg3_options : {};

    //Declare local instance variables
    var building_map = (options.building_map) ? options.building_map : getBuildingMap(province_id);
    var config_obj = config.pops[pop_type];
    var has_promotes = false;
    var province_obj = (typeof province_id != "object") ? main.provinces[province_id] : province_id;

    var pop_promotion_selectors = parsePopLimit(config.pop_mobility.promotion, {
      province_id: province_obj.id,
      pop_type: pop_type,
      pop_scope: pop_scope
    });

    //Initialise variables
    if (config_obj.promotes_to) has_promotes = true;

    if (pop_promotion_selectors.boolean) {
      //pop_promotion_selectors.selectors - [pop_scope, value];
      for (var i = 0; i < pop_promotion_selectors.selectors.length; i++) {
        var local_pop_scope = pop_promotion_selectors.selectors[i][0];
        var local_value = pop_promotion_selectors.selectors[i][1];

        var all_local_tags = Object.keys(local_pop_scope.tags);

        if (has_promotes) {
          var all_promotes = Object.keys(config_obj.promotes_to);
          var promote_chances = {};

          for (var x = 0; x < all_promotes.length; x++)
            if (config.pops[all_promotes[x]]) {
              var local_pop_promote_chance = parsePopLimit(config_obj.promotes_to[all_promotes[x]], {
                province_id: province_id,
                pop_type: pop_type,
                pop_scope: pop_promotion_selectors.pop_scope
              });
              var weighted_total = 0;

              //Fetch weighted_total
              if (local_pop_promote_chance.boolean)
                for (var y = 0; y < local_pop_promote_chance.selectors.length; y++)
                  weighted_total += local_pop_promote_chance.selectors[y][0].size*local_pop_promote_chance.selectors[y][1];

              //Add weighted_total to promote_chances
              modifyValue(promote_chances, all_promotes[x], weighted_total, true);
            }

          //Standardise percentage for promote chances; iterate over all of them and promote to respective pops
          promote_chances = standardisePercentage(promote_chances);

          var all_promote_chances = Object.keys(promote_chances);

          for (var x = 0; x < all_promote_chances.length; x++) {
            var local_percentage = promote_chances[all_promote_chances[x]];

            var local_promote_amount = Math.floor(returnSafeNumber(local_pop_scope[pop_type])*local_value*local_percentage);
            var local_used_promote = Math.floor(returnSafeNumber(local_pop_scope[`used_${pop_type}`])*local_value*local_percentage);

            //Layoff from wealth pools
            for (var y = 0; y < all_local_tags.length; y++)
              if (all_local_tags[y].startsWith("wealth-")) {
                var local_layoff_amount = local_pop_scope.tags[all_local_tags[y]]*local_value*local_percentage;
                var split_wealth_key = all_local_tags[y].split("-");

                var local_building = building_map[`${split_wealth_key[1]}-${split_wealth_key[2]}`];

                if (local_building) {
                  var local_building_obj = province_obj.buildings[local_building];

                  //This is returning a numeric map
                  if (local_building_obj)
                    layoffWorkers(local_building_obj, split_wealth_key[3], local_layoff_amount);
                }
              }

            //Add to chosen profession
            modifyValue(province_obj.pops, pop_type, local_promote_amount*-1, true);
            modifyValue(province_obj.pops, `used_${pop_type}`, local_used_promote*-1, true);
            modifyValue(province_obj.pops, all_promote_chances[x], local_promote_amount, true);

            //Set province trackers
            province_obj.trackers[`promote-${pop_type}-${all_promote_chances[x]}`] = local_promote_amount;
          }
        }
      }
    }
  },

  processPurchases: function (arg0_province_id) {
    //Convert from parameters
    var province_id = arg0_province_id;

    //Declare local instance variables
    var economy_defines = config.defines.economy;
    var province_obj = (typeof province_obj != "object") ? main.provinces[province_id] : province_id;

    var all_good_categories = Object.keys(economy_defines.good_categories);
    var debt_goods_chance = economy_defines.debt_goods_chance;
    var resource_production_scalar = economy_defines.resource_production_scalar;

    //Check that province_obj exists
    if (province_obj)
      if (province_obj.pops) {
        var actual_id = province_obj.controller;
        var all_wealth_keys = sortWealthPools(province_obj.id, { mode: "wealth" });
        var usr = main.users[actual_id];

        //Iterate through all wealth pools in province
        for (var i = 0; i < all_wealth_keys.length; i++)
          if (all_wealth_keys[i].startsWith("wealth-")) {
            var local_wealth_pool = province_obj.pops[all_wealth_keys[i]];
            var spending = 0;
            var split_key = all_wealth_keys[i].split("-");
            var pop_type = split_key[3];

            var consumption_scalar = returnSafeNumber(local_wealth_pool.size)/100000;
            var pop_obj = config.pops[pop_type];

            //Make sure .income, .wealth are safe numbers
            local_wealth_pool.income = returnSafeNumber(local_wealth_pool.income);
            local_wealth_pool.wealth = returnSafeNumber(local_wealth_pool.wealth);

            //Check pop_obj.per_100k.needs
            if (pop_obj && local_wealth_pool.income > 0 && local_wealth_pool.size > 0)
              if (pop_obj.per_100k)
                if (pop_obj.per_100k.needs) {
                  var category_buy_order = pop_obj.buy_order;
                  var total_fulfilment = 0;
                  var total_variety = 0;

                  //Reset .inventory_consumption and .received_goods
                  local_wealth_pool.inventory_consumption = {};
                  local_wealth_pool.received_goods = {};

                  for (var x = 0; x < category_buy_order.length; x++) {
                    local_wealth_pool.inventory_consumption[category_buy_order[x]] = {};
                    local_wealth_pool.received_goods[category_buy_order[x]] = {};
                  }

                  //Pop purchase logic
                  {
                    if (pop_obj.goods_buy_order)
                      for (var x = 0; x < pop_obj.goods_buy_order.length; x++) {
                        var local_buy_order = pop_obj.goods_buy_order[x];

                        var local_allowance = local_wealth_pool.income*local_buy_order.allowance;
                        var local_inventory_consumption = local_wealth_pool.inventory_consumption[local_buy_order.category];
                        var local_market_good = main.market[local_buy_order.good_type];
                        var local_received_goods = local_wealth_pool.received_goods[local_buy_order.category];
                        var local_value = local_buy_order.amount;

                        //Spend money on good
                        if (local_market_good) {
                          var local_need = local_value*consumption_scalar;

                          var actual_consumption = returnSafeNumber(Math.min(getGoodAmount(actual_id, local_buy_order.good_type), local_need));
                          var local_worth = actual_consumption*local_market_good.buy_price;
                          var local_tax = Math.max(local_worth*returnSafeNumber(usr[`${pop_obj.class}_duties_tax`]), 0);

                          //actual_consumption should be positive
                          if (actual_consumption < 0) actual_consumption = 0;

                          //Debt handling; modify actual consumption if in debt
                          if (local_wealth_pool.wealth < 0) {
                            if (actual_consumption == 1) {
                              var has_good = randomNumber(1, debt_goods_chance);

                              if (has_good != 1)
                                actual_consumption = 0;
                            } else if (actual_consumption > 1) {
                              actual_consumption = actual_consumption*(debt_goods_chance[0]/debt_goods_chance[1]);
                            }
                          } else {
                            //Non-debt handler
                            spending += (local_worth + local_tax);
                          }

                          //Buy from market
                          var market_consumption = Math.ceil(actual_consumption*resource_production_scalar);

                          buyMarketGood(local_buy_order.good_type, market_consumption);

                          //Tracker handling; set inventory_consumption; received_goods
                          var inventory_consumption = modifyGoodAmount(usr, local_buy_order.good_type, returnSafeNumber(inventory_consumption)*-1);
                          inventory_consumption = multiplyObject(inventory_consumption, -1, false, false);

                          local_wealth_pool.inventory_consumption[local_buy_order.category] = mergeObjects(local_inventory_consumption, inventory_consumption);
                          modifyValue(local_received_goods, local_buy_order.good_type, returnSafeNumber(actual_consumption));

                          //Tax handling
                          if (local_tax > 0)
                            modifyValue(usr.trackers.tax, `${pop_obj.class}_duties_tax`, local_tax);
                        }
                      }
                  }

                  //Post-purchase trackers: Spending, fulfilment/variety
                  {
                    if (local_wealth_pool.wealth > 0)
                      local_wealth_pool.wealth -= spending;
                    local_wealth_pool.spending = spending;

                    //Update _fulfilment and _variety for each category
                    for (var x = 0; x < category_buy_order.length; x++) {
                      var local_received_goods = local_wealth_pool.received_goods[category_buy_order[x]];

                      var local_fulfilment_obj = getPopNeedsFulfilment(local_received_goods, pop_type, local_wealth_pool.size, {
                        needs_category: category_buy_order[x],
                        return_object: true
                      });
                      total_fulfilment += local_fulfilment_obj.fulfilment;
                      total_variety += local_fulfilment_obj.variety;

                      //Set local fulfilment and variety
                      local_wealth_pool[`${category_buy_order[x]}-fulfilment`] = local_fulfilment_obj.fulfilment;
                      local_wealth_pool[`${category_buy_order[x]}-variety`] = local_fulfilment_obj.variety;
                    }

                    //Clean up received_goods for local_wealth_pool
                    if (local_wealth_pool.received_goods) {
                      var all_received_goods_categories = Object.keys(local_wealth_pool.received_goods);

                      for (var x = 0; x < all_received_goods_categories.length; x++) {
                        var local_category = local_wealth_pool.received_goods[all_received_goods_categories[x]];

                        var all_local_received = Object.keys(local_category);

                        for (var y = 0; y < all_local_received.length; y++) {
                          var local_value = local_category[all_local_received[y]];

                          local_category[all_local_received[y]] = returnSafeNumber(local_value);
                        }
                      }
                    }

                    //Set general fulfilment and variety
                    local_wealth_pool.fulfilment = total_fulfilment/category_buy_order.length;
                    local_wealth_pool.variety = total_variety/category_buy_order.length;
                  }
                }
          }
      }
  },

  /*
    processSubsistence() - Processes the subsistence tick for a province.
    options: {
      category_prices: {} - Optimisation parameter. Optional. Specifies mean category prices
    }
  */
  processSubsistence: function (arg0_province_id, arg1_options) {
    //Convert from parameters
    var province_id = arg0_province_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var all_buildings = Object.keys(lookup.all_buildings);
    var all_pops = Object.keys(config.pops);
    var average_wage = 0;
    var province_obj = (province_id != "object") ? main.provinces[province_id] : province_id;
    var qualified_pops = [];
    var subsistence_building_key = getSubsistenceBuilding(province_id);
    var subsistence_building_obj = lookup.all_buildings[subsistence_building_key];

    if (subsistence_building_obj) {
      qualified_pops = getSubsistencePops(province_obj.id, subsistence_building_key);

      //Set subsistence object
      province_obj.subsistence = {
        building_type: subsistence_building_key,
        employment: {},
        revenue: 0,
        wage: 0,

        subsistence: true,
        qualified_pops: qualified_pops
      };

      var subsistence_obj = province_obj.subsistence;

      //Set employment to all those unemployed
      for (var i = 0; i < qualified_pops.length; i++) {
        var pop_amount = returnSafeNumber(province_obj.pops[qualified_pops[i]]);
        var used_pops = returnSafeNumber(`used_${province_obj.pops[qualified_pops[i]]}`);

        var unemployed_pops = pop_amount - used_pops;

        if (unemployed_pops > 0) {
          subsistence_obj.employment[qualified_pops[i]] = unemployed_pops;
        } else {
          delete subsistence_obj.employment[qualified_pops[i]];
        }
      }

      //Calculate total revenue
      var employed_pops = getObjectSum(subsistence_obj.employment);
      var total_revenue = 0;

      //Fetch artisan production for province
      var subsistence_production_obj = getSubsistenceProduction(province_obj.id, subsistence_obj);

      //Set subsistence_obj.production; get revenues from production
      subsistence_obj.production = subsistence_production_obj;
      subsistence_obj.revenue = getBuildingRevenue(subsistence_building_obj, { goods: subsistence_obj.production });
      subsistence_obj.wage = subsistence_obj.revenue/employed_pops;

      for (var i = 0; i < qualified_pops.length; i++) {
        var key_name = `wealth-subsistence-${subsistence_building_key}-${qualified_pops[i]}`;
        var local_pop_amount = returnSafeNumber(subsistence_obj.employment[qualified_pops[i]]);

        //Adjust wealth pool
        if (local_pop_amount > 0) {
          var pop_income = subsistence_obj.revenue*(local_pop_amount/employed_pops);

          if (!province_obj.pops[key_name])
            province_obj.pops[key_name] = {
              size: local_pop_amount,
              income: returnSafeNumber(pop_income)
            };
          var local_wealth_pool = province_obj.pops[key_name];

          //Update .size and .income
          local_wealth_pool.size = local_pop_amount;
          local_wealth_pool.income = pop_income;

          //Add .income to .wealth
          modifyValue(local_wealth_pool, "wealth", returnSafeNumber(pop_income));
        } else {
          delete province_obj.pops[key_name];
        }
      }

      //Return statement
      return province_obj.subsistence;
    } else {
      log.warn(`No subsistence building could be found that was applicable to ${province_obj.id}!`);
    }
  },

  /*
    sortWealthPools() - Sorts wealth pool objects in province,
    options: {
      mode: "income"/"pop_type"/"size"/"wealth", - Optional. "size" by default
      return_object: true/false - Whether to return wealth pools as a single object. Returns keys by default
    }
  */
  sortWealthPools: function (arg0_province_id, arg1_options) {
    //Convert from parameters
    var province_id = arg0_province_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var mode = (options.mode) ? options.mode : "size";
    var province_obj = (typeof province_id != "object") ? main.provinces[province_id] : province_id;
    var return_obj = {};
    var subsistence_obj = {};

    //Iterate over province_obj.pops for wealth pools
    if (province_obj.pops) {
      var all_pops = Object.keys(config.pops);
      var all_pop_keys = Object.keys(province_obj.pops);
      var regular_wealth_pools = [];

      //Subsistence pools go up top
      for (var i = 0; i < all_pop_keys.length; i++)
        if (all_pop_keys[i].startsWith("wealth-")) {
          var local_value = province_obj.pops[all_pop_keys[i]];

          if (all_pop_keys[i].includes("subsistence")) {
            local_value.key = all_pop_keys[i];
            subsistence_obj[all_pop_keys[i]] = local_value;
          } else {
            //Non-subsistence handling
            var split_key = all_pop_keys[i].split("-");
            var pop_type = split_key[3];

            local_value.key = all_pop_keys[i];
            local_value.pop_type = pop_type;

            regular_wealth_pools.push(local_value);
          }
        }

      //Sort wealth pools by mode in descending order
      if (mode == "income") {
        regular_wealth_pools.sort((a, b) => b.income - a.income);
      } else if (mode == "size") {
        regular_wealth_pools.sort((a, b) => b.size - a.size);
      } else if (mode == "pop_type") {
        regular_wealth_pools.sort((a, b) => b.pop_type - a.pop_type);
      } else if (mode == "wealth") {
        regular_wealth_pools.sort((a, b) => b.wealth - a.wealth);
      }

      //Append regular_wealth_pools/new_wealth_pools to subsistence_obj as a sorted_wealth_pools_obj
      var sorted_wealth_pools_obj = {};

      for (var i = 0; i < regular_wealth_pools.length; i++) {
        var local_value = regular_wealth_pools[i];

        sorted_wealth_pools_obj[local_value.key] = local_value;
        var local_wealth_pool = sorted_wealth_pools_obj[local_value.key];

        delete local_wealth_pool.key;
        delete local_wealth_pool.pop_type;
      }

      return_obj = mergeObjects(subsistence_obj, sorted_wealth_pools_obj);

      //Return statements
      return (!options.return_object) ? Object.keys(return_obj) : return_obj;
    }
  },

  updateMigrationAttraction: function () {
    //Declare local instance variables
    var all_provinces = Object.keys(main.provinces);
    var all_users = Object.keys(main.users);
    var dynamic_tables = {};
    var migration_attraction = {};

    for (var i = 0; i < all_provinces.length; i++) {
      var local_province = main.provinces[all_provinces[i]];

      if (local_province.controller) {
        var local_migration_attraction = parsePopLimit(config.pop_migration.province_selection, {
          province_id: all_provinces[i],
          ignore_pop_size: true
        });

        if (local_migration_attraction.value != 0)
          modifyValue(migration_attraction, all_provinces[i], returnSafeNumber(local_migration_attraction.value));
      }
    }

    migration_attraction = sortObject(migration_attraction);
    var all_migration_attraction = Object.keys(migration_attraction);

    //Dynamic Tables - Internal Migration - [REVISIT] - This could be refactored in the future to make more sense
    {
      //Iterate over all_users to fetch internal migration attraction
      for (var i = 0; i < all_users.length; i++) {
        dynamic_tables[`${all_users[i]}-migration_attraction`] = {};
        dynamic_tables[`${all_users[i]}-external_migration_attraction`] = {};
      }

      //Iterate over all_migration_attraction; append each province dependent on control to dynamic_tables
      for (var i = 0; i < all_migration_attraction.length; i++) {
        var local_province = main.provinces[all_migration_attraction[i]];
        var local_value = migration_attraction[all_migration_attraction[i]];

        if (local_province.controller)
          dynamic_tables[`${local_province.controller}-migration_attraction`][local_province.id] = local_value;
      }

      //Standardise everything in dynamic_tables to 100%
      for (var i = 0; i < all_users.length; i++) {
        var local_key = `${all_users[i]}-migration_attraction`;
        var local_value = dynamic_tables[local_key];

        dynamic_tables[local_key] = sortObject(local_value);
        var new_dynamic_table = dynamic_tables[local_key];

        //Truncate dynamic tables at config.defines.economy.migration_provinces
        var all_internal_keys = Object.keys(new_dynamic_table);

        if (all_internal_keys.length > config.defines.economy.migration_provinces)
          for (var x = config.defines.economy.migration_provinces; x < all_internal_keys.length; x++)
            delete dynamic_tables[local_key][all_internal_keys[x]];

        //Add dynamic tables to lookup
        lookup[local_key] = dynamic_tables[local_key];
      }
    }

    //Dynamic Tables - External Migration
    {
      for (var i = 0; i < all_users.length; i++) {
        var key_name = `${all_users[i]}-external_migration_attraction`;
        var province_count = 0;

        //Iterate over all_migration_attraction
        for (var x = 0; x < all_migration_attraction.length; x++) {
          var local_province = main.provinces[all_migration_attraction[x]];
          var local_value = migration_attraction[all_migration_attraction[x]];

          //Upper bound guard clause
          if (province_count >= config.defines.economy.migration_provinces)
            break;
          if (local_province.controller != all_users[i]) {
            dynamic_tables[key_name][local_province.id] = local_value;
            province_count++;
          }
        }

        //Standardise percentage for local dynamic table, add to lookup
        lookup[key_name] = standardisePercentage(dynamic_tables[key_name]);
      }
    }

    //Truncate migration_attraction at config.defines.economy.migration_provinces
    if (all_migration_attraction.length > config.defines.economy.migration_provinces)
      for (var i = config.defines.economy.migration_provinces; i < all_migration_attraction.length; i++)
        delete migration_attraction[all_migration_attraction[i]];

    migration_attraction = standardisePercentage(migration_attraction);
    lookup.province_migration_attraction = migration_attraction;

    //Return statement
    return migration_attraction;
  }
};
