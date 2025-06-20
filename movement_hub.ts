/*
Copyright (C) 2025 Deana Brcka
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program.  If not, see <www.gnu.org/licenses/>.
*/

/// @ts-ignore
import { Instance } from "serverpointentity";

const nerdStuff = {
    pi: 3.14159265,
    doublePi: 6.2831853,
    halfPi: 1.5707963,
    rad: 0.0174533,
    deg: 57.2957795,
    maxInt: 2147483647,
    oneTick: 0.015625,
    nullV: [64000, 64000, 64000],
};

const chatcolors = {
    white: "",
    red: "",
    team: "",
    green: "",
    olive: "",
    brightgreen: "",
    lightred: "",
    silver: "",
    gold: "	",
    lightblue: "",
    blue: "",
    purple: "",
    lighterred: "",
    orange: ""
};

const defaultMapInfo = {
    maxStages: 0,
    steamHappies: 0,
    pb: nerdStuff.maxInt,
    pbSeg: nerdStuff.maxInt,
    pbFrenzy: nerdStuff.maxInt,
    hasFrenzy: false,
    hasTimeTrial: false,
    addedSeconds: 3
};

let config = {
    sounds: {
        levelDown: "/sounds/ui/armsrace_level_down",
        levelUp: "/sounds/ui/xp_levelup",
        beepSound: "sounds/buttons/button9",
        errorSound: "sounds/buttons/button8",
        yippi2: "sounds/ui/coin_pickup_01",
        yippi: "sounds/psp1g/yippie",
        laugh: "sounds/fire2k/laugh",
        requestMove: "/sounds/vo/agents/swat_fem/request_move_",
    },

    mapInfo: {
        "de_nuke": {
            ...defaultMapInfo,
            maxStages: 16,
            steamHappies: 30,
            hasFrenzy: true,
            hasTimeTrial: true,
        },
        "de_train": {
            ...defaultMapInfo,
            steamHappies: 30,
            hasFrenzy: true,
            hasTimeTrial: false,
            addedSeconds: 2
        },
        "de_mirage": {
            ...defaultMapInfo,
            maxStages: 11,
            hasTimeTrial: true,
        },
        "de_inferno": {
            ...defaultMapInfo,
        },
        "de_overpass": {
            ...defaultMapInfo,
        },
        "de_ancient": {
            ...defaultMapInfo,
        },
        "de_vertigo": {
            ...defaultMapInfo,
        },
        "de_anubis": {
            ...defaultMapInfo,
            steamHappies: 28,
            hasFrenzy: true,
            addedSeconds: 2,
        },
        "cs_italy": {
            ...defaultMapInfo,
        },
        "cs_office": {
            ...defaultMapInfo,
        },
        "de_dust2": {
            ...defaultMapInfo,
        },
        "de_cache": {
            ...defaultMapInfo,
            maxStages: 13,
            steamHappies: 30,
            hasFrenzy: true,
            hasTimeTrial: true,
        },
        "undefined": {
            ...defaultMapInfo
        }
    },

    adInterval: 45,
    adCount: 12,
};

