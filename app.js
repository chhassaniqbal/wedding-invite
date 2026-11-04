const CONFIG = {
  couple: "Hamza & Anaya",
  whatsapp: "923000000000",
  countdownTo: "2026-12-12T19:30:00+05:00",
  events: {
    mehndi: { title: "Mehndi · Hamza & Anaya", start: "20261210T140000Z", end: "20261210T180000Z", place: "Siddiqui residence, Garden Town, Lahore" },
    barat: { title: "Barat & Nikah · Hamza & Anaya", start: "20261212T143000Z", end: "20261212T183000Z", place: "The Grand Pavilion, DHA Phase 6, Lahore" },
    walima: { title: "Walima · Hamza & Anaya", start: "20261213T150000Z", end: "20261213T180000Z", place: "The Grand Pavilion, DHA Phase 6, Lahore" }
  }
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove("show"), 2600);
}

function startDust() {
  const canvas = $("#dust");
  const context = canvas.getContext("2d");
  const particles = [];
  let width = 0;
  let height = 0;
  let running = true;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  resize();
  window.addEventListener("resize", resize);

  for (let index = 0; index < 90; index++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.4,
      speed: Math.random() * 0.35 + 0.08,
      drift: Math.random() * 0.6 - 0.3,
      phase: Math.random() * Math.PI * 2
    });
  }

  function frame(time) {
    if (!running) {
      return;
    }
    context.clearRect(0, 0, width, height);
    for (const particle of particles) {
      particle.y -= particle.speed;
      particle.x += Math.sin(time / 2000 + particle.phase) * 0.2 + particle.drift * 0.1;
      if (particle.y < -10) {
        particle.y = height + 10;
        particle.x = Math.random() * width;
      }
      const glow = 0.35 + 0.65 * Math.abs(Math.sin(time / 900 + particle.phase));
      context.beginPath();
      context.fillStyle = `rgba(241, 221, 160, ${glow * 0.8})`;
      context.shadowColor = "rgba(241, 221, 160, .9)";
      context.shadowBlur = 8;
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
  return () => {
    running = false;
  };
}

const Music = (() => {
  let context = null;
  let master = null;
  let reverb = null;
  let timer = null;
  let step = 0;
  let nextTime = 0;
  let playing = false;
  const beat = 60 / 64;
  const chords = [
    [62, 66, 69, 73],
    [59, 62, 66, 69],
    [55, 59, 62, 66],
    [57, 61, 64, 69]
  ];
  const pattern = [0, 1, 2, 3, 2, 1, 2, 3];

  function frequency(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  function makeReverb() {
    const length = context.sampleRate * 3.2;
    const buffer = context.createBuffer(2, length, context.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let index = 0; index < length; index++) {
        data[index] = (Math.random() * 2 - 1) * Math.pow(1 - index / length, 3);
      }
    }
    const convolver = context.createConvolver();
    convolver.buffer = buffer;
    return convolver;
  }

  function tone(note, time, duration, volume, type) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency(note);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(volume, time + (type === "sine" ? 0.9 : 0.015));
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(gain);
    gain.connect(master);
    gain.connect(reverb);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.1);
  }

  function schedule() {
    while (nextTime < context.currentTime + 0.4) {
      const chord = chords[Math.floor(step / 8) % chords.length];
      const note = chord[pattern[step % 8]] + 12;
      tone(note, nextTime, 2.2, 0.09, "triangle");
      if (step % 8 === 0) {
        for (const padNote of chord) {
          tone(padNote - 12, nextTime, beat * 8, 0.035, "sine");
        }
        tone(chord[0] - 24, nextTime, beat * 8, 0.05, "sine");
      }
      if (step % 16 === 6) {
        tone(chord[2] + 24, nextTime + beat / 4, 2.8, 0.03, "sine");
      }
      step += 1;
      nextTime += beat / 2;
    }
  }

  function start() {
    if (!context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        return false;
      }
      context = new AudioContextClass();
      master = context.createGain();
      master.gain.value = 0;
      reverb = makeReverb();
      const wet = context.createGain();
      wet.gain.value = 0.55;
      reverb.connect(wet);
      wet.connect(context.destination);
      master.connect(context.destination);
    }
    context.resume();
    nextTime = context.currentTime + 0.1;
    clearInterval(timer);
    timer = setInterval(schedule, 100);
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setTargetAtTime(0.9, context.currentTime, 1.2);
    playing = true;
    return true;
  }

  function stop() {
    if (!context) {
      return;
    }
    master.gain.setTargetAtTime(0, context.currentTime, 0.4);
    setTimeout(() => {
      clearInterval(timer);
      context.suspend();
    }, 900);
    playing = false;
  }

  return {
    start,
    stop,
    get playing() {
      return playing;
    }
  };
})();

