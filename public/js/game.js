let player = {
  stats: { hp: 100, attack: 10, defense: 5 },
  inventory: [],
  currentSceneId: "start"
};

let world = {
  start: {
    name: "Quiet Forest Clearing",
    description: "You are in a quiet forest clearing. Paths lead north and east. An old, weathered chest sits in the center. Your village elder mentioned something about an 'Old Sword' hidden here for safekeeping.",
    exits: { north: "darkCaveEntrance", east: "villageOutskirts" },
    items: [
      { id: "healthPotion", name: "Health Potion", description: "A bubbling red potion.", type: "potion", effect: { heal: 25 } },
      { id: "oldSword", name: "Old Sword", description: "A rusty but serviceable sword.", type: "weapon", effect: { attack: 5 } }
    ],
    monsters: []
  },
  darkCaveEntrance: {
    name: "Dark Cave Entrance",
    description: "A dark cave looms before you. The air is cold and a menacing growl echoes from within. The path south leads back to the forest clearing. This cave doesn't seem related to your search for the Old Sword.",
    exits: { south: "start" },
    items: [],
    monsters: [
      { id: "goblin", name: "Goblin Scout", stats: { hp: 30, attack: 8, defense: 2 }, drops: [{ id: "goldCoin", name: "Gold Coin", description: "A shiny gold coin.", type: "currency" }] }
    ]
  },
  villageOutskirts: {
    id: "villageOutskirts",
    name: "Village Outskirts",
    description: "You are at the edge of your small village. The path west leads back to the forest clearing. To the east, you can see the village square. An old signpost reads: 'Forest Clearing - West, Village Square - East'.",
    exits: { west: "start", east: "villageSquare" },
    items: [],
    monsters: []
  },
  villageSquare: {
    name: "Village Square",
    description: "The village square is relatively quiet. An old woman named Elara is tending a small herb garden near the well. The path west leads back to the village outskirts.",
    exits: { "west": "villageOutskirts" },
    items: [],
    monsters: [],
    npcs: [
        { 
            id: "elara", 
            name: "Elara", 
            nameLower: "elara", // For easier command parsing
            dialogue: [
                "Welcome, traveler. What brings you to our humble village?",
                "The forest clearing to the west? Aye, some say an old chest was left there long ago. Guarded by more than just shadows, perhaps.",
                "If you happen to find a shiny trinket or two, I might have something useful to trade for them. I collect curious things."
            ],
            dialogueIndex: 0
        }
    ]
  }
};

// Optional master lists - can be populated later
let items = {};
let monsters = {};

let currentMonster = null; // To store the monster object during combat
let inCombat = false;

// Get DOM elements
const sceneDescriptionEl = document.getElementById('scene-description');
const playerStatsEl = document.getElementById('player-stats');
const messageAreaEl = document.getElementById('message-area');
const commandInputEl = document.getElementById('command-input');
const submitCommandBtn = document.getElementById('submit-command');

// Implement renderScene() function
function renderScene() {
    const currentScene = world[player.currentSceneId];
    if (!currentScene) {
        sceneDescriptionEl.innerHTML = "<p>Error: Scene not found!</p>";
        return;
    }

    let html = `<p>${currentScene.description}</p>`;
    html += "<p>Exits:</p><ul>";
    for (const direction in currentScene.exits) {
        html += `<li>${direction}</li>`;
    }
    html += "</ul>";

    if (currentScene.items && currentScene.items.length > 0) {
        html += "<p>You see:</p><ul>";
        currentScene.items.forEach(item => {
            html += `<li>${item.name}</li>`;
        });
        html += "</ul>";
    }

    if (currentScene.npcs && currentScene.npcs.length > 0) {
        html += "<p>People here:</p><ul>"; // Or "People here:"
        currentScene.npcs.forEach(npc => {
            html += `<li>${npc.name}</li>`;
        });
        html += "</ul>";
    }
    
    const activeMonsters = currentScene.monsters ? currentScene.monsters.filter(m => !m.isDefeated) : [];
    if (activeMonsters.length > 0) {
        html += "<p>Dangers:</p><ul>";
        activeMonsters.forEach(monster => {
            html += `<li>${monster.name}</li>`;
        });
        html += "</ul>";
    }
    sceneDescriptionEl.innerHTML = html;
}

// Implement updatePlayerStats() function
function updatePlayerStats() {
    playerStatsEl.innerHTML = `
        <p>HP: ${player.stats.hp}</p>
        <p>Attack: ${player.stats.attack}</p>
        <p>Defense: ${player.stats.defense}</p>`;
}

