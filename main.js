(function () {
    'use strict';
    // init materialize
    document.addEventListener('DOMContentLoaded', function() {
        let elems = document.querySelectorAll('.sidenav');
        let instances = M.Sidenav.init(elems, {});
    });

    const apiUrl = "https://weibo-leaks.eswk.workers.dev/";
    const trueRate = Math.round(1000000 / 102) / 100;

    document.querySelector("button#chudao").addEventListener("click", async () => {
        const resultText = document.querySelector("p#result");
        const uid = parseInt(document.querySelector("input#uid").value);
        if (isNaN(uid) || uid <= 0) {
            alert("你在干什么？");
            return false;
        }
        resultText.innerText = "正在创象出道中…… 可能需要亿点时间 ……";
        const response = await fetch(apiUrl + String(uid));
        const text = await response.text();
        if (response.status === 200) {
            if (text === "true") {
                alert("恭喜！已被开盒。");
                resultText.innerText = `${uid} 有 ${trueRate}% 概率已经被出道，，，`;
            } else if (text === "false") {
                alert("很好，你没事了。");
                resultText.innerText = `${uid} 安全，没有记录。`;
            } else {
                alert("这不应该发生。");
            }
        } else {
            alert(`查询出现问题…… 代码 ${response.status}`);
            resultText.innerText = text;
        }
    });
})();
