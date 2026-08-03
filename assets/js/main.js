/* 天辰洁能官网 — 交互脚本 */
(function () {
  "use strict";

  /* 导航栏滚动阴影 */
  const header = document.querySelector("header.site-header");
  if (header) {
    window.addEventListener("scroll", () => {
      header.classList.toggle("scrolled", window.scrollY > 10);
    }, { passive: true });
  }

  /* 移动端菜单 */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("nav.main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
    document.addEventListener("click", (e) => {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) nav.classList.remove("open");
    });
  }

  /* 首页 Banner 轮播 */
  const hero = document.querySelector(".hero");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".slide"));
    const dotsBox = hero.querySelector(".hero-dots");
    let cur = 0, timer = null;

    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.setAttribute("aria-label", "第" + (i + 1) + "张");
      b.addEventListener("click", () => go(i));
      dotsBox.appendChild(b);
    });
    const dots = Array.from(dotsBox.children);

    function go(i) {
      slides[cur].classList.remove("current");
      dots[cur].classList.remove("on");
      cur = (i + slides.length) % slides.length;
      slides[cur].classList.add("current");
      dots[cur].classList.add("on");
      restart();
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(() => go(cur + 1), 5200);
    }
    hero.querySelector(".hero-arrow.prev").addEventListener("click", () => go(cur - 1));
    hero.querySelector(".hero-arrow.next").addEventListener("click", () => go(cur + 1));
    slides[0].classList.add("current");
    dots[0].classList.add("on");
    restart();
  }

  /* 案例横滑 */
  document.querySelectorAll(".case-rail-outer").forEach((outer) => {
    const rail = outer.querySelector(".case-rail");
    const step = () => rail.firstElementChild
      ? rail.firstElementChild.getBoundingClientRect().width + 24 : 320;
    outer.querySelector(".rail-btn.prev")?.addEventListener("click", () =>
      rail.scrollBy({ left: -step(), behavior: "smooth" }));
    outer.querySelector(".rail-btn.next")?.addEventListener("click", () =>
      rail.scrollBy({ left: step(), behavior: "smooth" }));
  });

  /* 滚动显现 */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* 数字滚动 */
  const numIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      numIO.unobserve(el);
      const target = parseInt(el.dataset.count, 10);
      if (isNaN(target)) return;
      const dur = 1400, t0 = performance.now();
      (function tick(t) {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll("[data-count]").forEach((el) => numIO.observe(el));

  /* 案例详情图集：大图 + 缩略图条 */
  document.querySelectorAll("[data-viewer]").forEach((box) => {
    const main = box.querySelector(".cv-main");
    const cap = box.querySelector(".cv-cap");
    const cur = box.querySelector(".cv-count .cur");
    const strip = box.querySelector(".cv-thumbs");
    const thumbs = Array.from(box.querySelectorAll(".cv-thumb"));
    if (!thumbs.length) return;
    let i = 0;

    function show(n, scroll) {
      i = (n + thumbs.length) % thumbs.length;
      const t = thumbs[i];
      main.src = t.dataset.full;
      main.alt = t.querySelector("img").alt;
      if (cap) cap.textContent = t.dataset.cap || "";
      if (cur) cur.textContent = String(i + 1);
      thumbs.forEach((el) => el.classList.toggle("on", el === t));
      if (scroll !== false) {
        strip.scrollTo({
          left: t.offsetLeft - strip.clientWidth / 2 + t.clientWidth / 2,
          behavior: "smooth",
        });
      }
    }

    thumbs.forEach((t, n) => t.addEventListener("click", () => show(n)));
    box.querySelector(".cv-arrow.prev").addEventListener("click", () => show(i - 1));
    box.querySelector(".cv-arrow.next").addEventListener("click", () => show(i + 1));

    const page = () => strip.clientWidth * 0.85;
    box.querySelector(".cv-tbtn.prev").addEventListener("click", () =>
      strip.scrollBy({ left: -page(), behavior: "smooth" }));
    box.querySelector(".cv-tbtn.next").addEventListener("click", () =>
      strip.scrollBy({ left: page(), behavior: "smooth" }));

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") show(i - 1);
      if (e.key === "ArrowRight") show(i + 1);
    });

    /* 缩略图少于一屏时隐藏左右翻页按钮 */
    requestAnimationFrame(() => {
      if (strip.scrollWidth <= strip.clientWidth + 4)
        box.querySelectorAll(".cv-tbtn").forEach((b) => (b.style.display = "none"));
    });
  });

  /* 产品页：侧栏搜索过滤 + 分类高亮 */
  const prodSearch = document.getElementById("prodSearch");
  if (prodSearch) {
    const sections = Array.from(document.querySelectorAll(".prod-main .prod-section"));
    let empty = null;
    prodSearch.addEventListener("input", () => {
      const q = prodSearch.value.trim().toLowerCase();
      let hits = 0;
      sections.forEach((sec) => {
        let shown = 0;
        sec.querySelectorAll("[data-search]").forEach((card) => {
          const ok = !q || card.dataset.search.toLowerCase().includes(q);
          card.style.display = ok ? "" : "none";
          if (ok) shown++;
        });
        sec.style.display = shown ? "" : "none";
        hits += shown;
      });
      if (!empty) {
        empty = document.createElement("p");
        empty.className = "prod-empty";
        empty.textContent = "没有找到匹配的产品，请更换关键词，或直接致电 0757-82129245 咨询。";
        document.querySelector(".prod-main").appendChild(empty);
      }
      empty.style.display = hits ? "none" : "";
    });
  }

  const sideCats = Array.from(document.querySelectorAll(".side-cats a"));
  if (sideCats.length) {
    const targets = sideCats
      .map((a) => ({ a, sec: document.querySelector(a.getAttribute("href")) }))
      .filter((t) => t.sec);
    const mark = () => {
      const y = window.scrollY + 160;
      let cur = targets[0];
      targets.forEach((t) => { if (t.sec.offsetTop <= y) cur = t; });
      targets.forEach((t) => t.a.classList.toggle("on", t === cur));
    };
    window.addEventListener("scroll", mark, { passive: true });
    mark();
  }

  /* 表单占位提交 */
  document.querySelectorAll("form[data-demo]").forEach((f) => {
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("感谢您的留言！我们会尽快与您联系。\n（演示表单，后续接入邮件/后台服务）");
      f.reset();
    });
  });
})();