let server = {
    date: new Date(),

    firstSetup: false,

    randomHashPW: "00001111",
    isDebug: false,
    currentTick: 1,
    currentRadioCmd: "radio",
    nextRadioTick: 64,
    allowVeloTick: 0,
    disallowVeloTick: 0,
    weaponFiredTick: 0,
    currentMapName: "undefined",
    playerSpawnedIn: false,
    lastChatMessageTick: 0,
    nextAdTick: 5760,

    trailDuration: 3,

    sendCommand: function (message, delay = 0) { Instance.EntFireAtName("sv", "Command", `${message}`, delay) },

    sendChat: function (message) {
        var lastMessageTicks = server.currentTick - server.lastChatMessageTick;
        var delay = lastMessageTicks <= 20 ? (20 - lastMessageTicks) / 64 : 0;
        Instance.EntFireAtName("sv", "Command", `say_team ${message}`, delay);
        server.lastChatMessageTick = server.currentTick;
    },

    sendChatColored: function (message, ddlay = 0) {
        var lastMessageTicks = server.currentTick - server.lastChatMessageTick;
        var delay = lastMessageTicks <= 20 ? (20 - lastMessageTicks) / 64 : 0;
        Instance.EntFireAtName("sv", "Command", `say_team "${message}"`, delay + ddlay);
        server.lastChatMessageTick = server.currentTick;
    },

    playSound: function (message, delay = 0) { Instance.EntFireAtName("sv", "Command", `play ${message}`, delay) },
    entFire: function (targetname, key, value = "", delay = 0) { Instance.EntFireAtName(targetname, key, value, delay) },

    cheetoCrash: function () {
        hud.showParticleInfo(0);
        server.playSound(config.sounds.errorSound);
        server.sendCommand(`ent_create env_decal {"material" "byebye" "width" "1" "height" "1" "depth" "1" "projectonworld" "true"}`, 2);
    },

    onTick: function () {
        server.currentTick++;

        // Handle first Spawn
        if (!server.firstSetup && server.currentTick > 175) {
            server.randomHashPW = utils.generateRandomHash().toString();
            server.sendCommand(`sv_radio_throttle_window 0; sv_disable_teamselect_menu 0; snd_toolvolume 0.025; noclip_fixup 0;`);
            server.sendCommand(`game_alias comp; sv_gameinstructor_disable 0; sv_gameinstructor_enable 1`, 0.3125);

            server.entFire("end_s*", "addoutput", "OnStartTouch>kz_script>on_trial_stage_finish>" + server.randomHashPW + ">0>-1");
            server.entFire("collected_s*", "addoutput", "OnStartTouch>kz_script>on_trial_alt_collect>" + server.randomHashPW + ">0>-1");
            server.entFire("finish_s" + config.mapInfo[server.currentMapName].maxStages, "addoutput", "OnStartTouch>kz_script>on_trial_finish>" + server.randomHashPW + ">0>-1");

            switch (server.date.getMonth()) {
                case 5:
                    server.sendCommand(`ent_create info_particle_system {"targetname" "festive_pride" "origin" "0 0 0" "angles" "0 0 0" "effect_name" "particles/hud/festive_pride.vpcf" "start_active" "True"}`);
                    break;
                default:
                    break;
            }

            for (let i = 0; i <= 9; i++) {
                server.sendCommand(`ent_create info_particle_system {"targetname" "veloMsg1_${i}" "origin" "0 0 0" "angles" "0 0 0" "effect_name" "particles/hud/velo/velo1_${i}.vpcf" "start_active" "False"}`, nerdStuff.oneTick * i);
                server.sendCommand(`ent_create info_particle_system {"targetname" "veloMsg2_${i}" "origin" "0 0 0" "angles" "0 0 0" "effect_name" "particles/hud/velo/velo2_${i}.vpcf" "start_active" "False"}`, nerdStuff.oneTick * i);
                server.sendCommand(`ent_create info_particle_system {"targetname" "veloMsg3_${i}" "origin" "0 0 0" "angles" "0 0 0" "effect_name" "particles/hud/velo/velo3_${i}.vpcf" "start_active" "False"}`, nerdStuff.oneTick * i);

                server.sendCommand(`ent_create info_particle_system {"targetname" "veloMsg1pre_${i}" "origin" "0 0 0" "angles" "0 0 0" "effect_name" "particles/hud/velo/pre_velo1_${i}.vpcf" "start_active" "False"}`, nerdStuff.oneTick * i);
                server.sendCommand(`ent_create info_particle_system {"targetname" "veloMsg2pre_${i}" "origin" "0 0 0" "angles" "0 0 0" "effect_name" "particles/hud/velo/pre_velo2_${i}.vpcf" "start_active" "False"}`, nerdStuff.oneTick * i);
                server.sendCommand(`ent_create info_particle_system {"targetname" "veloMsg3pre_${i}" "origin" "0 0 0" "angles" "0 0 0" "effect_name" "particles/hud/velo/pre_velo3_${i}.vpcf" "start_active" "False"}`, nerdStuff.oneTick * i);
            }

            server.sendCommand("ent_fire loadscreen destroyimmediately", nerdStuff.oneTick * 10);
            server.sendCommand("jointeam 2 1", nerdStuff.oneTick * 10);
            server.firstSetup = true;
        }

        // Handle ResetVelo and disallow noclip
        if (server.currentTick === server.allowVeloTick || server.currentTick === server.disallowVeloTick) {
            if (server.currentTick === server.allowVeloTick) {
                player.allowTrail = true;
                server.sendCommand("sv_noclipaccelerate 5; sv_noclipspeed 1200; sv_maxvelocity 3500; noclip 0");
            } else {
                player.allowTrail = false;
                server.sendCommand("sv_noclipaccelerate 0; sv_noclipspeed 0; sv_maxvelocity -0.75; noclip 1");
            }
        }
        else if (server.currentTick > server.disallowVeloTick && !player.timerStopped && !server.isDebug) {
            server.sendCommand(`noclip 0; sv_autobunnyhopping 0; sv_jump_spam_penalty_time ${nerdStuff.oneTick}; sv_staminalandcost 0.05; sv_airaccelerate 12; sv_air_max_wishspeed 30; sv_noclipspeed 0`);
        }

        // Handle Radio
        if (server.currentTick === server.nextRadioTick) {
            server.nextRadioTick = server.currentTick + 32;
            if (player.timerStopped) {
                server.currentRadioCmd = (server.currentRadioCmd === "radio") ? "radio1" : "radio";
            } else {
                server.currentRadioCmd = (server.currentRadioCmd === "radio3") ? "radio2" : "radio3";
            }
            server.sendCommand(`${server.currentRadioCmd}`);
        }

        // Handle Ads
        if (server.currentTick === server.nextAdTick) {
            server.nextAdTick = server.currentTick + (64 * config.adInterval);
            hud.showParticleChatAd(Math.floor(Math.random() * config.adCount) + 1);
        }
        else if (hud.centerHudCount === 115200) {
            //server.sendChatColored(`${chatcolors.lightred}You have spent a long time inside ${chatcolors.olive}MOVEMENT HUB${chatcolors.lightred} please consider changing maps or taking a break to prevent a crash!`);
            hud.showParticleInfo(4);
            server.playSound(config.sounds.errorSound);
        }

        // Handle Blue Triggers
        if (server.currentTick === player.respawnBlueTick && player.isTouchingBlue) {
            player.segmentedTimerTicks = 0;
            player.resetPlayerVars();
            player.resetVelo();
            player.checkpoints.locked = true;
            server.entFire("tp_s" + player.currentStage, "Teleport", "", nerdStuff.oneTick);
            Instance.Msg(`Respawned at stage ${player.currentStage}`);
        }

        // Handle Timer
        if (!player.timerStopped && player.currentMode === "TimeTrial") {
            player.timerTicks++;
            player.segmentedTimerTicks++;
        }
        else if (!player.timerStopped && player.currentMode === "HappyFrenzy") {
            player.timerTicks--;
            player.segmentedTimerTicks--;
            if (player.timerTicks < 1) {
                player.respawn();
                player.currentStage = 0;
                player.timerStopped = true;
                //server.sendChatColored(`${chatcolors.red}Your time is up! ${chatcolors.white}Try again! ${chatcolors.purple}:3c`);
                hud.showParticleInfo(1);
            }
        }

        // Handle Movement and Position Update
        if (player.playerJumped) {
            player.ticksInAir++;
            player.lastJumpHeights.push(utils.calculateHeightDifference(player.playerJumpedPos, player.playerPos));
        }

        player.playerPos = Instance.GetEntityOrigin(Instance.GetPlayerPawn(0));

        if (player.oldPlayerPos.some((value, index) => value !== player.playerPos[index])) {
            player.lastStoodStill = server.currentTick;
            //if (!player.timerStopped) Instance.Msg(`${player.currentStage}: ${player.playerPos[0]} ${player.playerPos[1]} ${player.playerPos[2]}`);
        }

        player.playerVel = utils.calculateVelocity(player.oldPlayerPos, player.playerPos);
        if (player.allowTrail && player.timerStopped && hud.trailColorIndex !== 0) {
            player.spawnTrail();
        }

        player.oldPlayerPos = player.playerPos;

        // Update HUD
        hud.printHud();
        hud.nextRainbowColor();
    },

    onSound: function () {
        if (player.playerJumped && server.weaponFiredTick !== server.currentTick) {
            player.playerLandedPos = player.oldPlayerPos;

            if (player.playerJumpedPos !== nerdStuff.nullV && player.playerLandedPos !== nerdStuff.nullV) {
                const distance = utils.calculateDistance(player.playerJumpedPos, player.playerLandedPos);
                if (distance !== 0 && distance > 100 && player.ticksInAir > 5) hud.populateLJSlots(distance.toFixed(2), player.playerPreVel, Math.max(...player.lastJumpHeights).toFixed(2).padStart(6, '0'));
                player.lastJumpHeights = [];
            }
            player.ticksInAir = 0;
            player.playerJumped = false;
            player.playerPreVel = "000.00";
        }
    },

    onJump: function () {
        player.playerPreVel = player.playerVel;
        player.playerJumped = true;
        player.playerJumpedPos = player.oldPlayerPos;
        player.ticksInAir = 0;
    },

    onRoundStart: function () {
        if (server.playerSpawnedIn) {
            server.sendChatColored(`${chatcolors.red}Please dont try to restart the round on your own! ${chatcolors.silver}Things can break :(`);
            server.sendChatColored(`${chatcolors.red}The map will now restart! ${chatcolors.silver}Please wait...`);
            hud.showParticleInfo(9);
            server.sendCommand(`map_workshop 3355497176 movement_hub`, 2);
        }

        server.currentTick = 0;
        server.playerSpawnedIn = false;
    },

    onTrialStart: function (fromRestart = false, TimeTrial = true) {
        if (TimeTrial) {
            if (config.mapInfo[server.currentMapName].hasTimeTrial === false) {
                server.playSound(config.sounds.errorSound);
                server.sendChatColored(`${chatcolors.silver}Time Trial not available on ${server.currentMapName}! ...yet`);
                hud.showParticleInfo(10);
                return;
            }
        } else {
            if (config.mapInfo[server.currentMapName].hasFrenzy === false) {
                server.playSound(config.sounds.errorSound);
                server.sendChatColored(`${chatcolors.silver}Happy Frenzy not available on ${server.currentMapName}! ...yet`);
                hud.showParticleInfo(11);
                return;
            }
        }

        if (fromRestart) player.respawn(true, true);

        player.currentMode = TimeTrial ? "TimeTrial" : "HappyFrenzy";
        player.timerStopped = false;
        player.timerTicks = player.currentMode !== "HappyFrenzy" ? 0 : (64 * 60);
        player.steamhappies = 0;
        player.segmentedTimerTicks = 0;
        player.segmentedTimerTicksTotal = 0;

        player.currentStage = 1;

        player.resetPlayerVars();
        player.checkpoints.locked = true;

        server.playSound(config.sounds.requestMove + String(Math.floor(Math.random() * 11) + 1).padStart(2, '0'));

        server.loadNextStage(player.currentStage, TimeTrial);
    },

    onTrialSkip: function () {
        if (player.timerStopped || player.currentMode === "HappyFrenzy") {
            //server.sendChatColored(`${chatcolors.red} You can't skip stages right now!`);
            hud.showParticleInfo(2);
            return;
        }

        player.timerTicks = player.timerTicks + (64 * 60);
        player.segmentedTimerTicksTotal = player.segmentedTimerTicksTotal + (64 * 60);
        player.segmentedTimerTicks = 0;

        player.resetPlayerVars();

        server.playSound(config.sounds.levelDown);
        server.sendChatColored(`${chatcolors.silver}Skipping stage ${chatcolors.white}#${player.currentStage}${chatcolors.silver}...`);
        hud.showParticleInfo(12);
        server.playSound(config.sounds.laugh);

        if (player.currentStage === config.mapInfo[server.currentMapName].maxStages) {
            server.onTrialFinish();
        }
        else {
            server.loadNextStage(player.currentStage + 1);
        }
    },

    onTrialFinish: function (timeTrial = true) {
        player.segmentedTimerTicksTotal += player.segmentedTimerTicks;
        player.segmentedTimerTicks = 0;

        player.resetPlayerVars();

        const mapInfo = config.mapInfo[server.currentMapName];
        const { timerTicks, segmentedTimerTicksTotal } = player;

        const isTimeTrial = player.currentMode === "TimeTrial";
        const pbTime = isTimeTrial ? mapInfo.pb : mapInfo.pbFrenzy;
        const maxInt = nerdStuff.maxInt;

        const timeDiff = pbTime !== maxInt
            ? `${chatcolors.silver}[${utils.formatTimeDifference(timerTicks, pbTime)}${chatcolors.silver}]`
            : "";

        const segTimeDiff = mapInfo.pbSeg !== maxInt ? `${chatcolors.silver}[${utils.formatTimeDifference(segmentedTimerTicksTotal, mapInfo.pbSeg)}${chatcolors.silver}]` : "";

        server.sendChatColored(`${chatcolors.silver}Total time${!timeTrial ? " left" : ""}: ${chatcolors.green}${utils.formatTime(timerTicks)} ${chatcolors.silver}${timeDiff}`);
        server.sendChatColored(timeTrial ? `${chatcolors.silver}Segmented time: ${chatcolors.green}${utils.formatTime(segmentedTimerTicksTotal)} ${chatcolors.silver}${segTimeDiff}` : `${chatcolors.silver}Total Points: ${chatcolors.green}${timerTicks}`);

        if (timeTrial) {
            if (timerTicks < mapInfo.pb) mapInfo.pb = timerTicks;
            if (segmentedTimerTicksTotal < mapInfo.pbSeg) mapInfo.pbSeg = segmentedTimerTicksTotal;
        } else {
            if (timerTicks > mapInfo.pbFrenzy) mapInfo.pbFrenzy = timerTicks;
        }

        Instance.Msg(`${timeTrial ? "Time Trial" : "Happy Frenzy"} Finished!`);
        player.respawn();
        server.playSound(config.sounds.levelUp);
        player.currentMode = "FreeRoam";
    },

    onTrialStageFinish: function (s) {
        if (s.toString() != server.randomHashPW || player.timerStopped) {
            server.cheetoCrash();
            return;
        }

        player.segmentedTimerTicksTotal = player.segmentedTimerTicks + player.segmentedTimerTicksTotal;
        player.segmentedTimerTicks = 0;

        player.resetPlayerVars();

        server.playSound(config.sounds.yippi);

        server.loadNextStage(player.currentStage + 1);
        Instance.Msg(`Stage ${player.currentStage} cleared!`);
    },

    onTrialCollect: function () {
        player.timerTicks += (64 * config.mapInfo[server.currentMapName].addedSeconds);
        player.steamhappies++;

        server.playSound(config.sounds.yippi);
        server.sendChatColored(`${chatcolors.green}+${config.mapInfo[server.currentMapName].addedSeconds} seconds added your timer!`);

        if (player.steamhappies === config.mapInfo[server.currentMapName].steamHappies) {
            server.onTrialFinish(false);
        }
    },

    onTrialRespawn: function () {
        if (player.timerStopped) return;
        if (player.currentMode === "HappyFrenzy") {
            server.onTrialStart(false, false);
            return;
        }

        player.segmentedTimerTicks = 0;

        player.resetPlayerVars();

        player.checkpoints.locked = true;
        player.resetVelo();
        server.entFire("tp_s" + player.currentStage, "Teleport", "", nerdStuff.oneTick);
        server.playSound(config.sounds.levelDown);
        if (hud.trailColorIndex !== 0) server.showStageTrail(server.currentMapName, player.currentStage, false);
        Instance.Msg(`Respawned at stage ${player.currentStage}`);
    },

    onTrialRespawnBlue: function (n) {
        if (n == 1) {
            player.isTouchingBlue = true;
            player.respawnBlueTick = server.currentTick + 16;
        } else if (n == 0) {
            player.isTouchingBlue = false;
            player.respawnBlueTick = 0;
        }
    },

    onTrialGuide: function () {
        if (player.timerStopped) {
            return;
        }

        if (player.currentMode === "HappyFrenzy") {
            //server.sendChatColored(`${chatcolors.red} This mode does not support Trails!`);
            hud.showParticleInfo(3);
            return;
        }

        server.showStageTrail(server.currentMapName, player.currentStage, true);
    },

    onFreeRoam: function () {
        player.segmentedTimerTicksTotal = 0;
        player.segmentedTimerTicks = 0;

        player.resetPlayerVars();

        player.checkpoints.locked = false;
        player.respawn(true);
        server.entFire("tp_freeroam", "Teleport");
        server.sendCommand("ent_fire prop_door_rotating close");
        server.sendCommand("ent_fire func_door_rotating close");
    },

    onBackToHub: function () {
        player.respawn();
        player.currentStage = 0;
    },

    loadNextStage: function (n, timeTrial = true) {
        Instance.Msg(`Loading Stage ${n}`);

        player.resetVelo();

        if (timeTrial === true) {
            server.sendCommand("ent_fire prop_door_rotating open", 1);
            server.sendCommand("ent_fire func_door_rotating open", 1);

            server.entFire("tp_s" + n, "Teleport", "", nerdStuff.oneTick);
            server.entFire("ent_s" + n, "Enable", "", nerdStuff.oneTick);

            if (n !== config.mapInfo[server.currentMapName].maxStages)
                server.entFire("end_s" + n, "Enable", "", nerdStuff.oneTick);
            else
                server.entFire("finish_s" + n, "Enable", "", nerdStuff.oneTick);

            server.entFire("collected_s*", "Disable");
            server.entFire("ent_hf", "Disable");
        }
        else {
            server.entFire("collected_s*", "Enable");
            server.entFire("tp_hf", "Teleport", "", nerdStuff.oneTick);
            server.entFire("ent_hf", "Enable", "", nerdStuff.oneTick);

            server.entFire("ent_s" + (n - 1), "Disable");
            server.entFire("end_s" + (n - 1), "Disable");
            server.entFire("finish_s" + (n - 1), "Disable");
        }

        if (n - 1 !== 0) {
            server.entFire("ent_s" + (n - 1), "Disable");
            server.entFire("end_s" + (n - 1), "Disable");
            server.entFire("finish_s" + (n - 1), "Disable");
            if (timeTrial === false) {
                server.entFire("collected_s*", "Disable");
                server.entFire("ent_hf", "Disable");
            }
        }

        player.currentStage = n;

        Instance.Msg(`Stage ${n} Loaded`);

        if (hud.trailColorIndex !== 0 && player.currentMode !== "HappyFrenzy") server.showStageTrail(server.currentMapName, player.currentStage, false);
    },

    showStageTrail: function (currentMap, currentIndex, longer = false) {
        if (!guideTrails[currentMap] || !guideTrails[currentMap][currentIndex]) return;

        const points = guideTrails[currentMap][currentIndex];
        let delay = nerdStuff.oneTick;

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const command = `box ${p1[0]} ${p1[1]} ${p1[2]} ${p2[0]} ${p2[1]} ${p2[2]} ${(longer ? 5 : 1)} ${hud.currentColor.r} ${hud.currentColor.g} ${hud.currentColor.b}`;
            server.sendCommand(command, delay);
            delay += nerdStuff.oneTick;
        }
    },

    setResFix: function (s) {
        var width = s.toString().split("x")[0];
        var height = s.toString().split("x")[1];
        hud.getScreenMultiplier(width, height);
        server.sendChatColored(`${chatcolors.silver}Resolution fixed to ${chatcolors.white}${width}x${height}${chatcolors.silver}!`);
    },

    setTrail: function (s) {
        var choice = parseInt(s);
        if (isNaN(choice)) {
            choice = 0;
        } else if (choice === 0) {
            player.allowTrail = false;
            hud.trailColorIndex = 0;
            server.sendChatColored(`${chatcolors.silver}Trail disabled!`);
        } else {
            player.allowTrail = true;
            hud.trailColorIndex = choice > 0 && choice < 7 ? choice : 0;

            const trails = [
                `${chatcolors.orange}LGTV Community`,
                `${chatcolors.lightblue}Cotton Candy`,
                `${chatcolors.lighterred}Long Bacon`,
                `${chatcolors.green}Men`,
                `${chatcolors.purple}Float Points`,
                `${chatcolors.team}Cool Lighting`
            ];

            if (choice >= 1 && choice <= trails.length) {
                server.sendChatColored(`${chatcolors.silver}Trail set to ${trails[choice - 1]}${chatcolors.silver}!`);
            }

            hud.currentColor = hud.currentColor || { r: 255, g: 255, b: 255 };
            hud.targetColorIndex = 0;
        }
    },

    bbox: function () {
        server.sendCommand(`cl_ent_bbox !player`);
        player.bbox = !player.bbox;
        server.sendChatColored(`${chatcolors.silver}Bounding Box: ${player.bbox ? `${chatcolors.green}Enabled` : `${chatcolors.red}Disabled`}`);
    },

    kzTeleport: function () {
        if (player.checkpoints.locked) {
            server.sendChatColored(`${chatcolors.red}Custom checkpoints unavailable! ${chatcolors.silver}Enter Free Roam first!`);
            hud.showParticleInfo(8);
            server.playSound(config.sounds.errorSound);
            return;
        }

        if (player.checkpoints.pos != nerdStuff.nullV) {
            player.resetVelo();
            server.sendCommand(`setpos ${player.checkpoints.pos[0]} ${player.checkpoints.pos[1]} ${player.checkpoints.pos[2]}; setang ${player.checkpoints.ang[0]} ${player.checkpoints.ang[1]} ${player.checkpoints.ang[3]}`, nerdStuff.oneTick);

            player.checkpoints.tpNum++;
            player.resetPlayerVars(true, true);
            //hud.showInfo(`Checkpoint #${player.checkpoint.cpNum} Loaded!`);
            server.sendChatColored(`${chatcolors.silver}Checkpoint ${chatcolors.white}#${player.checkpoints.cpNum} ${chatcolors.silver}Loaded!`);
            hud.showParticleInfo(6);
            server.playSound(config.sounds.beepSound);
            player.checkpoints.lastCheckpointStamp = server.currentTick;
            Instance.Msg(`Loaded checkpoint #${player.checkpoints.tpNum}`);
        } else {
            //hud.showInfo(`No checkpoint to load!`);
            server.sendChatColored(`${chatcolors.silver}No checkpoint to load!`);

            server.playSound(config.sounds.errorSound);
        }
    },

    kzCheckpoint: function () {
        if (player.checkpoints.locked) {
            //server.sendChatColored(`${chatcolors.red}Custom checkpoints unavailable! ${chatcolors.silver}Enter Free Roam first!`);
            hud.showParticleInfo(8);

            server.playSound(config.sounds.errorSound);
            return;
        }

        if (player.ticksInAir > 3) {
            //server.sendChatColored(`${chatcolors.red}You must be on the ground before saving a checkpoint!`);
            hud.showParticleInfo(7);
            server.playSound(config.sounds.errorSound);
            return;
        }

        player.checkpoints.pos = player.playerPos;
        player.checkpoints.ang = player.getPlayerAngle(player.playerPos);
        player.checkpoints.cpNum++;
        player.checkpoints.lastCheckpointStamp = server.currentTick;

        //hud.showInfo(`Checkpoint #${player.checkpoint.cpNum} Saved!`);
        server.sendChatColored(`${chatcolors.silver}Checkpoint ${chatcolors.white}#${player.checkpoints.cpNum} ${chatcolors.silver}Saved!`);

        hud.showParticleInfo(5);

        server.playSound(config.sounds.beepSound);

        Instance.Msg(`Set checkpoint #${player.checkpoints.cpNum}`);
    },

    loadSavedSettings: function (s) {


        var json = JSON.parse(s);
        server.trailDuration = json.trailDuration;
        hud.trailColorIndex = json.trailColorIndex;
        player.bbox = json.bbox;
    },

    saveSettingsJson: function () {
        if (Instance.IsWarmupPeriod() === true) return;
        var json = {
            trailDuration: server.trailDuration,
            trailColorIndex: hud.trailColorIndex,
            bbox: player.bbox
        };
        var s = JSON.stringify(json);
        server.sendCommand(`alias mh_saved_settings "ent_fire kz_script load_settings_json "${s}" 0`);
        server.entFire
    }
};

