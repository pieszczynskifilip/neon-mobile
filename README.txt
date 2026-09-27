NEON Mobile v1.0.0 — STABLE

To jest większa, skonsolidowana wersja zamiast serii drobnych update'ów.

#Najważniejsze funkcje
- HOME: status całego systemu + TOP 3.
- MODULES: OPS / PRAWO / MARKET / RADAR / NAUKA / LAB.
- QUICK: LOUNGE / PRAWO / MARKET / PANEL.
- PRIVATE LINKS: wiele slotów do prywatnych rozmów ChatGPT.
- poprawiony zapis linków: normalizacja, walidacja, odczyt kontrolny, status per pole, TEST.
- CAPTURE: lokalny inbox notatek / pomysłów / terminów (maks. 30 wpisów).
- COPY + OPEN CHAT z Capture.
- SYSTEM CONTROL: diagnostyka PWA, storage, service worker, online/offline, wersja.
- BACKUP/RESTORE prywatnej konfiguracji i Capture jako JSON.
- system aktualizacji: version.json + service worker update detection.
- network-first dla index.html / status.json / version.json, aby ograniczyć problemy z cache.
- nadal bez publicznego zapisywania prywatnych chat IDs i bez tokenów.

#Bezpieczeństwo
Repo jest publiczne. Prywatne linki do rozmów i Capture przechowywane są tylko w localStorage urządzenia.
Nie umieszczaj tokenów API, haseł ani danych klientów w repo.

#Wdrożenie
Podmień w repo:
- index.html
- sw.js
- status.json
- version.json
- manifest.json
- README.md / README.txt
- ikony, jeśli chcesz identyczny komplet

Po deployu GitHub Pages otwórz stronę w Chrome, odśwież i uruchom z ikony PWA.