// Implement processInput() function (basic version)
function processInput(command) {
    messageAreaEl.textContent = ""; // Clear previous messages
    const parts = command.toLowerCase().trim().split(" ");
    const action = parts[0];
    const targetName = parts.slice(1).join(" "); // e.g., "goblin scout"

    if (inCombat && action !== "attack") {
        messageAreaEl.textContent = "You are in combat! You must 'attack'.";
        commandInputEl.value = "";
        return;
    }

    const currentScene = world[player.currentSceneId];

    if (action === "go") {
        if (inCombat) {
            messageAreaEl.textContent = "You can't leave while in combat!";
            return;
        }
        if (currentScene.exits[targetName]) { // targetName here is direction
            player.currentSceneId = currentScene.exits[targetName];
            renderScene(); // This will also show new monsters if any
            // Check for auto-engage monsters when entering a new scene
            const monsterToFight = currentScene.monsters && currentScene.monsters.find(m => !m.isDefeated); // Assuming isDefeated flag
            if (monsterToFight) {
                // For simplicity, let's assume the first non-defeated monster auto-engages
                // Or, you could require player to type "attack [monster name]"
                // For now, let's not auto-engage to keep it simpler.
                // Player must type "attack [monster name]"
            }
        } else {
            messageAreaEl.textContent = "You can't go that way.";
        }
    } else if (action === "attack") {
        if (inCombat) {
            // Player attacks currentMonster
            handlePlayerAttack();
        } else {
            // Try to initiate combat
            const monsterToAttack = currentScene.monsters.find(m => m.name.toLowerCase() === targetName && !m.isDefeated);
            if (monsterToAttack) {
                startCombat(monsterToAttack);
            } else {
                messageAreaEl.textContent = "There is no '" + targetName + "' to attack here, or it's already defeated.";
            }
        }
    } else if (action === "take") {
        if (inCombat) {
            messageAreaEl.textContent = "You can't pick up items while in combat!";
            commandInputEl.value = "";
            return;
        }
        const itemToTake = currentScene.items.find(item => item.name.toLowerCase() === targetName);
        if (itemToTake) {
            // Add item to player's inventory
            player.inventory.push(JSON.parse(JSON.stringify(itemToTake))); // Add a copy
            // Remove item from scene
            currentScene.items = currentScene.items.filter(item => item.name.toLowerCase() !== targetName);
            messageAreaEl.textContent = `You picked up the ${itemToTake.name}.`;
            renderScene(); // Re-render scene to show item is gone
            updatePlayerStats(); // In case inventory display is part of stats or separate
        } else {
            messageAreaEl.textContent = "There is no '" + targetName + "' to take here.";
        }
    } else if (action === "inventory" || action === "inv") {
        if (inCombat) {
            // Potentially allow viewing inventory in combat, but keep it simple for now
            messageAreaEl.textContent = "You quickly glance at your pack, but should focus on the fight!";
            commandInputEl.value = "";
            return;
        }
        displayInventory();
    } else if (action === "use") {
        if (inCombat && targetName.toLowerCase().indexOf("potion") === -1) { // Example: only allow potions in combat
             messageAreaEl.textContent = "You can only use potions in combat!";
             commandInputEl.value = "";
             return;
        }
        useItem(targetName);
    } else if (action === "talk") {
        if (inCombat) {
            messageAreaEl.textContent = "You can't talk while in combat!";
            commandInputEl.value = "";
            return;
        }
        const npcName = targetName;
        const currentScene = world[player.currentSceneId];
        const npcToTalkTo = currentScene.npcs && currentScene.npcs.find(npc => npc.name.toLowerCase() === npcName);

        if (npcToTalkTo) {
            // Cycle through NPC dialogue
            messageAreaEl.textContent = `"${npcToTalkTo.dialogue[npcToTalkTo.dialogueIndex]}" - ${npcToTalkTo.name}`;
            npcToTalkTo.dialogueIndex = (npcToTalkTo.dialogueIndex + 1) % npcToTalkTo.dialogue.length;
        } else {
            messageAreaEl.textContent = "There's no one named '" + npcName + "' to talk to here.";
        }
    } else {
        messageAreaEl.textContent = "Unknown command.";
    }
    commandInputEl.value = ""; // Clear input field
    updatePlayerStats(); // Update stats after any action
}

function displayInventory() {
    if (player.inventory.length === 0) {
        messageAreaEl.textContent = "Your inventory is empty.";
        return;
    }
    let invHTML = "You are carrying:<ul>";
    player.inventory.forEach(item => {
        invHTML += `<li>${item.name} (${item.type})</li>`;
    });
    invHTML += "</ul>";
    messageAreaEl.innerHTML = invHTML; // Use innerHTML because of the list
}