let hud = {
    currentColor: { r: 255, g: 0, b: 0 },
    targetColorIndex: 0,
    trailColorIndex: 1,
    widthMultiplier: 1,
    heightMultiplier: 1,
    ljSlot1: " 000.00   000.00   000.00 ",
    ljSlot2: " 000.00   000.00   000.00 ",
    ljSlot3: " 000.00   000.00   000.00 ",
    ljSlot4: " 000.00   000.00   000.00 ",
    infoSlot: "",
    infoSlotResetTick: 0,
    lastStoodStillTick: 0,

    centerHudCount: 0,

    createdInfoParticles: new Set([9999]), //adding dummy numbers so vscode stops being angry at me since im writing js but it expects ts
    createdAdParticles: new Set([9999]),
    createdVeloParticles: new Set([9999]),

    printHud: function () {
        const { r, g, b } = hud.currentColor;
        const color = [r, g, b];
        const { heightMultiplier } = hud;
        const mapInfo = config.mapInfo[server.currentMapName];
        const { currentMode, timerStopped, timerTicks, segmentedTimerTicks, segmentedTimerTicksTotal, checkpoints, currentStage, steamhappies } = player;

        const showPBs = (currentMode === "TimeTrial" ? (mapInfo.pb !== nerdStuff.maxInt || mapInfo.pbSeg !== nerdStuff.maxInt) : mapInfo.pbFrenzy !== nerdStuff.maxInt) && !timerStopped;
        const stageText = currentMode !== "TimeTrial" ? currentMode : `Stage: ${currentStage}`;

        Instance.DebugScreenText(`Map: ${server.currentMapName} | ${stageText} | Current Tick: ${server.currentTick} | env_hudhints: ${hud.centerHudCount}`, 0, 10, 0, 0, color);
        //Instance.DebugScreenText(`Debug Password: ${server.randomHashPW}`, 0, 30, 0, 0, color);

        Instance.DebugScreenText(`------ Movement Hub ------`, 7, showPBs ? 100 * heightMultiplier : 120 * heightMultiplier, 0, 0, color);
        if (showPBs) Instance.DebugScreenText(`${utils.padString("PB: " + utils.formatTime(currentMode === "TimeTrial" ? mapInfo.pb : mapInfo.pbFrenzy))}`, 7, 110 * heightMultiplier, 0, 0, color);
        if (showPBs && currentMode !== "HappyFrenzy") Instance.DebugScreenText(`${utils.padString(`PBSeg: ${utils.formatTime(mapInfo.pbSeg ?? "N/A")}`)}`, 7, 120 * heightMultiplier, 0, 0, color);

        const timeText = timerStopped
            ? [`CPs: ${checkpoints.cpNum}`, `TPs: ${checkpoints.tpNum}`]
            : [`Time: ${utils.formatTime(timerTicks)}`, `${currentMode !== "HappyFrenzy" ? `Segmented: ${utils.formatTime(segmentedTimerTicks + segmentedTimerTicksTotal)}` : `SteamHappies: ${steamhappies}/${mapInfo.steamHappies}`}`];
        Instance.DebugScreenText(utils.padString(timeText[0]), 7, 130 * heightMultiplier + 2, 0, 0, color);
        Instance.DebugScreenText(utils.padString(timeText[1]), 7, 140 * heightMultiplier + 4, 0, 0, color);

        Instance.DebugScreenText(`------ Jump History ------`, 7, 150 * heightMultiplier + 6, 0, 0, color);
        Instance.DebugScreenText(`--------------------------`, 7, 160 * heightMultiplier + 6, 0, 0, color);
        Instance.DebugScreenText(`--Dist----Height----Pre---`, 7, 170 * heightMultiplier + 8, 0, 0, color);

        [hud.ljSlot1, hud.ljSlot2, hud.ljSlot3, hud.ljSlot4].forEach((slot, index) => {
            Instance.DebugScreenText(slot, 7, (180 + index * 10) * heightMultiplier + 10, 0, 0, color);
        });
    },

    printCenterHud: function () {
        if (server.currentTick - player.lastStoodStill <= 16) {
            if (player.currentMode === "HappyFrenzy") {
                hud.createHudHint(`${!player.timerStopped ? `Time: ${utils.formatTime(player.timerTicks)}\rSteamhappies: ${player.steamhappies}/${config.mapInfo[server.currentMapName].steamHappies}` : ""}`);
                hud.centerHudCount++;
            }
            else if (player.currentMode === "TimeTrial") {
                hud.createHudHint(`Time: ${utils.formatTime(player.timerTicks)}`);
                hud.centerHudCount++;
            }
        }

        hud.showParticleVelocity();
    },

    showInfo: function (s) {
        hud.infoSlot = s;
        hud.infoSlotResetTick = server.currentTick + 128;
    },

    populateLJSlots: function (distance, pre, height) {
        Instance.Msg(` ${distance}   ${height}   ${pre} `);
        hud.ljSlot4 = hud.ljSlot3;
        hud.ljSlot3 = hud.ljSlot2;
        hud.ljSlot2 = hud.ljSlot1;
        hud.ljSlot1 = ` ${distance}   ${height}   ${pre} `; //-000.00---000.00---000.00-//
    },

    getScreenMultiplier: function (targetWidth, targetHeight) {
        hud.widthMultiplier = targetWidth / 1920;
        hud.heightMultiplier = targetHeight / 1080;
    },

    getCenteredXCoordinate: function (str) {
        const stringWidth = str.length * 7;
        return 960 - (stringWidth >> 1);
    },

    nextRainbowColor: function () {
        let trailColors = [{ r: 255, g: 255, b: 255 }];

        switch (hud.trailColorIndex) {
            case 0:
                trailColors = [
                    { r: 255, g: 255, b: 255 },
                    { r: 220, g: 220, b: 220 },
                    { r: 255, g: 255, b: 255 },
                ];
                break;
            case 1:
                trailColors = [
                    { r: 255, g: 0, b: 0 },
                    { r: 255, g: 85, b: 0 },
                    { r: 255, g: 165, b: 0 },
                    { r: 255, g: 255, b: 0 },
                    { r: 127, g: 255, b: 0 },
                    { r: 85, g: 170, b: 170 },
                    { r: 85, g: 85, b: 255 },
                    { r: 127, g: 0, b: 170 },
                    { r: 180, g: 0, b: 180 },
                ];
                break;
            case 2:
                trailColors = [
                    { r: 91, g: 206, b: 250 },
                    { r: 150, g: 215, b: 250 },
                    { r: 255, g: 182, b: 193 },
                    { r: 255, g: 217, b: 235 },
                    { r: 255, g: 255, b: 255 },
                    { r: 255, g: 217, b: 235 },
                    { r: 200, g: 206, b: 240 },
                ];
                break;
            case 3:
                trailColors = [
                    { r: 213, g: 45, b: 0 },
                    { r: 239, g: 104, b: 50 },
                    { r: 255, g: 153, b: 144 },
                    { r: 255, g: 204, b: 204 },
                    { r: 255, g: 255, b: 255 },
                    { r: 222, g: 154, b: 200 },
                    { r: 200, g: 100, b: 175 },
                    { r: 185, g: 75, b: 140 },
                ];
                break;
            case 4:
                trailColors = [
                    { r: 0, g: 75, b: 224 },
                    { r: 50, g: 110, b: 240 },
                    { r: 0, g: 137, b: 255 },
                    { r: 85, g: 200, b: 255 },
                    { r: 170, g: 238, b: 255 },
                    { r: 255, g: 255, b: 255 },
                    { r: 238, g: 153, b: 221 },
                    { r: 221, g: 102, b: 204 },
                    { r: 184, g: 70, b: 153 },
                ];
                break;
            case 5:
                trailColors = [
                    { r: 255, g: 244, b: 48 },
                    { r: 255, g: 249, b: 120 },
                    { r: 255, g: 255, b: 255 },
                    { r: 206, g: 167, b: 237 },
                    { r: 200, g: 130, b: 220 },
                    { r: 156, g: 89, b: 209 },
                ];
                break;
            case 6:
                trailColors = [
                    { r: 214, g: 2, b: 112 },
                    { r: 184, g: 70, b: 140 },
                    { r: 155, g: 110, b: 175 },
                    { r: 92, g: 67, b: 192 },
                    { r: 50, g: 75, b: 224 },
                ];
                break;
        }

        const targetColor = trailColors[this.targetColorIndex];

        if (targetColor) {
            const rDiff = targetColor.r - hud.currentColor.r;
            const gDiff = targetColor.g - hud.currentColor.g;
            const bDiff = targetColor.b - hud.currentColor.b;

            hud.currentColor.r += rDiff * 0.05;
            hud.currentColor.g += gDiff * 0.05;
            hud.currentColor.b += bDiff * 0.05;

            if (Math.abs(rDiff) < 1 && Math.abs(gDiff) < 1 && Math.abs(bDiff) < 1) {
                this.targetColorIndex = (this.targetColorIndex + 1) % trailColors.length;
            }
        } else {
            Instance.Msg("Target color is undefined. Resetting to default.");
            hud.currentColor = { r: 255, g: 255, b: 255 };
            this.targetColorIndex = 0;
        }
    },

    createHudHint: function (message) {
        Instance.EntFireAtName("sv", "Command", `ent_create env_hudhint {"targetname" "hudDisplay" "message" "${message}"}`, 0);
        hud.showHudHint();
    },
    showHudHint: function () { Instance.EntFireAtName("sv", "Command", `ent_fire hudDisplay showhudhint`, 0) },

    showInstructorHint: function (message, duration = 1) {
        const randomDigit = Math.floor(Math.random() * 1001);
        Instance.EntFireAtName("sv", "Command", `ent_create env_instructor_hint {"targetname" "instructorHint_${randomDigit}" "hint_color" "0 0 255" "hint_forcecaption" "1" "hint_icon_offscreen" "icon_tip" "hint_icon_offset" "0" "hint_icon_onscreen" "icon_tip" "hint_local_player_only" "0" "hint_nooffscreen" "0" "hint_pulseoption" "2" "hint_range" "90" "hint_static" "0" "hint_timeout" "${duration}" "hint_caption" "${message}"}`, 0);
        Instance.EntFireAtName("sv", "Command", `ent_fire instructorHint_${randomDigit} showhint`, 0.03125);
        Instance.EntFireAtName("sv", "Command", `ent_fire instructorHint_${randomDigit} kill`, duration + 1.03125); // remove the ent after its not needed anymore
    },

    showParticleChatAd: function (msgIndex, duration = 45) {
        server.sendCommand(`ent_fire chatMsg_* destroyimmediately`);

        if (!hud.createdAdParticles.has(msgIndex)) {
            hud.createdAdParticles.add(msgIndex)
            server.sendCommand(`ent_create info_particle_system {"targetname" "chatMsg_${msgIndex}" "origin" "0 0 0" "angles" "0 0 0" "effect_name" "particles/hud/ad_${msgIndex}.vpcf" "start_active" "True"}`);
        }
        else
            server.sendCommand(`ent_fire chatMsg_${msgIndex} start`);
    },

    showParticleInfo: function (msgIndex, duration = 2) {
        server.sendCommand(`ent_fire infoMsg_* destroyimmediately`);

        if (!hud.createdInfoParticles.has(msgIndex)) {
            hud.createdInfoParticles.add(msgIndex)
            server.sendCommand(`ent_create info_particle_system {"targetname" "infoMsg_${msgIndex}" "origin" "0 0 0" "angles" "0 0 0" "effect_name" "particles/hud/info_${msgIndex}.vpcf" "start_active" "True"}`);
        }
        else
            server.sendCommand(`ent_fire infoMsg_${msgIndex} start`);
    },

    showParticleVelocity: function () {
        const velo = player.playerVel.toString();
        const pre = player.playerPreVel.toString();
        //let pre = parseInt(player.playerPreVel);
        //pre = pre > 350 ? 350 : pre;

        server.sendCommand(`ent_fire veloMsg* destroyimmediately`);

        server.sendCommand(`ent_fire veloMsg1_${velo[0]} start`);
        server.sendCommand(`ent_fire veloMsg2_${velo[1]} start`);
        server.sendCommand(`ent_fire veloMsg3_${velo[2]} start`);

        server.sendCommand(`ent_fire veloMsg1pre_${pre[0]} start`);
        server.sendCommand(`ent_fire veloMsg2pre_${pre[1]} start`);
        server.sendCommand(`ent_fire veloMsg3pre_${pre[2]} start`);
    }
};

