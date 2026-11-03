"""Run with python3 qa/check.py; no packages or build step required."""
from html.parser import HTMLParser
from pathlib import Path
import re
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.tags, self.scripts, self.script = [], [], None
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if tag == 'script' and 'src' not in attrs:
            self.script = ''

    def handle_data(self, data):
        if self.script is not None:
            self.script += data

    def handle_endtag(self, tag):
        if tag == 'script' and self.script is not None:
            self.scripts.append(self.script)
            self.script = None


pages = [ROOT / 'index.html', ROOT / '404.html', *sorted((ROOT / 'trip').glob('*.html'))]
links = scripts = 0
for path in pages:
    page = Page(path.read_text())
    ids = [a['id'] for _, a in page.tags if 'id' in a]
    assert len(ids) == len(set(ids)), f'{path}: duplicate IDs'
    assert sum(tag == 'main' for tag, _ in page.tags) == 1, path
    assert sum(tag == 'h1' for tag, _ in page.tags) == 1, path
    for tag, attrs in page.tags:
        if attrs.get('target') == '_blank':
            assert 'noopener' in attrs.get('rel', '').split(), (path, attrs)
        for key in ('src', 'href'):
            url = attrs.get(key, '')
            if not url or re.match(r'^(?:[a-z]+:|//)', url):
                continue
            target, _, fragment = url.partition('#')
            target = target.partition('?')[0]
            dest = ROOT if target == '/diary/' else path.parent / target
            if target:
                assert dest.exists(), (path, url)
            if fragment:
                other = Page(dest.read_text()) if target else page
                assert any(a.get('id') == fragment for _, a in other.tags), (path, url)
            links += 1
    for script in page.scripts:
        subprocess.run(['node', '--check'], input=script, text=True, check=True, capture_output=True)
        scripts += 1
for path in ROOT.glob('*.js'):
    subprocess.run(['node', '--check', str(path)], check=True, capture_output=True)
    scripts += 1
for path in (ROOT / 'assets').glob('*.svg'):
    ET.parse(path)
    text = path.read_text()
    ids = set(re.findall(r'\bid="([^"]+)"', text))
    refs = set(re.findall(r'url\(#([^)]+)\)', text))
    assert not refs - ids, (path, refs - ids)
print(f'OK: {len(pages)} HTML pages, {links} local references, {scripts} scripts, standalone SVG references')
