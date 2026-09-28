# NEON Mobile v2.0 — MARKET CORE

Duży upgrade architektoniczny, nie mały patch.

## MARKET
- LIVE TAPE: US100/NDX, DXY, WTI, GOLD, US10Y, VIX przez TradingView.
- Advanced Chart z przełączaniem US100 / DXY / WTI / GOLD.
- TradingView Economic Calendar.
- NEON AI DESK: regime, bias, trigger, invalidation, confidence.
- Prediction Ledger: aktywna kwalifikująca prognoza albo uczciwy status „brak aktywnej”.
- Desk windows 10:00 / 14:00 / 17:30 / 20:00.
- Track record z Rozliczenia_v2.
- Remote Market Intelligence Bridge przez Google Apps Script JSONP.
- Fallback market-intel.json, jeśli bridge jest wyłączony.

## Prywatność
- Chat links i URL bridge pozostają w localStorage iPhone'a.
- Publiczne repo nie zawiera prywatnych linków do rozmów.
- Frontend nie zawiera kluczy API.
- Market bridge ma być READ ONLY i zwracać wyłącznie sanitizowane dane rynkowe.

## Dlaczego bridge
TradingView daje live layer i kalendarz, ale prywatny Prediction Ledger/System Ledger nie powinien być publikowany w całości.
Apps Script czyta prywatne arkusze po stronie Google i zwraca tylko wybrane pola do telefonu.

## Wdrożenie frontendu
Podmień cały komplet w root repo:
index.html, sw.js, status.json, version.json, market-intel.json, manifest.json, README.md/README.txt, ikony.

## Bridge
Plik NEON_Market_Bridge_PRIVATE.gs jest osobnym plikiem prywatnym. NIE wrzucaj go do publicznego repo.
Wklej go do Google Apps Script, uruchom setupPrivate(), wdroż jako Web App i wpisz URL /exec w SYSTEM > MARKET INTELLIGENCE FEED.

## Ważne
TradingView widget może mieć opóźnienia zależne od instrumentu i uprawnień danych.
Nasze trigger/invalidation są wyświetlane obok wykresu. Standardowy widget TradingView nie daje pełnej kontroli nad własnymi markerami/poziomami na świecach; do tego potrzebna byłaby później własna warstwa wykresu / Charting Library + własny feed.
