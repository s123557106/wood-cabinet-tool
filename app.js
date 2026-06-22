// 台灣木工櫃體 3D 裁切計算工具 MVP v2.9
// 單位：cm
// 重點：多板材分組、裁切清單、簡易矩形排版、成本與利用率、3D 示意

const $ = (id) => document.getElementById(id);

const materialNames = {
  plywood: "夾板",
  blockboard: "木心板",
  mdf: "MDF",
  particle: "系統板 / 塑合板",
  osb: "OSB",
  hpl: "美耐板",
  dense: "密集板",
};

const roleNames = {
  body: "主結構",
  back: "背板",
  door: "門片",
  drawerFront: "抽屜面板",
  drawerSide: "抽屜側板",
  drawerFrontBack: "抽屜前後板",
  drawerBottom: "抽屜底板",
  custom: "自訂",
};

const materialSpecs = {
  plywood: [
    { label: "1分夾板｜0.3 cm｜抽屜底板", thickness: 0.3, use: "抽屜底板" },
    { label: "1.2分夾板｜0.35 cm｜隔間薄板、抽屜底板", thickness: 0.35, use: "隔間薄板、抽屜底板" },
    { label: "2分夾板｜0.42 cm｜隔間薄板、抽屜底板", thickness: 0.42, use: "隔間薄板、抽屜底板" },
    { label: "2分足夾板｜0.5 cm｜抽屜底板", thickness: 0.5, use: "抽屜底板" },
    { label: "3分夾板｜0.7 cm｜裝潢、家具轉角處", thickness: 0.7, use: "裝潢、家具轉角處" },
    { label: "3分足夾板｜0.8 cm｜床底板", thickness: 0.8, use: "床底板" },
    { label: "3分足夾板｜0.9 cm｜床底板", thickness: 0.9, use: "床底板" },
    { label: "4分夾板｜0.9 cm｜床底板", thickness: 0.9, use: "床底板" },
    { label: "4分足夾板｜1.1 cm｜木地板底板", thickness: 1.1, use: "木地板底板" },
    { label: "4分足夾板｜1.2 cm｜木地板底板", thickness: 1.2, use: "木地板底板" },
    { label: "5分夾板｜1.3 cm｜較少使用", thickness: 1.3, use: "較少使用" },
    { label: "5分足夾板｜1.5 cm｜支撐結構", thickness: 1.5, use: "支撐結構" },
    { label: "6分夾板｜1.6 cm｜支撐結構", thickness: 1.6, use: "支撐結構" },
    { label: "6分足夾板｜1.8 cm｜支撐結構", thickness: 1.8, use: "支撐結構" },
  ],
  blockboard: [
    { label: "5分木心板｜1.55 cm｜床架、衣櫃、書櫃", thickness: 1.55, use: "床架、衣櫃、書櫃" },
    { label: "6分木心板｜1.75 cm｜床架、衣櫃、書櫃", thickness: 1.75, use: "床架、衣櫃、書櫃" },
    { label: "8分木心板｜2.4 cm｜較少見", thickness: 2.4, use: "較少見" },
  ],
  mdf: [
    { label: "MDF｜0.9 cm｜背板、造型、門片基材", thickness: 0.9, use: "背板、造型、門片基材" },
    { label: "MDF｜1.2 cm｜造型、門片基材", thickness: 1.2, use: "造型、門片基材" },
    { label: "MDF｜1.5 cm｜門片、造型板", thickness: 1.5, use: "門片、造型板" },
    { label: "MDF｜1.8 cm｜門片、檯面基材", thickness: 1.8, use: "門片、檯面基材" },
  ],
  particle: [
    { label: "系統板 / 塑合板｜1.8 cm｜櫃體、層板、門片", thickness: 1.8, use: "櫃體、層板、門片" },
    { label: "系統板 / 塑合板｜2.5 cm｜檯面、厚層板", thickness: 2.5, use: "檯面、厚層板" },
  ],
  osb: [
    { label: "OSB｜0.9 cm｜背板、裝飾牆", thickness: 0.9, use: "背板、裝飾牆" },
    { label: "OSB｜1.2 cm｜裝飾牆、底板", thickness: 1.2, use: "裝飾牆、底板" },
    { label: "OSB｜1.8 cm｜承重底板、結構板", thickness: 1.8, use: "承重底板、結構板" },
  ],
  hpl: [
    { label: "美耐板基材｜1.8 cm｜檯面、門片、櫃體", thickness: 1.8, use: "檯面、門片、櫃體" },
  ],
  dense: [
    { label: "密集板｜0.9 cm｜背板、造型板", thickness: 0.9, use: "背板、造型板" },
    { label: "密集板｜1.5 cm｜門片、造型板", thickness: 1.5, use: "門片、造型板" },
    { label: "密集板｜1.8 cm｜櫃體、門片", thickness: 1.8, use: "櫃體、門片" },
  ],
};

const sheetPresets = {
  "122x244": { label: "4尺 × 8尺｜122 × 244 cm", sheetW: 122, sheetL: 244 },
  "91.5x183": { label: "3尺 × 6尺｜91.5 × 183 cm", sheetW: 91.5, sheetL: 183 },
  "122x274.5": { label: "4尺 × 9尺｜122 × 274.5 cm", sheetW: 122, sheetL: 274.5 },
  custom: { label: "自訂", sheetW: 122, sheetL: 244 },
};

const hardwareOptions = {
  hinges: [
    { key: "none", label: "不估算鉸鍊", price: 0 },
    { key: "standard110", label: "標準 110° 西德鉸鍊 / 隱藏鉸鍊", price: 80 },
    { key: "softClose110", label: "緩衝 110° 隱藏鉸鍊", price: 140 },
    { key: "wide155", label: "大開角 155° 鉸鍊", price: 180 },
  ],
  slides: [
    { key: "none", label: "不估算滑軌", price: 0, clearance: 0 },
    { key: "sideBall", label: "三節鋼珠滑軌", price: 250, clearance: 1.3 },
    { key: "softCloseBall", label: "緩衝三節鋼珠滑軌", price: 350, clearance: 1.3 },
    { key: "undermount", label: "隱藏式緩衝滑軌", price: 900, clearance: 2.1 },
    { key: "blumTandem", label: "BLUM TANDEM / 同級隱藏滑軌", price: 1500, clearance: 2.1 },
    { key: "hettichQuadro", label: "Hettich Quadro / 同級隱藏滑軌", price: 1300, clearance: 2.1 },
  ],
  slideLengths: [25, 30, 35, 40, 45, 50, 55, 60, 65],
};

let formulaParts = [];
let customParts = [];
let lastState = null;
let lastLayoutGroups = [];
let engineeringViewEnabled = false;
let previousDoorFeatureState = null;
let previousDrawerFeatureState = null;

// -------- 基本工具 --------

function n(id) {
  const value = Number($(id).value);
  return Number.isFinite(value) ? value : 0;
}

function setValue(id, value) {
  const el = $(id);
  if (!el) return;
  if (el.type === "checkbox") el.checked = Boolean(value);
  else el.value = value;
}

function cm(num) {
  return Math.round(num * 100) / 100;
}

function money(num) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(num || 0);
}

function areaM2(part) {
  return (part.length * part.width * part.qty) / 10_000;
}

function canFitOnSheet(part, material) {
  const L = Number(part.length);
  const W = Number(part.width);
  const sheetL = Number(material.sheetL);
  const sheetW = Number(material.sheetW);
  if (!L || !W || !sheetL || !sheetW) return false;
  return (L <= sheetL && W <= sheetW) || (L <= sheetW && W <= sheetL);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (s) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[s]));
}

function parseMaybeNumber(field, value) {
  if (["thickness", "length", "width", "qty"].includes(field)) {
    return Number(value) || 0;
  }
  return value;
}

// -------- 初始化板材選單 --------

function initMaterialControls() {
  ["body", "back", "door", "drawerSide", "drawerBottom"].forEach((role) => {
    const typeSelect = $(`${role}MaterialType`);
    typeSelect.innerHTML = Object.entries(materialNames)
      .map(([key, name]) => `<option value="${key}">${name}</option>`)
      .join("");

    const sheetSelect = $(`${role}SheetPreset`);
    sheetSelect.innerHTML = Object.entries(sheetPresets)
      .map(([key, item]) => `<option value="${key}">${item.label}</option>`)
      .join("");
  });

  $("bodyMaterialType").value = "blockboard";
  $("backMaterialType").value = "plywood";
  $("doorMaterialType").value = "blockboard";
  $("drawerSideMaterialType").value = "plywood";
  $("drawerBottomMaterialType").value = "plywood";

  populateSpecs("body", 1, true); // 6分木心板 1.75
  populateSpecs("back", 0, true); // 1分夾板 0.3
  populateSpecs("door", 1, true);
  populateSpecs("drawerSide", 9, false);
  populateSpecs("drawerBottom", 0, false);

  $("bodySheetPreset").value = "122x244";
  $("backSheetPreset").value = "122x244";
  $("doorSheetPreset").value = "122x244";
  $("drawerSideSheetPreset").value = "122x244";
  $("drawerBottomSheetPreset").value = "122x244";

  syncSheetPreset("drawerSide");
  syncSheetPreset("drawerBottom");

  initHardwareControls();
}


function initHardwareControls() {
  $("hingeType").innerHTML = hardwareOptions.hinges
    .map((item) => `<option value="${item.key}">${item.label}</option>`)
    .join("");

  $("slideType").innerHTML = hardwareOptions.slides
    .map((item) => `<option value="${item.key}">${item.label}</option>`)
    .join("");

  $("slideLength").innerHTML = hardwareOptions.slideLengths
    .map((cm) => `<option value="${cm}">${cm} cm</option>`)
    .join("");

  $("hingeType").value = "standard110";
  $("slideType").value = "softCloseBall";
  $("slideLength").value = "45";
  $("hingeEnabled").checked = false;
  $("slideEnabled").checked = false;
  $("handleEnabled").checked = false;
  $("shelfPinEnabled").checked = false;
}

function populateSpecs(role, preferredIndex = 0, applyThickness = false) {
  const type = $(`${role}MaterialType`).value;
  const specs = materialSpecs[type] || [];
  const specSelect = $(`${role}MaterialSpec`);

  specSelect.innerHTML = specs.map((item, index) => {
    return `<option value="${index}">${item.label}</option>`;
  }).join("");

  specSelect.value = Math.min(preferredIndex, Math.max(specs.length - 1, 0));
  updateSpecUseText(role, applyThickness);
}

function updateSpecUseText(role, applyThickness = false) {
  const type = $(`${role}MaterialType`).value;
  const specs = materialSpecs[type] || [];
  const selected = specs[Number($(`${role}MaterialSpec`).value)] || specs[0];
  const text = $(`${role}UseText`);

  if (!selected) {
    text.textContent = "此板材尚未建立常用厚度資料，可手動輸入厚度。";
    return;
  }

  if (applyThickness) {
    if (role === "body") $("boardT").value = selected.thickness;
    if (role === "back") $("backT").value = selected.thickness;
    if (role === "door") $("doorT").value = selected.thickness;
    // drawerSide / drawerBottom 沒有手動厚度欄位，直接由 getMaterial 讀取 selected.thickness。
  }

  text.textContent = `常見用途：${selected.use}。選擇後會自動帶入 ${selected.thickness} cm，仍可手動修改。`;
}

function syncDoorFromBody() {
  if (!$("doorSameAsBody").checked) return;

  $("doorMaterialType").value = $("bodyMaterialType").value;
  populateSpecs("door", Number($("bodyMaterialSpec").value), false);
  $("doorMaterialSpec").value = $("bodyMaterialSpec").value;
  $("doorT").value = $("boardT").value;
  $("doorSheetPreset").value = $("bodySheetPreset").value;
  $("doorSheetL").value = $("bodySheetL").value;
  $("doorSheetW").value = $("bodySheetW").value;
  $("doorSheetPrice").value = $("bodySheetPrice").value;
  updateSpecUseText("door", false);
}

function syncSheetPreset(role) {
  const preset = $(`${role}SheetPreset`).value;
  if (preset !== "custom" && sheetPresets[preset]) {
    $(`${role}SheetW`).value = sheetPresets[preset].sheetW;
    $(`${role}SheetL`).value = sheetPresets[preset].sheetL;
  }
}

function getMaterial(role) {
  if (role === "door" && $("doorSameAsBody").checked) {
    return getMaterial("body");
  }

  const type = $(`${role}MaterialType`).value;
  const specs = materialSpecs[type] || [];
  const spec = specs[Number($(`${role}MaterialSpec`).value)] || null;

  let thickness = spec ? spec.thickness : 1.8;

  // 主結構、背板、門片保留原本手動厚度欄位；
  // 抽屜側板與抽屜底板則完全依常用厚度選項自動帶入，避免材質與厚度不一致。
  if (role === "body") thickness = n("boardT");
  if (role === "back") thickness = n("backT");
  if (role === "door") thickness = n("doorT");

  return {
    role,
    roleName: roleNames[role],
    type,
    materialName: materialNames[type] || type,
    specLabel: spec ? spec.label : "自訂厚度",
    thickness: cm(thickness),
    sheetPreset: $(`${role}SheetPreset`).value,
    sheetL: n(`${role}SheetL`),
    sheetW: n(`${role}SheetW`),
    sheetPrice: n(`${role}SheetPrice`),
  };
}


function selectedHingeOption() {
  return hardwareOptions.hinges.find((item) => item.key === $("hingeType").value) || hardwareOptions.hinges[0];
}

function selectedSlideOption() {
  return hardwareOptions.slides.find((item) => item.key === $("slideType").value) || hardwareOptions.slides[0];
}

function materialFromBaseRole(materials, baseRole, outputRole) {
  const base = materials[baseRole] || materials.body;
  return {
    ...base,
    role: outputRole,
    roleName: roleNames[outputRole],
  };
}

