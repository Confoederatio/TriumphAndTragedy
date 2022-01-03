module.exports = {
  /*
    addTemporaryModifier() - Creates and adds a new temporary modifier to the user
    options: {
      type: "stability_modifier",
      value: 0.15,
      duration: 5 //How long the target modifier should last for, -1 if permanent
    }
  */
  addTemporaryModifier: function (arg0_user, arg1_options) {
    //Convert from parameters
    var user_id = arg0_user;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var usr = main.users[user_id];

    //Push temporary modifier to object
    var modifier_id = module.exports.generateTemporaryModifierID();

    usr.temporary_modifiers[modifier_id] = {
      type: options.type,
      value: options.value,
      duration: (options.duration) ? (options.duration) : -1
    };

    //Immediately apply the current modifiers to user
    module.exports.applyModifiers(actual_id, {
      [options.type]: options.value
    });
  },

  applyModifiers: function (arg0_user, arg1_scope) {
    //Convert from parameters
    var user_id = arg0_user;
    var modifiers = arg1_scope;

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var all_modifiers = Object.keys(modifiers);
    var usr = main.users[user_id];

    //Begin parsing
    for (var i = 0; i < all_modifiers.length; i++)
      //Check if the modifier in question actually exists before incrementing
      if (usr.modifiers[all_modifiers[i]]) {
        usr.modifiers[all_modifiers[i]] += modifiers[all_modifiers[i]];
      } else if (usr[all_modifiers[i]]) {
        var is_government = Object.keys(config.governments).includes(all_modifiers[i]);
        var modifier_value = modifiers[all_modifiers[i]];

        if (is_government) {
          usr.politics[all_modifiers[i]].drift += modifier_value;
        } else {
          usr[all_modifiers[i]] += modifier_value;
        }
      }
  },

  generateTemporaryModifierID: function (arg0_user) {
    //Convert from parameters
    var user_id = arg0_user;

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var usr = main.users[actual_id];

    var local_id;

    //While loop to find ID, just in-case of conflicting random ID's:
    while (true) {
      var local_id = generateRandomID();

      //Return and break once a true ID is found
      if (!usr.temporary_modifiers[local_id]) {
        return local_id;
        break;
      }
    }
  },

  /*
    Returns either an object or key list of all available modifiers.
    options: {
      return_names: true/false - Whether or not to return modifier keys instead of objects
    }
  */
  getAllModifiers: function (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var modifier_dump = [];

    //Iterate through all modifier keys, 1st layer
    var all_modifiers = Object.keys(config.modifiers);

    for (var i = 0; i < all_modifiers.length; i++) {
      var local_modifier = config.modifiers[all_modifiers[i]];
      //Push base modifier
      (!options.return_names) ?
        modifier_dump.push(local_modifier) :
        modifier_dump.push(all_modifiers[i]);

      //Iterate over all submodifier keys if they exist (2nd layer)
      var all_modifier_keys = Object.keys(local_modifier);

      for (var x = 0; x < all_modifier_keys.length; x++)
        if (all_modifier_keys[x].startsWith("create_modifier_"))
          (!options.return_names) ?
            modifier_dump.push(local_modifier[all_modifier_keys[x]]) :
            modifier_dump.push(all_modifier_keys[x]);
    }

    //Return statement
    return modifier_dump;
  },

  getGovernmentStabilityModifier: function (arg0_user) {
    //Convert from parameters
    var user_id = arg0_user;

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var usr = main.users[user_id];

    var government_stability_modifier = 0;
    var ruling_government_obj = config.governments[usr.government];

    if (ruling_government_obj.effect.stability_modifier)
      government_stability_modifier = ruling_government_obj.effect.stability_modifier;

    if (ruling_government_obj.effect.add_expiry_effect)
      if (ruling_government_obj.effect.add_expiry_effect.stability_modifier)
        if (ruling_government_obj.effect.add_expiry_effect.limit.year_is_less_than) {
          if (main.date.year < ruling_government_obj.effect.add_expiry_effect.limit.year_is_less_than)
            government_stability_modifier = ruling_government_obj.effect.add_expiry_effect.stability_modifier;
        } else if (ruling_government_obj.effect.add_expiry_effect.limit.year_is_greater_than) {
          if (main.date.year > ruling_government_obj.effect.add_expiry_effect.limit.year_is_greater_than)
            government_stability_modifier = ruling_government_obj.effect.add_expiry_effect.stability_modifier;
        }

    //Return statement
    return government_stability_modifier;
  },

  /*
    getModifier() - Gets either the modifier object or key.
    options: {
      return_key: true/false - Whether or not to return the modifier key
    }
  */
  getModifier: function (arg0_modifier_name, arg1_options) {
    //Convert from parameters
    var modifier_name = arg0_modifier_name.toLowerCase();
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var all_modifiers = Object.keys(config.modifiers);
    var modifier_exists = [false, ""]; //[modifier_exists, modifier_key/object]

    //1st-level Modifier processing
    {
      {
        //Key, soft match
        for (var i = 0; i < all_modifiers.length; i++)
          if (all_modifiers[i].toLowerCase().indexOf(modifier_name) != -1)
            modifier_exists = [true, (!options.return_key) ? config.modifiers[all_modifiers[i]] : all_modifiers[i]];

        //Key, hard match
        for (var i = 0; i < all_modifiers.length; i++)
          if (all_modifiers[i].toLowerCase() == modifier_name)
            modifier_exists = [true, (!options.return_key) ? config.modifiers[all_modifiers[i]] : all_modifiers[i]];
      }

      if (!modifier_exists[0]) {
        //Name, soft match
        for (var i = 0; i < all_modifiers.length; i++) {
          var local_modifier = config.modifiers[all_modifiers[i]];

          if (local_modifier.name)
            if (local_modifier.name.toLowerCase().indexOf(modifier_name) != -1)
              modifier_exists = [true, (!options.return_key) ? config.modifiers[all_modifiers[i]] : all_modifiers[i]];
        }

        //Name, hard match
        for (var i = 0; i < all_modifiers.length; i++) {
          var local_modifier = config.modifiers[all_modifiers[i]];

          if (local_modifier.name)
            if (local_modifier.name.toLowerCase() == modifier_name)
              modifier_exists = [true, (!options.return_key) ? config.modifiers[all_modifiers[i]] : all_modifiers[i]];
        }
      }
    }

    //2nd-level Submodifier processing
    {
      {
        //Key, soft match
        if (!modifier_exists[0])
          for (var i = 0; i < all_modifiers.length; i++) {
            var local_modifier = config.modifiers[all_modifiers[i]];
            var local_modifier_keys = Object.keys(local_modifier);

            for (var x = 0; x < local_modifier_keys.length; x++)
              if (local_modifier_keys[x].startsWith("create_modifier_"))
                if (local_modifier_keys[x].replace("create_modifier_", "").indexOf(modifier_name) != -1)
                  modifier_exists = [true, (!options.return_key) ? local_modifier[local_modifier_keys[x]] : local_modifier_keys[x]];
          }

        //Key, hard match
        for (var i = 0; i < all_modifiers.length; i++) {
          var local_modifier = config.modifiers[all_modifiers[i]];
          var local_modifier_keys = Object.keys(local_modifier);

          for (var x = 0; x < local_modifier_keys.length; x++)
            if (local_modifier_keys[x].startsWith("create_modifier_"))
              if (local_modifier_keys[x].replace("create_modifier_", "") == modifier_name)
                modifier_exists = [true, (!options.return_key) ? local_modifier[local_modifier_keys[x]] : local_modifier_keys[x]];
        }
      }

      //Name, soft match
      if (!modifier_exists[0]) {
        for (var i = 0; i < all_modifiers.length; i++) {
          var local_modifier = config.modifiers[all_modifiers[i]];
          var local_modifier_keys = Object.keys(local_modifier);

          for (var x = 0; x < local_modifier_keys.length; x++) {
            if (local_modifier_keys[x].startsWith("create_modifier_")) {
              var local_submodifier = local_modifier[local_modifier_keys[x]];

              if (local_submodifier.name.indexOf(modifier_name) != -1)
                modifier_exists = [true, (!options.return_key) ? local_submodifier : local_modifier_keys[x]];
            }
          }
        }

        //Name, hard match
        for (var i = 0; i < all_modifiers.length; i++) {
          var local_modifier = config.modifiers[all_modifiers[i]];
          var local_modifier_keys = Object.keys(local_modifier);

          for (var x = 0; x < local_modifier_keys.length; x++) {
            if (local_modifier_keys[x].startsWith("create_modifier_")) {
              var local_submodifier = local_modifier[local_modifier_keys[x]];

              if (local_submodifier.name.toLowerCase() == modifier_name)
                modifier_exists = [true, (!options.return_key) ? local_submodifier : local_modifier_keys[x]];
            }
          }
        }
      }
    }

    //Return statement
    return (modifier_exists[0]) ? modifier_exists[1] : undefined;
  },

  //Parses modifiers to a string
  parseModifiers: function (arg0_modifier_obj) {
    //Convert from parameters
    var modifier_obj = arg0_modifier_obj;

    //Declare local instance variables
    var all_modifier_keys = Object.keys(modifier_obj);
    var modifier_string = [];

    //Format modifier_string
    for (var i = 0; i < all_modifier_keys.length; i++) {
      var local_modifier = module.exports.getModifier(all_modifier_keys[i]);
      var local_modifier_name;
      var local_value = getList(modifier_obj[all_modifier_keys[i]]);

      //Fetch local_modifier_name
      if (local_modifier) {
        local_modifier_name = (local_modifier.name) ? local_modifier.name : all_modifier_keys[i];
      } else {
        //Substantiate dummy local_modifier variables if not found
        local_modifier = { name: "" };
        local_modifier_name = "undefined";
      }

      switch (local_modifier.type) {
        case "integer":
          //Parse modifier as integer
          modifier_string.push(`• **${parseNumber(local_value[0], { display_prefix: true })}** ${local_modifier_name}`);

          break;
        case "percentage":
        default:
          //By default a modifier is parsed as percentage, but only if it is not an effect
          switch (all_modifier_keys[i]) {
            //Effect blocks
            case "obsolete_building":
              var building_names = [];
              for (var i = 0; i < local_value.length; i++)
                building_names.push(
                  (getBuilding(local_value[i]).name) ?
                    getBuilding(local_value[i]).name :
                    local_value[i]
                )

              modifier_string.push(`• Obsoletes **${building_names.join(", ")}**`);

              break;
            case "obsolete_government":
              var government_names = [];
              for (var i = 0; i < local_value.length; i++)
                government_names.push(
                  (config.governments[local_value[i]].name) ?
                    config.governments[local_value[i]].name :
                    local_value[i]
                )

              modifier_string.push(`• Obsoletes **${government_names.join(", ")}**`);

              break;
            case "obsolete_reform":
              var reform_names = [];
              for (var i = 0; i < local_value.length; i++)
                government_names.push(
                  (getReform(local_value[i]).name) ?
                    getReform(local_value[i]).name :
                    local_value[i]
                );

              modifier_string.push(`• Obsoletes **${reform_names.join(", ")}**`);

              break;
            case "obsolete_unit":
              var unit_names = [];
              for (var i = 0; i < local_value.length; i++)
                unit_names.push(
                  (getUnit(local_value[i]).name) ?
                    getUnit(local_value[i]).name :
                    local_value[i]
                );

              modifier_string.push(`• Obsoletes **${unit_names.join(", ")}**`);

              break;

            case "unlock_building":
              var building_names = [];
              for (var i = 0; i < local_value.length; i++)
                building_names.push(
                  (getBuilding(local_value[i]).name) ?
                    getBuilding(local_value[i]).name :
                    local_value[i]
                );

              modifier_string.push(`• Enables **${building_names.join(", ")}**`);

              break;
            case "unlock_government":
              var government_names = [];
              for (var i = 0; i < local_value.length; i++)
                government_names.push(
                  (getGovernment(local_value[i]).name) ?
                    getGovernment(local_value[i]).name :
                    local_value[i]
                );

              modifier_string.push(`• Unlocks **${government_names.join(", ")}**`);

              break;
            case "unlock_reform":
              var reform_names = [];
              for (var i = 0; i < local_value.length; i++)
                reform_names.push(
                  (getReform(local_value[i]).name) ?
                    getReform(local_value[i]).name :
                    local_value[i]
                );

              modifier_string.push(`• Unlocks **${reform_names.join(", ")}**`);

              break;
            case "unlock_unit":
              var unit_names = [];
              for (var i = 0; i < local_value.length; i++)
                unit_names.push(
                  (getUnit(local_value[i]).name) ?
                    getUnit(local_value[i]).name :
                    local_value[i]
                );

              modifier_string.push(`• Enables **${unit_names.join(", ")}**`);

              break;

            //Default parser
            default:
              modifier_string.push(`• **${printPercentage(local_value[0], {
                display_prefix: true,
                base_zero: true
              })}** ${local_modifier_name}`);

              break;
          }

          break;
      }
    }

    //Return statement
    return modifier_string.join("\n");
  },

  parseStabilityModifier: function (arg0_user) { //[WIP] - Finish parsing stability string
    //Convert from parameters
    var user_id = arg0_user;

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var usr = main.users[actual_id];

    //Declare stability_string
    var stability_string = [];

    //Same variable calculation from turn_framework.js
    var government_stability_modifier = module.exports.getGovernmentStabilityModifier(actual_id);
    var popularity_stability_modifier = usr.politics[usr.government].popularity*0.75;

    //Print out all individual modifiers first
    if (government_stability_modifier != 0)
      stability_string.push(`• **${printPercentage(government_stability_modifier, { display_prefix: true })}** due to ${config.governments[usr.government].name} being in power.`);
    if (usr.tax_rate > 0)
      stability_string.push(`• **${printPercentage(usr.tax_rate*-1, { display_prefix: true })}** from current tax rate.`);
    if (returnSafeNumber(usr.boosted_stability) > 0)
      stability_string.push(`• **${printPercentage(usr.boosted_stability, { display_prefix: true })}** from boosted stability. (**-1%** per turn).`);
    if (usr.modifiers.overextension != 0)
      stability_string.push(`• **${printPercentage(Math.ceil(usr.modifiers.overextension*-1, { display_prefix: true }))}** from overextension.`);

    //Print base stability
    stability_string.push(`• **${printPercentage(usr.modifiers.stability_modifier, { display_prefix: true })}** base stability modifier.`);

    //Return statement
    return stability_string.join("\n");
  }
};
