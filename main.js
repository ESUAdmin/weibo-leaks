(function(){
    'use strict';
    const bloomDataURL = "https://media.githubusercontent.com/media/ESUAdmin/weibo-leaks/master/bloom-filter-data.bin"
    const magicNumbers = [0n, 810n, 893n, 1919n, 114514n, 1919810n];
    const byteOffset = 8; // sizeof std::size_t
    const maxBytes = 512892944n;
    const bitSize =  4103143449n;

    const fnv_prime_64 = 1099511628211n;
    const fnv_offset_basis = 14695981039346656037n;

    function fnv_1a_64(bytes) {
        let hash = fnv_offset_basis;
        for (let byte of bytes) {
            hash = ((hash ^ BigInt(byte)) * fnv_prime_64) & 0xFFFFFFFFFFFFFFFFn;
        }
        return hash;
    }

    async function getNthByte(fileByteIndex) {
        const partIndex = fileByteIndex % 1024;
        const begin = (fileByteIndex >> 10) << 10;
        let end = ((fileByteIndex >> 10) << 10) + 1023;
        if (end >= maxBytes) end = maxBytes - 1;

        console.log(begin, end, partIndex);
        const response = await fetch(bloomDataURL, {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "range": `bytes=${begin}-${end}`,
            },
            "referrerPolicy": "no-referrer-when-downgrade",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "omit"
        });
        const bytes = new Uint8Array(await response.arrayBuffer());
        return bytes[partIndex];
    }

    async function getBloomBit(bitIndex) {
        const byteIndex = byteOffset + (bitIndex >> 3);
        const inner = bitIndex % 8;
        return (await getNthByte(byteIndex) >> inner) & 1;
    }

    function bi2bytes(big) {
        const bytes = [];
        while (big > 0n) {
            bytes.push(Number(big % 256n));
            big >>= 8n;
        }
        console.log(bytes.concat(new Array(8-bytes.length).fill(0)));
        return bytes.concat(new Array(8-bytes.length).fill(0));
    }

    function mixHash(uid, p) {
        return fnv_1a_64(
            bi2bytes( ((p << 32n) | BigInt(uid)) )
        ) % bitSize;
    }

    async function queryBloom(uid) {
        for (let number of magicNumbers) {
            if (await getBloomBit(mixHash(uid, number)) === 0) return false;
        }
        return true;
    }
})();