function resolveDrawerMaterialBase(kind) {
  const idMap = {
    front: "drawerFrontMaterialRole",
    frontBack: "drawerFrontBackMaterialRole",
  };

  if (kind === "side") return "drawerSide";
  if (kind === "bottom") return "drawerBottom";

  const id = idMap[kind];
  let value = id && $(id) ? $(id).value : "back";

  if (kind === "frontBack" && value === "sameAsSide") {
    return "drawerSide";
  }

  return value;
}

function materialKey(material) {
  return [
    material.type,
    material.thickness,
    material.sheetW,
    material.sheetL,
    material.sheetPrice,
  ].join("|");
}

function materialTitle(material) {
  return `${material.materialName}｜厚 ${material.thickness} cm｜原板 ${material.sheetW} × ${material.sheetL} cm`;
}


function autoSuggestHardwareFromFeatures() {
  // v2.5 修正：
  // 第一次啟用門片 / 抽屜時，自動推薦必要五金。
  // 但使用者手動取消勾選後，不會在每次重新計算時被強制勾回。
  if (currentMode === "box") {
    if ($("hingeEnabled")) $("hingeEnabled").checked = false;
    if ($("slideEnabled")) $("slideEnabled").checked = false;
    previousDoorFeatureState = false;
    previousDrawerFeatureState = false;
    return;
  }

  const hasDoor = $("doorType").value !== "none";
  const hasDrawers = $("hasDrawers").checked;

  const hingeEl = $("hingeEnabled");
  const slideEl = $("slideEnabled");

  if (hingeEl) {
    if (!hasDoor) {
      hingeEl.checked = false;
    } else if (previousDoorFeatureState === null || previousDoorFeatureState === false) {
      // 從「無門片」變成「有門片」時，才自動勾選一次。
      hingeEl.checked = true;
    }
  }

  if (slideEl) {
    if (!hasDrawers) {
      slideEl.checked = false;
    } else if (previousDrawerFeatureState === null || previousDrawerFeatureState === false) {
      // 從「無抽屜」變成「有抽屜」時，才自動勾選一次。
      slideEl.checked = true;
    }
  }

  previousDoorFeatureState = hasDoor;
  previousDrawerFeatureState = hasDrawers;
}

function getDoorHardwareRecommendation(state) {
  if (state.doorType === "none") {
    return {
      enabled: false,
      text: "目前沒有門片，不需要估算鉸鍊。",
      doorCount: 0,
      perDoor: 0,
      total: 0,
    };
  }

  const info = getDoorPanelInfo(state);
  const perDoor = state.hardware.hingeAuto ? hingeCountByHeight(info.panelH) : 2;
  const total = info.doorCount * perDoor;

  return {
    enabled: true,
    text: `推薦 ${total} 顆鉸鍊：門片 ${info.doorCount} 片，每片 ${perDoor} 顆，單片門高約 ${info.panelH} cm。`,
    doorCount: info.doorCount,
    perDoor,
    total,
  };
}

function getSlideHardwareRecommendation(state) {
  if (!state.hasDrawers) {
    return {
      enabled: false,
      text: "目前沒有抽屜，不需要估算滑軌。",
      total: 0,
    };
  }

  return {
    enabled: true,
    text: `推薦 ${state.drawerCount} 組滑軌：每個抽屜 1 組，滑軌長度 ${state.hardware.slideLength} cm。`,
    total: state.drawerCount,
  };
}


let currentMode = localStorage.getItem("woodCabinetToolMode") || "cabinet";


function applyModeVisibility() {
  const isBox = currentMode === "box";

  // v2.8 除錯版：
  // 前幾版只靠 id / data-feature 隱藏，但舊版 HTML 有些區塊沒有正確標到 id。
  // 這版改成讀取每個 section 的 h3 標題文字，只要是櫃體專用區塊就強制隱藏。
  const cabinetOnlyHeadings = new Set([
    "結構",
    "背板",
    "門片",
    "踢腳板",
    "抽屜模組",
    "背板板材",
    "門片板材",
    "抽屜側板板材",
    "抽屜底板板材",
    "五金估算",
    "五金推薦與估算"
  ]);

  document.querySelectorAll("section, aside .form-section").forEach((section) => {
    const heading = section.querySelector("h2, h3");
    const title = heading ? heading.textContent.trim().replace(/\s+/g, "") : "";
    const shouldHide = cabinetOnlyHeadings.has(title);

    if (shouldHide) {
      section.classList.toggle("box-hidden-section", isBox);
      section.classList.toggle("is-hidden", isBox);
      section.style.display = isBox ? "none" : "";
    }
  });

  // 額外保險：部分五金區、材料區可能沒有 h3 或 class 結構不同。
  const extraSelectors = [
    ".hardware-panel",
    "[data-feature='back']",
    "[data-feature='door']",
    "[data-feature='toeKick']",
    "[data-feature='drawers']",
    "#structureSection",
    "#backSection",
    "#doorSection",
    "#toeKickSection",
    "#drawerSection",
    "#backOptions",
    "#doorOptions",
    "#toeKickOptions",
    "#drawerOptions",
    "#backMaterialPanel",
    "#doorMaterialPanel",
    "#drawerSideMaterialPanel",
    "#drawerBottomMaterialPanel",
    "#hardwareSummary",
    "#hardwareDetails"
  ];

  extraSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.classList.toggle("box-hidden-section", isBox);
      el.classList.toggle("is-hidden", isBox);
      el.style.display = isBox ? "none" : "";
    });
  });

  const boxOptions = $("boxOptions");
  if (boxOptions) {
    boxOptions.classList.toggle("is-hidden", !isBox);
    boxOptions.style.display = isBox ? "" : "none";
  }

  document.body.classList.toggle("box-mode", isBox);
  document.body.classList.toggle("cabinet-mode", !isBox);
}

function setToolMode(mode) {
  currentMode = mode === "box" ? "box" : "cabinet";
  localStorage.setItem("woodCabinetToolMode", currentMode);

  document.body.classList.toggle("box-mode", currentMode === "box");
  document.body.classList.toggle("cabinet-mode", currentMode === "cabinet");

  const cabinetBtn = $("cabinetModeBtn");
  const boxBtn = $("boxModeBtn");
  if (cabinetBtn) cabinetBtn.classList.toggle("active", currentMode === "cabinet");
  if (boxBtn) boxBtn.classList.toggle("active", currentMode === "box");

  applyModeVisibility();
  updateConditionalUI();
  applyModeVisibility();
}

function initModeSwitch() {
  const cabinetBtn = $("cabinetModeBtn");
  const boxBtn = $("boxModeBtn");

  if (cabinetBtn) cabinetBtn.addEventListener("click", () => {
    setToolMode("cabinet");
    renderAll();
  });

  if (boxBtn) boxBtn.addEventListener("click", () => {
    setToolMode("box");
    renderAll();
  });

  setToolMode(currentMode);
}

function getState() {
  syncDoorFromBody();

  const bodyMaterial = getMaterial("body");
  const backMaterial = getMaterial("back");
  const doorMaterial = getMaterial("door");
  const materialSet = {
    body: bodyMaterial,
    back: backMaterial,
    door: doorMaterial,
  };
  materialSet.drawerSide = getMaterial("drawerSide");
  materialSet.drawerBottom = getMaterial("drawerBottom");
  materialSet.drawerFront = materialFromBaseRole(materialSet, resolveDrawerMaterialBase("front"), "drawerFront");

  const frontBackBase = resolveDrawerMaterialBase("frontBack");
  if (frontBackBase === "drawerSide") {
    materialSet.drawerFrontBack = materialFromBaseRole(materialSet, "drawerSide", "drawerFrontBack");
  } else {
    materialSet.drawerFrontBack = materialFromBaseRole(materialSet, frontBackBase, "drawerFrontBack");
  }

  const hingeOpt = selectedHingeOption();
  const slideOpt = selectedSlideOption();

  return {
    mode: currentMode,
    W: n("cabinetW"),
    H: n("cabinetH"),
    D: n("cabinetD"),
    t: n("boardT"),
    assemblyType: $("assemblyType").value,
    shelfCount: Math.max(0, Math.floor(n("shelfCount"))),
    shelfType: $("shelfType").value,
    shelfSpacingMode: $("shelfSpacingMode") ? $("shelfSpacingMode").value : "equal",
    shelfHeightsRaw: $("shelfHeightsRaw") ? $("shelfHeightsRaw").value : "",
    hasBack: $("hasBack").checked,
    backT: n("backT"),
    backType: $("backType").value,

    doorType: $("doorType").value,
    doorStyle: $("doorStyle").value,
    doorLayout: $("doorLayout").value,
    doorRows: Math.max(1, Math.floor(n("doorRows"))),
    doorT: n("doorT"),
    gap: n("gap"),
    overlay: n("overlay"),

    hasDrawers: $("hasDrawers").checked,
    drawerCount: Math.max(1, Math.floor(n("drawerCount"))),
    drawerFrontStyle: $("drawerFrontStyle").value,
    drawerFrontMaterialRole: $("drawerFrontMaterialRole").value,
    drawerFrontBackMaterialRole: $("drawerFrontBackMaterialRole").value,
    drawerBoxT: materialSet.drawerSide.thickness,
    drawerBottomT: materialSet.drawerBottom.thickness,
    drawerBoxH: n("drawerBoxH"),
    drawerBackClearance: n("drawerBackClearance"),

    hasToeKick: $("hasToeKick").checked,
    toeKickH: n("toeKickH"),
    toeKickInset: n("toeKickInset"),

    boxType: $("boxType") ? $("boxType").value : "openFront",
    boxUse: $("boxUse") ? $("boxUse").value : "prop",
    boxFrontPanelMode: $("boxFrontPanelMode") ? $("boxFrontPanelMode").value : "none",
    boxBackPanelMode: $("boxBackPanelMode") ? $("boxBackPanelMode").value : "inset",
    boxEndOverlay: $("boxEndOverlay") ? n("boxEndOverlay") : 1,
    boxHasLid: $("boxHasLid") ? $("boxHasLid").checked : false,
    boxHasInnerBottom: $("boxHasInnerBottom") ? $("boxHasInnerBottom").checked : false,
    boxLidOverlay: $("boxLidOverlay") ? n("boxLidOverlay") : 1,
    boxInnerBottomGap: $("boxInnerBottomGap") ? n("boxInnerBottomGap") : 0.2,

    materials: materialSet,
    doorSameAsBody: $("doorSameAsBody").checked,

    hardware: {
      hingeEnabled: $("hingeEnabled").checked,
      hingeType: $("hingeType").value,
      hingeLabel: hingeOpt.label,
      hingePrice: n("hingePrice"),
      hingeAuto: $("hingeAuto").checked,
      slideEnabled: $("slideEnabled").checked,
      slideType: $("slideType").value,
      slideLabel: slideOpt.label,
      slideLength: n("slideLength"),
      slidePrice: n("slidePrice"),
      slideClearance: slideOpt.clearance,
      handleEnabled: $("handleEnabled").checked,
      handlePrice: n("handlePrice"),
      shelfPinEnabled: $("shelfPinEnabled").checked,
      shelfPinPrice: n("shelfPinPrice"),
    },
  };
}

