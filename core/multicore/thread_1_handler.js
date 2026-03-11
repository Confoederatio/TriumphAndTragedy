module.exports = {
  threadOneHandler: function () {
    //Load DB from JSON
    loadBackupArray();

    //Start bot
    loadMostRecentSave();
    startBot();

    setTimeout(function(){
      //Global error handling
      process.on("unhandledRejection", (error) => {
        //Log enabled only with debug mode
        if (settings.debug_mode) {
          log.error(`Unhandled promise rejection. ${error.toString()}`);
          console.log(error);
        }
      });

      //Reaction/interaction framework
      client.on("interactionCreate", (interaction) => {
        buttonHandler(interaction);
        selectHandler(interaction);
      });
      client.on("messageReactionAdd", async (reaction, user) => {
        reactionHandler(reaction, user);
      });

      //Command handling
      client.on("messageCreate", async (message) => {
        //Fetch local parameters
        username = message.author.username;
        user_id = message.author.id;
        input = message.content;

        //Parse arguments
        if (settings.no_space) input = input.replace(settings.prefix, `${settings.prefix} `);
        var arg = splitCommandLine(input);

        //Check output
        log.info(`
          Author: ${username}
          Arguments: ${arg.join(", ")}

          Original Content: ${input}
        `);

        if (!message.author.bot && !ignore_channels.includes(message.channel.id)) {
          //Debug commands (these ones have a prefix)
          if (message.member.roles.cache.find(role => settings.administrator_roles.includes(role.id))) {
            if (equalsIgnoreCase(arg[0], settings.prefix)) {
              if (equalsIgnoreCase(arg[1], "help"))
                printHelpMenu(message);

              //Used to eval
              if (equalsIgnoreCase(arg[1], "console")) {
                var full_code = [];
                for (var i = 2; i < arg.length; i++) full_code.push(arg[i]);

                eval(full_code.join(" "));

                //Send back prompt
                message.channel.send("Console command executed. Warning! This command can be highly unstable if not used correctly.").then((msg) => {
      						//Delete console command output after 10 seconds
      						setTimeout(function() { msg.delete(); }, 10000);
      					});
              }

              //console.log
              if (equalsIgnoreCase(arg[1], "console.log") || equalsIgnoreCase(arg[1], "log")) {
                var full_code = [];
                for (var i = 2; i < arg.length; i++) full_code.push(arg[i]);

                var actual_code = eval(full_code.join(" "));
                var actual_string = actual_code.toString();

                if (typeof actual_code == "object")
                  actual_string = JSON.stringify(actual_code);

                var log_array = splitString(actual_string, 200);

                var log_embed_array = splitEmbed(log_array, {
                  title: truncateString(full_code.join(" "), 60),
                  title_pages: true,
                  fixed_width: true
                });

                //Remove functionality for previous debug logs
                var all_interfaces = Object.keys(interfaces);

                for (var i = 0; i < all_interfaces.length; i++) {
                  var local_ui = interfaces[all_interfaces[i]];

                  if (local_ui.debug) {
                    delete main.interfaces[all_interfaces[i]];
                    delete interfaces[all_interfaces[i]];
                  }
                }

                message.channel.send(config.localisation.blank).then((msg) => {
                  createPageMenu(msg, {
                    embed_pages: log_embed_array,

                    debug: true,
                    user: message.author.id
                  });
                });
              }

              //Debug handler
              var new_args = JSON.parse(JSON.stringify(arg));
              new_args.shift();

              var debug_handler = pageHandlerDebug(new_args, message);

              if (debug_handler)
                message.channel.send(debug_handler[1]);
            }
          }

          //Lobby commands (these also have a prefix, with the exception of visual prompts)
          {
            if (equalsIgnoreCase(arg[0], settings.prefix))
              if (equalsIgnoreCase(arg[1], "play"))
                createNewGame(user_id, message);
          }

          //Game input commands
          {
            if (getGame(user_id)) {
              var game_obj = interfaces[getGame(user_id)];

              if (main.game_channels.includes(message.channel.id)) {
                setTimeout(function(){
                  message.delete();
                }, 1000);
                commandHandler(getGame(user_id), arg.join(" "));

                //Cache usernames/nicknames
                try {
                  getUsernames(user_id);
                } catch {}

                //Check if game is still active
                if (returnGameFromChannelID(message.channel.id))
                  interfaces[returnGameFromChannelID(message.channel.id)].last_active = new Date().getTime();
              }
            }
          }
        }
      });

      //Initialise variables before anything else!
      initGlobalLoop();

      //Logic loops, 1-second logic loop
      setInterval(function(){
        //Bot clock
        bot_clock++;

        //Cache interfaces
        main.interfaces = interfaces;

        //Delete inactive channels
        clearInactiveGames();

        //ABRS - Save backups!
      	var current_date = new Date().getTime();
        var current_turn_time = 0;
        var battle_difference = current_date - returnSafeNumber(main.global.battle_tick);
        var queue_time_difference = current_date - main.last_queue_check;
      	var time_difference = current_date - main.last_backup;
        var turn_time_difference = current_date - main.last_turn;

        //Backup processing
      	if (time_difference > settings.backup_timer*1000) {
      		main.last_backup = current_date;
          log.info(`Saving automatic backup.`);
      		writeSave({ file_limit: settings.backup_limit });
      	}

        //Combat processing
        if (!main.freeze_turns)
          if (battle_difference > (settings.turn_timer*1000)/10) {
            main.global.battle_tick = current_date;
            syncWorkersToMaster();

            if (hasAvailableWorker(3)) {
              thread_three_workers[0].send({
                command: "nextBattleTick"
              });
            } else {
              nextBattleTick();
            }

            main.global.battle_tick = current_date;
          }

        //Date processing
        if (main.season_started && !main.freeze_time) {
          current_turn_time = getTimeModifier();

          //This is how much time has elapsed in years. The numerator 1000 represents milliseconds
          var time_elapsed = current_turn_time*(1000/(settings.turn_timer*1000));
          var processed_time = parseYears(time_elapsed);

          //Add to date
          main.date.year += processed_time.year;
          main.date.month += processed_time.month;
          main.date.day += processed_time.day;
          main.date.hour += processed_time.hour;

          if (main.date.month > 12) {
            main.date.month = 1;
            main.date.year++;
          }
          if (main.date.day > processed_time.days_in_months[main.date.month - 1]) {
            main.date.day = 1;
            main.date.month++;
          }
          if (main.date.hour > 23) {
            main.date.hour = 0;
            main.date.day++;
          }
        }

        //Queue processing
        if (!main.season_started) {
          //Check if enough players have joined for the season to start
          if (Object.keys(main.users).length >= config.defines.common.starting_players) {
            main.season_started = true;
            reinitialiseGameEmbeds();
          }

          //Otherwise, go on with the activity checks ..
          if (queue_time_difference > returnSafeNumber(config.defines.common.activity_check)*1000*60*60*24) {
            main.last_queue_check = current_date;

            //Clear inactive users
            var all_current_users = Object.keys(main.users);
            for (var i = 0; i < all_current_users.length; i++) {
              var local_user = main.users[all_current_users[i]];

              if (current_date - local_user.last_queue_check >= returnSafeNumber(config.defines.common.activity_check)*1000*60*60*24) {
                try {
                  returnChannel(settings.alert_channel).send(`<@${main.global.user_map[all_current_users[i]]}> was dropped from the queue due to inactivity.`);
                  deleteCountry(all_current_users[i]);
                  reinitialiseGameEmbeds();
                } catch {}
              }
            }

            //Send check to all remaining users
            var all_users = Object.keys(main.users);
            for (var i = 0; i < all_users.length; i++)
              checkActivityInQueue(all_users[i]);
          }
        }

        //Turn processing for all users
        if (turn_time_difference > settings.turn_timer*1000) {
          syncWorkersToMaster();

          main.global.battle_tick = current_date;
          main.last_backup = current_date;
          main.last_turn = current_date;

          //Process nextGlobalTurn() for global processes and calculations
          if (main.season_started && !main.freeze_turns) {
            clearBadInterfaces();

            if (thread_three_workers.length > 0) {
              var worker_index = (thread_three_workers[1]) ?
                1 : 0;

              thread_three_workers[0].send({
                command: "nextBattleTick",
                new_turn: true
              });

              thread_three_workers[worker_index].send({
                command: "nextGlobalTurn"
              });
            } else {
              nextBattleTick(true);
              nextGlobalTurn();
            }
          }

          main.global.battle_tick = current_date;
          main.last_backup = current_date;
          main.last_turn = current_date;
        }
      }, 1000);

      //Logic loops, 30-second logic loop
      setInterval(function(){
        writeDB(); //Write to database.js
      }, 30000);
    }, 3000);
  }
};