let player = {
    currentMode: "FreeRoam",
    timerStopped: true,
    timerTicks: 0,
    steamhappies: 0,
    pbTicks: 0,
    segmentedTimerTicks: 0,
    segmentedTimerTicksTotal: 0,
    currentStage: 0,
    checkpoints: {
        pos: nerdStuff.nullV,
        ang: nerdStuff.nullV,
        lastPos: nerdStuff.nullV,
        lastAng: nerdStuff.nullV,
        cpNum: 0,
        tpNum: 0,
        locked: true,
        lastCheckpointStamp: 0
    },
    playerVel: "000.00",
    playerPreVel: "000.00",
    playerPos: nerdStuff.nullV,
    oldPlayerPos: nerdStuff.nullV,
    playerJumped: false,
    playerJumpedPos: nerdStuff.nullV,
    playerLandedPos: nerdStuff.nullV,
    lastJumpHeights: [0.00, 0.00, 0.00],
    lastStoodStill: 0,
    ticksInAir: 0,
    allowTrail: true,
    isTouchingBlue: false,
    respawnBlueTick: 0,
    playerForwardRaw: nerdStuff.nullV,
    playerForward: nerdStuff.nullV,
    playerAngle: nerdStuff.nullV,

    bbox: false,

    getPlayerForwardPosition: function () {
        const referencePoint = 16000;

        const playerPosX = referencePoint - player.playerForwardRaw[0];
        const playerPosY = referencePoint - player.playerForwardRaw[1];
        const playerPosZ = referencePoint - player.playerForwardRaw[2];

        return [playerPosX, playerPosY, playerPosZ];
    },

    getPlayerAngle: function (playerPos) {
        const playerForward = this.getPlayerForwardPosition(playerPos);

        const directionVector = [
            playerForward[0] - playerPos[0],
            playerForward[1] - playerPos[1],
            playerForward[2] - (playerPos[2] + 64)
        ];

        let yaw = Math.atan2(directionVector[1], directionVector[0]);
        let yawDegrees = yaw * nerdStuff.deg;

        if (yawDegrees > 180) {
            yawDegrees -= 360;
        } else if (yawDegrees < -180) {
            yawDegrees += 360;
        }

        let horizontalDistance = Math.sqrt(directionVector[0] ** 2 + directionVector[1] ** 2);
        let pitch = Math.atan2(-directionVector[2], horizontalDistance);
        let pitchDegrees = pitch * nerdStuff.deg;

        return [pitchDegrees, yawDegrees, 0];
    },

    resetVelo: function () {
        server.disallowVeloTick = server.currentTick + 1;
        server.allowVeloTick = server.currentTick + 17;
        server.sendCommand("duck -999 0 0");
    },

    respawn: function (noTp = false, fromRestart = false) {
        if (!player.timerStopped || !server.playerSpawnedIn || fromRestart) {
            server.entFire("ent_hf", "Disable");

            server.entFire("ent_s*", "Disable");
            server.entFire("end_s*", "Disable");
            server.entFire("finish_s" + config.mapInfo[server.currentMapName].maxStages, "Disable");

            if (player.currentMode === "HappyFrenzy") {
                server.entFire("collected_s*", "Disable");
            }

            server.entFire("player_forward", "SetParent", "!player", 0.3125);
            server.entFire("player_forward", "SetParentAttachmentMaintainOffset", "axis_of_intent", 0.3125 + nerdStuff.oneTick);

            player.currentMode = "FreeRoam";

            if (!server.playerSpawnedIn) {
                server.sendChatColored(`${chatcolors.brightgreen}Loaded ${chatcolors.orange}${server.currentMapName}`, 1);
                server.sendChatColored(`${chatcolors.brightgreen}Available modes:${config.mapInfo[server.currentMapName].hasFrenzy ? `${chatcolors.silver} Happy Frenzy${chatcolors.brightgreen},` : ""}${config.mapInfo[server.currentMapName].hasTimeTrial ? `${chatcolors.silver} Time Trial${chatcolors.brightgreen},` : ""}${chatcolors.silver} Free Roam`, 1);
                server.sendChatColored(`${chatcolors.brightgreen}Please choose one of those modes now.`, 2);
                server.entFire("loadscreen", "destroyimmediately");
            }
            server.playerSpawnedIn ||= true;
        }

        player.timerStopped = true;
        player.timerTicks = 0;
        player.resetPlayerVars();
        player.resetVelo();

        player.currentStage = 0;

        if (!noTp) {
            player.checkpoints.locked = true;
            server.entFire("tp_hub", "Teleport", "", nerdStuff.oneTick);
            server.sendCommand("fadein");
        }

        if (!fromRestart) {
            server.sendCommand(`stopsound`);
        }
    },

    spawnTrail: function () {
        server.sendCommand(`box  ${player.oldPlayerPos[0]} ${player.oldPlayerPos[1]} ${player.oldPlayerPos[2]} ${player.playerPos[0]} ${player.playerPos[1]} ${player.playerPos[2]} ${server.trailDuration} ${hud.currentColor.r} ${hud.currentColor.g} ${hud.currentColor.b}`);
    },

    resetPlayerVars: function (skipNums = false, skipCP = false) {
        if (!skipNums) {
            player.checkpoints.cpNum = 0;
            player.checkpoints.tpNum = 0;
        }

        if (!skipCP) {
            player.checkpoints.pos = nerdStuff.nullV;
            player.checkpoints.ang = nerdStuff.nullV;
        }

        player.playerJumped = false;
        player.ticksInAir = 0;
    }
};

