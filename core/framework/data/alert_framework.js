module.exports = {
  /*
    findAlert() - Returns an alert key/object based on the provided name
    options: {
      return_key: true/false - Whether or not to return a key or object. Defaults to false
    }
  */
  findAlert: function (arg0_alert_name, arg1_options) {
    //Convert from parameters
    var alert_name = arg0_alert_name;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var alert_found = [false, ""]; //[alert_found, alert_obj];
    var all_alert_categories = Object.keys(config.alerts);

    //Soft-match first
    for (var i = 0; i < all_alert_categories.length; i++) {
      var local_alert_category = config.alerts[all_alert_categories[i]];
      var local_alerts = Object.keys(local_alert_category);

      for (var x = 0; x < local_alerts.length; x++)
        if (local_alerts[x].indexOf(alert_name) != -1)
          alert_found = [true, (!options.return_key) ? lcoal_alert_category[local_alerts[x]] : local_alerts[x]];
    }

    //Hard-match first
    for (var i = 0; i < all_alert_categories.length; i++) {
      var local_alert_category = config.alerts[all_alert_categories[i]];
      var local_alerts = Object.keys(local_alert_category);

      for (var x = 0; x < local_alerts.length; x++)
        if (local_alerts[x] == alert_name)
          alert_found = [true, (!options.return_key) ? lcoal_alert_category[local_alerts[x]] : local_alerts[x]];
    }
  },

  /*
    printAlert() - Prints an alert to a given user based on the provided key
    options: {
      FROM: "actual_id", - Which user first invoked the alert
      TO: "actual_id" - The recipient user
    }
  */
  printAlert: function (arg0_user, arg1_alert_name, arg2_options) { //[WIP] - Add localisation API later
    //Convert from parameters
    var user_id = arg0_user;
    var alert_name = arg1_alert_name;
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var alert_name = module.exports.findAlert(alert_name, { return_key: true });
    var alert_obj = module.exports.findAlert(alert_name);
    var game_obj = getGameObject(user_id);
    var usr = main.users[actual_id];

    //Add to usr.alerts object
    var alert_buttons = [];
    var alert_description = (alert_obj.description) ?
      parseLocalisation(alert_obj.description, { scopes: options }) :
      "";
    var alert_title = (alert_obj.name) ?
      parseLocalisation(alert_obj.name, { scopes: options }) :
      "";

    //Push buttons to array
    var all_subkeys = Object.keys(alert_obj);

    for (var i = 0; i < all_subkeys.length; i++)
      if (all_subkeys[i].startsWith("btn_")) {
        var button_obj = alert_obj[all_subkeys[i]];

        var button_title = (button_obj.title) ?
          parseLocalisation(button_obj.title, { scopes: options }) :
          all_subkeys[i];

        var push_obj = {
          id: all_subkeys[i],
          name: button_title
        };

        //Add effect to push_obj if it exists
        if (button_obj.effect)
          push_obj.effect = button_obj.effect;

        //Push push_obj to alert_buttons
        alert_buttons.push(push_obj);
      }

    //Push alert_obj to usr.alerts
    usr.alerts.push({
      id: alert_name,
      name: alert_title,

      description: alert_description,
      image: alert_obj.image,
      thumbnail: alert_obj.thumbnail,

      buttons: alert_buttons,

      //Tracker variables
      date: JSON.parse(JSON.stringify(main.date)),
      round_count: JSON.parse(JSON.stringify(main.round_count)),
      time_remaining: config.defines.common.alert_timeout
    });
  }
};
