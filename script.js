// ============================================================
// AIRBNB INTELLIGENCE · NYC ROOM TYPE PREDICTOR
// ADVANCED FRONTEND ARCHITECTURE & 3D INTERACTION ENGINE
// ============================================================

// ============================================================
// 1. CONFIG & API INTEGRATION (PRESERVED)
// ============================================================
const API_BASE_URL = "http://127.0.0.1:8000";
const PREDICT_ENDPOINT = `${API_BASE_URL}/predict`;
const HEALTH_ENDPOINT = `${API_BASE_URL}/`;

const REDUCE_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Model Classes with architectural and visual definitions
const ROOM_CLASSES = [
  {
    key: "Entire home/apt",
    label: "Entire home/apt",
    subtitle: "Private Residence",
    desc: "Complete apartment or townhouse with full exclusive privacy.",
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    rows: 6,
    cols: 2,
    height: "100%",
  },
  {
    key: "Private room",
    label: "Private room",
    subtitle: "Dedicated Suite",
    desc: "Individual private bedroom inside a hosted home or loft.",
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
    rows: 4,
    cols: 2,
    height: "70%",
  },
  {
    key: "Shared room",
    label: "Shared room",
    subtitle: "Urban Co-living",
    desc: "Communal sleeping quarters or shared creative space.",
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    rows: 2,
    cols: 2,
    height: "45%",
  },
];

// Curated realistic NYC listings representing diverse archetypes
const EXAMPLES = [
  {
    name: "Midtown Manhattan Penthouse",
    latitude: 40.7580,
    longitude: -73.9855,
    price: 320,
    minimum_nights: 3,
    number_of_reviews: 148,
    reviews_per_month: 2.85,
    calculated_host_listings_count: 2,
    availability_365: 275,
    neighbourhood_group: "Manhattan",
    neighbourhood: "Midtown",
  },
  {
    name: "Bed-Stuy Brooklyn Private Suite",
    latitude: 40.6872,
    longitude: -73.9418,
    price: 68,
    minimum_nights: 2,
    number_of_reviews: 94,
    reviews_per_month: 2.10,
    calculated_host_listings_count: 1,
    availability_365: 180,
    neighbourhood_group: "Brooklyn",
    neighbourhood: "Bedford-Stuyvesant",
  },
  {
    name: "Flushing Queens Urban Studio",
    latitude: 40.7605,
    longitude: -73.8310,
    price: 42,
    minimum_nights: 1,
    number_of_reviews: 52,
    reviews_per_month: 1.35,
    calculated_host_listings_count: 4,
    availability_365: 310,
    neighbourhood_group: "Queens",
    neighbourhood: "Flushing",
  },
  {
    name: "Bushwick Co-Living Bunk",
    latitude: 40.6942,
    longitude: -73.9214,
    price: 18,
    minimum_nights: 1,
    number_of_reviews: 35,
    reviews_per_month: 1.80,
    calculated_host_listings_count: 6,
    availability_365: 360,
    neighbourhood_group: "Brooklyn",
    neighbourhood: "Bushwick",
  },
];

let currentExampleIdx = 0;

// ============================================================
// 2. THREE.JS 3D NYC SKYLINE & SPATIAL ENVIRONMENT
// ============================================================
class NYCSkylineScene {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    // Graceful WebGL check
    if (!this.hasWebGL()) {
      console.warn("WebGL not available. Falling back to CSS ambient skyline.");
      this.canvas.style.display = "none";
      return;
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.buildingGroup = null;
    this.particleSystem = null;
    this.beaconGroup = null;

    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;

    this.init();
  }

