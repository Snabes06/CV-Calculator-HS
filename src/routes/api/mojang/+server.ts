import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
    const username = url.searchParams.get('username');
    if (!username) {
        return new Response(JSON.stringify({ error: 'Missing username' }), { status: 400 });
    }
    const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
    const data = await res.json();
    return new Response(JSON.stringify(data), { status: res.ok ? 200 : 500 });
};
