module.exports = {
  printGlobalCommands: function (arg0_user) {
    //Convert from parameters
    var user_id = arg0_user;

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var game_obj = getGameObject(user_id);
    var usr = main.users[actual_id];

    //Format global_commands_string
    var global_commands_string = [];

    global_commands_string.push(`Global commands can help you get around faster! These commands apply on all pages and can be used by simply typing the corresponding command in Discord's message box.`);
    global_commands_string.push("");
    global_commands_string.push(`Here's a quick glossary:`)
    global_commands_string.push("");
    global_commands_string.push(config.localisation.divider);
    global_commands_string.push("");
    global_commands_string.push(`- **[Map/Country/Budget/Economy/Technology ..]** - Switch between tabs.`);
    global_commands_string.push("");
    global_commands_string.push(`- **[Build]** - Opens the build menu.`);
    global_commands_string.push(`- **[Inventory]** - Opens your national stockpile.`);
    global_commands_string.push(`- **[Recruit]** - Recruits units. Can also be accessed through **[Train Units]**.`);
    global_commands_string.push(`- **[Set Tax]** - Adjusts your tax rate.`);
    global_commands_string.push(`- **[Settle]** - Settles a set of provinces with your colonists.`);
    global_commands_string.push("");
    global_commands_string.push(`- **[View Armies]** - Shows a list of all your armies.`);
    global_commands_string.push(`- **[View CB List]** - Opens a list of all potential CB's.`);
    global_commands_string.push(`- **[View Cities]** - Shows a list of all cities under your control.`);
    global_commands_string.push(`- **[View Constructions]** - Shows a list of all ongoing construction in your country.`);
    global_commands_string.push(`- **[View Cultures]** - Shows a list of all cultures in your nation.`);
    global_commands_string.push(`- **[View Governments]** - Opens a list of all available governments.`)
    global_commands_string.push(`- **[View Ledger]** - Opens a scoreboard of all nations on the map.`);
    global_commands_string.push(`- **[View National Modifiers]** - View all your current **National Modifiers**.`);
    global_commands_string.push(`- **[View Modifiers]** - View all your modifiers on the national level.`);
    global_commands_string.push(`- **[View Province]** - View a specific province/city.`);
    global_commands_string.push(`- **[View Provinces]** - Shows a list of all provinces under your control.`);
    global_commands_string.push(`- **[View Relations]** - Opens your diplomatic relations with another country.`);
    global_commands_string.push(`- **[View Temporary Modifiers]** - View all your active **Temporary Modifiers**.`);
    global_commands_string.push(`- **[View Units]** - Opens a list of all units you can recruit.`);
    global_commands_string.push("");
    global_commands_string.push(`- **[View (Army/City/Country/Province/War)]** - Quick jump to viewing a UI panel for something.`);

    //Remove control panel if one exists
    removeControlPanel(game_obj.id);

    //Create embed and edit to message
    const global_commands_embed = new Discord.MessageEmbed()
      .setColor(settings.bot_colour)
      .setTitle(`[Back] | **Global Commands:**`)
      .setImage("https://cdn.discordapp.com/attachments/722997700391338046/736141424315203634/margin.png")
      .setDescription(global_commands_string.join("\n"));

    game_obj.main_embed = global_commands_embed;
    game_obj.main_change = true;
  },

  printStats: function (arg0_user) {
    //Convert from parameters
    var user_id = arg0_user;

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var game_obj = getGameObject(user_id);
    var usr = main.users[actual_id];

    //Declare local tracker variables
    var actions_amount = getProduction(user_id, "actions");
      actions_amount[0] += config.defines.economy.starting_actions;
      actions_amount[1] += config.defines.economy.starting_actions;
    var all_cities = [];
    var all_national_modifiers = Object.keys(usr.national_modifiers);
    var all_pops = Object.keys(config.pops);
    var has_no_provinces = (getProvinces(user_id, { include_hostile_occupations: true, include_occupations: true }).length == 0);
    var political_capital_gain = getPoliticalCapitalGain(user_id);
    var user_income = getIncome(user_id, undefined, {
      return_actual_income: true
    });

    //Fix negative pops
    {
      getDemographics(user_id);
      for (var i = 0; i < all_pops.length; i++)
        usr.pops[`used_${all_pops[i]}`] = Math.max(usr.pops[`used_${all_pops[i]}`], 0);
    }

    //Initialise stats_string and other formatting strings
    var stats_string = [];
    var economy_string = [];
    var politics_string = [];
    var actions_string = [];

    //Fetch city list
    var cities = [];
    var ending_string = "";
    var name_array = [];
    var name_string = "";
    var owned_provinces = getProvinces(user_id, { include_hostile_occupations: true });
    var usr_provinces = getProvinces(user_id);

    usr.provinces = owned_provinces.length;

    //Append cities to list
    for (var i = 0; i < usr_provinces.length; i++)
      if (usr_provinces[i].type == "urban") {
        var local_city = usr_provinces[i];
        cities.push({
          name: local_city.name,
          population: local_city.population,
          type: local_city.city_type //Capital or regular city
        });
      }

    //Sort cities by population
    cities.sort(function (a, b) {
      return b.population - a.population;
    });

    var capital_included = false;
    for (var i = 0; i < cities.length; i++)
      if (i < 15) {
        if (cities[i].type == "capital") {
          capital_included = true;
          name_array.push(`**${cities[i].name}**`);
        } else {
          name_array.push(cities[i].name);
        }
      }

    if (name_array.length >= 2) {
      name_array[name_array.length-1] = `and ${name_array[name_array.length-1]}`;
      name_string = (name_array.length > 2) ? name_array.join(", ") : name_array.join(" ");
    } else {
      name_string = (name_array.length > 0) ? name_array[0] : "No cities.";
    }

    if (cities.length > name_array.length)
      ending_string = `, (+${cities.length - name_array.length} more)`;

    //Format embed
    stats_string.push(`${config.icons.globe} Country: **${usr.name}**`);
    stats_string.push(`<@${user_id}> | _${(usr.motto) ? usr.motto : "No motto set."}_`);

    if (has_no_provinces && !atWar(user_id))
      stats_string.push(`\n- Your country doesn't have any provinces currently! Consider typing **[Settle Starting Provinces]** to settle down your peoples.`);

    if (getVassal(user_id)) {
      stats_string.push("");
      stats_string.push(`We are a vassal of **${main.users[getVassal(user_id).overlord].name}**.`);
    }

    stats_string.push("");
    stats_string.push(`${config.icons.prestige} Prestige: **${parseNumber(usr.prestige)}** (${(usr.modifiers.prestige_gain > 0) ? "+" : ""}${usr.modifiers.prestige_gain} per turn)`);
    stats_string.push(`${config.icons.provinces} Provinces: **${parseNumber(usr.provinces)}**`);
    stats_string.push(`- **[Global Commands]** | **[View Customisation]** | **[View Modifiers]**`);
    if (all_national_modifiers.length > 0) {
      stats_string.push("");
      stats_string.push(`You currently have **${parseNumber(all_national_modifiers.length)}** National Modifier(s) active.`);
      stats_string.push(`- **[View National Modifiers]**`);
    }
    if (Object.keys(usr.temporary_modifiers).length > 0)
      stats_string.push(`- **[View Temporary Modifiers]**`);
    stats_string.push("");
    stats_string.push(`__**Population:**__`);
    stats_string.push(config.localisation.divider);
    stats_string.push(`${config.icons.development} Cities: (**${parseInt(getCities(user_id).length)}**/**${parseInt(getCitiesCap(user_id))}**): ${name_string}${ending_string}`);
    stats_string.push(`${config.icons.population} Population: **${parseNumber(getPopulation(user_id))}** (Requires ${config.icons.food} **${Math.ceil((usr.population/1000000)*config.defines.economy.food_required_per_million)}** food per turn)`);

    //Push all pops to stats menu if set to visible
    for (var i = 0; i < all_pops.length; i++) {
      var local_pop = config.pops[all_pops[i]];

      if (local_pop.stats_display)
        stats_string.push(`${(local_pop.icon) ? local_pop.icon + " " : ""} ${(local_pop.name) ? local_pop.name : all_pops[i]}: (**${parseNumber(usr.pops["used_" + all_pops[i]])}**/**${parseNumber(getTotalPopManpower(user_id, all_pops[i]))}**)${(local_pop.military_pop) ? " | (**" + printPercentage(getTotalPopManpower(user_id, all_pops[i], true)) + "** Recruitable Population)" : ""}`);
    }

    stats_string.push("");

    economy_string.push("");
    economy_string.push(`${config.icons.technology} Techs Researched: (**${parseNumber(usr.researched_technologies.length)}**/**${parseNumber(getAllTechnologies().length)}**)`);

    var money_string = (user_income[0] != user_income[1]) ?
      `${parseNumber(user_income[0])} - ${parseNumber(user_income[1])}` :
      parseNumber(user_income[0]);

    economy_string.push(`${config.icons.money} Money: **${parseNumber(usr.money)}** (${config.icons.money} **${money_string}** per turn).`);
    economy_string.push(`- **[Build]** | **[Inventory]** | **[Train Units]** `);
    economy_string.push("");

    politics_string.push("");
    try {
      politics_string.push(`${config.icons.government} Government Type: **${(config.governments[usr.government].name) ? config.governments[usr.government].name.toLowerCase() : usr.government}**`);

      //Check if country is in anarchy or not
      (config.governments[usr.government].is_anarchy) ?
        politics_string.push(`- Your country is currently in anarchy! Consider using **[Set Government]** to establish an effective government.\n`) :
        politics_string.push(`- **[Coup]** | **[Government List]**\n`);
    } catch {}
    politics_string.push(`${config.icons.political_capital} Political Capital: **${parseNumber(usr.modifiers.political_capital)}** (${parseNumber(political_capital_gain, { display_prefix: true })} per turn)`);

    //Add infamy section later
    politics_string.push(`${config.icons.infamy} Infamy: **${parseNumber(usr.modifiers.infamy, { display_float: true })}** (${parseNumber(usr.modifiers.infamy_loss, { display_float: true, display_prefix: true })} per turn)`);
    if (usr.modifiers.infamy > config.defines.infamy_limit)
      politics_string.push(`- Our current level of infamy is costing us **${printPercentage(usr.infamy_rgo_throughput)}** RGO Throughput and **${printPercentage(usr.infamy_production_efficiency)}** Production Eff.`);

    actions_string.push("");
    actions_string.push(`Your Actions may be used up to give you raw resources, or kept for taxable income. Each action is worth ${config.icons.money} **${parseNumber(config.defines.economy.money_per_action)}** at **100%** tax.`);
    actions_string.push(`- **${Math.ceil(usr.modifiers.civilian_actions*100)}%** of your actions will be used up by civilians next turn.`);
    actions_string.push("");
    actions_string.push(`${config.icons.actions} Actions: **${parseNumber(usr.actions)}** (**${(actions_amount[0] == actions_amount[1]) ? parseNumber(actions_amount[0], { display_prefix: true }) : parseNumber(actions_amount[0], { display_prefix: true }) + " - " + parseNumber(actions_amount[1])}** per turn)`);
    actions_string.push(`- **[Chop]** | **[Mine]** | **[Quarry]**`);

    //Remove control panel if one exists
    removeControlPanel(game_obj.id);

    //Create embed and edit to message
    const stats_embed = new Discord.MessageEmbed()
      .setColor(settings.bot_colour)
      .setTitle(`**National Overview:**`)
      .setThumbnail(usr.flag)
      .setImage("https://cdn.discordapp.com/attachments/722997700391338046/736141424315203634/margin.png")
      .setDescription(stats_string.join("\n"))
      .addFields(
        { name: "__Economy:__\n━━", value: economy_string.join("\n") },
        { name: "__Internal Politics:__\n━━", value: politics_string.join("\n") },
        { name: "__Actions:__\n━━", value: actions_string.join("\n") },
      );

    game_obj.main_embed = stats_embed;
    game_obj.main_change = true;
  }
};
