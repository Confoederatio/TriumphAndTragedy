module.exports = {
  revokeMilitaryAccess: function (arg0_user, arg1_user) {
    //Convert from parameters
    var user_id = arg0_user;
    var ot_user_id = arg1_user;

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var actual_ot_user_id = returnMention(ot_user_id);
    var game_obj = getGameObject(user_id);
    var ot_user = main.users[actual_ot_user_id];
    var usr = main.users[actual_id];

    //Check if user has military access in the first place
    if (ot_user) {
      if (actual_id != actual_ot_user_id) {
        if (hasMilitaryAccess(ot_user_id, user_id)) {
          sendAlert(ot_user_id, config.defines.diplomacy.military_access_cancellation_alert_id, {
            FROM: actual_id,
            TO: actual_ot_user_id
          });

          ot_user.diplomacy.used_diplomatic_slots--;
          dissolveMilitaryAccess(ot_user_id, user_id);

          //Status updater
          if (game_obj.page.startsWith("diplomacy_view_")) {
            var current_ot_user_id = game_obj.page.replace("diplomacy_view_", "");

            if (current_ot_user_id == actual_ot_user_id)
              viewDiplomacy(user_id, current_ot_user_id);
          }

          //Print user feedback
          printAlert(game_obj.id, `${config.icons.checkmark} You have successfully revoked military access to your nation for **${ot_user.name}**. They have been notified of their expulsion effective immediately.`);
        } else {
          printError(game_obj.id, `You have already revoked/denied military access to **${ot_user.name}**!`);
        }
      } else {
        printError(game_obj.id, `You cannot cancel military access to yourself!`);
      }
    } else {
      printError(game_obj.id, `The country you are trying to deny military access to, **${ot_user_id}**, is nonexistent!`);
    }
  },

  initialiseRevokeMilitaryAccess: function (arg0_user) {
    var user_id = arg0_user;

    //Declare local instance variables
    var game_obj = getGameObject(user_id);

    //Initialise visual prompt
    visualPrompt(game_obj.alert_embed, user_id, {
      title: `Deny Military Access:`,
      prompts: [
        [`Who would you like to cancel military access with?\n\nType **[View Ledger]** to a view a ledger of all valid nations.`, "mention"]
      ]
    },
    function (arg) {
      module.exports.cancelMilitaryAccess(user_id, arg[0]);
    },
    function (arg) {
      switch (arg) {
        case "view ledger":
          printLedger(user_id);
          return true;

          break;
      }
    })
  }
};
