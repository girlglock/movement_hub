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

import {
    Instance,
    Entity,
    BaseModelEntity,
    PointTemplate
} from "cs_script/point_script";

const nerdStuff = {
    pi: 3.14159265,
    doublePi: 6.2831853,
    halfPi: 1.5707963,
    rad: 0.0174533,
    deg: 57.2957795,
    maxInt: 2147483647,
    oneTick: 0.015625,
    nullV: { x: 16000, y: 16000, z: 16000 }
};

const chatcolors = {
    white: " ",
    red: " ",
    team: " ",
    green: " ",
    olive: " ",
    brightgreen: " ",
    lightred: " ",
    silver: " ",
    gold: "	",
    lightblue: " ",
    blue: " ",
    purple: " ",
    lighterred: " ",
    orange: " "
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

const config = {
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

class Utils {
    static qAngleToVector(inputAngle) {
        return { x: inputAngle.pitch, y: inputAngle.yaw, z: inputAngle.roll };
    }

    static padString(str) {
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

        let padding = '';
        for (let i = 0; i < Math.floor(spaces / 2); i++) {
            padding += ' ';
        }

        let remainingSpaces = '';
        for (let i = 0; i < spaces - padding.length; i++) {
            remainingSpaces += ' ';
        }

        return leftWord + padding + remainingSpaces + rightWord;
    }

    static calculateDistance(playerJumpedPos, playerLandedPos) {
        if (playerJumpedPos === nerdStuff.nullV || playerLandedPos === nerdStuff.nullV) {
            return 0;
        }

        const distance = Math.sqrt(
            Math.pow(playerLandedPos.x - playerJumpedPos.x, 2) +
            Math.pow(playerLandedPos.y - playerJumpedPos.y, 2)
        );

        return distance;
    }

    static calculateHeightDifference(lastPos, pos) {
        if (lastPos === nerdStuff.nullV || pos === nerdStuff.nullV) {
            return 0;
        }

        const heightDifference = Math.abs(pos.z - lastPos.z);
        return heightDifference;
    }

    static formatTime(ticks) {
        const totalSeconds = Math.floor(ticks / 64);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const millis = (ticks % 64) * 15.625;
        const millisStr = ('000' + Math.floor(millis).toString()).slice(-3);

        return `${minutes}:${('00' + seconds.toString()).slice(-2)}.${millisStr}`;
    }

    static formatTimeDifference(currentTicks, previousTicks) {
        const differenceTicks = previousTicks - currentTicks;
        const sign = differenceTicks > 0 ? '-' : '+';
        const totalSeconds = Math.floor(Math.abs(differenceTicks) / 64);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const millis = (Math.abs(differenceTicks) % 64) * 15.625;
        const millisStr = ('000' + Math.floor(millis).toString()).slice(-3);
        return `${sign}${minutes}:${('00' + seconds.toString()).slice(-2)}.${millisStr}`;
    }

    static get2DVelocity() {
        const playerPawn = Instance.GetPlayerController(0).GetPlayerPawn();
        const vel = playerPawn.GetAbsVelocity();
        const vel2D = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
        return vel2D;
    }

    static generateRandomHash(length = 8) {
        let hash = '';
        for (let i = 0; i < length; i++) {
            const randomDigit = Math.floor(Math.random() * 10);
            hash += randomDigit;
        }
        return hash;
    }
}

class HUD {
    constructor() {
        this.currentColor = { r: 255, g: 0, b: 0 };
        this.targetColorIndex = 0;
        this.trailColorIndex = 1;
        this.widthMultiplier = 1;
        this.heightMultiplier = 1;
        this.ljSlot1 = " 000.00   000.00   000.00 ";
        this.ljSlot2 = " 000.00   000.00   000.00 ";
        this.ljSlot3 = " 000.00   000.00   000.00 ";
        this.ljSlot4 = " 000.00   000.00   000.00 ";
        this.infoSlot = "";
        this.infoSlotResetTick = 0;
        this.lastStoodStillTick = 0;
        this.centerHudCount = 0;
        this.createdInfoParticles = [9999];
        this.createdAdParticles = [9999];
        this.createdVeloParticles = [9999];
    }

    printHud() {
        const { r, g, b } = this.currentColor;
        const color = { r: r, g: g, b: b };
        const { heightMultiplier } = this;
        const mapInfo = config.mapInfo[server.currentMapName];
        const { currentMode, timerStopped, timerTicks, segmentedTimerTicks, segmentedTimerTicksTotal, checkpoints, currentStage, steamhappies } = player;

        const showPBs = (currentMode === "TimeTrial" ? (mapInfo.pb !== nerdStuff.maxInt || mapInfo.pbSeg !== nerdStuff.maxInt) : mapInfo.pbFrenzy !== nerdStuff.maxInt) && !timerStopped;
        const stageText = currentMode !== "TimeTrial" ? currentMode : `Stage: ${currentStage}`;

        Instance.DebugScreenText(`Map: ${server.currentMapName} | ${stageText} | Current Tick: ${server.currentTick} | env_hudhints: ${this.centerHudCount}`, 0, 10, 0, color);

        Instance.DebugScreenText(`------ Movement Hub ------`, 7, showPBs ? 100 * heightMultiplier : 120 * heightMultiplier, 0, color);
        if (showPBs) Instance.DebugScreenText(`${Utils.padString("PB: " + Utils.formatTime(currentMode === "TimeTrial" ? mapInfo.pb : mapInfo.pbFrenzy))}`, 7, 110 * heightMultiplier, 0, color);
        if (showPBs && currentMode !== "HappyFrenzy") Instance.DebugScreenText(`${Utils.padString(`PBSeg: ${Utils.formatTime(mapInfo.pbSeg ?? "N/A")}`)}`, 7, 120 * heightMultiplier, 0, color);

        const timeText = timerStopped
            ? [`CPs: ${checkpoints.cpNum}`, `TPs: ${checkpoints.tpNum}`]
            : [`Time: ${Utils.formatTime(timerTicks)}`, `${currentMode !== "HappyFrenzy" ? `Segmented: ${Utils.formatTime(segmentedTimerTicks + segmentedTimerTicksTotal)}` : `SteamHappies: ${steamhappies}/${mapInfo.steamHappies}`}`];
        Instance.DebugScreenText(Utils.padString(timeText[0]), 7, 130 * heightMultiplier + 2, 0, color);
        Instance.DebugScreenText(Utils.padString(timeText[1]), 7, 140 * heightMultiplier + 4, 0, color);

        Instance.DebugScreenText(`------ Jump History ------`, 7, 150 * heightMultiplier + 6, 0, color);
        Instance.DebugScreenText(`--------------------------`, 7, 160 * heightMultiplier + 6, 0, color);
        Instance.DebugScreenText(`--Dist----Height----Pre---`, 7, 170 * heightMultiplier + 8, 0, color);

        [this.ljSlot1, this.ljSlot2, this.ljSlot3, this.ljSlot4].forEach((slot, index) => {
            Instance.DebugScreenText(slot, 7, (180 + index * 10) * heightMultiplier + 10, 0, color);
        });
    }

    printCenterHud() {
        if (server.currentTick - player.lastStoodStill <= 16) {
            if (player.currentMode === "HappyFrenzy") {
                this.createHudHint(`${!player.timerStopped ? `Time: ${Utils.formatTime(player.timerTicks)}\rSteamhappies: ${player.steamhappies}/${config.mapInfo[server.currentMapName].steamHappies}` : ""}`);
                this.centerHudCount++;
            }
            else if (player.currentMode === "TimeTrial") {
                this.createHudHint(`Time: ${Utils.formatTime(player.timerTicks)}`);
                this.centerHudCount++;
            }
        }

        this.showParticleVelocity();
    }

    showInfo(s) {
        this.infoSlot = s;
        this.infoSlotResetTick = server.currentTick + 128;
    }

    populateLJSlots(distance, pre, height) {
        Instance.Msg(` ${distance}   ${height}   ${pre} `);
        this.ljSlot4 = this.ljSlot3;
        this.ljSlot3 = this.ljSlot2;
        this.ljSlot2 = this.ljSlot1;
        this.ljSlot1 = ` ${distance}   ${height}   ${pre} `;
    }

    getScreenMultiplier(targetWidth, targetHeight) {
        this.widthMultiplier = targetWidth / 1920;
        this.heightMultiplier = targetHeight / 1080;
    }

    getCenteredXCoordinate(str) {
        const stringWidth = str.length * 7;
        return 960 - (stringWidth >> 1);
    }

    nextRainbowColor() {
        let trailColors = [{ r: 255, g: 255, b: 255 }];

        switch (this.trailColorIndex) {
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
            const rDiff = targetColor.r - this.currentColor.r;
            const gDiff = targetColor.g - this.currentColor.g;
            const bDiff = targetColor.b - this.currentColor.b;

            this.currentColor.r += rDiff * 0.05;
            this.currentColor.g += gDiff * 0.05;
            this.currentColor.b += bDiff * 0.05;

            if (Math.abs(rDiff) < 1 && Math.abs(gDiff) < 1 && Math.abs(bDiff) < 1) {
                this.targetColorIndex = (this.targetColorIndex + 1) % trailColors.length;
            }
        } else {
            Instance.Msg("Target color is undefined. Resetting to default.");
            this.currentColor = { r: 255, g: 255, b: 255 };
            this.targetColorIndex = 0;
        }
    }

    createHudHint(message) {
        Instance.EntFireAtName("sv", "Command", `ent_create env_hudhint {"targetname" "hudDisplay" "message" "${message}"}`, 0);
        this.showHudHint();
    }

    showHudHint() { 
        Instance.EntFireAtName("sv", "Command", `ent_fire hudDisplay showhudhint`, 0);
    }

    showInstructorHint(message, duration = 1) {
        const randomDigit = Math.floor(Math.random() * 1001);
        Instance.EntFireAtName("sv", "Command", `ent_create env_instructor_hint {"targetname" "instructorHint_${randomDigit}" "hint_color" "0 0 255" "hint_forcecaption" "1" "hint_icon_offscreen" "icon_tip" "hint_icon_offset" "0" "hint_icon_onscreen" "icon_tip" "hint_local_player_only" "0" "hint_nooffscreen" "0" "hint_pulseoption" "2" "hint_range" "90" "hint_static" "0" "hint_timeout" "${duration}" "hint_caption" "${message}"}`, 0);
        Instance.EntFireAtName("sv", "Command", `ent_fire instructorHint_${randomDigit} showhint`, 0.03125);
        Instance.EntFireAtName("sv", "Command", `ent_fire instructorHint_${randomDigit} kill`, duration + 1.03125);
    }

    showParticleChatAd(msgIndex) {
        server.sendCommand(`ent_fire chatMsg_* destroyimmediately`);

        if (this.createdAdParticles.indexOf(msgIndex) === -1) {
            this.createdAdParticles.push(msgIndex);
            server.sendCommand(`ent_create info_particle_system {"targetname" "chatMsg_${msgIndex}" "origin" "0 0 0" "angles" "0 0 0" "effect_name" "particles/hud/ad_${msgIndex}.vpcf" "start_active" "True"}`, 0.01);
        }
        else
            server.sendCommand(`ent_fire chatMsg_${msgIndex} start`, 0.01);
    }

    showParticleInfo(msgIndex) {
        server.sendCommand(`ent_fire infoMsg* destroyimmediately`);

        if (this.createdInfoParticles.indexOf(msgIndex) === -1) {
            this.createdInfoParticles.push(msgIndex);
            server.sendCommand(`ent_create info_particle_system {"targetname" "infoMsg_${msgIndex}" "origin" "0 0 0" "angles" "0 0 0" "effect_name" "particles/hud/info_${msgIndex}.vpcf" "start_active" "True"}`, 0.01);
        }
        else
            server.sendCommand(`ent_fire infoMsg_${msgIndex} start`, 0.01);
    }

    showParticleVelocity() {
        const velo = player.playerVel.toString();
        const pre = player.playerPreVel.toString();

        server.sendCommand(`ent_fire veloMsg* destroyimmediately`);

        server.sendCommand(`ent_fire veloMsg1_${velo[0]} start`);
        server.sendCommand(`ent_fire veloMsg2_${velo[1]} start`);
        server.sendCommand(`ent_fire veloMsg3_${velo[2]} start`);

        server.sendCommand(`ent_fire veloMsg1pre_${pre[0]} start`);
        server.sendCommand(`ent_fire veloMsg2pre_${pre[1]} start`);
        server.sendCommand(`ent_fire veloMsg3pre_${pre[2]} start`);
    }
}

class Player {
    constructor() {
        this.currentMode = "FreeRoam";
        this.timerStopped = true;
        this.timerTicks = 0;
        this.steamhappies = 0;
        this.pbTicks = 0;
        this.segmentedTimerTicks = 0;
        this.segmentedTimerTicksTotal = 0;
        this.currentStage = 0;
        this.checkpoints = {
            pos: nerdStuff.nullV,
            ang: { pitch: 0, yaw: 0, roll: 0 },
            lastPos: nerdStuff.nullV,
            lastAng: { pitch: 0, yaw: 0, roll: 0 },
            cpNum: 0,
            tpNum: 0,
            locked: true,
            lastCheckpointStamp: 0
        };
        this.playerVel = "000.00";
        this.playerPreVel = "000.00";
        this.playerPos = nerdStuff.nullV;
        this.oldPlayerPos = nerdStuff.nullV;
        this.playerJumped = false;
        this.playerJumpedPos = nerdStuff.nullV;
        this.playerLandedPos = nerdStuff.nullV;
        this.lastJumpHeights = [0.00, 0.00, 0.00];
        this.lastStoodStill = 0;
        this.ticksInAir = 0;
        this.allowTrail = true;
        this.isTouchingBlue = false;
        this.respawnBlueTick = 0;
        this.playerForwardRaw = nerdStuff.nullV;
        this.playerForward = nerdStuff.nullV;
        this.playerAngle = { pitch: 0, yaw: 0, roll: 0 };
        this.bbox = false;
        this.radioDisabled = false;
    }

    resetVelo() {
        Instance.GetPlayerController(0).GetPlayerPawn()?.Teleport(
            null,
            null,
            { x: 0, y: 0, z: 0 }
        );
    }

    respawn(noTp = false, fromRestart = false) {
        if (!this.timerStopped || !server.playerSpawnedIn || fromRestart) {
            server.entFire("ent_hf", "Disable");

            server.entFire("ent_s*", "Disable");
            server.entFire("end_s*", "Disable");
            server.entFire("finish_s" + config.mapInfo[server.currentMapName].maxStages, "Disable");

            if (this.currentMode === "HappyFrenzy") {
                server.entFire("collected_s*", "Disable");
            }

            server.entFire("player_forward", "SetParent", "!player", 0.3125);
            server.entFire("player_forward", "SetParentAttachmentMaintainOffset", "axis_of_intent", 0.3125 + nerdStuff.oneTick);

            this.currentMode = "FreeRoam";

            if (!server.playerSpawnedIn) {
                server.sendChatColored(`${chatcolors.brightgreen}Loaded ${chatcolors.orange}${server.currentMapName}`, 1);
                server.sendChatColored(`${chatcolors.brightgreen}Available modes:${config.mapInfo[server.currentMapName].hasFrenzy ? `${chatcolors.silver} Happy Frenzy${chatcolors.brightgreen},` : ""}${config.mapInfo[server.currentMapName].hasTimeTrial ? `${chatcolors.silver} Time Trial${chatcolors.brightgreen},` : ""}${chatcolors.silver} Free Roam`, 1);
                server.sendChatColored(`${chatcolors.brightgreen}Please choose one of those modes now.`, 2);
                server.entFire("loadscreen", "destroyimmediately");
            }
            server.playerSpawnedIn ||= true;
        }

        this.timerStopped = true;
        this.timerTicks = 0;
        this.resetPlayerVars();
        this.resetVelo();

        this.currentStage = 0;

        if (!noTp) {
            this.checkpoints.locked = true;
            server.entFire("tp_hub", "Teleport", "", nerdStuff.oneTick);
            server.sendCommand("fadein");
        }

        if (!fromRestart) {
            server.sendCommand(`stopsound`);
        }
    }

    spawnTrail() {
        server.sendCommand(`box  ${this.oldPlayerPos.x} ${this.oldPlayerPos.y} ${this.oldPlayerPos.z} ${this.playerPos.x} ${this.playerPos.y} ${this.playerPos.z} ${server.trailDuration} ${hud.currentColor.r} ${hud.currentColor.g} ${hud.currentColor.b}`);
    }

    resetPlayerVars(skipNums = false, skipCP = false) {
        if (!skipNums) {
            this.checkpoints.cpNum = 0;
            this.checkpoints.tpNum = 0;
        }

        if (!skipCP) {
            this.checkpoints.pos = nerdStuff.nullV;
            this.checkpoints.ang = { pitch: 0, yaw: 0, roll: 0 };
        }

        this.playerJumped = false;
        this.ticksInAir = 0;
    }

    giveSubclass(subclassid) {
        server.sendCommand("fadeout 0.1");
        const pos = Instance.FindEntityByName("tp_freeroam").GetAbsOrigin();
        server.sendCommand("ent_fire weapon_knife kill; mp_drop_knife_enable 1;");
        server.entFire("tp_freeroam", "Teleport");
        server.sendCommand(`subclass_create ${subclassid} {"classname" "weapon_knife" "origin" "${pos.x} ${pos.y} ${pos.z}"}`, nerdStuff.oneTick * 2);
        server.sendCommand("mp_drop_knife_enable 0", nerdStuff.oneTick * 10);
        server.entFire("tp_hub", "Teleport", "", nerdStuff.oneTick * 10);
        server.sendCommand("fadein 0.1", nerdStuff.oneTick * 10);
    }
}

class Server {
    constructor() {
        this.date = new Date();
        this.firstSetup = false;
        this.randomHashPW = "00001111";
        this.isDebug = false;
        this.currentTick = 1;
        this.currentRadioCmd = "radio";
        this.nextRadioTick = 64;
        this.allowVeloTick = 0;
        this.disallowVeloTick = 0;
        this.weaponFiredTick = 0;
        this.currentMapName = Instance.GetMapName();
        this.playerSpawnedIn = false;
        this.lastChatMessageTick = 0;
        this.nextAdTick = 5760;
        this.trailDuration = 3;
    }

    sendCommand(message, delay = 0) { 
        Instance.EntFireAtName("sv", "Command", `${message}`, delay);
    }

    sendChat(message) {
        const { currentTick, lastChatMessageTick } = this;
        const lastMessageTicks = currentTick - lastChatMessageTick;
        const delay = lastMessageTicks <= 20 ? (20 - lastMessageTicks) / 64 : 0;
        Instance.EntFireAtName("sv", "Command", `say_team ${message}`, delay);
        this.lastChatMessageTick = this.currentTick;
    }

    sendChatColored(message, ddlay = 0) {
        const { currentTick, lastChatMessageTick } = this;
        const lastMessageTicks = currentTick - lastChatMessageTick;
        const delay = lastMessageTicks <= 20 ? (20 - lastMessageTicks) / 64 : 0;
        Instance.EntFireAtName("sv", "Command", `say_team "${message}"`, delay + ddlay);
        this.lastChatMessageTick = this.currentTick;
    }

    playSound(message, delay = 0) { 
        Instance.EntFireAtName("sv", "Command", `play ${message}`, delay);
    }

    entFire(targetname, key, value = "", delay = 0) { 
        Instance.EntFireAtName(targetname, key, value, delay);
    }

    cheetoCrash() {
        hud.showParticleInfo(0);
        this.playSound(config.sounds.errorSound);
        this.sendCommand(`ent_create env_decal {"material" "byebye" "width" "1" "height" "1" "depth" "1" "projectonworld" "true"}`, 2);
    }

    onTick() {
        this.currentTick++;

        // Handle first Spawn
        if (!this.firstSetup && this.currentTick > 175) {
            this.randomHashPW = Utils.generateRandomHash().toString();
            this.sendCommand(`sv_radio_throttle_window 0; sv_disable_teamselect_menu 0; snd_toolvolume 0.025; noclip_fixup 0;game_alias comp;`);

            this.entFire("end_s*", "addoutput", `OnStartTouch>kz_script>RunScriptInput>on_trial_stage_finish>0>-1`);
            this.entFire("collected_s*", "addoutput", `OnStartTouch>kz_script>RunScriptInput>on_trial_alt_collect>0>-1`);
            this.entFire("finish_s" + config.mapInfo[this.currentMapName].maxStages, "addoutput", `OnStartTouch>kz_script>RunScriptInput>on_trial_finish>0>-1`);
            switch (this.date.getMonth()) {
                case 5:
                    this.sendCommand(`ent_create info_particle_system {"targetname" "festive_pride" "origin" "0 0 0" "angles" "0 0 0" "effect_name" "particles/hud/festive_pride.vpcf" "start_active" "True"}`, 1);
                    break;
                default:
                    break;
            }

            for (let i = 0; i <= 9; i++) {
                this.sendCommand(`ent_create info_particle_system {"targetname" "veloMsg1_${i}" "origin" "0 0 0" "angles" "0 0 0" "effect_name" "particles/hud/velo/velo1_${i}.vpcf" "start_active" "False"}`, nerdStuff.oneTick * i);
                this.sendCommand(`ent_create info_particle_system {"targetname" "veloMsg2_${i}" "origin" "0 0 0" "angles" "0 0 0" "effect_name" "particles/hud/velo/velo2_${i}.vpcf" "start_active" "False"}`, nerdStuff.oneTick * i);
                this.sendCommand(`ent_create info_particle_system {"targetname" "veloMsg3_${i}" "origin" "0 0 0" "angles" "0 0 0" "effect_name" "particles/hud/velo/velo3_${i}.vpcf" "start_active" "False"}`, nerdStuff.oneTick * i);

                this.sendCommand(`ent_create info_particle_system {"targetname" "veloMsg1pre_${i}" "origin" "0 0 0" "angles" "0 0 0" "effect_name" "particles/hud/velo/pre_velo1_${i}.vpcf" "start_active" "False"}`, nerdStuff.oneTick * i);
                this.sendCommand(`ent_create info_particle_system {"targetname" "veloMsg2pre_${i}" "origin" "0 0 0" "angles" "0 0 0" "effect_name" "particles/hud/velo/pre_velo2_${i}.vpcf" "start_active" "False"}`, nerdStuff.oneTick * i);
                this.sendCommand(`ent_create info_particle_system {"targetname" "veloMsg3pre_${i}" "origin" "0 0 0" "angles" "0 0 0" "effect_name" "particles/hud/velo/pre_velo3_${i}.vpcf" "start_active" "False"}`, nerdStuff.oneTick * i);
            }

            Instance.SetThink(() => {
                Instance.GetPlayerController(0).JoinTeam(2);
                this.sendCommand("ent_fire loadscreen destroyimmediately", nerdStuff.oneTick * 10);
            });
            Instance.SetNextThink(Instance.GetGameTime() + nerdStuff.oneTick * 10);
            this.firstSetup = true;
        }

        // Handle disallow noclip
        if (!player.timerStopped && !this.isDebug) {
            this.sendCommand(`noclip 0; sv_autobunnyhopping 0; sv_jump_spam_penalty_time ${nerdStuff.oneTick}; sv_staminalandcost 0.05; sv_airaccelerate 12; sv_air_max_wishspeed 30; sv_noclipspeed 0`);
        }

        // Handle Radio
        if (!player.radioDisabled) {
            if (this.currentTick === this.nextRadioTick) {
                this.nextRadioTick = this.currentTick + 32;
                if (player.timerStopped) {
                    this.currentRadioCmd = (this.currentRadioCmd === "radio") ? "radio1" : "radio";
                } else {
                    this.currentRadioCmd = (this.currentRadioCmd === "radio3") ? "radio2" : "radio3";
                }
                this.sendCommand(`${this.currentRadioCmd}`);
            }
        }

        // Handle Ads
        if (this.currentTick === this.nextAdTick) {
            this.nextAdTick = this.currentTick + (64 * config.adInterval);
            hud.showParticleChatAd(Math.floor(Math.random() * config.adCount) + 1);
        }
        else if (hud.centerHudCount === 115200) {
            hud.showParticleInfo(4);
            this.playSound(config.sounds.errorSound);
        }

        // Handle Blue Triggers
        if (this.currentTick === player.respawnBlueTick && player.isTouchingBlue) {
            player.segmentedTimerTicks = 0;
            player.resetPlayerVars();
            player.resetVelo();
            player.checkpoints.locked = true;
            this.entFire("tp_s" + player.currentStage, "Teleport", "", nerdStuff.oneTick);
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
                this.sendChatColored(`${chatcolors.red}Your time is up! ${chatcolors.white}Try again! ${chatcolors.purple}:3c`);
                hud.showParticleInfo(1);
            }
        }

        // Handle Movement and Position Update
        if (player.playerJumped) {
            player.ticksInAir++;
            player.lastJumpHeights.push(Utils.calculateHeightDifference(player.playerJumpedPos, player.playerPos));
        }

        player.playerPos = Instance.GetPlayerController(0)?.GetPlayerPawn()?.GetAbsOrigin();

        if (player.oldPlayerPos.x !== player.playerPos.x || player.oldPlayerPos.y !== player.playerPos.y || player.oldPlayerPos.z !== player.playerPos.z) {
            player.lastStoodStill = this.currentTick;
        }

        player.playerVel = ('000000' + Utils.get2DVelocity().toFixed(2)).slice(-6);
        if (player.allowTrail && player.timerStopped && hud.trailColorIndex !== 0) {
            player.spawnTrail();
        }

        player.oldPlayerPos = player.playerPos;

        // Update HUD
        hud.printHud();
        hud.nextRainbowColor();
    }

    onSound() {
        if (player.playerJumped && this.weaponFiredTick !== this.currentTick) {
            player.playerLandedPos = player.oldPlayerPos;

            if (player.playerJumpedPos !== nerdStuff.nullV && player.playerLandedPos !== nerdStuff.nullV) {
                const distance = Utils.calculateDistance(player.playerJumpedPos, player.playerLandedPos);
                if (distance !== 0 && distance > 100 && player.ticksInAir > 5) {
                    const heightStr = Math.max(...player.lastJumpHeights).toFixed(2);
                    const paddedHeight = ('000000' + heightStr).slice(-6);
                    hud.populateLJSlots(distance.toFixed(2), player.playerPreVel, paddedHeight);
                }
                player.lastJumpHeights = [];
            }
            player.ticksInAir = 0;
            player.playerJumped = false;
            player.playerPreVel = "000.00";
        }
    }

    onJump() {
        player.playerPreVel = player.playerVel;
        player.playerJumped = true;
        player.playerJumpedPos = player.oldPlayerPos;
        player.ticksInAir = 0;
    }

    onRoundStart() {
        if (this.playerSpawnedIn) {
            this.sendChatColored(`${chatcolors.red}Please dont try to restart the round on your own! ${chatcolors.silver}Things can break :(`);
            this.sendChatColored(`${chatcolors.red}The map will now restart! ${chatcolors.silver}Please wait...`);
            hud.showParticleInfo(9);
            this.sendCommand(`map_workshop 3355497176 movement_hub`, 2);
        }

        this.currentTick = 0;
        this.playerSpawnedIn = false;
    }

    onTrialStart(fromRestart = false, TimeTrial = true) {
        if (TimeTrial) {
            if (config.mapInfo[this.currentMapName].hasTimeTrial === false) {
                this.playSound(config.sounds.errorSound);
                this.sendChatColored(`${chatcolors.silver}Time Trial not available on ${this.currentMapName}! ...yet`);
                hud.showParticleInfo(10);
                return;
            }
        } else {
            if (config.mapInfo[this.currentMapName].hasFrenzy === false) {
                this.playSound(config.sounds.errorSound);
                this.sendChatColored(`${chatcolors.silver}Happy Frenzy not available on ${this.currentMapName}! ...yet`);
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

        this.playSound(config.sounds.requestMove + ('00' + String(Math.floor(Math.random() * 11) + 1)).slice(-2));

        this.loadNextStage(player.currentStage, TimeTrial);
    }

    onTrialSkip() {
        if (player.timerStopped || player.currentMode === "HappyFrenzy") {
            this.sendChatColored(`${chatcolors.red} You can't skip stages right now!`);
            hud.showParticleInfo(2);
            return;
        }

        player.timerTicks = player.timerTicks + (64 * 60);
        player.segmentedTimerTicksTotal = player.segmentedTimerTicksTotal + (64 * 60);
        player.segmentedTimerTicks = 0;

        player.resetPlayerVars();

        this.playSound(config.sounds.levelDown);
        this.sendChatColored(`${chatcolors.silver}Skipping stage ${chatcolors.white}#${player.currentStage}${chatcolors.silver}...`);
        hud.showParticleInfo(12);
        this.playSound(config.sounds.laugh);

        if (player.currentStage === config.mapInfo[this.currentMapName].maxStages) {
            this.onTrialFinish();
        }
        else {
            this.loadNextStage(player.currentStage + 1);
        }
    }

    onTrialFinish(timeTrial = true) {
        player.segmentedTimerTicksTotal += player.segmentedTimerTicks;
        player.segmentedTimerTicks = 0;

        player.resetPlayerVars();

        const mapInfo = config.mapInfo[this.currentMapName];
        const { timerTicks, segmentedTimerTicksTotal } = player;

        const isTimeTrial = player.currentMode === "TimeTrial";
        const pbTime = isTimeTrial ? mapInfo.pb : mapInfo.pbFrenzy;
        const maxInt = nerdStuff.maxInt;

        const timeDiff = pbTime !== maxInt
            ? `${chatcolors.silver}[${Utils.formatTimeDifference(timerTicks, pbTime)}${chatcolors.silver}]`
            : "";

        const segTimeDiff = mapInfo.pbSeg !== maxInt ? `${chatcolors.silver}[${Utils.formatTimeDifference(segmentedTimerTicksTotal, mapInfo.pbSeg)}${chatcolors.silver}]` : "";

        this.sendChatColored(`${chatcolors.silver}Total time${!timeTrial ? " left" : ""}: ${chatcolors.green}${Utils.formatTime(timerTicks)} ${chatcolors.silver}${timeDiff}`);
        this.sendChatColored(timeTrial ? `${chatcolors.silver}Segmented time: ${chatcolors.green}${Utils.formatTime(segmentedTimerTicksTotal)} ${chatcolors.silver}${segTimeDiff}` : `${chatcolors.silver}Total Points: ${chatcolors.green}${timerTicks}`);

        if (timeTrial) {
            if (timerTicks < mapInfo.pb) mapInfo.pb = timerTicks;
            if (segmentedTimerTicksTotal < mapInfo.pbSeg) mapInfo.pbSeg = segmentedTimerTicksTotal;
        } else {
            if (timerTicks > mapInfo.pbFrenzy) mapInfo.pbFrenzy = timerTicks;
        }

        Instance.Msg(`${timeTrial ? "Time Trial" : "Happy Frenzy"} Finished!`);
        player.respawn();
        this.playSound(config.sounds.levelUp);
        player.currentMode = "FreeRoam";
    }

    onTrialStageFinish() {
        if (player.timerStopped) {
            this.cheetoCrash();
            return;
        }

        player.segmentedTimerTicksTotal = player.segmentedTimerTicks + player.segmentedTimerTicksTotal;
        player.segmentedTimerTicks = 0;

        player.resetPlayerVars();

        this.playSound(config.sounds.yippi);

        this.loadNextStage(player.currentStage + 1);
        Instance.Msg(`Stage ${player.currentStage} cleared!`);
    }

    onTrialCollect() {
        player.timerTicks += (64 * config.mapInfo[this.currentMapName].addedSeconds);
        player.steamhappies++;

        this.playSound(config.sounds.yippi);
        this.sendChatColored(`${chatcolors.green}+${config.mapInfo[this.currentMapName].addedSeconds} seconds added your timer!`);

        if (player.steamhappies === config.mapInfo[this.currentMapName].steamHappies) {
            this.onTrialFinish(false);
        }
    }

    onTrialRespawn() {
        if (player.timerStopped) return;
        if (player.currentMode === "HappyFrenzy") {
            this.onTrialStart(false, false);
            return;
        }

        player.segmentedTimerTicks = 0;

        player.resetPlayerVars();

        player.checkpoints.locked = true;
        player.resetVelo();
        this.entFire("tp_s" + player.currentStage, "Teleport", "", nerdStuff.oneTick);
        this.playSound(config.sounds.levelDown);
        if (hud.trailColorIndex !== 0) this.showStageTrail(this.currentMapName, player.currentStage, false);
        Instance.Msg(`Respawned at stage ${player.currentStage}`);
    }

    onTrialRespawnBlue(n) {
        if (n == 1) {
            player.isTouchingBlue = true;
            player.respawnBlueTick = this.currentTick + 16;
        } else if (n == 0) {
            player.isTouchingBlue = false;
            player.respawnBlueTick = 0;
        }
    }

    onTrialGuide() {
        if (player.timerStopped) {
            return;
        }

        if (player.currentMode === "HappyFrenzy") {
            this.sendChatColored(`${chatcolors.red} This mode does not support Trails!`);
            hud.showParticleInfo(3);
            return;
        }

        Instance.Msg(`Showing Trail for Stage ${player.currentStage}`);

        this.showStageTrail(this.currentMapName, player.currentStage, true);
    }

    onFreeRoam() {
        player.segmentedTimerTicksTotal = 0;
        player.segmentedTimerTicks = 0;

        player.resetPlayerVars();

        player.checkpoints.locked = false;
        player.respawn(true);
        this.entFire("tp_freeroam", "Teleport");
        this.sendCommand("ent_fire prop_door_rotating close");
        this.sendCommand("ent_fire func_door_rotating close");
    }

    onBackToHub() {
        player.respawn();
        player.currentStage = 0;
    }

    loadNextStage(n, timeTrial = true) {
        Instance.Msg(`Loading Stage ${n}`);

        player.resetVelo();

        if (timeTrial === true) {
            this.sendCommand("ent_fire prop_door_rotating open", 1);
            this.sendCommand("ent_fire func_door_rotating open", 1);

            this.entFire("tp_s" + n, "Teleport", "", nerdStuff.oneTick);
            this.entFire("ent_s" + n, "Enable", "", nerdStuff.oneTick);

            if (n !== config.mapInfo[this.currentMapName].maxStages)
                this.entFire("end_s" + n, "Enable", "", nerdStuff.oneTick);
            else
                this.entFire("finish_s" + n, "Enable", "", nerdStuff.oneTick);

            this.entFire("collected_s*", "Disable");
            this.entFire("ent_hf", "Disable");
        }
        else {
            this.entFire("collected_s*", "Enable");
            this.entFire("tp_hf", "Teleport", "", nerdStuff.oneTick);
            this.entFire("ent_hf", "Enable", "", nerdStuff.oneTick);

            this.entFire("ent_s" + (n - 1), "Disable");
            this.entFire("end_s" + (n - 1), "Disable");
            this.entFire("finish_s" + (n - 1), "Disable");
        }

        if (n - 1 !== 0) {
            this.entFire("ent_s" + (n - 1), "Disable");
            this.entFire("end_s" + (n - 1), "Disable");
            this.entFire("finish_s" + (n - 1), "Disable");
            if (timeTrial === false) {
                this.entFire("collected_s*", "Disable");
                this.entFire("ent_hf", "Disable");
            }
        }

        player.currentStage = n;

        Instance.Msg(`Stage ${n} Loaded`);

        if (hud.trailColorIndex !== 0 && player.currentMode !== "HappyFrenzy") this.showStageTrail(this.currentMapName, player.currentStage, false);
    }

    showStageTrail(currentMap, currentIndex, longer = false) {
        if (!guideTrails[currentMap] || !guideTrails[currentMap][currentIndex]) return;

        const points = guideTrails[currentMap][currentIndex];
        let delay = nerdStuff.oneTick;

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const command = `box ${p1[0]} ${p1[1]} ${p1[2]} ${p2[0]} ${p2[1]} ${p2[2]} ${(longer ? 5 : 1)} ${hud.currentColor.r} ${hud.currentColor.g} ${hud.currentColor.b}`;
            this.sendCommand(command, delay);
            delay += nerdStuff.oneTick;
        }
    }

    setResFix(s) {
        const width = s.toString().split("x")[0];
        const height = s.toString().split("x")[1];
        hud.getScreenMultiplier(width, height);
        this.sendChatColored(`${chatcolors.silver}Resolution fixed to ${chatcolors.white}${width}x${height}${chatcolors.silver}!`);
    }

    setTrail(s) {
        let choice = parseInt(s);
        if (isNaN(choice)) {
            choice = 0;
        } else if (choice === 0) {
            player.allowTrail = false;
            hud.trailColorIndex = 0;
            this.sendChatColored(`${chatcolors.silver}Trail disabled!`);
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
                this.sendChatColored(`${chatcolors.silver}Trail set to ${trails[choice - 1]}${chatcolors.silver}!`);
            }

            hud.currentColor = hud.currentColor || { r: 255, g: 255, b: 255 };
            hud.targetColorIndex = 0;
        }
    }

    bbox() {
        this.sendCommand(`cl_ent_bbox !player`);
        player.bbox = !player.bbox;
        this.sendChatColored(`${chatcolors.silver}Bounding Box: ${player.bbox ? `${chatcolors.green}Enabled` : `${chatcolors.red}Disabled`}`);
    }

    radioToggle() {
        player.radioDisabled = !player.radioDisabled;
        this.sendChatColored(`${chatcolors.silver}Radio Menu: ${player.bbox ? `${chatcolors.green}Enabled` : `${chatcolors.red}Disabled`}`);
    }

    kzTeleport() {
        if (player.checkpoints.locked) {
            this.sendChatColored(`${chatcolors.red}Custom checkpoints unavailable! ${chatcolors.silver}Enter Free Roam first!`);
            hud.showParticleInfo(8);
            this.playSound(config.sounds.errorSound);
            return;
        }

        if (player.checkpoints.pos.x !== 0 || player.checkpoints.pos.y !== 0 || player.checkpoints.pos.z !== 0) {
            player.resetVelo();

            Instance.GetPlayerController(0)?.GetPlayerPawn()?.Teleport(
                player.checkpoints.pos,
                player.checkpoints.ang,
                { x: 0, y: 0, z: 0 }
            );

            player.checkpoints.tpNum++;
            player.resetPlayerVars(true, true);
            this.sendChatColored(`${chatcolors.silver}Checkpoint ${chatcolors.white}#${player.checkpoints.cpNum} ${chatcolors.silver}Loaded!`);
            hud.showParticleInfo(6);
            this.playSound(config.sounds.beepSound);
            player.checkpoints.lastCheckpointStamp = this.currentTick;
            Instance.Msg(`Loaded checkpoint #${player.checkpoints.tpNum}`);
        } else {
            Instance.Msg(`${player.checkpoints.pos.x}, ${player.checkpoints.pos.y}, ${player.checkpoints.pos.z}`);
            this.sendChatColored(`${chatcolors.silver}No checkpoint to load!`);
            this.playSound(config.sounds.errorSound);
        }
    }

    kzCheckpoint() {
        if (player.checkpoints.locked) {
            this.sendChatColored(`${chatcolors.red}Custom checkpoints unavailable! ${chatcolors.silver}Enter Free Roam first!`);
            hud.showParticleInfo(8);
            this.playSound(config.sounds.errorSound);
            return;
        }

        if (player.ticksInAir > 3) {
            this.sendChatColored(`${chatcolors.red}You must be on the ground before saving a checkpoint!`);
            hud.showParticleInfo(7);
            this.playSound(config.sounds.errorSound);
            return;
        }

        player.checkpoints.pos = player.playerPos;
        player.checkpoints.ang = Instance.GetPlayerController(0)?.GetPlayerPawn()?.GetEyeAngles();

        Instance.Msg(`${player.checkpoints.pos.x}, ${player.checkpoints.pos.y}, ${player.checkpoints.pos.z}`);
        Instance.Msg(`${player.checkpoints.ang.pitch}, ${player.checkpoints.ang.yaw}, ${player.checkpoints.ang.roll}`);

        player.checkpoints.cpNum++;
        player.checkpoints.lastCheckpointStamp = this.currentTick;

        this.sendChatColored(`${chatcolors.silver}Checkpoint ${chatcolors.white}#${player.checkpoints.cpNum} ${chatcolors.silver}Saved!`);

        hud.showParticleInfo(5);
        this.playSound(config.sounds.beepSound);

        Instance.Msg(`Checkpoint info ${player.checkpoints.pos.x}, ${player.checkpoints.pos.y}, ${player.checkpoints.pos.z}`);
        Instance.Msg(`Set checkpoint #${player.checkpoints.cpNum}`);
    }

    loadSavedSettings(s) {
        const json = JSON.parse(s);
        this.trailDuration = json.trailDuration;
        hud.trailColorIndex = json.trailColorIndex;
        player.bbox = json.bbox;
    }
}

// Initialize instances
const server = new Server();
const hud = new HUD();
const player = new Player();

  /////////////////////////////////////////////////
 //       I HATE VALVE AND YOU SHOULD TOO       //
////////////////////////////////////////////////

Instance.OnScriptInput("on_tick", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onTick();
});

