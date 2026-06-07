import json
from pathlib import Path

path = Path('src/assets/data/Dungeon Boss 1.json')
with path.open('r', encoding='utf-8') as f:
    data = json.load(f)

name = 'Dungeon Boss 1'
count = len(data)
print('-- Add default boss question set')
print(f"INSERT INTO boss_questions (name_boss_question, question_amount) VALUES ('{name.replace("'", "''")}', {count});")
print()
print('-- Add default boss question details')
print('INSERT INTO boss_question_details (id_boss_question, question_text, vietnamese_meaning)')
print('VALUES')
for i, item in enumerate(data):
    orig = item['original'].replace("'", "''")
    viet = item['vietnamese'].replace("'", "''")
    comma = ',' if i < len(data)-1 else ';'
    print(f"    ((SELECT id_boss_question FROM boss_questions WHERE name_boss_question = '{name.replace("'", "''")}'), '{orig}', '{viet}'){comma}")
