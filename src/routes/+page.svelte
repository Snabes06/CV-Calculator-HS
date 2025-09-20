<script lang="ts">
import { error } from '@sveltejs/kit';
import { onMount } from 'svelte';
import { writable } from 'svelte/store';

// A store for the API result
let loading = false;
let out: any = {};

// SKYBLOCK PROPERTIES
let player_name = '';
let SBData: any;
let SBProfile: any;
const stats = writable<{ mining?: number; farming?: number; combat?: number } | null>(null);
let combat_xp: any = 0;

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

        // PLAYER SKILL EXP
        stats.set({
            mining: player.player_data.experience.SKILL_MINING,
            farming: player.player_data.experience.SKILL_FARMING,
            combat: player.player_data.experience.SKILL_COMBAT
        });
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
        const data = await resp.json();
    } catch (err) {
        console.error(err);
    }
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
        {#if $stats}
            <p>Farming XP: {$stats.farming ?? 'N/A'}</p>
            <p>Mining XP: {$stats.mining ?? 'N/A'}</p>
            <p>Combat XP: {$stats.combat ?? 'N/A'}</p>
        {/if}
        

   <!--     {#each out.items as item}
            <pre class="{getRarityClass(item.tier)} rounded px-2 py-1 font-semibold mb-2">{item.id}</pre>
        {/each} -->
    </div>
</div>