function setMusicButton() {
  const button = $("#musicBtn");
  button.setAttribute("aria-pressed", String(Music.playing));
  button.setAttribute("aria-label", Music.playing ? "Pause music" : "Play music");
}

function openInvitation(stopDust) {
  const seal = $("#seal");
  seal.disabled = true;
  if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission().catch(() => {});
  }
  Music.start();
  setMusicButton();

  const envelope = $("#envelope");
  const flap = $(".env-flap");
  const letter = $(".letter");
  const gate = $("#gate");

  const finish = () => {
    gate.remove();
    stopDust();
    document.body.classList.remove("locked");
    document.body.classList.add("opened");
    window.dispatchEvent(new Event("invite:open"));
    if (window.ScrollTrigger) {
      ScrollTrigger.refresh();
    }
    heroIntro();
  };

  if (reduceMotion || !window.gsap) {
    finish();
    return;
  }

  const stage = $("#scene3d");
  const flash = $("#flash");
  const halves = $$(".seal-half");
  envelope.style.animation = "none";
  $(".env-shadow").style.animation = "none";
  gsap.set(flap, { z: 3, rotationX: 0 });

  const timeline = gsap.timeline({ onComplete: finish });
  timeline
    .to(envelope, { rotationX: 0, rotationY: 0, y: 0, duration: 0.6, ease: "power2.out" })
    .to(seal, { scale: 0.9, duration: 0.16, ease: "power2.in" }, 0)
    .call(() => burst(seal))
    .to(halves[0], { x: -46, y: 70, rotation: -38, opacity: 0, duration: 0.9, ease: "power2.in" })
    .to(halves[1], { x: 46, y: 70, rotation: 38, opacity: 0, duration: 0.9, ease: "power2.in" }, "<")
    .to(".gate-hint, .gate-kicker, .gate-sound, .gate-bism", { opacity: 0, duration: 0.5 }, "<")
    .to(flap, { rotationX: 180, duration: 1.2, ease: "power3.inOut" }, "-=0.55")
    .set(flap, { z: -2, zIndex: 0 })
    .to(letter, { yPercent: -66, duration: 1.2, ease: "power3.out" }, "-=0.35")
    .to(stage, {
      duration: 1.5,
      ease: "power3.in",
      scale: 7,
      x: () => stageShift(stage, letter).x,
      y: () => stageShift(stage, letter).y,
      onStart: () => {
        const shift = stageShift(stage, letter);
        gsap.set(stage, { transformOrigin: `${shift.originX}px ${shift.originY}px` });
      }
    }, "+=0.35")
    .to(".gate-arch", { scale: 1.6, opacity: 0, duration: 1.4, ease: "power2.in" }, "<")
    .to(flash, { opacity: 1, duration: 0.6, ease: "power2.in" }, "-=0.55")
    .set(stage, { opacity: 0 })
    .to(gate, { opacity: 0, duration: 1, ease: "power2.out" }, "+=0.05");
}

function stageShift(stage, letter) {
  const stageRect = stage.getBoundingClientRect();
  const letterRect = letter.getBoundingClientRect();
  const centerX = letterRect.left + letterRect.width / 2;
  const centerY = letterRect.top + letterRect.height / 2;
  return {
    originX: centerX - stageRect.left,
    originY: centerY - stageRect.top,
    x: window.innerWidth / 2 - centerX,
    y: window.innerHeight / 2 - centerY
  };
}

function burst(origin) {
  const rect = origin.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  for (let index = 0; index < 34; index++) {
    const spark = document.createElement("span");
    spark.className = "burst";
    spark.style.left = `${centerX}px`;
    spark.style.top = `${centerY}px`;
    spark.style.position = "fixed";
    const size = 2 + Math.random() * 5;
    spark.style.width = `${size}px`;
    spark.style.height = `${size}px`;
    document.body.appendChild(spark);
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 150;
    gsap.to(spark, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 30,
      opacity: 0,
      scale: 0.3,
      duration: 0.9 + Math.random() * 0.8,
      ease: "power3.out",
      onComplete: () => spark.remove()
    });
  }
}

function setupGuestName() {
  const guest = new URLSearchParams(location.search).get("to");
  if (guest && guest.trim()) {
    $("#guestName").textContent = guest.trim().slice(0, 40);
  }
}

