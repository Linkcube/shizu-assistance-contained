import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getSingle } from '$lib/djController';

export const load: PageLoad = async ({ params }) => {
    const real_name = decodeURI(params.slug);
    let dj_data;
    try {
        dj_data = await getSingle(real_name);
    } catch (e) {
        error(404, `DJ ${real_name} not found`);
    }

    return {
        dj: dj_data
    };
};