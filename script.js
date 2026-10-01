(() => {
  "use strict";

  const body = document.body;
  const html = document.documentElement;
  const hero = document.querySelector(".hero");
  const heroBg = document.querySelector(".hero-bg");
  const glow = document.querySelector(".cursor-glow");
  const menuToggle = document.querySelector("#menuToggle");
  const mobileNav = document.querySelector("#mobileNav");
  const locationGate = document.querySelector("#locationGate");
  const locationClose = document.querySelector("#locationClose");
  const locationChoices = document.querySelectorAll(".location-choice");
  const selectedLocation = document.querySelector("#selectedLocation");
  const heroLocationChip = document.querySelector("#heroLocationChip");
  const selectedLocationText = document.querySelector("#selectedLocationText");
  const heroLocationText = document.querySelector("#heroLocationText");
  const bookingLinks = document.querySelectorAll(".booking-link");
  const locationCards = document.querySelectorAll(".location-card[data-location]");
  const STORAGE_KEY = "mysticLocation";

  const LOCATIONS = {
    ordzhonikidze: {
      short: "Орджоникидзе, 27",
      bookingHref: "tel:+79818015577",
      bookingText: "Позвонить",
      bookingTitle: "Позвонить и забронировать столик",
      hours: [
        ["Вс–Чт", "14:00 — 02:00"],
        ["Пт–Сб", "14:00 — 03:00"]
      ],
      hoursLine: "Вс–Чт 14:00 — 02:00 · Пт–Сб 14:00 — 03:00"
    },
    konstantinova: {
      short: "Академика Константинова, 1 к. 1",
      bookingHref: "https://yandex.ru/business/widget/request/company/185627883676",
      bookingText: "Забронировать",
      bookingTitle: "Открыть анкету на бронирование",
      hours: [
        ["Пн–Чт", "14:00 — 02:00"],
        ["Пт–Вс", "14:00 — 03:00"]
      ],
      hoursLine: "Пн–Чт 14:00 — 02:00 · Пт–Вс 14:00 — 03:00"
    }
  };

  function getStoredLocation(){
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  }
  function storeLocation(key){
    try { localStorage.setItem(STORAGE_KEY, key); } catch {}
  }

  function openLocationChooser(){
    locationGate?.classList.remove("is-hidden");
    locationGate?.setAttribute("aria-hidden", "false");
    body.classList.add("modal-open");
    document.querySelector(".location-choice")?.focus({preventScroll:true});
  }

  function closeLocationChooser(){
    locationGate?.classList.add("is-hidden");
    locationGate?.setAttribute("aria-hidden", "true");
    body.classList.remove("modal-open");
  }

  function setBookingLink(link, data){
    link.href = data.bookingHref;
    link.setAttribute("aria-label", `${data.bookingTitle} — ${data.short}`);
    if (data.bookingHref.startsWith("http")) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    } else {
      link.removeAttribute("target");
      link.removeAttribute("rel");
    }
    const firstText = [...link.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    if (firstText) firstText.textContent = data.bookingText + " ";
  }

  function setLocation(key, persist=true){
    const data = LOCATIONS[key];
    if (!data) return;
    html.dataset.location = key;
    if (selectedLocationText) selectedLocationText.textContent = data.short;
    if (heroLocationText) heroLocationText.textContent = data.short;
    locationCards.forEach(card => card.classList.toggle("active", card.dataset.location === key));
    bookingLinks.forEach(link => setBookingLink(link, data));

    const heroHoursDayOne = document.querySelector("#heroHoursDayOne");
    const heroHoursTimeOne = document.querySelector("#heroHoursTimeOne");
    const heroHoursDayTwo = document.querySelector("#heroHoursDayTwo");
    const heroHoursTimeTwo = document.querySelector("#heroHoursTimeTwo");
    if (heroHoursDayOne) heroHoursDayOne.textContent = data.hours[0][0];
    if (heroHoursTimeOne) heroHoursTimeOne.textContent = data.hours[0][1];
    if (heroHoursDayTwo) heroHoursDayTwo.textContent = data.hours[1][0];
    if (heroHoursTimeTwo) heroHoursTimeTwo.textContent = data.hours[1][1];
    const hoursLineText = document.querySelector("#hoursLineText");
    if (hoursLineText) hoursLineText.textContent = data.hoursLine;
    const footerHours = document.querySelector("#footerHours");
    if (footerHours) footerHours.textContent = data.hoursLine;
    if (persist) storeLocation(key);
    closeLocationChooser();
    // Re-run reveal observer for swapped location content.
    document.querySelectorAll(".atmo-set-" + key + " .reveal, .menu-set-" + key + " .reveal").forEach(el => el.classList.add("visible"));
  }

  locationChoices.forEach(choice => {
    choice.addEventListener("click", () => setLocation(choice.dataset.location));
  });
  locationClose?.addEventListener("click", closeLocationChooser);
  locationGate?.querySelector("[data-close-location]")?.addEventListener("click", closeLocationChooser);
  selectedLocation?.addEventListener("click", openLocationChooser);
  heroLocationChip?.addEventListener("click", openLocationChooser);
  document.querySelector("#mobileLocation")?.addEventListener("click", () => { mobileNav?.classList.remove("open"); menuToggle?.setAttribute("aria-expanded","false"); openLocationChooser(); });

  // Initial state: open chooser only when no selection exists.
  const saved = getStoredLocation();
  if (saved && LOCATIONS[saved]) setLocation(saved, false);
  else { html.dataset.location = "ordzhonikidze"; openLocationChooser(); }

  // Booking links: address first, then the selected destination. For calls, ask for confirmation.
  bookingLinks.forEach(link => link.addEventListener("click", e => {
    if (!getStoredLocation()) {
      e.preventDefault();
      openLocationChooser();
      return;
    }
    const currentLocation = html.dataset.location;
    if (currentLocation === "ordzhonikidze" && LOCATIONS[currentLocation].bookingHref.startsWith("tel:")) {
      e.preventDefault();
      if (window.confirm("Позвонить в Mystic Lounge по номеру 8 981 801-55-77?")) {
        window.location.href = LOCATIONS[currentLocation].bookingHref;
      }
    }
  }));

  // Phone number inside the address card keeps the number visible and uses the same confirmation dialog.
  document.querySelectorAll("[data-confirm-call]").forEach(link => link.addEventListener("click", e => {
    e.preventDefault();
    if (window.confirm("Позвонить в Mystic Lounge по номеру 8 981 801-55-77?")) {
      window.location.href = link.href;
    }
  }));

  // Mobile nav
  menuToggle?.addEventListener("click", () => {
    const open = mobileNav?.classList.toggle("open");
    body.classList.toggle("modal-open", !!open);
    menuToggle.setAttribute("aria-expanded", String(!!open));
  });
  mobileNav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => { mobileNav.classList.remove("open"); body.classList.remove("modal-open"); menuToggle?.setAttribute("aria-expanded","false"); }));

  // Smooth anchors
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener("click", e => {
    const id = link.getAttribute("href");
    const target = id && id.length > 1 ? document.querySelector(id) : null;
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({behavior:"smooth", block:"start"});
  }));

  // Cursor + hero parallax
  if (window.matchMedia("(pointer:fine)").matches) {
    window.addEventListener("mousemove", e => { if (glow) { glow.style.left=e.clientX+"px"; glow.style.top=e.clientY+"px"; } });
    hero?.addEventListener("mousemove", e => {
      const x=(e.clientX/window.innerWidth-.5)*8;
      const y=(e.clientY/window.innerHeight-.5)*6;
      if(heroBg) heroBg.style.transform=`scale(1.075) translate(${x}px,${y}px)`;
    });
    hero?.addEventListener("mouseleave",()=>{ if(heroBg) heroBg.style.transform=""; });
  } else if (glow) glow.style.display="none";

  // Reveal
  const revealItems=document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");revealObserver.unobserve(entry.target);}}),{threshold:.1});
    revealItems.forEach((el,i)=>{el.style.transitionDelay=`${Math.min(i%4,3)*60}ms`;revealObserver.observe(el);});
  } else revealItems.forEach(el=>el.classList.add("visible"));

  // Menu tabs, scoped to each location menu, with a real hide/show state and a soft transition.
  document.querySelectorAll(".menu-set").forEach(set=>{
    const tabs=set.querySelectorAll(".menu-tabs button");
    const cards=[...set.querySelectorAll("[data-category]")];
    const timers=new Map();

    const applyFilter = filter => {
      cards.forEach(card => {
        const show = filter === "all" || card.dataset.category === filter;
        const timer = timers.get(card);
        if (timer) clearTimeout(timer);

        if (show) {
          card.hidden = false;
          requestAnimationFrame(() => card.classList.remove("filter-hidden"));
        } else {
          card.classList.add("filter-hidden");
          timers.set(card, setTimeout(() => {
            if (card.classList.contains("filter-hidden")) card.hidden = true;
          }, 280));
        }
      });
    };

    tabs.forEach(tab=>tab.addEventListener("click",()=>{
      tabs.forEach(t=>{
        t.classList.remove("active");
        t.setAttribute("aria-pressed", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-pressed", "true");
      applyFilter(tab.dataset.filter || "all");
    }));

    const activeTab=set.querySelector(".menu-tabs button.active");
    if (activeTab) applyFilter(activeTab.dataset.filter || "all");
  });

  // Active desktop nav item based on scroll position.
  const sections=document.querySelectorAll("main section[id]");
  const navLinks=document.querySelectorAll(".desktop-nav a");
  if ("IntersectionObserver" in window) {
    const navObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      navLinks.forEach(link=>link.classList.toggle("active",link.getAttribute("href")===`#${entry.target.id}`));
    }),{rootMargin:"-35% 0px -55% 0px"});
    sections.forEach(section=>navObserver.observe(section));
  }
})();
