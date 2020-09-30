const dataUrl = "https://media.githubusercontent.com/media/ESUAdmin/weibo-leaks/master/bloom-filter-data.bin";
const allowOrigin = "https://esuadmin.github.io";

addEventListener("fetch", event => {
    event.respondWith(handler(event.request));
});

const magicNumbers = [0, 810, 893, 1919, 114514, 1919810];
// don't change BigInt type
const byteOffset = 8n; // sizeof std::size_t
const maxBytes = 512892944;
const bitSize = 4103143449n;
// FNV-1a 64bit
const fnv_prime_64 = 1099511628211n;
const fnv_offset_basis = 14695981039346656037n;

// array of i -> bi
function fnv_1a_64(bytes) {
    let hash = fnv_offset_basis;
    for (let byte of bytes) {
        hash = ((hash ^ BigInt(byte)) * fnv_prime_64) & 0xFFFFFFFFFFFFFFFFn;
    }
    return hash;
}

// bi -> i
async function getNthByte(fileByteIndex) {
    const partIndex = Number(fileByteIndex % 1024n);
    const begin = Number((fileByteIndex / 1024n) * 1024n);
    let end = begin + 1023;
    if (end >= maxBytes) end = maxBytes - 1;

    const response = await fetch(dataUrl, {
        "headers": {
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "range": `bytes=${begin}-${end}`,
        },
        "body": null,
        "method": "GET",
    });
    const bytes = new Uint8Array(await response.arrayBuffer());
    return bytes[partIndex];
}

// bi -> 01
async function getBloomBit(bitIndex) {
    const byteIndex = byteOffset + (bitIndex >> 3n);
    const inner = Number(bitIndex % 8n);
    return (await getNthByte(byteIndex) >> inner) & 1;
}

// bi -> array of i
function bi2bytes(big) {
    const bytes = [];
    while (big > 0n) {
        bytes.push(Number(big % 256n));
        big >>= 8n;
    }
    return bytes.concat(new Array(8 - bytes.length).fill(0));
}

// i, i -> i
function mixHash(uid, p) {
    return fnv_1a_64(
        bi2bytes(((BigInt(p) << 32n) | BigInt(uid)))
    ) % bitSize;
}

// i -> bool
async function queryBloom(uid) {
    for (const magic of magicNumbers) {
        if (await getBloomBit(mixHash(uid, magic)) === 0) return false;
    }
    return true;
}

async function handler(request) {
    const url = request.url;
    const uid = parseInt(url.substr(url.lastIndexOf("/") + 1));
    let response;

    if (isNaN(uid) || uid <= 0) {
        response = new Response("Invalid argument", {status: 400});
    } else {
        try {
            const result = await queryBloom(uid);
            response = new Response(String(result), {status: 200});
        } catch (e) {
            response = new Response("Server error", {status: 500});
        }
    }
    response.headers.set('Access-Control-Allow-Origin', allowOrigin);

    return response;
}