function addPart(name, role, material, thickness, length, width, qty, note = "", source = "formula") {
  if (length <= 0 || width <= 0 || qty <= 0) return null;

  return {
    id: `${source}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    name,
    role,
    roleName: roleNames[role] || role,
    materialKey: materialKey(material),
    material,
    materialType: material.type,
    materialName: material.materialName,
    thickness: cm(thickness),
    length: cm(length),
    width: cm(width),
    qty: Math.max(1, Math.floor(qty)),
    note,
    source,
  };
}

// -------- 核心木工公式 --------


function getDoorRows(state) {
  if (state.doorLayout === "byShelves") {
    return Math.max(1, state.shelfCount + 1);
  }

  if (state.doorLayout === "customRows") {
    return Math.max(1, state.doorRows);
  }

  return 1;
}

function getDoorPanelInfo(state) {
  const rows = getDoorRows(state);
  const columns = state.doorType === "double" ? 2 : state.doorType === "single" ? 1 : 0;
  let panelW = 0;
  let panelH = 0;
  let note = rows > 1 ? `依層板 / 列數分段，共 ${rows} 列` : "整面門片";

  if (state.doorStyle === "overlay") {
    const totalH = state.H + 2 * state.overlay;
    panelH = (totalH - (rows - 1) * state.gap) / rows;

    if (columns === 1) panelW = state.W + 2 * state.overlay;
    if (columns === 2) panelW = ((state.W + 2 * state.overlay) - state.gap) / 2;
  }

  if (state.doorStyle === "inset") {
    const openingH = state.H - 2 * state.t;
    panelH = (openingH - (rows + 1) * state.gap) / rows;

    if (columns === 1) panelW = state.W - 2 * state.t - 2 * state.gap;
    if (columns === 2) panelW = ((state.W - 2 * state.t) - 3 * state.gap) / 2;
  }

  return {
    rows,
    columns,
    doorCount: rows * columns,
    panelW: cm(panelW),
    panelH: cm(panelH),
    note,
  };
}



function getShelfOpeningLayout(state) {
  const shelfCount = Math.max(0, Math.floor(state.shelfCount || 0));
  const openingCount = shelfCount + 1;
  const available = cm(Math.max(0, state.H - 2 * state.t - shelfCount * state.t));

  if (shelfCount <= 0) {
    return {
      available,
      openings: [available],
      openingCount: 1,
      mode: "none",
      adjusted: false,
      warning: "",
    };
  }

  const equalValue = cm(available / openingCount);

  if (state.shelfSpacingMode !== "custom") {
    return {
      available,
      openings: Array(openingCount).fill(equalValue),
      openingCount,
      mode: "equal",
      adjusted: false,
      warning: "",
    };
  }

  const raw = String(state.shelfHeightsRaw || "").trim();
  if (!raw) {
    return {
      available,
      openings: Array(openingCount).fill(equalValue),
      openingCount,
      mode: "custom",
      adjusted: true,
      warning: "尚未輸入自訂格高，目前暫時用等分配置。",
    };
  }

  const tokens = raw.split(/[,，、\s]+/).map(s => s.trim()).filter(Boolean);
  const openings = [];
  const autoIndexes = [];
  let fixedSum = 0;

  for (let i = 0; i < openingCount; i++) {
    const token = tokens[i] || "auto";
    if (/^(auto|自動|\*)$/i.test(token)) {
      openings[i] = null;
      autoIndexes.push(i);
      continue;
    }

    const value = Number(token);
    if (Number.isFinite(value) && value > 0) {
      openings[i] = value;
      fixedSum += value;
    } else {
      openings[i] = null;
      autoIndexes.push(i);
    }
  }

  let warning = "";
  let adjusted = false;

  if (tokens.length !== openingCount) {
    warning += `輸入格數 ${tokens.length} 與應有格數 ${openingCount} 不一致；`;
    adjusted = true;
  }

  const remaining = cm(available - fixedSum);

  if (autoIndexes.length > 0) {
    const autoValue = cm(Math.max(1, remaining / autoIndexes.length));
    autoIndexes.forEach(index => openings[index] = autoValue);
    if (remaining < 0) {
      warning += "固定格高總和已超過可用高度，系統已壓縮 auto 格；";
      adjusted = true;
    }
  } else {
    const diff = cm(available - fixedSum);
    if (Math.abs(diff) > 0.1) {
      adjusted = true;
      if (fixedSum > available) {
        const ratio = available / fixedSum;
        for (let i = 0; i < openings.length; i++) openings[i] = cm(openings[i] * ratio);
        warning += "自訂格高總和超過可用高度，系統已等比例縮放；";
      } else {
        openings[openings.length - 1] = cm(openings[openings.length - 1] + diff);
        warning += `自訂格高總和小於可用高度，剩餘 ${cm(diff)} cm 已補到最後一格；`;
      }
    }
  }

  return {
    available,
    openings: openings.map(v => cm(Math.max(0, v || 0))),
    openingCount,
    mode: "custom",
    adjusted,
    warning,
  };
}

function getShelfCenterPositionsCm(state) {
  const shelfCount = Math.max(0, Math.floor(state.shelfCount || 0));
  if (shelfCount <= 0) return [];

  const layout = getShelfOpeningLayout(state);
  const positions = [];
  const topInnerY = state.H / 2 - state.t;

  let usedFromTop = 0;
  for (let i = 0; i < shelfCount; i++) {
    usedFromTop += layout.openings[i];
    const centerY = topInnerY - usedFromTop - i * state.t - state.t / 2;
    positions.push(cm(centerY));
  }

  return positions;
}

function renderShelfLayoutSummary(state) {
  const summary = $("shelfLayoutSummary");
  const options = $("shelfHeightOptions");
  if (!summary || !options) return;

  const hasShelves = Math.max(0, Math.floor(state.shelfCount || 0)) > 0;
  options.classList.toggle("is-hidden", !hasShelves);

  if (!hasShelves) {
    summary.textContent = "目前沒有層板。";
    return;
  }

  const layout = getShelfOpeningLayout(state);
  const list = layout.openings.map(v => `${cm(v)} cm`).join(" / ");
  const modeText = state.shelfSpacingMode === "custom" ? "自訂格高" : "自動等分";

  summary.classList.toggle("shelf-summary-warn", Boolean(layout.warning));
  summary.classList.toggle("shelf-summary-good", !layout.warning);

  summary.textContent = `${modeText}：由上到下淨空格高 ${list}。可用淨空總高 ${layout.available} cm。${layout.warning ? " " + layout.warning : ""}`;
}


function getDepthOffsets(state) {
  const frontInset = state.mode === "cabinet" && state.doorType !== "none" && state.doorStyle === "inset"
    ? state.t
    : 0;

  const backInset = state.mode === "cabinet" && state.hasBack && state.backType === "inset"
    ? state.backT
    : 0;

  return {
    frontInset: cm(frontInset),
    backInset: cm(backInset),
  };
}

function getShelfDepth(state) {
  const { frontInset, backInset } = getDepthOffsets(state);
  return cm(Math.max(0, state.D - frontInset - backInset));
}

function getShelfZOffset(state) {
  const { frontInset, backInset } = getDepthOffsets(state);
  return cm((frontInset - backInset) / 2);
}

function getDrawerFrontInfo(state) {
  const count = Math.max(1, state.drawerCount);
  let panelW = 0;
  let panelH = 0;

  if (state.drawerFrontStyle === "overlay") {
    panelW = state.W + 2 * state.overlay;
    panelH = ((state.H + 2 * state.overlay) - (count - 1) * state.gap) / count;
  } else {
    panelW = state.W - 2 * state.t - 2 * state.gap;
    panelH = ((state.H - 2 * state.t) - (count + 1) * state.gap) / count;
  }

  return { count, panelW: cm(panelW), panelH: cm(panelH) };
}

function calculateDrawerParts(state) {
  const parts = [];
  const frontMat = state.materials.drawerFront;
  const sideMat = state.materials.drawerSide;
  const frontBackMat = state.materials.drawerFrontBack;
  const bottomMat = state.materials.drawerBottom;

  const front = getDrawerFrontInfo(state);
  const slideClearanceTotal = (state.hardware.slideClearance || 1.3) * 2;
  const innerW = state.W - 2 * state.t;
  const boxOuterW = innerW - slideClearanceTotal;
  const boxDepth = Math.min(state.hardware.slideLength || 45, Math.max(1, state.D - state.drawerBackClearance));
  const boxT = state.materials.drawerSide.thickness;
  const frontBackT = state.materials.drawerFrontBack.thickness;
  const bottomT = state.materials.drawerBottom.thickness;
  const frontT = state.materials.drawerFront.thickness;
  const boxH = state.drawerBoxH;
  const backFrontW = boxOuterW - 2 * boxT;

  parts.push(addPart(
    state.drawerFrontStyle === "overlay" ? "外蓋抽屜面板" : "內嵌抽屜面板",
    "drawerFront", frontMat, frontT,
    front.panelH, front.panelW, front.count,
    `抽屜面板，共 ${front.count} 列`
  ));

  parts.push(addPart("抽屜左側板", "drawerSide", sideMat, boxT, boxDepth, boxH, front.count, "抽屜箱側板，可獨立指定板材"));
  parts.push(addPart("抽屜右側板", "drawerSide", sideMat, boxT, boxDepth, boxH, front.count, "抽屜箱側板，可獨立指定板材"));
  parts.push(addPart("抽屜前板", "drawerFrontBack", frontBackMat, frontBackT, backFrontW, boxH, front.count, "抽屜箱前板，扣左右側板厚"));
  parts.push(addPart("抽屜後板", "drawerFrontBack", frontBackMat, frontBackT, backFrontW, boxH, front.count, "抽屜箱後板，扣左右側板厚"));
  parts.push(addPart("抽屜底板", "drawerBottom", bottomMat, bottomT, boxOuterW, boxDepth, front.count, "抽屜底板，可獨立指定薄板"));

  return parts.filter(Boolean);
}





function getBoxDefaultPanelModes(boxType) {
  if (boxType === "openFront") return { front: "none", back: "inset" };
  if (boxType === "closed") return { front: "inset", back: "inset" };
  if (boxType === "openTop") return { front: "inset", back: "inset" };
  if (boxType === "tray") return { front: "inset", back: "inset" };
  return { front: "none", back: "inset" };
}

function applyBoxTypeDefaults() {
  const typeEl = $("boxType");
  const frontEl = $("boxFrontPanelMode");
  const backEl = $("boxBackPanelMode");
  if (!typeEl || !frontEl || !backEl) return;

  const defaults = getBoxDefaultPanelModes(typeEl.value);
  frontEl.value = defaults.front;
  backEl.value = defaults.back;
}

function boxPanelModeLabel(mode) {
  if (mode === "none") return "不使用";
  if (mode === "overlay") return "外蓋";
  return "內崁";
}

function getBoxPanelPart(state, position, bodyMat) {
  const mode = position === "front" ? state.boxFrontPanelMode : state.boxBackPanelMode;
  if (mode === "none") return null;

  const W = state.W;
  const H = state.H;
  const t = state.t;
  const overlay = state.boxEndOverlay || 0;
  const isTray = state.boxType === "tray";
  const hasTopBottom = state.boxType === "openFront" || state.boxType === "closed";

  const panelName = position === "front"
    ? (isTray ? "托盤前牆" : "箱體前板")
    : (isTray ? "托盤後牆" : "箱體後板");

  let length = W - 2 * t;
  let width = isTray ? Math.max(0, H - t) : H;

  if (mode === "inset") {
    length = W - 2 * t;
    width = isTray ? Math.max(0, H - t) : (hasTopBottom ? H - 2 * t : H);
  }

  if (mode === "overlay") {
    length = W + 2 * overlay;
    width = (isTray ? Math.max(0, H - t) : H) + 2 * overlay;
  }

  const posText = position === "front" ? "前板" : "後板";
  const note = mode === "overlay"
    ? `${posText}外蓋，含外蓋量 ${overlay} cm`
    : `${posText}內崁，扣左右${hasTopBottom && !isTray ? "與頂底" : ""}板厚`;

  return addPart(panelName, "body", bodyMat, t, length, width, 1, note);
}

function getBoxInternalDepth(state) {
  const frontInset = state.boxFrontPanelMode === "inset" ? state.t : 0;
  const backInset = state.boxBackPanelMode === "inset" ? state.t : 0;
  return cm(Math.max(0, state.D - frontInset - backInset));
}


function renderBoxTypeSummary(state) {
  const el = $("boxTypeSummary");
  if (!el) return;

  if (currentMode !== "box") return;

  const typeMap = {
    openFront: "前方開口箱：適合展示箱、機關箱外殼。前板通常不使用，後板常用內崁。",
    closed: "六面封閉箱：適合搬運箱、完全封閉道具箱。前後板可分別設為內崁或外蓋。",
    openTop: "上方開口箱：無上蓋，適合收納箱。前後板可獨立選內崁或外蓋。",
    tray: "淺盤 / 托盤：底板完整外寬外深，四邊牆立在底板上。前後牆也可改為外蓋。"
  };

  const front = boxPanelModeLabel(state.boxFrontPanelMode);
  const back = boxPanelModeLabel(state.boxBackPanelMode);
  const internalDepth = getBoxInternalDepth(state);
  const overlayText = state.boxFrontPanelMode === "overlay" || state.boxBackPanelMode === "overlay"
    ? `外蓋量 ${state.boxEndOverlay} cm。`
    : "";

  el.textContent = `${typeMap[state.boxType] || typeMap.openFront} 目前前板：${front}；後板：${back}。內部可用深度約 ${internalDepth} cm。${overlayText}`;
}

function calculateBoxParts(state) {
  const parts = [];
  const W = state.W;
  const H = state.H;
  const D = state.D;
  const t = state.t;
  const bodyMat = state.materials.body;
  const internalDepth = getBoxInternalDepth(state);

  // 箱體模式採「左右側板完整高度」作為主結構，前後板可個別內崁 / 外蓋 / 不使用。
  if (state.boxType === "openFront" || state.boxType === "closed") {
    parts.push(addPart("箱體左側板", "body", bodyMat, t, H, D, 1, "側板完整高度"));
    parts.push(addPart("箱體右側板", "body", bodyMat, t, H, D, 1, "側板完整高度"));
    parts.push(addPart("箱體頂板", "body", bodyMat, t, W - 2 * t, D, 1, "扣左右側板厚度"));
    parts.push(addPart("箱體底板", "body", bodyMat, t, W - 2 * t, D, 1, "扣左右側板厚度"));

    const frontPart = getBoxPanelPart(state, "front", bodyMat);
    const backPart = getBoxPanelPart(state, "back", bodyMat);
    if (frontPart) parts.push(frontPart);
    if (backPart) parts.push(backPart);
  }

  if (state.boxType === "openTop") {
    parts.push(addPart("箱體左側板", "body", bodyMat, t, H, D, 1, "上方開口箱：側板完整高度"));
    parts.push(addPart("箱體右側板", "body", bodyMat, t, H, D, 1, "上方開口箱：側板完整高度"));

    const frontPart = getBoxPanelPart(state, "front", bodyMat);
    const backPart = getBoxPanelPart(state, "back", bodyMat);
    if (frontPart) parts.push(frontPart);
    if (backPart) parts.push(backPart);

    parts.push(addPart("箱體底板", "body", bodyMat, t, W - 2 * t, internalDepth, 1, "上方開口箱底板，深度依前後板內崁狀態扣除"));
  }

  if (state.boxType === "tray") {
    parts.push(addPart("托盤底板", "body", bodyMat, t, W, D, 1, "托盤底板：完整外寬外深，四邊矮牆立在底板上"));
    const wallH = Math.max(0, H - t);
    parts.push(addPart("托盤左側牆", "body", bodyMat, t, wallH, D, 1, "托盤側牆，高度 = 外高 - 底板厚"));
    parts.push(addPart("托盤右側牆", "body", bodyMat, t, wallH, D, 1, "托盤側牆，高度 = 外高 - 底板厚"));

    const frontPart = getBoxPanelPart(state, "front", bodyMat);
    const backPart = getBoxPanelPart(state, "back", bodyMat);
    if (frontPart) parts.push(frontPart);
    if (backPart) parts.push(backPart);
  }

  if (state.boxHasLid) {
    parts.push(addPart("獨立上蓋板", "body", bodyMat, t, W + 2 * state.boxLidOverlay, D + 2 * state.boxLidOverlay, 1, "獨立上蓋，含外蓋量"));
  }

  if (state.boxHasInnerBottom) {
    parts.push(addPart("內底板", "body", bodyMat, t, W - 2 * t - 2 * state.boxInnerBottomGap, internalDepth - 2 * state.boxInnerBottomGap, 1, "箱體內底板，扣板厚、前後內崁與縮邊"));
  }

  return parts.filter(Boolean);
}

function calculateFormulaParts(state) {
  if (state.mode === "box") {
    return calculateBoxParts(state);
  }

  const parts = [];
  const {
    W, H, D, t,
    assemblyType,
    shelfCount, shelfType,
    hasBack, backT, backType,
    doorType, doorStyle, doorT, gap, overlay,
    hasToeKick, toeKickH, toeKickInset,
    materials
  } = state;

  const bodyMat = materials.body;
  const backMat = materials.back;
  const doorMat = materials.door;
  const shelfDepth = getShelfDepth(state);
  const { frontInset, backInset } = getDepthOffsets(state);

  if (assemblyType === "sideFull") {
    parts.push(addPart("左側板", "body", bodyMat, t, H, D, 1, "側板完整高度"));
    parts.push(addPart("右側板", "body", bodyMat, t, H, D, 1, "側板完整高度"));
    parts.push(addPart("頂板", "body", bodyMat, t, W - 2 * t, D, 1, "扣左右側板厚度"));
    parts.push(addPart("底板", "body", bodyMat, t, W - 2 * t, D, 1, "扣左右側板厚度"));

    if (shelfCount > 0) {
      const note = doorStyle === "inset" || (hasBack && backType === "inset")
        ? `扣左右側板厚度；層板深度 = D - 前預留 ${frontInset} - 背板預留 ${backInset}`
        : "扣左右側板厚度";
      parts.push(addPart(shelfType === "adjustable" ? "活動層板" : "固定層板", "body", bodyMat, t, W - 2 * t, shelfDepth, shelfCount, note));
    }
  }

  if (assemblyType === "topBottomWrap") {
    parts.push(addPart("頂板", "body", bodyMat, t, W, D, 1, "頂板完整寬度"));
    parts.push(addPart("底板", "body", bodyMat, t, W, D, 1, "底板完整寬度"));
    parts.push(addPart("左側板", "body", bodyMat, t, H - 2 * t, D, 1, "扣頂底板厚度"));
    parts.push(addPart("右側板", "body", bodyMat, t, H - 2 * t, D, 1, "扣頂底板厚度"));

    if (shelfCount > 0) {
      const note = doorStyle === "inset" || (hasBack && backType === "inset")
        ? `層板扣左右側板厚度；層板深度 = D - 前預留 ${frontInset} - 背板預留 ${backInset}`
        : "層板扣左右側板厚度";
      parts.push(addPart(shelfType === "adjustable" ? "活動層板" : "固定層板", "body", bodyMat, t, W - 2 * t, shelfDepth, shelfCount, note));
    }
  }

  if (hasBack) {
    if (backType === "external") {
      parts.push(addPart("背板", "back", backMat, backT, W, H, 1, "外貼背板，尺寸同外寬外高"));
    }

    if (backType === "inset") {
      parts.push(addPart("背板", "back", backMat, backT, W - 2 * t, H - 2 * t, 1, "內嵌背板，扣四周主板厚度"));
    }
  }

  if (doorType !== "none") {
    const doorInfo = getDoorPanelInfo(state);

    if (doorStyle === "overlay") {
      if (doorType === "single") {
        parts.push(addPart(
          doorInfo.rows > 1 ? "分段外蓋單門門片" : "外蓋單門門片",
          "door", doorMat, doorT,
          doorInfo.panelH, doorInfo.panelW,
          doorInfo.rows,
          `${doorInfo.note}；外蓋門，含外蓋量`
        ));
      }

      if (doorType === "double") {
        parts.push(addPart(
          doorInfo.rows > 1 ? "分段外蓋雙門門片" : "外蓋雙門門片",
          "door", doorMat, doorT,
          doorInfo.panelH, doorInfo.panelW,
          doorInfo.rows * 2,
          `${doorInfo.note}；每片門寬 = ((W + 2overlay) - gap) / 2`
        ));
      }
    }

    if (doorStyle === "inset") {
      if (doorType === "single") {
        parts.push(addPart(
          doorInfo.rows > 1 ? "分段內嵌單門門片" : "內嵌單門門片",
          "door", doorMat, doorT,
          doorInfo.panelH, doorInfo.panelW,
          doorInfo.rows,
          `${doorInfo.note}；內嵌門，扣側板與門縫`
        ));
      }

      if (doorType === "double") {
        parts.push(addPart(
          doorInfo.rows > 1 ? "分段內嵌雙門門片" : "內嵌雙門門片",
          "door", doorMat, doorT,
          doorInfo.panelH, doorInfo.panelW,
          doorInfo.rows * 2,
          `${doorInfo.note}；每片門寬 = ((W - 2t) - 3gap) / 2`
        ));
      }
    }
  }

  if (state.hasDrawers) {
    parts.push(...calculateDrawerParts(state));
  }

  if (hasToeKick && toeKickH > 0) {
    const kickDepth = Math.max(0, D - toeKickInset);
    parts.push(addPart("前踢腳板", "body", bodyMat, t, W - 2 * t, toeKickH, 1, "簡化估算，前方踢腳"));
    parts.push(addPart("左踢腳側板", "body", bodyMat, t, kickDepth, toeKickH, 1, "簡化估算，左側踢腳"));
    parts.push(addPart("右踢腳側板", "body", bodyMat, t, kickDepth, toeKickH, 1, "簡化估算，右側踢腳"));
  }

  return parts.filter(Boolean);
}

// -------- 簡易矩形排版 --------

function expandParts(parts) {
  const expanded = [];
  parts.forEach((part) => {
    for (let i = 0; i < part.qty; i++) {
      expanded.push({
        ...part,
        instanceId: `${part.id}_${i + 1}`,
        qty: 1,
        label: part.qty > 1 ? `${part.name} #${i + 1}` : part.name,
      });
    }
  });
  return expanded;
}

