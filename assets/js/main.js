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

  /* 表单占位提交 */
  document.querySelectorAll("form[data-demo]").forEach((f) => {
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("感谢您的留言！我们会尽快与您联系。\n（演示表单，后续接入邮件/后台服务）");
      f.reset();
    });
  });
})();