const utils = {
    padString: function (str) {
        const width = 26;
        const words = str.split(" ");

        if (words.length !== 2) {
            return " ";
        }

        const [leftWord, rightWord] = words;
        const totalWordLength = leftWord.length + rightWord.length;
        const spaces = width - totalWordLength;

        if (spaces < 0) {
            return leftWord + " " + rightWord;
        }

        const padding = " ".repeat(Math.floor(spaces / 2));
        return leftWord + padding + " ".repeat(spaces - padding.length) + rightWord;
    },

    calculateDistance: function (playerJumpedPos, playerLandedPos) {
        if (playerJumpedPos === nerdStuff.nullV || playerLandedPos === nerdStuff.nullV) {
            return 0;
        }

        const distance = Math.sqrt(
            Math.pow(playerLandedPos[0] - playerJumpedPos[0], 2) +
            Math.pow(playerLandedPos[1] - playerJumpedPos[1], 2)
        );

        return distance;
    },

    calculateHeightDifference: function (lastPos, pos) {
        if (lastPos === nerdStuff.nullV || pos === nerdStuff.nullV) {
            return 0;
        }

        const heightDifference = Math.abs(pos[2] - lastPos[2]);
        return heightDifference;
    },

    formatTime: function (ticks) {
        const totalSeconds = Math.floor(ticks / 64);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const millis = (ticks % 64) * 15.625;
        const millisStr = Math.floor(millis).toString().padStart(3, '0');

        return `${minutes}:${seconds.toString().padStart(2, '0')}.${millisStr}`;
    },

    formatTimeDifference: function (currentTicks, previousTicks) {
        const differenceTicks = previousTicks - currentTicks;
        const sign = differenceTicks > 0 ? '-' : '+';
        const totalSeconds = Math.floor(Math.abs(differenceTicks) / 64);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const millis = (Math.abs(differenceTicks) % 64) * 15.625;
        const millisStr = Math.floor(millis).toString().padStart(3, '0');
        return `${sign}${minutes}:${seconds.toString().padStart(2, '0')}.${millisStr}`;
    },

    calculateVelocity: function (oldPos, newPos) {
        if (oldPos === nerdStuff.nullV || newPos === nerdStuff.nullV) {
            return "000.00";
        }
        const velocityX = (newPos[0] - oldPos[0]) * 64;
        const velocityY = (newPos[1] - oldPos[1]) * 64;
        const velocity2D = Math.hypot(velocityX, velocityY);
        return velocity2D.toFixed(2).padStart(6, '0');
    },

    generateRandomHash: function (length = 8) {
        let hash = '';
        for (let i = 0; i < length; i++) {
            const randomDigit = Math.floor(Math.random() * 10);
            hash += randomDigit;
        }
        return hash;
    }
}

