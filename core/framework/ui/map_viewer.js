module.exports = {
  changeImage: async function (arg0_game_id, arg1_map, arg2_initialisation) {
    //Convert from parameters
    var game_id = arg0_game_id;
    var map_file = arg1_map;
    var initialisation = arg2_initialisation;
    
    //Declare local instance variables
    var game_obj = interfaces[game_id];
    var map_obj = game_obj.map;
    
    if (map_obj) {
      //Cache SVG first - we await this to ensure the file exists on disk
      if (!initialisation) await module.exports.cacheSVG(map_file);
      
      returnCacheChannel()
      .send({
        content: `${generateRandomID()}_${game_id}`,
        files: [`./map/cache/${map_obj.mapmode}.jpg`],
      })
      .then((message) => {
        var Attachment = Array.from(message.attachments);
        
        Attachment.forEach(function (attachment) {
          map_obj.original_img = attachment[1].url;
          
          //Reload map
          module.exports.reloadMap(
            game_id,
            initialisation,
            true,
            map_obj.x == 0 && map_obj.y == 0 && map_obj.zoom == 1
              ? attachment[1].url
              : undefined
          );
        });
      });
    }
  },
  
  initialiseMapViewer: function (arg0_game_id, arg1_map, arg2_hide_mapmodes) {
    //Convert from parameters
    var game_id = arg0_game_id;
    var game_obj = interfaces[game_id];
    var map = arg1_map ? arg1_map : "political";
    var hide_mapmodes = arg2_hide_mapmodes;
    
    //Declare local instance variables
    var map_defines = config.defines.map;
    
    //Initialise map data and object
    if (!game_obj.map) game_obj.map = {};
    var map_obj = game_obj.map;
    
    map_obj.embed_history = [];
    map_obj.objects = [];
    
    map_obj.title = "Please wait ..";
    map_obj.thumbnail_url =
      "https://media.discordapp.net/attachments/432295472598614028/712203943241056326/unknown.png";
    map_obj.interface_string = [
      `${config.icons.loading} Currently loading map viewer ..`,
    ];
    map_obj.image_url =
      "https://cdn.discordapp.com/attachments/722997700391338046/736141424315203634/margin.png";
    
    //Initialise controls
    map_obj.left_arrow = false;
    map_obj.right_arrow = false;
    map_obj.up_arrow = false;
    map_obj.down_arrow = false;
    
    map_obj.zoom_in = false;
    map_obj.zoom_out = false;
    
    map_obj.increase_pan_speed = false;
    map_obj.decrease_pan_speed = false;
    
    map_obj.political = false;
    map_obj.colonisation = false;
    map_obj.supply = false;
    
    map_obj.atlas = false;
    
    //Initialise tracker variables
    map_obj.mapmode = map;
    map_obj.original_img = "";
    map_obj.speed =
      ((map_defines.map_resolution[0] + map_defines.map_resolution[1]) / 2) *
      0.1;
    map_obj.x = 0;
    map_obj.y = 0;
    map_obj.zoom = 1;
    
    //Add collector reactions
    initialiseControlPanel(game_id, !hide_mapmodes ? "map" : "special_map");
    
    //Add select menu
    if (!hide_mapmodes)
      setTimeout(function () {
        addSelectMenu(game_obj.header, {
          id: "select_mapmode",
          options: [
            {
              label: "Atlas",
              emoji: "716811246556545035",
              value: "atlas",
              
              options: {
                name: "Atlas",
              },
              effect: function (value, options) {
                map_obj.mapmode = "atlas";
                module.exports.changeImage(game_id, "atlas", false);
              },
            },
            {
              label: "Colonisation",
              emoji: "716821194891853826",
              value: "colonisation",
              
              options: {
                name: "Colonisation",
              },
              effect: function (value, options) {
                map_obj.mapmode = "colonisation";
                module.exports.changeImage(game_id, "colonisation", false);
              },
            },
            {
              label: "Political",
              emoji: "716817688525275257",
              value: "political",
              
              options: {
                name: "Political",
              },
              
              effect: function (value, options) {
                map_obj.mapmode = "political";
                module.exports.changeImage(game_id, "political", false);
              },
            },
            {
              label: "Population",
              emoji: "716817688810356826",
              value: "population",
              
              options: {
                name: "Population",
              },
              effect: function (value, options) {
                map_obj.mapmode = "population";
                module.exports.changeImage(game_id, "population", false);
              },
            },
            {
              label: "Supply",
              emoji: "773451853534986241",
              value: "supply",
              
              options: {
                name: "Supply",
              },
              effect: function (value, options) {
                map_obj.mapmode = "supply";
                module.exports.changeImage(game_id, "supply", false);
              },
            },
          ],
          placeholder: `⭭ Select Mapmode ..`,
        });
      }, 1000);
    
    returnCacheChannel()
    .send({
      content: `${generateRandomID()}_${game_id}`,
      files: [`./map/cache/${map_obj.mapmode}.jpg`],
    })
    .then((message) => {
      var Attachment = Array.from(message.attachments);
      
      Attachment.forEach(function (attachment) {
        //Initialise map
        map_obj.original_img = attachment[1].url;
        map_obj.image_url = attachment[1].url;
        
        //Reload map
        module.exports.reloadMap(game_id, true, true);
        
        //Establish logic loop
        var logic_loop = setInterval(function () {
          try {
            let map_interface_embed = {
              title: map_obj.title,
              color: 9686188,
              thumbnail: {
                url: map_obj.thumbnail_url,
              },
              description: map_obj.interface_string.join("\n"),
              image: {
                url: map_obj.image_url,
              },
            };
            
            map_obj.current_embed = map_interface_embed;
            
            //Keep track of embed_history (interface string), and objects (map image)
            map_obj.embed_history.push(map_obj.interface_string.join("\n"));
            map_obj.objects.push(map_obj.image_url);
            
            //End of loop
            if (map_obj.embed_history.length > 3)
              map_obj.embed_history.splice(0, 1);
            if (map_obj.objects.length > 3) map_obj.objects.splice(0, 1);
            
            //Controls
            if (map_obj.zoom_in)
              map_obj.zoom = map_obj.zoom < 11 ? map_obj.zoom + 1 : 11;
            if (map_obj.zoom_out)
              map_obj.zoom = map_obj.zoom > 1 ? map_obj.zoom - 1 : 1;
            
            if (map_obj.decrease_pan_speed) map_obj.speed = map_obj.speed * 0.9;
            if (map_obj.increase_pan_speed) map_obj.speed = map_obj.speed * 1.1;
            
            if (map_obj.left_arrow) map_obj.x += map_obj.speed / map_obj.zoom;
            if (map_obj.right_arrow) map_obj.x -= map_obj.speed / map_obj.zoom;
            if (map_obj.up_arrow) map_obj.y += map_obj.speed / map_obj.zoom;
            if (map_obj.down_arrow) map_obj.y -= map_obj.speed / map_obj.zoom;
            
            //Mapmode controls
            if (map_obj.political) {
              map_obj.mapmode = "political";
              module.exports.changeImage(game_id, "political", false);
            }
            if (map_obj.colonisation) {
              map_obj.mapmode = "colonisation";
              module.exports.changeImage(game_id, "colonisation", false);
            }
            if (map_obj.supply) {
              map_obj.mapmode = "supply";
              module.exports.changeImage(game_id, "supply", false);
            }
            if (map_obj.atlas) {
              map_obj.mapmode = "atlas";
              module.exports.changeImage(game_id, "atlas", false);
            }
            
            //Reset map data states
            module.exports.reloadMap(game_id);
            
            try {
              module.exports.reloadMapInterface(game_id, map_interface_embed);
            } catch {}
            
            map_obj.increase_pan_speed = false;
            map_obj.decrease_pan_speed = false;
            
            map_obj.zoom_in = false;
            map_obj.zoom_out = false;
            
            map_obj.left_arrow = false;
            map_obj.right_arrow = false;
            map_obj.up_arrow = false;
            map_obj.down_arrow = false;
            
            //Mapmodes
            map_obj.political = false;
            map_obj.colonisation = false;
            map_obj.supply = false;
            
            map_obj.atlas = false;
          } catch (e) {
            log.warn(
              `logic_loop under initialiseMapViewer() was unable to proceed! ${e}.`
            );
            console.log(e);
            clearInterval(logic_loop);
          }
        }, 100);
        
        //Set control function of interface
        game_obj.control_function = function (arg0_actions) {
          //Convert from parameters
          var actions = arg0_actions;
          
          if (actions.zoom_in) map_obj.zoom_in = true;
          if (actions.zoom_out) map_obj.zoom_out = true;
          
          if (actions.up_arrow) map_obj.up_arrow = true;
          if (actions.down_arrow) map_obj.down_arrow = true;
          if (actions.left_arrow) map_obj.left_arrow = true;
          if (actions.right_arrow) map_obj.right_arrow = true;
          
          //Mapmodes
          if (actions.political) map_obj.political = true;
          if (actions.colonisation) map_obj.colonisation = true;
          if (actions.supply) map_obj.supply = true;
          
          if (actions.atlas) map_obj.atlas = true;
        };
      });
    });
  },
  
  reloadMapInterface: function (arg0_game_id, arg1_embed_obj) {
    //Convert from parameters
    var game_id = arg0_game_id;
    var embed_obj = arg1_embed_obj;
    
    //Declare local instance variables
    var game_obj = interfaces[game_id];
    var map_obj = game_obj.map;
    
    if (map_obj.embed_history)
      if (
        map_obj.embed_history[map_obj.embed_history.length - 2] !=
        map_obj.embed_history[map_obj.embed_history.length - 1] ||
        map_obj.objects[map_obj.objects.length - 2] !=
        map_obj.objects[map_obj.objects.length - 1]
      ) {
        game_obj.main_embed = embed_obj;
        game_obj.middle_embed.edit({ embeds: [embed_obj] });
      }
  },
  
  reloadMap: async function (arg0_game_id, arg1_do_not_reload_image, arg2_force_reload, arg3_image_url) {
    //Convert from parameters
    let game_id = arg0_game_id;
    let game_obj = interfaces[game_id];
    let do_not_reload_image = arg1_do_not_reload_image;
    let force_reload = arg2_force_reload;
    let image_url = arg3_image_url;
    
    if (!game_obj?.map) return; //Internal guard clause if game_obj?.map doesn't exist
    
    //Declare local instance variables
    try {
      let map_obj = game_obj.map;
      
      //Check if anything new has to be rendered first
      let render_new = (map_obj.left_arrow ||
        map_obj.right_arrow ||
        map_obj.up_arrow ||
        map_obj.down_arrow ||
        map_obj.zoom_in ||
        map_obj.zoom_out ||
        map_obj.increase_pan_speed ||
        map_obj.decrease_pan_speed || do_not_reload_image || force_reload);
      
      //If a new map has to be rendered, apply the zoom algorithm
      if (render_new) {
        //Change map object values
        map_obj.title = `Map of the World, ${getDate(main.date)}`;
        map_obj.interface_string = [
          `You are now viewing the **${parseMapmode(
            map_obj.mapmode
          )}** mapmode.`,
          `Zoom: ${map_obj.zoom} | Speed: ${map_obj.speed} | X: ${Math.round(
            map_obj.x
          )} | Y: ${Math.round(map_obj.y)}`,
          "",
          "Use the arrow keys and magnifying icons at the bottom to navigate around the map. Type a province or city name to view it.",
        ];
        
        if (!do_not_reload_image)
          if (!image_url) {
            var local_canvas = Canvas.createCanvas(
              Math.ceil(config.defines.map.map_resolution[0] / 4),
              Math.ceil(config.defines.map.map_resolution[1] / 4)
            );
            var ctx = local_canvas.getContext("2d");
            
            // Await loadImage - this is the fix for @napi-rs/canvas
            var img = await Canvas.loadImage(map_obj.original_img);
            
            //Centre alignment first
            var offset_x = 0;
            var offset_y = 0;
            if (map_obj.zoom > 1) {
              offset_x = -(
                Math.ceil(config.defines.map.map_resolution[0] / 8) *
                (map_obj.zoom - 1)
              );
              offset_y = -(
                Math.ceil(config.defines.map.map_resolution[1] / 8) *
                (map_obj.zoom - 1)
              );
            }
            
            //Draw image on ctx
            ctx.drawImage(
              img,
              offset_x + map_obj.x * map_obj.zoom,
              offset_y + map_obj.y * map_obj.zoom,
              
              Math.ceil(config.defines.map.map_resolution[0] / 4) * map_obj.zoom,
              Math.ceil(config.defines.map.map_resolution[1] / 4) * map_obj.zoom
            );
            
            var attachment = new Discord.MessageAttachment(
              local_canvas.toBuffer("image/jpeg"),
              "map_viewer.jpg"
            );
            
            returnCacheChannel()
            .send({
              content: `${generateRandomID()}_${game_id}`,
              files: [attachment],
            })
            .then((message) => {
              var Attachment = Array.from(message.attachments);
              
              Attachment.forEach(function (attachment) {
                map_obj.image_url = attachment[1].url.toString();
                
                if (force_reload)
                  module.exports.reloadMapInterface(
                    game_id,
                    map_obj.current_embed
                  );
              });
            });
          } else {
            map_obj.image_url = image_url;
            if (force_reload)
              module.exports.reloadMapInterface(game_id, map_obj.current_embed);
          }
      }
    } catch (e) {
      console.log(e);
    }
  },
};