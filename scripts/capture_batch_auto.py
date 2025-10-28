#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse, time, csv, sys, re, json
from pathlib import Path
from typing import List, Tuple
import pandas as pd
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeoutError

# ===== CONFIG VISUAL =====
CLIP_W, CLIP_H = 1460, 850
VIEWPORT_W, VIEWPORT_H = 1600, 960
Y_OFFSET = 25

# ===== UTIL =====
def centered_clip(page):
    vw = page.evaluate("() => window.innerWidth")
    vh = page.evaluate("() => window.innerHeight")
    x = max(0, int((vw - CLIP_W) / 2))
    y = max(0, int((vh - CLIP_H) / 2) + Y_OFFSET)
    return {"x": x, "y": y, "width": CLIP_W, "height": CLIP_H}

def on_page_not_found(page) -> bool:
    try:
        loc = page.locator("text=Página não encontrada").first
        return bool(loc.is_visible(timeout=800))
    except Exception:
        return False

def is_page_visually_ready(page) -> bool:
    """
    Verifica se a página está visualmente pronta através de elementos visuais.
    Procura especificamente por elementos que indicam que o jogo carregou completamente.
    """
    try:
        # Primeiro, verifica se ainda está carregando (se sim, não está pronta)
        loading_indicators = [
            "text=carregando",
            "text=Carregando", 
            "text=loading",
            "text=Loading",
            "[class*='loading']",
            "[class*='spinner']"
        ]
        
        for indicator in loading_indicators:
            try:
                loc = page.locator(indicator).first
                if loc.is_visible(timeout=200):
                    return False  # Ainda carregando
            except Exception:
                continue
        
        # Agora verifica elementos que indicam que está realmente pronta
        ready_selectors = [
            # Botões de ação específicos do jogo
            "button:has-text('INICIAR')",  
            "button:has-text('Iniciar')",  
            "button:has-text('Start')",    
            "[role='button']:has-text('INICIAR')",
            "[role='button']:has-text('Iniciar')",
            "[role='button']:has-text('Start')",
            
            # Títulos específicos da página
            "text=ORGANIZANDO A MUDANÇA",  
            "text=Organizando a Mudança",
            "text=organizando a mudança"
        ]
        
        for selector in ready_selectors:
            try:
                loc = page.locator(selector).first
                if loc.is_visible(timeout=500):
                    return True
            except Exception:
                continue
                
        # Fallback: verifica se há botões clicáveis E não há indicadores de loading
        try:
            buttons = page.locator("button:visible").all()
            if len(buttons) >= 1:  # Pelo menos 1 botão visível
                # Verifica se não há elementos de loading visíveis
                has_loading = False
                for indicator in loading_indicators:
                    try:
                        loc = page.locator(indicator).first
                        if loc.is_visible(timeout=100):
                            has_loading = True
                            break
                    except Exception:
                        continue
                
                if not has_loading:
                    return True
        except Exception:
            pass
            
        return False
    except Exception:
        return False

def get_loading_percent(page) -> int | None:
    """
    Tenta achar um texto como 'carregando objeto digital' e um número NN%.
    É heurístico: se não achar, retorna None.
    """
    try:
        # pega qualquer elemento que contenha % visível
        els = page.locator(":text-matches('\\d+%')").all()
        for el in els:
            if el.is_visible(timeout=200):
                txt = el.text_content() or ""
                m = re.search(r"(\d+)\s*%", txt)
                if m:
                    return int(m.group(1))
    except Exception:
        pass
    return None

def wait_stability(page, min_quiet_ms=2500, max_total_ms=30000) -> bool:
    """
    Espera até que a página fique 'estável' por min_quiet_ms: sem mudanças
    no retângulo de #app/body e no childElementCount do #app.
    """
    start = time.time()
    last_change = start

    def sample():
        return page.evaluate(
            """() => {
                const app = document.querySelector('#app') || document.body;
                const r = app.getBoundingClientRect();
                return {
                  w: Math.round(r.width), h: Math.round(r.height),
                  c: app.childElementCount
                };
            }"""
        )

    try:
        prev = sample()
    except Exception:
        prev = {"w": 0, "h": 0, "c": 0}

    while (time.time() - start) * 1000 < max_total_ms:
        time.sleep(0.35)
        try:
            cur = sample()
        except Exception:
            cur = {"w": 0, "h": 0, "c": 0}

        if cur != prev:
            prev = cur
            last_change = time.time()

        if (time.time() - last_change) * 1000 >= min_quiet_ms:
            return True

    return False

def try_reload(page, wait="domcontentloaded", to=15000):
    try:
        page.reload(wait_until=wait, timeout=to)
    except PWTimeoutError:
        pass