////////////////////////////////
//       Public Methods       //
////////////////////////////////

Instance.PublicMethod("on_forward_raw_x", /*number*/(n) => { player.playerForwardRaw[0] = n });
Instance.PublicMethod("on_forward_raw_y", /*number*/(n) => { player.playerForwardRaw[1] = n });
Instance.PublicMethod("on_forward_raw_z", /*number*/(n) => { player.playerForwardRaw[2] = n });

Instance.PublicMethod("on_tick", /*none*/() => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onTick();
});

Instance.PublicMethod("on_every_fourth_tick", /*none*/() => {
    // Update HUD
    if (Instance.IsWarmupPeriod() === true) return;
    hud.printCenterHud();
});

Instance.PublicMethod("on_spawn", /*none*/() => {
    if (Instance.IsWarmupPeriod() === true) return;
    player.respawn();
});

Instance.PublicMethod("on_round_start", /*none*/() => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onRoundStart();
});

Instance.PublicMethod("on_jump", /*none*/() => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onJump();
});

Instance.PublicMethod("on_sound", /*none*/() => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onSound();
});

Instance.PublicMethod("on_weapon", /*none*/() => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.weaponFiredTick = server.currentTick;
});

Instance.PublicMethod("kz_cp", /*none*/() => {
    if (Instance.IsWarmupPeriod() === true || (server.currentTick - player.checkpoints.lastCheckpointStamp < 16)) return;
    server.kzCheckpoint();
});

