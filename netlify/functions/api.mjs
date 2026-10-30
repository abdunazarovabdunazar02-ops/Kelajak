import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

const REG = {
"Qoraqalpog‘iston Respublikasi":"Amudaryo,Beruniy,Bo‘zatov,Chimboy,Ellikqal’a,Kegeyli,Mo‘ynoq,Nukus,Qanliko‘l,Qo‘ng‘irot,Qorao‘zak,Shumanay,Taxtako‘pir,Taxiatosh,To‘rtko‘l,Xo‘jayli",
"Andijon viloyati":"Andijon,Asaka,Baliqchi,Bo‘ston,Buloqboshi,Izboskan,Jalaquduq,Marhamat,Oltinko‘l,Paxtaobod,Qo‘rg‘ontepa,Shahrixon,Ulug‘nor,Xo‘jaobod,Xonobod",
"Buxoro viloyati":"Olot,Buxoro,G‘ijduvon,Jondor,Kogon,Qorako‘l,Qorovulbozor,Peshku,Romitan,Shofirkon,Vobkent",
"Jizzax viloyati":"Arnasoy,Baxmal,Do‘stlik,Forish,G‘allaorol,Mirzacho‘l,Paxtakor,Sharof Rashidov,Yangiobod,Zafarobod,Zarbdor,Zomin,Jizzax",
"Qashqadaryo viloyati":"Chiroqchi,Dehqonobod,G‘uzor,Kasbi,Kitob,Ko‘kdala,Koson,Mirishkor,Muborak,Nishon,Qamashi,Qarshi,Shahrisabz,Yakkabog‘",
"Navoiy viloyati":"Karmana,Konimex,Navbahor,Nurota,Qiziltepa,Tomdi,Uchquduq,Xatirchi,Navoiy,Zarafshon,G‘ozg‘on",
"Namangan viloyati":"Chortoq,Chust,Kosonsoy,Mingbuloq,Namangan,Norin,Pop,To‘raqo‘rg‘on,Uchqo‘rg‘on,Uychi,Yangiqo‘rg‘on",
"Samarqand viloyati":"Bulung‘ur,Ishtixon,Jomboy,Kattaqo‘rg‘on,Narpay,Nurobod,Oqdaryo,Pastdarg‘om,Payariq,Paxtachi,Qo‘shrabot,Samarqand,Tayloq,Urgut",
"Sirdaryo viloyati":"Boyovut,Guliston,Mirzaobod,Oqoltin,Sardoba,Sayxunobod,Sirdaryo,Xovos,Yangiyer,Shirin",
"Surxondaryo viloyati":"Angor,Bandixon,Boysun,Denov,Jarqo‘rg‘on,Muzrabot,Oltinsoy,Qiziriq,Qumqo‘rg‘on,Sariosiyo,Sherobod,Sho‘rchi,Termiz,Uzun",
"Toshkent viloyati":"Bekobod,Bo‘stonliq,Bo‘ka,Zangiota,Oqqo‘rg‘on,Ohangaron,Parkent,Piskent,Qibray,Quyichirchiq,Toshkent,O‘rtachirchiq,Chinoz,Yuqorichirchiq,Yangiyo‘l,Angren,Chirchiq,Olmaliq,Nurafshon",
"Farg‘ona viloyati":"Bag‘dod,Beshariq,Buvayda,Dang‘ara,Farg‘ona,Furqat,Oltiariq,O‘zbekiston,Qo‘shtepa,Quva,Rishton,So‘x,Toshloq,Uchko‘prik,Yozyovon,Qo‘qon,Marg‘ilon,Quvasoy",
"Xorazm viloyati":"Bog‘ot,Gurlan,Hazorasp,Xiva,Xonqa,Qo‘shko‘pir,Shovot,Tuproqqal’a,Urganch,Yangiariq,Yangibozor",
"Toshkent shahri":"Bektemir,Chilonzor,Mirobod,Mirzo Ulug‘bek,Olmazor,Sergeli,Shayxontohur,Uchtepa,Yakkasaroy,Yangihayot,Yashnobod,Yunusobod"
};
const PLAT = ["Telegram","Instagram","YouTube","Facebook","TikTok","Veb-sayt"];
const J = (d, s = 200, h = {}) => new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store", ...h } });
const sha = x => crypto.createHash("sha256").update(String(x)).digest();
const eq = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));
const sign = p => crypto.createHmac("sha256", process.env.SESSION_SECRET).update(p).digest("base64url");
const authed = req => {
  const m = (req.headers.get("cookie") || "").match(/(?:^|; )s=([^;]+)/);
  if (!m || !process.env.SESSION_SECRET) return false;
  const [p, s] = m[1].split(".");
  return !!s && eq(s, sign(p)) && +p > Date.now();
};
const COOK = (v, age) => `s=${v}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${age}`;
const S = (v, n) => String(v ?? "").trim().slice(0, n);
const url = v => { v = S(v, 300); if (!v) return ""; try { const u = new URL(v); return /^https?:$/.test(u.protocol) ? u.href : null; } catch { return null; } };
const EMPTY = () => ({ coords: [], posts: [], hist: [], stats: {}, links: {}, joinUrl: "", dirs: [] });

async function mutate(store, fn) {
  for (let i = 0; i < 6; i++) {
    const r = await store.getWithMetadata("db", { type: "json" });
    const db = r?.data || EMPTY();
    const err = fn(db);
    if (err) return err;
    const w = await store.setJSON("db", db, r ? { onlyIfMatch: r.etag } : { onlyIfNew: true });
    if (w.modified) return null;
  }
  return "Band, qayta urinib ko‘ring";
}

