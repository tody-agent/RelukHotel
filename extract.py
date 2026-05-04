import os
import re

with open('upgrade_idea.md', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'## 📄 `(openspec/[^`]+)`\n\n(?:`{3,4})[a-z]*\n(.*?)`{3,4}', re.DOTALL)
matches = pattern.findall(content)

for filename, filecontent in matches:
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(filecontent)
    print(f'Created {filename}')