Instance.PublicMethod("kz_tp", /*none*/() => {
    if (Instance.IsWarmupPeriod() === true || (server.currentTick - player.checkpoints.lastCheckpointStamp < 16)) return;
    server.kzTeleport();
});

Instance.PublicMethod("on_trial_start", /*string*/(s) => {
    if (Instance.IsWarmupPeriod() === true) return;

    var pastedBool = parseInt(s) == 1 ? true : false;
    server.onTrialStart(false, pastedBool);
});

Instance.PublicMethod("on_trial_restart", /*none*/() => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onTrialStart(true, player.currentMode === "TimeTrial");
});

Instance.PublicMethod("on_trial_skip", /*none*/() => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onTrialSkip();
});

Instance.PublicMethod("on_trial_stage_finish", /*number*/(s) => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onTrialStageFinish(s);
});

Instance.PublicMethod("on_trial_finish", /*number*/(s) => {
    if (Instance.IsWarmupPeriod() === true) return;
    if (s.toString() != server.randomHashPW || player.timerStopped) {
        server.cheetoCrash();
        return;
    }

    server.onTrialFinish();
});

Instance.PublicMethod("on_trial_alt_collect", /*number*/(s) => {
    if (Instance.IsWarmupPeriod() === true) return;
    if (s.toString() != server.randomHashPW || player.timerStopped) {
        server.cheetoCrash();
        return;
    }

    server.onTrialCollect();
});

