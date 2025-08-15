const API_KEY = "5e59f239dd4bcac18b1b2b599302714b";
const BASE = "https://api.openweathermap.org/data/2.5";

const el = (id) => document.getElementById(id);

const placeEl   = el("place");
const tempEl    = el("temp");
const clockEl   = el("clock");
const statusEl  = el("status");
const pressureEl= el("pressure");
const humidityEl= el("humidity");
const windEl    = el("wind");
const feelsEl   = el("feels");
const sunriseEl = el("sunrise");
const sunsetEl  = el("sunset");
const cardsEl   = el("cards");

const statusIconEl = document.getElementById("status-icon");
const statusTextEl = document.getElementById("status-text");

function setStatus(type = "info", text = ""){
    statusEl.classList.remove("status--loading","status--success","status--warning","status--error","status--info");
    statusEl.classList.add(`status--${type}`);

    const icons = {
        loading: "⏳",
        success: "✅",
        warning: "⚠️",
        error:   "✖️",
        info:    "ℹ️"
    };
    statusIconEl.textContent = icons[type] || icons.info;
    statusTextEl.textContent = text || "";
}

const searchForm = document.getElementById("search-form");
const cityInput  = document.getElementById("city-input");
const useLocBtn  = document.getElementById("use-location");

function tick(){
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    clockEl.textContent = `${hh}:${mm}`;
}
setInterval(tick, 1000);
tick();

const toKmH = (ms) => Math.round(ms * 3.6);
const fmtTime = (ts, tz) => {
    const d = new Date((ts + tz) * 1000);
    const hh = String(d.getUTCHours()).padStart(2,'0');
    const mm = String(d.getUTCMinutes()).padStart(2,'0');
    return `${hh}:${mm}`;
};

async function getCurrentByCity(city){
    const url = `${BASE}/weather?q=${encodeURIComponent(city)}&units=metric&lang=tr&appid=${API_KEY}`;
    const r = await fetch(url);
    if(!r.ok) throw new Error("Şehir Bulunamadı");
    return r.json();
}
async function getForecastByCity(city){
    const url = `${BASE}/forecast?q=${encodeURIComponent(city)}&units=metric&lang=tr&appid=${API_KEY}`;
    const r = await fetch(url);
    if(!r.ok) throw new Error("Tahmin Alınamadı");
    return r.json();
}
async function getCurrentByCoords(lat, lon){
    const url = `${BASE}/weather?lat=${lat}&lon=${lon}&units=metric&lang=tr&appid=${API_KEY}`;
    const r = await fetch(url);
    if(!r.ok) throw new Error("Konum Bilgisi Alınamadı");
    return r.json();
}
async function getForecastByCoords(lat, lon){
    const url = `${BASE}/forecast?lat=${lat}&lon=${lon}&units=metric&lang=tr&appid=${API_KEY}`;
    const r = await fetch(url);
    if(!r.ok) throw new Error("Konum Tahmini Alınamadı");
    return r.json();
}

function updateCurrent(data){
    const { name, sys, main, wind, timezone, weather } = data;
    placeEl.textContent = `${name}, ${sys.country}`;
    tempEl.textContent = `${Math.round(main.temp)}°`;
    pressureEl.textContent = `${Math.round(main.pressure)} hPa`;
    humidityEl.textContent = `%${Math.round(main.humidity)}`;
    windEl.textContent = `${toKmH(wind.speed)} km/s`;
    feelsEl.textContent = `${Math.round(main.feels_like)}°C`;
    sunriseEl.textContent = fmtTime(sys.sunrise, timezone);
    sunsetEl.textContent = fmtTime(sys.sunset, timezone);

    const desc = weather?.[0]?.description ?? "";
    const nice = desc ? desc.charAt(0).toUpperCase() + desc.slice(1) : "Güncellendi";
    setStatus("info", nice);
}

function iconKindFromOW(iconCode, desc=""){
    if (typeof iconCode === "string" && iconCode.length >= 2){
        const code = iconCode.slice(0,2);
        switch(code){
            case "01": return "clear";
            case "02": return "partly";
            case "03":
            case "04": return "cloudy";
            case "09":
            case "10": return "rain";
            case "11": return "storm";
            case "13": return "snow";
            case "50": return "mist";
        }
    }
    const s = (desc||"").toLowerCase();
    if (s.includes("Açık")) return "clear";
    if (s.includes("Parçalı Bulutlu")) return "partly";
    if (s.includes("Bulutlu")) return "cloudy";
    if (s.includes("Yağmurlu") || s.includes("sağanak")) return "rain";
    if (s.includes("Fırtınalı") || s.includes("şimşek")) return "storm";
    if (s.includes("Karlı")) return "snow";
    if (s.includes("Sisli") || s.includes("pus")) return "mist";
    return "cloudy";
}

