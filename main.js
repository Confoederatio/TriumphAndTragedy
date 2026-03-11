console.time(`Loading Node.js libraries.`);
global.Cluster = require("cluster");

global._ = require("underscore");
global.bn_graph = require("ngraph.graph");
global.bn_path = require("ngraph.path");
global.Canvas = require("@napi-rs/canvas");
global.diacriticless = require("diacriticless");
global.Discord = require("discord.js");
global.fs = require("fs");
global.HTML = require("node-html-parser");
global.JSDOM = require("jsdom");
global.JSONPack = require("jsonpack");
global.opus = require("opusscript");
global.OS = require("os");
global.path = require("path");
global.SVG = require("convert-svg-to-png");
global.svg2img = require("svg2img");
global.voice = require("@discordjs/voice");
global.WorkerThreads = require("worker_threads");

//Import Core Framework
global.FileManager = require("./core/file_manager");

FileManager.import("./startup");

//Import Core Functions - See startup.js for full directory
loadBotFiles();

//Start up main thread (command handling/UI)
if (Cluster.isMaster) {
  console.log(`Bot instance started on Thread #1 on Core #1.`);
  global.thread_type = 1;

  //Main thread logic
  threadOneHandler();

  //Fetch number of cores
  var core_amount = OS.cpus().length;
  var thread_amount = (settings.threads) ? settings.threads : core_amount;
  global.thread_two_workers = [];
  global.thread_three_workers = [];

  //Create thread; log to console and distribute 3 threads over available cores
  log.info(`Creating Master Core. (Command Handling/UI)`);
  log.info(`${core_amount} core(s) are available. ${thread_amount} Thread(s) have been specified in settings. Will utilise them as necessary.\n-`);

  //Reserve this core for main command processing; distribute the others for data processing; map/file
  for (var i = 0; i < thread_amount - 1; i++) {
    var local_worker = Cluster.fork();

    //Receive data from worker
    local_worker.on("message", (data) => {
      //Busy worker handling
      if (data.busy_worker) {
        for (var x = 0; x < thread_two_workers.length; x++)
          if (thread_two_workers[x].id == data.busy_worker)
            thread_two_workers[x].busy = true;
        for (var x = 0; x < thread_three_workers.length; x++)
          if (thread_three_workers[x].id == data.busy_worker)
            thread_three_workers[x].busy = true;
      } else if (data.free_worker) {
        for (var x = 0; x < thread_two_workers.length; x++)
          if (thread_two_workers[x].id == data.free_worker)
            delete thread_two_workers[x].busy;
        for (var x = 0; x < thread_three_workers.length; x++)
          if (thread_three_workers[x].id == data.free_worker)
            delete thread_three_workers[x].busy;
      }

      //If main_object is received, sync; but only for selected variables
      if (data.main_object) {
        global.main.round_count = data.main_object.round_count;

        global.main.global = data.main_object.global;
        global.main.provinces = data.main_object.provinces;
        global.main.users = data.main_object.users;
      }

      syncMasterToWorker(data);
    });
    local_worker.on("exit", (code) => {
      log.info(`Worker #${local_worker.id} stopped with exit code ${code}.`);
    });

    //Add the worker to thread_two or thread_three depending on parity
    local_worker.send(getMasterObject());
    local_worker.send({ client: true });

    if (i % 2 == 0) {
      //Pass global down to local_worker
      local_worker.send({
        type: 2
      });

      thread_two_workers.push(local_worker);
    } else {
      //Pass global down to local_worker
      local_worker.send({
        type: 3
      });

      thread_three_workers.push(local_worker);
    }
  }

  log.info(`-\nAssigned ${thread_two_workers.length} core(s) to Thread #2.`);
  log.info(`Assigned ${thread_three_workers.length} core(s) to Thread #3.`);

  syncWorkersToMaster(); //Sync at start up just in case
} else {
  //Other thread handling (Threads 2 and 3)
  process.on("message", function (data) {
    //Global error handling
    process.on("unhandledRejection", (error) => {
      //Log enabled only with debug mode
      if (settings.debug_mode) {
        log.error(`Unhandled promise rejection. ${error.toString()}`);
        console.log(error);
      }
    });

    //Update global variables (lookup, main) to main thread
    if (data.client)
      if (!global.client) {
        log.debug(`Start client called on Worker #${Cluster.worker.id}!`);
        global.client = startClient();

        console.log(`Client logged in as: `, global.client);
      }

    if (data.backup_loaded)
      global.backup_loaded = data.backup_loaded;
    if (data.config)
      global.config = data.config;
    if (data.interfaces)
      global.interfaces = data.interfaces;
    if (data.load_maps)
      loadMaps();
    if (data.lookup)
      global.lookup = data.lookup;
    if (data.main)
      global.main = data.main;
    if (data.mapmodes)
      global.mapmodes = data.mapmodes;
    if (data.reserved)
      global.reserved = data.reserved;
    if (data.settings)
      global.settings = data.settings;
    if (data.worker_eval)
      eval(data.worker_eval);

    log.debug(`Worker #${Cluster.worker.id} received message from master!`);
    //log.debug(`Mapmodes:`, mapmodes);

    //Set up worker type
    if (data.type) {
      if (data.type == 2) {
        global.thread_type = 2;
      } else if (data.type == 3) {
        global.thread_type = 3;
      }

      //Fetch CPU core
      var cpu_index = process.env.cpuIndex || 0;
      var cpu_info = OS.cpus()[cpu_index];

      log.info(`Started Thread #${global.thread_type} type worker on Core #${cpu_index} (${cpu_info.model})`);
    }

    //Command handler
    if (global.thread_type == 2) {
      threadTwoHandler(data);
    } else if (global.thread_type == 3) {
      threadThreeHandler(data);
    }
  });
}