# ===== ESPERA POR BODY.ID =====
def wait_body_id_ready(page, expected_id: str,
                       total_timeout_ms: int,
                       reload_stuck_ms: int = 20000) -> bool:
    """
    Espera até document.body.id == expected_id OU até a página estar visualmente pronta.
    - Só recarrega se houver 'Página não encontrada' OU se o percentual de loading não evoluir por 'reload_stuck_ms'.
    - Quando em 100%, aguarda mais tempo pois pode estar finalizando o carregamento.
    - Se body.id não aparecer, mas a página estiver visualmente pronta, considera sucesso.
    """
    start = time.time()
    last_percent = None
    last_percent_ts = time.time()
    percent_100_start = None  # timestamp quando chegou a 100%
    visual_ready_start = None  # timestamp quando detectou visualmente pronta

    while (time.time() - start) * 1000 < total_timeout_ms:
        # 1) erro 'Página não encontrada' -> recarrega
        if on_page_not_found(page):
            try_reload(page)
            last_percent = None
            last_percent_ts = time.time()
            percent_100_start = None
            visual_ready_start = None
            continue

        # 2) verifica body.id
        body_id_ok = False
        try:
            body_id_ok = page.evaluate("(exp) => !!document.body && document.body.id === exp", expected_id)
        except Exception:
            pass

        if body_id_ok:
            print(f"    [+] Body ID '{expected_id}' encontrado!")
            return True  # body.id bateu; não recarregar mais

        # 3) monitora evolução do percentual (se existir)
        pct = get_loading_percent(page)
        now = time.time()
        
        # 4) verifica se está visualmente pronta (apenas como fallback em casos específicos)
        visual_ready = is_page_visually_ready(page)
        
        # Só usa detecção visual se:
        # - Não há percentual de carregamento (pode ser uma página que não mostra %)
        # - OU se chegou a 100% e está há mais de 15 segundos
        can_use_visual = (pct is None) or (pct >= 100 and percent_100_start and (now - percent_100_start) * 1000 >= 15000)
        
        if visual_ready and can_use_visual:
            if visual_ready_start is None:
                visual_ready_start = now
                print(f"    [+] Página visualmente pronta detectada (após 100% por 15s)!")
            # Se está visualmente pronta há mais de 5 segundos, considera sucesso
            elif (now - visual_ready_start) * 1000 >= 5000:
                print(f"    [+] Página pronta (fallback visual) após {int((now - start)*1000)}ms")
                return True
        else:
            visual_ready_start = None

        # 5) processa evolução do percentual
        if pct is None:
            # sem percent; apenas espere um pouco
            time.sleep(0.6)
        else:
            if last_percent is None or pct != last_percent:
                last_percent = pct
                last_percent_ts = now
                print(f"    [~] Carregamento: {pct}%")
                # Se chegou a 100%, marca o timestamp
                if pct >= 100 and percent_100_start is None:
                    percent_100_start = now
            else:
                # sem progresso
                if pct >= 100:
                    # Em 100%, aguarda até 60 segundos para finalizar
                    if percent_100_start and (now - percent_100_start) * 1000 >= 60000:
                        print(f"    [!] Carregamento em 100% há mais de 60s, recarregando...")
                        try_reload(page)
                        last_percent = None
                        last_percent_ts = time.time()
                        percent_100_start = None
                        visual_ready_start = None
                    else:
                        time.sleep(0.6)
                else:
                    # Menos de 100%, comportamento normal
                    if (now - last_percent_ts) * 1000 >= reload_stuck_ms:
                        print(f"    [!] Carregamento travado em {pct}%, recarregando...")
                        try_reload(page)
                        last_percent = None
                        last_percent_ts = time.time()
                        percent_100_start = None
                        visual_ready_start = None
                    else:
                        time.sleep(0.6)

    print(f"    [!] Timeout após {int((time.time() - start)*1000)}ms")
    return False