function candidateOrientations(piece, sheetW, sheetL) {
  const a = { w: piece.width, h: piece.length, rotated: false };
  const b = { w: piece.length, h: piece.width, rotated: true };
  const candidates = [];
  if (a.w <= sheetW && a.h <= sheetL) candidates.push(a);
  if (b.w <= sheetW && b.h <= sheetL && (b.w !== a.w || b.h !== a.h)) candidates.push(b);

  // 優先讓比較短的高度放進目前 shelf，可降低開新 shelf 機率
  candidates.sort((x, y) => x.h - y.h);
  return candidates;
}

function tryPlaceOnSheet(sheet, piece, material) {
  const candidates = candidateOrientations(piece, material.sheetW, material.sheetL);
  if (candidates.length === 0) return false;

  // 先塞進現有 shelf
  for (const shelf of sheet.shelves) {
    for (const c of candidates) {
      if (c.h <= shelf.h && shelf.x + c.w <= material.sheetW) {
        const placed = { ...piece, x: shelf.x, y: shelf.y, w: c.w, h: c.h, rotated: c.rotated };
        sheet.placements.push(placed);
        shelf.x += c.w;
        return true;
      }
    }
  }

  // 再開新 shelf
  for (const c of candidates) {
    if (sheet.usedY + c.h <= material.sheetL) {
      const shelf = { x: c.w, y: sheet.usedY, h: c.h };
      sheet.shelves.push(shelf);
      const placed = { ...piece, x: 0, y: sheet.usedY, w: c.w, h: c.h, rotated: c.rotated };
      sheet.placements.push(placed);
      sheet.usedY += c.h;
      return true;
    }
  }

  return false;
}

function packMaterialGroup(parts, material) {
  const pieces = expandParts(parts).sort((a, b) => {
    const maxA = Math.max(a.length, a.width);
    const maxB = Math.max(b.length, b.width);
    return (maxB * Math.min(b.length, b.width)) - (maxA * Math.min(a.length, a.width));
  });

  const sheets = [];
  const unplaced = [];

  pieces.forEach((piece) => {
    if (candidateOrientations(piece, material.sheetW, material.sheetL).length === 0) {
      unplaced.push(piece);
      return;
    }

    let placed = false;
    for (const sheet of sheets) {
      if (tryPlaceOnSheet(sheet, piece, material)) {
        placed = true;
        break;
      }
    }

    if (!placed) {
      const newSheet = { placements: [], shelves: [], usedY: 0 };
      tryPlaceOnSheet(newSheet, piece, material);
      sheets.push(newSheet);
    }
  });

  const usedArea = parts.reduce((sum, part) => sum + part.length * part.width * part.qty, 0);
  const sheetArea = material.sheetW * material.sheetL;
  const totalSheetArea = sheets.length * sheetArea;
  const utilization = totalSheetArea > 0 ? usedArea / totalSheetArea : 0;

  return {
    key: materialKey(material),
    material,
    parts,
    sheets,
    unplaced,
    usedArea,
    sheetArea,
    totalSheetArea,
    utilization,
    cost: sheets.length * material.sheetPrice,
  };
}

function groupAndPack(parts) {
  const map = new Map();

  parts.forEach((part) => {
    const key = part.materialKey;
    if (!map.has(key)) {
      map.set(key, { material: part.material, parts: [] });
    }
    map.get(key).parts.push(part);
  });

  return [...map.values()].map((group) => packMaterialGroup(group.parts, group.material));
}

// -------- 驗證 --------

function validate(state, allParts, layoutGroups) {
  const warnings = [];

  if (state.W <= state.t * 2) warnings.push("外寬 W 必須大於主結構板厚的 2 倍，否則頂底板或層板會變成負尺寸。");
  if (state.H <= state.t * 2) warnings.push("外高 H 必須大於主結構板厚的 2 倍，否則內嵌門或背板可能變成負尺寸。");
  if (state.D <= 0) warnings.push("外深 D 必須大於 0。");
  if (state.t <= 0) warnings.push("主結構板厚不可為 0。");
  if (state.backT <= 0 && state.hasBack) warnings.push("背板厚度不可為 0。");
  if (state.doorT <= 0 && (state.doorType !== "none" || state.hasDrawers)) warnings.push("門片 / 抽屜面板厚度不可為 0。");
  if (state.hasDrawers && state.drawerBoxT <= 0) warnings.push("抽屜側板 / 前後板厚不可為 0。");
  if (state.hasDrawers && state.drawerBottomT <= 0) warnings.push("抽屜底板厚不可為 0。");
  if (state.hasDrawers && state.drawerBoxH <= 0) warnings.push("抽屜箱側板高度不可為 0。");
  if (state.hasDrawers && state.materials.drawerSide.thickness < 0.9) warnings.push("抽屜側板厚度低於 0.9cm，通常偏薄；若要做耐用抽屜，建議改選較厚夾板、木心板或系統板。");
  if (state.hasDrawers && state.materials.drawerBottom.type === "blockboard" && state.materials.drawerBottom.thickness < 1.5) warnings.push("抽屜底板目前選到木心板但厚度偏薄，請確認板材設定；實務上抽屜底板通常會用薄夾板。");
  if (state.gap < 0) warnings.push("門縫 gap 不可為負數。");

  if (state.mode === "box" && state.boxType === "tray" && state.H <= state.t) {
    warnings.push("托盤外高必須大於板厚，否則四邊矮牆會沒有有效高度。");
  }

  if (state.mode === "box" && state.boxFrontPanelMode === "none" && state.boxBackPanelMode === "none") {
    warnings.push("箱體前板與後板都未使用，請確認是否需要前後方向開口。");
  }

  if (state.mode === "box" && getBoxInternalDepth(state) <= 0) {
    warnings.push("箱體內部可用深度小於或等於 0，請檢查外深與前後板內崁設定。");
  }

  if (state.shelfCount > 0 && state.shelfSpacingMode === "custom") {
    const shelfLayout = getShelfOpeningLayout(state);
    if (shelfLayout.warning) warnings.push(`層板高度配置：${shelfLayout.warning}`);
  }

  if (state.doorType !== "none") {
    const info = getDoorPanelInfo(state);
    if (info.panelH <= 0 || info.panelW <= 0) warnings.push("門片分段後尺寸小於或等於 0，請檢查層板數量、門縫、板厚與外蓋量。");
  }

  if (state.hasDrawers) {
    const front = getDrawerFrontInfo(state);
    if (front.panelH <= 0 || front.panelW <= 0) warnings.push("抽屜面板尺寸小於或等於 0，請檢查抽屜數量、門縫、板厚與外蓋量。");
  }

  Object.values(state.materials).forEach((mat) => {
    if (mat.sheetL <= 0 || mat.sheetW <= 0) warnings.push(`${mat.roleName}原板尺寸不可為 0。`);
  });

  allParts.forEach((part) => {
    if (part.length <= 0 || part.width <= 0) {
      warnings.push(`${part.name} 的尺寸小於或等於 0，請檢查櫃體尺寸、板厚、門縫或外蓋量。`);
    }

    if (!canFitOnSheet(part, part.material)) {
      warnings.push(`${part.name} ${part.length} × ${part.width} cm 可能超過原板 ${part.material.sheetW} × ${part.material.sheetL} cm，請確認是否可旋轉裁切或需更大原板。`);
    }
  });

  layoutGroups.forEach((group) => {
    group.unplaced.forEach((piece) => {
      warnings.push(`${piece.label} 無法放入 ${materialTitle(group.material)}，請更換更大原板或拆件。`);
    });
  });

  return warnings;
}

// -------- 渲染 --------


function hingeCountByHeight(heightCm) {
  if (heightCm <= 90) return 2;
  if (heightCm <= 160) return 3;
  return 4;
}

