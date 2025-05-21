let player = {
  stats: { hp: 100, attack: 10, defense: 5 },
  inventory: [],
  currentSceneId: "start"
};

let world = {
  start: {
    name: "寧靜森林空地",
    description: "你身處一片寧靜的森林空地。小路通往北方和東方。空地中央有一個舊箱子，村裡的長者曾提到過，一把「老舊的劍」為了安全被藏在這裡。",
    exits: { north: "darkCaveEntrance", east: "villageOutskirts" },
    items: [
      { id: "healthPotion", name: "治療藥水", description: "一瓶冒著氣泡的紅色藥水。", type: "potion", effect: { heal: 25 } },
      { id: "oldSword", name: "老舊的劍", description: "一把生鏽但尚可使用的劍。", type: "weapon", effect: { attack: 5 } }
    ],
    monsters: []
  },
  darkCaveEntrance: {
    name: "黑暗洞穴入口",
    description: "一個黑暗的洞穴出現在你面前。空氣寒冷，洞穴深處傳來威脅的咆哮聲。向南的小路可以返回森林空地。這個洞穴似乎與你尋找老舊的劍無關。",
    exits: { south: "start" },
    items: [],
    monsters: [
      { id: "goblin", name: "哥布林偵察兵", stats: { hp: 30, attack: 8, defense: 2 }, drops: [{ id: "goldCoin", name: "金幣", description: "一枚閃閃發光的金幣。", type: "currency" }] }
    ]
  },
  villageOutskirts: {
    name: "村莊外圍",
    description: "你位於小村莊的邊緣。西邊的路通回森林空地。東邊，你可以看到村莊廣場。一個舊路牌上寫著：「森林空地 - 西，村莊廣場 - 東」。",
    exits: { west: "start", east: "villageSquare" },
    items: [],
    monsters: []
  },
  villageSquare: {
    name: "村莊廣場",
    description: "村莊廣場現在比較安静。一位名叫艾拉的老婦人正在井邊照料她的小草藥園。一位看起來頗有學問的林學者則在樹下閱讀古籍。西邊的路通往村莊外圍，北邊似乎有條小路通往山區。",
    exits: { "west": "villageOutskirts", "north": "mountainPath" },
    items: [],
    monsters: [],
    npcs: [
        { 
            id: "elara", 
            name: "艾拉", 
            nameLower: "elara", 
            dialogue: [
                "歡迎，旅人。你給這個寧靜的村莊帶來了什麼新鮮事嗎？",
                "西邊的森林空地嗎？是的，有人說很久以前那裡留下了一個舊箱子。也許被一些不只是影子東西守護著。",
                "如果你碰巧找到一些閃亮的小飾品，我或許有些有用的東西可以和你交換。我喜歡收集奇特的小玩意兒。"
            ],
            dialogueIndex: 0
        },
        {
            id: "scholarLin",
            name: "林學者",
            nameLower: "lin", 
            dialogue: [
                "你好，年輕人。我看你氣宇軒昂，是否願意協助我一個小小的研究？", 
                "我正在研究古代文明，據說在山頂的古老祭壇上，曾有一塊記載重要歷史的石板。可惜它已碎裂，由一個石頭守衛看守著。", 
                "如果你能幫我取回一塊「古代石板碎片」，我將贈予你一些稀有的「高山之花」作為謝禮。它對你有大用處。", 
                "怎麼樣？石頭守衛就在山頂祭壇，拿到碎片後回來找我即可。", 
                "找到「古代石板碎片」了嗎？我很需要它來完成我的研究。" 
            ],
            dialogueIndex: 0,
            quests: [
                {
                    questId: "retrieveFragment",
                    status: "notStarted", 
                    objective: "取得「古代石板碎片」並交給林學者。",
                    requiredItem: "古代石板碎片", 
                    reward: { type: "item", itemId: "mountainFlower", name: "高山之花", quantity: 3, message: "太感謝你了！這三朵「高山之花」是給你的謝禮。" }
                }
            ]
        }
    ]
  },
  mountainPath: {
    id: "mountainPath",
    name: "山中小徑",
    description: "一條蜿蜒的山路向上延伸，通往雲霧繚繞的山峰。路邊的空氣清新但稀薄。東邊似乎可以回到村莊廣場附近。",
    exits: { "up": "peakPass", "east": "villageSquare" },
    items: [],
    monsters: []
  },
  peakPass: {
    id: "peakPass",
    name: "山頂隘口",
    description: "這裡是山頂的一個隘口，風勢強勁。一側是萬丈懸崖，另一側則隱約可見一座古老的祭壇。一條小路可以下山。",
    exits: { "down": "mountainPath", "north": "ancientAltar" },
    items: [
        { id: "mountainFlower", name: "高山之花", description: "只在險峻山峰上綻放的稀有花朵，據說有治療奇效。", type: "craftingMaterial" }
    ],
    monsters: []
  },
  ancientAltar: {
    id: "ancientAltar",
    name: "古老祭壇",
    description: "一座由巨大石塊砌成的古老祭壇聳立於此，散發著神秘的氣息。祭壇中央似乎有什麼東西在閃爍。一個強大的石頭守衛在這裡巡邏。",
    exits: { "south": "peakPass" },
    items: [], 
    monsters: [
        { 
            id: "stoneGuardian", 
            name: "石頭守衛", 
            stats: { hp: 70, attack: 12, defense: 8 }, 
            drops: [
                { id: "ancientTabletFragment", name: "古代石板碎片", description: "一塊刻有模糊符號的古老石板碎片，似乎是某個更大整體的一部分。", type: "questItem" }
            ],
            isDefeated: false 
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
    "north": "北", "south": "南", "east": "東", "west": "西",
    "northeast": "東北", "northwest": "西北", "southeast": "東南", "southwest": "西南",
    "up": "上", "down": "下", "inside": "內", "outside": "外"
};

function renderScene() {
    const currentScene = world[player.currentSceneId];
    if (!currentScene) {
        sceneDescriptionDisplayEl.innerHTML = "<p>錯誤：找不到場景！</p>"; 
        return;
    }

    sceneNameEl.textContent = currentScene.name;
    sceneDescriptionDisplayEl.innerHTML = `<p>${currentScene.description}</p>`; 

    sceneExitsEl.innerHTML = "<p>出口：</p>";
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
        exitsContainer.innerHTML = "<span>無處可去。</span>"; 
    }
    sceneExitsEl.appendChild(exitsContainer);

    sceneItemsEl.innerHTML = "<p>物品：</p>";
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
        sceneItemsEl.innerHTML += "<span>這裡沒有物品。</span>"; 
    }

    sceneNpcsEl.innerHTML = "<p>人物：</p>";
    if (currentScene.npcs && currentScene.npcs.length > 0) {
        const ul = document.createElement('ul');
        currentScene.npcs.forEach(npc => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.className = 'npc-button talk-npc-button';
            button.textContent = `💬 交談 ${npc.name}`; 
            button.dataset.npcName = npc.name;
            button.addEventListener('click', () => processInput(`talk ${npc.name}`));
            li.appendChild(button);
            ul.appendChild(li);
        });
        sceneNpcsEl.appendChild(ul);
    } else {
        sceneNpcsEl.innerHTML += "<span>這裡沒有人。</span>"; 
    }
    
    sceneMonstersEl.innerHTML = "<p>敵人：</p>";
    const activeMonsters = currentScene.monsters ? currentScene.monsters.filter(m => !m.isDefeated) : [];
    if (activeMonsters.length > 0) {
        const ul = document.createElement('ul');
        activeMonsters.forEach(monster => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.className = 'monster-button attack-monster-button';
            button.textContent = `⚔️ 攻擊 ${monster.name}`; 
            button.dataset.monsterName = monster.name;
            button.addEventListener('click', () => processInput(`attack ${monster.name}`));
            li.appendChild(button);
            ul.appendChild(li);
        });
        sceneMonstersEl.appendChild(ul);
    } else {
        sceneMonstersEl.innerHTML += "<span>這裡沒有敵人。</span>"; 
    }
    
    combatActionsEl.style.display = inCombat ? 'block' : 'none';
    generalActionsEl.style.display = inCombat ? 'none' : 'block'; 
}

