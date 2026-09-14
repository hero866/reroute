addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

const SECRET = "cache";

// 内部真实域名
const REAL_DOMAINS = {
  j1: "https://v2moetencent-3gma2y0ca8180a42-1331580778.ap-shanghai.app.tcloudbase.com",
  j2: "https://m5.m5cc.cc",
  j3: "https://m5js.top"
};

// 简单字符映射混淆
function encode(str) {
  return str
    .split("")
    .map(c => String.fromCharCode(c.charCodeAt(0) + 3))
    .join("");
}

function decode(str) {
  return str
    .split("")
    .map(c => String.fromCharCode(c.charCodeAt(0) - 3))
    .join("");
}

// 生成混淆对象
function getObfuscatedDomains() {
  const ob = {};

  for (const k in REAL_DOMAINS) {
    ob[k] = encode(REAL_DOMAINS[k]);
  }

  return ob;
}

// GitHub HTML 地址
const GITHUB_HTML =
  "https://raw.githubusercontent.com/hero866/reroute/refs/heads/main/4d1z579q.html";

async function handleRequest(req) {
  const url = new URL(req.url);

  // =========================
  // 返回混淆域名
  // =========================
  if (url.pathname === "/do") {
    const pwd = url.searchParams.get("pwd");

    if (pwd !== SECRET) {
      return new Response("Forbidden", {
        status: 403
      });
    }

    return new Response(JSON.stringify(getObfuscatedDomains()), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  // =========================
  // 解密跳转
  // =========================
  if (url.pathname === "/go") {
    const k = url.searchParams.get("k");
    const hash = url.searchParams.get("hash") || "";

    if (!k) {
      return new Response("Invalid", {
        status: 400
      });
    }

    try {
      // 解密真实域名
      let realUrl = decode(k);

      // 保留原始 URL 的 # 后面的内容
      // 例如：
      // #register?code=VEKlYLAc
      if (hash) {
        realUrl += hash.startsWith("#") ? hash : "#" + hash;
      }

      return Response.redirect(realUrl, 302);
    } catch {
      return new Response("Decode failed", {
        status: 400
      });
    }
  }

  // =========================
  // 其他路径 → 返回远程 GitHub HTML
  // =========================
  try {
    const r = await fetch(GITHUB_HTML);

    if (!r.ok) {
      throw new Error(r.statusText);
    }

    const text = await r.text();

    return new Response(text, {
      status: 200,
      headers: {
        "Content-Type": "text/html;charset=utf-8"
      }
    });
  } catch (e) {
    return new Response(`Fetch HTML error: ${e.message}`, {
      status: 500
    });
  }
}
