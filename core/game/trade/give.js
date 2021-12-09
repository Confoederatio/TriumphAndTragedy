module.exports = {
  give: function (arg0_user, arg1_receiving_user, arg2_amount, arg3_good_type) { //[WIP] - Update exports menu if user is currently in it
    //Convert from parameters
    var user_id = arg0_user;
    var other_user = arg1_receiving_user;
    var raw_amount = parseInt(Math.ceil(arg2_amount));
    var raw_good_name = arg3_good_type.toLowerCase();
    var good_name = getGood(arg3_good_type, { return_key: true });
    var good_obj = getGood(arg3_good_type);

    //Convert from parameters
    var actual_id = main.global.user_map[user_id];
    var game_obj = getGameObject(user_id);
    var ot_actual_id = main.global.user_map[other_user];
    var ot_user = main.users[ot_actual_id];
    var usr = main.users[actual_id];

    //Check to make sure that user isn't giving goods to themselves
    if (actual_id != ot_actual_id) {
      if (!isNaN(raw_amount)) {
        if (raw_amount >= 0) {
          if (raw_amount > 0) {
            if (!good_obj.research_good) {
              if (!good_obj.doesnt_stack) {
                //Check if user has enough shipment capacity
                if (getShipmentCapacity(actual_id) >= raw_amount) {
                  //Check if user has enough items to actually carry this out
                  if (
                    (raw_good_name == "money" && usr.money >= raw_amount) ||
                    (good_obj && usr.inventory[good_name] >= raw_amount)
                  ) {
                    //Fetch user variables
                    var distance = moveTo(getCapital(actual_id).id, getCapital(ot_actual_id).id).length;
                    var amount_of_turns = Math.ceil(
                      config.defines.combat.base_transfer_time + (
                        distance/config.defines.combat.shipment_time
                      )*usr.modifiers.shipment_time
                    );
                    var trade_id = generateTradeID(actual_id, ot_actual_id);

                    if (good_obj || raw_good_name == "money") {
                      usr.trades[trade_id] = {
                        target: other_user,
                        exporter: user_id,

                        amount: raw_amount,
                        good_type: good_name,

                        time_remaining: amount_of_turns
                      };

                      var local_good_icon = (getGood(good_name).icon) ?
                        getGood(good_name).icon + " " :
                        (raw_good_name == "money") ?
                          config.icons.money + " " :
                          "";
                      var local_good_name = (getGood(good_name).name) ?
                        getGood(good_name).name :
                        all_imports[i].good_type;

                      printAlert(`Your transports have begun to ship ${parseNumber(raw_amount)} ${local_good_icon}${local_good_name} to **${ot_user.name}**. They will arrive in **${parseNumber(amount_of_turns)}** turn(s).`);
                    } else {
                      printError(game_obj.id, `You may only ship inventory goods or money!`);
                    }
                  } else {
                    printError(game_obj.id, `You were unable to ship these goods due to a shortage of items.`);
                  }
                } else {
                  printError(game_obj.id, `You don't have enough Shipment Capacity to transport this many items! You currently have **${parseNumber(getShipmentCapacity(actual_id))}** remaining Shipment Capacity out of **${parseNumber(usr.modifiers.shipment_capacity)}** total, allowing you to only ship up to that many items.`);
                }
              } else {
                printError(game_obj.id, `You can't ship non-stackable items to other players!`);
              }
            } else {
              printError(game_obj.id, `You can't ship knowledge to other players!`);
            }
          } else {
            printError(game_obj.id, `You can't give zero units of something!`);
          }
        } else {
          printError(game_obj.id, `You can't steal from other users like that!`);
        }
      } else {
        printError(game_obj.id, `You must give a valid numeric amount of stuff!`);
      }
    } else {
      printError(game_obj.id, `You can't give stuff to yourself!`);
    }
  }
};