function calculateHardware(state) {
  const items = [];
  let hingeQty = 0;
  let handleQty = 0;
  let drawerSlideQty = 0;
  let shelfPinQty = 0;

  if (state.doorType !== "none" && state.hardware.hingeEnabled && state.hardware.hingeType !== "none") {
    const info = getDoorPanelInfo(state);
    const perDoor = state.hardware.hingeAuto ? hingeCountByHeight(info.panelH) : 2;
    hingeQty = info.doorCount * perDoor;
    items.push({
      name: state.hardware.hingeLabel,
      qty: hingeQty,
      unit: "顆",
      unitPrice: state.hardware.hingePrice,
      cost: hingeQty * state.hardware.hingePrice,
      note: `門片 ${info.doorCount} 片，每片 ${perDoor} 顆，門高約 ${info.panelH} cm`,
    });
  }

  if (state.hasDrawers && state.hardware.slideEnabled && state.hardware.slideType !== "none") {
    drawerSlideQty = state.drawerCount;
    items.push({
      name: state.hardware.slideLabel,
      qty: drawerSlideQty,
      unit: "組",
      unitPrice: state.hardware.slidePrice,
      cost: drawerSlideQty * state.hardware.slidePrice,
      note: `抽屜 ${state.drawerCount} 組，滑軌長 ${state.hardware.slideLength} cm，預估單側間隙 ${state.hardware.slideClearance} cm`,
    });
  }

  if (state.hardware.handleEnabled) {
    const doorInfo = state.doorType !== "none" ? getDoorPanelInfo(state) : { doorCount: 0 };
    handleQty = doorInfo.doorCount + (state.hasDrawers ? state.drawerCount : 0);
    if (handleQty > 0) {
      items.push({
        name: "把手 / 取手",
        qty: handleQty,
        unit: "個",
        unitPrice: state.hardware.handlePrice,
        cost: handleQty * state.hardware.handlePrice,
        note: `門片與抽屜面板合計 ${handleQty} 個`,
      });
    }
  }

  if (state.hardware.shelfPinEnabled && state.shelfType === "adjustable" && state.shelfCount > 0) {
    shelfPinQty = state.shelfCount * 4;
    items.push({
      name: "活動層板粒",
      qty: shelfPinQty,
      unit: "顆",
      unitPrice: state.hardware.shelfPinPrice,
      cost: shelfPinQty * state.hardware.shelfPinPrice,
      note: `活動層板 ${state.shelfCount} 片，每片 4 顆`,
    });
  }

  const cost = items.reduce((sum, item) => sum + item.cost, 0);
  return { items, cost, hingeQty, handleQty, drawerSlideQty, shelfPinQty };
}

function renderHardware(state, hardware) {
  const box = $("hardwareSummary");
  if (!box) return;

  const hingeRec = getDoorHardwareRecommendation(state);
  const slideRec = getSlideHardwareRecommendation(state);

  const hingeOn = state.hardware.hingeEnabled && state.doorType !== "none";
  const slideOn = state.hardware.slideEnabled && state.hasDrawers;

  $("hingeRecommend").textContent = state.doorType === "none"
    ? hingeRec.text
    : hingeOn
      ? hingeRec.text
      : `已手動取消鉸鍊估算。系統原本推薦 ${hingeRec.total} 顆，但目前不計入成本。`;

  $("slideRecommend").textContent = !state.hasDrawers
    ? slideRec.text
    : slideOn
      ? slideRec.text
      : `已手動取消滑軌估算。系統原本推薦 ${slideRec.total} 組，但目前不計入成本。`;

  const handleOn = state.hardware.handleEnabled;
  const shelfPinOn = state.hardware.shelfPinEnabled;

  $("hingeOptions").classList.toggle("is-hidden", !hingeOn);
  $("slideOptions").classList.toggle("is-hidden", !slideOn);
  $("handleOptions").classList.toggle("is-hidden", !handleOn);
  $("shelfPinOptions").classList.toggle("is-hidden", !shelfPinOn);
  $("hingeCard").classList.toggle("is-inactive", !hingeOn);
  $("slideCard").classList.toggle("is-inactive", !slideOn);

  const quick = $("hardwareQuickSummary");
  if (quick) {
    const rows = [];
    if (state.doorType !== "none") {
      rows.push(`<div class="hardware-pill"><span>鉸鍊推薦</span><strong>${hingeRec.total} 顆</strong></div>`);
    }
    if (state.hasDrawers) {
      rows.push(`<div class="hardware-pill"><span>滑軌推薦</span><strong>${slideRec.total} 組</strong></div>`);
    }
    if (!rows.length) {
      rows.push(`<div class="hardware-pill"><span>目前沒有必要五金</span><strong>未啟用</strong></div>`);
    }
    quick.innerHTML = rows.join("");
  }

  const hint = $("hardwareHint");
  if (hint) {
    if (state.doorType === "none" && !state.hasDrawers) {
      hint.textContent = "目前未選門片或抽屜，五金區已縮小顯示。";
    } else {
      hint.textContent = "已依目前門片與抽屜設定推薦必要五金，可自行調整類型與單價。";
    }
  }

  if (hardware.items.length === 0) {
    box.innerHTML = `<div class="hardware-line">目前沒有估算五金。</div>`;
  } else {
    box.innerHTML = hardware.items.map((item) => `
      <div class="hardware-line">
        <strong>${escapeHtml(item.name)}</strong>：${item.qty} ${item.unit} × ${money(item.unitPrice)} = <strong>${money(item.cost)}</strong><br>
        ${escapeHtml(item.note)}
      </div>
    `).join("");
  }

  const detail = $("hardwareDetails");
  if (detail) {
    detail.innerHTML = `
      <div class="hardware-detail-grid">
        ${hardware.items.map((item) => `
          <div class="hardware-detail-card">
            <strong>${escapeHtml(item.name)}</strong><br>
            數量：${item.qty} ${item.unit}<br>
            單價：${money(item.unitPrice)}<br>
            小計：${money(item.cost)}<br>
            ${escapeHtml(item.note)}
          </div>
        `).join("")}
      </div>
    `;
  }
}

function renderAll() {
  autoSuggestHardwareFromFeatures();
  updateConditionalUI();
  applyModeVisibility();
  const state = getState();
  lastState = state;

  formulaParts = calculateFormulaParts(state);

  // 讓自訂板件的 material 資料保持最新
  customParts = customParts.map((part) => refreshCustomPartMaterial(part, state));

  const allParts = [...formulaParts, ...customParts];
  const layoutGroups = groupAndPack(allParts);
  lastLayoutGroups = layoutGroups;

  const hardware = calculateHardware(state);

  renderSummary(layoutGroups, hardware);
  renderHardware(state, hardware);
  renderLayoutSummary(layoutGroups);
  renderSheetLayouts(layoutGroups);
  renderShelfLayoutSummary(state);
  renderBoxTypeSummary(state);
  renderWarnings(validate(state, allParts, layoutGroups));
  renderTable(state, allParts);
  render3D(state);
  renderEngineeringDrawing(state);

  $("dimensionText").textContent = `外尺寸：${state.W} × ${state.H} × ${state.D} cm`;
  applyModeVisibility();
}

function refreshCustomPartMaterial(part, state) {
  let role = part.role || "body";
  if (role === "drawerbox") role = "drawerSide";
  const material = state.materials[role] || state.materials.body;

  return {
    ...part,
    role,
    roleName: roleNames[role] || role,
    material,
    materialKey: materialKey(material),
    materialType: material.type,
    materialName: material.materialName,
  };
}


function mmText(cmValue) {
  return `${Math.round(cmValue * 10)} mm`;
}

function escAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

