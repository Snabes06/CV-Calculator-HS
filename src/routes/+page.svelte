<script lang="ts">
	import { API_KEY } from '$env/static/private';
import { onMount } from 'svelte';
import { writable } from 'svelte/store';

// A store for the API result
let result: string | null = null;
let out: any = {};
let loading = false;

type Rarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";

const RarityColors: Record<Rarity, string> = {
    COMMON: "bg-white",
    UNCOMMON: "bg-green-500",
    RARE: "bg-blue-500",
    EPIC: "bg-purple-500",
    LEGENDARY: "bg-yellow-400",
    MYTHIC: "bg-pink-400"
};

async function getData() {
    loading = true;
    result = null;
    try {
        // Example API endpoint:
        const res = await fetch('https://api.hypixel.net/v2/resources/skyblock/items');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();

        // store or render the data
        result = JSON.stringify(data, null, 2);

        out = JSON.parse(result);

        console.log(out);

    } catch (err) {
        result = `Error: ${err}`;
    } finally {
        loading = false;
    }
}

async function getPlayerData() {
    const res = await fetch(`https://api.hypixel.net/v2/skyblock/profiles?key=${API_KEY}&uuid${username}`)
}

function getRarityClass(rarity: string) {
    return RarityColors[rarity as Rarity] || "bg-white";
}
</script>

<div class="flex-col justify-center">
    <div id="current-stats">
        
    </div>

    <div id="interface" class="flex p-[40px] justify-center">
        <button on:click={getPlayerData} on:click={getData} disabled={loading} class="rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold font-sans px-6 py-2 transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Loading…' : 'Calculate'}
        </button>
        <input type="text" name="profile-name" id="username" class="rounded-md border border-blue-400 focus:border-blue-600 px-4 py-2 font-medium font-sans shadow-sm transition duration-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 ml-4" />
    </div>

    <div id="output-list">
        {#each out.items as item}
            <pre class="{getRarityClass(item.tier)} rounded px-2 py-1 font-semibold mb-2">{item.id}</pre>
        {/each}
    </div>
</div>
