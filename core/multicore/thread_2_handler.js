module.exports = {
  threadTwoHandler: function (arg0_data) {
    //Convert from parameters
    let data = arg0_data;

    //Declare local instance variables
    let worker_id = Cluster.worker.id;

    process.send({ busy_worker: worker_id });

    //cacheSVG()
    if (data.command === "cacheSVG") {
      log.debug(`Thread #2 cacheSVG() instruction on Worker #${Cluster.worker.id}`);

      internalCacheSVG(data.map_name, data.hide_province_labels);
    }

    //forceRender()
    if (data.command === "forceRender") {
      log.debug(`Thread #2 forceRender() instruction on Worker #${Cluster.worker.id}`);

      if (data.map_name)
        internalForceRender(data.map_name);
    }

    //writeDB()
    if (data.command === "writeDB")
      try {
        fs.writeFile("database.js", JSON.stringify(global.main), function (err, data) {
          if (err) return log.info(err);
        });
      } catch (e) {
        log.error(`Ran into an error whilst attempting to save to database.js! ${e}.`);
        console.log(e);
      }

    //writeSave()
    if (data.command === "writeSave") {
      log.debug(`Thread #2 writeSave() instruction on Worker #${Cluster.worker.id}`);
      internalWriteSave(data.options);
    }

    //RAM specifications
    if (data.ram_size)
      process.env.NODE_OPTIONS = `--max-old-space-size=${data.ram_size}`;

    //Mark worker as free
    process.send({ free_worker: worker_id });
  }
};
