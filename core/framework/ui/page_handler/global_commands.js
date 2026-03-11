module.exports = {
  pageHandlerGlobalCommands: function (arg0_user, arg1_input) {
    //Convert from parameters
    var arg = arg1_input.split(" ");
    var input = arg1_input;

    //Declare local instance variables
    var actual_id = main.global.user_map[arg0_user];
    var current_page = 0;
    var game_obj = getGameObject(arg0_user);
    var user_id = arg0_user;
    var usr = main.users[actual_id];

    //Make sure user isn't in a visual prompt
    var in_founding_map = (game_obj.page == "founding_map");
    var in_visual_prompt = interfaces[user_id];

    if (in_visual_prompt)
      in_visual_prompt = (in_visual_prompt.type == "visual_prompt");

    //Global commands
    if (!["edit_peace_offer"].includes(game_obj.page)) {
      //[Build]
      if (!game_obj.page.startsWith("view_city")) {
        if (input == "build") {
          visualPrompt(game_obj.alert_embed, user_id, {
            title: `Construct Buildings:`,
            prompts: [
              [`Which city would you like to build in?\n\nType **[View Cities]** for a complete list of your cities.`, "string"],
              [`How many buildings of this type would you like to begin building?`, "number", { min: 1 }],
              [`What would you like to build in your city?\n\nType **[Build List]** for a list of valid buildings.\nType **[Inventory]** to view your inventory.`, "string"]
            ]
          },
          function (arg) {
            build(user_id, arg[0], arg[1], arg[2]);
          },
          function (arg) {
            switch (arg) {
              case "build list":
                createPageMenu(game_obj.middle_embed, {
                  embed_pages: printBuildList(user_id),
                  user: game_obj.user
                });
                return true;

                break;
              case "view cities":
              case "cities list":
                createPageMenu(game_obj.middle_embed, {
                  embed_pages: printProvinces(game_obj.user),
                  user: game_obj.user
                });
                return true;

                break;
              case "inventory":
                printInventory(user_id);
                return true;

                break;
            }
          });

          return true;
        }
      }

      //[Building List]
      if (input == "building list") {
        createPageMenu(game_obj.middle_embed, {
          embed_pages: printBuildList(user_id),
          user: game_obj.user
        });
        game_obj.page = "building_list";

        return true;
      }

      //[Craft]
      if (["craft", "recruit", "train", "train units"].includes(input)) {
        initialiseCraft(user_id);

        return true;
      }

      //[Demolish]
      if (input == "demolish") {
        initialiseDemolish(user_id);

        return true;
      }

      //[Inventory]
      if (["inv", "inventory"].includes(input)) {
        game_obj.page = "inventory";
        printInventory(user_id);

        return true;
      }

      //[Production]
      if (["production", "resource production", "view production"].includes(input)) {
        game_obj.page = "view_production";
        printProduction(user_id);

        return true;
      }

      //[Settle]
      if (input == "settle") {
        initialiseSettle(user_id);

        return true;
      }

      //[Settle (Provinces)]
      if (input.startsWith("settle ") && input != "settle starting provinces") {
        var provinces = input.replace("settle ", "").split(" ");

        for (var i = 0; i < provinces.length; i++)
          provinces[i] = provinces[i].trim();

        //Settle provinces
        settle(user_id, provinces);

        return true;
      }

      //[Set Tax]
      if (input == "set tax") {
        initialiseSetTax(user_id);

        return true;
      }

      //[Unit List]
      if (input == "unit list") {
        createPageMenu(game_obj.middle_embed, {
          embed_pages: printUnitList(game_obj.user),
          user: game_obj.user
        });
        game_obj.page = "unit_list";

        return true;
      }

      //Topbar commands
      {
        if (["exit", "quit", "quit game"].includes(input)) {
          //Create a confirmation dialogue for quitting the game
          returnChannel(game_obj.channel).send("Loading ..").then((msg) => {
            confirmDialogue(msg, {
              text: "**Save and Exit Game**\n\nAre you sure you want to quit the game and return to the main menu?",
              user: game_obj.user,
              delete_after: true
            }, function () {
              clearGame(game_obj.id);
            })
          });

          return true;
        }

        //[Budget]
        if (input == "budget")
          if (game_obj.page != "budget") {
            game_obj.page = "budget";
            printBudget(user_id);
            initialiseTopbar(user_id);

            return true;
          }

        //[Colonisation]
        if (["colonisation", "colonization"].includes(input))
          if (game_obj.page != "colonisation") {
            game_obj.page = "colonisation";
            printColonisation(user_id);
            initialiseTopbar(user_id);

            return true;
          }

        //[Country/Stats/Statistics]
        if (["country", "country interface", "country statistics", "stats", "statistics"].includes(input))
          if (game_obj.page != "country_interface") {
            game_obj.page = "country_interface";
            printStats(user_id);
            initialiseTopbar(user_id);

            return true;
          }

        //[Diplomacy]
        if (input == "diplomacy")
          if (game_obj.page != "diplomacy") {
            game_obj.page = "diplomacy";
            printDiplomacy(user_id);
            initialiseTopbar(user_id);

            return true;
          }

        //[Econ/Economy]
        if (["econ", "economic statistics", "economy"].includes(input))
          if (game_obj.page != "economy") {
            game_obj.page = "economy";
            printEconomy(user_id);
            initialiseTopbar(user_id);

            return true;
          }

        //[Map]
        if (input == "map")
          if (game_obj.page != "map") {
            game_obj.page = "map";
            initialiseMapViewer(getGame(user_id));
            initialiseTopbar(user_id);

            return true;
          }

        //[Military]
        if (input == "military")
          if (game_obj.page != "military") {
            game_obj.page = "military";
            printMilitary(user_id);
            initialiseTopbar(user_id);

            return true;
          }

        //[Politics]
        if (input == "politics")
          if (game_obj.page != "politics") {
            game_obj.page = "politics";
            printPolitics(user_id);
            initialiseTopbar(user_id);

            return true;
          }

        //[Population]
        if (input == "population")
          if (game_obj.page != "population") {
            game_obj.page = "population";
            printPops(user_id);
            initialiseTopbar(user_id);

            return true;
          }

        //[Technology]
        if (input == "technology")
          if (game_obj.page != "technology") {
            game_obj.page = "technology";
            printTechnology(user_id);
            initialiseTopbar(user_id);

            return true;
          }

        //[Trade]
        if (input == "trade")
          if (game_obj.page != "trade") {
            game_obj.page = "trade";
            printTrade(user_id);
            initialiseTopbar(user_id);

            return true;
          }

      }

      //[View (Name)]
      if (input.startsWith("view ")) {
        var view_obj = input.replace("view ", "").trim();

        switch (view_obj) {
          case "archived war":
            initialisePrintArchivedWar(user_id);

            return true;

            break;
          case "armies":
            createPageMenu(game_obj.middle_embed, {
              embed_pages: printArmyList(user_id),
              user: game_obj.user
            });
            game_obj.page = "army_list";

            return true;

            break;
          case "building list":
          case "buildings":
            if (!(game_obj.page.startsWith("view_city_") || game_obj.page.startsWith("view_province_"))) {
              createPageMenu(game_obj.middle_embed, {
                embed_pages: printBuildList(user_id),
                user: game_obj.user
              });
              game_obj.page = "building_list";

              return true;
            }

            break;
          case "casus belli":
          case "cb":
          case "cbs":
          case "cb list":
            if (!game_obj.page.startsWith("diplomacy_view_")) {
              createPageMenu(game_obj.middle_embed, {
                embed_pages: printCBs(user_id),
                user: game_obj.user
              });
              game_obj.page = "cb_list";

              return true;
            }

            break;
          case "cities":
            createPageMenu(game_obj.middle_embed, {
              embed_pages: printProvinces(game_obj.user),
              user: game_obj.user
            });
            game_obj.page = "cities_list";

            return true;

            break;
          case "constructions":
            createPageMenu(game_obj.middle_embed, {
              embed_pages: printConstructions(user_id),
              user: game_obj.user
            });
            game_obj.page = "view_constructions";

            return true;

            break;
          case "client states":
          case "client state proposals":
            createPageMenu(game_obj.middle_embed, {
              embed_pages: printClientStateProposals(user_id),
              user: game_obj.user
            });
            game_obj.page = "client_state_proposals";

            return true;

            break;
          case "culture":
          case "cultures":
            createPageMenu(game_obj.middle_embed, {
              embed_pages: printCultures(user_id),
              user: game_obj.user
            });
            game_obj.page = "culture";

            return true;

            break;
          case "government":
          case "governments":
            createPageMenu(game_obj.middle_embed, {
              embed_pages: printGovernmentList(user_id),
              user: game_obj.user
            });
            game_obj.page = "view_governments";

            return true;

            break;
          case "industry":
            printIndustry(user_id);
            game_obj.page = "view_industry";

            return true;

            break;
          case "ledger":
            printLedger(user_id);
            game_obj.page = "ledger";

            return true;

            break;
          case "national modifiers":
            printNationalModifiers(user_id);
            game_obj.page = "national_modifiers";

            return true;

            break;
          case "modifiers":
            createPageMenu(game_obj.middle_embed, {
              embed_pages: printModifiers(user_id),
              user: game_obj.user
            });
            game_obj.page = "modifiers_list";

            return true;

            break;
          case "population":
            game_obj.page = "provinces_list";
            createPageMenu(game_obj.middle_embed, {
              embed_pages: printProvinces(user_id),
              user: game_obj.user
            });

            return true;

            break;
          case "province":
            if (game_obj.page != "map") {
              initialiseViewProvince(user_id);

              return true;
            }

            break;
          case "provinces":
            createPageMenu(game_obj.middle_embed, {
              embed_pages: printProvinces(user_id),
              user: game_obj.user
            });
            game_obj.page = "provinces_list";

            return true;

            break;
          case "relations":
            initialiseViewDiplomacy(user_id);

            return true;

            break;
          case "temporary modifiers":
            createPageMenu(game_obj.middle_embed, {
              embed_pages: printTemporaryModifiers(user_id),
              user: game_obj.user
            });
            game_obj.page = "temporary_modifiers_list";

            return true;

            break;
          case "unit list":
          case "units":
            createPageMenu(game_obj.middle_embed, {
              embed_pages: printUnitList(game_obj.user),
              user: game_obj.user
            });
            game_obj.page = "unit_list";

            return true;

            break;
          case "war":
            initialisePrintWar(user_id);

            return true;

            break;
          case "conflicts":
          case "wars":
            createPageMenu(game_obj.middle_embed, {
              embed_pages: printWars(game_obj.user),
              user: game_obj.user
            });
            game_obj.page = "war_list";

            return true;

            break;
          case "world market":
            createPageMenu(game_obj.middle_embed, {
              embed_pages: printGlobalMarket(user_id),
              user: game_obj.user
            });
            game_obj.page = "world_market";

            return true;

            break;
          default:
            if (!["view army"].includes(input)) {
              var army_obj = getArmy(user_id, view_obj);
              var city_obj = getCity(view_obj);
              var edit_embed = (game_obj.page != "map") ? game_obj.middle_embed : game_obj.alert_embed;
              var ot_user_id = returnMention(view_obj);
              var province_name = input.replace("view", "").trim()
                .replace("province", "").trim();

              if (main.provinces[view_obj]) {
                var local_province = main.provinces[view_obj];

                createPageMenu(edit_embed, {
                  embed_pages: printProvince(game_obj.user, province_name),
                  user: game_obj.user
                });

                return true;
              } else {
                var army_name_exact_match = false;
                var city_name_exact_match = false;

                if (army_obj)
                  if (army_obj.name.trim().toLowerCase() == view_obj)
                    army_name_exact_match = true;
                if (city_obj)
                  if (city_obj.name.trim().toLowerCase() == view_obj)
                    city_name_exact_match = true;

                //Army smart display
                if (army_obj) {
                  if (city_name_exact_match && !army_name_exact_match) {
                    createPageMenu(edit_embed, {
                      embed_pages: printProvince(game_obj.user, city_obj.name),
                      user: game_obj.user
                    });

                    if (game_obj.page != "map")
                      game_obj.page = `view_city_${city_obj.name}`;

                    return true;
                  } else {
                    var viewed_army = printArmy(user_id, army_obj.name);

                    createPageMenu(edit_embed, {
                      embed_pages: viewed_army,
                      user: game_obj.user
                    });

                    if (game_obj.page != "map")
                      game_obj.page = `army_viewer_${army_obj.name}`;

                    return true;
                  }
                }

                //City smart display
                if (city_obj)
                  if (army_name_exact_match && !city_name_exact_match) {
                    var viewed_army = printArmy(user_id, army_obj.name);

                    createPageMenu(edit_embed, {
                      embed_pages: viewed_army,
                      user: game_obj.user
                    });

                    if (game_obj.page != "map")
                      game_obj.page = `army_viewer_${army_obj.name}`;

                    return true;
                  } else {
                    createPageMenu(edit_embed, {
                      embed_pages: printProvince(game_obj.user, city_obj.name),
                      user: game_obj.user
                    });

                    if (game_obj.page != "map")
                      game_obj.page = `view_city_${city_obj.name}`;

                    return true;
                  }

                //Province smart display
                if (!city_obj)
                  if (main.provinces[province_name])
                    if (main.provinces[province_name].owner == actual_id) {
                      createPageMenu(edit_embed, {
                        embed_pages: printProvince(game_obj.user, province_name),
                        user: game_obj.user
                      });

                      return true;
                    }

                //If none of the above, try war/nation
                if (!army_obj && !city_obj && game_obj.page != "map")
                  if (main.users[ot_user_id]) {
                    viewDiplomacy(user_id, ot_user_id);
                    game_obj.page = `diplomacy_view_${ot_user_id}`;

                    return true;
                  } else {
                    //Keep wars as last in precedence
                    var war_report = printWar(user_id, view_obj, false, true);

                    if (war_report) {
                      printWar(user_id, view_obj);
                      game_obj.page = `view_war_${view_obj}`;

                      return true;
                    } else {
                      var archived_war_report = printWar(user_id, view_obj, true, true);

                      if (archived_war_report) {
                        printWar(user_id, view_obj, true);
                        game_obj.page = `view_war_archives_${view_obj}`;

                        return true;
                      }
                    }
                  }
              }
            }

            break;
        }
      }
    }
  }
};
