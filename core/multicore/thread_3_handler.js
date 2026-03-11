module.exports = {
  threadThreeHandler: function (arg0_data) {
    //Convert from parameters
    var data = arg0_data;

    //Declare local instance variables
    var worker_id = Cluster.worker.id;

    process.send({ busy_worker: worker_id });

    //mergeMain()
    if (data.command == "mergeMain")
      if (data.main_objects) {
        mergeMain(data.main_objects);

        //Send main back up to master
        process.send({ main: global.main });
      }

    //nextBattleTick()
    if (data.command == "nextBattleTick") {
      log.debug(`Thread #3 nextBattleTick() instruction on Worker #${Cluster.worker.id}`);

      nextBattleTick(data.new_turn);

      //Send data back to master for merging
      process.send({
        main_object: global.main
      });
    }

    //nextGlobalTurn()
    if (data.command == "nextGlobalTurn") {
      log.debug(`Thread #3 nextGlobalTurn() instruction on Worker #${Cluster.worker.id}`);

      var main_object = nextGlobalTurn();

      //Send data back to master for merging
      log.debug(`Merging nextGlobalTurn() processing with master thread!`);
      process.send({
        load_maps: true,
        main_object: main_object
      });
    }

    //nextTurn()
    if (data.command == "nextTurn") {
      log.debug(`Thread #3 nextTurn() instruction on Worker #${Cluster.worker.id}`);

      var actual_id = main.global.user_map[data.user_id];

      nextTurn(data.user_id, data.options);

      //Send data back to master for merging
      process.send({
        main_object: global.main
      });
    }

    //RAM specifications
    if (data.ram_size)
      process.env.NODE_OPTIONS = `--max-old-space-size=${data.ram_size}`;

    //Mark worker as free
    process.send({ free_worker: worker_id });
  }
};
