//Initialise Games/Lobbies UI
module.exports = {
  game_embeds: ["header", "middle_embed", "middle_control_panel", "bottom_control_panel", "alert_embed"],

  clearBadInterfaces: function () {
    //Declare local instance variables
    var all_interfaces = Object.keys(interfaces);

    //Check if game has a .channel field
    for (var i = 0; i < all_interfaces.length; i++) {
      var delete_channel = false;
      var local_ui = interfaces[all_interfaces[i]];

      //Check if UI has channel field but no channel
      if (local_ui.channel)
        if (!returnChannel(local_ui.channel)) {
          delete_channel = true;
        }

      //Check if UI is of type 'game' but has no .middle_embed
      if (local_ui.type == "game")
        if (!local_ui.middle_embed)
          delete_channel = true;

      if (delete_channel) {
        //Attempt to delete the channel
        var local_channel = returnChannel(local_ui.channel);

        if (local_channel)
          if (
            !settings.cache_channels.includes(local_ui.channel) &&
            !settings.ignore_channels.includes(local_ui.channel) &&
            local_ui.channel != settings.alert_channel &&
            local_channel.messages.cache.size < 50
          ) {
            try {
              clearGame(all_interfaces[i]);
            } catch {}

            local_channel.delete();
          }

        //Delete from interfaces
        delete interfaces[all_interfaces[i]];
        delete main.interfaces[all_interfaces[i]];
      }
    }
  },

  clearGame: function (arg0_game_id) {
    //Convert from parameters
    var game_id = arg0_game_id;
    var game_obj = main.interfaces[arg0_game_id];

    //Delete game channel first
    try {
        if (!game_obj) {
          delete interfaces[game_id];
          delete main.interfaces[game_id];
        }

        clearInterval(cache[`${game_id}_alert_loop`]);
        clearInterval(cache[`${game_id}_date_loop`]);
        clearInterval(cache[`${game_id}_header_loop`]);
        clearInterval(cache[`${game_id}_main_loop`]);

        if (game_obj)
          cache[`${game_id}_delete_loop`] = setInterval(function(channel_id) {
            try {
              if (game_obj.channel !== settings.alert_channel && main.game_channels.includes(game_obj.channel)) {
                var local_channel = returnChannel(channel_id);

                try {
                  local_channel.delete();
                } catch {}
                main.game_channels = removeElement(main.game_channels);

                //Delete game_obj as well
                delete interfaces[game_id];
                delete main.interfaces[game_id];
              }
            } catch {
              clearInterval(cache[`${game_id}_delete_loop`]);
            }
          }, 1000, JSON.parse(JSON.stringify(game_obj.channel)));
    } catch (e) {
      log.warn(`clearGame() - Game channel for Game ID ${game_id} could not be found: ${e}`);
      console.log(e);
    }

    //Declare local instance variables
    var all_interfaces = Object.keys(interfaces);

    //Iterate over all games to delete game
    for (var i = 0; i < all_interfaces.length; i++)
      if (interfaces[all_interfaces[i]].id == game_id)
        delete interfaces[all_interfaces[i]];

    //Delete game object
    delete interfaces[game_id];
    delete main.interfaces[game_id];
  },

  clearGames: function () {
    //Declare local instance variables
    var all_interfaces = Object.keys(interfaces);

    //Delete all game objects and associated channels
    for (var i = 0; i < all_interfaces.length; i++) {
      var local_game_obj = interfaces[all_interfaces[i]];

      if (local_game_obj.type == "game")
        clearGame(all_interfaces[i]);
    }
  },

  clearInterfaces: function () {
    //Declare local instance variables
    var all_interfaces = Object.keys(interfaces);

    //Clear games
    module.exports.clearGames();

    //Delete all interfaces
    for (var i = 0; i < all_interfaces.length; i++) {
      var local_ui = interfaces[all_interfaces[i]];

      main.interfaces = {};
      interfaces = {};
    }
  },

  createNewGame: function (arg0_user, arg1_message) {
    //Convert from parameters
    var user_id = arg0_user;
    var msg = arg1_message;

    //Declare local instance variables
    var has_game = (getGameObject(user_id));
    var server = msg.guild;

    try {
      if (!returnChannel(has_game.channel))
        has_game = false;
    } catch {}

    //Create new game channel
    if (!has_game) {
      var game_id = generateRandomID();

      //Create new game interface object
      interfaces[game_id] = {
        id: game_id,
        type: "game",
        user: user_id,

        cache: {}, //Used for storing interface position and temporary UI information
        collectors: [],
        last_active: new Date().getTime()
      };

      //Create new game channel
      server.channels.create(`tt-${username}`, {
        type: "text"
      }).then((channel) => {
        let category_obj = getGamesCategory(server);

        if (category_obj) {
          //Initialise channel
          channel.setParent(category_obj.id);
          channel.setTopic(`This is a private game channel for <@${user_id}> related to **Triumph & Tragedy**.\nCurrently in game.`);
          
          //Make channel private so that only the user who requested the channel can access it
          channel.permissionOverwrites.set([
            {
              id: user_id,
              allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
            },
            {
              id: settings.citizen_role,
              allow: ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY"]
            }
          ]);
          
          main.game_channels.push(channel.id);
          interfaces[game_id].channel = channel.id;
          interfaces[game_id].map = {};
          interfaces[game_id].page = (main.global.user_map[user_id]) ? "country_interface" : "founding_map";
          
          //Send confirmation message and initialise main menu embeds
          sendPlainEmbed(msg, `<@${user_id}> - Click <#${channel.id}> to begin playing.`);
          initialiseGameEmbeds(game_id);
        } else {
          sendPlainEmbed(msg, `:warning: A valid games category for this server could not be found.`);
        }
      });
    } else {
      sendPlainEmbed(msg, "You are already playing a concurrent game of **Triumph & Tragedy**!");
    }
  },
  
  getGamesCategory: function (arg0_server_obj) {
    //Convert from parameters
    let server_obj = arg0_server_obj;
    
    //Declare local instance variables
    let tt_categories = getList(global.settings.tt_category_id);
    
    if (server_obj instanceof Discord.Guild)
      for (let i = 0; i < tt_categories.length; i++) {
        let local_category_obj = server_obj.channels.cache.get(tt_categories[i]);
        
        //Return statement
        if (local_category_obj?.type === "GUILD_CATEGORY")
          return local_category_obj;
      }
  },

  initialiseGameEmbeds: function (arg0_game_id) {
    //Convert from parameters
    var game_id = arg0_game_id;
    var game_obj = interfaces[game_id];

    //Declare local instance variables
    var usr = main.users[game_obj.user];

    //Reset alert_array and collectors
    game_obj.alert_array = [];
    game_obj.collectors = [];

    //Initialise embeds
    const middle_embed = new Discord.MessageEmbed()
      .setColor(settings.bot_colour)
      .setImage("https://cdn.discordapp.com/attachments/722997700391338046/736141424315203634/margin.png")
      .setDescription("Nothing to see here.");
    const bottom_embed = new Discord.MessageEmbed()
      .setColor(settings.bot_colour)
      .setDescription("No recent alerts.")
      .setImage("https://cdn.discordapp.com/attachments/722997700391338046/736141424315203634/margin.png");

    //Send out the embeds!
    try {
      //Initialise message objects
      returnChannel(game_obj.channel).send(config.localisation.blank).then((message) => {
        game_obj.header = message;
      });

      //Main embed displaying stats screen
      returnChannel(game_obj.channel).send({ embeds: [middle_embed] }).then((message) => {
        game_obj.collectors.push(message.id);
        game_obj.middle_embed = message;
      });
      //Extra control panel elements
      returnChannel(game_obj.channel).send("https://cdn.discordapp.com/attachments/722997700391338046/736141424315203634/margin.png").then((message) => {
        game_obj.collectors.push(message.id);
        game_obj.middle_control_panel = message;
      });
      returnChannel(game_obj.channel).send("https://cdn.discordapp.com/attachments/722997700391338046/736141424315203634/margin.png").then((message) => {
        game_obj.collectors.push(message.id);
        game_obj.bottom_control_panel = message;
      });

      //Bottom embed displaying alerts
      returnChannel(game_obj.channel).send({ embeds: [bottom_embed] }).then((message) => {
        game_obj.alert_embed = message;

        //Begin processing page
        if (!["country_interface", "map", "founding_map"].includes(game_obj.page))
          game_obj.page = (main.global.user_map[game_obj.user]) ? "country_interface" : "founding_map";

        if (main.global.user_map[game_obj.user])
          if (main.users[main.global.user_map[game_obj.user]])
            game_obj.page = "country_interface";

        //Load up either the starting map viewer or country interface depending on the starting page
        switch (game_obj.page) {
          case "country_interface":
            if (main.season_started) {
              initialiseTopbar(game_obj.user);
              printStats(game_obj.user);
            } else {
              createPageMenu(game_obj.middle_embed, {
                embed_pages: printQueue(game_obj.user),
                user: game_obj.user
              });
            }

            break;
          case "map":
            initialiseTopbar(game_obj.user);

            break;
          case "founding_map":
            //Initialise map viewer and found country dialogue prompt
            initialiseMapViewer(game_id);
            if (game_obj.page == "founding_map")
              if (!main.global.user_map[game_obj.user]) {
                if (config.defines.common.enable_choose_countries && config.defines.common.enable_custom_countries) {
                  initialiseCountryMenu(game_obj.user);
                } else if (config.defines.common.enable_choose_countries) {
                  initialiseClaimCountry(game_obj.user);
                } else {
                  initialiseFoundCountry(game_obj.user);
                }
              } else {
                initialiseSettleStartingProvinces(game_obj.user);
              }

            break;
        }

        //Initialise game loops
        module.exports.initialiseGameLoop(game_id);
      });
    } catch {}
  },

  initialiseGameLoop: function (arg0_game_id) {
    //Convert from parameters
    var game_id = arg0_game_id;
    var game_obj = interfaces[game_id];

    //Declare local instance variables
    var game_channel = returnChannel(game_obj.channel);
    var usr = main.users[game_obj.user];

    //Alert loop
    cache[`${game_id}_alert_loop`] = setInterval(function(){
      if (game_channel) {
        try {
          var message_is_prompt = false;
          var all_visual_prompts = Object.keys(interfaces);

          //Check if message is subject to a current command prompt
          for (var i = 0; i < all_visual_prompts.length; i++) {
            var local_prompt = interfaces[all_visual_prompts[i]];
            if (local_prompt.type === "visual_prompt")
              if (local_prompt.message.id === game_obj.alert_embed.id)
                message_is_prompt = true;
          }

          //Only edit the message if the message is not a prompt.
          if (!message_is_prompt)
            if (game_obj.alert_change)
              updateAlert(game_obj.user, { freeze_alerts: game_obj.freeze_alerts });
        } catch (e) {
          if (settings.debug_mode) {
            //log.warn(`Ran into error on initialiseGameLoop()!`);
            //console.log(e);
          }
        }
      } else {
        clearInterval(cache[`${game_id}_alert_loop`]);
      }
    }, 100);

    //Date loop
    cache[`${game_id}_date_loop`] = setInterval(function(){
      if (game_channel) {
        var current_date = new Date().getTime();
        var time_remaining = settings.turn_timer*1000 - (current_date - main.last_turn);
        var update_allowed = false;

        if (!game_obj.last_updated_date) {
          update_allowed = true;
        } else if ((current_date - game_obj.last_updated_date) > 9500)
          update_allowed = true;

        //Rate-limit editing to once every 9,5 seconds
        if (update_allowed) {
          const topbar_embed = new Discord.MessageEmbed()
            .setColor(settings.bot_colour)
            .setTitle(`${config.icons.time} **${getDate(main.date)}** - Round ${parseNumber(main.round_count)}`)
            .setDescription(
              (main.season_started) ?
                `- Each round is approximately ${parseMilliseconds(settings.turn_timer*1000)}. ${parseMilliseconds(time_remaining)} remaining until the next turn.` :
                `This season has not yet started. Waiting on **${parseNumber(config.defines.common.starting_players - Object.keys(main.users).length)}** more player(s) for the game to start ..`
            )
            .setImage("https://cdn.discordapp.com/attachments/722997700391338046/736141424315203634/margin.png");

          try {
            if (returnChannel(game_obj.channel)) {
              game_obj.header.edit({ embeds: [topbar_embed] });

              if (game_obj.page == "founding_map")
                if (!main.global.user_map[game_obj.user]) {
                  if (game_obj.country_picker_page)
                    if (game_obj.country_picker_page == "claim_country") {
                      initialiseClaimCountry(game_obj.user);
                    } else if (game_obj.country_picker_page == "found_country") {
                      initialiseFoundCountry(game_obj.user);
                    } else {
                      initialiseCountryMenu(game_obj.user);
                    }
                } else {
                  initialiseSettleStartingProvinces(game_obj.user);
                }
            } else {
              if (game_obj)
                clearGame(game_id);
            }
          } catch {}

          //Refresh last updated date
          game_obj.last_updated_date = current_date;
        }
      } else {
        clearInterval(cache[`${game_id}_date_loop`]);
      }
    }, 10000);

    //Header loop
    cache[`${game_id}_header_loop`] = setInterval(function(){
      if (game_channel) {
        try {
          if (game_obj.header_change) {
            game_obj.header.edit({ embeds: [game_obj.new_header] });
            delete game_obj.header_change;
          }
        } catch {}
      } else {
        clearInterval(cache[`${game_id}_header_loop`]);
      }
    }, 100);

    //Main embed/panel loop
    cache[`${game_id}_main_loop`] = setInterval(function(){
      if (game_channel) {
        try {
          if (game_obj.main_change) {
            game_obj.middle_embed.edit({ embeds: [game_obj.main_embed] });
            game_obj.middle_embed.reactions.removeAll().catch(error => log.error(`Failed to clear reactions: ${error}.`));
            game_obj.main_change = false;
          }
        } catch {}
      } else {
        clearInterval(cache[`${game_id}_main_loop`]);
      }
    }, 100);
  },

  reinitialiseGameEmbeds: function () {
    //Regular error trapping
    try {
       //Declare local instance variables
       var all_interfaces = Object.keys(main.interfaces);
       var open_channels = [];

       //Reinitialise all game embeds
       for (var i = 0; i < all_interfaces.length; i++)
        if (main.interfaces[all_interfaces[i]].channel) {
          var local_channel_id = main.interfaces[all_interfaces[i]].channel;

          if (main.game_channels.includes(local_channel_id)) {
            var local_interface = all_interfaces[i];
            var local_ui = main.interfaces[all_interfaces[i]];

            //Set cache
            cache[local_ui.channel] = all_interfaces[i];

            //Try to fetch existing messages first
            var reinitialisation_loop = setInterval(function(local_ui, local_interface){
              if (local_ui.type === "game")
                if (returnChannel(local_ui.channel))
                  var local_messages = returnChannel(local_ui.channel).messages.fetch({ limit: 100 }).then((messages) => {
                    var all_messages = [...messages];
                    var fetched_game_embeds = [];

                    for (var x = 0; x < all_messages.length; x++) {
                      var is_game_embed = [false, ""];

                      try {
                        for (var y = 0; y < game_embeds.length; y++)
                          if (local_ui[game_embeds[y]].id === all_messages[x][0])
                            is_game_embed = [true, game_embeds[y]];

                        if (is_game_embed[0]) {
                          local_ui[is_game_embed[1]] = all_messages[x][1];
                          fetched_game_embeds.push(all_messages[x][0]);
                        }
                      } catch {}
                    }

                    //Initialise game loop
                    try {
                      module.exports.initialiseGameLoop(local_interface);
                    } catch {}

                    clearInterval(reinitialisation_loop);

                    for (var x = 0; x < all_messages.length; x++)
                      if (!fetched_game_embeds.includes(all_messages[x][0]))
                        try {
                          if (local_ui.channel !== settings.alert_channel)
                            if (!all_messages[x][1].author.bot)
                              all_messages[x][1].delete();
                        } catch {}
                  });
            }, 3000, local_ui, local_interface);
          }
        }

      //Clear all menus of type page_menu, visual_prompt, dead games
      for (var i = 0; i < all_interfaces.length; i++) {
        var local_ui = interfaces[all_interfaces[i]];

        if (!local_ui?.channel) {
          delete interfaces[all_interfaces[i]];
          delete main.interfaces[all_interfaces[i]];
        }
      }
    } catch (e) {
      log.error(`reinitialiseGameEmbeds() ran into an error: ${e}.`);
      console.log(e);
    }
  }
};
