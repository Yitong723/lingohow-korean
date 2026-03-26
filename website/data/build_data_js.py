#!/usr/bin/env python3
"""把 data/*.json 合并为 data/subtitles.js，供录屏版直接加载（file:// 可用）"""
import json, glob, os

dir_path = os.path.dirname(os.path.abspath(__file__))
result = {}

for f in sorted(glob.glob(os.path.join(dir_path, 'ep*.json'))):
    ep_num = int(os.path.basename(f).replace('ep', '').replace('.json', ''))
    with open(f, 'r', encoding='utf-8') as fh:
        result[ep_num] = json.load(fh)

js = 'var EP_DATA = ' + json.dumps(result, ensure_ascii=False, indent=2) + ';\n'

out = os.path.join(dir_path, 'subtitles.js')
with open(out, 'w', encoding='utf-8') as fh:
    fh.write(js)

print(f'✅ 已生成 {out}（{len(result)} 个EP）')
