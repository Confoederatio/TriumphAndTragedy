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
    var country_name_taken = false;
    var processed_country_name = formaliseString(country_name);

    //Check to see if country name is already taken
    for (var i = 0; i < all_users.length; i++)
      country_name_taken = (processed_country_name == main.users[all_users[i]].name) ? true : country_name_taken;

    //Initialise user data
    if (!country_name_taken) {
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

      usr.culture = culture_id;

      main.global.cultures[culture_id] = {
        id: culture_id,
        name: processed_country_name,
        adjective: processed_country_name,

        primary_culture: [actual_id],
        accepted_culture: []
      };

      //Modify pops object
      usr.pops.accepted_cultures.push(culture_id);
      usr.pops.primary_culture = culture_id;

      //Check if enough players are there to start the game
      if (Object.keys(main.users).length >= config.defines.common.starting_players) {
        //Start the game
        main.season_started = true;
        reinitialiseGameEmbeds();
      }

      return usr;
    }
  },

  initialiseFoundCountry: function (arg0_user) {
    //Convert from parameters
    var user_id = arg0_user;

    //Declare local instance variables
    var game_obj = getGameObject(user_id);

    //Reinitialise visual prompt
    if (game_obj)
      visualPrompt(game_obj.alert_embed, user_id, {
        title: "Creating A New Nation ..",
        prompts: [
          [`What would you like to name your country?`, "string"]
        ],
        do_not_cancel: true
      },
      function (arg) {
        foundCountry(user_id, arg[0]);
      });
  }
};