Instance.OnScriptInput("on_every_fourth_tick", () => {
    // Update HUD
    if (Instance.IsWarmupPeriod() === true) return;
    hud.printCenterHud();
});

Instance.OnScriptInput("on_spawn", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    player.respawn();
});

Instance.OnScriptInput("on_round_start", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onRoundStart();
});

Instance.OnScriptInput("on_jump", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onJump();
});

Instance.OnScriptInput("on_sound", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onSound();
});

Instance.OnScriptInput("on_weapon", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.weaponFiredTick = server.currentTick;
});

Instance.OnScriptInput("kz_cp", () => {
    if (Instance.IsWarmupPeriod() === true || (server.currentTick - player.checkpoints.lastCheckpointStamp < 16)) return;
    server.kzCheckpoint();
});

Instance.OnScriptInput("kz_tp", () => {
    if (Instance.IsWarmupPeriod() === true || (server.currentTick - player.checkpoints.lastCheckpointStamp < 16)) return;
    server.kzTeleport();
});

Instance.OnScriptInput("on_trial_start_hf", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onTrialStart(false, false);
});

Instance.OnScriptInput("on_trial_start_tt", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onTrialStart(false, true);
})

Instance.OnScriptInput("on_trial_restart", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onTrialStart(true, player.currentMode === "TimeTrial");
});

