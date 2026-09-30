import fs from "fs";

const content = fs.readFileSync("src/main.jsx", "utf8");
const lines = content.split("\n");

const fns = ["FarmThreeMap", "FarmerSidebar", "ProfileModal"];
const toRemove = [];

for (const name of fns) {
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("function " + name + "(")) {
      startIdx = i;
      break;
    }
  }
  if (startIdx < 0) { console.log(name + " not found"); continue; }

  let braceDepth = 0;
  let endIdx = startIdx;
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === "{") braceDepth++;
      if (ch === "}") braceDepth--;
    }
    if (braceDepth === 0 && i > startIdx) {
      endIdx = i;
      break;
    }
  }
  console.log(name + ": lines " + (startIdx + 1) + " to " + (endIdx + 1) + " (" + (endIdx - startIdx + 1) + " lines)");
  toRemove.push({ start: startIdx, end: endIdx });
}

// Remove bottom-up
toRemove.sort((a, b) => b.start - a.start);
let result = [...lines];
for (const { start, end } of toRemove) {
  result.splice(start, end - start + 1, "// " + lines[start].split("(")[0].trim() + " → imported");
}

fs.writeFileSync("src/main.jsx", result.join("\n"));
console.log("Done");
