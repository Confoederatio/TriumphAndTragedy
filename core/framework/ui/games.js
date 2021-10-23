//Initialise Games/Lobbies UI
module.exports = {
  createNewGame: function (arg0_user, arg1_message) {
    //Convert from parameters
    var user_id = arg0_user;
    var msg = message;

    //Create new game channel
    if (!getGame(usr)) {
      var game_id = generateRandomID();

      //Create new game interface object
      interfaces[game_id] = {
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
        var category_id = settings.tt_category_id;

        //Initialise channel
        channel.setParent(category_id);
        channel.setTopic(`This is a private game channel for <@${user_id}> related to **Triumph & Tragedy**.\nCurrently in game.`);

        //Make channel private so that only the user who requested the channel can access it
        channel.permissionOverwrites.set([
          {
            id: user_id,
            allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
          }
        ]);

        interfaces[game_id].channel = channel.id;
        interfaces[game_id].page = (main.users[user_id]) ? "country_interface" : "founding_map";

        //Send confirmation message and initialise main menu embeds
        sendPlainEmbed(msg, `<@${user_id}> - Click <#${channel.id}> to begin playing.`);
        intiialiseGameEmbeds(game_id);
      });
    } else {
      sendPlainEmbed(msg, "You are already playing a concurrent game of **Triumph & Tragedy**!");
    }
  },

  initialiseGameEmbeds: function (arg0_game_id) {
    //Convert from parameters
    var game_id = arg0_game_id;
    var game_obj = interfaces[game_id];

    game_obj.alert_array = [];
    var usr = main.users[game_obj.user];

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

        setInterval(function(){
          if (game_obj.header_change) {
            message.edit({ embeds: [game_obj.new_header] });
            delete game_obj.header_change;
          }
        }, 100);
      });

      //Main embed displaying stats screen
      returnChannel(game_obj.channel).send({ embeds: [middle_embed] }).then((message) => {
        game_obj.collectors.push(message.id);
        game_obj.middle_embed = message;

        setInterval(function(){
          if (game_obj.main_change) {
            message.edit({ embeds: [game_obj.main_embed] });
            message.reactions.removeAll().catch(error => log.error(`Failed to clear reactions: ${error}.`));
            game_obj.main_change = false;
          }
        }, 100);
      });
      //Extra control panel elements
      returnChannel(game_obj.channel).send(config.localisation.blank).then((message) => {
        game_obj.collectors.push(message.id);
        game_obj.middle_control_panel = message;
      });
      returnChannel(game_obj.channel).send(config.localisation.blank).then((message) => {
        game_obj.collectors.push(message.id);
        game_obj.bottom_control_panel = message;
      });

      //Bottom embed displaying alerts
      returnChannel(game_obj.channel).send({ embeds: [bottom_embed] }).then((message) => {
        game_obj.alert_embed = message;

        setInterval(function(){
            var message_is_prompt = false;
            var all_visual_prompts = Object.keys(visual_prompts);

            //Check if message is subject to a current command prompt
            for (var i = 0; i < all_visual_prompts.length; i++) {
              var local_prompt = visual_prompts[all_visual_prompts[i]];
              if (local_prompt.message.id == message.id) {
                message_is_prompt = true;
              }
            }

            //Only edit the message if the message is not a prompt.
            if (!message_is_prompt) {
              if (game_obj.alert_change) {
                if (game_obj.alert_array.length == 0) {
                  const new_alert_embed = new Discord.MessageEmbed()
                    .setColor(settings.bot_colour)
                    .setDescription("No new alerts.")
                    .setImage("https://cdn.discordapp.com/attachments/722997700391338046/736141424315203634/margin.png");

                  message.edit({ embeds: [new_alert_embed] });
                } else {
                  const new_alert_embed = new Discord.MessageEmbed()
                    .setColor(settings.bot_colour)
                    .setDescription(game_obj.alert_array.join("\n"))
                    .setImage("https://cdn.discordapp.com/attachments/722997700391338046/736141424315203634/margin.png");

                  message.edit({ embeds: [new_alert_embed] });
                }
                game_obj.alert_change = false;
              }
            }
          }, 100);
      });

      //Load up either the starting map viewer or country interface depending on the starting page
      switch (game_obj.page) {
        case "country_interface":

          break;
        case "founding_map":

          break;
      }
    } catch {}
  },

  reinitialiseGameEmbeds: function () {
    //Regular error trapping
    try {
       //Declare local instance variables
       var all_interfaces = Object.keys(interfaces);
       var open_channels = [];

       //Reinitialise all game embeds
       for (var i = 0; i < all_interfaces.length; i++) if (interfaces[all_interfaces[i]].type == "game") {
         try {
           var local_ui = interfaces[all_interfaces[i]];
           var local_messages = returnChannel(local_ui.channel).messages.fetch({ limit: 10 }).then(messages => {
             messages.forEach(msg => msg.delete());
           });
           initialiseGameEmbeds(all_interfaces[i]);
         } catch (e) {
           log.error(`Could not delete messages and reinitialise game embeds: ${e}.`);
         }
       }
    } catch (e) {
      log.error(`reinitialiseGameEmbeds() ran into an error: ${e}.`);
    }
  }
};
