# NEON Mobile v3.0 — MARKET TERMINAL

## Co zmieniono po krytycznym przeglądzie v2
- główny MARKET nie używa już ticker-tape ani osadzonego wykresu TradingView;
- domyślny ekran to własny WATCH w stylu terminala/obserwowanych;
- CORE: US100 / DXY / US10Y / WTI / GOLD / VIX;
- BREADTH: QQQ / SMH / IWM / RSP / QQQE;
- AI / MEGA CAP: NVDA / MSFT / AVGO / META / AAPL / AMZN / GOOGL / TSLA;
- po rozwinięciu instrumentu: day range, prev close, sparkline, timestamp, źródło, Desk delta;
- dla core: NEON bias, trigger, invalidation i PRICE ALIGNMENT;
- własny wykres SVG z feedu 5d/15m;
- TradingView otwierany dopiero na żądanie;
- osobne zakładki WATCH / DESK / MACRO / PRED / CHART;
- aktywna prognoza jest aktywna tylko z niewygasłym mierzalnym horyzontem;
- frontend trzyma lokalny cache ostatniego poprawnego payloadu;
- refresh co 60 s działa tylko, gdy MARKET jest widoczny.

## Krytyczna zasada
PRICE ALIGNMENT nie jest automatycznym „thesis status”.
Jeśli bias LONG i cena rośnie od ostatniego Desk, aplikacja mówi tylko PRICE ALIGNED.
Trigger/invalidation nadal mają pierwszeństwo.

## Bridge v3
Plik NEON_Market_Bridge_v3_PRIVATE.gs jest prywatny.
Nie wrzucaj go do publicznego GitHuba.

Bridge czyta prywatne Ledger-y i pobiera publiczne market quotes best-effort.
To nie jest feed instytucjonalny. Dane mogą być opóźnione albo chwilowo niedostępne.

## Upgrade
1. Wgraj ZIP do root repo.
2. W Apps Script zastąp Kod.gs plikiem Bridge v3.
3. Uruchom setupPrivate().
4. Wdróż nową wersję istniejącego Web App.
5. Zachowaj ten sam /exec URL.
6. W NEON: SYSTEM > TEST FEED.