function weatherIconSvg(kind="cloudy"){
    switch(kind){
        case "clear": return `
          <svg class="weather-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
            <circle cx="32" cy="32" r="12" fill="#fff" />
            <g stroke="rgba(255,255,255,0.9)" stroke-width="3" stroke-linecap="round">
              <line x1="32" y1="6" x2="32" y2="16"/><line x1="32" y1="48" x2="32" y2="58"/>
              <line x1="6" y1="32" x2="16" y2="32"/><line x1="48" y1="32" x2="58" y2="32"/>
              <line x1="13" y1="13" x2="20" y2="20"/><line x1="44" y1="44" x2="51" y2="51"/>
              <line x1="13" y1="51" x2="20" y2="44"/><line x1="44" y1="20" x2="51" y2="13"/>
            </g>
          </svg>`;
        case "partly": return `
          <svg class="weather-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
            <circle cx="24" cy="24" r="10" fill="#fff"/>
            <g fill="#fff">
              <ellipse cx="30" cy="40" rx="12" ry="8"/>
              <ellipse cx="44" cy="38" rx="10" ry="7"/>
              <rect x="22" y="40" width="26" height="8" rx="4"/>
            </g>
          </svg>`;
        case "cloudy": return `
          <svg class="weather-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
            <g fill="#fff">
              <ellipse cx="26" cy="38" rx="14" ry="10"/>
              <ellipse cx="42" cy="34" rx="12" ry="9"/>
              <rect x="20" y="38" width="30" height="10" rx="5"/>
            </g>
          </svg>`;
        case "rain": return `
          <svg class="weather-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
            <g fill="#fff">
              <ellipse cx="26" cy="28" rx="14" ry="10"/>
              <ellipse cx="42" cy="24" rx="12" ry="9"/>
              <rect x="20" y="28" width="30" height="10" rx="5"/>
            </g>
            <g fill="#9bd3ff">
              <path d="M24 44 l-2 6 a2 2 0 0 0 4 0 l-2 -6 Z"/>
              <path d="M32 46 l-2 6 a2 2 0 0 0 4 0 l-2 -6 Z"/>
              <path d="M40 44 l-2 6 a2 2 0 0 0 4 0 l-2 -6 Z"/>
            </g>
          </svg>`;
        case "storm": return `
          <svg class="weather-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
            <g fill="#fff">
              <ellipse cx="26" cy="28" rx="14" ry="10"/>
              <ellipse cx="42" cy="24" rx="12" ry="9"/>
              <rect x="20" y="28" width="30" height="10" rx="5"/>
            </g>
            <path d="M30 40 L24 52 H32 L28 60 L40 46 H32 L36 40 Z" fill="#ffd055"/>
          </svg>`;
        case "snow": return `
          <svg class="weather-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
            <g fill="#fff">
              <ellipse cx="26" cy="28" rx="14" ry="10"/>
              <ellipse cx="42" cy="24" rx="12" ry="9"/>
              <rect x="20" y="28" width="30" height="10" rx="5"/>
            </g>
            <g stroke="#cfe9ff" stroke-width="2" stroke-linecap="round">
              <line x1="24" y1="46" x2="24" y2="54"/><line x1="20" y1="50" x2="28" y2="50"/>
              <line x1="40" y1="46" x2="40" y2="54"/><line x1="36" y1="50" x2="44" y2="50"/>
            </g>
          </svg>`;
        case "mist": return `
          <svg class="weather-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
            <g fill="#fff">
              <ellipse cx="26" cy="24" rx="14" ry="10"/>
              <ellipse cx="42" cy="20" rx="12" ry="9"/>
              <rect x="20" y="24" width="30" height="10" rx="5"/>
            </g>
            <g stroke="rgba(255,255,255,0.85)" stroke-width="3" stroke-linecap="round">
              <line x1="14" y1="44" x2="50" y2="44"/>
              <line x1="18" y1="52" x2="46" y2="52"/>
            </g>
          </svg>`;
        default: return `
          <svg class="weather-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
            <g fill="#fff">
              <ellipse cx="26" cy="38" rx="14" ry="10"/>
              <ellipse cx="42" cy="34" rx="12" ry="9"/>
              <rect x="20" y="38" width="30" height="10" rx="5"/>
            </g>
          </svg>`;
    }
}

function updateForecast(data){
    const items = data.list.slice(0, 6).map((it) => {
        const date = new Date(it.dt * 1000);
        const hh = String(date.getHours()).padStart(2,'0');
        const title = `${hh}:00`;
        const desc = it.weather?.[0]?.description ?? "";
        const iconCode = it.weather?.[0]?.icon ?? "";
        const kind = iconKindFromOW(iconCode, desc);
        const icon = weatherIconSvg(kind);
        return `
      <article class="card">
        ${icon}
        <h4>${title}</h4>
        <p>${Math.round(it.main.temp)}°C • ${desc}</p>
      </article>
    `;
    });
    cardsEl.innerHTML = items.join("");
}

async function loadByCity(city){
    try{
        setStatus("loading","Yükleniyor...");
        const [cur, fc] = await Promise.all([ getCurrentByCity(city), getForecastByCity(city) ]);
        updateCurrent(cur);
        updateForecast(fc);
        setStatus("success","Güncellendi");
    }catch(err){
        console.error(err);
        setStatus("error", err.message || "Bir Hata Oluştu");
    }
}

async function loadByCoords(lat, lon){
    try{
        setStatus("loading","Konumdan Yükleniyor");
        const [cur, fc] = await Promise.all([ getCurrentByCoords(lat, lon), getForecastByCoords(lat, lon) ]);
        updateCurrent(cur);
        updateForecast(fc);
        setStatus("success","Güncellendi");
    }catch(err){
        console.error(err);
        setStatus("error", err.message || "Bir Hata Oluştu");
    }
}

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = cityInput.value.trim();
    if(!q) return;
    loadByCity(q);
});

useLocBtn.addEventListener("click", () => {
    if(!navigator.geolocation){
        setStatus("warning","Tarayıcınız Geolokasyon Desteklemiyor");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const { latitude, longitude } = pos.coords;
            loadByCoords(latitude, longitude);
        },
        (err) => {
            console.error(err);
            setStatus("error","Konum İzni Verilmedi");
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
});

loadByCity("İstanbul");