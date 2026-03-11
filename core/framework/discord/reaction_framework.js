//Main reaction handler function
module.exports = {
  deleteCheck: function (arg0_msg_obj) {
    //Convert from parameters
    var ui_id = arg0_msg_obj.id;
    var ui_obj = interfaces[arg0_msg_obj.id];
    var msg_obj = arg0_msg_obj;

    //Delete message if found to have a delete after argument
    if (ui_obj)
      if (ui_obj.delete_after) {
        var delete_after_delay = (ui_obj.delete_after_delay) ? ui_obj.delete_after_delay : 0;
        setTimeout(function(){
          if (msg_obj)
            msg_obj.delete();
        }, delete_after_delay);
      }

    //Clear up interface cache
    delete interfaces[msg_obj.id];
    delete main.interfaces[msg_obj.id]; //Just in case
  },

  reactionHandler: async function (arg0_reaction, arg1_user) {
    //Convert from parameters
    var reaction = arg0_reaction;
    var user = arg1_user;

    var msg_id = reaction.message.id;
    var msg_obj = reaction.message;

    //Make sure that the reaction does not come from a bot
    if (!user.bot) {
      //If a UI is found, determine the type of UI and parse it
      if (interfaces[msg_id]) {
        var ui_obj = interfaces[msg_id];

        if (ui_obj.user) {
          //Page menu
          switch (ui_obj.type) {
            case "game":
            case "page_menu":
              if (ui_obj.embed_array) {
                var current_page = ui_obj.page;

                //Determine arrow direction
                if (reaction.emoji.name == "⬅️") {
                  ui_obj.page = (current_page-1 >= 0) ? ui_obj.page - 1 : ui_obj.page;
                  current_page = ui_obj.page;

                  if (ui_obj.embed_array.length > 2) {
                    //Check if page is valid; if its at the end, we need both emojis now
                    if (current_page == ui_obj.embed_array.length-2 && current_page != 0) {
                      removeAllReactions(msg_obj);
                      msg_obj.react("⬅️").then(() => msg_obj.react("➡️"));
                    } else if (current_page == 0) {
                      removeAllReactions(msg_obj);
                      msg_obj.react("➡️");
                    }
                  } else {
                    removeAllReactions(msg_obj);
                    msg_obj.react("➡️");
                  }
                } else if (reaction.emoji.name == "➡️") {
                  //Check if page is valid
                  ui_obj.page = (ui_obj.embed_array[current_page+1]) ? ui_obj.page + 1 : ui_obj.page;
                  current_page = ui_obj.page;

                  //If its at the beginning, we need both emojis now
                  if (ui_obj.embed_array.length > 2) {
                    if (current_page != ui_obj.embed_array.length-1 && current_page == 1) {
                      removeAllReactions(msg_obj);
                      msg_obj.react("⬅️").then(() => msg_obj.react("➡️"));
                    } else if (current_page == ui_obj.embed_array.length-1) {
                      removeAllReactions(msg_obj);
                      msg_obj.react("⬅️");
                    }
                  } else {
                    if (current_page == 1) {
                      removeAllReactions(msg_obj);
                      msg_obj.react("⬅️");
                    }
                  }
                }

                //Switch page
                msg_obj.edit({ embeds: [ui_obj.embed_array[ui_obj.page]] });
              }

              break;
          }

          //Remove any remaining user reactions
          const user_reactions = msg_obj.reactions.cache.filter(reaction => reaction.users.cache.has(user.id));
          try {
            for (const reaction of user_reactions.values()) await reaction.users.remove(user.id);
          } catch {
            log.error("Failed to remove user reactions.");
          }
        }
      }

      //Check for control panel collectors
      var is_collector = [false, ""];
      var all_interfaces = Object.keys(interfaces);

      try {
        for (var i = 0; i < all_interfaces.length; i++) {
          var local_interface = interfaces[all_interfaces[i]];

          try {
            if (local_interface.type === "game") is_collector =  (local_interface.collectors.includes(msg_id)) ? [true, all_interfaces[i]] : is_collector;
          } catch {}
        }
      } catch {}

      //If detected as being a collector message, begin processing any control_function found
      var actions = {
        zoom_in: (reaction.emoji.name == "zoom_in"),
        zoom_out: (reaction.emoji.name == "zoom_out"),

        increase_pan_speed: (reaction.emoji.name == "⏫"),
        decrease_pan_speed: (reaction.emoji.name == "⏬"),

        up_arrow: (reaction.emoji.name == "⬆️"),
        down_arrow: (reaction.emoji.name == "⬇️"),
        left_arrow: (reaction.emoji.name == "⬅️"),
        right_arrow: (reaction.emoji.name == "➡️"),
        interact_button: (reaction.emoji.name == "🔘"),

        //Mapmodes
        atlas: (reaction.emoji.name == "globe"),
        colonisation: (reaction.emoji.name == "colonisation"),
        political: (reaction.emoji.name == "political_capital"),
        supply: (reaction.emoji.name == "railways")
      };

      if (is_collector[0]) {
        var local_menu_obj = interfaces[is_collector[1]];

        if (local_menu_obj.control_function) local_menu_obj.control_function(actions);

        //Remove any remaining user reactions
        const user_reactions = msg_obj.reactions.cache.filter(reaction => reaction.users.cache.has(user.id));
				try {
					for (const reaction of user_reactions.values()) {
						await reaction.users.remove(user.id);
					}
				} catch (error) {
					log.error("Failed to remove reactions.");
				}
      }
    }
  },

  removeAllReactions: function (arg0_msg_obj) {
    //Convert from parameters
    var msg_obj = arg0_msg_obj;

    //Remove all reactions
    try {
      msg_obj.reactions.removeAll();
    } catch {}
  }
};
