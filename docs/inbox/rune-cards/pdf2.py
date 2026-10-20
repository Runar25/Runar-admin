from playwright.sync_api import sync_playwright
import itertools
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page()
    for sz in ['65x100','70x120']:
      for m in ['dark','print']:
        for l in ['card','sheet']:
            pg.goto(f'file:///home/claude/guide/out_{sz}_{m}_{l}.html'); pg.wait_for_timeout(600)
            pg.pdf(path=f'cards_{sz}_{m}_{l}.pdf',prefer_css_page_size=True,print_background=True)
    b.close()
