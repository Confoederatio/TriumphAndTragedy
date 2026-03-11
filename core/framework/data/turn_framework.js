const {forceRenderAllMaps} = require("../map/map_renderer");
module.exports = {
  nextBattleTick: function (arg0_new_turn) {
    //Convert from parameters
    var is_new_turn = arg0_new_turn;

    //Declare local instance variables
    var all_armies = getAllArmies();
    var all_users = Object.keys(main.users);
    var all_capitals = {};
    var all_enemies = {};
  	var current_date = new Date().getTime();
    var turn_hours = getTurnHours();

    //Date processing for battle tick
    main.global.battle_tick = current_date;
    main.last_backup = current_date;
    main.tick_count++;

    log.info(`Saving battle tick backup.`);
		writeSave({ file_limit: settings.backup_limit });

    //Clear all combat flags
    for (var i = 0; i < all_armies.length; i++)
      delete all_armies[i].in_combat;

    //Create lookup table of all capitals/enemies
    for (var i = 0; i < all_users.length; i++)
      all_capitals[all_users[i]] = getCapital(all_users[i]);
    for (var i = 0; i < all_users.length; i++)
      all_enemies[all_users[i]] = getEnemies(all_users[i]);

    //Iterate over all armies
    for (var i = 0; i < all_armies.length; i++) {
      var local_army = all_armies[i];
      var local_enemies = all_enemies[local_army.owner];
      var local_user = main.users[local_army.owner];
      var province_obj = main.provinces[local_army.province];
      var speed_sample = [local_army.province];

      var capital_obj = getCapital(local_user.id);

      //Per turn updates
      if (is_new_turn) {
        //Append local_enemies for volunteer armies
        if (local_army.volunteering) {
          var local_war = main.global.wars[local_army.volunteering[1]];
          var opposite_side = (local_war[`${local_army.owner}_sent_volunteers`] == "attackers") ? "defenders" : "attackers";

          for (var x = 0; x < local_war[opposite_side].length; x++)
            if (!local_enemies.includes(local_war[opposite_side][x]))
              local_enemies.push(local_war[opposite_side][x]);
        }

        //Army cooldowns - KEEP AT TOP!
        delete local_army.challenged_this_turn;
        delete local_army.taking_attrition;

        if (local_army.blockade_recovery_turns) {
          local_army.blockade_recovery_turns--;
          if (local_army.blockade_recovery_turns <= 0)
            delete local_army.blockade_recovery_turns;
        }
        if (local_army.moving_to.length == 0)
          local_army.stationary_turns++;
        else
          local_army.stationary_turns = 0;
        if (local_army.submarine_cooldown) {
          local_army.submarine_cooldown--;
          if (local_army.submarine_cooldown <= 0)
            delete local_army.submarine_cooldown;
        }

        //Army attrition
        if (returnSafeNumber(lookup.province_troop_strengths[local_army.province]) > returnSafeNumber(province_obj.supply_limit, config.defines.combat.base_supply_limit)*1000)
          if (local_enemies.length > 0)
            if (local_army.type != "navy") {
              var is_capital = false;

              if (all_capitals[local_army.owner])
                if (local_army.province == all_capitals[local_army.owner].id)
                  is_capital = true;

              //Take attrition at a certain percentage
              if (!is_capital) {
                var local_units = Object.keys(local_army.units);

                for (var x = 0; x < local_units.length; x++) {
                  var lost_units =  Math.ceil(
                    local_army.units[local_units[x]]*config.defines.combat.base_attrition_rate*local_user.modifiers.attrition_rate
                  );

                  //Subtract attrition casualties
                  local_army.units[local_units[x]] -= lost_units;
                  killUnitPops(local_army.owner, lost_units, lookup.all_units[local_units[x]]);

                  if (local_army.units[local_units[x]] <= 0)
                    delete local_army.units[local_units[x]];

                  //Add tracker variable
                  local_army.taking_attrition = true;
                }
              }
            }

        //Army movement
        if (local_army.moving_to?.length > 0) {
          var army_arrived = false;
          var current_element = local_army.moving_to.indexOf(local_army.province);
          var current_speed = getArmySpeed(local_user.id, local_army)*turn_hours;
          var provinces_moved = 0;

          //Add to movement progress
          if (!local_army.progress)
            local_army.progress = 0;

          local_army.progress += current_speed;

          //Check distances_array
          if (local_army.distances) {
            if (local_army.progress >= getSum(local_army.distances))
              army_arrived = true;

            //Inter-destination movement if army hasn't arrived yet
            if (!army_arrived)
              for (var x = current_element; x < local_army.distances.length; x++)
                if (local_army.distances[x])
                  if (local_army.progress >= local_army.distances[x]) {
                    local_army.progress -= local_army.distances[x];
                    speed_sample.push(local_army.moving_to[x]);

                    local_army.province = local_army.moving_to[x];
                  }
          }

          //Clear movement array if army has arrived
          if (
            local_army.province == local_army.moving_to[local_army.moving_to.length - 1] ||
            local_army.moving_to.length == 0 ||
            army_arrived
          ) {
            //Set army to destination since they've arrived
            if (local_army.moving_to.length > 0)
              local_army.province = local_army.moving_to[local_army.moving_to.length - 1];

            local_army.distances = [];
            local_army.moving_to = [];
            local_army.status = "stationed";

            delete local_army.progress;
          }
        }

        //Naval processing
        if (local_army.type == "navy") {
          var home_port_is_allowed = false;

          if (province_obj.controller == local_user.id) home_port_is_allowed = true;
          if (hasAlliance(local_army.owner, province_obj.controller) || hasMilitaryAccess(local_army.owner, province_obj.controller)) home_port_is_allowed = true;

          if (!home_port_is_allowed)
            if (capital_obj)
              changeHomePort(local_army.owner, local_army, capital_obj.id);
        }
      }

      //Check for hostile users in the same province/colliding provinces
      for (var x = 0; x < all_armies.length; x++)
        if (local_enemies.includes(all_armies[x].owner) && speed_sample.includes(all_armies[x].province))
          if (
            local_army.type != "navy" && all_armies[x].type != "navy" &&
            !(local_army.in_combat || all_armies[x].in_combat)
          ) {
            (local_army.stationary_turns > all_armies[x].stationary_turns) ?
              initialiseBattle(all_armies[x].owner, all_armies[x], local_army.owner, local_army) :
              initialiseBattle(local_army.owner, local_army, all_armies[x].owner, all_armies[x]);

            local_army.in_combat = true;
            all_armies[x].in_combat = true;
          }

      //If army is in a hostile province with an army that has more than 0,5% of the local population, and is not in combat, occupy it
      if (!local_army.in_combat && local_enemies.includes(province_obj.controller))
        if (getArmySize(local_army.owner, local_army) > province_obj.pops.population*config.defines.combat.occupation_requirement) {
          province_obj.controller = local_army.owner;
          setAllProvinceColours(province_obj.controller, province_obj.id, true)
        }
    }

    //Force render maps after turn processing
    if (config.defines.common.force_render_on_turn)
      forceRenderAllMaps();
  },

  nextGlobalTurn: function () {
    //Declare local instance variables
    var all_armies = getAllArmies();
    var all_cooldowns = Object.keys(main.global.cooldowns);
    var all_market_goods = Object.keys(main.market);
    var all_provinces = Object.keys(main.provinces);
    var all_users = Object.keys(main.users);
    var all_wars = Object.keys(main.global.wars);
    var demilitarisation_user_map = {};

    //Cooldowns and modifiers
    {
      //Main cooldown handler
      for (var i = 0; i < all_cooldowns.length; i++) {
        var local_cooldown = main.global.cooldowns[all_cooldowns[i]];

        //Decrement local_cooldown.duration
        local_cooldown.duration--;

        if (returnSafeNumber(local_cooldown.duration) <= 0) {
          //Demilitarisation scope
          if (all_cooldowns[i].includes("demilitarisation"))
            for (var x = 0; x < local_cooldown.demilitarised_provinces.length; x++) {
              var local_province = main.provinces[local_cooldown.demilitarised_provinces[x]];

              //Remove demilitarised flag
              delete local_province.demilitarised;
            }

          //Delete local_cooldown
          delete main.global.cooldowns[all_cooldowns[i]];
        } else {
          for (var x = 0; x < local_cooldown.demilitarised_provinces.length; x++) {
            var local_province = main.provinces[local_cooldown.demilitarised_provinces[x]];

            if (!demilitarisation_user_map[local_province.controller]) {
              demilitarisation_user_map[local_province.controller] = [];
            } else {
              demilitarisation_user_map[local_province.controller].push(local_cooldown.demilitarised_provinces[x]);
            }
          }
        }
      }

      //Peace treaty cooldown handlers
      {
        //Demilitarisation (province objects)
        var all_demilitarised_users = Object.keys(demilitarisation_user_map);
        var remilitarised_provinces = [];

        for (var i = 0; i < all_demilitarised_users.length; i++) {
          var local_provinces = demilitarisation_user_map[all_demilitarised_users[i]];

          if (atWar(all_demilitarised_users))
            for (var x = 0; x < local_provinces.length; x++) {
              var local_province = main.provinces[local_provinces[x]];

              remilitarised_provinces.push(local_provinces[x]);
              delete local_province.demilitarised;
            }
        }

        //Demilitarisation (cooldowns)
        if (remilitarised_provinces.length > 0)
          for (var i = 0; i < all_cooldowns.length; i++)
            if (all_cooldowns[i].includes("demilitarisation")) {
              var local_cooldown = main.global.cooldowns[all_cooldowns[i]];
              var local_provinces = local_cooldown.demilitarised_provinces;

              for (var x = local_provinces.length - 1; x >= 0; x--)
                if (remilitarised_provinces.includes(local_provinces[x]))
                  local_cooldown.demilitarised_provinces.splice(x, 1);

              //Check if local_cooldown.demilitarised_provinces has anything left
              if (local_cooldown.demilitarised_provinces.length <= 0)
                delete main.global.cooldowns[all_cooldowns[i]];
            }
      }
    }

    //Optimisation processing (Up-Logic)
    {
      //Combat
      lookup.province_troop_strengths = {};

      for (var i = 0; i < all_provinces.length; i++)
        lookup.province_troop_strengths[all_provinces[i]] = returnSafeNumber(getTroopsInProvince(all_provinces[i]));
    }

    //Iterate over all users and process their turns
    for (var i = 0; i < all_users.length; i++)
      try {
        nextTurn(all_users[i]);
      } catch (e) {
        console.log(e);
      }

    //War processing - This must happen after users process their turns
    {
      //Iterate over all provinces to check occupation risk
      for (var i = 0; i < all_provinces.length; i++) {
        var local_province = main.provinces[all_provinces[i]];

        if (local_province.owner)
          if (local_province.owner != local_province.controller) {
            var amount_of_troops = getTroopsInProvince(all_provinces[i]);
            var revolt_risk = Math.min(1 - (amount_of_troops/(local_province.pops.population/100)), 0.5);
            var revolt_roll = Math.random();

            if (revolt_roll < revolt_risk) {
              local_province.controller = local_province.owner;

              //Render mapmodes for province
              setAllProvinceColours(local_province.owner, all_provinces[i]);
            }
          }
      }

      //Iterate over all wars to process warscore; check CB's
      for (var i = 0; i < all_wars.length; i++) {
        var all_cbs = Object.keys(config.casus_belli);
        var local_war = main.global.wars[all_wars[i]];

        //Dynamic CB handler
        for (var x = 0; x < all_cbs.length; x++) {
          var local_cb = config.casus_belli[all_cbs[x]];

          if (local_cb.dynamic_limit) {
            var cb_changes = local_cb.dynamic_limit(local_war);

            if (cb_changes) {
              local_war.cb = all_cbs[x];

              //Check to see if wargoals need to change
              if (local_cb.clear_wargoals) {
                local_war.attackers_wargoals = {};
                local_war.defenders_wargoals = {};
              }

              //Add new wargoals to war object
              if (local_cb.peace_demands) {
                var all_wargoals = Object.keys(local_cb.peace_demands);

                for (var y = 0; y < all_wargoals.length; y++) {
                  var local_amount = local_cb.peace_demands[all_wargoals[y]];

                  local_war.attackers_wargoals[all_wargoals[y]] = local_amount;
                  local_war.defenders_wargoals[all_wargoals[y]] = local_amount;
                }
              }
            }
          }
        }

        //Set warscore
        local_war.attacker_warscore = getWarscore(local_war, "attackers");
        local_war.defender_warscore = getWarscore(local_war, "defenders");
      }
    }

    //World Market logic - This must happen after users process their turns
    {
      processMarket();
    }

    //Optimisation processing (Down-Logic)
    {
      //Initialisation
      updateControl();
      updateOwnership();

      //Economy/Pops
      updateMigrationAttraction();
    }

    //Force render all maps
    {
      var has_thread_two_workers = false;

      if (global.thread_two_workers)
        if (thread_two_workers.length > 0)
          has_thread_two_workers = true;

      if (config.defines.common.force_render_on_turn) {
        console.time(`Force rendering all maps!`);
        for (var i = 0; i < mapmodes.length; i++) {
          if (has_thread_two_workers) {
            var worker_index = i % thread_two_workers.length;

            thread_two_workers[worker_index].send({ load_maps: true });
            thread_two_workers[worker_index].send({
              command: "forceRender",
              map_name: mapmodes[i]
            });
          } else {
            forceRender(mapmodes[i]);
          }
        }
        console.timeEnd(`Force rendering all maps!`);

        //Reload maps in master process
        process.send({ load_maps: true });
      }
    }

    //Increment global round-count
    log.info(`Incrementing round_count from ${main.round_count} to ${main.round_count + 1}!`);
    main.round_count++;

    //Clean users
    cleanUsers();

    //Return statement
    return global.main;
  },

  nextTurn: function (arg0_user, arg1_options) { //[WIP] - Add newspaper section later
    //Convert from parameters
    var user_id = arg0_user;
    var options = (arg1_options) ? arg1_options : {};

    //Make sure actual_id exists for user
    var is_resigned_user = false;

    if (!main.global.user_map[`${user_id}_last_quit`])
      is_resigned_user = true;

    if (is_resigned_user)
      main.global.user_map[user_id] = user_id;

    //Declare local instance variables; make sure to account for user simulations
    var actual_id = (options.is_simulation) ?
      main.global.user_map[user_id] + "_simulation" :
      main.global.user_map[user_id];
    if (options.is_simulation) {
      user_id += "_simulation";
      main.global.user_map[user_id] = actual_id;

      main.users[actual_id] = JSON.parse(JSON.stringify(main.users[main.global.user_map[user_id.replace("_simulation", "")]]));
    }
    var usr = main.users[actual_id];

    if (!Cluster.isMaster)
      log.debug(`Processing turn for ${usr.name} (ID: ${user_id}) on Worker #${Cluster.worker.id}`);

    //Declare local tracker variables
    var all_armies = (usr.armies) ? Object.keys(usr.armies) : [];
    var all_casus_belli = Object.keys(config.casus_belli);
    var all_cities = getCities(user_id);
    var all_cooldowns = Object.keys(usr.cooldowns);
    var all_enemies = getEnemies(user_id);
    var all_events = lookup.all_events;
    var all_expeditions = Object.keys(usr.expeditions);
    var all_goods = lookup.all_goods_array;
    var all_good_names = lookup.all_good_names;
    var all_governments = Object.keys(config.governments);
    var all_modifiers = lookup.all_modifiers;
    var all_modifier_names = lookup.all_modifier_names;
    var all_non_aggression_pacts = Object.keys(usr.diplomacy.non_aggression_pacts);
    var all_pops = Object.keys(config.pops);
    var all_relations = Object.keys(usr.diplomacy.relations);
    var all_temporary_modifiers = Object.keys(usr.temporary_modifiers);
    var all_users = Object.keys(main.users);
    var all_vassals = Object.keys(usr.diplomacy.vassals);
    var all_wars = Object.keys(main.global.wars);
    var controlled_provinces = getProvinces(user_id, { include_occupations: true });
    var is_being_justified_on = isBeingJustifiedOn(user_id);
    var owned_provinces = getProvinces(user_id, { include_hostile_occupations: true });

    //Track money before tax trackers reset for this turn
    var user_income = getIncome(user_id);

    //Modifier and tracker variable processing
    console.time(`Modifier and tracker variable processing!`);
    try {
      //Generic trackers
      usr.country_age++;
      usr.provinces = owned_provinces.length;

      //Base action gain
      usr.actions += config.defines.economy.starting_actions;

      //City modifiers/trackers
      usr.city_cap = getCitiesCap(user_id);
      usr.total_cities += getCities(user_id, { include_hostile_occupations: true }).length;

      //Goods trackers
      usr.artisan_production = getUserArtisanProduction(user_id);
      usr.available_goods = getUnlockedGoods(user_id);

      //Cooldowns
      {
        for (var i = 0; i < all_cooldowns.length; i++) {
          var local_cooldown = usr.cooldowns[all_cooldowns[i]];

          //Decrement cooldown
          local_cooldown.duration--;

          //Peace treaty cooldowns
          if (all_cooldowns[i].includes("syphon_actions")) {
            var actions_taken = Math.ceil(Math.max(
              usr.actions*local_cooldown.percentage_amount,
              Math.min(usr.actions, local_cooldown.amount)
            ));
            var local_recipient = main.users[local_cooldown.owner];

            usr.actions -= actions_taken;
            local_recipient.actions += actions_taken;
          }

          //Delete if invalid
          if (returnSafeNumber(local_cooldown.duration) <= 0)
            delete usr.cooldowns[all_cooldowns[i]];
        }
      }

      //Combat modifiers
      {
        //Blockades
        if (usr.blockaded.blockade_cooldown)
          usr.blockaded.blockade_cooldown--;

        //Check if all armies still exist, remove those that don't from .fleets
        if (usr.blockaded)
          if (usr.blockaded.fleets) {
            for (var i = usr.blockaded.fleets.length - 1; i >= 0; i--) {
              var local_fleet = usr.blockaded.fleets[i];

              //If fleet is not found, splice from array
              if (!main.users[local_fleet.id].armies[local_fleet.fleet_id])
                usr.blockaded.fleets.splice(i, 1);
            }

            if (usr.blockaded.fleets.length == 0)
              deleteBlockade(user_id);
          }

        //Civilian/military casualties
        usr.recent_civilian_casualties.push(0);
        usr.recent_military_casualties.push(0);

        if (usr.recent_civilian_casualties.length > 10)
          usr.recent_civilian_casualties.splice(0, 1);
        if (usr.recent_military_casualties.length > 10)
          usr.recent_military_casualties.splice(0, 1);

        //Delete unnecessary keys
        if (usr.blockaded.blockade_cooldown == 0)
          delete usr.blockaded.blockade_cooldown;
      }

      //Diplomatic modifiers
      {
        //Make sure infamy is capped at start
        if (usr.country_age <= 1) {
          //Make sure infamy loss is set to minimum
          if (usr.modifiers.infamy_loss > config.defines.diplomacy.infamy_loss)
            usr.modifiers.infamy_loss = config.defines.diplomacy.infamy_loss;
        }

        usr.modifiers.infamy += usr.modifiers.infamy_loss;

        //Reset tracker variables
        usr.total_ceded_this_turn = 0;
        usr.total_cities_ceded_this_turn = 0;

        //Set infamy caps
        usr.modifiers.infamy = Math.max(usr.modifiers.infamy, 0);
        usr.modifiers.infamy = Math.min(usr.modifiers.infamy, config.defines.diplomacy.absolute_infamy_limit);

        //Infamy limit
        usr.modifiers.rgo_throughput += usr.infamy_rgo_throughput;
        usr.modifiers.production_efficiency += usr.infamy_production_efficiency;

        if (usr.modifiers.infamy > config.defines.diplomacy.infamy_limit) {
          usr.infamy_production_efficiency = usr.modifiers.infamy*0.02; //-2% per infamy
          usr.infamy_rgo_throughput = usr.modifiers.infamy*0.03; //-3% per infamy

          usr.infamy_production_efficiency = Math.max(usr.infamy_production_efficiency, 0);
          usr.infamy_rgo_throughput = Math.max(usr.infamy_rgo_throughput, 0);
        } else {
          usr.infamy_production_efficiency = 0;
          usr.infamy_rgo_throughput = 0;
        }

        //Subtract both infamy_production_efficiency and infamy_rgo_throughput from modifiers
        usr.modifiers.production_efficiency -= returnSafeNumber(usr.infamy_production_efficiency);
        usr.modifiers.rgo_throughput -= returnSafeNumber(usr.infamy_rgo_throughput);

        //Used diplomatic slots
        usr.diplomacy.used_diplomatic_slots = getUsedDiplomaticSlots(user_id);

        //War exhaustion
        if (all_enemies.length == 0 && !usr.blockaded.is_blockaded && !usr.mobilisation.is_mobilised)
          usr.modifiers.war_exhaustion -= returnSafeNumber(config.defines.combat.war_exhaustion_tickdown_rate);
      }

      //Economic modifiers
      {
        usr.modifiers.shipment_time = Math.max(usr.modifiers.shipment_time, 0.01); //This is the cap for shipment time
        usr.transactions_this_turn = 0;
      }

      //Military modifiers
      {
        if (usr.mobilisation)
          if (usr.mobilisation.last_mobilised > main.round_count)
            usr.mobilisation.last_mobilised = main.round_count;
      }

      //National modifiers
      {
        processNationalModifiers(user_id);
      }

      //Population modifiers/trackers
      usr.population = getPopulation(user_id);
      delete usr.has_famine;

      //Stability modifiers/trackers
      if (returnSafeNumber(usr.boosted_stability) > 0)
        usr.boosted_stability -= 0.01;

      //Temporary modifier handling
      {
        //Iterate over all temporary modifiers
        for (var i = 0; i < all_temporary_modifiers.length; i++) {
          var local_temporary_modifier = usr.temporary_modifiers[all_temporary_modifiers[i]];

          //Reduce temporary_modifier duration if it is over zero
          if (local_temporary_modifier.duration > 0)
            local_temporary_modifier.duration--;

          //If the temporary_modifier's duration is now zero, apply the inverse modifier to the user and delete the key
          if (local_temporary_modifier.duration == 0) {
            applyModifiers(user_id, {
              [local_temporary_modifier.type]: local_temporary_modifier.value*-1
            });

            delete usr.temporary_modifiers[all_temporary_modifiers[i]];
          }
        }
      }

      //Update trackers
      {
        //Budget
        usr.trackers.tax = {};

        //Military
        usr.trackers.overall_supply = getOverallSupply(user_id);
        usr.trackers.total_active_duty = getTotalActiveDuty(user_id);
      }

      //Modifier cap handling
      {
        //Make sure modifiers cannot go beneath the minimum set in modifiers.js
        for (var i = 0; i < all_modifiers.length; i++)
          if (usr.modifiers[all_modifier_names[i]])
            if (all_modifiers[i].minimum)
              if (usr.modifiers[all_modifier_names[i]] < all_modifiers[i].minimum)
                usr.modifiers[all_modifier_names[i]] = all_modifiers[i].minimum;
      }
    } catch (e) {
      console.log(e);
    }
    console.timeEnd(`Modifier and tracker variable processing!`);

    //Make sure all_production is after trackers are reset
    var all_production = getProduction(user_id, undefined, { is_real: (!options.is_simulation) });

    console.time(`Alert processing!`);
    //Alert processing
    try {
      var alerts_to_remove = [];

      for (var i = 0; i < usr.alerts.length; i++) {
        var ai_chance_sum = 0;
        var ai_chance_ranges = [];

        //Deduct from duration
        if (usr.alerts[i].duration > 0)
          usr.alerts[i].duration--;

        //Check if alert has timed out
        if (usr.alerts[i].duration == 0) {
          var alert_buttons = usr.alerts[i].buttons;

          //Resolve alert by weighted random if AI chance is a thing
          if (alert_buttons)
            if (usr.alerts[i].has_ai_chance) {
              for (var x = 0; x < alert_buttons.length; x++) {
                var current_ai_chance =  returnSafeNumber(alert_buttons[x].ai_chance);

                ai_chance_ranges.push([ai_chance_sum, ai_chance_sum + current_ai_chance, alert_buttons[x].id]);
                ai_chance_sum += current_ai_chance;
              }

              //Roll the dice
              var dice_roll = randomNumber(0, ai_chance_sum);

              //See where the dice roll landed
              for (var x = 0; x < ai_chance_ranges.length; x++)
                if (dice_roll >= ai_chance_ranges[x][0] && dice_roll < ai_chance_ranges[x][1]) {
                  //The dice roll landed here
                  var button_obj = getButton(usr.alerts[i].id, ai_chance_ranges[x][2]);

                  //Execute effect
                  if (button_obj.effect)
                    button_obj.effect(usr.alerts[i].options);
                }
            } else {
              var dice_roll = randomNumber(0, alert_buttons.length - 1);

              //See where the dice roll landed
              var button_obj = getButton(usr.alerts[i].id, alert_buttons[dice_roll].id);

              //Execute effect
              if (button_obj.effect)
                button_obj.effect(usr.alerts[i].options);
            }

          //Push to removal array
          alerts_to_remove.push(i);
        }
      }

      //Remove all alerts in alerts_to_remove
      for (var i = alerts_to_remove.length - 1; i >= 0; i--)
        usr.alerts.splice(alerts_to_remove[i], 1);
    } catch (e) {
      console.log(e);
    }
    console.timeEnd(`Alert processing!`);

    console.time(`Building processing!`);
    //Building processing
    try {
      //Building production
      {
        //Check goods that don't stack first
        for (var i = 0; i < all_good_names.length; i++) {
          var local_good = lookup.all_goods[all_good_names[i]];

          //Reset local_good if it doesn't stack
          if (local_good.doesnt_stack)
            setGoodAmount(user_id, all_good_names[i], 0);
        }

        var all_produced_goods = Object.keys(all_production);

        for (var i = 0; i < all_produced_goods.length; i++) {
          var local_value = all_production[all_produced_goods[i]];

          //Process upkeep
          if (all_produced_goods[i].includes("_upkeep")) {
            if (!all_produced_goods[i].includes("money")) {
              var upkeep_to_process = all_produced_goods[i].replace("_upkeep", "");

              if (lookup.all_goods[upkeep_to_process] != undefined) {
                modifyGoodAmount(user_id, upkeep_to_process, randomNumber(local_value[0], local_value[1]));
              } else {
                if (!reserved.production_choice.includes(upkeep_to_process))
                  usr[upkeep_to_process] -= randomNumber(local_value[0], local_value[1]);
              }
            }
          } else if (all_produced_goods[i].includes("_special_effect")) {
            //Process special effects
            var special_effect_to_process = all_produced_goods[i].replace("_special_effect", "");

            var building_obj = getBuilding(special_effect_to_process);

            if (building_obj.special_effect)
              building_obj.special_effect(usr);
          } else {
            var local_market_good = main.market[all_produced_goods[i]];
            var produced_amount = randomNumber(local_value[0], local_value[1]);

            //Process goods
            if (lookup.all_goods[all_produced_goods[i]] != undefined) {
              modifyGoodAmount(user_id, all_produced_goods[i], produced_amount);
            } else {
              if (!reserved.production_choice.includes(all_produced_goods[i]))
                usr[all_produced_goods[i]] += produced_amount;
            }

            //Add to market supply
            if (local_market_good)
              local_market_good.stock += produced_amount;
          }
        }
      }

      //Building subsidies
      {
        if (usr.all_subsidies)
          subsidiseAllBuildings(user_id, { do_not_display: true });
      }
    } catch (e) {
      console.log(e);
    }
    console.timeEnd(`Building processing!`);

    console.time(`Budget processing!`);
    //Budget processing
    try {
      var total_income = randomNumber(user_income[0], user_income[1]);

      usr.money += total_income;

      //Check cooldowns for war_reparations
      for (var i = 0; i < all_cooldowns.length; i++) {
        var local_cooldown = usr.cooldowns[all_cooldowns[i]];

        if (all_cooldowns[i].includes("war_reparations")) {
          var local_recipient = main.users[local_cooldown.owner];
          var money_taken = Math.ceil(total_income*local_cooldown.percentage_amount);

          usr.money -= money_taken;
          local_recipient.money += money_taken;
        }
      }
    } catch (e) {
      console.log(e);
    }
    console.timeEnd(`Budget processing!`);

    console.time(`Colonisation processing!`);
    //Colonisation processing
    try {
      if (!options.is_simulation)
        for (var i = 0; i < all_expeditions.length; i++) {
          var local_expedition = usr.expeditions[all_expeditions[i]];

          //Decrease duration
          local_expedition.duration--;

          if (local_expedition.duration < 1) {
            for (var x = 0; x < local_expedition.provinces.length; x++) {
              //Check to see if province already has an owner, if not, settle it
              var local_province = main.provinces[local_expedition.provinces[x]];

              if (!local_province.owner)
                settleProvince(user_id, local_expedition.provinces[x]);
            }

            //Remove expedition key
            delete usr.expeditions[all_expeditions[i]];
          }
        }
    } catch (e) {
      console.log(e);
    }
    console.timeEnd(`Colonisation processing!`);

    console.time(`Construction processing!`);
    //Construction processing
    try {
      for (var i = usr.under_construction.length - 1; i >= 0; i--)
        try {
          usr.under_construction[i].construction_turns--;

          //Check if building(s) are done being built
          if (usr.under_construction[i].construction_turns == 0) {
            //Deep copy construction
            var local_construction = JSON.parse(JSON.stringify(usr.under_construction[i]));

            //Splice construction
            usr.under_construction.splice(i, 1);

            //Fetch city_obj
            var local_city_obj = getProvince(local_construction.province_id);

            //Try/catch to prevent duplication
            if (local_city_obj.buildings)
              //Individual buildings are treated as objects in an array here because this allows for further granularity in the future
              constructBuilding(local_construction.building_amount, local_construction.building_type, local_construction.province_id);
          } else if (usr.under_construction[i].construction_turns < 0) {
            //Splice if construction is bugged for some reason
            usr.under_construction.splice(i, 1);
          }
        } catch (e) {
          console.log(e);
        }
    } catch (e) {
      console.log(e);
    }
    console.timeEnd(`Construction processing!`);

    console.time(`Diplomacy processing!`);
    //Diplomacy processing
    try {
      if (!options.is_simulation) {
        //Casus Belli
        {
          var cbs_to_remove = [];

          for (var i = 0; i < usr.diplomacy.casus_belli.length; i++) {
            var local_casus_belli = usr.diplomacy.casus_belli[i];

            local_casus_belli.duration--;

            if (local_casus_belli.duration <= 0)
              cbs_to_remove.push(i);
          }

          //Remove all cbs in cbs_to_remove
          for (var i = cbs_to_remove.length - 1; i >= 0; i--)
            usr.diplomacy.casus_belli.splice(cbs_to_remove[i], 1);

          for (var i = 0; i < all_casus_belli.length; i++) {
            var local_cb = config.casus_belli[all_casus_belli[i]];

            if (local_cb.limit)
              for (var x = 0; x < all_users.length; x++)
                if (all_users[x] != actual_id)
                  //Make sure user can't have the same CB twice
                  try {
                    if (local_cb.limit(usr, main.users[all_users[x]])) {
                      var already_has_this_cb = false;

                      for (var y = 0; y < usr.diplomacy.casus_belli.length; y++) {
                        var local_casus_belli = usr.diplomacy.casus_belli[y];

                        if (
                          local_casus_belli.type == all_casus_belli[i] &&
                          local_casus_belli.target == all_users[x]
                        )
                          already_has_this_cb = true;
                      }

                      if (!already_has_this_cb)
                        usr.diplomacy.casus_belli.push({
                          type: all_casus_belli[i],
                          target: all_users[x],

                          duration: 1
                        });
                    }
                  } catch {}
          }
        }

        //Improve/decrease relations
        {
          for (var i = 0; i < all_relations.length; i++) {
            var local_relation = usr.diplomacy.relations[all_relations[i]];

            //Check if improving_to value exists
            if (local_relation.improving_to)
              if (local_relation.improving_to != local_relation.value) {
                var relation_change = (local_relation.improving_to - local_relation.value)/local_relation.duration;

                //Set new relation value
                local_relation.value += relation_change;

                //Cap off at whatever relation_change was, negative/positive
                //Negative handler
                if (
                  (relation_change < 0 && local_relation.value < local_relation.improving_to) ||
                  (relation_change > 0 && local_relation.value > local_relation.improving_to)
                )
                  local_relation.value = local_relation.improving_to;

                //Check if the current value is equal to the improved relation
                if (local_relation.value >= local_relation.improving_to) {
                  //Set status to stagnant
                  local_relation.status = "stagnant";

                  //If so, delete the keys
                  delete local_relation.improving_to;
                  delete local_relation.duration;
                }

                if (local_relation.duration > 0)
                  local_relation.duration--;

                //Cap it out at -100 and +100
                local_relation.value = Math.max(local_relation.value, -100);
                local_relation.value = Math.min(local_relation.value, 100);
                local_relation.improving_to = Math.max(local_relation.improving_to, -100);
                local_relation.improving_to = Math.max(local_relation.improving_to, 100);
              }
          }
        }

        //Non-aggression pacts
        {
          for (var i = 0; i < all_non_aggression_pacts.length; i++) {
            var local_non_aggression_pact = usr.diplomacy.non_aggression_pacts[all_non_aggression_pacts[i]];

            //Decrement duration if greater than zero
            if (local_non_aggression_pact.duration > 0)
              local_non_aggression_pact.duration--;

            //Delete non aggression pact once time runs out
            if (local_non_aggression_pact.duration == 0)
              dissolveNonAggressionPact(user_id, local_non_aggression_pact.id);
          }
        }

        //Prestige
        {
          usr.prestige = Math.max(0, usr.prestige + usr.modifiers.prestige_gain);
        }

        //Vassalage
        {
          //Vassal status
          if (getVassal(user_id))
            usr.vassal_years++;
        }

        //Wargoal justification
        {
          var justifications_to_remove = [];

          for (var i = 0; i < usr.diplomacy.justifications.length; i++) {
            var local_justification = usr.diplomacy.justifications[i];

            local_justification.duration--;

            //Check if justification has finished
            if (local_justification.duration <= 0) {
              //Give wargoal
              usr.diplomacy.wargoals.push({
                type: local_justification.type,
                target: local_justification.target
              });

              //Push to removal array
              justifications_to_remove.push(i);
            }
          }

          //Remove justifications_to_remove from usr.diplomacy.justifications
          for (var i = justifications_to_remove.length - 1; i >= 0; i--)
            usr.diplomacy.justifications.splice(justifications_to_remove[i], 1);
        }
      }
    } catch (e) {
      console.log(e);
    }
    console.timeEnd(`Diplomacy processing!`);

    console.time(`Events processing!`);
    //Events processing (Mirror of alerts processing)
    try {
      var events_to_remove = [];

      //Event triggers
      for (var i = 0; i < all_events.length; i++)
        //Check if user meets event requirements
        if (all_events[i].trigger)
          if (all_events[i].trigger(usr))
            sendEvent(user_id, lookup.all_event_names[i], {
              FROM: actual_id,
              TO: actual_id
            });

      //Event resolution
      for (var i = 0; i < usr.events.length; i++) {
        var ai_chance_sum = 0;
        var ai_chance_ranges = [];

        //Deduct from duration
        if (usr.events[i].duration > 0)
          usr.events[i].duration--;

        //Check if event has timed out
        if (usr.events[i].duration == 0) {
          var event_options = usr.events[i].options;

          //Resolve event by weighted random if AI chance is a thing
          if (event_options)
            if (usr.events[i].has_ai_chance) {
              for (var x = 0; x < event_options.length; x++) {
                var current_ai_chance =  (typeof event_options[x].ai_chance == "function") ?
                  returnSafeNumber(event_options[x].ai_chance(usr, usr.events[i].scopes)) :
                  returnSafeNumber(event_options[x].ai_chance);

                ai_chance_ranges.push([ai_chance_sum, ai_chance_sum + current_ai_chance, event_options[x].id]);
                ai_chance_sum += current_ai_chance;
              }

              //Roll the dice
              var dice_roll = randomNumber(0, ai_chance_sum);

              //See where the dice roll landed
              for (var x = 0; x < ai_chance_ranges.length; x++)
                if (dice_roll >= ai_chance_ranges[x][0] && dice_roll < ai_chance_ranges[x][1]) {
                  //The dice roll landed here
                  var option_obj = getButton(usr.events[i].id, ai_chance_ranges[x][2]);

                  //Execute effect
                  if (option_obj.effect)
                    try {
                      option_obj.effect(usr.events[i].scopes);
                    } catch (e) {
                      console.error(e);
                    }
                }
            } else {
              var dice_roll = randomNumber(0, event_options.length - 1);

              //See where the dice roll landed
              var option_obj = getOption(usr.events[i].id, event_options[dice_roll].id);

              //Execute effect
              if (option_obj.effect)
                option_obj.effect(usr.events[i].options);
            }

          //Push to removal array
          events_to_remove.push(i);
        }
      }

      //Remove all events in events_to_remove
      for (var i = events_to_remove.length - 1; i >= 0; i--)
        usr.events.splice(events_to_remove[i], 1);
    } catch (e) {
      console.log(e);
    }
    console.timeEnd(`Events processing!`);

    console.time(`Market processing!`);
    //Market processing
    try {
      //Reduce maximum transaction amount from the Global Market to 20% of total Shipment Capacity after 10 turns, or whatever it is set to in defines
      if (usr.country_age > 10)
        usr.modifiers.maximum_transaction_amount = config.defines.economy.resource_max_percentile;
    } catch (e) {
      console.log(e);
    }
    console.timeEnd(`Market processing!`);

    console.time(`Military processing!`);
    //Military processing
    try {
      //Process upkeep first
      processArmyMaintenance(user_id);

      //Mobilisation processing
      {
        if (usr.mobilisation.is_mobilised) {
          //Update local tracker variables
          var new_manpower_mobilised = 0;

          //Mobilise more people if current_manpower_mobilised is not the same as total_manpower_mobilised
          if (usr.mobilisation.current_manpower_mobilised < usr.mobilisation.total_manpower_mobilised)
            new_manpower_mobilised += Math.ceil(usr.mobilisation.total_manpower_mobilised/usr.mobilisation.original_duration);

          //How to deal with rounding?
          new_manpower_mobilised = Math.min(new_manpower_mobilised, usr.mobilisation.total_manpower_mobilised - usr.mobilisation.current_manpower_mobilised);

          usr.mobilisation.current_manpower_mobilised += new_manpower_mobilised;
          usr.reserves[usr.mobilisation.mobilised_type] += new_manpower_mobilised;

          //Decrement duration
          if (usr.mobilisation.duration > 0)
            usr.mobilisation.duration--;
        }
      }
    } catch (e) {
      console.log(e);
    }
    console.timeEnd(`Military processing!`);

    console.time(`Politics processing!`);
    //Politics processing
    try {
      //Political Discontent Modifiers - Keep at top, applies political modifiers
      {
        //Subtract first to level the playing field
        usr.modifiers.political_capital_gain -= usr.political_capital_gain_modifier;
        usr.modifiers.reform_desire_gain -= usr.political_reform_desire_modifier;
        usr.modifiers.stability_modifier -= usr.political_instability_modifier;

        usr.political_capital_gain_modifier = 0;
        usr.political_reform_desire_modifier = 0;
        usr.political_instability_modifier = 0;

        //Negatively impacts stability and political capital gain; only begins impacting if party discontent is over 25.

        for (var i = 0; i < all_governments.length; i++) {
          var government_obj = config.governments[all_governments[i]];
          var local_government = usr.politics[all_governments[i]];

          if (local_government.popularity > 0)
            if (local_government.discontent > 25) {
              usr.political_capital_gain_modifier += -5*local_government.popularity*local_government.discontent;
              usr.political_reform_desire_modifier += 0.2*local_government.popularity*local_government.discontent;
              usr.political_instability_modifier += 35*local_government.popularity*local_government.discontent;
            } else {
              usr.political_capital_gain_modifier += 5*local_government.popularity*local_government.discontent;
              usr.political_reform_desire_modifier += -0.2*local_government.popularity*local_government.discontent;
              usr.political_instability_modifier += -35*local_government.popularity*local_government.discontent;
            }
        }

        //Stability-cap, cap before re-adding
        usr.political_instability_modifier = Math.max(usr.political_instability_modifier, -0.35);
        usr.political_instability_modifier = Math.min(usr.political_instability_modifier, 0.50);

        usr.political_capital_gain_modifier = Math.max(usr.political_capital_gain_modifier, 0);

        //Reapply modifiers
        usr.modifiers.political_capital_gain += usr.political_capital_gain_modifier;
        usr.modifiers.reform_desire_gain += usr.political_reform_desire_modifier;
        usr.modifiers.stability_modifier += usr.political_instability_modifier;

        //Institute cap
        usr.modifiers.political_capital_gain = Math.max(usr.modifiers.political_capital_gain, 5);
        usr.modifiers.political_capital_gain = Math.min(usr.modifiers.political_capital_gain, 200);

        usr.modifiers.reform_desire_gain = Math.max(usr.modifiers.reform_desire_gain, -0.25);
        usr.modifiers.reform_desire_gain = Math.min(usr.modifiers.reform_desire_gain, 0.2);
      }

      //Coup
      if (usr.coup_this_turn != "") {
        setGovernment(user_id, usr.coup_this_turn);

        //Reset coup_this_turn so we don't coup 24/7
        usr.actions = 0;
        usr.coup_this_turn = "";
      }

      //Party drift
      {
        var most_popular_party = [0, ""]; //[percentage, party_name];
        var total_change = 0;

        for (var i = 0; i < all_governments.length; i++) {
          var local_government = usr.politics[all_governments[i]];

          if (local_government.popularity > most_popular_party[0])
            most_popular_party = [local_government.popularity, all_governments[i]];

          if (usr.available_governments.includes(all_governments[i])) {
            total_change += local_government.drift;

            if (local_government.drift)
              addPartyPopularity(user_id, { ideology: all_governments[i], amount: local_government.drift });
          }
        }

        //Party popularity handler
        if (most_popular_party[1] == "") {
          usr.politics[usr.government].popularity = 1;
          most_popular_party = [1, usr.government];
        }

        var most_popular_party_obj = usr.politics[most_popular_party[1]];

        most_popular_party_obj.popularity = Math.max(most_popular_party_obj.popularity, 0);

        //Reconduct check after processing
        for (var i = 0; i < all_governments.length; i++)
          if (local_government.popularity > most_popular_party[0])
            most_popular_party = [usr.politics[all_governments[i]].popularity, all_governments[i]];

        //Conduct election if more than 5 turns have passed since the last one
        if (main.round_count >= usr.last_election + 5) {
          var election_winner = most_popular_party[1];

          if (config.governments[usr.government].effect)
            if (config.governments[usr.government].effect.has_elections)
              setGovernment(user_id, election_winner);

          //Set last election
          usr.last_election = main.round_count;
        }

        //Reset political parties if anarchy
        if (config.governments[usr.government].is_anarchy)
          for (var i = 0; i < all_governments.length; i++)
            if (!config.governments[all_governments[i]].is_anarchy)
              usr.politics[all_governments[i]].popularity = 0;

        usr.politics[usr.government].popularity = 1;
      }

      //Political Capital
      {
        usr.modifiers.political_capital += getPoliticalCapitalGain(user_id);
      }

      //Reform Desire
      {
        var total_reform_desire_gain = usr.modifiers.reform_desire_gain;

        for (var i = 0; i < all_governments.length; i++) {
          var government_obj = config.governments[all_governments[i]];
          var local_government = usr.politics[all_governments[i]];

          if (local_government.popularity > 0)
            if (government_obj.effect.reform_desire_gain)
              total_reform_desire_gain += government_obj.effect.reform_desire_gain*local_government.popularity;
        }

        total_reform_desire_gain = Math.min(total_reform_desire_gain, 0.09); //9% cap

        usr.modifiers.reform_desire += total_reform_desire_gain;

        //Cap off reform desire at 0-100%
        usr.modifiers.reform_desire = Math.max(usr.modifiers.reform_desire, 0);
        usr.modifiers.reform_desire = Math.min(usr.modifiers.reform_desire, 1);

        //If no reforms are unlocked, reset reform_desire
        if (usr.available_reforms.length == 0)
          usr.modifiers.reform_desire = 0;

        //Check if reform desire is at 100%, if so, add discontent to all parties with a popularity greater than 0%
        if (usr.modifiers.reform_desire >= 1)
          for (var i = 0; i < all_governments.length; i++) {
            var local_government = usr.politics[all_governments[i]];

            if (local_government.popularity > 0)
              local_government.discontent = Math.min(local_government.discontent + 10, 100);
          }
      }

      //Stability
      {
        var government_stability_modifier = getGovernmentStabilityModifier(user_id);
        var low_party_popularity = false;
        var popularity_stability_modifier = usr.politics[usr.government].popularity*0.75;

        //Calculate stability
        usr.modifiers.stability = getStability(user_id);

        //Cap off stability
        usr.modifiers.stability = Math.min(usr.modifiers.stability, 1);
        usr.modifiers.stability = Math.max(usr.modifiers.stability, 0);

        if (usr.country_age > 10) {
          //Check for dice roll and low party popularity
          var dice_roll = randomNumber(0, 100)/100;

          for (var i = 0; i < all_governments.length; i++)
            if (usr.politics[all_governments[i]].popularity >= config.defines.politics.coup_popularity_threshold)
              if (all_governments[i] != usr.government)
                low_party_popularity = true;

          if (dice_roll > usr.modifiers.stability + config.defines.politics.revolt_threshold) {
            //Fetch list of valid governments to coup to
            var coup_list = JSON.parse(JSON.stringify(usr.available_governments));
            removeElement(coup_list, usr.government);

            if (low_party_popularity)
              if (coup_list.length > 0) {
                var new_government = randomElement(coup_list);

                //Set new government
                setGovernment(user_id, new_government);

                //Reset actions and tax rate
                usr.actions = 0;
              }
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
    console.timeEnd(`Politics processing!`);

    console.time(`Pop processing!`);
    //Pop processing
    try {
      //Cultural assimilations
      {
        var assimilations_to_remove = [];
        var cultural_integrations_to_remove = [];

        //Cultural integrations
        for (var i = 0; i < usr.pops.cultural_integrations.length; i++) {
          usr.pops.cultural_integrations[i].duration--;

          if (usr.pops.cultural_integrations[i].duration <= 0) {
            var local_culture = getCulture(usr.pops.cultural_integrations[i].culture_id);

            local_culture.accepted_culture.push(actual_id);
            cultural_integrations_to_remove.push(i);
          }
        }

        //Remove cultural integrations
        for (var i = cultural_integrations_to_remove.length - 1; i >= 0; i--)
          usr.pops.assimilations.splice(cultural_integrations_to_remove[i], 1);

        //Province assimilations
        for (var i = 0; i < usr.pops.assimilations.length; i++) {
          var local_province = getProvince(usr.pops.assimilations[i].province_id);

          usr.pops.assimilations[i].duration--;

          if (usr.pops.assimilations[i].duration <= 0)
            if (local_province.controller == actual_id) {
              local_province.culture = usr.pops.assimilations[i].culture_id;
              assimilations_to_remove.push(i);
            }
        }

        //Remove assimilations
        for (var i = assimilations_to_remove.length - 1; i >= 0; i--)
          usr.pops.assimilations.splice(assimilations_to_remove[i], 1);
      }

      //Economic processing
      {
        for (var i = 0; i < controlled_provinces.length; i++) {
          var province_obj = controlled_provinces[i];

          //Remove original province trackers
          if (controlled_provinces[i].trackers) {
            var all_province_trackers = Object.keys(controlled_provinces[i].trackers);

            for (var x = 0; x < all_province_trackers.length; x++)
              if (
                all_province_trackers[x].startsWith("birth-") ||
                all_province_trackers[x].startsWith("death-") ||
                all_province_trackers[x].startsWith("demote-") ||
                all_province_trackers[x].startsWith("emigration-") ||
                all_province_trackers[x].startsWith("immigration-") ||
                all_province_trackers[x].startsWith("promote-")
              )
                  delete controlled_provinces[i].trackers[all_province_trackers[x]];
          }

          processPops(controlled_provinces[i].id);
          processPurchases(controlled_provinces[i].id);

          //Recalculate province population afterwards
          var province_population = 0;

          for (var x = 0; x < all_pops.length; x++)
            province_population += returnSafeNumber(province_obj.pops[all_pops[x]]);
          province_obj.pops.population = province_population;
        }
      }

      //Population modifiers
      {
        for (var i = 0; i < all_pops.length; i++) {
          var local_pop = config.pops[all_pops[i]];
          var modifier_scope = {};

          //Remove previous modifiers!
          if (usr.pops[`${all_pops[i]}_cached_modifiers`]) {
            var local_modifier_scope = usr.pops[`${all_pops[i]}_cached_modifiers`];
            var all_previous_modifiers = Object.keys(local_modifier_scope);

            for (var x = 0; x < all_previous_modifiers.length; x++)
              if (usr.modifiers[all_previous_modifiers[x]])
                local_modifier_scope[all_previous_modifiers[x]] =
                  local_modifier_scope[all_previous_modifiers[x]]*-1;
              else
                //Delete to make sure resources and other thingies don't get applied twice!
                delete local_modifier_scope[all_previous_modifiers[x]];

            applyModifiers(user_id, local_modifier_scope);

            delete usr.pops[`${all_pops[i]}_cached_modifiers`];
          }

          if (local_pop.per_100k) {
            //Add to modifier_scope
            var all_pop_modifiers = Object.keys(local_pop.per_100k);

            for (var x = 0; x < all_pop_modifiers.length; x++)
              modifier_scope[all_pop_modifiers[x]] = (modifier_scope[all_pop_modifiers[x]]) ?
                modifier_scope[all_pop_modifiers[x]] + local_pop.per_100k[all_pop_modifiers[x]]*(usr.pops[all_pops[i]]/100000) :
                local_pop.per_100k[all_pop_modifiers[x]]*(usr.pops[all_pops[i]]/100000);
          }

          if (local_pop.max_modifier_limit) {
            var all_pop_modifiers = Object.keys(local_pop.max_modifier_limit);

            for (var x = 0; x < all_pop_modifiers.length; x++)
              modifier_scope[all_pop_modifiers[x]] =
                Math.min(modifier_scope[all_pop_modifiers[x]], local_pop.max_modifier_limit[all_pop_modifiers[x]]);
          }

          usr.pops[`${all_pops[i]}_cached_modifiers`] = modifier_scope;

          //Apply modifiers
          applyModifiers(user_id, modifier_scope);
        }
      }

      //Remove all assimilations_to_remove
      for (var i = assimilations_to_remove.length - 1; i >= 0; i--)
        usr.pops.assimilations.splice(events_to_remove[i], 1);

      //Remove all cultural_integrations_to_remove
      for (var i = cultural_integrations_to_remove.length - 1; i >= 0; i--)
        usr.pops.cultural_integrations.splice(cultural_integrations_to_remove[i], 1);
    } catch (e) {
      console.log(e);
    }
    console.timeEnd(`Pop processing!`);

    console.time(`Resources and RGO processing!`);
    //Resources and RGO
    {
      //Reset all good modifiers first so that local RGO buffs from cities can be applied
      for (var i = 0; i < all_good_names.length; i++)
        usr.modifiers[`${all_good_names[i]}_gain`] = 1;

      for (var i = 0; i < all_cities.length; i++) {
        //Clear city modifiers
        delete all_cities[i].bombed_this_turn;

        usr.modifiers[`${all_cities[i].resource}_gain`] += getCityRGOThroughput(all_cities[i]);
      }
    }
    console.timeEnd(`Resources and RGO processing!`);

    console.time(`Tech processing!`);
    //Technology
    try {
      var emptied_research_slots = 0;

      //Research processing
      {
        //Only process techs if it is a simulation
        if (!options.is_simulation) {
          var knowledge_investment = (usr.researching.length != 1) ?
            config.defines.technology.max_knowledge_investment*usr.modifiers.knowledge_investment_limit :
            1;
          var research_removal_array = [];
          var total_knowledge_gain = getKnowledgeGain(user_id, all_production.knowledge);
            total_knowledge_gain = randomNumber(total_knowledge_gain[0], total_knowledge_gain[1]);

          for (var i = usr.researching.length - 1; i >= 0; i--) {
            var local_knowledge_gain = Math.floor(total_knowledge_gain/usr.researching.length);
            var max_knowledge_investment = (local_knowledge_gain > usr.researching[i].current_investment) ?
              usr.researching[i].current_investment*knowledge_investment :
              local_knowledge_gain;

            var max_knowledge_investment = (max_knowledge_investment > usr.researching[i].current_investment) ?
              usr.researching[i].current_investment*knowledge_investment :
              Math.floor(total_knowledge_gain/usr.researching.length);

            //Check if tech has finished researching
            if (usr.researching[i].total_research_cost <= usr.researching[i].current_investment + max_knowledge_investment) {
              var local_tech_obj = getTechnology(usr.researching[i].technology);

              //Make sure that tech is not already researched
              if (!usr.researched_technologies.includes(usr.researching[i].technology)) {
                //Technology effect
                usr.researched_technologies.push(usr.researching[i].technology);

                //Parse technology effects
                parseTechnology(user_id, usr.researching[i].technology);
              }

              //Set highest_tier tracking variable if tech cost exceeds previous highest_tier
              usr.highest_tier = (returnSafeNumber(local_tech_obj.research_cost) > usr.highest_tier) ?
                local_tech_obj.research_cost :
                usr.highest_tier;

              //Empty research slots
              emptied_research_slots++;
              usr.researching.splice(i, 1);
            } else {
              usr.researching[i].current_investment += Math.round(max_knowledge_investment);
            }
          }
        }
      }

      //Research queue processing
      {
        var research_queue_removal_array = [];

        for (var i = 0; i < usr.research_queue.length; i++) {
          if (!usr.researched_technologies.includes(usr.research_queue[i])) {
            try {
              //Attempt to research everything in queue
              var research_status = research(user_id, usr.research_queue[i], true, true, all_production.knowledge);

              //If research command went through, remove it from the queue
              if (research_status)
                research_queue_removal_array.push(usr.research_queue[i]);
            } catch (e) {
              console.log(e);
            }
          } else {
            research_queue_removal_array.push(usr.research_queue[i]);
          }
        }

        //Remove any techs that are being researched from the queue
        var is_being_researched = false;

        for (var x = 0; x < usr.researching.length; x++)
          if (usr.researching[x].technology == usr.research_queue[i])
            is_being_researched = true;

        if (is_being_researched)
          research_queue_removal_array.push(usr.research_queue[i]);

        //Remove research_queue_removal_array from research_queue
        for (var i = 0; i < research_queue_removal_array.length; i++)
          removeElement(usr.research_queue, research_queue_removal_array[i]);
      }
    } catch (e) {
      console.log(e);
    }
    console.timeEnd(`Tech processing!`);

    console.time(`Trade processing!`);
    //Trade
    try {
      //Autotrade processing
      var all_auto_trades = Object.keys(usr.auto_trades);
      var trade_whitelist = getTradeWhitelist(user_id);

      for (var i = 0; i < all_auto_trades.length; i++) {
        var local_auto_trade = usr.auto_trades[all_auto_trades[i]];

        //Initiate local shipment to user per turn
        if (trade_whitelist.includes(local_auto_trade.target)) {
          if (local_auto_trade.good_type)
            give(
              local_auto_trade.exporter,
              local_auto_trade.target,

              local_auto_trade.amount,
              local_auto_trade.good_type,
              { hide_display: true }
            );
        } else {
          //Delete shipment because trade is being steered
          delete usr.auto_trades[all_auto_trades[i]];
        }
      }

      //Conventional trade processing
      var all_exports = Object.keys(usr.trades);

      for (var i = 0; i < all_exports.length; i++) {
        var local_export = usr.trades[all_exports[i]];

        local_export.duration--;

        //Finish export if no time is left remaining
        if (local_export.duration <= 0) {
          var target_user = main.users[local_export.target];

          //Transfer goods to target
          if (getGood(local_export.good_type))
            target_user.inventory[local_export.good_type] += local_export.amount;
          if (local_export.good_type == "money")
            target_user.money += local_export.amount;

          //Remove local_export
          delete usr.trades[all_exports[i]];
        }
      }
    } catch (e) {
      console.log(e);
    }
    console.timeEnd(`Trade processing!`);

    console.time(`War exhaustion processing!`);
    //War Exhaustion
    try {
      //Blockades
      if (isBlockaded(user_id))
        if (isBlockadedInArmistice(user_id))
          if (usr.blockaded.blockaded_war_exhaustion + config.defines.combat.war_exhaustion_blockade_rate < config.defines.combat.war_exhaustion_blockade_limit) {
            var blockading_users = getBlockadingUsers(user_id);
            var local_war_exhaustion_rate = (config.defines.combat.war_exhaustion_blockade_limit - usr.blockaded.blockaded_war_exhaustion < config.defines.combat.war_exhaustion_blockade_rate) ?
              config.defines.combat.war_exhaustion_blockade_limit - usr.blockaded.blockaded_war_exhaustion :
              config.defines.combat.war_exhaustion_blockade_rate;

            usr.blockaded.blockaded_war_exhaustion += returnSafeNumber(local_war_exhaustion_rate);
            usr.modifiers.war_exhaustion += returnSafeNumber(local_war_exhaustion_rate);

            //Add local warscore for all blockading users
            for (var i = 0; i < blockading_users.length; i++)
              for (var x = 0; x < all_wars.length; x++) {
                var local_war = main.global.wars[all_wars[x]];

                //Check if blockading_users[i] and user_id are both in the same war on opposite sides
                var friendly_side = "neutral";
                var opposing_side = "neutral";

                if (local_war.attackers.includes(blockading_users[i])) {
                  opposing_side = "attackers";
                  friendly_side = "defenders";
                }
                if (local_war.defenders.includes(blockading_users[i])) {
                  opposing_side = "defenders";
                  friendly_side = "attackers";
                }

                //Check to see that they're both involved in the war
                if (friendly_side != "neutral" && opposing_side != "neutral")
                  if (friendly_side != opposing_side) {
                    //Add _warscore to users by contribution
                    var local_user_contribution = getBlockadingUserContribution(blockading_users[i], user_id);

                    //Add to war_exhaustion
                    modifyWarscore(user_id, local_war, returnSafeNumber(local_war_exhaustion_rate*local_user_contribution));
                  }
              }
          }

      //Mobilisation
      if (usr.mobilisation.is_mobilised) {
        usr.modifiers.war_exhaustion += returnSafeNumber(config.defines.combat.war_exhaustion_mobilisation_rate);

        if (!is_being_justified_on && all_enemies.length == 0)
          usr.modifiers.infamy += config.defines.combat.peacetime_mobilisation_penalty;
      }

      //Occupation
      var enemies = getEnemies(user_id);
      var occupation_war_exhaustion = 0;
      var occupied_provinces = getEnemyOccupiedProvinces(user_id).length;

      //A full siege of the target user ticks up warscore by 10% per turn unless fully sieged down
      if (occupied_provinces >= owned_provinces.length) {
        occupation_war_exhaustion = 1;
        usr.modifiers.war_exhaustion = 1;
      } else {
        occupation_war_exhaustion = returnSafeNumber(parseFloat(((occupied_provinces/owned_provinces.length)*0.1).toFixed(2)));
        usr.modifiers.war_exhaustion += occupation_war_exhaustion;
      }

      //Iterate over all occupying users to modify their warscore
      for (var i = 0; i < enemies.length; i++)
        for (var x = 0; x < all_wars.length; x++) {
          var local_war = main.global.wars[all_wars[x]];

          //Check if enemies[i] and user_id are both in the same war on opposite sides
          var friendly_side = "neutral";
          var opposing_side = "neutral";

          if (local_war.attackers.includes(enemies[i])) {
            opposing_side = "attackers";
            friendly_side = "defenders";
          }
          if (local_war.defenders.includes(enemies[i])) {
            opposing_side = "defenders";
            friendly_side = "attackers";
          }

          //Check to see that they're both involved in the war
          if (friendly_side != "neutral" && opposing_side != "neutral")
            if (friendly_side != opposing_side) {
              //Add _warscore to users by contribution
              var local_blockade_contribution = getBlockadingUserContribution(enemies[i], user_id);
              var local_occupation_contribution = getOccupyingUserContribution(enemies[i], user_id)*occupation_war_exhaustion;

              modifyWarscore(enemies[i], local_war, local_blockade_contribution + local_occupation_contribution);
            }
        }
    } catch (e) {
      console.log(e);
    }
    console.timeEnd(`War exhaustion processing!`);

    console.time(`Modifier cap processing!`);
    //Modifier cap handlers - KEEP AT BOTTOM!
    {
      //Diplomatic modifiers
      usr.modifiers.infamy = Math.min(Math.max(usr.modifiers.infamy, 0), 1);
      usr.modifiers.war_exhaustion = Math.min(Math.max(usr.modifiers.war_exhaustion, 0), 1);

      //Economic modifiers
      //Make sure good amount can't go lower than 0
      for (var i = 0; i < lookup.all_good_names.length; i++) {
        var local_amount = usr.inventory[lookup.all_good_names[i]];

        if (local_amount < 0 || local_amount == -0)
          usr.inventory[lookup.all_good_names[i]] = 0;
      }

      //Political modifiers
      balanceParties(user_id);
    }
    console.timeEnd(`Modifier cap processing!`);

    console.time(`Post-tracker processing!`);
    //Post-tracker processing - KEEP AT BOTTOM!
    {
      //Update pop trackers
      getDemographics(user_id);
    }
    console.timeEnd(`Post-tracker processing!`);

    console.time(`Simulation processing!`);
    //Simulation handler
    try {
      if (options.is_simulation) {
        var simulated_results = JSON.parse(JSON.stringify(usr));

        //Restore presimulation state
        delete main.users[actual_id];
        delete main.global.user_map[user_id];

        //Return statement
        return simulated_results;
      }
    } catch (e) {
      console.log(e);
    }
    console.timeEnd(`Simulation processing!`);

    //Re-delete key if user is resigned
    if (is_resigned_user)
      delete main.global.user_map[user_id];

    //Return statement
    return main.users[actual_id];
  }
}
