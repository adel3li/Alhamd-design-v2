const fs = require('fs');

const replaceInFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  newContent = newContent.replace(/import \{ track \} from '\.\.\/lib\/analytics';/g, "import { analytics } from '../services/analytics';");
  newContent = newContent.replace(/import \{ track \} from '\.\.\/\.\.\/lib\/analytics';/g, "import { analytics } from '../../services/analytics';");
  newContent = newContent.replace(/import \{ initAnalytics, track \} from '\.\/lib\/analytics';/g, "");
  newContent = newContent.replace(/track\(/g, "analytics.capture(");
  newContent = newContent.replace(/localStorage\.setItem\(/g, "storage.setItem(");
  newContent = newContent.replace(/localStorage\.getItem\(/g, "storage.getItem(");
  newContent = newContent.replace(/localStorage\.removeItem\(/g, "storage.removeItem(");
  // Wait, storage.setItem returns a Promise, so they might need `await` if they are in an async function.
  
  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('updated', file);
  }
};

replaceInFile('src/components/SettingsView.tsx');
replaceInFile('src/components/MyBlessings/MyBlessingsView.tsx');
replaceInFile('src/components/ReflectionFlow.tsx');
replaceInFile('src/components/Onboarding.tsx');
replaceInFile('src/components/SpotlightTour.tsx');
replaceInFile('src/App.tsx');
