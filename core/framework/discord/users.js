//Users framework
module.exports = {
  generateUserID: function () {
    //Declare local instance variables
    var all_users = Object.keys(main.users);

    //While loop to find ID, just in-case of conflicting random ID's:
    while (true) {
      var local_id = generateRandomID();

      //Return and break once a true ID is found
      if (!all_users.includes(local_id)) {
        return local_id;
        break;
      }
    }
  },

  getUser: function (arg0_user_id) {
    //Convert from parameters
    var user_id = arg0_user_id;

    //Return statement
    try {
      return client.users.cache.get(arg0_user_id);
    } catch {}
  },

  //getUsers() - Returns an array of all matching user ID's to the actual ID
  getUsers: function (arg0_user) {
    //Convert from parameters
    var user_id = arg0_user;

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var all_user_keys = Object.keys(main.global.user_map);
    var user_ids = [];

    //Iterate over all_user_keys and push
    for (var i = 0; i < all_user_keys.length; i++)
      if (main.global.user_map[all_user_keys[i]] == actual_id)
        user_ids.push(all_user_keys[i]);

    //Return statement
    return user_ids;
  },

  /*
    getUsernames() - Returns a list of usernames/nicknames from a given ID
    options: {
      return_nicknames: true/false - Whether to return nicknames instead of usernames. False by default
    }
  */
  getUsernames: function (arg0_user, arg1_options) {
    //Convert from parameters
    let user_id = arg0_user;
    let options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    let actual_id = main.global.user_map[user_id];
    let all_tt_categories = getList(settings.tt_category_id);
    let all_user_keys = Object.keys(main.global.user_map);
    let fetch_ids = [];
    let guild_obj = returnChannel(all_tt_categories[0]).guild;
    let nicknames = [];
    let usernames = [];
    let usr = main.users[actual_id];

    //Get user ID's to fetch
    for (let i = 0; i < all_user_keys.length; i++)
      if (main.global.user_map[all_user_keys[i]] === actual_id)
        fetch_ids.push(all_user_keys[i]);

    //Cache usernames
    for (let i = 0; i < fetch_ids.length; i++)
      try {
        //Username processing
        let user_obj = client.users.cache.find(user => user.id === fetch_ids[i]);
        usernames.push(user_obj.username.trim());

        //Nickname processing
        try {
          var member_obj = guild_obj.members.cache.find(member => member.id === fetch_ids[i]);

          if (member_obj.nickname)
            nicknames.push(member_obj.nickname.trim());
        } catch {}
      } catch {}

    //Set cache
    usr.nicknames = nicknames;
    usr.usernames = usernames;

    //Return nicknames/usernames array
    return (options.return_nicknames) ? nicknames : usernames;
  },

  getUserObject: function (arg0_user_id, arg1_guild_id) {
    //Convert from parameters
    var user_id = arg0_user_id;
    var guild_id = arg1_guild_id;

    //Declare local instance variables
    var guild_obj = client.guilds.cache.get(guild_id);

    //Return statement
    try {
      return guild_obj.members.cache.get(user_id);
    } catch (e) {
      log.warn(`Could not fetch user object of ${user_id}: ${e}.`);
    }
  },

  parseMention: function (arg0_string) {
    //Convert from parameters
    var user_string = arg0_string.toLowerCase();

    //User mention detected, parse to ID
    var processed_user_id = user_string.replace("<!@", "").replace("<@", "").replace(">", "");
    var local_id;

    //Search for nation-name
    var all_users = Object.keys(main.users);

    //Detected as direct user mention
    if (main.global.user_map[processed_user_id]) {
      //Return statement
      local_id = main.global.user_map[processed_user_id];
    }

    //Soft search
    for (var i = 0; i < all_users.length; i++)
      if (main.users[all_users[i]].name.toLowerCase().indexOf(user_string) != -1)
        local_id = all_users[i];

    //Hard search
    for (var i = 0; i < all_users.length; i++)
      if (main.users[all_users[i]].name == user_string)
        local_id = all_users[i];

    //Cached users
    //Username - Soft match first
    var soft_username = client.users.cache.find(user => user.username.toLowerCase().indexOf(processed_user_id.toLowerCase()) != -1);

    //Username - Hard match second
    var hard_username = client.users.cache.find(user => user.username.toLowerCase() == processed_user_id.toLowerCase());

    if (soft_username)
      local_id = soft_username.id;
    if (hard_username)
      local_id = hard_username.id;

    //Mention
    if (!isNaN(processed_user_id)) {
      var mention_obj = client.users.cache.find(user => user.id == processed_user_id);

      if (mention_obj)
        local_id = mention_obj.id;
    }

    //Return statement
    return local_id;
  },

  returnMention: function (arg0_user) {
    //Convert from parameters
    var user_id = arg0_user;

    //Declare local instance variables
    var all_users = excludeClientStates(Object.keys(main.users));
    var mention_id = user_id;
    var nation_found = [false, ""];
    var user_exists = false;

    //Guard clause for verbatim ID
    if (main.users[user_id])
      return user_id;

    //Countries take priority
    {
      //Declare local ID for resolving user ID
      var local_id;

      //Country name - Soft match first
      for (var i = 0; i < all_users.length; i++)
        if (main.users[all_users[i]].name.toLowerCase().indexOf(user_id.toLowerCase()) != -1)
          nation_found = [true, all_users[i]];

      //Country name - Hard match second
      for (var i = 0; i < all_users.length; i++)
        if (main.users[all_users[i]].name.toLowerCase() == user_id.toLowerCase())
          nation_found = [true, all_users[i]];

      if (!nation_found[0]) {
        //Username - Soft match first
        for (var i = 0; i < all_users.length; i++) {
          var local_user = main.users[all_users[i]];

          if (local_user.usernames)
            for (var x = 0; x < local_user.usernames.length; x++)
              if (local_user.usernames[x].toLowerCase().indexOf(user_id.toLowerCase()) != -1)
                local_id = all_users[i];
        }

        //Username - Hard match second
        for (var i = 0; i < all_users.length; i++) {
          var local_user = main.users[all_users[i]];

          if (local_user.usernames)
            for (var x = 0; x < local_user.usernames.length; x++)
              if (local_user.usernames[x].toLowerCase() == user_id.toLowerCase())
                local_id = all_users[i];
        }

        //Nicknames
        if (!local_id) {
          //Nickname - Soft match first
          for (var i = 0; i < all_users.length; i++) {
            var local_user = main.users[all_users[i]];

            if (local_user.nicknames)
              for (var x = 0; x < local_user.nicknames.length; x++)
                if (local_user.nicknames[x].toLowerCase().indexOf(user_id.toLowerCase()) != -1)
                  local_id = all_users[i];
          }

          //Nickname - Hard match second
          for (var i = 0; i < all_users.length; i++) {
            var local_user = main.users[all_users[i]];

            if (local_user.nicknames)
              for (var x = 0; x < local_user.nicknames.length; x++)
                if (local_user.nicknames[x].toLowerCase() == user_id.toLowerCase())
                  local_id = all_users[i];
          }
        }

        if (local_id)
          if (main.global.user_map[local_id])
            return main.global.user_map[local_id];
      } else {
        return nation_found[1];
      }
    }

    //Users now take second priority instead of first
    if (user_id.match(/^[<0-9>(@)!]+$/)) {
      //Replace mentions
      mention_id = mention_id.replace(/(<)(@)(!)/, "")
        .replace(/(<)(@)/g, "")
        .replace(">", "");

      if (main.global.user_map[mention_id]) {
        mention_id = main.global.user_map;
        user_exists = true;

        //Local case return statement
        return mention_id;
      }
    }

    if (user_exists)
      if (main.global.user_map[user_id]) return main.global.user_map[user_id];
  },
};
