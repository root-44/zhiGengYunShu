import fs from "fs";

// Read the file once
let content = fs.readFileSync("src/main.jsx", "utf8");

// Each entry: find exact text → replace with comment
// Order: data first, then utils, then UI components
const replacements = [
  // === Data ===
  // iconPaths
  [
    `const iconPaths = {\n  leaf: "M19 3C10 4 5 9 5 17c4-1 8-4 11-8M5 17c0 2 2 4 5 4 6 0 9-6 9-18",\n  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",\n  task: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",\n  scan: "M4 7V4h3M17 4h3v3M20 17v3h-3M7 20H4v-3M8 12h8M12 8v8",\n  chat: "M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z",\n  store: "M4 10h16l-1-6H5l-1 6Zm2 0v10h12V10M8 14h3v6M14 14h2M3 10c0 2 2 3 4 2 1.2.8 2.8.8 4 0 1.2.8 2.8.8 4 0 2 1 4 0 4-2",\n  device: "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm5 17h.01M8 6h8",\n  water: "M12 2C8 7 6 10 6 14a6 6 0 0 0 12 0c0-4-2-7-6-12Z",\n  community: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",\n  greenhouse: "M3 11h18M5 11l7-7 7 7M5 11v9h14v-9M9 20v-5h6v5",\n  map: "M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6",\n  close: "M6 6l12 12M18 6 6 18",\n  user: "M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",\n  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"\n};`,
    `// iconPaths → data/icons.js`
  ],
  // taskTargetsByName
  [
    `const taskTargetsByName = {\n  "灌溉操作": "irrigation-task",\n  "病虫检测": "disease-detection",\n  "设备排查": "device-check",\n  "施肥操作": "fertilization-task"\n};`,
    `// taskTargetsByName → utils/helpers.js`
  ],
];

let replaced = 0;
let notFound = 0;

for (const [oldText, newText] of replacements) {
  if (content.includes(oldText)) {
    content = content.replace(oldText, newText);
    replaced++;
  } else {
    console.log("NOT FOUND:", oldText.slice(0, 60) + "...");
    notFound++;
  }
}

console.log(`Replaced: ${replaced}, Not found: ${notFound}`);

// Add imports after the existing styles.css import
const imports = [
  `import iconPaths from "./data/icons.js";`,
].join("\n");

content = content.replace(
  'import "./styles.css";',
  'import "./styles.css";\n' + imports
);

fs.writeFileSync("src/main.jsx", content);
console.log("Done. Imports added to main.jsx");
