module.exports = {
  foundCountry: function (arg0_user, arg1_name) {
    //Convert from parameters
    var user_id = arg0_user;
    var country_name = arg1_name;

    //Declare local instance variables
    var actual_id = JSON.parse(JSON.stringify(user_id));
    var game_obj = getGameObject(user_id);

    if (main.users[user_id])
      while (true) {
        var local_id_suffix = generateRandomID();

        var full_id = `${user_id}-${local_id_suffix}`;

        //Return and break once a true ID is found
        if (!main.users[full_id]) {
          actual_id = full_id;
          break;
        }
      }

    //Delayed registration
    var just_registered = (!main.users[actual_id]);

    if (just_registered) {
      //Initialise user data
      var usr = module.exports.initCountry(actual_id, country_name);

      //Send message affirming successful registration if in game
      if (usr && game_obj) {
        printAlert(game_obj.id, `You have successfully founded the nation of **${country_name}**!`);

        //Set settling flag
        usr.settle_starting_provinces = true;

        setTimeout(function(){
          initialiseSettleStartingProvinces(user_id);
        }, settings.visual_prompt_delay);
      } else {
        printError(game_obj.alert_embed, `The previous country name you tried to name your people, **${country_name}**, was already taken by another player!`);

        setTimeout(function(){
          module.exports.initialiseFoundCountry(user_id);
        }, settings.visual_prompt_delay);
      }

      //Set valid user map (this can be used later on for co-op and AI tags):
      main.global.user_map[user_id] = actual_id;
    }
  },

  initCountry: function (arg0_user, arg1_name) {
    //Convert from parameters
    var user_id = arg0_user;
    var country_name = arg1_name;

    //Declare local instance variables
    var all_users = Object.keys(main.users);
    var actual_id = JSON.parse(JSON.stringify(user_id));
    var game_obj = getGameObject(user_id);
    var processed_country_name = formaliseString(country_name);
    var valid_country_name = isValidCountryName(processed_country_name);

    //Check if country name is valid
    if (valid_country_name[0]) {
      //Check if user already exists
      if (main.users[actual_id])
        actual_id = generateUserID();

      initUser(actual_id);
      var usr = main.users[actual_id];

      //Automatically map the user ID of the initialiser
      main.global.user_map[user_id] = actual_id;

      //Set name of country
      usr.name = processed_country_name;

      //Set owner
      usr.owner = user_id;

      //Add new culture object to main.global
      var culture_id = generateCultureID();

      //Initialise culture
      initCulture(user_id, culture_id);

      //Check if enough players are there to start the game
      if (Object.keys(main.users).length >= config.defines.common.starting_players) {
        //Start the game
        main.season_started = true;
        reinitialiseGameEmbeds();
      }

      //New country has been initialised, send this data to all workers
      syncWorkersToMaster();

      return usr;
    } else {
      //Print out country name error
      if (game_obj)
        printError(game_obj.alert_embed, valid_country_name[1]);
    }
  },

  initialiseCountryMenu: function (arg0_user) {
    //Convert from parameters
    var user_id = arg0_user;

    //Declare local instance variables
    var game_obj = getGameObject(user_id);

    //Mark page
    if (!main.global.user_map[user_id]) {
      try {
        game_obj.country_picker_page = "country_menu";

        //Initialise visual prompt
        if (game_obj)
          visualPrompt(game_obj.alert_embed, user_id, {
            title: `Pick A Country:`,
            prompts: [
              [`Would you like to pick an existing country to play as, or create a country of your own?\n\nType **[Pick An Existing Country]** to pick an unclaimed country.\nType **[Create A New Country]** to pick a new country to play as.\n\nType **[Quit Game]** to close this channel instead.`, "string"]
            ],
            do_not_cancel: true
          },
          function (arg) {
            //Check to see if input is valid
            switch (arg[0].toLowerCase()) {
              case "create country":
              case "create a new country":
                module.exports.initialiseFoundCountry(user_id);

                break;
              case "pick existing country":
              case "pick an existing country":
                module.exports.initialiseClaimCountry(user_id);

                break;
              case "exit":
              case "exit game":
              case "quit":
              case "quit game":
                break;
              default:
                printError(game_obj.id, `You must specify a valid option!\n\nEither **[Pick an Existing Country]** to play as, or **[Create A New Country]**.`);

                setTimeout(function(){
                  module.exports.initialiseCountryMenu(user_id);
                }, 3000);

                break;
            }
          });
      } catch {}
    } else {
      delete game_obj.country_picker_page;
    }
  },

  initialiseClaimCountry: function (arg0_user) {
    //Convert from parameters
    var user_id = arg0_user;

    //Declare local instance variables
    var all_users = Object.keys(main.users);
    var game_obj = getGameObject(user_id);
    var has_previous_menu = (config.defines.common.enable_choose_countries && config.defines.common.enable_custom_countries);
    var unclaimed_countries = [];
    var unclaimed_country_string = [];

    //Fetch array of unclaimed countries
    for (var i = 0; i < all_users.length; i++) {
      var local_users = getUsers(all_users[i]);

      if (local_users.length == 0 && !getVassal(all_users[i]))
        unclaimed_countries.push(all_users[i]);
    }

    if (unclaimed_countries.length > 0)
      for (var i = 0; i < unclaimed_countries.length; i++)
        unclaimed_country_string.push(`- **${main.users[unclaimed_countries[i]].name}**`);
    else
      unclaimed_country_string.push(`_No unclaimed countries are currently available to be played._`);

    //Mark page
    if (!main.global.user_map[user_id])
      game_obj.country_picker_page = "claim_country";

    //Initialise visual prompt
    if (game_obj)
      visualPrompt(game_obj.alert_embed, user_id, {
        title: `Claim An Existing Nation ..`,
        prompts: [
          [`Which country would you like to choose? The following countries have no players on them:\n\n${unclaimed_country_string.join("\n")}${(has_previous_menu) ? `\n\nType **[Back]** if you wish to create a custom country instead.` : ""}`, "mention"]
        ],
        do_not_cancel: true
      },
      function (arg) {
        var reload_interface = false;

        if (unclaimed_countries.includes(arg[0])) {
          main.global.user_map[user_id] = arg[0];

          printAlert(game_obj.id, `You have successfully claimed the nation of **${main.users[arg[0]].name}** for yourself.`);

          //Reload all maps, initialise user topbar
          reloadAllMaps("political");
          game_obj.page = "country_interface";
          delete game_obj.country_picker_page;

          //Open country interface
          setTimeout(function(){
            if (main.season_started) {
              initialiseTopbar(user_id);
              printStats(user_id);
            } else {
              createPageMenu(game_obj.middle_embed, {
                embed_pages: printQueue(user_id),
                user: user_id
              });
            }
          }, 3000);
        } else {
          printError(game_obj.id, `The country you have specified, **${arg[0]}**, was not available to be claimed!`);
          reload_interface = true;
        }

        if (reload_interface)
          setTimeout(function(){
            module.exports.initialiseClaimCountry(user_id);
          }, 3000);
      },
      function (arg) {
        switch (arg) {
          case "back":
          case "cancel":
            if (has_previous_menu) {
              module.exports.initialiseCountryMenu(user_id);

              return true;
            }

            break;
        }
      });
  },

  initialiseFoundCountry: function (arg0_user) {
    //Convert from parameters
    var user_id = arg0_user;

    //Declare local instance variables
    var game_obj = getGameObject(user_id);
    var has_previous_menu = (config.defines.common.enable_choose_countries && config.defines.common.enable_custom_countries);

    //Mark page
    if (!main.global.user_map[user_id])
      game_obj.country_picker_page = "found_country";

    //Reinitialise visual prompt
    if (game_obj)
      visualPrompt(game_obj.alert_embed, user_id, {
        title: "Creating A New Nation ..",
        prompts: [
          [`What would you like to name your country?${(has_previous_menu) ? `\n\nType **[Back]** if you wish to pick an unclaimed country instead.` : ""}`, "string"]
        ],
        do_not_cancel: true
      },
      function (arg) {
        foundCountry(user_id, arg[0]);
        delete game_obj.country_picker_page;
      },
      function (arg) {
        switch (arg) {
          case "back":
          case "cancel":
            if (has_previous_menu) {
              module.exports.initialiseCountryMenu(user_id);

              return true;
            }

            break;
        }
      });
  }
};