function heroIntro() {
  if (reduceMotion || !window.gsap) {
    return;
  }
  gsap.from(".hero-copy > *", {
    y: 50,
    opacity: 0,
    rotationX: -40,
    transformPerspective: 800,
    transformOrigin: "50% 100%",
    duration: 1.6,
    ease: "expo.out",
    stagger: 0.14,
    delay: 0.2
  });
}

function setupLanguage() {
  const button = $("#langBtn");
  let urdu = false;
  button.addEventListener("click", () => {
    urdu = !urdu;
    document.documentElement.classList.toggle("ur-on", urdu);
    for (const element of $$("[data-ur]")) {
      if (!element.dataset.en) {
        element.dataset.en = element.innerHTML;
      }
      element.innerHTML = urdu ? element.dataset.ur : element.dataset.en;
      element.setAttribute("dir", urdu ? "rtl" : "ltr");
      element.setAttribute("lang", urdu ? "ur" : "en");
    }
    button.textContent = urdu ? "EN" : "اردو";
    button.style.fontFamily = urdu ? "var(--f-label)" : "";
  });
}

function setupTilt() {
  const card = $("#tiltCard");
  if (!card || reduceMotion) {
    return;
  }
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  window.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - (rect.left + rect.width / 2)) / window.innerWidth;
    const y = (event.clientY - (rect.top + rect.height / 2)) / window.innerHeight;
    targetX = Math.max(-1, Math.min(1, x * 2));
    targetY = Math.max(-1, Math.min(1, y * 2));
  });

  window.addEventListener("deviceorientation", (event) => {
    if (event.gamma == null) {
      return;
    }
    targetX = Math.max(-1, Math.min(1, event.gamma / 25));
    targetY = Math.max(-1, Math.min(1, (event.beta - 45) / 25));
  });

  function frame() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    card.style.transform = `rotateY(${currentX * 14}deg) rotateX(${-currentY * 12}deg) translateZ(0)`;
    card.style.setProperty("--gx", `${50 + currentX * 40}%`);
    card.style.setProperty("--gy", `${30 + currentY * 30}%`);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function setupCarousel() {
  const stage = $("#carouselStage");
  const ring = $("#carousel");
  const figures = $$("#carousel figure");
  const count = figures.length;
  const step = 360 / count;
  let angle = 0;
  let velocity = 0;
  let dragging = false;
  let lastX = 0;

  function layout() {
    const width = ring.clientWidth;
    const radius = Math.round((width / 2) / Math.tan(Math.PI / count) * 1.18);
    figures.forEach((figure, index) => {
      figure.style.transform = `rotateY(${index * step}deg) translateZ(${radius}px)`;
    });
    ring.dataset.radius = radius;
  }

  layout();
  window.addEventListener("resize", layout);

  stage.addEventListener("pointerdown", (event) => {
    dragging = true;
    lastX = event.clientX;
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener("pointermove", (event) => {
    if (!dragging) {
      return;
    }
    const delta = event.clientX - lastX;
    lastX = event.clientX;
    velocity = delta * 0.25;
    angle += velocity;
  });
  const release = () => {
    dragging = false;
  };
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);

  function frame() {
    if (!dragging) {
      velocity *= 0.95;
      angle += velocity + (reduceMotion ? 0 : -0.12);
    }
    const radius = Number(ring.dataset.radius || 300);
    ring.style.transform = `translateZ(${-radius}px) rotateX(-6deg) rotateY(${angle}deg)`;
    figures.forEach((figure, index) => {
      const facing = Math.cos(((index * step + angle) * Math.PI) / 180);
      figure.style.filter = `brightness(${0.45 + 0.55 * Math.max(0, facing)})`;
    });
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function setupCountdown() {
  const target = new Date(CONFIG.countdownTo).getTime();
  const cells = {
    d: $('[data-unit="d"]'),
    h: $('[data-unit="h"]'),
    m: $('[data-unit="m"]'),
    s: $('[data-unit="s"]')
  };
  const last = {};

  function render(key, value) {
    const text = String(value).padStart(2, "0");
    if (last[key] === text) {
      return;
    }
    last[key] = text;
    const cell = cells[key];
    const old = cell.querySelector("span:not(.out)");
    const next = document.createElement("span");
    next.textContent = text;
    if (old && !reduceMotion) {
      old.classList.add("out");
      setTimeout(() => old.remove(), 360);
      next.classList.add("in");
    } else if (old) {
      old.remove();
    }
    cell.appendChild(next);
  }

  function tick() {
    const remaining = Math.max(0, target - Date.now());
    const seconds = Math.floor(remaining / 1000);
    render("d", Math.floor(seconds / 86400));
    render("h", Math.floor((seconds % 86400) / 3600));
    render("m", Math.floor((seconds % 3600) / 60));
    render("s", seconds % 60);
  }

  tick();
  setInterval(tick, 1000);
}

function setupEvents() {
  for (const card of $$("[data-flip]")) {
    card.addEventListener("click", (event) => {
      if (event.target.closest("a, button")) {
        return;
      }
      card.classList.toggle("flipped");
    });
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", "Show event details");
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        card.classList.toggle("flipped");
      }
    });
  }
}

