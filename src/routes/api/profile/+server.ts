import { API_KEY } from '$env/static/private';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
    const uuid = url.searchParams.get('uuid');
    const res = await fetch(`https://api.hypixel.net/v2/skyblock/profiles?key=${API_KEY}&uuid=${uuid}`);
    const data = await res.json();
    return new Response(JSON.stringify(data), { status: res.ok ? 200 : 500 });
};