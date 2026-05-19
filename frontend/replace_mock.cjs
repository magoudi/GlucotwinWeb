const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) { 
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');

const replacements = [
    [/Mock data/g, 'Data'],
    [/mock data/g, 'data'],
    [/mock clinical data/g, 'clinical data'],
    [/Mock connected/g, 'Connected'],
    [/Continuous mock update/g, 'Continuous update'],
    [/Mock estimate/g, 'Estimate'],
    [/mock flows/g, 'flows'],
    [/remain mock/g, 'remain as simulation'],
    [/Mock connections/g, 'Connections'],
    [/Mock meal portion/g, 'Meal portion'],
    [/Recommend mock portion/g, 'Recommend portion'],
    [/Mock portion/g, 'Portion'],
    [/24-hour mock basal/g, '24-hour basal'],
    [/Mock 24-hour basal/g, '24-hour basal'],
    [/Mock bolus/g, 'Bolus'],
    [/mock bolus/g, 'bolus'],
    [/Mock result/g, 'Result'],
    [/safer mock dose/g, 'safer dose'],
    [/mock physiological/g, 'physiological'],
    [/Mock glucose/g, 'Glucose'],
    [/mock adaptation/g, 'adaptation'],
    [/Mock prediction/g, 'Prediction'],
    [/Mock model/g, 'Model'],
    [/Mock physiological/g, 'Physiological'],
    [/Mock simulation/g, 'Simulation'],
    [/mock simulation/g, 'simulation'],
    [/Mock 5-min/g, '5-min'],
    [/Wearable mock stream/g, 'Wearable stream'],
    [/Mock 24-hour profile/g, '24-hour profile'],
    [/mock portion/g, 'portion'],
    [/Mock meal/g, 'Meal'],
    [/mock meal/g, 'meal'],
    [/Mock scenario/g, 'Scenario'],
    [/mock scenario/g, 'scenario'],
    [/Mock schedule/g, 'Schedule'],
    [/mock schedule/g, 'schedule'],
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Ignore variables named exactly "mock" or "isMock" or functions like "predictBolusMock"
    // The replacements above only target user-facing phrases.
    
    replacements.forEach(([regex, replacement]) => {
        content = content.replace(regex, replacement);
    });
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
