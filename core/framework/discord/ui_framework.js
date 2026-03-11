module.exports = {
  addSelectMenu: function (arg0_message_obj, arg1_options) {
    //Convert from parameters
    var msg = arg0_message_obj;
    var options = arg1_options;

    /*
      Options field:
      {
        id: "era_select_menu",
        options: [
          {
            label: "Renaissance",
            emoji: config.icons.renaissance,
            description: "1500-1618",
            value: "renaissance",

            effect: setEra("renaissance")
          }
        ],
        placeholder: "No starting era selected"
      }
    */

    //Declare local instance variables
    var select_menu = new Discord.MessageSelectMenu()
      .setCustomId(options.id)
      .setPlaceholder((!options.placeholder) ? `Select an option ..` : options.placeholder);

    //Add options
    for (var i = 0; i < options.options.length; i++) {
      select_menu.addOptions(options.options[i]);

      //Add effect
      selection_effect_map[`${msg.id}-${options.id}-${options.options[i].value}`] = options.options[i].effect;

      if (options.options[i].options)
        selection_effect_map[`${msg.id}-${options.id}-${options.options[i].value}-options`] = options.options[i].options;
    }

    //Add select menu to message
    var new_select_row = new Discord.MessageActionRow()
      .addComponents(select_menu);
    var new_component_array = msg.components;
      new_component_array.push(new_select_row);

    //Edit message
    msg.edit({ components: new_component_array })
  },

  bulletPoint: function (arg0_nesting) {
    //Convert from parameters
    var nesting = (arg0_nesting) ? parseInt(arg0_nesting) : 0;

    //Declare local instance variables
    var spacing = "";

    if (nesting >= 1)
      for (var i = 0; i < nesting - 1; i++)
        spacing += "  ";

    //Return statement
    return (nesting != 0) ? spacing + "- " : "";
  },

  confirmDialogue: function (arg0_message_obj, arg1_contents, arg2_function) {
    //Convert from parameters
    var message_id = arg0_message_obj;
    var contents = arg1_contents;
    var exec_function = arg2_function;

    //Declare local instance variables
    var default_contents = (contents.text) ? contents.text : "Are you sure?";
    var no_contents = (contents.text_no) ? contents.text_no : "Command cancelled.";
    var yes_contents = (contents.text_yes) ? contents.text_yes : "Got it!";

    //Add to interface
    interfaces[message_id.id] = {};
    interfaces[message_id.id].channel = message_id.channel.id;
    interfaces[message_id.id].id = message_id.id;
    interfaces[message_id.id].type = "confirm_dialogue";
    interfaces[message_id.id].user = (contents.user) ? contents.user : undefined;
    interfaces[message_id.id].delete_after = (contents.delete_after) ? contents.delete_after : undefined;
    interfaces[message_id.id].delete_after_delay = (contents.delete_after_delay) ? contents.delete_after_delay : undefined;
    interfaces[message_id.id].execute = exec_function;
    interfaces[message_id.id].no_text = no_contents;
    interfaces[message_id.id].yes_text = yes_contents;

    //Create prompt
    const embed_dialog_prompt = new Discord.MessageEmbed()
      .setColor('#2e292f')
      .setDescription(default_contents);

    //Add checkmark and cancel buttons
    const embed_btn_row_1 = new Discord.MessageActionRow()
      .addComponents(
        new Discord.MessageButton()
          .setCustomId("yes_btn")
          .setLabel("Yes")
          .setStyle("SECONDARY")
          .setEmoji("725550245051760671"),
        new Discord.MessageButton()
          .setCustomId("no_btn")
          .setLabel("No")
          .setStyle("SECONDARY")
          .setEmoji("725550245672517734")
      );

    message_id.edit({ content: config.localisation.blank, embeds: [embed_dialog_prompt], components: [embed_btn_row_1]});
  },

  createPageMenu: function (arg0_message_obj, arg1_options) {
    //Convert from parameters
    var msg = arg0_message_obj;
    var options = arg1_options;

    //Declare local instance variables
    var game_obj = getGameObject(options.user);
    var starting_page = 0;

    starting_page = (options.page) ? options.page : starting_page;
    starting_page = (options.starting_page) ? options.starting_page : starting_page;
    starting_page = returnSafeNumber(starting_page);

    if (options.embed_pages) {
      if (starting_page >= options.embed_pages.length)
        starting_page = options.embed_pages.length - 1;

      if (options.user) {
        //Add to interface
        interfaces[msg.id] = {};
        var ui_obj = interfaces[msg.id];

        ui_obj.channel = msg.channel.id;
        ui_obj.type = "page_menu";

        ui_obj.debug = (options.debug);
        ui_obj.embed_array = options.embed_pages;
        ui_obj.page = starting_page;
        ui_obj.user = options.user;

        if (game_obj)
          //Remove all reactions if they exist
          try {
            game_obj.middle_embed.removeAll();
            game_obj.middle_control_panel.removeAll();
            game_obj.bottom_control_panel.removeAll();
          } catch {}

        //Create first embed
        if (starting_page === 0) {
          ui_obj.current_emoji_type = "first_page";
          msg.edit({ embeds: [options.embed_pages[starting_page]] }).then((message) => {
            removeAllReactions(msg);
            if (options.embed_pages.length > 1) message.react("➡️");
          });
        } else if (starting_page === options.embed_pages[options.embed_pages.length-1]) {
          ui_obj.current_emoji_type = "in_between";
          msg.edit({ embeds: [options.embed_pages[starting_page]] }).then((message) => {
            removeAllReactions(msg);
            if (options.embed_pages.length > 1) message.react("⬅️");
          });
        } else {
          ui_obj.current_emoji_type = "last_page";
          msg.edit({ embeds: [options.embed_pages[starting_page]] }).then((message) => {
            removeAllReactions(msg);
            if (options.embed_pages.length > 1) message.react("⬅️")
              .then(() => message.react("➡️"));
          });
        }
      } else {
        log.error("createPageMenu() encountered an error: 'user' object was not defined!");
      }
    } else {
      log.error("createPageMenu() encountered an error: 'embed_pages' was not defined!");
    }
  },

  formatEmbed: function (arg0_embed_key, arg1_all_embeds, arg2_page_ending, arg3_options) {
    //Convert from parameters
    var local_embed = arg0_embed_key;
    var all_embeds = arg1_all_embeds;
    var page_ending = arg2_page_ending;
    var options = arg3_options;

    //Modify embed
    if (options.footer)
      (Array.isArray(options.footer)) ?
        local_embed.setFooter(options.footer[all_embeds.length]) :
        local_embed.setFooter(options.footer);
    if (options.set_timestamp) local_embed.setTimestamp();
    if (options.thumbnail)
      (Array.isArray(options.thumbnail)) ?
        local_embed.setThumbnail(options.thumbnail[all_embeds.length]) :
        local_embed.setThumbnail(options.thumbnail);
    if (options.title)
      (Array.isArray(options.title)) ?
        local_embed.setTitle(`**${options.title[all_embeds.length]} ${page_ending}**\n${config.localisation.divider}`) :
        local_embed.setTitle(`**${options.title} ${page_ending}**\n${config.localisation.divider}`);

    if (options.fixed_width)
      local_embed.setImage("https://cdn.discordapp.com/attachments/722997700391338046/736141424315203634/margin.png");

    all_embeds.push(local_embed);
  },

  formatSubstring: function (arg0_string, arg1_substring, arg2_mode, arg3_offset) {
    //Convert from parameters
    var string = arg0_string;
    var substring = arg1_substring.trim().toLowerCase();
    var mode = (arg2_mode) ? arg2_mode : "underline";
    var offset = returnSafeNumber(parseInt(arg3_offset));

    //Declare local instance variables
    var formatter;
    var lowercase_string = string.trim().toLowerCase();
    var split_string = [];
    var substring_index = lowercase_string.indexOf(substring);

    //Manually split string to preserve whitespace
    for (var i = 0; i < string.length; i++)
      split_string.push(string[i]);

    if (mode == "bold") formatter = `**`;
    if (mode == "italic") formatter = `_`;
    if (mode == "underline") formatter = `__`;

    if (substring_index != -1) {
      var hit_non_space = false;

      for (var i = 0; i < split_string.length; i++)
        if (split_string[i] == " ") {
          if (!hit_non_space)
            offset++;
        } else {
          hit_non_space = true;
        }

      split_string.splice(substring_index + offset, 0, formatter);
      split_string.splice(substring_index + substring.length + 1 + offset, 0, formatter);
    }

    //Return statement
    return split_string.join("");
  },

  getGame: function (arg0_user) {
    //Convert from parameters
    var user_id = arg0_user;

    //Declare local instance variables
    var all_interfaces = Object.keys(interfaces);
    var already_in_game = [false, ""];

    //Check if user already has a game open
    for (var i = 0; i < all_interfaces.length; i++) already_in_game = (interfaces[all_interfaces[i]].type == "game" && interfaces[all_interfaces[i]].user == user_id && !interfaces[all_interfaces[i]].embed_array) ? [true, all_interfaces[i]] : already_in_game;

    //Return statement
    return (already_in_game[0]) ? already_in_game[1] : undefined;
  },

  getGameFromChannelID: function (arg0_channel_id) {
    //Convert from parameters
    var channel_id = arg0_channel_id;

    //Declare local instance variables
    var all_interfaces = Object.keys(interfaces);
    var already_in_game = [false, ""];

    //Check if game interface has channel of channel_id
    for (var i = 0; i < all_interfaces.length; i++) already_in_game = (interfaces[all_interfaces[i]].type == "game" && interfaces[all_interfaces[i]].channel == channel_id) ? [true, all_interfaces[i]] : already_in_game;

    //Return statement
    return (already_in_game[0]) ? already_in_game[1] : undefined;
  },

  getGameObject: function (arg0_user) {
    //Convert from parameters
    var user_id = arg0_user;

    //Return statement
    return interfaces[module.exports.getGame(user_id)];
  },

  initialiseControlPanel: function (arg0_game_id, arg1_type) {
    //Convert from parameters
    var game_id = arg0_game_id;
    var panel_type = arg1_type;

    //Declare local instance variables
    var game_obj = interfaces[game_id];

    //Remove all reactions if they exist
    try {
      game_obj.middle_embed.removeAll();
      game_obj.middle_control_panel.removeAll();
      game_obj.bottom_control_panel.removeAll();
    } catch {}

    //Add collector reactions
    try {
      game_obj.middle_embed.react("⏫")
        .then(() => { game_obj.middle_embed.react("⬆️"); })
        .then(() => { game_obj.middle_embed.react("785931430215155754"); });
      game_obj.middle_control_panel.react("⬅️")
        .then(() => { game_obj.middle_control_panel.react("🔘"); } )
        .then(() => { game_obj.middle_control_panel.react("➡️"); } );
      game_obj.bottom_control_panel.react("⏬")
        .then(() => { game_obj.bottom_control_panel.react("⬇️"); } )
        .then(() => { game_obj.bottom_control_panel.react("785931430407700482"); } );
    } catch {}
  },

  printAlert: function (arg0_game_id, arg1_message, arg2_clear, arg3_never_clear) {
    //Convert from parameters
    var game_id = arg0_game_id;
    var msg = arg1_message;
    var clear_array = arg2_clear;
    var never_clear = arg3_never_clear;

    //Declare local instance variables
    var game_obj = interfaces[game_id];

    //Error trapping
    try {
      //Clear alert array if prompted to do so
      game_obj.alert_array = (clear_array) ? [] : game_obj.alert_array;

      game_obj.alert_array.push(msg);
      game_obj.alert_change = true;

      setTimeout(function(){
        for (var i = 0; i < game_obj.alert_array.length; i++)
          if (game_obj.alert_array[i] == msg && !never_clear)
            game_obj.alert_array.splice(i, 1);

        game_obj.alert_change = true;
      }, 15000);
    } catch {}
  },

  printError: function (arg0_game_id, arg1_message) {
    //Convert from parameters
    var game_id = arg0_game_id;
    var msg = arg1_message;

    printAlert(game_id, ":warning: " + msg);
  },

  removeControlPanel: function (arg0_game_id) {
    //Convert from parameters
    var game_id = arg0_game_id;

    //Declare local instance variables
    var game_obj = interfaces[game_id];

    //Remove map viewer
    if (game_obj.map)
      delete game_obj.map;

    //Remove all reactions
    try {
      game_obj.middle_embed.reactions.removeAll();
    } catch {}
    try {
      game_obj.middle_control_panel.reactions.removeAll();
    } catch {}
    try {
      game_obj.bottom_control_panel.reactions.removeAll();
    } catch {}
  },

  sendPlainEmbed: function (arg0_message_obj, arg1_contents) {
    //Convert from parameters
    var message_id = arg0_message_obj;
    var contents = arg1_contents;

    //Send simple embed if contents are valid
    if (typeof contents == "string" || typeof contents == "number") {
      const embed_simple = new Discord.MessageEmbed()
        .setColor(settings.bot_colour)
        .setDescription(contents);

      message_id.channel.send({ embeds: [embed_simple] });
    }
  },

  splitEmbed: function (arg0_array, arg1_options) {
    //Convert from parameters
    var array_string = arg0_array;
    var options = arg1_options;

    //Declare local instance variables
    var added_pages = returnSafeNumber(options.added_pages);
    var all_embeds = [];
    var is_fixed_width = (options.fixed_width);
    var local_array_string = [];
    var maximum_characters_per_embed = (options.maximum_characters) ? options.maximum_characters : 3500;
    var page_index = returnSafeNumber(options.page_index);
    var total_page_count = 0;

    //Maximum fields reduction
    if (options.maximum_fields && options.table_width != 2)
      options.maximum_fields--;

    //Error trapping
    try {
      //Split by fields if requested
      if (options.maximum_fields) {
        //Split embeds based on fields
        if (options.fields) {
          var total_page_count = Math.ceil(options.fields.length/options.maximum_fields);

          for (var i = 0; i < total_page_count; i++)
            for (var x = 0; x < options.maximum_fields; x++)
              try {
                var index = i*options.maximum_fields;

                if (options.table_width == 2)
                  if ((x + 1) % 2 == 0)
                    local_array_string.push({ name: '\u200b', value: '\u200b', inline: true });

                local_array_string.push(options.fields[index + x]);

                if (x != 0 || options.fields.length == 1)
                  if (x % (options.maximum_fields - 1) == 0) {
                    //Initialise page embed
                    var local_embed = new Discord.MessageEmbed()
                      .setColor(settings.bot_colour)
                      .setDescription(array_string.join("\n"));

                    //Declare local options variables
                    var current_page = (all_embeds.length + 1 + page_index);
                    var total_pages = total_page_count + added_pages;

                    var page_ending = (options.title && options.title_pages) ? `(Page ${all_embeds.length + 1 + page_index} of ${parseNumber(total_page_count + added_pages)}):` : "";

                    if (parseInt(current_page) <= parseInt(total_pages))
                      formatEmbed(local_embed, all_embeds, page_ending, options);

                    //Add fields
                    for (var y = 0; y < local_array_string.length; y++)
                      local_embed.addFields(local_array_string[y]);

                    local_array_string = [];
                  }
              } catch {}
        }
      } else {
        //Split by lines if maximum_lines argument is specified, but split by characters otherwise
        if (!options.maximum_lines) {
          var current_character_count = 0;

          //Fetch total page count
          for (var i = 0; i < array_string.length; i++) {
            local_array_string.push(array_string[i]);
            current_character_count += array_string[i].length;

            if (i != 0 || array_string.length == 1)
              if (
                current_character_count >= maximum_characters_per_embed || i == array_string.length-1 &&

                //Check to see that string is not empty
                local_array_string.join("\n").length > 0
              ) {
                total_page_count++;
                current_character_count = 0;
                local_array_string = [];
              }
          }

          //Reset variables
          current_character_count = 0;
          local_array_string = [];

          //Split embeds based on characters
          for (var i = 0; i < array_string.length; i++) {
            local_array_string.push(array_string[i]);
            current_character_count += array_string[i].length;

            if (i != 0 || array_string.length == 1)
              if (
                //Check if page requirements are met
                current_character_count >= maximum_characters_per_embed || i == array_string.length-1 &&

                //Check to see that string is not empty
                local_array_string.join("\n").length > 0
              ) {
                //Initialise page embed
                var local_embed = new Discord.MessageEmbed()
                  .setColor("#a98ac7")
                  .setDescription(
                    ((options.description) ?
                      "\n" + options.description.join("\n") :
                      "") +
                    local_array_string.join("\n") +
                    ((options.footer_description) ?
                      "\n" + options.footer_description.join("\n") :
                      "")
                  );

                //Declare local options variables
                var current_page = (all_embeds.length + 1 + page_index);
                var total_pages = (total_page_count + added_pages);

                var page_ending = (options.title && options.title_pages) ? `(Page ${all_embeds.length + 1 + page_index} of ${total_page_count + added_pages}):` : "";

                if (parseInt(current_page) <= parseInt(total_pages)) {
                  formatEmbed(local_embed, all_embeds, page_ending, options);
                  current_character_count = 0;
                  local_array_string = [];
                } else {
                  console.log("Stop!")
                }
              }
          }
        } else {
          //Split embeds based on lines
          for (var i = 0; i < array_string.length; i++) {
            local_array_string.push(array_string[i]);

            if (i != 0 || array_string.length == 1)
              if (i % options.maximum_lines == 0 || i == array_string.length-1) {
                //Initialise page embed
                var local_embed = new Discord.MessageEmbed()
                  .setColor("#a98ac7")
                  .setDescription(local_array_string.join("\n"));

                //Declare local options variables
                var current_page = (all_embeds.length + 1 + page_index);
                var total_pages = (total_page_count + added_pages);

                var page_ending = (options.title && options.title_pages) ? `(Page ${all_embeds.length + 1 + page_index} of ${total_page_count + added_pages}):` : "";

                if (parseInt(current_page) <= parseInt(total_pages)) {
                  formatEmbed(local_embed, all_embeds, page_ending, options);
                  local_array_string = [];
                } else {
                  console.log("Stop!")
                }
              }
          }
        }
      }

      //Return statement
      return all_embeds;
    } catch (e) {
      log.error(`Ran into an error whilst parsing embed at splitEmbed(): ${e}`);
      console.log(e);
    }
  },

  splitText: function (arg0_array, arg1_options) {
    //Convert from parameters
    var array_string = arg0_array;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var all_strings = [];
    var local_array_string = [];
    var maximum_characters_per_array = (options.maximum_characters) ? options.maximum_characters : 1024;

    //Error trapping
    try {
      //Join all bullet point blocks together
      var new_array_string = [];

      if (!options.split_bullet_points) {
        var local_joined_string = [];
        var local_starting_element = -1;

        for (var i = 0; i < array_string.length; i++) {
          var next_element_length = 0;

          if (array_string[i + 1])
            next_element_length = array_string[i].length;

          if (array_string[i].startsWith("- ") ||
            (local_joined_string.join("\n").length + next_element_length > Math.ceil(options.maximum_characters/1.5)) ||
            i == array_string.length - 1
          ) {
            if (i == array_string.length - 1)
              local_joined_string.push(array_string[i]);

            //Set local_joined_string
            new_array_string.push(local_joined_string.join("\n"));
            local_indices_to_remove = [];

            //1st bullet point, mark as local_starting_element
            local_joined_string = [];
            local_starting_element = i;
          }

          local_joined_string.push(array_string[i]);
        }
      }

      array_string = new_array_string;

      if (!options.maximum_lines) {
        //Split text based on characters
        for (var i = 0; i < array_string.length; i++) {
          var added_line = false;
          var bullets = "";
          var hit_maximum = false;
          var nesting = getNesting(array_string[i]);
          
          if (
            local_array_string.join("\n").length + array_string[i].length <= maximum_characters_per_array
          ) {
            local_array_string.push(array_string[i]);
            added_line = true;
          } else {
            hit_maximum = true;
          }

          //Adjust bullet points if off
          if (nesting == 1)
            bullets = "- "
          if (nesting >= 1) {
            for (var x = 0; x < nesting; x++)
              bullets += " - ";

            array_string[i] = array_string[i].split(" - ");

            if (array_string[i].length > 1)
              array_string[i].shift();

            array_string[i] = `${bullets} ${array_string[i].join(" - ")}`;
          }

          if (i != 0 || array_string.length == 1)
            if (
              (i == array_string.length - 1 &&

              //Check to see that string is not empty
              local_array_string.join("\n").length > 0) ||
              hit_maximum
            ) {
              //Push to all_strings
              all_strings.push(local_array_string.join("\n"));
              local_array_string = [];

              //Maximum safeguard to prevent max call stack size
              if (hit_maximum)
                i--; //Potentially leads to a fatal crash
            }
        }
      } else {
        //Split embeds based on lines
        for (var i = 0; i < array_string.length; i++) {
          local_array_string.push(array_string[i]);

          if (i != 0 || array_string.length == 1)
            if (i % options.maximum_lines == 0 || i == array_string.length - 1) {
              //Push to all_strings
              all_strings.push(local_array_string.join("\n"));
              local_array_string = [];
            }
        }
      }

      //Return statement
      return all_strings;
    } catch (e) {
      log.error(`Ran into an error whilst parsing text at splitText(): ${e}`);
      console.log(e);
    }
  },

  updateAlert: function (arg0_user, arg1_options) {
    //Convert from parameters
    var user_id = arg0_user;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var game_obj = getGameObject(user_id);
    var in_visual_prompt = interfaces[user_id];

    //Check if user is in_visual_prompt
    if (in_visual_prompt)
      in_visual_prompt = (in_visual_prompt.type == "visual_prompt");

    //Make sure alert embed UI object exists
    if (!main.interfaces[game_obj.alert_embed.id])
      main.interfaces[game_obj.alert_embed.id] = {};
    var current_ui = main.interfaces[game_obj.alert_embed.id];

    if (game_obj && !in_visual_prompt) {
      if (game_obj.alert_array.length == 0) {
        const new_alert_embed = new Discord.MessageEmbed()
          .setColor(settings.bot_colour)
          .setDescription("No new alerts.")
          .setImage("https://cdn.discordapp.com/attachments/722997700391338046/736141424315203634/margin.png");

        if (!options.freeze_alerts && !game_obj.freeze_alerts) {
          game_obj.alert_embed.edit({ embeds: [new_alert_embed] });

          //Remove page embed arrows since there's nothing left
          removeAllReactions(game_obj.alert_embed);

          current_ui.page = 0;
        }
      } else {
        var alert_embeds = [];
        var alert_length = 0;

        for (var i = 0; i < game_obj.alert_array.length; i++)
          alert_length += game_obj.alert_array[i].length;

        if (alert_length >= 3000) {
          var split_alert_array = [];

          //Check game_obj.alert_array length
          for (var i = 0; i < game_obj.alert_array.length; i++) {
            var local_array = game_obj.alert_array[i].split("\n");

            for (var x = 0; x < local_array.length; x++)
              split_alert_array.push(local_array[x]);
          }

          //Split text and push multiple embeds to alert_embeds
          var split_text_array = module.exports.splitText(split_alert_array, {
            maximum_characters: 3800
          });

          for (var i = 0; i < split_text_array.length; i++)
            if (split_text_array[i].length > 0) {
              const local_embed = new Discord.MessageEmbed()
                .setColor(settings.bot_colour)
                .setDescription(split_text_array[i])
                .setImage("https://cdn.discordapp.com/attachments/722997700391338046/736141424315203634/margin.png");

              alert_embeds.push(local_embed);
            }

          //Display alert_embeds as a page menu
          createPageMenu(game_obj.alert_embed, {
            embed_pages: alert_embeds,
            page: current_ui.page,
            user: user_id
          });
        } else {
          const new_alert_embed = new Discord.MessageEmbed()
            .setColor(settings.bot_colour)
            .setDescription(game_obj.alert_array.join("\n"))
            .setImage("https://cdn.discordapp.com/attachments/722997700391338046/736141424315203634/margin.png");

          game_obj.alert_embed.edit({ embeds: [new_alert_embed] });
          removeAllReactions(game_obj.alert_embed);

          current_ui.page = 0;
        }
      }

      game_obj.alert_change = false;
    }
  }
};