function renderEngineeringDrawing(state) {
  const panel = $("engineeringPanel");
  const wrap = $("engineeringSvgWrap");
  const caption = $("engineeringCaption");
  if (!panel || !wrap) return;

  if (!engineeringViewEnabled) {
    panel.classList.add("is-hidden");
    wrap.innerHTML = "";
    return;
  }

  panel.classList.remove("is-hidden");

  const svgW = 1000;
  const svgH = 760;
  const bg = "#201922";
  const line = "#f1ecff";
  const dim = "#c8bde0";
  const guide = "#8f83a8";
  const accent = "#fff7b1";

  const topBox = { x: 80, y: 70, w: 410, h: 120 };
  const frontBox = { x: 80, y: 230, w: 410, h: 430 };
  const sideBox = { x: 610, y: 230, w: 180, h: 430 };
  const titleX = 90;

  const scale = Math.min(
    topBox.w / Math.max(1, state.W),
    topBox.h / Math.max(1, state.D),
    frontBox.w / Math.max(1, state.W),
    frontBox.h / Math.max(1, state.H),
    sideBox.w / Math.max(1, state.D),
    sideBox.h / Math.max(1, state.H)
  );

  const { frontInset, backInset } = getDepthOffsets(state);
  const shelfDepth = getShelfDepth(state);
  const shelfCount = state.mode === "cabinet" ? state.shelfCount : 0;

  function dimH(x1, x2, y, text) {
    return `
      <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${dim}" stroke-width="1.2"/>
      <line x1="${x1}" y1="${y - 7}" x2="${x1}" y2="${y + 7}" stroke="${dim}" stroke-width="1.2"/>
      <line x1="${x2}" y1="${y - 7}" x2="${x2}" y2="${y + 7}" stroke="${dim}" stroke-width="1.2"/>
      <text x="${(x1 + x2) / 2}" y="${y - 10}" fill="${dim}" font-size="16" text-anchor="middle">${escAttr(text)}</text>
    `;
  }

  function dimV(x, y1, y2, text) {
    return `
      <line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${dim}" stroke-width="1.2"/>
      <line x1="${x - 7}" y1="${y1}" x2="${x + 7}" y2="${y1}" stroke="${dim}" stroke-width="1.2"/>
      <line x1="${x - 7}" y1="${y2}" x2="${x + 7}" y2="${y2}" stroke="${dim}" stroke-width="1.2"/>
      <text x="${x - 12}" y="${(y1 + y2) / 2}" fill="${dim}" font-size="16" text-anchor="middle"
        transform="rotate(-90 ${x - 12} ${(y1 + y2) / 2})">${escAttr(text)}</text>
    `;
  }

  function drawRect(x, y, w, h, stroke = line, dash = "") {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${stroke}" stroke-width="2" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
  }

  // Top
  const topW = state.W * scale;
  const topD = state.D * scale;
  const topX = topBox.x + (topBox.w - topW) / 2;
  const topY = topBox.y + (topBox.h - topD) / 2;

  // Front
  const frontW = state.W * scale;
  const frontH = state.H * scale;
  const frontX = frontBox.x + (frontBox.w - frontW) / 2;
  const frontY = frontBox.y + (frontBox.h - frontH) / 2;

  // Side
  const sideD = state.D * scale;
  const sideH = state.H * scale;
  const sideX = sideBox.x + (sideBox.w - sideD) / 2;
  const sideY = sideBox.y + (sideBox.h - sideH) / 2;

  let svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
      <rect x="0" y="0" width="${svgW}" height="${svgH}" fill="${bg}"/>
      <text x="${titleX}" y="38" fill="${line}" font-size="24" font-weight="700">工程三視圖</text>
      <text x="${titleX}" y="62" fill="${guide}" font-size="14">模式：${state.mode === "box" ? "箱體模式" : "櫃體模式"}｜外尺寸 ${state.W} × ${state.H} × ${state.D} cm</text>

      <text x="${topBox.x}" y="${topBox.y - 18}" fill="${guide}" font-size="16">俯視圖 TOP</text>
      ${drawRect(topX, topY, topW, topD)}
      ${dimH(topX, topX + topW, topY - 18, mmText(state.W))}
      ${dimV(topX + topW + 22, topY, topY + topD, mmText(state.D))}

      <text x="${frontBox.x}" y="${frontBox.y - 18}" fill="${guide}" font-size="16">正視圖 FRONT</text>
      ${drawRect(frontX, frontY, frontW, frontH)}
      ${dimH(frontX, frontX + frontW, frontY + frontH + 28, mmText(state.W))}
      ${dimV(frontX - 22, frontY, frontY + frontH, mmText(state.H))}

      <text x="${sideBox.x}" y="${sideBox.y - 18}" fill="${guide}" font-size="16">側視圖 SIDE</text>
      ${drawRect(sideX, sideY, sideD, sideH)}
      ${dimH(sideX, sideX + sideD, sideY + sideH + 28, mmText(state.D))}
      ${dimV(sideX - 22, sideY, sideY + sideH, mmText(state.H))}
  `;

  // Top/Bottom board guide lines in FRONT + SIDE
  const topBoardY = frontY + state.t * scale;
  const bottomBoardY = frontY + frontH - state.t * scale;
  svg += `
    <line x1="${frontX}" y1="${topBoardY}" x2="${frontX + frontW}" y2="${topBoardY}" stroke="${guide}" stroke-width="1" stroke-dasharray="4 4"/>
    <line x1="${frontX}" y1="${bottomBoardY}" x2="${frontX + frontW}" y2="${bottomBoardY}" stroke="${guide}" stroke-width="1" stroke-dasharray="4 4"/>
    <line x1="${sideX}" y1="${sideY + state.t * scale}" x2="${sideX + sideD}" y2="${sideY + state.t * scale}" stroke="${guide}" stroke-width="1" stroke-dasharray="4 4"/>
    <line x1="${sideX}" y1="${sideY + sideH - state.t * scale}" x2="${sideX + sideD}" y2="${sideY + sideH - state.t * scale}" stroke="${guide}" stroke-width="1" stroke-dasharray="4 4"/>
  `;

  // Shelves in front and side
  if (state.mode === "cabinet" && shelfCount > 0) {
    const shelfFrontDepthPx = shelfDepth * scale;
    const shelfZPx = getShelfZOffset(state) * scale;
    const shelfSideX = sideX + (sideD - shelfFrontDepthPx) / 2 + shelfZPx;
    const shelfCentersCm = getShelfCenterPositionsCm(state);

    shelfCentersCm.forEach((centerYcm) => {
      const y = frontY + frontH / 2 - centerYcm * scale;
      svg += `
        <line x1="${frontX}" y1="${y}" x2="${frontX + frontW}" y2="${y}" stroke="${line}" stroke-width="2"/>
        <line x1="${shelfSideX}" y1="${sideY + sideH / 2 - centerYcm * scale}" x2="${shelfSideX + shelfFrontDepthPx}" y2="${sideY + sideH / 2 - centerYcm * scale}" stroke="${line}" stroke-width="2"/>
      `;
    });
  }

  // Inset back guides in top / side
  if (state.mode === "cabinet" && state.hasBack && state.backType === "inset") {
    const backLineXTop = topX + topW - state.backT * scale;
    const backLineXSide = sideX + sideD - state.backT * scale;
    svg += `
      <line x1="${backLineXTop}" y1="${topY}" x2="${backLineXTop}" y2="${topY + topD}" stroke="${accent}" stroke-width="1.5" stroke-dasharray="5 4"/>
      <line x1="${backLineXSide}" y1="${sideY}" x2="${backLineXSide}" y2="${sideY + sideH}" stroke="${accent}" stroke-width="1.5" stroke-dasharray="5 4"/>
    `;
  }

  // Inset front guide in top / side
  if (state.mode === "cabinet" && state.doorType !== "none" && state.doorStyle === "inset") {
    const frontGuideXTop = topX + state.t * scale;
    const frontGuideXSide = sideX + state.t * scale;
    svg += `
      <line x1="${frontGuideXTop}" y1="${topY}" x2="${frontGuideXTop}" y2="${topY + topD}" stroke="${accent}" stroke-width="1.5" stroke-dasharray="5 4"/>
      <line x1="${frontGuideXSide}" y1="${sideY}" x2="${frontGuideXSide}" y2="${sideY + sideH}" stroke="${accent}" stroke-width="1.5" stroke-dasharray="5 4"/>
    `;
  }

  // Door rectangles in FRONT
  if (state.mode === "cabinet" && state.doorType !== "none") {
    const info = getDoorPanelInfo(state);
    const rows = info.rows;
    const cols = info.columns;
    const panelW = info.panelW * scale;
    const panelH = info.panelH * scale;
    const gapPx = state.gap * scale;
    const totalH = rows * panelH + (rows - 1) * gapPx;
    const startY = frontY + frontH / 2 - totalH / 2 + panelH / 2;
    const totalW = cols === 2 ? panelW * 2 + gapPx : panelW;
    const startX = frontX + frontW / 2 - totalW / 2;

    for (let r = 0; r < rows; r++) {
      const y = startY + r * (panelH + gapPx) - panelH / 2;
      if (cols === 1) {
        svg += drawRect(startX, y, panelW, panelH, "#d5d0ff", "4 3");
      } else {
        svg += drawRect(startX, y, panelW, panelH, "#d5d0ff", "4 3");
        svg += drawRect(startX + panelW + gapPx, y, panelW, panelH, "#d5d0ff", "4 3");
      }
    }
  }

  // Box mode internal guides
  if (state.mode === "box") {
    if (state.boxHasLid) {
      svg += `<text x="${sideBox.x + 5}" y="${sideBox.y + sideBox.h + 58}" fill="${accent}" font-size="14">＊包含獨立上蓋</text>`;
    }
    if (state.boxHasInnerBottom) {
      svg += `<text x="${sideBox.x + 5}" y="${sideBox.y + sideBox.h + 80}" fill="${accent}" font-size="14">＊包含內底板</text>`;
    }
  }

  // Notes
  const note1 = state.mode === "cabinet" && state.doorType !== "none" && state.doorStyle === "inset"
    ? `內崁門層板深度：${state.D} - ${state.t} - ${state.hasBack && state.backType === "inset" ? state.backT : 0} = ${shelfDepth} cm`
    : `層板深度：${shelfDepth} cm`;

  const note2 = state.mode === "cabinet" && state.hasBack && state.backType === "inset"
    ? `已扣除內嵌背板厚度 ${state.backT} cm`
    : "背板未占用內部層板深度";

  svg += `
      <text x="80" y="710" fill="${line}" font-size="15">${escAttr(note1)}</text>
      <text x="80" y="734" fill="${guide}" font-size="14">${escAttr(note2)}</text>
    </svg>
  `;

  wrap.innerHTML = svg;

  if (caption) {
    caption.textContent = `目前設定：${state.mode === "box" ? "箱體" : "櫃體"}｜俯視圖 / 正視圖 / 側視圖`;
  }
}

function downloadEngineeringPng() {
  const svgWrap = $("engineeringSvgWrap");
  if (!svgWrap || !svgWrap.querySelector("svg")) {
    alert("請先按「產出工程三視圖」。");
    return;
  }

  const svg = svgWrap.querySelector("svg");
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svg);
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = svg.viewBox.baseVal.width * 2;
    canvas.height = svg.viewBox.baseVal.height * 2;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#201922";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "wood-cabinet-engineering-view.png";
    a.click();
  };

  img.src = url;
}


function renderSummary(layoutGroups, hardware = { cost: 0 }) {
  const totalSheets = layoutGroups.reduce((sum, group) => sum + group.sheets.length, 0);
  const usedArea = layoutGroups.reduce((sum, group) => sum + group.usedArea, 0);
  const totalSheetArea = layoutGroups.reduce((sum, group) => sum + group.totalSheetArea, 0);
  const materialCost = layoutGroups.reduce((sum, group) => sum + group.cost, 0);
  const utilization = totalSheetArea > 0 ? usedArea / totalSheetArea : 0;

  $("totalSheets").textContent = `${totalSheets} 張`;
  $("totalUtilization").textContent = `${(utilization * 100).toFixed(1)}%`;
  $("totalCost").textContent = money(materialCost);
  $("hardwareCost").textContent = money(hardware.cost || 0);
  $("projectCost").textContent = money(materialCost + (hardware.cost || 0));
}

function renderLayoutSummary(layoutGroups) {
  const box = $("layoutSummary");
  box.innerHTML = "";

  layoutGroups.forEach((group) => {
    const div = document.createElement("div");
    div.className = "material-summary-card";
    div.innerHTML = `
      <h3>${escapeHtml(group.material.materialName)}｜厚 ${group.material.thickness} cm</h3>
      <p>原板：<strong>${group.material.sheetW} × ${group.material.sheetL} cm</strong></p>
      <p>需要：<strong>${group.sheets.length} 張</strong></p>
      <p>利用率：<strong>${(group.utilization * 100).toFixed(1)}%</strong></p>
      <p>成本：<strong>${money(group.cost)}</strong></p>
      <p>板件：${group.parts.map(p => escapeHtml(p.name)).join("、")}</p>
    `;
    box.appendChild(div);
  });
}

function renderWarnings(warnings) {
  const box = $("warnings");
  box.innerHTML = "";

  warnings.forEach((msg) => {
    const div = document.createElement("div");
    div.className = "warning-item";
    div.textContent = msg;
    box.appendChild(div);
  });
}

function renderSheetLayouts(layoutGroups) {
  const box = $("sheetLayouts");
  box.innerHTML = "";

  if (layoutGroups.length === 0) {
    box.innerHTML = `<p class="notice">目前沒有可排版的板件。</p>`;
    return;
  }

  layoutGroups.forEach((group) => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "material-layout-group";

    const sheetsHtml = group.sheets.map((sheet, index) => {
      return renderOneSheetSvg(sheet, group.material, index + 1);
    }).join("");

    groupDiv.innerHTML = `
      <h3>${escapeHtml(materialTitle(group.material))}</h3>
      <p class="sheet-note">
        此組共 ${group.sheets.length} 張，利用率 ${(group.utilization * 100).toFixed(1)}%，估計成本 ${money(group.cost)}。
      </p>
      <div class="sheet-grid">${sheetsHtml}</div>
    `;

    box.appendChild(groupDiv);
  });
}

function pieceClassColor(index) {
  const colors = [
    { fill: "#dff0ff", stroke: "#0b6bbf", text: "#084b83" },
    { fill: "#fff0c9", stroke: "#e76f00", text: "#8a4300" },
    { fill: "#e6f7ea", stroke: "#36a66c", text: "#1f6b43" },
    { fill: "#efe9ff", stroke: "#7b61b8", text: "#4d3a82" },
    { fill: "#ffe6e1", stroke: "#d84a38", text: "#84291f" },
    { fill: "#e8f0f0", stroke: "#577070", text: "#344646" },
  ];
  return colors[index % colors.length];
}

function renderOneSheetSvg(sheet, material, sheetIndex) {
  const viewW = material.sheetW;
  const viewH = material.sheetL;

  const rects = sheet.placements.map((p, i) => {
    const c = pieceClassColor(i);
    const itemNo = i + 1;
    const centerX = p.x + p.w / 2;
    const centerY = p.y + p.h / 2;

    // 以前小板件會完全沒有文字。v1.8 改成：
    // 1. 大板件顯示完整名稱 + 尺寸
    // 2. 中小板件至少顯示編號
    // 3. 圖下方永遠列完整對照清單
    const canShowFullName = p.w >= 28 && p.h >= 16;
    const canShowShortName = p.w >= 18 && p.h >= 10;
    const shortName = p.name.length > 5 ? `${p.name.slice(0, 5)}…` : p.name;
    const badgeR = Math.max(2.5, Math.min(4.2, Math.min(p.w, p.h) / 4));
    const badgeX = p.x + badgeR + 1.2;
    const badgeY = p.y + badgeR + 1.2;

    return `
      <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="${c.fill}" stroke="${c.stroke}" stroke-width="0.8"></rect>
      <circle cx="${badgeX}" cy="${badgeY}" r="${badgeR}" fill="${c.stroke}" opacity="0.95"></circle>
      <text x="${badgeX}" y="${badgeY + 0.15}" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-size="${Math.max(3, badgeR * 1.15)}" font-weight="800">${itemNo}</text>
      ${canShowFullName ? `
        <text x="${centerX}" y="${centerY - 3.5}" text-anchor="middle" dominant-baseline="middle" fill="${c.text}" font-size="5.2" font-weight="700">${escapeHtml(p.name)}</text>
        <text x="${centerX}" y="${centerY + 4.2}" text-anchor="middle" dominant-baseline="middle" fill="${c.text}" font-size="4.3">${p.length}×${p.width}</text>
      ` : canShowShortName ? `
        <text x="${centerX}" y="${centerY + 1}" text-anchor="middle" dominant-baseline="middle" fill="${c.text}" font-size="4.2" font-weight="700">${escapeHtml(shortName)}</text>
      ` : `
        <title>#${itemNo} ${escapeHtml(p.name)} ${p.length}×${p.width} cm</title>
      `}
    `;
  }).join("");

  const usedArea = sheet.placements.reduce((sum, p) => sum + p.length * p.width, 0);
  const utilization = (usedArea / (material.sheetW * material.sheetL)) * 100;

  const partList = sheet.placements.map((p, i) => {
    const itemNo = i + 1;
    const rotatedText = p.rotated ? "｜已旋轉" : "";
    return `
      <div class="sheet-part-row">
        <span class="sheet-part-badge">#${itemNo}</span>
        <strong title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</strong>
        <span class="sheet-part-size">${p.length}×${p.width} cm${rotatedText}</span>
      </div>
    `;
  }).join("");

  return `
    <div class="sheet-card">
      <h4>板材 #${sheetIndex}｜${material.sheetW} × ${material.sheetL} cm</h4>
      <div class="sheet-svg-wrap">
        <svg class="sheet-svg" viewBox="0 0 ${viewW} ${viewH}" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="${viewW}" height="${viewH}" fill="#ffffff" stroke="#2c3e50" stroke-width="0.7"></rect>
          ${rects}
        </svg>
      </div>
      <p class="sheet-note">本張利用率約 ${utilization.toFixed(1)}%</p>
      <div class="sheet-part-list">
        ${partList}
      </div>
    </div>
  `;
}

function renderTable(state, allParts) {
  const tbody = $("cutTable").querySelector("tbody");
  tbody.innerHTML = "";

  allParts.forEach((part, index) => {
    const tr = document.createElement("tr");
    const oversize = !canFitOnSheet(part, part.material);
    if (oversize) tr.classList.add("oversize");

    const partArea = areaM2(part).toFixed(3);
    const isCustom = part.source === "custom";

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><input data-id="${part.id}" data-field="name" value="${escapeHtml(part.name)}"></td>
      <td>
        <select data-id="${part.id}" data-field="role" ${isCustom ? "" : ""}>
          ${Object.entries(roleNames).filter(([key]) => key !== "custom").map(([key, name]) => `<option value="${key}" ${key === part.role ? "selected" : ""}>${name}</option>`).join("")}
        </select>
      </td>
      <td>${escapeHtml(part.materialName)}</td>
      <td><input type="number" data-id="${part.id}" data-field="thickness" value="${part.thickness}" ${isCustom ? "" : "readonly"}></td>
      <td><input type="number" data-id="${part.id}" data-field="length" value="${part.length}" ${isCustom ? "" : "readonly"}></td>
      <td><input type="number" data-id="${part.id}" data-field="width" value="${part.width}" ${isCustom ? "" : "readonly"}></td>
      <td><input type="number" data-id="${part.id}" data-field="qty" value="${part.qty}" ${isCustom ? "" : "readonly"}></td>
      <td>${partArea}</td>
      <td><input data-id="${part.id}" data-field="note" value="${escapeHtml(part.note || "")}"></td>
      <td>${isCustom ? `<button class="danger small-btn" data-delete="${part.id}">刪除</button>` : `<span class="hint">公式</span>`}</td>
    `;

    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("change", handlePartEdit);
  });

  tbody.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      customParts = customParts.filter((p) => p.id !== btn.dataset.delete);
      renderAll();
    });
  });
}

