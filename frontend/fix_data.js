const fs = require('fs');
const path = 'src/services/pharmaciesData.ts';
try {
    let content = fs.readFileSync(path, 'utf8');
    // Add type: "pharmacy" before id
    // We target "id": "..." to ensure we are inside the object
    const newContent = content.replace(/"id":/g, '"type": "pharmacy", "id":');
    fs.writeFileSync(path, newContent);
    console.log("Successfully patched pharmaciesData.ts");
} catch (e) {
    console.error("Error patching file:", e);
    process.exit(1);
}
