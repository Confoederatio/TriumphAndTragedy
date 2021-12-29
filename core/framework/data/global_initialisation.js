//Initialise global variables at start
module.exports = {
  initGlobal: function () {
    //Declare local tracker variables
    var all_good_names = getGoods({ exclude_hidden: true, return_names: true });
    var all_goods = getGoods({ exclude_hidden: true });

    //Declare objects
    if (!main.global) main.global = {};
      if (!main.global.cultures) main.global.cultures = {};
      if (!main.global.user_map) main.global.user_map = {};
    if (!main.interfaces) main.interfaces = {};
    if (!main.users) main.users = {};
    if (!main.provinces) main.provinces = JSON.parse(fs.readFileSync(`./map/provinces.js`, "utf8").toString());

    //Date trackers
    if (!main.date) main.date = {};
      if (!main.date.year) main.date.year = (config.defines.common.starting_year) ? config.defines.common.starting_year : 1500;
      if (!main.date.month) main.date.month = (config.defines.common.starting_month) ? config.defines.common.starting_month : 1;
      if (!main.date.day) main.date.day = (config.defines.common.starting_day) ? config.defines.common.starting_day : 1;
    if (!main.round_count) main.round_count = 0;

    //Market trackers - Initialise buy price/sell price/stock
    if (!main.market) main.market = {};
      for (var i = 0; i < all_goods.length; i++)
        if (all_goods[i].buy_price || all_goods[i].sell_price) {
          var local_good_name = all_good_names[i];

          //Initialise good object
          main.market[local_good_name] = {
            amount_sold: 0, //Used as a tracker variable; reset each turn
            buy_price: (all_goods[i].buy_price) ?
              all_goods[i].buy_price :
              all_goods[i].sell_price*2,
            sell_price: (all_goods[i].sell_price) ?
              all_goods[i].sell_price :
              all_goods[i].buy_price*0.5,
            stock: (all_goods[i].stock) ?
              all_goods[i].stock :
              config.defines.economy.resource_base_stock
          };
        }

    //Declare tracker variables
    if (!main.last_backup) main.last_backup = new Date().getTime();
    if (!main.last_turn) main.last_turn = new Date().getTime();
  }
};
