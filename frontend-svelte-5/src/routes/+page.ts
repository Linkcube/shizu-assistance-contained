import type { PageLoad } from './$types';
import { getMin as getDjMin } from '$lib/djController';
import { getMin as getPromoMin } from '$lib/promotionsController';
import { getMin as getEventMin } from '$lib/eventController';

export const load: PageLoad = async ({ params }) => {
    const djs_min = await getDjMin();
    const promos_min = await getPromoMin();
    const events_min = await getEventMin();

    return {
        djs: djs_min.length,
        promos: promos_min.length,
        events: events_min.length
    }
}