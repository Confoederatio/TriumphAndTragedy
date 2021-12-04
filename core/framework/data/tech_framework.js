module.exports = {
  /*
    getAllTechnologies() - Fetches an array of all valid technologies.
    options: {
      return_names: true/false - Whether or not to return the keys of the categories instead of the object.
    }
  */
  getAllTechnologies: function (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var all_tech_categories = Object.keys(config.technology);
    var tech_array = [];

    //Iterate over all categories and their respective keys
    for (var i = 0; i < all_tech_categories.length; i++) {
      var local_category = config.technology[all_tech_categories[i]];
      var local_techs = Object.keys(local_category);

      for (var x = 0; x < local_techs.length; x++)
        tech_array.push((!options.return_names) ? local_category[local_techs[x]] : local_techs[x]);
    }

    //Return statement
    return tech_array;
  },

  getKnowledgeGain: function (arg0_user) {
    //Convert from parameters
    var user_id = arg0_user;

    //Declare local tracker variables
    var all_pops = Object.keys(config.pops);
    var local_knowledge_production = (getProduction(user_id, "knowledge")) ?
      getProduction(user_id, "knowledge") :
      [0, 0];
    var pop_knowledge_gain = 0;

    //Fetch pop_knowledge_gain
    for (var i = 0; i < all_pops.length; i++) {
      var local_pop = config.pops[all_pops[i]];

      if (local_pop.per_100k)
        if (local_pop.per_100k.knowledge)
          pop_knowledge_gain += (getTotalPopManpower(user_id, all_pops[i])/100000)*local_pop.per_100k.knowledge;
    }

    //Make sure you can't just gain unlimited knowledge from faculty (hard cap)
    if (pop_knowledge_gain > 500)
      pop_knowledge_gain = 500;

    local_knowledge_production = [
      local_knowledge_production[0] + pop_knowledge_gain,
      local_knowledge_production[1] + pop_knowledge_gain
    ];

    //Return statement
    return local_knowledge_production;
  },

  /*
    getTechnology() - Fetches a technology object/key depending on its options.
    options: {
      return_key: true/false - Whether or not to return a key from the object
    }
  */
  getTechnology: function (arg0_name, arg1_options) {
    //Convert from parameters
    var tech_name = arg0_name.toLowerCase();
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var all_tech_categories = Object.keys(config.technology);
    var technology_exists = [false, ""]; //[technology_exists, technology_name/object];

    //Iterate over all categories and their respective keys
    {
      //Key name, soft match
      for (var i = 0; i < all_tech_categories.length; i++) {
        var local_category = config.techology[all_tech_categories[i]];
        var local_techs = Object.keys(local_category);

        for (var x = 0; x < local_techs.length; x++)
          if (local_techs[x].toLowerCase().indexOf(tech_name) != -1)
            technology_exists = [true, (!options.return_key) ? local_category[local_techs[x]] : local_techs[x]];
      }

      //Key name, hard match
      for (var i = 0; i < all_tech_categories.length; i++) {
        var local_category = config.techology[all_tech_categories[i]];
        var local_techs = Object.keys(local_category);

        for (var x = 0; x < local_techs.length; x++)
          if (local_techs[x].toLowerCase() == tech_name)
            technology_exists = [true, (!options.return_key) ? local_category[local_techs[x]] : local_techs[x]];
      }

      //Move on to regular tech names if technology still isn't found
      if (!technology_exists[0]) {
        //Tech name, soft match
        for (var i = 0; i < all_tech_categories.length; i++) {
          var local_category = config.technology[all_tech_categories[i]];
          var local_techs = Object.keys(local_category);

          for (var x = 0; x < local_techs.length; x++) {
            var local_tech = local_category[local_techs[x]];

            if (local_tech.name)
              if (local_tech.name.toLowerCase().indexOf(tech_name) != -1)
                technology_exists = [true, (!options.return_key) ? local_tech : local_techs[x]];
          }
        }

        //Tech name, hard match
        for (var i = 0; i < all_tech_categories.length; i++) {
          var local_category = config.technology[all_tech_categories[i]];
          var local_techs = Object.keys(local_category);

          for (var x = 0; x < local_techs.length; x++) {
            var local_tech = local_category[local_techs[x]];

            if (local_tech.name)
              if (local_tech.name.toLowerCase() == tech_name)
                technology_exists = [true, (!options.return_key) ? local_tech : local_techs[x]];
          }
        }
      }
    }

    //Return statement
    return (technology_exists[0]) ? technology_exists[1] : undefined;
  },

  getTechnologyCost: function (arg0_name) {
    //Convert from parameters
    var tech_obj = module.exports.getTechnology(arg0_name);

    //Ahead of time penalty calculations (AOT)
    var aot_penalty = 0;
    var ahead_of_time_config = config.defines.technology.ahead_of_time;
    var final_aot_penalty = 1;
    var has_aot_penalty = false;

    for (var y = 0; y < ahead_of_time_config; y++)
      if (main.date.year >= ahead_of_time_config[y][0] && main.date.year < ahead_of_time_config[y][1])
        aot_penalty = 2/ahead_of_time_config[y][2];

    if (tech_obj.year) {
      var aot_years = 0;

      if (main.date.year < tech_obj.year) {
        has_aot_penalty = true;
        aot_years = tech_obj.year - main.date.year;
        final_aot_penalty = (aot_years*aot_penalty) + 1;
      }
    }

    //Return total research cost
    return Math.round(tech_obj.research_cost*final_aot_penalty);
  },

  //parseTechnology() - Parses the technological effects of a given tech for a given user. (Used primarily after the research of a tech has been finished)
  parseTechnology: function (arg0_user, arg1_technology_name) {
    //Convert from parameters
    var usr = main.users[arg0_user];
    var raw_technology_name = arg1_technology_name.toLowerCase();

    //Declare local instance variables
    var tech_obj = module.exports.getTechnology(arg1_technology_name);

    //Parse technology for user!
    var all_effects = Object.keys(tech_obj.unlocks);

    for (var i = 0; i < all_effects.length; i++) {
      //Declare local tracker variables
      var effect_name = all_effects[i];
      var effect_value = tech_obj.unlocks[effect_name];

      //
    }
  }
};