Instance.OnScriptInput("on_trial_skip", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onTrialSkip();
});

Instance.OnScriptInput("on_trial_stage_finish", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onTrialStageFinish();
});

Instance.OnScriptInput("on_trial_finish", () => {
    if (Instance.IsWarmupPeriod() === true) return;

    server.onTrialFinish();
});

Instance.OnScriptInput("on_trial_alt_collect", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    if (player.timerStopped) {
        server.cheetoCrash();
        return;
    }

    server.onTrialCollect();
});

Instance.OnScriptInput("on_trial_respawn", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onTrialRespawn();
});

Instance.OnScriptInput("on_trial_respawn_blue_1", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onTrialRespawnBlue(1);
});

Instance.OnScriptInput("on_trial_respawn_blue_0", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onTrialRespawnBlue(0);
});

Instance.OnScriptInput("on_trial_guide", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onTrialGuide();
});

Instance.OnScriptInput("on_free_roam", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onFreeRoam();
});

Instance.OnScriptInput("kz_back_to_hub", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.onBackToHub();
});

Instance.OnScriptInput("on_trial_loaded_nuke", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    const s = "de_nuke";
    server.currentMapName = s;
});

/* Instance.PublicMethod("set_trail", (i) => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.setTrail(i);
}); */

Instance.OnScriptInput("set_trail_1", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.setTrail(1);
});

