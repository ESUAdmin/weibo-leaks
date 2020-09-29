const url = "https://media.githubusercontent.com/media/ESUAdmin/weibo-leaks/master/bloom-filter-data.bin";

addEventListener("fetch", event => {
    event.respondWith(handler(event.request));
});

async function handler(request) {
    let response;
    if (!request.headers.has('Range')) {
        response = new Response('OK', {status: 200});
    } else {
        try {
            response = await fetch(url, request);
            response = new Response(response.body, response);
        } catch (err) {
            return new Response("Bad Request", {status: 400});
        }
    }
    /* i ee, grass */
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Headers', '*');
    return response;
}
