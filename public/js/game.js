let player = {
  stats: { hp: 100, attack: 10, defense: 5 },
  inventory: [],
  currentSceneId: "start"
};

let world = {
  start: {
    name: "宁静森林空地",
    description: "你身处一片宁静的森林空地。小路通往北方和东方。空地中央有一个旧箱子，村里的长者曾提到过，一把“老旧的剑”为了安全被藏在这里。",
    exits: { north: "darkCaveEntrance", east: "villageOutskirts" },
    items: [
      { id: "healthPotion", name: "治疗药水", description: "一瓶冒着气泡的红色药水。", type: "potion", effect: { heal: 25 } },
      { id: "oldSword", name: "老旧的剑", description: "一把生锈但尚可使用的剑。", type: "weapon", effect: { attack: 5 } }
    ],
    monsters: []
  },
  darkCaveEntrance: {
    name: "黑暗洞穴入口",
    description: "一个黑暗的洞穴出现在你面前。空气寒冷，洞穴深处传来威胁的咆哮声。向南的小路可以返回森林空地。这个洞穴似乎与你寻找老旧的剑无关。",
    exits: { south: "start" },
    items: [],
    monsters: [
      { id: "goblin", name: "哥布林侦察兵", stats: { hp: 30, attack: 8, defense: 2 }, drops: [{ id: "goldCoin", name: "金币", description: "一枚闪闪发光的金币。", type: "currency" }] }
    ]
  },
  villageOutskirts: {
    name: "村庄外围",
    description: "你位于小村庄的边缘。西边的路通回森林空地。东边，你可以看到村庄广场。一个旧路牌上写着：‘森林空地 - 西，村庄广场 - 东’。",
    exits: { west: "start", east: "villageSquare" },
    items: [],
    monsters: []
  },
  villageSquare: {
    name: "村庄广场",
    description: "村庄广场现在比较安静。一位名叫艾拉的老妇人正在井边照料她的小草药园。西边的路通往村庄外围。",
    exits: { "west": "villageOutskirts" },
    items: [],
    monsters: [],
    npcs: [
        { 
            id: "elara", 
            name: "艾拉", 
            nameLower: "elara", // For easier command parsing
            dialogue: [
                "欢迎，旅人。你给这个宁静的村庄带来了什么新鲜事吗？",
                "西边的森林空地吗？是的，有人说很久以前那里留下了一个旧箱子。也许被一些不只是影子东西守护着。",
                "如果你碰巧找到一些闪亮的小饰品，我或许有些有用的东西可以和你交换。我喜欢收集奇特的小玩意儿。"
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
const sceneNameEl = document.getElementById('scene-name');
const sceneImagePlaceholderEl = document.getElementById('scene-image-placeholder'); 
const sceneDescriptionDisplayEl = document.getElementById('scene-description'); 
const sceneExitsEl = document.getElementById('scene-exits');
const sceneItemsEl = document.getElementById('scene-items');
const sceneNpcsEl = document.getElementById('scene-npcs');
const sceneMonstersEl = document.getElementById('scene-monsters');

const playerStatsContentEl = document.getElementById('player-stats-content');
const inventoryContentEl = document.getElementById('inventory-content');

const generalActionsEl = document.getElementById('general-actions');
const combatActionsEl = document.getElementById('combat-actions');

const gameMessagesEl = document.getElementById('game-messages'); 
const commandInputEl = document.getElementById('command-input');
const submitCommandBtn = document.getElementById('submit-command');


// Implement renderScene() function
const directionTranslations = {
    "north": "北", "south": "南", "east": "东", "west": "西",
    "northeast": "东北", "northwest": "西北", "southeast": "东南", "southwest": "西南",
    "up": "上", "down": "下", "inside": "内", "outside": "外"
};

function renderScene() {
    const currentScene = world[player.currentSceneId];
    if (!currentScene) {
        sceneDescriptionDisplayEl.innerHTML = "<p>错误：找不到场景！</p>"; 
        return;
    }

    sceneNameEl.textContent = currentScene.name;
    sceneDescriptionDisplayEl.innerHTML = `<p>${currentScene.description}</p>`; 

    sceneExitsEl.innerHTML = "<p>出口:</p>";
    const exitsContainer = document.createElement('div');
    exitsContainer.className = 'action-buttons';
    if (currentScene.exits && Object.keys(currentScene.exits).length > 0) {
        for (const direction in currentScene.exits) {
            const button = document.createElement('button');
            button.className = 'exit-button';
            let icon = '⦿'; // Default icon
            if (direction.toLowerCase() === 'north') icon = '↑';
            else if (direction.toLowerCase() === 'south') icon = '↓';
            else if (direction.toLowerCase() === 'east') icon = '→';
            else if (direction.toLowerCase() === 'west') icon = '←';
            button.textContent = `${icon} ${directionTranslations[direction.toLowerCase()] || direction}`;
            button.dataset.direction = direction; 
            button.addEventListener('click', () => processInput(`go ${direction}`));
            exitsContainer.appendChild(button);
        }
    } else {
        exitsContainer.innerHTML = "<span>无处可去。</span>"; 
    }
    sceneExitsEl.appendChild(exitsContainer);

    sceneItemsEl.innerHTML = "<p>物品:</p>";
    if (currentScene.items && currentScene.items.length > 0) {
        const ul = document.createElement('ul');
        currentScene.items.forEach(item => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.className = 'item-button take-item-button';
            button.textContent = `🖐️ 拿取 ${item.name}`; 
            button.dataset.itemName = item.name;
            button.addEventListener('click', () => processInput(`take ${item.name}`));
            li.appendChild(button);
            ul.appendChild(li);
        });
        sceneItemsEl.appendChild(ul);
    } else {
        sceneItemsEl.innerHTML += "<span>这里没有物品。</span>"; 
    }

    sceneNpcsEl.innerHTML = "<p>人物:</p>";
    if (currentScene.npcs && currentScene.npcs.length > 0) {
        const ul = document.createElement('ul');
        currentScene.npcs.forEach(npc => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.className = 'npc-button talk-npc-button';
            button.textContent = `💬 交谈 ${npc.name}`; 
            button.dataset.npcName = npc.name;
            button.addEventListener('click', () => processInput(`talk ${npc.name}`));
            li.appendChild(button);
            ul.appendChild(li);
        });
        sceneNpcsEl.appendChild(ul);
    } else {
        sceneNpcsEl.innerHTML += "<span>这里没有人。</span>"; 
    }
    
    sceneMonstersEl.innerHTML = "<p>敌人:</p>";
    const activeMonsters = currentScene.monsters ? currentScene.monsters.filter(m => !m.isDefeated) : [];
    if (activeMonsters.length > 0) {
        const ul = document.createElement('ul');
        activeMonsters.forEach(monster => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.className = 'monster-button attack-monster-button';
            button.textContent = `⚔️ 攻击 ${monster.name}`; 
            button.dataset.monsterName = monster.name;
            button.addEventListener('click', () => processInput(`attack ${monster.name}`));
            li.appendChild(button);
            ul.appendChild(li);
        });
        sceneMonstersEl.appendChild(ul);
    } else {
        sceneMonstersEl.innerHTML += "<span>这里没有敌人。</span>"; 
    }
    
    combatActionsEl.style.display = inCombat ? 'block' : 'none';
    generalActionsEl.style.display = inCombat ? 'none' : 'block'; 
}

function updatePlayerStats() {
    playerStatsContentEl.innerHTML = `
        <div><strong>生命值:</strong> ${player.stats.hp}</div>
        <div><strong>攻击力:</strong> ${player.stats.attack}</div>
        <div><strong>防御力:</strong> ${player.stats.defense}</div>`;
}

function displayMessage(message) { 
    gameMessagesEl.textContent = message;
}

function processInput(command) {
    displayMessage(""); 
    const parts = command.toLowerCase().trim().split(" ");
    const action = parts[0];
    const targetName = parts.slice(1).join(" "); 

    const currentScene = world[player.currentSceneId];

    if (inCombat && action !== "attack" && action !== "use" && action !== "flee") { 
        displayMessage("在战斗中，你的选择有限：攻击，使用药水，或逃跑。"); 
        commandInputEl.value = "";
        return;
    }

    if (action === "go") {
        if (inCombat) {
            displayMessage("战斗中无法移动！"); 
            return;
        }
        if (currentScene.exits[targetName]) { 
            player.currentSceneId = currentScene.exits[targetName];
            displayMessage(`你前往 ${directionTranslations[targetName.toLowerCase()] || targetName}。`); 
        } else {
            displayMessage("你不能往那个方向走。"); 
        }
    } else if (action === "attack") {
        if (inCombat) {
            handlePlayerAttack(); 
        } else {
            const monsterToAttack = currentScene.monsters.find(m => m.name.toLowerCase() === targetName && !m.isDefeated);
            if (monsterToAttack) {
                startCombat(monsterToAttack);
            } else {
                displayMessage("这里没有叫 '" + targetName + "' 的敌人，或者它已经被击败了。"); 
            }
        }
    } else if (action === "take") {
        if (inCombat) {
            displayMessage("战斗中不能拾取物品！"); 
            commandInputEl.value = "";
            return;
        }
        const itemIndex = currentScene.items.findIndex(item => item.name.toLowerCase() === targetName);
        if (itemIndex !== -1) {
            const itemToTake = currentScene.items[itemIndex];
            player.inventory.push(JSON.parse(JSON.stringify(itemToTake))); 
            currentScene.items.splice(itemIndex, 1); 
            displayMessage(`你拾取了 ${itemToTake.name}。`); 
            displayInventory(); 
        } else {
            displayMessage("这里没有 '" + targetName + "' 物品。"); 
        }
    } else if (action === "inventory" || action === "inv") {
         displayInventory(); 
         displayMessage("你查看了物品栏。");
    } else if (action === "use") {
        useItem(targetName);
    } else if (action === "talk") {
        if (inCombat) {
            displayMessage("战斗中不能交谈！"); 
            commandInputEl.value = "";
            return;
        }
        const npcToTalkTo = currentScene.npcs && currentScene.npcs.find(npc => npc.name.toLowerCase() === targetName);
        if (npcToTalkTo) {
            displayMessage(`"${npcToTalkTo.dialogue[npcToTalkTo.dialogueIndex]}" - ${npcToTalkTo.name}`);
            npcToTalkTo.dialogueIndex = (npcToTalkTo.dialogueIndex + 1) % npcToTalkTo.dialogue.length;
        } else {
            displayMessage("这里没有叫 '" + targetName + "' 的人可以交谈。"); 
        }
    } else if (action === "flee" && inCombat) {
        if (Math.random() < 0.5) { // 50% chance
            displayMessage("你成功逃跑了！"); 
            inCombat = false;
            currentMonster = null;
            // combatActionsEl.style.display = 'none'; // renderScene will handle this
            // generalActionsEl.style.display = 'block';
        } else {
            displayMessage("你试图逃跑，但失败了！"); 
            handleMonsterAttack(); // Monster gets an attack if flee fails
        }
    } else if (action === "flee" && !inCombat) {
        displayMessage("你不在战斗中，无需逃跑。");
    } else {
        displayMessage("未知指令。"); 
    }
    commandInputEl.value = ""; 
    updatePlayerStats(); 
    renderScene(); 
}

function displayInventory() {
    inventoryContentEl.innerHTML = ""; 
    if (player.inventory.length === 0) {
        inventoryContentEl.innerHTML = "<p>你的物品栏是空的。</p>"; 
        return; 
    }
    const ul = document.createElement('ul');
    player.inventory.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} (${item.type === "potion" ? "药水" : item.type === "weapon" ? "武器" : "物品"}) `; 
        
        const useButton = document.createElement('button');
        useButton.textContent = "✨ 使用"; 
        useButton.className = 'use-item-button';
        useButton.dataset.itemName = item.name;
        useButton.addEventListener('click', () => processInput(`use ${item.name}`));
        li.appendChild(useButton);
        ul.appendChild(li);
    });
    inventoryContentEl.appendChild(ul);
}

function useItem(itemName) {
    const itemIndex = player.inventory.findIndex(item => item.name.toLowerCase() === itemName.toLowerCase());
    if (itemIndex === -1) {
        displayMessage("你没有 " + itemName + "。"); 
        return;
    }

    const itemToUse = player.inventory[itemIndex];
    let message = `你使用了 ${itemToUse.name}。`; 

    if (itemToUse.type === "potion" && itemToUse.effect && itemToUse.effect.heal) {
        player.stats.hp = Math.min(100, player.stats.hp + itemToUse.effect.heal); 
        message += ` 你恢复了 ${itemToUse.effect.heal} 点生命值。`; 
        player.inventory.splice(itemIndex, 1);
    } else if (itemToUse.type === "weapon" && itemToUse.effect && itemToUse.effect.attack) {
        player.stats.attack += itemToUse.effect.attack;
        message += ` 你的攻击力增加了 ${itemToUse.effect.attack}。`; 
        player.inventory.splice(itemIndex, 1); 
        message += " 它现在装备好了（基本效果）。"; 
    } else {
        message = "你无法那样使用 " + itemToUse.name + "，或者它没有效果。"; 
    }

    displayMessage(message);
    updatePlayerStats(); 
    displayInventory(); 

    if (inCombat && currentMonster && currentMonster.stats.hp > 0 && itemToUse.type === 'potion') { 
        handleMonsterAttack(); 
    }
}

function startCombat(monster) {
    inCombat = true;
    currentMonster = JSON.parse(JSON.stringify(monster)); 
    displayMessage(`你遭遇了 ${currentMonster.name}！`); 
    renderScene(); // To update action panels
}

function handlePlayerAttack() {
    if (!inCombat || !currentMonster) {
        displayMessage("你不在战斗中，或者没有攻击目标。"); 
        return;
    }

    let playerDamage = Math.max(0, player.stats.attack - currentMonster.stats.defense);
    currentMonster.stats.hp -= playerDamage;
    let message = `你攻击 ${currentMonster.name}，造成 ${playerDamage} 点伤害。`; 

    if (currentMonster.stats.hp <= 0) {
        message += `\n你击败了 ${currentMonster.name}！`; 
        const sceneMonster = world[player.currentSceneId].monsters.find(m => m.id === currentMonster.id);
        if(sceneMonster) sceneMonster.isDefeated = true;

        if (currentMonster.drops && currentMonster.drops.length > 0) {
            currentMonster.drops.forEach(drop => {
                player.inventory.push(JSON.parse(JSON.stringify(drop))); 
                message += `\n${currentMonster.name} 掉落了：${drop.name}。你捡了起来。`; 
            });
            displayInventory(); 
        }
        
        inCombat = false;
        currentMonster = null;
    } else {
        handleMonsterAttack(message); 
        return; 
    }
    displayMessage(message);
    updatePlayerStats();
    renderScene();
}

function handleMonsterAttack(initialMessage = "") {
    if (!inCombat || !currentMonster) return;

    let monsterDamage = Math.max(0, currentMonster.stats.attack - player.stats.defense);
    player.stats.hp -= monsterDamage;
    let fullMessage = initialMessage;
    if (fullMessage) fullMessage += "\n"; 
    fullMessage += `${currentMonster.name} 攻击你，造成 ${monsterDamage} 点伤害。`; 
    
    if (player.stats.hp <= 0) {
        player.stats.hp = 0; 
        fullMessage += "\n你被击败了！游戏结束。"; 
        inCombat = false;
        currentMonster = null; // Clear current monster on defeat
        commandInputEl.disabled = true;
        submitCommandBtn.disabled = true;
    }
    displayMessage(fullMessage);
    updatePlayerStats();
    renderScene();
}

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

function initializeGame() {
    const inventoryButton = document.createElement('button');
    inventoryButton.textContent = "👜 查看物品栏"; 
    inventoryButton.addEventListener('click', () => {
        displayInventory(); 
        displayMessage("你查看了物品栏。"); 
    });
    generalActionsEl.appendChild(inventoryButton);

    const attackButton = document.createElement('button');
    attackButton.textContent = "⚔️ 攻击"; 
    attackButton.className = 'attack'; 
    attackButton.addEventListener('click', () => {
        if(inCombat && currentMonster) {
            handlePlayerAttack(); 
        } else {
            displayMessage("没有可以攻击的目标，或者你不在战斗中。"); 
        }
    });
    combatActionsEl.appendChild(attackButton);
    
    const fleeButton = document.createElement('button');
    fleeButton.textContent = "🏃 逃跑"; 
    fleeButton.className = 'flee'; 
    fleeButton.addEventListener('click', () => {
        processInput("flee"); 
    });
    combatActionsEl.appendChild(fleeButton);

    const saveGameButton = document.createElement('button');
    saveGameButton.textContent = "💾 保存游戏"; // Save Game
    saveGameButton.id = 'save-game-button';
    saveGameButton.addEventListener('click', saveGame);
    generalActionsEl.appendChild(saveGameButton);

    const loadGameButton = document.createElement('button');
    loadGameButton.textContent = "📂 加载游戏"; // Load Game
    loadGameButton.id = 'load-game-button';
    loadGameButton.addEventListener('click', loadGame);
    generalActionsEl.appendChild(loadGameButton);

    renderScene();
    updatePlayerStats();
    displayInventory(); 
    displayMessage("欢迎来到文字冒险RPG！祝你游戏愉快。"); 
}

function saveGame() {
    if (inCombat) {
        displayMessage("战斗中无法保存游戏！"); // Cannot save game during combat!
        return;
    }
    try {
        const gameState = {
            player: player,
            world: world, 
        };
        localStorage.setItem('textRPGChineseSaveData', JSON.stringify(gameState));
        displayMessage("游戏已保存！"); // Game saved!
    } catch (error) {
        console.error("Error saving game:", error);
        displayMessage("保存游戏失败，可能是浏览器存储已满。"); // Failed to save game, browser storage might be full.
    }
}

function loadGame() {
    if (inCombat) {
        displayMessage("战斗中无法加载游戏！"); // Cannot load game during combat!
        return;
    }
    try {
        const savedStateJSON = localStorage.getItem('textRPGChineseSaveData');
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);

            player.stats = savedState.player.stats;
            player.inventory = savedState.player.inventory;
            player.currentSceneId = savedState.player.currentSceneId;
            
            Object.assign(world, savedState.world);

            inCombat = false;
            currentMonster = null;
            
            updatePlayerStats();
            renderScene(); 
            displayInventory(); 
            
            displayMessage("游戏已加载！"); // Game loaded!
        } else {
            displayMessage("未找到存档。"); // No saved game found.
        }
    } catch (error) {
        console.error("Error loading game:", error);
        displayMessage("加载游戏失败，存档可能已损坏。"); // Failed to load game, save data might be corrupted.
    }
}

initializeGame();