# ===== LEITURA DE DADOS =====
def read_json(path: str, filter_prefix: str = None, out_dir: Path = None, skip_items: set = None) -> List[Tuple[str,str]]:
    """
    Lê o JSON do acervo e retorna lista de (código, url).
    Se filter_prefix for fornecido, filtra apenas códigos que começam com esse prefixo.
    Se out_dir for fornecido, pula itens que já têm thumbnail capturada.
    """
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"Arquivo não encontrado: {p}")
    
    with open(p, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    out = []
    skipped = 0
    
    # Itens para pular (se especificados)
    if skip_items is None:
        skip_items = set()
    
    for item in data:
        codigo = item.get('codigo', '').strip()
        url = item.get('url_principal', '').strip()
        
        if not codigo or not url or not url.startswith('http'):
            continue
        
        # Pula itens especificados para ignorar
        if codigo in skip_items:
            print(f"[i] Pulando item: {codigo}")
            continue
        
        # Filtro por prefixo (ex: "EF25")
        if filter_prefix and not codigo.startswith(filter_prefix):
            continue
        
        # Verifica se arquivo já existe
        if out_dir:
            thumb_path = out_dir / f"{codigo}.png"
            if thumb_path.exists():
                skipped += 1
                continue
        
        out.append((codigo, url))
    
    if skipped > 0:
        print(f"[i] {skipped} thumbs já existem e serão puladas")
    
    return out

def col_letter_to_idx(letter: str) -> int:
    letter = letter.strip().upper()
    idx = 0
    for ch in letter:
        idx = idx * 26 + (ord(ch) - ord('A') + 1)
    return idx - 1

def read_sheet(path: str, code_col: str = "G", url_col: str = "M", filter_prefix: str = None, out_dir: Path = None) -> List[Tuple[str,str]]:
    """
    Lê CSV/XLSX e retorna lista de (código, url).
    Se filter_prefix for fornecido, filtra apenas códigos que começam com esse prefixo.
    Se out_dir for fornecido, pula itens que já têm thumbnail capturada.
    """
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(p)
    ext = p.suffix.lower()
    if ext in [".xlsx", ".xls"]:
        df = pd.read_excel(p, dtype=str, engine="openpyxl")
    else:
        try:
            df = pd.read_csv(p, dtype=str)
        except:
            df = pd.read_csv(p, dtype=str, sep=";")
    ci, ui = col_letter_to_idx(code_col), col_letter_to_idx(url_col)
    if ci >= len(df.columns) or ui >= len(df.columns):
        raise ValueError(f"Colunas fora do intervalo. Colunas encontradas: {list(df.columns)}")
    df = df.rename(columns={df.columns[ci]:"__codigo__", df.columns[ui]:"__url__"})
    df = df[["__codigo__","__url__"]].dropna()
    out=[]
    skipped = 0
    for _,r in df.iterrows():
        cod=str(r["__codigo__"]).strip(); url=str(r["__url__"]).strip()
        if cod and url and url.startswith("http"):
            # Filtro por prefixo
            if filter_prefix and not cod.startswith(filter_prefix):
                continue
            
            # Verifica se arquivo já existe
            if out_dir:
                thumb_path = out_dir / f"{cod}.png"
                if thumb_path.exists():
                    skipped += 1
                    continue
            
            out.append((cod,url))
    
    if skipped > 0:
        print(f"[i] {skipped} thumbs já existem e serão puladas")
    
    return out

# ===== PROCESSA UM ITEM =====
def process_one_auto(page,codigo:str,url:str,out_dir:Path,
                     body_timeout:int, quiet_ms:int, stability_max_ms:int,
                     extra_wait:int)->Tuple[bool,str]:
    # 1) navegar
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=120000)  # 2 minutos
    except (PWTimeoutError, Exception) as e:
        print(f"    [!] Erro na navegação: {e}")
        pass

    # 2) aguardar body.id == código (com política anti-loop)
    ok = wait_body_id_ready(page, expected_id=codigo,
                            total_timeout_ms=body_timeout,
                            reload_stuck_ms=20000)
    if not ok:
        return False, f"timeout esperando body.id == {codigo}"

    # 3) esperar overlay de loading sumir (se existir) + estabilidade
    # (Se não existir overlay detectável, stability resolve)
    _ = get_loading_percent(page)  # apenas para “tocar” o cache
    wait_stability(page, min_quiet_ms=quiet_ms, max_total_ms=stability_max_ms)

    # 4) espera adicional de segurança
    if extra_wait>0:
        time.sleep(extra_wait/1000.0)

    # 5) captura
    clip=centered_clip(page)
    out_path=out_dir/f"{codigo}.png"
    try:
        page.screenshot(path=str(out_path), clip=clip)
        return True, str(out_path)
    except Exception as e:
        try:
            page.screenshot(path=str(out_path), full_page=True)
            return True, str(out_path)+" (fullpage)"
        except Exception as e2:
            return False, f"screenshot error: {e2}"

