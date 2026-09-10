const fs = require('fs');
const file = 'src/components/MyBlessings/MyBlessingsView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/text-\[#F4F4F8\]/g, 'text-brand-textPrimary dark:text-brand-dark-textPrimary');
content = content.replace(/text-\[#AEAECB\]/g, 'text-brand-textSecondary dark:text-brand-dark-textSecondary');
content = content.replace(/text-\[#15152A\]/g, 'text-brand-background dark:text-brand-dark-background');
content = content.replace(/text-\[#20203A\]/g, 'text-brand-surface dark:text-brand-dark-surface');
content = content.replace(/text-\[#C8A951\]/g, 'text-brand-accent dark:text-brand-dark-accent');
content = content.replace(/bg-\[#15152A\]/g, 'bg-brand-background dark:bg-brand-dark-background');
content = content.replace(/bg-\[#20203A\]/g, 'bg-brand-surface dark:bg-brand-dark-surface');
content = content.replace(/bg-\[#2C2C4A\]/g, 'bg-brand-quranBg dark:bg-brand-dark-quranBg');
content = content.replace(/bg-\[#C8A951\]/g, 'bg-brand-accent dark:bg-brand-dark-accent');
content = content.replace(/border-\[#AEAECB\]\/10/g, 'border-brand-textPrimary/10');
content = content.replace(/border-\[#AEAECB\]\/20/g, 'border-brand-textPrimary/20');
content = content.replace(/border-\[#AEAECB\]\/30/g, 'border-brand-textPrimary/30');
content = content.replace(/border-\[#C8A951\]\/30/g, 'border-brand-accent/30 dark:border-brand-dark-accent/30');
content = content.replace(/border-\[#C8A951\]/g, 'border-brand-accent dark:border-brand-dark-accent');
content = content.replace(/fill-\[#C8A951\]/g, 'fill-brand-accent dark:fill-brand-dark-accent');
content = content.replace(/hover:bg-\[#2A2A46\]/g, 'hover:bg-brand-surface dark:hover:bg-brand-dark-surface');
content = content.replace(/placeholder:text-\[#AEAECB\]\/30/g, 'placeholder:text-brand-textSecondary/30 dark:placeholder:text-brand-dark-textSecondary/30');
content = content.replace(/placeholder:text-\[#AEAECB\]\/40/g, 'placeholder:text-brand-textSecondary/40 dark:placeholder:text-brand-dark-textSecondary/40');

fs.writeFileSync(file, content);
console.log('done');
