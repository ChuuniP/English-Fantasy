import os
import glob
import json
from typing import List, Dict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_GLOB = os.path.join(ROOT, 'src', 'assets', 'data', '*.json')


def load_game_documents() -> List[Dict[str, str]]:
    """Load JSON files from src/assets/data and flatten them into simple text documents.
    Returns list of dicts with keys: id, text
    """
    documents = []
    for path in glob.glob(DATA_GLOB):
        name = os.path.basename(path)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                payload = json.load(f)
            documents.extend(flatten_game_data(name, payload))
        except Exception as e:
            print('warning: failed to load', name, e)
    return documents


def flatten_game_data(id_prefix: str, data) -> List[Dict[str, str]]:
    entries = []
    if isinstance(data, list):
        for i, item in enumerate(data):
            entries.append({'id': f"{id_prefix}-{i}", 'text': object_to_text(item)})
    elif isinstance(data, dict):
        entries.append({'id': id_prefix, 'text': object_to_text(data)})
    else:
        entries.append({'id': id_prefix, 'text': str(data)})
    return entries


def object_to_text(obj) -> str:
    if obj is None:
        return ''
    if isinstance(obj, str):
        return obj
    if isinstance(obj, (int, float, bool)):
        return str(obj)
    if isinstance(obj, list):
        return ' '.join(object_to_text(x) for x in obj)
    if isinstance(obj, dict):
        parts = []
        for k, v in obj.items():
            parts.append(f"{k}: {object_to_text(v)}")
        return ' | '.join(parts)
    return str(obj)
