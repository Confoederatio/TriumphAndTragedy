module.exports = {
  printCities: function (arg0_user) {
    //Convert from parameters
    var user_id = arg0_user;

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var game_obj = getGameObject(user_id);
    var usr = main.users[actual_id];

    //Declare local tracker variables
    var cities = getCities(user_id, {
      include_hostile_occupations: true,
      include_occupations: true
    });

    //Initialise city_string, fields_list
    var city_string = [];
    var fields_list = [];

    //Format string
    city_string.push(`**[Back]** | **[Jump To Page]** | **[View]**`);
    city_string.push("");
    city_string.push(`${config.icons.globe} Country: **${usr.name}**`);
    city_string.push("");

    //Check if user can found new cities, and if so push dynamic buttons to city_string
    if (usr.city_count < usr.city_cap) {
      city_string.push(`You can found up to **${parseNumber(usr.city_cap-usr.city_count)}** new citie(s) in your territories!`);
      city_string.push("");
      city_string.push(`**[Found City]**`);
      city_string.push("");
    }

    city_string.push(config.localisation.divider);
    city_string.push("");
    city_string.push(`__**Cities:**__`);

    if (cities.length != 0) {
      for (var i = 0; i < cities.length; i++) {
        var local_field = [];

        //Display occupation status
        if (cities[i].owner != cities[i].controller)
          (cities[i].controller != actual_id) ?
            local_field.push(`- Currently occupied by **${main.users[cities[i].controller].name}**.`) :
            local_field.push(`- This city is currently occupied by us in a war! We won't be able to gain resources from it until it is legally annexed by us.`);

        local_field.push(`- ${config.icons.provinces} Province: ${cities[i].id}`);
        local_field.push(`- ${config.icons.population} Population: ${parseNumber(cities[i].pops.population)}/${parseNumber(cities[i].housing)} (**${printPercentage(getCityPopGrowthRate(cities[i]), { base_zero: true, display_prefix: true })}**)`);
        local_field.push(`- RGO: ${(getGood(cities[i].resource).icon) ? config.icons[getGood(cities[i].resource).icon] + " " : ""} ${(getGood(cities[i].resource).name) ? getGood(cities[i].resource).name : cities[i].resource}`);

        //Print culture
        fields_list.push({ name: `[View **${cities[i].name}**] ${(cities[i].city_type == "capital") ? " - Capital City" : ""}`, value: local_field.join("\n"), inline: true });
      }
    } else {
      city_string.push("");
      city_string.push(`_You currently don't have any cities in your possession!_`);
      city_string.push("");
      city_string.push(`_Consider founding a new city to start building up your country._`);
      city_string.push(`- You can found a new city by typing **[Found City]**.`);
    }

    //Return statement
    return (fields_list.length > 0) ?
      splitEmbed(city_string, {
        fields: fields_list,
        fixed_width: true,
        maximum_fields: 12,
        table_width: 2,
        title: "City List:",
        title_pages: true
      }) :
      splitEmbed(city_string, {
        title: "City List:",
        title_pages: true
      });
  },

  printCity: function (arg0_user, arg1_name) {
    //Convert from parameters
    var user_id = arg0_user;
    var city_name = arg1_name;

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var game_obj = getGameObject(user_id);
    var usr = main.users[actual_id];

    //Declare local tracker variables
    var city_obj = getCity(city_name);
    var culture_obj;
    try {
      culture_obj = main.global.cultures[city_obj.culture];
    } catch {}

    if (city_obj) {
      var rgo_name = (getGood(city_obj.resource).name) ? getGood(city_obj.resource).name : city_obj.resource;
      var rgo_icon = (getGood(city_obj.resource).icon) ? config.icons[getGood(city_obj.resource).icon] + " " : "";

      //Initialise city_string
      var city_string = [];

      //Format string
      city_string.push(`**[Back]** | **[Jump To Page]**`);
      city_string.push("");
      city_string.push(`${config.icons.globe} Country: **${usr.name}**`);
      city_string.push(`Type **[Cities]** to view a full list of all your cities.`);
      city_string.push("");
      city_string.push(config.localisation.divider);
      city_string.push("");
      city_string.push(`City Options: ${(city_obj.city_type != "capital") ? "**[Move Capital]** | " : ""}**[Rename City]**`);
      city_string.push(`Manage Buildings: **[Build]** | **[Demolish]**`);
      city_string.push(`Promote Urbanisation: **[Develop]** - Gain an extra building slot in this city for **${parseNumber(getDevelopmentCost(user_id, city_obj.id))}** ${config.icons.political_capital} Political Capital.`);
      city_string.push(config.localisation.divider);

      //Print city information
      city_string.push(`**${city_obj.name}:**`);
      city_string.push("");

      if (city_obj.demilitarised) {
        city_string.push(`- Currently demilitarised for **${parseNumber(getDemilitarisedTurns(city_obj.id))}** turn(s).`);
        city_string.push("");
      }

      city_string.push(`**Province:** ${config.icons.provinces} ${city_obj.id}`);
      city_string.push(`**Population:** ${config.icons.population} ${parseNumber(city_obj.pops.population)} (**${printPercentage(getCityPopGrowthRate(city_obj), { base_zero: true, display_prefix: true })}** per turn)`);
      city_string.push(`**Development:** ${config.icons.development} ${parseNumber(city_obj.development)}`);
      city_string.push(`**RGO:** ${rgo_icon}${rgo_name}`);
      city_string.push(`- **${(usr.modifiers.rgo_throughput-1 >= 0) ? "+" : ""}${printPercentage(usr.modifiers.rgo_throughput)}** modifier to ${rgo_icon}${rgo_name} production in this province.`);
      city_string.push("");
      city_string.push(`**Culture:** ${config.icons.culture} ${(culture_obj) ? culture_obj.name : "None"}`);
      city_string.push(`**Supply Limit:** ${config.icons.railways} ${parseNumber((city_obj.supply_limit) ? city_obj.supply_limit : config.defines.combat.base_supply_limit)}`);

      city_string.push("");
      city_string.push(`**Buildings:**`);
      city_string.push(config.localisation.divider);
      city_string.push("");

      //Display buildings in building categories!
      var all_building_categories = getBuildingCategories();
      var people_housed = 0;

      //Fetch housing amount first
      for (var i = 0; i < city_obj.buildings.length; i++) {
        var local_building = getBuilding(city_obj.buildings[i].building_type);

        if (local_building.houses)
          people_housed += local_building.houses;
      }

      //Fix province housing [REMOVE IN FUTURE]
      city_obj.housing = people_housed;

      for (var i = 0; i < all_building_categories.length; i++) {
        var local_building_category = getBuildingCategory(all_building_categories[i]);
        var local_building_slots = getBuildingSlots(user_id, city_obj.id, all_building_categories[i]);
        var special_string = (local_building_category.is_housing || local_building_category.description) ?
          (local_building_category.is_housing) ?
            `\n • **Current Limit:** ${parseNumber(people_housed)}. Cities cannot grow once they surpass their housing limit. Build more **housing** to increase this limit.` :
            `\n • ${local_building_category.description}`
        : "";

        //Display category and all buildings inside only if the local building category should either always be displayed or buildings are present inside of the building category
        if (local_building_category)
          if (local_building_slots.total_buildings > 0 || local_building_slots.total_buildings_under_construction > 0 || local_building_category.always_display) {
            var all_buildings_in_category = Object.keys(local_building_category);

            //Generate and push header to page
            (!local_building_category.disable_slots) ?
              city_string.push(`- **${parseString(all_building_categories[i])}:** (${parseNumber(local_building_slots.total_buildings + local_building_slots.total_buildings_under_construction)}/${parseNumber(local_building_slots.total_slots)}) ${special_string}`) :
              city_string.push(` - **${parseString(all_building_categories[i])}:** ${special_string}`);

            //Iterate over all building objects in array
            for (var x = 0; x < all_buildings_in_category.length; x++)
              if (!ignore_building_keys.includes(all_buildings_in_category[x])) {
                var all_buildings = 0;
                var local_building = getBuilding(all_buildings_in_category[x]);
                var local_building_name = (local_building.name) ? local_building.name : all_buildings_in_category[x];
                var local_slots = getBuildingSlots(user_id, city_obj.id, all_buildings_in_category[x]);

                for (var y = 0; y < city_obj.buildings.length; y++)
                  if (city_obj.buildings[y].building_type == all_buildings_in_category[x])
                    all_buildings++;

                if (all_buildings > 0 || local_slots.total_buildings_under_construction > 0)
                  city_string.push(` - ${(local_building.icon) ? config.icons[local_building.icon] + " " : ""}${local_building_name}: ${parseNumber(all_buildings)}${(local_building.separate_building_slots) ? " (" + parseNumber(all_buildings) + "/" + parseNumber(local_slots.total_slots) + ")" : ""} ${(local_slots.total_buildings_under_construction > 0) ? `(+${parseNumber(local_slots.total_buildings_under_construction)} under construction)` : ""}`);
              }

            city_string.push("");
          }
      }

      //Change game_obj.page
      game_obj.page = `view_city_${city_obj.name}`;

      //Return statement
      return splitEmbed(city_string, {
        title: `${city_obj.name}:`,
        title_pages: true,
        fixed_width: true
      });
    } else {
      printError(game_obj.id, `The city of ${city_name} couldn't be found anywhere in your territory!`);
    }
  }
};
