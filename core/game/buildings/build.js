module.exports = {
  build: function (arg0_user, arg1_city_name, arg2_amount, arg3_building_name) {
    //Convert from parameters
    var user_id = arg0_user;
    var city_name = arg1_city_name;
    var raw_amount = arg2_amount;
    var building_amount = parseInt(arg2_amount);
    var building_name = arg3_building_name;

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var building_obj = getBuilding(building_name);
    var city_obj = getCity(city_name, { users: user_id });
    var game_obj = getGameObject(user_id);
    var raw_building_name = getBuilding(building_name, { return_key: true });
    var usr = main.users[actual_id];

    //Check if usr, city_obj, or building_obj exist
    if (usr) {
      if (city_obj) {
        if (city_obj.controller == actual_id) {
          if (building_obj) {
            //Check if building amount specified is a valid number or not
            if (!isNaN(building_amount)) {
              //Check if building is unlocked or not
              if (usr.available_buildings.includes(raw_building_name)) {
                //Fetch raw building category of building
                var building_category = getBuildingCategoryFromBuilding(raw_building_name);
                var raw_category_name = getBuildingCategoryFromBuilding(raw_building_name, { return_key: true });

                if (!building_category.hidden) {
                  //Check if building slots are available for the building
                  var building_slots = (building_obj.separate_building_slots || building_category.disable_slots) ?
                    getBuildingSlots(user_id, city_name, raw_building_name) :
                    getBuildingSlots(user_id, city_name, raw_category_name);

                  if (building_slots.available_slots > 0 || building_slots.total_slots == -1) {
                    if (building_slots.available_slots >= building_amount || building_slots.total_slots == -1) {
                      //Check if user has enough resources to construct the specified buildings
                      var building_costs = getBuildingCost(user_id, raw_building_name, { amount: building_amount });
                      var resource_shortages = {};

                      //Iterate over all keys in building_costs and check for prospective shortages
                      var all_building_costs = Object.keys(building_costs);
                      var all_goods = lookup.all_good_names;
                      var all_pops = Object.keys(config.pops);

                      for (var i = 0; i < all_building_costs.length; i++) {
                        var local_cost = building_costs[all_building_costs[i]];

                        //Check if resource cost is good, pop, or other
                        if (!all_pops.includes(all_building_costs[i]))
                          if (all_goods.includes(all_building_costs[i])) {
                            if (getGoodAmount(user_id, all_building_costs[i]) < local_cost)
                              resource_shortages[all_building_costs[i]] = local_cost - getGoodAmount(user_id, all_building_costs[i]);
                          } else {
                            if (usr[all_building_costs[i]] < local_cost)
                              resource_shortages[all_building_costs[i]] = local_cost - usr[all_building_costs[i]];
                          }
                      }

                      //Check to see if anything is in resource_shortages. If so, print it out and return an error
                      var all_resource_shortages = Object.keys(resource_shortages);

                      if (all_resource_shortages.length == 0) {
                        //Fetch base_construction_turns
                        var base_construction_turns = (building_obj.construction_turns) ?
                          building_obj.construction_turns :
                          config.defines.economy.construction_turns;
                        var total_construction_time = Math.ceil(base_construction_turns*usr.modifiers.construction_time);

                        //Begin constructing the actual buildings
                        usr.under_construction.push({
                          building_type: raw_building_name,
                          building_amount: building_amount,
                          construction_turns: total_construction_time,
                          province_id: city_obj.id
                        });

                        //Deduct unit_costs from inventory and other user metrics
                        for (var i = 0; i < all_building_costs.length; i++) {
                          var local_cost = building_costs[all_building_costs[i]];

                          //Check if resource cost is good or other
                          if (!all_pops.includes(all_building_costs[i]))
                            if (all_goods.includes(all_building_costs[i])) {
                              modifyGoodAmount(user_id, all_building_costs[i], local_cost*-1);
                            } else {
                              usr[all_building_costs[i]] -= local_cost;
                            }
                        }

                        printAlert(game_obj.id, `You have begun constructing **${parseNumber(building_amount)}** ${(building_amount == 1) ? (building_obj.singular) ? building_obj.singular : raw_building_name : (building_obj.name) ? building_obj.name : raw_building_name} in **${city_obj.name}**! Your advisors estimate that construction will complete in **${parseNumber(total_construction_time)}** turn(s).`);

                        //Reload city interface if current user page is there
                        if (game_obj.page == `view_city_${city_obj.name}`)
                          createPageMenu(game_obj.middle_embed, {
                            embed_pages: printProvince(game_obj.user, city_obj.name),
                            page: interfaces[game_obj.middle_embed.id].page,
                            user: game_obj.user
                          });
                      } else {
                        //Resource shortages encountered, print them out
                        var shortage_array = [];

                        for (var i = 0; i < all_resource_shortages.length; i++) {
                          var local_good = getGood(all_resource_shortages[i]);
                          var local_icon = "";
                          var local_shortage = Math.ceil(resource_shortages[all_resource_shortages[i]]);

                          //Determine icon
                          if (local_good)
                            local_icon = (local_good.icon) ? config.icons[local_good.icon] : "";
                          if (all_resource_shortages[i] == "money")
                            local_icon = config.icons.money;

                          if (all_resource_shortages[i] == "money")
                            shortage_array.push(`- ${local_icon} ${parseNumber(local_shortage)} Money`);
                          if (local_good)
                            shortage_array.push(`- ${local_icon} ${parseNumber(local_shortage)} ${(local_good.name) ? local_good.name : all_resource_shortages[i]}`);
                        }

                        printError(game_obj.id, `You don't have enough resources to construct **${parseNumber(building_amount)}** ${(building_obj.name) ? building_obj.name : raw_building_name}! You still require the following resources:\n\n${shortage_array.join("\n")}`);
                      }
                    } else {
                      printError(game_obj.id, `**${(building_category.name) ? building_category.name : raw_category_name}** in **${city_obj.name}** does not have enough building slots remaining to construct **${parseNumber(building_amount)}** new building(s)! Only **${parseNumber(building_slots.available_slots)}** available building slot(s) for **${raw_category_name}** could be found in **${city_obj.name}**. Consider promoting urbanisation in this province to gain extra building slots, or researching additional technologies.`);
                    }
                  } else {
                    printError(game_obj.id, `**${(building_category.name) ? building_category.name : raw_category_name}** in **${city_obj.name}** does not have enough remaining building slots left for you to construct any buildings in! You attempted to construct **${parseNumber(building_amount)}** new buildings, when there's only room for **${parseNumber(building_slots.available_slots)}**!\n\nConsider promoting urbanisation in this province in order to gain extra building slots, or researching additional technologies.`);
                  }
                } else {
                  printError(game_obj.id, `You are not able to construct these types of buildings, as they are currently disabled.`);
                }
              } else {
                printError(game_obj.id, `**${(building_obj.name) ? building_obj.name : raw_building_name}** is either obsolete or has not yet currently been unlocked by your nation! Check your building list for a valid list of buildings.`);
              }
            } else {
              printError(game_obj.id, `You must specify a valid number of buildings to construct! ${raw_amount} was not accepted as a valid number.`);
            }
          } else {
            printError(game_obj.id, `The building you have specified, **${building_name}**, does not exist!`);
          }
        } else {
          printError(game_obj.id, `You can't build stuff in a city you don't control!`);
        }
      } else {
        printError(game_obj.id, `The city you have specified, **${city_name}** proved to be as elusive as El Dorado!`);
      }
    } else {
      printError(game_obj.id, `You must have a registered nation before being able to construct any buildings in your cities!`);
    }
  }
};
