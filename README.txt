NEON Mobile v0.2

Co nowe:
- dynamiczne badge freshness: NOW/FRESH/AGED/STALE/WEEKEND/PARTIAL
- statusy modułów z pliku status.json
- system health: automations / delivery / writeback / sync
- przycisk odświeżenia
- status.json omija cache service workera

Bezpieczeństwo:
- nadal READ ONLY
- brak tokenów, haseł i danych klientów
- prywatne Google Sheets nie są publikowane
- status.json jest sanitizowanym snapshotem

Uwaga:
v0.2 liczy freshness na żywo, ale sam snapshot status.json nie synchronizuje się jeszcze automatycznie ze źródłami.
To będzie kolejna warstwa.