Instance.OnScriptInput("set_trail_2", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.setTrail(2);
});

Instance.OnScriptInput("set_trail_3", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.setTrail(3);
});

Instance.OnScriptInput("set_trail_4", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.setTrail(4);
});

Instance.OnScriptInput("set_trail_5", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.setTrail(5);
});

Instance.OnScriptInput("set_trail_6", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.setTrail(6);
});

Instance.OnScriptInput("set_trail_0", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.setTrail(0);
});

Instance.OnScriptInput("bbox", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    server.bbox();
});

Instance.OnScriptInput("broken", () => {
    if (Instance.IsWarmupPeriod() === true) return;

    server.sendChatColored(`${chatcolors.silver}This feature is currently broken... out of service :p blame evil valve`);
});

Instance.OnScriptInput("give_talon", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    player.giveSubclass(523);
});

Instance.OnScriptInput("give_bayonet", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    player.giveSubclass(500);
});

Instance.OnScriptInput("give_butterfly", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    player.giveSubclass(515);
});

Instance.OnScriptInput("give_m9", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    player.giveSubclass(508);
});

Instance.OnScriptInput("give_karambit", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    player.giveSubclass(507);
});

Instance.OnScriptInput("give_buttplugs", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    player.giveSubclass(516);
});

Instance.OnScriptInput("give_survival", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    player.giveSubclass(518);
});

Instance.OnScriptInput("give_huntsman", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    player.giveSubclass(509);
});

Instance.OnScriptInput("give_classic", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    player.giveSubclass(503);
});

Instance.OnScriptInput("give_ursus", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    player.giveSubclass(519);
});

Instance.OnScriptInput("give_skeleton", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    player.giveSubclass(525);
});

Instance.OnScriptInput("give_flip", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    player.giveSubclass(505);
});

Instance.OnScriptInput("give_bowie", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    player.giveSubclass(514);
});

Instance.OnScriptInput("give_gut", () => {
    if (Instance.IsWarmupPeriod() === true) return;
    player.giveSubclass(506);
});

// placeholder
const guideTrails = {
    "some_map": {
        "1": [
            [
                -342.82098388671875,
                -1876.2435302734375,
                -169.3857421875
            ],
            [
                -342.82550048828125,
                -1876.2462158203125,
                -169.38624572753906
            ],
            [
                -343.1166687011719,
                -1876.4205322265625,
                -169.4198760986328
            ]
        ]
    },
};
