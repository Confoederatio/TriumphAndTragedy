module.exports = {
  initGlobalLoop: function () {
    try {
      initGlobal();
    } catch {
      setTimeout(function(){
        module.exports.initGlobalLoop();
      }, 1000);
    }
  },

  loadBotFiles: function () {
    //Automated Backup and Restoration System (ABRS)
    FileManager.import("./ABRS");

    //Base JS QOL functions
    FileManager.import("./framework/discord/arrays");
    FileManager.import("./framework/discord/colours");
    FileManager.import("./framework/discord/log");
    FileManager.import("./framework/discord/numbers");
    FileManager.import("./framework/discord/statistics");
    FileManager.import("./framework/discord/strings");

    //Debug
    FileManager.import("./framework/debug/buildings.js");
    FileManager.import("./framework/debug/countries.js");
    FileManager.import("./framework/debug/date.js");
    FileManager.import("./framework/debug/diplomacy.js");
    FileManager.import("./framework/debug/games.js");
    FileManager.import("./framework/debug/goods.js");
    FileManager.import("./framework/debug/governments.js");
    FileManager.import("./framework/debug/map.js");
    FileManager.import("./framework/debug/politics.js");
    FileManager.import("./framework/debug/pops.js");
    FileManager.import("./framework/debug/provinces.js");
    FileManager.import("./framework/debug/research.js");
    FileManager.import("./framework/debug/turns.js");
    FileManager.import("./framework/debug/units.js");

    //Discord.js QOL functions
    FileManager.import("./framework/discord/button_handler");
    FileManager.import("./framework/discord/channels");
    FileManager.import("./framework/discord/command_handler");
    FileManager.import("./framework/discord/date");
    FileManager.import("./framework/discord/games");
    FileManager.import("./framework/discord/inactivity_clearer");
    FileManager.import("./framework/discord/objects");
    FileManager.import("./framework/discord/permissions_handler");
    FileManager.import("./framework/discord/reaction_framework");
    FileManager.import("./framework/discord/select_handler");
    FileManager.import("./framework/discord/ui_framework");
    FileManager.import("./framework/discord/users");

    //Framework files - these contain all the main game functions, and parsers for common/
    FileManager.import("./framework/data/buildings/building_framework");
    FileManager.import("./framework/data/buildings/building_statistics_framework");

    FileManager.import("./framework/data/pops/pop_econ_framework");
    FileManager.import("./framework/data/pops/pop_framework");
    FileManager.import("./framework/data/pops/pop_needs_framework");
    FileManager.import("./framework/data/pops/pop_statistics_framework");

    FileManager.import("./framework/data/alert_framework");
    FileManager.import("./framework/data/army_framework");
    FileManager.import("./framework/data/base_user_initialisation");
    FileManager.import("./framework/data/blockade_framework");
    FileManager.import("./framework/data/budget_framework");
    FileManager.import("./framework/data/casus_belli_framework");
    FileManager.import("./framework/data/client_state_framework");
    FileManager.import("./framework/data/colonisation_framework");
    FileManager.import("./framework/data/combat_framework");
    FileManager.import("./framework/data/culture_framework");
    FileManager.import("./framework/data/diplomacy_framework");
    FileManager.import("./framework/data/events_framework");
    FileManager.import("./framework/data/global_initialisation");
    FileManager.import("./framework/data/goods_framework");
    FileManager.import("./framework/data/government_framework");
    FileManager.import("./framework/data/laws_framework");
    FileManager.import("./framework/data/localisation_framework");
    FileManager.import("./framework/data/national_modifier_framework");
    FileManager.import("./framework/data/market_framework");
    FileManager.import("./framework/data/modifier_framework");
    FileManager.import("./framework/data/optimisation_framework");
    FileManager.import("./framework/data/peace_treaty_framework");
    FileManager.import("./framework/data/politics_framework");
    FileManager.import("./framework/data/queue_framework");
    FileManager.import("./framework/data/tech_framework");
    FileManager.import("./framework/data/trade_framework");
    FileManager.import("./framework/data/turn_framework");
    FileManager.import("./framework/data/unit_framework");
    FileManager.import("./framework/data/user_framework");
    FileManager.import("./framework/data/war_framework");
    FileManager.import("./framework/data/wargoal_framework");

    //Map viewer and renderer files
    FileManager.import("./framework/map/atlas_renderer");
    FileManager.import("./framework/map/map_renderer");
    FileManager.import("./framework/map/new_map_renderer");
    FileManager.import("./framework/map/province_renderer");

    //Multicore handling
    FileManager.import("./multicore/multicore_framework.js");
    FileManager.import("./multicore/thread_1_handler.js");
    FileManager.import("./multicore/thread_2_handler.js");
    FileManager.import("./multicore/thread_3_handler.js");

    //Page handler files
    FileManager.import("./framework/ui/page_handler/debug_page_handler/debug");

    FileManager.import("./framework/ui/page_handler/alerts");
    FileManager.import("./framework/ui/page_handler/budget");
    FileManager.import("./framework/ui/page_handler/buildings_cities");
    FileManager.import("./framework/ui/page_handler/colonisation");
    FileManager.import("./framework/ui/page_handler/country_interface");
    FileManager.import("./framework/ui/page_handler/diplomacy");
    FileManager.import("./framework/ui/page_handler/economy");
    FileManager.import("./framework/ui/page_handler/events");
    FileManager.import("./framework/ui/page_handler/global_commands");
    FileManager.import("./framework/ui/page_handler/government");
    FileManager.import("./framework/ui/page_handler/main_menu");
    FileManager.import("./framework/ui/page_handler/map");
    FileManager.import("./framework/ui/page_handler/military");
    FileManager.import("./framework/ui/page_handler/modifiers");
    FileManager.import("./framework/ui/page_handler/politics");
    FileManager.import("./framework/ui/page_handler/pops");
    FileManager.import("./framework/ui/page_handler/province");
    FileManager.import("./framework/ui/page_handler/technology");
    FileManager.import("./framework/ui/page_handler/trade");

    //UI files
    FileManager.import("./framework/ui/alert_interface");
    FileManager.import("./framework/ui/army_interface");
    FileManager.import("./framework/ui/buildings_interface");
    FileManager.import("./framework/ui/budget_interface");
    FileManager.import("./framework/ui/casus_belli_interface");
    FileManager.import("./framework/ui/client_state_interface");
    FileManager.import("./framework/ui/colonisation_interface");
    FileManager.import("./framework/ui/country_interface");
    FileManager.import("./framework/ui/country_picker_interface");
    FileManager.import("./framework/ui/culture_interface");
    FileManager.import("./framework/ui/customisation_interface");
    FileManager.import("./framework/ui/diplomacy_interface");
    FileManager.import("./framework/ui/economy_interface");
    FileManager.import("./framework/ui/events_interface");
    FileManager.import("./framework/ui/global_market_interface");
    FileManager.import("./framework/ui/government_interface");
    FileManager.import("./framework/ui/laws_interface");
    FileManager.import("./framework/ui/main_menu_interface");
    FileManager.import("./framework/ui/map_viewer");
    FileManager.import("./framework/ui/military_interface");
    FileManager.import("./framework/ui/modifier_interface");
    FileManager.import("./framework/ui/national_modifier_interface");
    FileManager.import("./framework/ui/page_handler");
    FileManager.import("./framework/ui/peace_treaty_interface");
    FileManager.import("./framework/ui/politics_interface");
    FileManager.import("./framework/ui/pops_interface");
    FileManager.import("./framework/ui/provinces_interface");
    FileManager.import("./framework/ui/queue_interface");
    FileManager.import("./framework/ui/tech_interface");
    FileManager.import("./framework/ui/tooltip_interface");
    FileManager.import("./framework/ui/topbar_interface");
    FileManager.import("./framework/ui/trade_interface");
    FileManager.import("./framework/ui/unit_interface");
    FileManager.import("./framework/ui/war_interface");

    //Game command files, broken up by ./game/(mechanic)/(command)
    {
      FileManager.import("./game/actions/chop");
      FileManager.import("./game/actions/mine");
      FileManager.import("./game/actions/quarry");

      FileManager.import("./game/buildings/build");
      FileManager.import("./game/buildings/demolish");
      FileManager.import("./game/buildings/production_choices");
      FileManager.import("./game/buildings/rename_building");
      FileManager.import("./game/buildings/reopen");
      FileManager.import("./game/buildings/subsidies");
      FileManager.import("./game/buildings/view_building");

      FileManager.import("./game/budget/add_tax");
      FileManager.import("./game/budget/move_tax");
      FileManager.import("./game/budget/remove_tax");
      FileManager.import("./game/budget/set_tax"); //For setting predefined taxes

      FileManager.import("./game/colonisation/cancel_charter");
      FileManager.import("./game/colonisation/settle");

      FileManager.import("./game/country/rename_country");
      FileManager.import("./game/country/rename_primary_culture");
      FileManager.import("./game/country/set_colour");
      FileManager.import("./game/country/set_flag");
      FileManager.import("./game/country/set_motto");

      FileManager.import("./game/culture/add_accepted_culture");
      FileManager.import("./game/culture/assimilate_all");
      FileManager.import("./game/culture/assimilate");
      FileManager.import("./game/culture/remove_accepted_culture");
      FileManager.import("./game/culture/rename_culture_adjective");
      FileManager.import("./game/culture/rename_culture");

      FileManager.import("./game/diplomacy/allow_cede");
      FileManager.import("./game/diplomacy/ally");
      FileManager.import("./game/diplomacy/annex");
      FileManager.import("./game/diplomacy/armistice");
      FileManager.import("./game/diplomacy/break_alliance");
      FileManager.import("./game/diplomacy/call_ally");
      FileManager.import("./game/diplomacy/cancel_justification");
      FileManager.import("./game/diplomacy/cancel_military_access");
      FileManager.import("./game/diplomacy/cancel_wargoal");
      FileManager.import("./game/diplomacy/ceasefire");
      FileManager.import("./game/diplomacy/cede_province");
      FileManager.import("./game/diplomacy/declare_war");
      FileManager.import("./game/diplomacy/decrease_relations");
      FileManager.import("./game/diplomacy/deny_cede");
      FileManager.import("./game/diplomacy/delete_peace_treaty");
      FileManager.import("./game/diplomacy/end_rivalry");
      FileManager.import("./game/diplomacy/improve_relations");
      FileManager.import("./game/diplomacy/intervene_in_war");
      FileManager.import("./game/diplomacy/invite_vassal_player");
      FileManager.import("./game/diplomacy/justify_war");
      FileManager.import("./game/diplomacy/kick_vassal_player");
      FileManager.import("./game/diplomacy/liberate");
      FileManager.import("./game/diplomacy/lead_war");
      FileManager.import("./game/diplomacy/lock_vassal_customisation");
      FileManager.import("./game/diplomacy/merge_war");
      FileManager.import("./game/diplomacy/military_access");
      FileManager.import("./game/diplomacy/non_aggression_pact");
      FileManager.import("./game/diplomacy/proclaim_guarantee");
      FileManager.import("./game/diplomacy/recall_volunteers");
      FileManager.import("./game/diplomacy/rename_peace_treaty");
      FileManager.import("./game/diplomacy/rename_vassal_city");
      FileManager.import("./game/diplomacy/rename_vassal_culture");
      FileManager.import("./game/diplomacy/rename_vassal");
      FileManager.import("./game/diplomacy/repatriate_volunteers");
      FileManager.import("./game/diplomacy/revoke_guarantee");
      FileManager.import("./game/diplomacy/revoke_military_access");
      FileManager.import("./game/diplomacy/rival");
      FileManager.import("./game/diplomacy/send_peace_treaty");
      FileManager.import("./game/diplomacy/send_volunteers");
      FileManager.import("./game/diplomacy/set_vassal_colour");
      FileManager.import("./game/diplomacy/set_vassal_flag");
      FileManager.import("./game/diplomacy/set_vassal_motto");
      FileManager.import("./game/diplomacy/sign_peace_treaty");
      FileManager.import("./game/diplomacy/surrender");
      FileManager.import("./game/diplomacy/vassalise");
      FileManager.import("./game/diplomacy/view_peace_treaty");

      FileManager.import("./game/laws/enact_reform");

      FileManager.import("./game/market/buy");
      FileManager.import("./game/market/sell");

      FileManager.import("./game/military/air_raid");
      FileManager.import("./game/military/blockade");
      FileManager.import("./game/military/carpet_siege");
      FileManager.import("./game/military/challenge_blockade");
      FileManager.import("./game/military/change_home_port");
      FileManager.import("./game/military/convoy_raid");
      FileManager.import("./game/military/create_armies");
      FileManager.import("./game/military/create_army");
      FileManager.import("./game/military/delete_all_armies");
      FileManager.import("./game/military/delete_armies");
      FileManager.import("./game/military/delete_army");
      FileManager.import("./game/military/demobilise");
      FileManager.import("./game/military/deploy_units");
      FileManager.import("./game/military/garrison_cities");
      FileManager.import("./game/military/garrison_provinces");
      FileManager.import("./game/military/harbour_raid");
      FileManager.import("./game/military/lift_blockade");
      FileManager.import("./game/military/mass_deploy");
      FileManager.import("./game/military/mass_relieve");
      FileManager.import("./game/military/mass_reorder");
      FileManager.import("./game/military/merge_armies");
      FileManager.import("./game/military/merge_army");
      FileManager.import("./game/military/mobilise");
      FileManager.import("./game/military/move_all_armies");
      FileManager.import("./game/military/move_armies");
      FileManager.import("./game/military/move_army");
      FileManager.import("./game/military/options");
      FileManager.import("./game/military/relieve_units");
      FileManager.import("./game/military/rename_armies");
      FileManager.import("./game/military/rename_army");
      FileManager.import("./game/military/reorder_units");
      FileManager.import("./game/military/split_armies");
      FileManager.import("./game/military/split_army");
      FileManager.import("./game/military/torpedo_fleet");
      FileManager.import("./game/military/transfer_units");

      FileManager.import("./game/politics/coup_government");
      FileManager.import("./game/politics/raise_stability");
      FileManager.import("./game/politics/set_government");
      FileManager.import("./game/politics/support_party");

      FileManager.import("./game/province/cities");
      FileManager.import("./game/province/settle_province");

      FileManager.import("./game/technology/research");
      FileManager.import("./game/technology/research_queue");

      FileManager.import("./game/trade/cancel_auto_trade");
      FileManager.import("./game/trade/create_auto_trade");
      FileManager.import("./game/trade/give");

      FileManager.import("./game/units/craft");
      FileManager.import("./game/units/disband_units");

      FileManager.import("./game/war/rename_war");
    }

    //Log results to console
    log.info(`Script files imported.`);
  },

  restartBot: async function () {
    FileManager.import("./startup");

    module.exports.loadBotFiles();
    module.exports.startBot(true);
  },

  startBot: function (arg0_reload_files) {
    //Convert from parameters
    var faux_restart = arg0_reload_files;

    //Declare config loading order
    global.config = {};
    global.load_order = {
      load_directories: [
        "common",
        "events",
        "interface",
        "localisation"
      ],
      load_files: [
        ".config_backend.js",
        "icons.js"
      ]
    };
    FileManager.loadConfig();
    FileManager.loadFile("./settings.js");

    log.info(`Mod files imported.`);

    //Initialise Discord.js client and related instance variables
    global.backup_loaded = false;
    global.bot_clock = 0;
    global.cache = {};
    global.ignore_channels = (settings.ignore_channels) ? settings.ignore_channels : [];
    global.interfaces = {};
    global.mapmodes = [];
    global.selection_effect_map = {};
    global.visual_prompts = {};

    if (!faux_restart)
      module.exports.startClient();
    log.info(`Client logged in.`);

    try {
      initOptimisation();
    } catch (e) {
      console.log(e);
    }

    //Debug warnings for missing icons
    if (settings.debug_mode)
      if (global.lookup)
        if (global.lookup.all_good_names)
          for (var i = 0; i < lookup.all_good_names.length; i++) {
            var local_good = lookup.all_goods[lookup.all_good_names[i]];

            if (local_good.icon)
              if (!config.icons[local_good.icon])
                log.warn(`${(local_good.name) ? local_good.name : lookup.all_good_names[i]} has no icon ${local_good.icon}!`);
          }

    log.info(`Optimisation cache processed.`);
  },

  startClient: function () {
    global.client = new Discord.Client({ intents: [
      1, 4, 8, 16, 32, 64, 128, 512, 1024, 2048, 4096, 8192, 16384, 32767
    ] });
    client.login(settings.bot_token);

    //Return statement
    return client;
  }
};
