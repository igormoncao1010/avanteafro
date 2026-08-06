const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector("#main-nav");

menuButton?.addEventListener("click", () => {
  const open = navigation.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

document.querySelector(".join-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = event.currentTarget.querySelector(".form-success");
  message.hidden = false;
});

const revealElements = Array.from(document.querySelectorAll(
    ".manifesto-grid > *, .pillar, .commitments-head > *, .commitment-item, .candidate-media, .candidate-copy, .profiles-head > *, .profile-card, .afro-president-media, .afro-president-copy, .df-leadership-copy, .df-leadership-media, .df-map-head > *, .df-map-canvas, .df-ra-panel, .training-art, .training-copy, .join-copy, .join-form, .news-head > *, .news-card"
));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

revealElements.forEach((element, index) => {
  element.classList.add("scroll-reveal");
  element.style.setProperty("--reveal-delay", `${(index % 3) * 90}ms`);
    if (element.matches(".candidate-media, .afro-president-media, .df-leadership-copy, .training-art, .join-copy")) element.classList.add("reveal-left");
    if (element.matches(".candidate-copy, .afro-president-copy, .df-leadership-media, .training-copy, .join-form")) element.classList.add("reveal-right");
});

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8%" });
  revealElements.forEach((element) => revealObserver.observe(element));
}

const dfPopulations = [
  ["Água Quente",11306],["Arapoanga",49067],["Arniqueira",44774],["Brazlândia",41859],["Candangolândia",14540],["Ceilândia",287113],["Cruzeiro",26435],["Fercal",9141],["Gama",133948],["Guará",127952],["Itapoã",67021],["Jardim Botânico",75133],["Lago Norte",43817],["Lago Sul",27213],["Núcleo Bandeirante",22566],["Paranoá",55551],["Park Way",22667],["Planaltina",121856],["Plano Piloto",207996],["Recanto das Emas",105862],["Riacho Fundo",41040],["Riacho Fundo II",70180],["Samambaia",227118],["Santa Maria",121635],["SCIA",38047],["SIA",5630],["Sobradinho",70608],["Sobradinho II",79932],["Sol Nascente e Pôr do Sol",108713],["Sudoeste/Octogonal",46004],["São Sebastião",99050],["Taguatinga",201332],["Varjão",9017],["Vicente Pires",105062],["Águas Claras",141872]
];
const normalizeRa = (name) => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9]/gi, "").toUpperCase();
const populationMap = new Map(dfPopulations.map(([name, population]) => [normalizeRa(name), population]));
const displayMap = new Map(dfPopulations.map(([name]) => [normalizeRa(name), name]));
const mapCanvas = document.querySelector(".df-map-canvas");
const raList = document.querySelector(".df-ra-list");
const raSearch = document.querySelector("#ra-search");
let selectedRa = "Ceilândia";
let raPaths = [];
const populationFor = (name) => name.toUpperCase().includes("SOL NASCENTE") ? 108713 : populationMap.get(normalizeRa(name)) || 0;
const displayFor = (name) => name.toUpperCase().includes("SOL NASCENTE") ? "Sol Nascente e Pôr do Sol" : displayMap.get(normalizeRa(name)) || name;

function selectRa(name) {
  selectedRa = name;
  const population = populationMap.get(normalizeRa(name)) || 0;
  mapCanvas?.querySelector(".df-map-selection strong").replaceChildren(name);
  mapCanvas?.querySelector(".df-map-selection b").replaceChildren(population.toLocaleString("pt-BR"));
  raPaths.forEach((path) => path.classList.toggle("active", normalizeRa(path.dataset.name) === normalizeRa(name)));
  raList?.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button.dataset.name === name));
}

function renderRaList(filter = "") {
  if (!raList) return;
  raList.replaceChildren();
  dfPopulations.filter(([name]) => normalizeRa(name).includes(normalizeRa(filter))).forEach(([name, population]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.name = name;
    button.innerHTML = `<span>${name}</span><b>${population.toLocaleString("pt-BR")}</b>`;
    button.addEventListener("click", () => selectRa(name));
    button.classList.toggle("active", name === selectedRa);
    raList.appendChild(button);
  });
}
renderRaList();
raSearch?.addEventListener("input", (event) => renderRaList(event.target.value));

Promise.resolve(window.DF_REGIOES).then((data) => {
  if (!data) throw new Error("Dados geográficos não disponíveis");
  if (!mapCanvas) return;
  const features = data.features || [];
  const points = features.flatMap((feature) => {
    const polygons = feature.geometry.type === "MultiPolygon" ? feature.geometry.coordinates : [feature.geometry.coordinates];
    return polygons.flat(2);
  });
  const bounds = points.reduce((box, [x,y]) => ({ minX: Math.min(box.minX,x), maxX: Math.max(box.maxX,x), minY: Math.min(box.minY,y), maxY: Math.max(box.maxY,y) }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
  const width = 860, height = 600, pad = 18;
  const scale = Math.min((width-pad*2)/(bounds.maxX-bounds.minX),(height-pad*2)/(bounds.maxY-bounds.minY));
  const offsetX = (width-(bounds.maxX-bounds.minX)*scale)/2, offsetY = (height-(bounds.maxY-bounds.minY)*scale)/2;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 860 600"); svg.setAttribute("role", "img"); svg.setAttribute("aria-labelledby", "df-map-title");
  features.forEach((feature) => {
    const rawName = feature.properties.ra_nome, name = displayFor(rawName);
    const polygons = feature.geometry.type === "MultiPolygon" ? feature.geometry.coordinates : [feature.geometry.coordinates];
    const d = polygons.map((polygon) => polygon.map((ring) => ring.map(([x,y], index) => `${index ? "L" : "M"}${(offsetX+(x-bounds.minX)*scale).toFixed(1)},${(offsetY+(bounds.maxY-y)*scale).toFixed(1)}`).join(" ")+" Z").join(" ")).join(" ");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d); path.setAttribute("tabindex", "0"); path.setAttribute("role", "button"); path.setAttribute("class", "ra-shape"); path.dataset.name = name;
    path.setAttribute("aria-label", `${name}: ${populationFor(rawName).toLocaleString("pt-BR")} habitantes`);
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title"); title.textContent = `${name} — ${populationFor(rawName).toLocaleString("pt-BR")} habitantes`; path.appendChild(title);
    path.addEventListener("click", () => selectRa(name)); path.addEventListener("focus", () => selectRa(name));
    svg.appendChild(path);
  });
  mapCanvas.querySelector(".map-loading")?.remove();
  mapCanvas.prepend(svg); raPaths = Array.from(svg.querySelectorAll("path")); selectRa(selectedRa);
}).catch(() => { const loading = mapCanvas?.querySelector(".map-loading"); if (loading) loading.textContent = "Não foi possível carregar o mapa."; });