function handlePartEdit(event) {
  const id = event.target.dataset.id;
  const field = event.target.dataset.field;
  if (!id || !field) return;

  let part = customParts.find((p) => p.id === id);

  if (!part) {
    // 公式板件可改名稱、分組與備註；尺寸由公式控制
    const formulaPart = formulaParts.find((p) => p.id === id);
    if (formulaPart && ["name", "role", "note"].includes(field)) {
      formulaPart[field] = parseMaybeNumber(field, event.target.value);
      if (field === "role") {
        const material = lastState.materials[event.target.value] || lastState.materials.body;
        formulaPart.material = material;
        formulaPart.materialKey = materialKey(material);
        formulaPart.materialType = material.type;
        formulaPart.materialName = material.materialName;
      }
      const allParts = [...formulaParts, ...customParts];
      const layoutGroups = groupAndPack(allParts);
      const hardware = calculateHardware(lastState);
      renderSummary(layoutGroups, hardware);
      renderHardware(lastState, hardware);
      renderLayoutSummary(layoutGroups);
      renderSheetLayouts(layoutGroups);
      return;
    }
    renderAll();
    return;
  }

  part[field] = parseMaybeNumber(field, event.target.value);
  renderAll();
}

// -------- 匯出 --------

function getAllPartsForExport() {
  return [...formulaParts, ...customParts];
}

