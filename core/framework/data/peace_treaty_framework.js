module.exports = {
  /*
    Peace treaty data structure:
    {
      status_quo: true/false,
      install_government: {
        "actual_user_id": {
          id: "actual_user_id",
          type: "democracy"
        }
      },
      cut_down_to_size: ["actual_user_id", "actual_user_id_2", "actual_user_id_3"],
      liberation: true/false,
      puppet: {
        "actual_user_id": {
          id: "actual_user_id",
          overlord: "overlord_id"
        }
      },
      retake_cores: ["actual_user_id", "actual_user_id_2"],
      annexation: {
        "actual_user_id": {
          id: "actual_user_id",
          provinces: ["4082", "2179", ...],
          annex_all: ["ot_user_id", "ot_user_id2"]
        }
      }
    }

  */

  createPeaceTreaty: function (arg0_user, arg1_war_name) {
    //Convert from parameters
    var user_id = arg0_user;
    var war_name = arg1_war_name.trim().toLowerCase();

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var war_obj = getWar(war_name);

    //Make sure user doesn't already have a peace treaty registered
    if (!war_obj.peace_treaties[actual_id]) {
      var peace_treaty_obj = {
        id: actual_id,
        peace_demands: {}
      };

      war_obj.peace_treaties[actual_id] = peace_treaty_obj;
    }
  },

  deletePeaceTreaty: function (arg0_user, arg1_war_name) {
    //Convert from parameters
    var user_id = arg0_user;
    var war_name = arg1_war_name.trim().toLowerCase();

    //Declare local instance variables
    var actual_id = main.global.user_map[user_id];
    var war_obj = getWar(war_name);

    //Delete peace treaty object
    delete war_obj.peace_treaties[actual_id];
  },

  parsePeaceTreatyString: function (arg0_war_obj, arg1_peace_treaty_object) {
    //Convert from parameters
    var war_obj = arg0_war_obj;
    var peace_obj = arg1_peace_treaty_object;

    //Declare local instance variables
    var all_demands = Object.keys(peace_obj.peace_demands);
    var all_participants = [];
    var friendly_side = "";
    var opposing_side = "";
    var peace_string = [];

    //Fetch friendly side
    if (war_obj.attackers.includes(peace_obj.id)) {
      friendly_side = "attackers";
      opposing_side = "defenders";
    }
    if (war_obj.defenders.includes(peace_obj.id)) {
      friendly_side = "defenders";
      opposing_side = "attackers";
    }

    //Parse through all demands
    for (var i = 0; i < all_demands.length; i++) {
      var local_value = peace_obj.peace_demands[all_demands[i]];

      switch (all_demands[i]) {
        case "status_quo:":
          peace_string.push(`• The opposing side will be required to pay **15%** of their cash reserves as war reparations.`);

          break;
        case "install_government":
          var local_demands = Object.keys(local_value);

          for (var x = 0; x < local_demands.length; x++)
            peace_string.push(`• The nation of **${main.users[local_demands[i]].name}** will be forced to change their government to ${config.governments[local_value[local_demands[i]].type].name.totoLowerCase()}.`);

          break;
        case "cut_down_to_size":
          for (var x = 0; x < local_value.length; x++)
            peace_string.push(`• **${main.users[local_value[x]].name}** will be required to demobilise and disband **90%** of its active forces in all its divisions and armies.`);

          break;
        case "liberation":
          peace_string.push(`• The country of **${main.users[peace_obj.id]}** has demanded their liberation from its overlord.`);

          break;
        case "puppet":
          var local_demands = Object.keys(local_value);

          for (var x = 0; x < local_demands.length; x++)
            peace_string.push(`• **${main.users[local_value[local_demands[x]].overlord].name}** will gain overlordship over the nation of **${main.users[local_demands[x]].name}**.`);

          break;
        case "retake_cores":
          for (var x = 0; x < local_demands.length; x++)
            peace_string.push(`• **${main.users[local_demands[x]].name}** will be returned all of their core provinces from the opposing side.`);

          break;
        case "annexation":
          var local_demands = Object.keys(local_value);

          for (var x = 0; x < local_demands.length; x++)
            if (local_value[local_demands[x]].annex_all)
              for (var y = 0; y < local_value[local_demands[x]].annex_all.length; y++)
                peace_string.push(`• **${main.users[local_value[local_demands[x]].annex_all[y]].name}** will be annexed in their entirety by **${main.users[local_demands[x]].name}**.`);
            else {
              var local_provinces = local_value[local_demands[x]].provinces;
              var lost_provinces = {};

              for (var y = 0; y < local_provinces.length; y++) {
                var local_province = main.provinces[local_provinces[y]];

                if (local_province.owner)
                  if (lost_provinces[local_province.owner])
                    lost_provinces[local_province.owner].push(local_provinces[y]);
                  else
                    lost_provinces[local_province.owner] = [local_provinces[y]];
              }

              var all_losers = Object.keys(lost_provinces);

              for (var y = 0; y < all_losers.length; y++)
                peace_string.push(`• **${main.users[local_demands[x]].name}** will be ceded the provinces of **${lost_provinces[all_losers[y]].join(", ")}** from the nation of **${main.users[all_losers[y]].name}**.`);
            }

          break;
      }
    }

    if (peace_string.length == 0)
      peace_string.push(`• White Peace`);

    //Return statement
    return peace_string;
  },

  parsePeaceTreaty: function (arg0_war_name, arg1_peace_treaty_object) {
    //Convert from parameters
    var war_name = arg0_war_name.trim().toLowerCase();
    var peace_obj = arg1_peace_treaty_object;

    //Declare local instance variables
    var all_demands = Object.keys(peace_obj.peace_demands);
    var all_participants = [];
    var friendly_side = "";
    var opposing_side = "";
    var war_obj = JSON.parse(JSON.stringify(getWar(war_name)));

    //Fetch friendly side
    if (war_obj.attackers.includes(peace_obj.id)) {
      friendly_side = "attackers";
      opposing_side = "defenders";
    }
    if (war_obj.defenders.includes(peace_obj.id)) {
      friendly_side = "defenders";
      opposing_side = "attackers";
    }

    //Archive war
    for (var i = 0; i < war_obj.attackers.length; i++)
      all_participants.push(war_obj.attackers[i]);
    for (var i = 0; i < war_obj.defenders.length; i++)
      all_participants.push(war_obj.defenders[i]);

    archiveWar(war_name);

    //End war first; lift all occupations
    for (var i = 0; i < all_participants.length; i++) {
      var local_provinces = getProvinces(all_participants[i], { include_hostile_occupations: true });
      var local_user = main.users[all_participants[i]];

      for (var x = 0; x < local_provinces.length; x++) {
        if (local_provinces[x].controller != local_provinces[x].owner) {
          //Check if controller is still at war with owner
          if (!areAtWar(local_provinces[x].controller, local_provinces[x].owner))
            //Revert control
            local_provinces[x].controller = local_provinces[x].owner;
        }
      }
    }

    //Parse peace treaty
    for (var i = 0; i < all_demands.length; i++) {
      var local_value = peace_obj.peace_demands[all_demands[i]];

      switch (all_demands[i]) {
        case "status_quo":
          //Extract value from opposing side
          var total_money = 0;

          for (var i = 0; i < war_obj[opposing_side].length; i++) {
            var local_user = main.users[war_obj[opposing_side][i]];

            //Take 15% of their money
            local_user.money -= local_user.money*0.15;
            total_money += Math.ceil(local_user.money*0.15);
          }

          //Distribute total_money equally
          for (var i = 0; i < war_obj[friendly_side].length; i++) {
            var local_user = main.users[war_obj[friendly_side][i]];

            local_user.money += Math.ceil(total_money/war_obj[friendly_side].length);
          }

          break;
        case "install government":
          var local_demands = Object.keys(local_value);

          //Set government for all local demands
          for (var i = 0; i < local_demands.length; i++)
            setGovernment(local_demands[i], local_value[local_demands[i]].type);

          break;
        case "cut_down_to_size":
          //Cuts down each user to 10% of their military size
          for (var i = 0; i < local_value.length; i++) {
            var local_user = main.users[local_value[i]];
            var all_armies = Object.keys(local_user.armies);
            var all_reserve_units = Object.keys(local_user.reserves);

            //Disband all troops in reserves first
            for (var x = 0; x < all_reserve_units.length; x++)
              disbandUnits(local_value[i], Math.ceil(local_user.reserves[all_reserve_units[x]]*0.9), all_reserve_units[x]);

            for (var x = 0; x < all_armies.length; x++) {
              var local_army = local_user.armies[all_armies[x]];
              var all_units = Object.keys(local_army.units);


              //Relieve, then disband
              for (var y = 0; y < all_units.length; y++) {
                var amount = Math.ceil(local_army.units[all_units[y]]*0.9);

                relieveUnits(local_value[i], amount, all_units[y], local_army);
                disbandUnits(local_value[i], amount, all_units[y]);
              }
            }
          }

          break;
        case "liberation":
          //Liberates peace_obj.id from their overlord
          var vassal_obj = getVassal(peace_obj.id);

          if (vassal_obj)
            if (war_obj.attackers.includes(vassal_obj.overlord) || war_obj.defenders.includes(vassal_obj.overlord))
              dissolveVassal(peace_obj.id, vassal_obj.overlord);

          break;
        case "puppet":
          var local_demands = Object.keys(local_value);

          for (var i = 0; i < local_demands.length; i++) {
            var local_user = main.users[local_demands[i]];
            var overlord_id = local_value[local_demands[i]].overlord;
            var overlord_obj = main.users[overlord_id];

            createVassal(local_demands[i], { target: overlord_id });
            overlord_obj.diplomacy.used_diplomatic_slots++;
          }

          break;
        case "retake_cores":
          for (var i = 0; i < local_value.length; i++) {
            var local_user = main.users[local_value[i]];

            //Go through all provinces on opposing side, and if the primary culutre of that province is the primary culture of local_user, set its controller and owner to them
            for (var x = 0; x < war_obj[opposing_side].length; x++) {
              var local_provinces = getProvinces(war_obj[opposing_side], { include_hostile_occupations: true });

              for (var y = 0; y < local_provinces.length; y++) {
                var culture_obj = getCulture(local_provinces[y]);

                if (culture_obj.primary_culture.includes(local_value[i]))
                  transferProvince(local_provinces[y].owner, { target: local_value[i], province_id: local_provinces[y].id });
              }
            }
          }

          break;
        case "annexation":
          var local_demands = Object.keys(local_value);

          for (var i = 0; i < local_demands.length; i++) {
            if (local_value[local_demands[i]].annex_all)
              for (var x = 0; x < local_value[local_demands[i]].length; x++)
                inherit(local_value[local_demands[i]][x], local_demands[i]);
            if (local_value[local_demands[i]].provinces)
              for (var x = 0; x < local_value[local_demands[i]].provinces.length; x++) {
                var is_owned_by_enemy = false;
                var local_province = main.provinces[local_value[local_demands[i]].provinces[x]];

                //Check if the province is owned by enemy in the same war
                if (war_obj[opposing_side].includes(local_province.owner))
                  is_owned_by_enemy = true;

                if (is_owned_by_enemy)
                  transferProvince(local_province.owner, { target: local_demands[i], province_id: local_province.id });
              }
          }

          break;
      }
    }
  }
};