# ===== MAIN =====
def main():
    ap=argparse.ArgumentParser(description="Captura thumbs 1460x850 em lote com gatilho body.id, estabilidade e anti-loop.")
    ap.add_argument("--json", default=r"G:\Meu Drive\Projetos\Acervo digital\Acervov2\public\data\acervo.json", 
                    help="JSON do acervo (recomendado, mais rápido)")
    ap.add_argument("--sheet", default=None, help="CSV/XLSX com col G=código e M=URL (alternativa ao JSON)")
    ap.add_argument("--out-dir", default=r"G:\Meu Drive\Projetos\Acervo digital\Acervov2\public\thumbs")
    ap.add_argument("--browser", choices=["chrome","msedge"], default="chrome")
    ap.add_argument("--headless", action="store_true")

    ap.add_argument("--body-timeout-ms", type=int, default=180000, help="tempo total p/ body.id aparecer (ms)")
    ap.add_argument("--quiet-ms", type=int, default=2500, help="tempo de estabilidade mínima antes do print (ms)")
    ap.add_argument("--stability-max-ms", type=int, default=30000, help="tempo máximo tentando estabilidade (ms)")
    ap.add_argument("--extra-wait-ms", type=int, default=1500, help="folga após estabilidade (ms)")

    ap.add_argument("--code-col", default="G")
    ap.add_argument("--url-col", default="M")
    ap.add_argument("--filter", default=None, help="Filtro de prefixo de código (ex: SAE25, EF22, etc)")
    ap.add_argument("--skip-existing", action="store_true", default=True, 
                    help="Pular thumbs que já existem (padrão: True)")
    ap.add_argument("--limit", type=int, default=None, help="Limitar processamento aos N primeiros itens (para testes)")
    ap.add_argument("--skip-items", type=str, default="", help="Lista de códigos separados por vírgula para pular (ex: EF22_6_ING_L1_U2_01_OD1,EF22_6_ING_L1_U1_02_OD1)")
    args=ap.parse_args()

    out_dir=Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    
    # Processa lista de itens para pular
    skip_items = set()
    if args.skip_items:
        skip_items = set(item.strip() for item in args.skip_items.split(','))
        print(f"[i] Itens que serão pulados: {', '.join(skip_items)}")
    
    # Lê dados do JSON (preferencial) ou CSV/XLSX
    if args.json and Path(args.json).exists():
        print(f"[i] Lendo dados do JSON: {args.json}")
        items = read_json(
            args.json, 
            filter_prefix=args.filter if args.filter else None,
            out_dir=out_dir if args.skip_existing else None,
            skip_items=skip_items
        )
    elif args.sheet and Path(args.sheet).exists():
        print(f"[i] Lendo dados do CSV/XLSX: {args.sheet}")
        items = read_sheet(
            args.sheet, 
            code_col=args.code_col, 
            url_col=args.url_col,
            filter_prefix=args.filter if args.filter else None,
            out_dir=out_dir if args.skip_existing else None
        )
    else:
        print("[!] Nenhum arquivo de dados encontrado!")
        sys.exit(1)
    
    if not items:
        print(f"[!] Nenhum item para processar com o filtro '{args.filter}'")
        sys.exit(0)
    
    # Aplica limite se especificado
    if args.limit and args.limit > 0:
        items = items[:args.limit]
        print(f"[i] Limitado a {len(items)} itens para teste")
    
    failures=[]

    with sync_playwright() as p:
        browser=p.chromium.launch(channel=args.browser, headless=args.headless)
        context=browser.new_context(viewport={"width":VIEWPORT_W,"height":VIEWPORT_H}, java_script_enabled=True)
        page=context.new_page()
        print(f"Processando {len(items)} itens… (salvando em {out_dir.resolve()})")

        for i,(codigo,url) in enumerate(items,1):
            print(f"[{i}/{len(items)}] {codigo}")
            try:
                ok,msg=process_one_auto(
                    page=page, codigo=codigo, url=url, out_dir=out_dir,
                    body_timeout=args.body_timeout_ms,
                    quiet_ms=args.quiet_ms, stability_max_ms=args.stability_max_ms,
                    extra_wait=args.extra_wait_ms
                )
                if ok:
                    print(f"  [+] OK {msg}")
                else:
                    print(f"  [!] FAIL {msg}")
                    failures.append({"codigo":codigo,"url":url,"erro":msg})
            except Exception as e:
                print(f"  [!] ERRO GERAL: {e}")
                failures.append({"codigo":codigo,"url":url,"erro":f"Erro geral: {e}"})

        context.close(); browser.close()

    if failures:
        fail_path=out_dir/"failures.csv"
        with open(fail_path, "w", newline="", encoding="utf-8") as f:
            w=csv.DictWriter(f, fieldnames=["codigo","url","erro"])
            w.writeheader(); w.writerows(failures)
        print(f"\nConcluido com {len(failures)} falhas -> {fail_path}")
    else:
        print("\nConcluido sem falhas!")

if __name__=="__main__":
    main()