function exportCSV() {
  const rows = [
    ["編號", "板件名稱", "分組", "板材", "厚度cm", "長度cm", "寬度cm", "數量", "面積m2", "備註"]
  ];

  getAllPartsForExport().forEach((part, index) => {
    rows.push([
      index + 1,
      part.name,
      part.roleName,
      part.materialName,
      part.thickness,
      part.length,
      part.width,
      part.qty,
      areaM2(part).toFixed(3),
      part.note || "",
    ]);
  });

  rows.push([]);
  rows.push(["板材分組", "板材", "原板尺寸", "張數", "利用率", "成本"]);
  lastLayoutGroups.forEach((group) => {
    rows.push([
      group.material.roleName,
      `${group.material.materialName} 厚 ${group.material.thickness} cm`,
      `${group.material.sheetW} × ${group.material.sheetL} cm`,
      group.sheets.length,
      `${(group.utilization * 100).toFixed(1)}%`,
      group.cost,
    ]);
  });

  const hardware = lastState ? calculateHardware(lastState) : { items: [] };
  rows.push([]);
  rows.push(["五金項目", "數量", "單位", "單價", "小計", "備註"]);
  hardware.items.forEach((item) => {
    rows.push([item.name, item.qty, item.unit, item.unitPrice, item.cost, item.note]);
  });

  const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `木工櫃體裁切清單_v1.2_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}

async function copyCutList() {
  const lines = getAllPartsForExport().map((part, index) => {
    return `${index + 1}. ${part.name}｜${part.roleName}｜${part.materialName}｜厚 ${part.thickness}｜${part.length} × ${part.width} cm｜${part.qty}片｜${part.note || ""}`;
  });

  const summary = lastLayoutGroups.map((group) => {
    return `${group.material.materialName} 厚 ${group.material.thickness}cm：${group.sheets.length}張，利用率 ${(group.utilization * 100).toFixed(1)}%，成本 ${money(group.cost)}`;
  });

  const hardware = lastState ? calculateHardware(lastState) : { items: [] };
  const hardwareLines = hardware.items.map((item) => `${item.name}：${item.qty}${item.unit} × ${money(item.unitPrice)} = ${money(item.cost)}｜${item.note}`);

  const text = [...lines, "", "板材估算：", ...summary, "", "五金估算：", ...hardwareLines].join("\n");

  try {
    await navigator.clipboard.writeText(text);
    alert("裁切清單與板材估算已複製。");
  } catch (err) {
    alert("瀏覽器不允許直接複製，請手動選取表格內容。");
  }
}

// -------- 儲存 / 載入 --------

function collectControlState() {
  const state = {};
  document.querySelectorAll("input, select").forEach((el) => {
    if (!el.id) return;
    state[el.id] = el.type === "checkbox" ? el.checked : el.value;
  });
  return state;
}

function saveProject() {
  localStorage.setItem("twWoodCabinetMvpV12", JSON.stringify({
    controls: collectControlState(),
    customParts,
  }));
  alert("方案已儲存到此瀏覽器。");
}

function loadProject() {
  const raw = localStorage.getItem("twWoodCabinetMvpV12");
  if (!raw) {
    alert("目前沒有已儲存的方案。");
    return;
  }

  try {
    const saved = JSON.parse(raw);
    Object.entries(saved.controls || {}).forEach(([id, value]) => {
      if ($(id)) setValue(id, value);
    });

    ["body", "back", "door", "drawerSide", "drawerBottom"].forEach((role) => {
      populateSpecs(role, Number($(`${role}MaterialSpec`).value) || 0, false);
      syncSheetPreset(role);
    });

    customParts = saved.customParts || [];
    updateConditionalUI();
    renderAll();
  } catch (err) {
    alert("載入失敗，儲存資料可能損壞。");
  }
}

function resetAll() {
  if (!confirm("確定要重設為預設值？自訂板件也會清除。")) return;
  localStorage.removeItem("twWoodCabinetMvpV12");
  customParts = [];
  location.reload();
}

// -------- 3D --------

let scene, camera, renderer, controls, cabinetGroup;

function init3D() {
  if (!window.THREE) {
    $("threeFallback").classList.remove("hidden");
    return;
  }

  const wrap = $("threeWrap");
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfbf8f2);

  const width = wrap.clientWidth;
  const height = wrap.clientHeight;

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
  camera.position.set(7, 6, 8);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  wrap.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.72);
  scene.add(ambient);

  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5, 8, 6);
  scene.add(dir);

  const grid = new THREE.GridHelper(12, 12, 0x9b8a78, 0xd4cabd);
  grid.position.y = -3;
  scene.add(grid);

  if (THREE.OrbitControls) {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
  }

  cabinetGroup = new THREE.Group();
  scene.add(cabinetGroup);

  window.addEventListener("resize", resize3D);
  animate3D();
}

function resize3D() {
  if (!renderer || !camera) return;
  const wrap = $("threeWrap");
  const width = wrap.clientWidth;
  const height = wrap.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function animate3D() {
  requestAnimationFrame(animate3D);
  if (controls) controls.update();
  if (renderer && scene && camera) renderer.render(scene, camera);
}


function renderBox3D(state, scale, board, mats) {
  if (state.mode !== "box") return false;

  const W = state.W * scale;
  const H = state.H * scale;
  const D = state.D * scale;
  const t = state.t * scale;
  const overlay = (state.boxEndOverlay || 0) * scale;

  const matBody = mats.body;
  const matPanel = mats.door;

  function panel3D(position, mode, panelH = H) {
    if (mode === "none") return;
    const isFront = position === "front";
    const label = isFront ? "箱體前板" : "箱體後板";
    const zSign = isFront ? -1 : 1;
    const z = mode === "overlay"
      ? zSign * (D / 2 + t / 2)
      : zSign * (D / 2 - t / 2);

    const sx = mode === "overlay" ? W + 2 * overlay : W - 2 * t;
    const sy = mode === "overlay" ? panelH + 2 * overlay : panelH;

    board(label, sx, sy, t, 0, 0, z, matPanel);
  }

  if (state.boxType === "openFront" || state.boxType === "closed") {
    board("箱體左側板", t, H, D, -W / 2 + t / 2, 0, 0, matBody);
    board("箱體右側板", t, H, D, W / 2 - t / 2, 0, 0, matBody);
    board("箱體頂板", W - 2 * t, t, D, 0, H / 2 - t / 2, 0, matBody);
    board("箱體底板", W - 2 * t, t, D, 0, -H / 2 + t / 2, 0, matBody);

    const insetPanelH = H - 2 * t;
    panel3D("front", state.boxFrontPanelMode, state.boxFrontPanelMode === "inset" ? insetPanelH : H);
    panel3D("back", state.boxBackPanelMode, state.boxBackPanelMode === "inset" ? insetPanelH : H);
  }

  if (state.boxType === "openTop") {
    board("箱體左側板", t, H, D, -W / 2 + t / 2, 0, 0, matBody);
    board("箱體右側板", t, H, D, W / 2 - t / 2, 0, 0, matBody);
    panel3D("front", state.boxFrontPanelMode, H);
    panel3D("back", state.boxBackPanelMode, H);

    const internalDepth = getBoxInternalDepth(state) * scale;
    const zOffset = ((state.boxFrontPanelMode === "inset" ? t : 0) - (state.boxBackPanelMode === "inset" ? t : 0)) / 2;
    board("箱體底板", W - 2 * t, t, internalDepth, 0, -H / 2 + t / 2, zOffset, matBody);
  }

  if (state.boxType === "tray") {
    const wallH = Math.max(t, H - t);
    const wallY = -H / 2 + t + wallH / 2;
    board("托盤底板", W, t, D, 0, -H / 2 + t / 2, 0, matBody);
    board("托盤左側牆", t, wallH, D, -W / 2 + t / 2, wallY, 0, matBody);
    board("托盤右側牆", t, wallH, D, W / 2 - t / 2, wallY, 0, matBody);

    function trayWall(position, mode) {
      if (mode === "none") return;
      const isFront = position === "front";
      const label = isFront ? "托盤前牆" : "托盤後牆";
      const zSign = isFront ? -1 : 1;
      const z = mode === "overlay"
        ? zSign * (D / 2 + t / 2)
        : zSign * (D / 2 - t / 2);
      const sx = mode === "overlay" ? W + 2 * overlay : W - 2 * t;
      const sy = mode === "overlay" ? wallH + 2 * overlay : wallH;
      board(label, sx, sy, t, 0, wallY, z, matPanel);
    }

    trayWall("front", state.boxFrontPanelMode);
    trayWall("back", state.boxBackPanelMode);
  }

  if (state.boxHasLid) {
    const lidOverlay = state.boxLidOverlay * scale;
    board("獨立上蓋", W + 2 * lidOverlay, t, D + 2 * lidOverlay, 0, H / 2 + t * 1.5, 0, mats.door);
  }

  if (state.boxHasInnerBottom) {
    const gap = state.boxInnerBottomGap * scale;
    const internalDepth = getBoxInternalDepth(state) * scale;
    board("內底板", W - 2 * t - 2 * gap, t * 0.7, internalDepth - 2 * gap, 0, -H / 2 + t * 2.2, 0, mats.shelf);
  }

  return true;
}

function render3D(state) {
  if (!cabinetGroup || !window.THREE) return;

  while (cabinetGroup.children.length) {
    cabinetGroup.remove(cabinetGroup.children[0]);
  }

  const scale = 1 / Math.max(state.W, state.H, state.D) * 5.2;
  const W = state.W * scale;
  const H = state.H * scale;
  const D = state.D * scale;
  const t = state.t * scale;
  const backT = state.backT * scale;
  const doorT = state.doorT * scale;
  const gap = state.gap * scale;
  const overlay = state.overlay * scale;

  const matBody = new THREE.MeshStandardMaterial({ color: 0xb9895d, roughness: 0.75, transparent: true, opacity: 0.9 });
  const matShelf = new THREE.MeshStandardMaterial({ color: 0xcaa77e, roughness: 0.75, transparent: true, opacity: 0.86 });
  const matBack = new THREE.MeshStandardMaterial({ color: 0x8e7b65, roughness: 0.8, transparent: true, opacity: 0.45 });
  const matDoor = new THREE.MeshStandardMaterial({ color: 0x6f4f31, roughness: 0.75, transparent: true, opacity: 0.68 });
  const matToe = new THREE.MeshStandardMaterial({ color: 0x4f3b2a, roughness: 0.8, transparent: true, opacity: 0.85 });
  const matDrawerFront = new THREE.MeshStandardMaterial({ color: 0x7d4f32, roughness: 0.75, transparent: true, opacity: 0.72 });
  const matDrawerBox = new THREE.MeshStandardMaterial({ color: 0xd4b086, roughness: 0.75, transparent: true, opacity: 0.78 });
  const matDrawerBottom = new THREE.MeshStandardMaterial({ color: 0xbca084, roughness: 0.75, transparent: true, opacity: 0.55 });

  function board(name, sx, sy, sz, x, y, z, mat) {
    const geo = new THREE.BoxGeometry(Math.max(sx, 0.001), Math.max(sy, 0.001), Math.max(sz, 0.001));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.name = name;
    cabinetGroup.add(mesh);

    const edges = new THREE.EdgesGeometry(geo);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x3a2a1f, transparent: true, opacity: 0.35 }));
    line.position.copy(mesh.position);
    cabinetGroup.add(line);
  }

  if (renderBox3D(state, scale, board, {
    body: matBody,
    shelf: matShelf,
    back: matBack,
    door: matDoor,
  })) {
    cabinetGroup.rotation.y = -0.25;
    return;
  }

  if (state.assemblyType === "sideFull") {
    board("左側板", t, H, D, -W / 2 + t / 2, 0, 0, matBody);
    board("右側板", t, H, D, W / 2 - t / 2, 0, 0, matBody);
    board("頂板", W - 2 * t, t, D, 0, H / 2 - t / 2, 0, matBody);
    board("底板", W - 2 * t, t, D, 0, -H / 2 + t / 2, 0, matBody);
  } else {
    board("頂板", W, t, D, 0, H / 2 - t / 2, 0, matBody);
    board("底板", W, t, D, 0, -H / 2 + t / 2, 0, matBody);
    board("左側板", t, H - 2 * t, D, -W / 2 + t / 2, 0, 0, matBody);
    board("右側板", t, H - 2 * t, D, W / 2 - t / 2, 0, 0, matBody);
  }

  if (state.shelfCount > 0) {
    const shelfDepth = getShelfDepth(state) * scale;
    const shelfZ = getShelfZOffset(state) * scale;
    const shelfCentersCm = getShelfCenterPositionsCm(state);
    shelfCentersCm.forEach((centerYcm, index) => {
      board(`層板 ${index + 1}`, W - 2 * t, t, shelfDepth, 0, centerYcm * scale, shelfZ, matShelf);
    });
  }

  if (state.hasBack) {
    if (state.backType === "external") {
      board("外貼背板", W, H, backT, 0, 0, D / 2 + backT / 2, matBack);
    } else {
      board("內嵌背板", W - 2 * t, H - 2 * t, backT, 0, 0, D / 2 - backT / 2, matBack);
    }
  }

  if (state.doorType !== "none") {
    const doorZ = state.doorStyle === "inset"
      ? -D / 2 + doorT / 2
      : -D / 2 - doorT / 2;
    const info = getDoorPanelInfo(state);
    const rows = info.rows;
    const panelH = info.panelH * scale;
    const panelW = info.panelW * scale;
    const scaledGap = state.gap * scale;

    let totalFrontH = rows * panelH + (rows - 1) * scaledGap;
    let startY = totalFrontH / 2 - panelH / 2;

    for (let r = 0; r < rows; r++) {
      const y = startY - r * (panelH + scaledGap);

      if (state.doorType === "single") {
        board("門片", panelW, panelH, doorT, 0, y, doorZ, matDoor);
      } else {
        board("左門片", panelW, panelH, doorT, -scaledGap / 2 - panelW / 2, y, doorZ, matDoor);
        board("右門片", panelW, panelH, doorT, scaledGap / 2 + panelW / 2, y, doorZ, matDoor);
      }
    }
  }

  renderDrawer3D(state, scale, board, {
    drawerFront: matDrawerFront,
    drawerBox: matDrawerBox,
    drawerBottom: matDrawerBottom,
  });

  if (state.hasToeKick && state.toeKickH > 0) {
    const kickH = state.toeKickH * scale;
    const kickInset = state.toeKickInset * scale;
    board("前踢腳", W - 2 * t, kickH, t, 0, -H / 2 - kickH / 2, -D / 2 + kickInset, matToe);
  }

  cabinetGroup.rotation.y = -0.25;
}


function updateConditionalUI() {
  const isBox = currentMode === "box";
  const hasBack = $("hasBack").checked;
  const hasDoor = $("doorType").value !== "none";
  const hasToeKick = $("hasToeKick").checked;
  const hasDrawers = $("hasDrawers").checked;
  const doorSame = $("doorSameAsBody").checked;
  const hasShelves = Number($("shelfCount").value || 0) > 0;
  const isCustomShelfSpacing = $("shelfSpacingMode") && $("shelfSpacingMode").value === "custom";

  const toggle = (id, show) => {
    const el = $(id);
    if (el) el.classList.toggle("is-hidden", !show);
  };

  toggle("backOptions", hasBack);
  toggle("backMaterialPanel", hasBack);
  toggle("doorOptions", hasDoor);
  toggle("doorMaterialPanel", hasDoor || hasDrawers);
  toggle("doorMaterialCustomOptions", (hasDoor || hasDrawers) && !doorSame);
  toggle("toeKickOptions", hasToeKick);
  toggle("shelfHeightOptions", hasShelves && !isBox);
  const shelfInput = $("shelfHeightsRaw");
  if (shelfInput) shelfInput.closest("label").classList.toggle("is-hidden", !(hasShelves && isCustomShelfSpacing && !isBox));

  toggle("drawerOptions", hasDrawers && !isBox);
  toggle("drawerSideMaterialPanel", hasDrawers && !isBox);
  toggle("drawerBottomMaterialPanel", hasDrawers && !isBox);

  toggle("boxOptions", isBox);
  toggle("backOptions", hasBack && !isBox);
  toggle("backMaterialPanel", hasBack && !isBox);
  toggle("doorOptions", hasDoor && !isBox);
  toggle("doorMaterialPanel", (hasDoor || hasDrawers) && !isBox);
  toggle("toeKickOptions", hasToeKick && !isBox);

  const cabinetOnlySelectors = ["[data-feature='back']", "[data-feature='door']", "[data-feature='toeKick']", "[data-feature='drawers']", ".hardware-panel"];
  cabinetOnlySelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => el.classList.toggle("is-hidden", isBox));
  });

  const rowsInput = $("doorRows");
  if (rowsInput) {
    const showDoorRows = hasDoor && $("doorLayout").value === "customRows";
    rowsInput.closest("label").classList.toggle("is-hidden", !showDoorRows);
  }

  const hingeOptions = $("hingeOptions");
  const slideOptions = $("slideOptions");
  const handleOptions = $("handleOptions");
  const shelfPinOptions = $("shelfPinOptions");
  if (hingeOptions) hingeOptions.classList.toggle("is-hidden", !$("hingeEnabled").checked || $("doorType").value === "none");
  if (slideOptions) slideOptions.classList.toggle("is-hidden", !$("slideEnabled").checked || !$("hasDrawers").checked);
  if (handleOptions) handleOptions.classList.toggle("is-hidden", !$("handleEnabled").checked);
  if (shelfPinOptions) shelfPinOptions.classList.toggle("is-hidden", !$("shelfPinEnabled").checked);


  // v2.6：箱體模式強制收合櫃體專用區塊，避免手機與桌機殘留無關設定。
  const forceHiddenInBox = [
    "structureSection",
    "backMaterialPanel",
    "doorMaterialPanel",
    "drawerSideMaterialPanel",
    "drawerBottomMaterialPanel"
  ];

  forceHiddenInBox.forEach((id) => {
    const el = $(id);
    if (el) el.classList.toggle("is-hidden", isBox);
  });

  document.querySelectorAll("[data-feature='back'], [data-feature='door'], [data-feature='toeKick'], [data-feature='drawers'], .hardware-panel")
    .forEach((el) => el.classList.toggle("is-hidden", isBox));

  applyModeVisibility();
  const drawerHint = $("uiHint");
  if (drawerHint) {
    const active = [];
    if (hasBack) active.push("背板");
    if (hasDoor) active.push("門片");
    if (hasDrawers) active.push("抽屜");
    if (hasToeKick) active.push("踢腳板");
    drawerHint.textContent = active.length
      ? `目前啟用：${active.join("、")}。未啟用的設定已自動收合。`
      : "目前只計算基本櫃體。勾選背板、門片、抽屜或踢腳板後會顯示細部設定。";
  }
}


function renderDrawer3D(state, scale, board, mats) {
  if (!state.hasDrawers) return;

  const W = state.W * scale;
  const H = state.H * scale;
  const D = state.D * scale;
  const t = state.t * scale;
  const doorT = state.doorT * scale;
  const gap = state.gap * scale;
  const overlay = state.overlay * scale;
  const drawerBoxT = state.drawerBoxT * scale;
  const drawerBottomT = state.drawerBottomT * scale;
  const drawerBoxH = state.drawerBoxH * scale;
  const drawerCount = Math.max(1, state.drawerCount);

  const front = getDrawerFrontInfo(state);
  const panelW = front.panelW * scale;
  const panelH = front.panelH * scale;

  const slideClearanceTotal = (state.hardware.slideClearance || 1.3) * 2;
  const innerWcm = state.W - 2 * state.t;
  const boxOuterW = Math.max(0.5, (innerWcm - slideClearanceTotal) * scale);
  const boxDepth = Math.min(state.hardware.slideLength || 45, Math.max(1, state.D - state.drawerBackClearance)) * scale;
  const backFrontW = Math.max(0.5, boxOuterW - 2 * drawerBoxT);

  const frontZ = -D / 2 - doorT / 2;
  const boxZ = -D / 2 + boxDepth / 2 + 0.8 * scale;

  const totalFrontH = drawerCount * panelH + (drawerCount - 1) * gap;
  const startY = totalFrontH / 2 - panelH / 2;

  for (let i = 0; i < drawerCount; i++) {
    const y = startY - i * (panelH + gap);

    // 抽屜面板
    board(`抽屜面板 ${i + 1}`, panelW, panelH, doorT, 0, y, frontZ, mats.drawerFront);

    // 抽屜箱體，稍微往後，讓使用者能看見它存在
    const boxY = y;
    board(`抽屜左側板 ${i + 1}`, drawerBoxT, drawerBoxH, boxDepth, -boxOuterW / 2 + drawerBoxT / 2, boxY, boxZ, mats.drawerBox);
    board(`抽屜右側板 ${i + 1}`, drawerBoxT, drawerBoxH, boxDepth, boxOuterW / 2 - drawerBoxT / 2, boxY, boxZ, mats.drawerBox);
    board(`抽屜前板 ${i + 1}`, backFrontW, drawerBoxH, drawerBoxT, 0, boxY, boxZ - boxDepth / 2 + drawerBoxT / 2, mats.drawerBox);
    board(`抽屜後板 ${i + 1}`, backFrontW, drawerBoxH, drawerBoxT, 0, boxY, boxZ + boxDepth / 2 - drawerBoxT / 2, mats.drawerBox);
    board(`抽屜底板 ${i + 1}`, boxOuterW, drawerBottomT, boxDepth, 0, boxY - drawerBoxH / 2 + drawerBottomT / 2, boxZ, mats.drawerBottom);
  }
}

// -------- 事件 --------

function addCustomPart() {
  const state = getState();
  const material = state.materials.body;

  customParts.push({
    id: `custom_${Date.now()}`,
    name: "自訂板件",
    role: "body",
    roleName: roleNames.body,
    material,
    materialKey: materialKey(material),
    materialType: material.type,
    materialName: material.materialName,
    thickness: material.thickness,
    length: 30,
    width: 30,
    qty: 1,
    note: "手動新增",
    source: "custom",
  });

  renderAll();
}

function bindEvents() {
  document.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("input", () => {
      updateConditionalUI();
      const role = el.dataset.role;
      const kind = el.dataset.kind;

      if (kind === "type") {
        populateSpecs(role, 0, true);
      }

      if (kind === "spec") {
        updateSpecUseText(role, true);
      }

      if (kind === "sheetPreset") {
        syncSheetPreset(role);
      }

      if (["bodySheetW", "bodySheetL"].includes(el.id)) $("bodySheetPreset").value = "custom";
      if (["backSheetW", "backSheetL"].includes(el.id)) $("backSheetPreset").value = "custom";
      if (["doorSheetW", "doorSheetL"].includes(el.id)) $("doorSheetPreset").value = "custom";
      if (["drawerSideSheetW", "drawerSideSheetL"].includes(el.id)) $("drawerSideSheetPreset").value = "custom";
      if (["drawerBottomSheetW", "drawerBottomSheetL"].includes(el.id)) $("drawerBottomSheetPreset").value = "custom";

      if (el.id === "hingeType") {
        const opt = selectedHingeOption();
        $("hingePrice").value = opt.price;
      }

      if (el.id === "boxType") {
        applyBoxTypeDefaults();
      }

      if (el.id === "slideType") {
        const opt = selectedSlideOption();
        $("slidePrice").value = opt.price;
      }

      if (el.id === "doorSameAsBody") {
        syncDoorFromBody();
      }

      if (el.id.startsWith("body") && $("doorSameAsBody").checked) {
        syncDoorFromBody();
      }

      renderAll();
    });
  });

  $("recalcBtn").addEventListener("click", renderAll);
  $("exportCsvBtn").addEventListener("click", exportCSV);
  $("copyBtn").addEventListener("click", copyCutList);
  $("printBtn").addEventListener("click", () => window.print());
  $("addPartBtn").addEventListener("click", addCustomPart);
  $("saveBtn").addEventListener("click", saveProject);
  $("loadBtn").addEventListener("click", loadProject);
  $("resetBtn").addEventListener("click", resetAll);

  const generateDrawingBtn = $("generateDrawingBtn");
  if (generateDrawingBtn) {
    generateDrawingBtn.addEventListener("click", () => {
      engineeringViewEnabled = true;
      renderEngineeringDrawing(lastState || getState());
    });
  }

  const downloadDrawingBtn = $("downloadDrawingBtn");
  if (downloadDrawingBtn) {
    downloadDrawingBtn.addEventListener("click", downloadEngineeringPng);
  }
}


let deferredInstallPrompt = null;


function initMobileSectionNav() {
  document.querySelectorAll(".mobile-section-nav [data-scroll-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.dataset.scrollTarget);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function initPWA() {
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("./service-worker.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    const btn = $("installBtn");
    if (btn) btn.classList.remove("is-hidden");
  });

  const installBtn = $("installBtn");
  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredInstallPrompt) {
        alert("若你使用 iPhone，請用 Safari 分享按鈕 → 加入主畫面。Android Chrome 通常可直接安裝。");
        return;
      }

      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      installBtn.classList.add("is-hidden");
    });
  }

  const mobileRecalc = $("mobileRecalcBtn");
  if (mobileRecalc) mobileRecalc.addEventListener("click", renderAll);

  const mobileSave = $("mobileSaveBtn");
  if (mobileSave) mobileSave.addEventListener("click", saveProject);

  const mobileExport = $("mobileExportBtn");
  if (mobileExport) mobileExport.addEventListener("click", exportCSV);

  const mobileTop = $("mobileTopBtn");
  if (mobileTop) mobileTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

window.addEventListener("DOMContentLoaded", () => {
  initPWA();
  initMobileSectionNav();
  initMaterialControls();
  initModeSwitch();
  bindEvents();
  updateConditionalUI();
  init3D();
  renderAll();
  applyModeVisibility();
});
