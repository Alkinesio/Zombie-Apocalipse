// kubejs/server_scripts/mekanism_adjustments_final_attempt.js
// Ultimo tentativo usando gli helper del plugin kubejs-mekanism ma evitando 'item' helper non definito.
// Usa Item.of (maiuscolo) e oggetti espliciti per itemInput/chemicalInput/slurry stacks.
// Metti questo file in <world>/kubejs/server_scripts/ e fai /reload

(function(){ //la function non è indispensabile, serve ad evitare errori di redeclaration su reload.
ServerEvents.recipes(event => {
	
  // 0) RIMOZIONE MIRATA (solo OUTPUT specifici per iron)
  // ---------------------------
  try {
    // Enriching che producono dust_iron
    event.remove({ type: 'mekanism:enriching', output: { item: 'mekanism:dust_iron' } })
  } catch(e) {}

  try {
    // Purifying che producono clump_iron
    event.remove({ type: 'mekanism:purifying', output: { item: 'mekanism:clump_iron' } })
  } catch(e) {}

  try {
    // Injecting che producono shard_iron
    event.remove({ type: 'mekanism:injecting', output: { item: 'mekanism:shard_iron' } })
  } catch(e) {}




    try {
      // rimuovi le dissolution specifiche per iron viste nel tuo log:
      var ids = [
        'mekanism:processing/iron/slurry/dirty/from_raw_block',
        'mekanism:processing/iron/slurry/dirty/from_ore',
        'mekanism:processing/iron/slurry/dirty/from_raw_ore'
      ];

      var removed = 0;
      for (var i = 0; i < ids.length; i++) {
        try {
          event.remove({ id: ids[i] });
          console.info('[meka-remove-ids] removed id=' + ids[i]);
          removed++;
        } catch(e) {
          console.info('[meka-remove-ids] failed remove id=' + ids[i] + ' error=' + e);
        }
      }

      // rimuoviamo anche eventuali crystallizing che producono crystal_iron (eviti duplicati)
      try {
        event.remove({ type: 'mekanism:crystallizing', output: { item: 'mekanism:crystal_iron' } });
        console.info('[meka-remove-ids] removed crystallizing recipes with output=mekanism:crystal_iron');
      } catch(e) {
        console.info('[meka-remove-ids] failed remove crystallizing by output: ' + e);
      }

      console.info('[meka-remove-ids] done attempted=' + ids.length + ' removedApprox=' + removed);
    } catch(e) {
      console.error('[meka-remove-ids] script error: ' + e);
    }
	


  try {
    // Crystallizer che producono crystal_iron (rimuove tutte le produzioni del crystal_iron)
    event.remove({ type: 'mekanism:crystallizing', output: { item: 'mekanism:crystal_iron' } })
  } catch(e) {}

  // ---------------------------
  // 1) Reinserimento ricette CUSTOM per RAW IRON (quelle che vuoi)
  // ---------------------------
  // Helpers già testati che funzionavano per te
  
  
  // 0) Crushing
  
  event.recipes.mekanismCrushing(
    Item.of('minecraft:raw_iron' , 2),
    { ingredient: { tag: 'forge:ores/iron' }, amount: 1 })
	

  // 1) Enrichment Chamber: raw_iron -> 3x mekanism:dust_iron
  // Use Item.of (capital I) to create the ItemStack output
  
  event.recipes.mekanismEnriching(
    Item.of('mekanism:dust_iron', 4),
    { ingredient: { item: 'minecraft:raw_iron' }, amount: 1 }),
	
	event.recipes.mekanismEnriching(
	    Item.of('mekanism:dust_iron', 1),
    { ingredient: { item: 'mekanism:dirty_dust_iron' }, amount: 1 })
	
	

  // 2) Purification Chamber: raw_iron + oxygen(200) -> 5x mekanism:clump_iron
  
  event.recipes.mekanismPurifying(
    Item.of('mekanism:clump_iron', 8),
    { ingredient: { item: 'minecraft:raw_iron' }, amount: 1 },
    { gas: 'mekanism:oxygen', amount: 1 }  ),

	event.recipes.mekanismPurifying(
    Item.of('mekanism:clump_iron', 1),
    { ingredient: { item: 'mekanism:shard_iron' }, amount: 1 },
    { gas: 'mekanism:oxygen', amount: 1 }  )
		

  // 3) Chemical Injection Chamber: raw_iron + hydrogen_chloride(200) -> 7x mekanism:shard_iron
  
  event.recipes.mekanismInjecting(
    Item.of('mekanism:shard_iron', 16),
    { ingredient: { item: 'minecraft:raw_iron' }, amount: 1 },
    { gas: 'mekanism:hydrogen_chloride', amount: 1 }  ),
	
  event.recipes.mekanismInjecting(
    Item.of('mekanism:shard_iron', 1),
    { ingredient: { item: 'mekanism:crystal_iron' }, amount: 1 },
    { gas: 'mekanism:hydrogen_chloride', amount: 1 }  )	
	

  // 4) Chemical Dissolution Chamber: raw_iron + sulfuric_acid(100mB) -> mekanism:dirty_iron (1000 mB)
  event.recipes.mekanismDissolution(
    { slurry: 'mekanism:dirty_iron', amount: 1000 },
    { gas: 'mekanism:sulfuric_acid', amount: 1 }, // l'amount prima era 100 per indicare 100mB ma dopo la nuova remove function ogni 1 equivale già a 100mB 
    { ingredient: { item: 'minecraft:raw_iron' }, amount: 1 }
  )

  
  // 5) Chemical Crystallizer: mekanism:clean_iron (100 mB) -> 2x mekanism:crystal_iron
  event.recipes.mekanismCrystallizing(
    Item.of('mekanism:crystal_iron', 2),
    { slurry: 'mekanism:clean_iron', amount: 50 }

  )
  
  
  // ---------------------------
  // 2) Combiner entry (solo per alcuni vanilla-like ores), in try/catch
  //    signature: mekanismCombining(outputItemStack, inputItemStack, additionalInput)
  // ---------------------------
  
  /*
  try {
    // Combiner per iron
    event.recipes.mekanismCombining(
      Item.of('minecraft:iron_ore', 1),
      Item.of('mekanism:dust_iron', 8),
      'minecraft:cobblestone'
    )
  } catch(e) {}

  try {
    // Combiner per copper (se vuoi)
    event.recipes.mekanismCombining(
      Item.of('minecraft:copper_ore', 1),
      Item.of('mekanism:dust_copper', 8),
      'minecraft:cobblestone'
    )
  } catch(e) {}

  try {
    // Combiner per gold (se vuoi)
    event.recipes.mekanismCombining(
      Item.of('minecraft:gold_ore', 1),
      Item.of('mekanism:dust_gold', 8),
      'minecraft:cobblestone'
    )
  } catch(e) {}
  
  */
  
  

  // ---------------------------
  // 3) (opzionale) Generazione tag-based per altri materiali
  //    Se vuoi che la generazione massiva rimanga, riattivala; per ora la lascio commentata.
  // ---------------------------
  /*
  const materials = ['copper','gold','tin','osmium','silver','lead','nickel'];
  materials.forEach(mat => {
    try {
      event.recipes.mekanismEnriching(
        Item.of(`mekanism:dust_${mat}`, Math.round(3 * 4 / 3)),
        { tag: `forge:ores/${mat}` }
      )
    } catch(e){}
    // ... analoghi per purifying/injecting/dissolution/crystallizer
  })
  */
  
  
  
  
})

})(); // questa è la chiusura riferita a (function(){