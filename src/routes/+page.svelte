<script lang="ts">
import { error, json } from '@sveltejs/kit';
import { onMount } from 'svelte';
import { writable } from 'svelte/store';

// A store for the API result
let loading = false;
let out: any = {};

// SKYBLOCK VARIABLES
let player_name = '';
let SBData: any;
let SBProfile: any;
let skill_data: any;

// SKILL INFO
type SkillInfo = {
    level: number;
    overflow: number;
    expToNext: number;
};

const skills = writable<Record<string, SkillInfo>>({});

// RARITY INFO
type Rarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC" | "SPECIAL" | "DIVINE";

const RarityColors: Record<Rarity, string> = {
    COMMON: "bg-white",
    UNCOMMON: "bg-green-500",
    RARE: "bg-blue-500",
    EPIC: "bg-purple-500",
    LEGENDARY: "bg-yellow-400",
    MYTHIC: "bg-pink-400",
    SPECIAL: "bg-red-300",
    DIVINE: "bg-cyan-400"
};

// FETCHES PLAYER UUID USING MC NAME
async function getPlayerUUID() {
    try {
        const resp = await fetch(`/api/mojang?username=${player_name}`);
        console.log(resp);
        if (!resp.ok) throw new Error('Failed to fetch UUID');
        const data = await resp.json();
        return data.id; 
    } catch (err) {
        console.error(err);
        return null;
    }
}

// FETCHES SKYBLOCK DATA
async function getSkyblockData() {
    loading = true
    const UUID = await getPlayerUUID();
    if (!UUID) {
        throw new Error('Failed to fetch UUID');
    }

    try {
        const resp = await fetch(`/api/profile?uuid=${UUID}`);
        if (!resp.ok) throw new Error('Failed to fetch SBprofiles')

        // SKYBLOCK DATA OBJECT
        SBData = await resp.json();
        if (!SBData.success) {
            throw new Error(SBData.cause || 'API responded with failure');
        }

        // SPECIFIC PROFILE DATA OBJECT
        const profiles = SBData.profiles;
        if (!profiles) {
            throw new Error('No SBProfiles found for that player');
        }

        // PLAYER PROFILE OBJECT ACTIVE OR FIRST
        SBProfile = profiles.find((p: any) => p.selected) || profiles[0];
        const player = SBProfile.members[UUID];
        if (!player) {
            throw new Error('Could not find member data in that profile');
        }

        console.log(player);

        // PLAYER COMBAT SKILL EXP
        await getSkillData();

        console.log(skill_data);

        const skillNames = ['COMBAT'];
        const skillObj: Record<string, SkillInfo> = {};

        for (const name of skillNames) {
            const exp = player.player_data.experience[`SKILL_${name}`];
            const levels = skill_data.skills[name].levels;
            skillObj[name] = getSkillInfo(exp, levels);
        }
        skills.set(skillObj);

        // INVENTORY CHECK
        await getItemData();

        


    } catch(err) {
        console.error(err);
    } finally {
        loading = false;
    }
}

// GET SKYBLOCK ITEM DATA
async function getItemData() {
    try {
        const resp = await fetch('https://api.hypixel.net/v2/resources/skyblock/items');
        if (!resp.ok) throw new Error('API error item data');
        const data = await resp.json();

        out = data;
        console.log(out);
    } catch (err) {
        console.error(err);
    } 
}

// GET SKYBLOCK SKILL DATA
async function getSkillData() {
    try {
        const resp = await fetch('https://api.hypixel.net/v2/resources/skyblock/skills');
        if (!resp) throw new Error('API error skill data');
        skill_data = await resp.json();
    } catch (err) {
        console.error(err);
    }
}

function getSkillInfo(exp: number, levels: any[]): SkillInfo {
    const idx = getSkillLevelIndex(exp, levels);
    const currentExp = levels[idx].totalExpRequired;
    const nextExp = levels[idx + 1]?.totalExpRequired ?? currentExp;
    return {
        level: idx,
        overflow: exp - currentExp,
        expToNext: idx < levels.length - 1 ? nextExp - exp : 0
    };
}

function getSkillLevelIndex(exp: number, levels: any[]) {
    for (let i = levels.length - 1; i >= 0; i--) {
        if (exp >= levels[i].totalExpRequired) return i;
    }
    return 0;
}

// GET SKYBLOCK ITEM RARITY COLOR
function getRarityClass(rarity: string) {
    return RarityColors[rarity as Rarity] || "bg-white";
}
</script>

<div class="flex-col justify-center">
    <div id="current-stats">
        
    </div>

    <div id="interface" class="flex p-[40px] justify-center">
        <button on:click={getSkyblockData} disabled={loading} class="rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold font-sans px-6 py-2 transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Loading…' : 'Calculate'}
        </button>
        <input type="text" bind:value={player_name} class="rounded-md border border-blue-400 focus:border-blue-600 px-4 py-2 font-medium font-sans shadow-sm transition duration-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 ml-4" />
    </div>

    <div id="output-list">
      {#each Object.entries($skills) as [name, info]}
          <p class="bg-blue-50 text-blue-900 rounded-md px-4 py-2 mb-2 shadow font-semibold border border-blue-200">{name} Lvl: <span class="font-bold">{Math.round(info.level)}</span></p>
          <p class="bg-green-50 text-green-900 rounded-md px-4 py-2 mb-2 shadow font-semibold border border-green-200">{name} Overflow XP: <span class="font-bold">{Math.round(info.overflow)}</span></p>
          <p class="bg-purple-50 text-purple-900 rounded-md px-4 py-2 mb-2 shadow font-semibold border border-purple-200">{name} XP to Next Level: <span class="font-bold">{Math.round(info.expToNext)}</span></p>
        {/each}
        

   <!--     {#each out.items as item}
            <pre class="{getRarityClass(item.tier)} rounded px-2 py-1 font-semibold mb-2">{item.id}</pre>
        {/each} -->
    </div>
</div>
