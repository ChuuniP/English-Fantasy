import json
from pathlib import Path

src = Path(__file__).resolve().parents[1] / 'src' / 'assets' / 'data' / 'Dungeon Monster 1.json'
if not src.exists():
    raise FileNotFoundError(src)

data = json.loads(src.read_text(encoding='utf-8'))
rows = []
for item in data:
    word = item.get('word', '')
    ipa = item.get('ipa', '') or ''
    english_definition = item.get('english_definition', '') or ''
    vietnamese_meaning = item.get('vietnamese_meaning', '') or ''
    def esc(value):
        return value.replace("'", "''")
    rows.append(
        f"('{esc(word)}', '{esc(ipa)}', '{esc(english_definition)}', '{esc(vietnamese_meaning)}')"
    )

sql = []
sql.append("-- Seed vocabulary data for Dungeon Monster 1")
sql.append("INSERT INTO vocabularies (name_vocabulary, type_cefr) VALUES ('Dungeon Monster 1', 'A1');")
sql.append("")
sql.append("INSERT INTO vocabulary_details (id_vocabulary, word, ipa, english_definition, vietnamese_meaning)")
sql.append("SELECT id_vocabulary, word, ipa, english_definition, vietnamese_meaning FROM (VALUES")
sql.append(",\n".join(rows))
sql.append(") AS t(word, ipa, english_definition, vietnamese_meaning)")
sql.append("JOIN vocabularies v ON v.name_vocabulary = 'Dungeon Monster 1' AND v.type_cefr = 'A1';")

out = Path(__file__).resolve().parents[1] / 'database' / 'update_vocabularies.sql'
out.write_text("\n".join(sql) + "\n", encoding='utf-8')
print(f'Wrote {out}')
