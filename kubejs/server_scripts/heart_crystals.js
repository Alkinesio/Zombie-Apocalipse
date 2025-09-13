// kubejs/server_scripts/heart_crystals.js
(function(){
  "use strict";

  var TARGET = "heart_crystals:heart_crystal";
  var DROP   = "levelhearts:heart_container";

  function runCmd(evt, cmd) {
    try { if (evt && evt.server && typeof evt.server.runCommandSilent === "function") return evt.server.runCommandSilent(cmd); } catch(e){}
    try { if (evt && evt.level && typeof evt.level.runCommandSilent === "function") return evt.level.runCommandSilent(cmd); } catch(e){}
    try { if (evt && evt.world && typeof evt.world.runCommandSilent === "function") return evt.world.runCommandSilent(cmd); } catch(e){}
    try { if (typeof server !== "undefined" && server && typeof server.runCommandSilent === "function") return server.runCommandSilent(cmd); } catch(e){}
    try { if (evt && evt.server) evt.server.runCommand(cmd); } catch(e){}
    return null;
  }

  function trySpawnStack(evt, pos, qty) {
    if (!pos) return false;
    try {
      // prima prova: spawn di un singolo Item stack (se l'API lo supporta)
      if (evt && evt.world && typeof evt.world.spawnItemEntity === "function") {
        try {
          evt.world.spawnItemEntity(pos.x + 0.5, pos.y + 0.5, pos.z + 0.5, Item.of(DROP, qty));
          console.log("HC: spawnItemEntity stack x" + qty + " at " + pos.x + "," + pos.y + "," + pos.z);
          return true;
        } catch(e) {
          // fallback sotto
        }
      }
    } catch(e){}

    // fallback: summon singole entities via comando
    try {
      for (var i = 0; i < qty; i++) {
        runCmd(evt, "/summon item " + (pos.x + 0.5) + " " + (pos.y + 0.5) + " " + (pos.z + 0.5) + " {Item:{id:\"" + DROP + "\",Count:1b}}");
      }
      console.log("HC: summon fallback summoned " + qty + " items at " + pos.x + "," + pos.y + "," + pos.z);
      return true;
    } catch(e) {
      console.log("HC: spawn fallback failed:", e && e.stack ? e.stack : e);
      return false;
    }
  }

  // registra l'handler (usando la firma con filtro del blocco)
  BlockEvents.broken(TARGET, function(evt) {
    try {
      // ricava posizione in modo semplice e sicuro
      var pos = null;
      try { if (evt.block && evt.block.pos) pos = evt.block.pos; } catch(e) {}
      try { if (!pos && evt.pos) pos = evt.pos; } catch(e) {}
      try { if (!pos && evt.blockPos) pos = evt.blockPos; } catch(e) {}
      try { if (!pos && typeof evt.x === "number" && typeof evt.y === "number" && typeof evt.z === "number") pos = { x: evt.x, y: evt.y, z: evt.z }; } catch(e) {}

      // calcolo quantità: 1 base
      var total = 1;
      var first = (Math.random() < 0.33);
      if (first) total += 2;
      if (first && (Math.random() < 0.17)) total += 4;

      console.log("HC: broken detected at " + (pos ? (pos.x + "," + pos.y + "," + pos.z) : "<no-pos>") + " -> total=" + total);

      // schedule 1 tick dopo se disponibile per evitare conflitti
      try {
        if (evt.server && typeof evt.server.schedule === "function") {
          evt.server.schedule(1, function() {
            trySpawnStack(evt, pos, total);
          });
        } else {
          trySpawnStack(evt, pos, total);
        }
      } catch(e) {
        trySpawnStack(evt, pos, total);
      }
    } catch(err) {
      console.log("HC: handler unexpected error:", err && err.stack ? err.stack : err);
    }
  });

  console.log("HC: minimal handler installed for " + TARGET);
})();