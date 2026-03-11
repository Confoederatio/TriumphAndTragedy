module.exports = {
  addAcceptedCulture: function (arg0_user, arg1_culture_name) {
    //Convert from parameters
    var user_id = arg0_user;
    var culture_name = arg1_culture_name.trim().toLowerCase();

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var culture_obj = getCulture(culture_name);
    var game_obj = getGameObject(user_id);
    var raw_culture_name = getCulture(culture_name, { return_key: true });
    var usr = main.users[actual_id];

    //Check to see if culture exists
    if (culture_obj) {
      if (
        !(culture_obj.primary_culture.includes(actual_id) ||
        culture_obj.accepted_culture.includes(actual_id))
      ) {
        if (usr.modifiers.political_capital >= config.defines.politics.accepted_culture_cost) {
          var integration_time = config.defines.politics.integration_turns;

          //Remove political capital first
          usr.modifiers.political_capital -= config.defines.politics.accepted_culture_cost;

          //Begin integration process
          usr.pops.cultural_integrations.push({
            culture_id: raw_culture_name,
            duration: integration_time
          });

          //Update culture screen if user is currently viewing it
          if (game_obj.page === "culture")
            createPageMenu(game_obj.middle_embed, {
              embed_pages: printCultures(user_id),
              user: game_obj.user
            });

          //Print user feedback
          printAlert(game_obj.id, `You have begun to integrate the **${culture_obj.adjective}** culture into your nation's societal fabric. Your analysts estimate that this will take up to **${parseNumber(integration_time)}** turns.`);
        } else {
          printError(game_obj.id, `You need ${config.icons.political_capital} **${parseNumber(config.defines.politics.accepted_culture_cost - usr.modifiers.political_capital)}** more Political Capital to begin integrating an entire culture into your societal fabric.`);
        }
      } else {
        printError(game_obj.id, `The **${culture_obj.name}** culture is already accepted in your country!`);
      }
    } else {
      printError(game_obj.id, `The culture you have specified could not be found anywhere in the world! Type **[View Cultures]** to see a list of all valid cultures.`);
    }
  },

  initialiseAddAcceptedCulture: function (arg0_user) {
    //Convert from parameters
    var user_id = arg0_user;

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var game_obj = getGameObject(user_id);
    var usr = main.users[actual_id];

    //Initialise visual prompt
    visualPrompt(game_obj.alert_embed, user_id, {
      title: "Add A New Accepted Culture:",
      prompts: [
        [`Which culture would you like to begin integrating into your nation's societal fabric?\n\nType **[View Cultures]** for a list of valid cultures.`, "string"]
      ]
    },
    function (arg) {
      module.exports.addAcceptedCulture(user_id, arg[0]);
    },
    function (arg) {
      switch (arg) {
        case "view cultures":
          createPageMenu(game_obj.middle_embed, {
            embed_pages: printCultures(user_id),
            user: game_obj.user
          });
          return true;

          break;
      }
    });
  }
};
