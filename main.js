(function () {
    'use strict';
    const bloomDataURL = "https://weibo.eswk.workers.dev/";
    const magicNumbers = [0n, 810n, 893n, 1919n, 114514n, 1919810n];
    const byteOffset = 8n; // sizeof std::size_t
    const maxBytes = 512892944n;
    const bitSize = 4103143449n;
    const trueRate = Math.round(1000000 / 102) / 100;

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
        console.log(fileByteIndex);
        const partIndex = fileByteIndex % 1024n;
        const begin = (fileByteIndex / 1024n) * 1024n;
        let end = begin + 1023n;
        if (end >= maxBytes) end = maxBytes - 1n;

        console.log(begin, end, partIndex);
        const response = await fetch(bloomDataURL, {
            "headers": {
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "range": `bytes=${Number(begin)}-${Number(end)}`,
            },
            "referrerPolicy": "no-referrer-when-downgrade",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "omit"
        });
        const bytes = new Uint8Array(await response.arrayBuffer());
        return bytes[Number(partIndex)];
    }

    async function getBloomBit(bitIndex) {
        const byteIndex = byteOffset + (bitIndex >> 3n);
        const inner = Number(bitIndex % 8n);
        return (await getNthByte(byteIndex) >> inner) & 1;
    }

    function bi2bytes(big) {
        const bytes = [];
        while (big > 0n) {
            bytes.push(Number(big % 256n));
            big >>= 8n;
        }
        console.log(bytes.concat(new Array(8 - bytes.length).fill(0)));
        return bytes.concat(new Array(8 - bytes.length).fill(0));
    }

    function mixHash(uid, p) {
        return fnv_1a_64(
            bi2bytes(((p << 32n) | BigInt(uid)))
        ) % bitSize;
    }

    async function queryBloom(uid) {
        for (let number of magicNumbers) {
            if (await getBloomBit(mixHash(uid, number)) === 0) return false;
        }
        return true;
    }

    document.querySelector("button#chudao").addEventListener('click', async () => {
        const resultText = document.querySelector("p#result");
        const uid = parseInt(document.querySelector("input#uid").value);
        if (isNaN(uid)) {
            alert("你在干什么？");
            return false;
        }
        resultText.innerText = "正在创象出道中…… 可能需要亿点时间 ……";
        if (await queryBloom(uid)) {
            alert("恭喜！已被开盒。");
            resultText.innerText = `${uid} 有 ${trueRate}% 概率已经被出道，，，`;
        } else {
            alert("很好，你没事了。");
            resultText.innerText = `${uid} 安全，没有记录。`;
        }
    })
})();