  hasWebGL() {
    try {
      const glCanvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (glCanvas.getContext("webgl") || glCanvas.getContext("experimental-webgl"))
      );
    } catch {
      return false;
    }
  }

  init() {
    if (typeof THREE === "undefined") {
      console.warn("Three.js not loaded. Skipping 3D initialization.");
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070B17, 0.0035);

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 1200);
    this.camera.position.set(0, 75, 230);
    this.camera.lookAt(0, 30, 0);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x10172A, 1.8);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00E5FF, 1.2);
    dirLight1.position.set(100, 150, 80);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x925CFF, 1.4);
    dirLight2.position.set(-120, 100, -50);
    this.scene.add(dirLight2);

    // 5. Build components
    this.buildGroundGrid();
    this.buildCitySkyline();
    this.buildDataBeacons();
    this.buildFloatingParticles();

    // 6. Event listeners
    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener("mousemove", this.onMouseMove.bind(this));

    // 7. Start render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  buildGroundGrid() {
    // Cybernetic coordinate grid plane
    const gridHelper = new THREE.GridHelper(500, 50, 0x00E5FF, 0x1E2A4A);
    gridHelper.position.y = -1;
    gridHelper.material.opacity = 0.25;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);
  }

  buildCitySkyline() {
    this.buildingGroup = new THREE.Group();

    // Materials
    const buildingMaterial = new THREE.MeshLambertMaterial({
      color: 0x0A0F22,
      emissive: 0x060B18,
      reflectivity: 0.8,
    });

    const edgeCyan = new THREE.LineBasicMaterial({
      color: 0x00E5FF,
      transparent: true,
      opacity: 0.35,
    });

    const edgeViolet = new THREE.LineBasicMaterial({
      color: 0x925CFF,
      transparent: true,
      opacity: 0.3,
    });

    // Procedural NYC-like layout with grid clusters
    const buildingCount = 42;
    const spread = 280;

    for (let i = 0; i < buildingCount; i++) {
      const w = 10 + Math.random() * 16;
      const d = 10 + Math.random() * 16;
      const h = 25 + Math.random() * 95;

      const geom = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geom, buildingMaterial);

      // Grid-aligned positions with slight noise
      const gridX = ((i % 8) - 3.5) * 32 + (Math.random() - 0.5) * 8;
      const gridZ = (Math.floor(i / 8) - 2.5) * 30 - 30 + (Math.random() - 0.5) * 8;

      mesh.position.set(gridX, h / 2, gridZ);
      this.buildingGroup.add(mesh);

      // Neon outline edges
      const edgesGeom = new THREE.EdgesGeometry(geom);
      const edgeMat = Math.random() > 0.4 ? edgeCyan : edgeViolet;
      const wireframe = new THREE.LineSegments(edgesGeom, edgeMat);
      mesh.add(wireframe);

      // Add spires or rooftop structures to taller buildings
      if (h > 65 && Math.random() > 0.3) {
        const spireHeight = 12 + Math.random() * 20;
        const spireGeom = new THREE.ConeGeometry(1.5, spireHeight, 4);
        const spireMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF });
        const spire = new THREE.Mesh(spireGeom, spireMat);
        spire.position.set(0, h / 2 + spireHeight / 2, 0);
        mesh.add(spire);

        // Beacon light dot
        const beaconGeom = new THREE.SphereGeometry(0.8, 8, 8);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xFF0055 });
        const beacon = new THREE.Mesh(beaconGeom, beaconMat);
        beacon.position.set(0, spireHeight / 2, 0);
        spire.add(beacon);
      }
    }

    this.scene.add(this.buildingGroup);
  }

  buildDataBeacons() {
    this.beaconGroup = new THREE.Group();

    // Floating spherical beacons representing NYC listings
    const beaconCoords = [
      { x: -50, y: 55, z: -10, color: 0x00E5FF },
      { x: 20, y: 70, z: -40, color: 0x925CFF },
      { x: 65, y: 48, z: 15, color: 0x397BFF },
      { x: -80, y: 40, z: 30, color: 0x00E5FF },
      { x: -10, y: 85, z: -60, color: 0x925CFF },
    ];

    beaconCoords.forEach((b) => {
      const geom = new THREE.SphereGeometry(1.8, 16, 16);
      const mat = new THREE.MeshBasicMaterial({ color: b.color });
      const sphere = new THREE.Mesh(geom, mat);
      sphere.position.set(b.x, b.y, b.z);

      // Outer glowing ring
      const ringGeom = new THREE.RingGeometry(2.8, 3.4, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: b.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2;
      sphere.add(ring);

      this.beaconGroup.add(sphere);
    });

    this.scene.add(this.beaconGroup);
  }

  buildFloatingParticles() {
    const particleCount = 280;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 350;
      positions[i * 3 + 1] = Math.random() * 150;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300;
      scales[i] = Math.random() * 2 + 1;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("scale", new THREE.BufferAttribute(scales, 1));

    const material = new THREE.PointsMaterial({
      color: 0x00E5FF,
      size: 1.8,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }

  onMouseMove(e) {
    if (REDUCE_MOTION) return;
    this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  onResize() {
    if (!this.camera || !this.renderer) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(this.animate);

    if (REDUCE_MOTION) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    // Smooth lerp mouse parallax
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.035;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.035;

    this.camera.position.x = this.mouseX * 35;
    this.camera.position.y = 75 - this.mouseY * 20;
    this.camera.lookAt(0, 32, 0);

    // Rotate beacons subtly
    if (this.beaconGroup) {
      this.beaconGroup.children.forEach((beacon, i) => {
        beacon.position.y += Math.sin(Date.now() * 0.002 + i) * 0.03;
      });
    }

    // Drift particles gently upward
    if (this.particleSystem) {
      const positions = this.particleSystem.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.08;
        if (positions[i] > 150) positions[i] = 0;
      }
      this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Ambient Background Window Twinkle fallback
function buildSkylineLightsFallback() {
  const container = document.getElementById("skylineBg");
  if (!container || REDUCE_MOTION) return;

  const count = 36;
  for (let i = 0; i < count; i++) {
    const light = document.createElement("div");
    light.className = "window-light";
    const size = Math.random() < 0.5 ? 2 : 3;
    light.style.width = `${size}px`;
    light.style.height = `${size}px`;
    light.style.left = `${Math.random() * 100}%`;
    light.style.bottom = `${8 + Math.random() * 32}vh`;
    light.style.animationDelay = `${Math.random() * 5}s`;
    light.style.animationDuration = `${3.5 + Math.random() * 3}s`;
    container.appendChild(light);
  }
}

// ============================================================
// 3. GSAP ENTRANCE ANIMATIONS
// ============================================================
function initGsapHeroAnimations() {
  if (typeof gsap === "undefined" || REDUCE_MOTION) return;

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from(".app-nav", {
    y: -24,
    opacity: 0,
    duration: 0.8,
  })
  .from(".hero-badge", {
    scale: 0.9,
    opacity: 0,
    duration: 0.6,
  }, "-=0.4")
  .from(".headline", {
    y: 30,
    opacity: 0,
    duration: 0.85,
  }, "-=0.4")
  .from(".subhead", {
    y: 20,
    opacity: 0,
    duration: 0.7,
  }, "-=0.5")
  .from(".hud-pill", {
    y: 16,
    opacity: 0,
    stagger: 0.1,
    duration: 0.6,
  }, "-=0.4")
  .from(".hero-actions", {
    y: 16,
    opacity: 0,
    duration: 0.6,
  }, "-=0.3")
  .from(".form-panel", {
    y: 25,
    opacity: 0,
    duration: 0.8,
  }, "-=0.4")
  .from(".result-panel", {
    y: 25,
    opacity: 0,
    duration: 0.8,
  }, "-=0.6");
}

// ============================================================
// 4. FORM LOGIC, NEIGHBOURHOOD DROPDOWN & PRESET MANAGEMENT
// ============================================================
const BOROUGH_NEIGHBOURHOODS = {
  Manhattan: [
    "Battery Park City", "Chelsea", "Chinatown", "Civic Center", "East Harlem",
    "East Village", "Financial District", "Flatiron District", "Gramercy",
    "Greenwich Village", "Harlem", "Hell's Kitchen", "Inwood", "Kips Bay",
    "Little Italy", "Lower East Side", "Marble Hill", "Midtown", "Morningside Heights",
    "Murray Hill", "NoHo", "Nolita", "Roosevelt Island", "SoHo", "Stuyvesant Town",
    "Theater District", "Tribeca", "Two Bridges", "Upper East Side", "Upper West Side",
    "Washington Heights", "West Village"
  ],
  Brooklyn: [
    "Bath Beach", "Bay Ridge", "Bedford-Stuyvesant", "Bensonhurst", "Bergen Beach",
    "Boerum Hill", "Borough Park", "Brighton Beach", "Brooklyn Heights", "Brownsville",
    "Bushwick", "Canarsie", "Carroll Gardens", "Clinton Hill", "Cobble Hill",
    "Columbia St", "Coney Island", "Crown Heights", "Cypress Hills", "DUMBO",
    "Downtown Brooklyn", "Dyker Heights", "East Flatbush", "East New York",
    "Flatbush", "Flatlands", "Fort Greene", "Fort Hamilton", "Gowanus",
    "Gravesend", "Greenpoint", "Kensington", "Manhattan Beach", "Midwood",
    "Mill Basin", "Navy Yard", "Park Slope", "Prospect Heights",
    "Prospect-Lefferts Gardens", "Red Hook", "Sea Gate", "Sheepshead Bay",
    "South Slope", "Sunset Park", "Vinegar Hill", "Williamsburg", "Windsor Terrace"
  ],
  Queens: [
    "Arverne", "Astoria", "Bay Terrace", "Bayside", "Bayswater", "Belle Harbor",
    "Bellerose", "Breezy Point", "Briarwood", "Cambria Heights", "College Point",
    "Corona", "Ditmars Steinway", "Douglaston", "East Elmhurst", "Edgemere",
    "Elmhurst", "Far Rockaway", "Flushing", "Forest Hills", "Fresh Meadows",
    "Glendale", "Hollis", "Holliswood", "Howard Beach", "Jackson Heights",
    "Jamaica", "Jamaica Estates", "Jamaica Hills", "Kew Gardens",
    "Kew Gardens Hills", "Laurelton", "Little Neck", "Long Island City",
    "Maspeth", "Middle Village", "Neponsit", "Ozone Park", "Queens Village",
    "Rego Park", "Richmond Hill", "Ridgewood", "Rockaway Beach", "Rosedale",
    "South Ozone Park", "Springfield Gardens", "St. Albans", "Sunnyside",
    "Whitestone", "Woodhaven", "Woodside"
  ],
  Bronx: [
    "Allerton", "Baychester", "Belmont", "Bronxdale", "Castle Hill", "City Island",
    "Claremont Village", "Clason Point", "Co-op City", "Concourse", "Concourse Village",
    "East Morrisania", "Eastchester", "Edenwald", "Fieldston", "Fordham",
    "Highbridge", "Hunts Point", "Kingsbridge", "Longwood", "Melrose",
    "Morris Heights", "Morris Park", "Morrisania", "Mott Haven", "Mount Eden",
    "Mount Hope", "North Riverdale", "Norwood", "Olinville", "Parkchester",
    "Pelham Bay", "Pelham Gardens", "Port Morris", "Riverdale", "Schuylerville",
    "Soundview", "Spuyten Duyvil", "Throgs Neck", "Tremont", "Unionport",
    "University Heights", "Van Nest", "Wakefield", "West Farms",
    "Westchester Square", "Williamsbridge", "Woodlawn"
  ],
  "Staten Island": [
    "Arden Heights", "Arrochar", "Bay Terrace, Staten Island", "Bull's Head",
    "Castleton Corners", "Clifton", "Concord", "Dongan Hills", "Eltingville",
    "Emerson Hill", "Fort Wadsworth", "Graniteville", "Grant City", "Great Kills",
    "Grymes Hill", "Howland Hook", "Huguenot", "Lighthouse Hill", "Mariners Harbor",
    "Midland Beach", "New Brighton", "New Dorp", "New Dorp Beach", "New Springville",
    "Oakwood", "Port Richmond", "Prince's Bay", "Randall Manor", "Richmondtown",
    "Rosebank", "Rossville", "Shore Acres", "Silver Lake", "South Beach",
    "St. George", "Stapleton", "Todt Hill", "Tompkinsville", "Tottenville",
    "West Brighton", "Westerleigh", "Willowbrook", "Woodrow"
  ]
};

const form = document.getElementById("predictForm");
const predictBtn = document.getElementById("predictBtn");
const formError = document.getElementById("formError");
const availabilityInput = document.getElementById("availability_365");
const availabilityValue = document.getElementById("availabilityValue");
const availabilityPct = document.getElementById("availabilityPct");
const exampleBtn = document.getElementById("exampleBtn");
const heroExampleBtn = document.getElementById("heroExampleBtn");
const presetChips = document.querySelectorAll(".preset-chip");
const boroughSelect = document.getElementById("neighbourhood_group");
const neighbourhoodSelect = document.getElementById("neighbourhood");

function populateNeighbourhoods(selectedBorough = "", currentVal = "") {
  if (!neighbourhoodSelect) return;

  neighbourhoodSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.disabled = true;
  defaultOption.selected = !currentVal;
  defaultOption.textContent = selectedBorough
    ? `Choose a neighbourhood in ${selectedBorough}`
    : "Choose a neighbourhood";
  neighbourhoodSelect.appendChild(defaultOption);

  if (selectedBorough && BOROUGH_NEIGHBOURHOODS[selectedBorough]) {
    BOROUGH_NEIGHBOURHOODS[selectedBorough].forEach((nh) => {
      const opt = document.createElement("option");
      opt.value = nh;
      opt.textContent = nh;
      if (nh === currentVal) opt.selected = true;
      neighbourhoodSelect.appendChild(opt);
    });
  } else {
    // Show all boroughs with optgroups
    Object.entries(BOROUGH_NEIGHBOURHOODS).forEach(([borough, nhList]) => {
      const optgroup = document.createElement("optgroup");
      optgroup.label = borough;
      nhList.forEach((nh) => {
        const opt = document.createElement("option");
        opt.value = nh;
        opt.textContent = nh;
        if (nh === currentVal) opt.selected = true;
        optgroup.appendChild(opt);
      });
      neighbourhoodSelect.appendChild(optgroup);
    });
  }

  if (currentVal) {
    neighbourhoodSelect.value = currentVal;
  }
}

// Dynamic filtering: when Borough changes, update Neighbourhood options
if (boroughSelect) {
  boroughSelect.addEventListener("change", (e) => {
    const selectedBorough = e.target.value;
    const currentNeighbourhood = neighbourhoodSelect ? neighbourhoodSelect.value : "";
    populateNeighbourhoods(selectedBorough, currentNeighbourhood);
  });
}

// When Neighbourhood changes, auto-select its Borough if not yet selected
if (neighbourhoodSelect) {
  neighbourhoodSelect.addEventListener("change", (e) => {
    const chosenNeighbourhood = e.target.value;
    for (const [borough, nhList] of Object.entries(BOROUGH_NEIGHBOURHOODS)) {
      if (nhList.includes(chosenNeighbourhood)) {
        if (boroughSelect && boroughSelect.value !== borough) {
          boroughSelect.value = borough;
        }
        break;
      }
    }
  });
}

// Range Slider live feedback
function updateAvailabilityFeedback(val) {
  if (availabilityValue) availabilityValue.textContent = val;
  if (availabilityPct) {
    const pct = Math.round((parseInt(val, 10) / 365) * 100);
    availabilityPct.textContent = `${pct}% open`;
  }
}

if (availabilityInput) {
  availabilityInput.addEventListener("input", (e) => {
    updateAvailabilityFeedback(e.target.value);
  });
}

// Preset Loader
function loadPreset(idx) {
  const data = EXAMPLES[idx % EXAMPLES.length];
  if (!data || !form) return;

  // Set borough and populate its neighbourhoods first
  if (data.neighbourhood_group) {
    if (boroughSelect) boroughSelect.value = data.neighbourhood_group;
    populateNeighbourhoods(data.neighbourhood_group, data.neighbourhood);
  }

  Object.entries(data).forEach(([key, value]) => {
    const el = form.elements[key];
    if (el) {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });

  updateAvailabilityFeedback(data.availability_365);
  if (formError) formError.textContent = "";

  // Highlight active chip
  presetChips.forEach((chip, i) => {
    chip.classList.toggle("active", i === idx);
  });

  // Provide tactile visual feedback
  if (typeof gsap !== "undefined" && !REDUCE_MOTION) {
    gsap.fromTo(
      ".form-section",
      { borderColor: "rgba(0, 229, 255, 0.6)" },
      { borderColor: "rgba(255, 255, 255, 0.06)", duration: 0.8, stagger: 0.08 }
    );
  }
}

if (exampleBtn) {
  exampleBtn.addEventListener("click", () => {
    loadPreset(currentExampleIdx);
    currentExampleIdx = (currentExampleIdx + 1) % EXAMPLES.length;
  });
}

if (heroExampleBtn) {
  heroExampleBtn.addEventListener("click", () => {
    loadPreset(currentExampleIdx);
    currentExampleIdx = (currentExampleIdx + 1) % EXAMPLES.length;
    const formSection = document.getElementById("formSection");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  });
}

presetChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const presetIdx = parseInt(chip.dataset.preset, 10);
    loadPreset(presetIdx);
    currentExampleIdx = (presetIdx + 1) % EXAMPLES.length;
  });
});

// Payload Collection
function collectPayload() {
  const fd = new FormData(form);
  return {
    latitude: parseFloat(fd.get("latitude")),
    longitude: parseFloat(fd.get("longitude")),
    price: parseFloat(fd.get("price")),
    minimum_nights: parseInt(fd.get("minimum_nights"), 10),
    number_of_reviews: parseInt(fd.get("number_of_reviews"), 10),
    reviews_per_month: parseFloat(fd.get("reviews_per_month")),
    calculated_host_listings_count: parseInt(fd.get("calculated_host_listings_count"), 10),
    availability_365: parseInt(fd.get("availability_365"), 10),
    neighbourhood_group: fd.get("neighbourhood_group"),
    neighbourhood: fd.get("neighbourhood"),
  };
}

function formatDetail(detail) {
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join(" ");
  }
  return String(detail);
}

function setLoading(isLoading) {
  if (!predictBtn) return;
  predictBtn.disabled = isLoading;
  predictBtn.classList.toggle("loading", isLoading);
}

// Form Submission & API Integration
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (formError) formError.textContent = "";

    if (!form.reportValidity()) return;

    const payload = collectPayload();
    setLoading(true);

    try {
      const res = await fetch(PREDICT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail ? formatDetail(body.detail) : `Request failed (${res.status}).`);
      }

      const result = await res.json();
      renderResult(result, payload);
    } catch (err) {
      if (formError) {
        formError.textContent = err.message?.includes("fetch")
          ? "Cannot reach prediction API at http://127.0.0.1:8000. Ensure FastAPI is running via `python -m uvicorn main:app --reload`."
          : err.message || "An unexpected error occurred. Please verify your listing values.";
      }
    } finally {
      setLoading(false);
    }
  });
}