export default async (req) => {
  const path = new URL(req.url).pathname.replace(/^\/api\/?/, "");
  const store = getStore("kelajak");
  const admin = authed(req);

  if (req.method === "GET" && path === "data") {
    const db = (await store.get("db", { type: "json" })) || EMPTY();
    const out = { coords: db.coords, stats: db.stats, links: db.links, joinUrl: db.joinUrl, dirs: db.dirs,
      posts: admin ? db.posts : db.posts.filter(p => p.pub).map(({ id, title, sum, body, date }) => ({ id, title, sum, body, date })),
      reg: REG, admin, t: Date.now() };
    if (admin) out.hist = db.hist;
    return J(out);
  }
  if (req.method !== "POST" || req.headers.get("x-req") !== "1" || !(req.headers.get("content-type") || "").includes("json")) return J({ e: "Ruxsat yo‘q" }, 403);
  if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) return J({ e: "Server sozlanmagan (ADMIN_PASSWORD, SESSION_SECRET)" }, 500);
  let b; try { b = await req.json(); } catch { return J({ e: "Noto‘g‘ri so‘rov" }, 400); }

  if (path === "login") {
    const ip = req.headers.get("x-nf-client-connection-ip") || "x", key = "rl-" + sha(ip).toString("hex").slice(0, 16);
    const rl = (await store.get(key, { type: "json" })) || { n: 0, t: 0 };
    if (rl.n >= 5 && Date.now() - rl.t < 9e5) return J({ e: "Juda ko‘p urinish. 15 daqiqadan so‘ng qayta urinib ko‘ring" }, 429);
    if (!eq(S(b.password, 200), process.env.ADMIN_PASSWORD)) {
      await store.setJSON(key, { n: Date.now() - rl.t < 9e5 ? rl.n + 1 : 1, t: Date.now() });
      await new Promise(r => setTimeout(r, 800));
      return J({ e: "Parol noto‘g‘ri" }, 401);
    }
    await store.delete(key);
    const p = String(Date.now() + 8 * 36e5);
    return J({ ok: 1 }, 200, { "set-cookie": COOK(p + "." + sign(p), 28800) });
  }
  if (path === "logout") return J({ ok: 1 }, 200, { "set-cookie": COOK("", 0) });
  if (!admin) return J({ e: "Kirish talab qilinadi" }, 401);
  if (path !== "op") return J({ e: "Topilmadi" }, 404);

  const err = await mutate(store, db => {
    const c = db.coords.find(x => x.id === b.id);
    const log = (x, type, delta, reason) => { db.hist.unshift({ t: Date.now(), id: x.id, name: x.name, type, delta, now: x.score, reason }); db.hist.length = Math.min(db.hist.length, 500); };
    switch (b.op) {
      case "addCoord": {
        const name = S(b.name, 80), region = S(b.region, 60), district = S(b.district, 60);
        if (name.length < 3) return "Ism-familiya kiriting";
        if (!REG[region]) return "Viloyatni tanlang";
        if (!district) return "Tuman/shaharni kiriting";
        const x = { id: crypto.randomUUID(), name, region, district, school: S(b.school, 100), dir: S(b.dir, 60), score: 0, manual: 0 };
        db.coords.push(x); log(x, "add", 0, "Koordinator qo‘shildi"); return;
      }
      case "delCoord": if (!c) return "Topilmadi"; db.coords = db.coords.filter(x => x !== c); db.hist.unshift({ t: Date.now(), id: c.id, name: c.name, type: "del", delta: 0, now: c.score, reason: "O‘chirildi" }); return;
      case "points": {
        const d = Number(b.delta);
        if (!c) return "Topilmadi";
        if (!Number.isInteger(d) || d === 0 || Math.abs(d) > 100000) return "Ball butun son bo‘lishi kerak (1–100000)";
        const old = c.score; c.score = Math.max(0, old + d);
        log(c, d > 0 ? "add" : "sub", c.score - old, S(b.reason, 200)); return;
      }
      case "level": {
        const l = Number(b.level); if (!c || !Number.isInteger(l) || l < 0 || l > 5) return "Noto‘g‘ri daraja";
        c.manual = l; log(c, "lvl", 0, l ? `Daraja qo‘lda: ${l}` : "Qo‘lda daraja olib tashlandi"); return;
      }
      case "post": {
        const title = S(b.title, 150); if (title.length < 3) return "Sarlavha kiriting";
        const p = db.posts.find(x => x.id === b.pid) || (db.posts.unshift({ id: crypto.randomUUID(), date: Date.now() }), db.posts[0]);
        Object.assign(p, { title, sum: S(b.sum, 300), body: S(b.body, 20000), pub: !!b.pub }); return;
      }
      case "delPost": db.posts = db.posts.filter(x => x.id !== b.pid); return;
      case "settings": {
        const st = {}; for (const k of ["students", "regions", "councils", "projects"]) { const v = S(b.stats?.[k], 9); if (v && !/^\d+$/.test(v)) return "Statistika faqat raqam bo‘lishi kerak"; st[k] = v; }
        const links = {}; for (const k of PLAT) { const u = url(b.links?.[k]); if (u === null) return `${k}: havola noto‘g‘ri (https://...)`; links[k] = u; }
        const j = url(b.joinUrl); if (j === null) return "Ariza havolasi noto‘g‘ri";
        db.stats = st; db.links = links; db.joinUrl = j;
        db.dirs = S(b.dirs, 2000).split(",").map(x => x.trim()).filter(Boolean).slice(0, 100); return;
      }
      default: return "Noma’lum amal";
    }
  });
  return err ? J({ e: err }, 400) : J({ ok: 1 });
};
export const config = { path: "/api/*" };
