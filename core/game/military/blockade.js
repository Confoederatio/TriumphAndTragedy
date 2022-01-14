module.exports = {
  blockade: function (arg0_user, arg1_user, arg2_army_name) {
    //Convert from parameters
    var user_id = arg0_user;
    var ot_user_id = arg1_user;
    var fleet_name = arg2_army_name.trim();

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var actual_ot_user_id = main.global.user_map[ot_user_id];
    var army_obj = getArmy(actual_id, fleet_name);
    var game_obj = getGameObject(user_id);
    var ot_user = main.users[actual_ot_user_id];
    var usr = main.users[actual_id];

    //Check to see if user is already blockaded
    if (usr.enable_blockades) {
      if (ot_user) {
        if (army_obj) {
          if (!army_obj.is_blockading) {
            if (ot_user.blockaded.fleets) {
              //Check to make sure fleet is not in recovery from a previous blockade
              if (returnSafeNumber(army_obj.blockade_recovery_turns) == 0) {
                //Reinforce the current blockade
                ot_user.blockaded.fleets.push({
                  id: actual_id,
                  fleet_id: army_obj.id
                });

                //Set new army status
                army_obj.status = `blockading **${ot_user.name}**`;
                army_obj.is_blockading = true;

                //Print user feedback
                printAlert(game_obj.id, `You have assigvned the **${army_obj.name}** to reinforce the blockade on **${ot_user.name}**.`);
              } else {
                printError(game_obj.id, `The **${army_obj.name}** is still in recovery from a previous blockade! Wait **${parseNumber(army_obj.blockade_recovery_turns)}** more turn(s) before trying to implement a blockade with this army.`)
              }
            } else {
              var blockade_creation = createBlockade(actual_id, actual_ot_user_id, army_obj.name);

              //Print user feedback
              (blockade_creation[0]) ?
                printAlert(game_obj.id, blockade_creation[1]) :
                printError(game_obj.id, blockade_creation[1]);
            }
          } else {
            printError(game_obj.id, `The **${fleet_name}** is already busy ${army_obj.status}! Try checking your **[Army List]** for a full list of available navies.`);
          }
        } else {
          printError(game_obj.id, `The fleet you have specified, **${fleet_name}**, doesn't even exist! Try checking your **[Army List]** for a full list of valid navies.`);
        }
      } else {
        printError(game_obj.id, `You must blockade a country that actually exists! By the way, have you heard of the latest blockade on Narnia?`);
      }
    } else {
      printError(game_obj.id, `Your people haven't even heard of the concept of blockades, let alone how to blockade other users! Try researching the concept of blockades in your **[Technology]** tree first.`);
    }
  }
};