function updatePlayerStats() {
    playerStatsContentEl.innerHTML = `
        <div><strong>生命值：</strong> ${player.stats.hp}</div>
        <div><strong>攻擊力：</strong> ${player.stats.attack}</div>
        <div><strong>防禦力：</strong> ${player.stats.defense}</div>`;
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
        displayMessage("在戰鬥中，你的選擇有限：攻擊、使用藥水或逃跑。"); 
        commandInputEl.value = "";
        return;
    }

    if (action === "go") {
        if (inCombat) {
            displayMessage("戰鬥中無法移動！"); 
            return;
        }
        if (currentScene.exits[targetName]) { 
            player.currentSceneId = currentScene.exits[targetName];
            displayMessage(`你前往 ${directionTranslations[targetName.toLowerCase()] || targetName}。`); 
        } else {
            displayMessage("你不能往那個方向走。"); 
        }
    } else if (action === "attack") {
        if (inCombat) {
            handlePlayerAttack(); 
        } else {
            const monsterToAttack = currentScene.monsters.find(m => m.name.toLowerCase() === targetName && !m.isDefeated);
            if (monsterToAttack) {
                startCombat(monsterToAttack);
            } else {
                displayMessage("這裡沒有叫「" + targetName + "」的敵人，或者它已經被擊敗了。"); 
            }
        }
    } else if (action === "take") {
        if (inCombat) {
            displayMessage("戰鬥中不能拾取物品！"); 
            commandInputEl.value = "";
            return;
        }
        const itemIndex = currentScene.items.findIndex(item => item.name.toLowerCase() === targetName);
        if (itemIndex !== -1) {
            const itemToTake = currentScene.items[itemIndex];
            player.inventory.push(JSON.parse(JSON.stringify(itemToTake))); 
            currentScene.items.splice(itemIndex, 1); 
            displayMessage(`你撿起了 ${itemToTake.name}。`); 
            displayInventory(); 
        } else {
            displayMessage("這裡沒有「" + targetName + "」物品。"); 
        }
    } else if (action === "inventory" || action === "inv") {
         displayInventory(); 
         displayMessage("你查看了物品欄。");
    } else if (action === "use") {
        useItem(targetName);
    } else if (action === "talk") {
        if (inCombat) {
            displayMessage("戰鬥中不能交談！"); 
            commandInputEl.value = "";
            return;
        }
        const npcToTalkTo = currentScene.npcs && currentScene.npcs.find(npc => npc.name.toLowerCase() === targetName.toLowerCase());

        if (npcToTalkTo && npcToTalkTo.id === "scholarLin") {
            const quest = npcToTalkTo.quests[0]; // Assuming one quest

            // Initial message display before quest-specific logic
            displayMessage(`「${npcToTalkTo.dialogue[npcToTalkTo.dialogueIndex]}」 - ${npcToTalkTo.name}`);

            if (quest.status === "notStarted") {
                // Dialogue indices are 0-based. Length 5 means indices 0,1,2,3,4.
                // Index 3 is the 4th dialogue line: "怎麼樣？石頭守衛就在山頂祭壇..."
                if (npcToTalkTo.dialogueIndex === 3 && npcToTalkTo.dialogue.length === 5) { 
                    quest.status = "started";
                    setTimeout(() => displayMessage(`(你接受了林學者的任務：${quest.objective})`), 10); 
                }
                npcToTalkTo.dialogueIndex = (npcToTalkTo.dialogueIndex + 1) % npcToTalkTo.dialogue.length;
            } else if (quest.status === "started") {
                const requiredItemIndex = player.inventory.findIndex(item => item.name === quest.requiredItem);
                if (requiredItemIndex !== -1) {
                    player.inventory.splice(requiredItemIndex, 1);

                    const rewardItemTemplate = {
                        id: quest.reward.itemId,
                        name: (quest.reward.itemId === "mountainFlower" ? "高山之花" : "未知物品"),
                        description: (quest.reward.itemId === "mountainFlower" ? "只在險峻山峰上綻放的稀有花朵，據說有治療奇效。" : "一個神秘的獎勵物品。"),
                        type: "craftingMaterial" 
                    };
                    for (let i = 0; i < quest.reward.quantity; i++) {
                        player.inventory.push(JSON.parse(JSON.stringify(rewardItemTemplate)));
                    }
                    
                    setTimeout(() => displayMessage(quest.reward.message), 10); 
                    quest.status = "completed";
                    npcToTalkTo.dialogue = ["多謝你的幫忙，這些石板對我的研究至關重要！", "山頂的風景如何？希望你沒有遇到太多麻煩。"]; 
                    npcToTalkTo.dialogueIndex = 0; 
                    updatePlayerStats();
                    displayInventory(); 
                } else {
                    // Player doesn't have the item. NPC already delivered current line.
                    // If current dialogue is not the "waiting" one (index 4), set it to be.
                    if (npcToTalkTo.dialogue.length === 5 && npcToTalkTo.dialogueIndex !== 4) { 
                         npcToTalkTo.dialogueIndex = 4; 
                         // Re-display this specific line if the generic cycle moved past it
                         displayMessage(`「${npcToTalkTo.dialogue[npcToTalkTo.dialogueIndex]}」 - ${npcToTalkTo.name}`);
                    } else if (npcToTalkTo.dialogue.length < 5) { 
                        // This case should not happen if status is 'started' with original dialogue length
                    }
                }
                // Only advance dialogue index if not handling completion or specific waiting message display
                if (quest.status !== 'completed' && requiredItemIndex === -1) {
                     if(npcToTalkTo.dialogue.length === 5 && npcToTalkTo.dialogueIndex === 4) {
                        // Stays on this message. If there were more "waiting" lines, it would cycle.
                     } else if (npcToTalkTo.dialogue.length === 5) { 
                        npcToTalkTo.dialogueIndex = (npcToTalkTo.dialogueIndex + 1) % npcToTalkTo.dialogue.length;
                     }
                }
            } else if (quest.status === "completed") {
                npcToTalkTo.dialogueIndex = (npcToTalkTo.dialogueIndex + 1) % npcToTalkTo.dialogue.length;
            }
            commandInputEl.value = ""; 
            updatePlayerStats(); 
            renderScene();
            return; 
        }

        // Default NPC dialogue cycling for NPCs not specially handled
        if (npcToTalkTo) {
            displayMessage(`「${npcToTalkTo.dialogue[npcToTalkTo.dialogueIndex]}」 - ${npcToTalkTo.name}`);
            // Avoid incrementing if it's Lin and he's on his "waiting for item" message (index 4 of 5),
            // unless his dialogue array has been shortened (e.g., post-completion).
            if (!(npcToTalkTo.id === "scholarLin" && 
                  npcToTalkTo.quests && npcToTalkTo.quests[0].status === "started" && 
                  npcToTalkTo.dialogue.length === 5 && npcToTalkTo.dialogueIndex === 4)) {
                npcToTalkTo.dialogueIndex = (npcToTalkTo.dialogueIndex + 1) % npcToTalkTo.dialogue.length;
            }
        } else {
            displayMessage("這裡沒有叫「" + targetName + "」的人可以交談。"); 
        }
    } else if (action === "flee" && inCombat) {
        if (Math.random() < 0.5) { // 50% chance
            displayMessage("你成功逃跑了！"); 
            inCombat = false;
            currentMonster = null;
        } else {
            displayMessage("你試圖逃跑，但失敗了！"); 
            handleMonsterAttack(); // Monster gets an attack if flee fails
        }
    } else if (action === "flee" && !inCombat) {
        displayMessage("你不在戰鬥中，無需逃跑。");
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
        inventoryContentEl.innerHTML = "<p>你的物品欄是空的。</p>"; 
        return; 
    }
    const ul = document.createElement('ul');
    player.inventory.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} (${item.type === "potion" ? "藥水" : item.type === "weapon" ? "武器" : "物品"}) `; 
        
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
        displayMessage("你沒有「" + itemName + "」。"); 
        return;
    }

    const itemToUse = player.inventory[itemIndex];
    let message = `你使用了 ${itemToUse.name}。`; 

    if (itemToUse.type === "potion" && itemToUse.effect && itemToUse.effect.heal) {
        player.stats.hp = Math.min(100, player.stats.hp + itemToUse.effect.heal); 
        message += ` 你恢復了 ${itemToUse.effect.heal} 點生命值。`; 
        player.inventory.splice(itemIndex, 1);
    } else if (itemToUse.type === "weapon" && itemToUse.effect && itemToUse.effect.attack) {
        player.stats.attack += itemToUse.effect.attack;
        message += ` 你的攻擊力增加了 ${itemToUse.effect.attack}。`; 
        player.inventory.splice(itemIndex, 1); 
        message += " 它現在裝備好了（基本效果）。"; 
    } else {
        message = "你無法那樣使用「" + itemToUse.name + "」，或者它沒有效果。"; 
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
        displayMessage("你不在戰鬥中，或者沒有攻擊目標。"); 
        return;
    }

    let playerDamage = Math.max(0, player.stats.attack - currentMonster.stats.defense);
    currentMonster.stats.hp -= playerDamage;
    let message = `你攻擊 ${currentMonster.name}，對其造成 ${playerDamage} 點傷害。`; 

    if (currentMonster.stats.hp <= 0) {
        message += `\n你擊敗了 ${currentMonster.name}！`; 
        const sceneMonster = world[player.currentSceneId].monsters.find(m => m.id === currentMonster.id);
        if(sceneMonster) sceneMonster.isDefeated = true;

        if (currentMonster.drops && currentMonster.drops.length > 0) {
            currentMonster.drops.forEach(drop => {
                player.inventory.push(JSON.parse(JSON.stringify(drop))); 
                message += `\n${currentMonster.name} 掉落了：${drop.name}。你撿了起來。`; 
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
    fullMessage += `${currentMonster.name} 攻擊你，對你造成 ${monsterDamage} 點傷害。`; 
    
    if (player.stats.hp <= 0) {
        player.stats.hp = 0; 
        fullMessage += "\n你被擊敗了！遊戲結束。"; 
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
    inventoryButton.textContent = "👜 查看物品欄"; 
    inventoryButton.addEventListener('click', () => {
        displayInventory(); 
        displayMessage("你查看了物品欄。"); 
    });
    generalActionsEl.appendChild(inventoryButton);

    const attackButton = document.createElement('button');
    attackButton.textContent = "⚔️ 攻擊"; 
    attackButton.className = 'attack'; 
    attackButton.addEventListener('click', () => {
        if(inCombat && currentMonster) {
            handlePlayerAttack(); 
        } else {
            displayMessage("沒有可以攻擊的目標，或者你不在戰鬥中。"); 
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
    saveGameButton.textContent = "💾 保存遊戲"; 
    saveGameButton.id = 'save-game-button';
    saveGameButton.addEventListener('click', saveGame);
    generalActionsEl.appendChild(saveGameButton);

    const loadGameButton = document.createElement('button');
    loadGameButton.textContent = "📂 載入遊戲"; 
    loadGameButton.id = 'load-game-button';
    loadGameButton.addEventListener('click', loadGame);
    generalActionsEl.appendChild(loadGameButton);

    renderScene();
    updatePlayerStats();
    displayInventory(); 
    displayMessage("歡迎來到文字冒險RPG！祝你遊戲愉快。"); 
}

function saveGame() {
    if (inCombat) {
        displayMessage("戰鬥中無法保存遊戲！"); 
        return;
    }
    try {
        const gameState = {
            player: player,
            world: world, 
        };
        localStorage.setItem('textRPGChineseSaveData', JSON.stringify(gameState));
        displayMessage("遊戲已保存！"); 
    } catch (error) {
        console.error("Error saving game:", error);
        displayMessage("保存遊戲失敗，可能是瀏覽器儲存已滿。"); 
    }
}

function loadGame() {
    if (inCombat) {
        displayMessage("戰鬥中無法載入遊戲！"); 
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
            
            displayMessage("遊戲已載入！"); 
        } else {
            displayMessage("未找到存檔。"); 
        }
    } catch (error) {
        console.error("Error loading game:", error);
        displayMessage("載入遊戲失敗，存檔可能已損壞。"); 
    }
}

initializeGame();