function downloadCalendar(key) {
  const event = CONFIG.events[key];
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invitation//EN",
    "BEGIN:VEVENT",
    `UID:${key}-${event.start}@wedding-invite`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART:${event.start}`,
    `DTEND:${event.end}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.place}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${event.title} is tomorrow`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${key}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 2000);
  toast("Added to your calendar file");
}

function setupCalendar() {
  for (const button of $$("[data-ics]")) {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      downloadCalendar(button.dataset.ics);
    });
  }
}

function setupShare() {
  $("#shareBtn").addEventListener("click", async () => {
    const data = { title: `${CONFIG.couple} · Wedding`, text: "You are invited to our wedding", url: location.href };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch (error) {
        return;
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(location.href);
      toast("Invitation link copied");
    } catch (error) {
      toast(location.href);
    }
  });
}

function setupRsvp() {
  const form = $("#rsvpForm");
  const count = $("#gCount");
  let guests = 1;

  const updateGuests = (value) => {
    guests = Math.max(1, Math.min(10, value));
    count.textContent = guests;
  };
  $("#gMinus").addEventListener("click", () => updateGuests(guests - 1));
  $("#gPlus").addEventListener("click", () => updateGuests(guests + 1));

  const syncAttendance = () => {
    const attending = $("#rYes").checked;
    $("#evField").classList.toggle("dim", !attending);
    $("#guestField").classList.toggle("dim", !attending);
  };
  $("#rYes").addEventListener("change", syncAttendance);
  $("#rNo").addEventListener("change", syncAttendance);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $("#rName").value.trim();
    const error = $("#nameErr");
    if (!name) {
      error.hidden = false;
      $("#rName").focus();
      return;
    }
    error.hidden = true;
    const attending = $("#rYes").checked;
    const evenings = $$("#evField input:checked").map((input) => input.value);
    const dua = $("#rMsg").value.trim();
    const lines = [
      "Assalam-o-Alaikum!",
      `RSVP for the wedding of ${CONFIG.couple}`,
      "",
      `Name: ${name}`,
      attending ? "Reply: Joyfully accept" : "Reply: Regretfully decline"
    ];
    if (attending) {
      lines.push(`Evenings: ${evenings.length ? evenings.join(", ") : "To be confirmed"}`);
      lines.push(`Guests: ${guests}`);
    }
    if (dua) {
      lines.push("", `Dua: ${dua}`);
    }
    window.location.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
  });
}

function setupReveals() {
  if (reduceMotion || !window.gsap || !window.ScrollTrigger) {
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  for (const element of $$(".reveal")) {
    gsap.from(element, {
      y: 70,
      opacity: 0,
      rotationX: -22,
      transformPerspective: 900,
      transformOrigin: "50% 100%",
      duration: 1.3,
      ease: "expo.out",
      scrollTrigger: { trigger: element, start: "top 90%" }
    });
  }
  gsap.to(".venue-photo img", {
    yPercent: -18,
    ease: "none",
    scrollTrigger: { trigger: ".venue-photo", scrub: true }
  });
  gsap.to(".arch img", {
    yPercent: -8,
    ease: "none",
    scrollTrigger: { trigger: ".arch", scrub: true }
  });
}

function setupMusicButton() {
  $("#musicBtn").addEventListener("click", () => {
    if (Music.playing) {
      Music.stop();
    } else {
      Music.start();
    }
    setMusicButton();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && Music.playing) {
      Music.stop();
      setMusicButton();
    }
  });
}

setupGuestName();
const stopDust = startDust();
$("#seal").addEventListener("click", () => openInvitation(stopDust));
if (new URLSearchParams(location.search).has("open")) {
  $("#gate").remove();
  stopDust();
  document.body.classList.remove("locked");
  document.body.classList.add("opened");
  window.dispatchEvent(new Event("invite:open"));
}
setupLanguage();
setupTilt();
setupCarousel();
setupCountdown();
setupEvents();
setupCalendar();
setupShare();
setupRsvp();
setupReveals();
setupMusicButton();