Instance.PublicMethod("on_trial_respawn", /*none*/() => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onTrialRespawn();
});

Instance.PublicMethod("on_trial_respawn_blue", /*number*/(n) => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onTrialRespawnBlue(n);
});

Instance.PublicMethod("on_trial_guide", /*none*/() => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onTrialGuide();
});

Instance.PublicMethod("on_free_roam", /*none*/() => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onFreeRoam();
});

Instance.PublicMethod("kz_back_to_hub", /*none*/() => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onBackToHub();
});

Instance.PublicMethod("on_trial_loaded", /*string*/(s) => {
    if (Instance.IsWarmupPeriod() === true) return;

    if (s === null) {
        s = " ";
    }

    server.currentMapName = s.toString();
});

Instance.PublicMethod("test_ad", /*string*/(s) => {
    if (Instance.IsWarmupPeriod() === true) return;

    hud.showParticleChatAd(s);
});

Instance.PublicMethod("set_res_fix", /*string*/(s) => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.setResFix(s);
});

Instance.PublicMethod("set_trail", /*string*/(s) => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.setTrail(s);
});

Instance.PublicMethod("bbox", /*none*/() => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.bbox();
});

Instance.PublicMethod("on_debug", /*string*/(s) => {
    if (Instance.IsWarmupPeriod() === true) return;

    if (s === null) {
        s = 0;
    }

    if (s !== server.randomHashPW) {
        server.cheetoCrash();
        return;
    }

    server.isDebug = !server.isDebug;

    server.sendChatColored(`${chatcolors.silver}Debug mode is now ${chatcolors.white}${server.isDebug ? "enabled" : "disabled"}${chatcolors.silver}!`);
});

Instance.PublicMethod("trail_duration", /*string*/(s) => {
    if (Instance.IsWarmupPeriod() === true) return;
    // set server.trailDuration to s and check if s is a number, if not set to 3
    server.trailDuration = parseInt(s) || 3;
    server.sendChatColored(`${chatcolors.silver}Trail duration is now ${chatcolors.white}${server.trailDuration}${chatcolors.silver} seconds!`);
});

Instance.PublicMethod("load_settings_json", /*string*/(s) => {
    if (Instance.IsWarmupPeriod() === true) return;

    server.loadSavedSettings(s);
});

const guideTrails = {
}