// ============================================================
// 5. RESULT RENDERING & CATEGORY VISUALIZATION
// ============================================================
const resultEmpty = document.getElementById("resultEmpty");
const resultContent = document.getElementById("resultContent");
const predictedName = document.getElementById("predictedName");
const confidenceBadge = document.getElementById("confidenceBadge");
const predictedNarrative = document.getElementById("predictedNarrative");
const buildingsRow = document.getElementById("buildingsRow");
const probList = document.getElementById("probList");
const diagWinner = document.getElementById("diagWinner");
const diagBorough = document.getElementById("diagBorough");
const diagPrice = document.getElementById("diagPrice");

function renderResult(result, inputPayload) {
  const predicted = result.Predicted_room_type;
  const probs = result.Probability;
  // If API returned calibrated class ordering, use it; otherwise fallback to alphabetical model classes
  const classesOrder = result.Classes || ["Entire home/apt", "Private room", "Shared room"];

  // Pair model classes with probabilities based on real class order
  const paired = classesOrder.map((className, idx) => {
    const meta = ROOM_CLASSES.find((rc) => rc.key === className) || {
      key: className,
      label: className,
      subtitle: "Listing Category",
      desc: "NYC stay category",
      rows: 4,
      cols: 2,
      height: "65%",
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`,
    };
    return {
      ...meta,
      prob: typeof probs?.[idx] === "number" ? probs[idx] : 0,
    };
  });

  // Calculate top probability
  const topProb = Math.max(...paired.map((p) => p.prob));
  const topPct = (topProb * 100).toFixed(1);

  // Switch views
  if (resultEmpty) resultEmpty.hidden = true;
  if (resultContent) {
    resultContent.hidden = false;
    if (typeof gsap !== "undefined" && !REDUCE_MOTION) {
      gsap.fromTo(
        resultContent,
        { opacity: 0, scale: 0.96, y: 14 },
        { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: "power3.out" }
      );
    }
  }

  // Update hero result banner
  if (predictedName) predictedName.textContent = predicted;
  if (confidenceBadge) confidenceBadge.textContent = `${topPct}% Certainty`;

  if (predictedNarrative && inputPayload) {
    predictedNarrative.textContent = `The model assigned highest probability to ${predicted} for this listing in ${inputPayload.neighbourhood || inputPayload.neighbourhood_group} priced at $${inputPayload.price}/night with ${inputPayload.availability_365} available days.`;
  }

  // Update diagnostic chips
  if (diagWinner) diagWinner.textContent = predicted;
  if (diagBorough && inputPayload) diagBorough.textContent = `${inputPayload.neighbourhood_group} (${inputPayload.neighbourhood})`;
  if (diagPrice && inputPayload) diagPrice.textContent = `$${inputPayload.price} / nt · ${inputPayload.minimum_nights} min`;

  // Render components
  buildCategoryCards(paired, predicted);
  buildProbabilityBreakdown(paired, predicted);
}

function buildCategoryCards(paired, predicted) {
  if (!buildingsRow) return;
  buildingsRow.innerHTML = "";

  paired.forEach((cls) => {
    const card = document.createElement("div");
    const isWinner = cls.key === predicted;
    card.className = `room-card ${isWinner ? "winner" : ""}`;

    const pct = Math.round(cls.prob * 100);

    card.innerHTML = `
      ${isWinner ? '<span class="winner-tag">TOP PREDICTION</span>' : ""}
      <div class="room-card-head">
        <div class="room-icon-wrap">${cls.icon}</div>
        <span class="room-name">${cls.label}</span>
        <span class="room-prob-val" id="cardProb_${cls.key.replace(/\W/g, '')}">0%</span>
      </div>
      <div class="building-stage">
        <div class="building" style="--h: 20%;">
          ${Array.from({ length: cls.rows * cls.cols }).map(() => '<div class="win"></div>').join("")}
        </div>
      </div>
    `;

    buildingsRow.appendChild(card);

    const b = card.querySelector(".building");
    const valEl = card.querySelector(".room-prob-val");
    const totalWindows = cls.rows * cls.cols;
    const litCount = Math.round(totalWindows * cls.prob);

    requestAnimationFrame(() => {
      setTimeout(() => {
        b.style.setProperty("--h", cls.height);
        animateCount(valEl, pct);

        const wins = b.querySelectorAll(".win");
        wins.forEach((w, i) => {
          if (i < litCount) {
            setTimeout(() => w.classList.add("lit"), REDUCE_MOTION ? 0 : 50 * i + 200);
          }
        });
      }, REDUCE_MOTION ? 0 : 100);
    });
  });
}

function buildProbabilityBreakdown(paired, predicted) {
  if (!probList) return;
  probList.innerHTML = "";

  const sorted = [...paired].sort((a, b) => b.prob - a.prob);

  sorted.forEach((cls) => {
    const isTop = cls.key === predicted;
    const pct = Math.round(cls.prob * 100);

    const row = document.createElement("div");
    row.className = `prob-row ${isTop ? "top" : ""}`;

    row.innerHTML = `
      <span class="name">
        ${cls.icon}
        <span>${cls.label}</span>
      </span>
      <span class="value">0%</span>
      <div class="prob-track">
        <div class="prob-fill"></div>
      </div>
    `;

    probList.appendChild(row);

    const fill = row.querySelector(".prob-fill");
    const valueEl = row.querySelector(".value");

    requestAnimationFrame(() => {
      setTimeout(() => {
        fill.style.width = `${pct}%`;
        animateCount(valueEl, pct);
      }, REDUCE_MOTION ? 0 : 150);
    });
  });
}

function animateCount(el, target) {
  if (!el) return;
  if (REDUCE_MOTION) {
    el.textContent = `${target}%`;
    return;
  }

  const duration = 800;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(1, elapsed / duration);
    // Quintic ease out
    const ease = 1 - Math.pow(1 - progress, 4);
    el.textContent = `${Math.round(target * ease)}%`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

// ============================================================
// 6. API HEALTH MONITORING (PRESERVED)
// ============================================================
async function checkApiStatus() {
  const statusEl = document.getElementById("apiStatus");
  if (!statusEl) return;

  const textEl = statusEl.querySelector(".status-text") || statusEl.lastChild;

  try {
    const res = await fetch(HEALTH_ENDPOINT, { method: "GET" });
    if (res.ok) {
      statusEl.classList.add("online");
      statusEl.classList.remove("offline");
      textEl.textContent = "API connected · Port 8000";
    } else {
      throw new Error("bad status");
    }
  } catch {
    statusEl.classList.add("offline");
    statusEl.classList.remove("online");
    textEl.textContent = "API offline · Run uvicorn";
  }
}

// ============================================================
// 7. INITIALIZATION
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  // Populate Neighbourhood dropdown
  populateNeighbourhoods();

  // Initialize Three.js 3D Skyline
  new NYCSkylineScene("threeCanvas");

  // Fallback ambient window twinkles
  buildSkylineLightsFallback();

  // Entrance GSAP timeline
  initGsapHeroAnimations();

  // Verify backend connectivity
  checkApiStatus();

  // Check connectivity periodically every 15 seconds
  setInterval(checkApiStatus, 15000);
});