function useItem(itemName) {
    const itemIndex = player.inventory.findIndex(item => item.name.toLowerCase() === itemName.toLowerCase());
    if (itemIndex === -1) {
        messageAreaEl.textContent = "You don't have a " + itemName + ".";
        return;
    }

    const itemToUse = player.inventory[itemIndex];
    let message = `You used the ${itemToUse.name}.`;

    // Item effects
    if (itemToUse.type === "potion" && itemToUse.effect && itemToUse.effect.heal) {
        player.stats.hp = Math.min(100, player.stats.hp + itemToUse.effect.heal); // Assuming max HP is 100 for now
        message += ` You healed for ${itemToUse.effect.heal} HP.`;
        // Potions are typically consumed
        player.inventory.splice(itemIndex, 1);
    } else if (itemToUse.type === "weapon" && itemToUse.effect && itemToUse.effect.attack) {
        // Simple weapon equip: assume only one weapon can be "active"
        // For simplicity, let's just add to stats. A real system would be more complex (equipped slots, etc.)
        // This is a permanent stat increase for now, which might not be desired.
        // A better approach would be to have an `equippedWeapon` slot and add its stats,
        // and unequip previous weapon. For now, keep it simple:
        player.stats.attack += itemToUse.effect.attack;
        message += ` Your attack increased by ${itemToUse.effect.attack}.`;
        // Typically, equipping doesn't consume the item unless it's a one-time scroll or similar.
        // For now, let's assume equipping a weapon doesn't consume it from inventory,
        // but also doesn't stack if used again. This needs more robust logic for a full game.
        // To prevent re-using for stat boost, we could remove it or add a flag.
        // For now, let's remove it to signify it's "equipped" (very basic).
        player.inventory.splice(itemIndex, 1);
        message += " It's now equipped (basic effect)."
    } else {
        message = "You can't use the " + itemToUse.name + " that way, or it has no effect.";
    }

    messageAreaEl.textContent = message;
    updatePlayerStats(); // Update display if HP or attack changed

    // If in combat and item used, monster might get a turn
    if (inCombat && currentMonster && currentMonster.stats.hp > 0 && itemToUse.type === 'potion') { // Example: monster attacks after potion use
        handleMonsterAttack();
    }
}

function startCombat(monster) {
    inCombat = true;
    currentMonster = JSON.parse(JSON.stringify(monster)); // Create a copy to fight, so original monster data isn't altered unless defeated
    messageAreaEl.textContent = `You engage the ${currentMonster.name}!`;
    // Optionally, render combat specific UI elements or change scene description
    // For now, messages will guide the combat.
    // Monster gets first hit (or player, your choice - let's say player for now by requiring "attack" command)
    // renderScene(); // Re-render to potentially show combat info or less options
}

function handlePlayerAttack() {
    if (!inCombat || !currentMonster) return;

    // Player's attack
    let playerDamage = Math.max(0, player.stats.attack - currentMonster.stats.defense);
    currentMonster.stats.hp -= playerDamage;
    messageAreaEl.innerHTML = `You attack the ${currentMonster.name} for ${playerDamage} damage.`;

    if (currentMonster.stats.hp <= 0) {
        messageAreaEl.innerHTML += `<br>You defeated the ${currentMonster.name}!`;
        // Mark monster as defeated in the actual 'world' object
        const sceneMonster = world[player.currentSceneId].monsters.find(m => m.id === currentMonster.id);
        if(sceneMonster) sceneMonster.isDefeated = true;

        // Handle loot (simplified)
        if (currentMonster.drops && currentMonster.drops.length > 0) {
            currentMonster.drops.forEach(drop => {
                player.inventory.push(JSON.parse(JSON.stringify(drop))); // Add a copy of the item
                messageAreaEl.innerHTML += `<br>The ${currentMonster.name} dropped: ${drop.name}. You pick it up.`;
            });
        }
        
        inCombat = false;
        currentMonster = null;
        renderScene(); // Update scene to remove defeated monster or show it as defeated
        updatePlayerStats(); // Update inventory display if it shows item counts
        return;
    }

    // Monster's counter-attack
    handleMonsterAttack();
}

function handleMonsterAttack() {
    if (!inCombat || !currentMonster) return;

    let monsterDamage = Math.max(0, currentMonster.stats.attack - player.stats.defense);
    player.stats.hp -= monsterDamage;
    messageAreaEl.innerHTML += `<br>The ${currentMonster.name} attacks you for ${monsterDamage} damage.`;
    updatePlayerStats();

    if (player.stats.hp <= 0) {
        player.stats.hp = 0; // Prevent negative HP
        messageAreaEl.innerHTML += "<br>You have been defeated! Game Over.";
        inCombat = false;
        // Handle game over: freeze input, show restart button, etc.
        // For now, just log and stop combat.
        commandInputEl.disabled = true;
        submitCommandBtn.disabled = true;
    }
}

// Add event listener for command submission
submitCommandBtn.addEventListener('click', () => {
    const command = commandInputEl.value;
    if (command) {
        processInput(command);
    }
});
commandInputEl.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const command = commandInputEl.value;
        if (command) {
            processInput(command);
        }
    }
});

// Initial game setup call
function gameLoop() {
    renderScene();
    updatePlayerStats();
}
gameLoop(); // Start the game
