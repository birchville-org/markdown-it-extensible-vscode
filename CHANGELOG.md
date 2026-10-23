# Changelog — markdown-it-extensible-vscode

All notable changes to the `markdown-it-extensible-vscode` extension are documented in this file.

---

## [1.4.0] - 2026-10-23

### Datenintegrität & Kernfunktionen
- **Payer v2 Minimal-Set & Didaktischer Standard:** Standard-Block-Container um `warning-box` (didaktische Warnungen, Scholarly Terracotta) und `verse-box` (Ślokas, Mantras, Verse, Metrik) erweitert.
- **Graceful Aliasing für Alt-Container:** Automatische Rückwärtskompatibilität für bestehende Dokumente:
  - `important` → `.warning-box`
  - `literatur-box` / `literatur` → `.note-box`
  - `compact` → `.verse-box`
- **Robuster CompletionProvider:** Defensive Validierung von Benutzereinstellungen (`blockContainers`, `inlineDirectives`) gegen unvollständige JSON-Objekte (`name`-Prüfung).
- **Deduplizierung & Range-Ersetzung:** Verhindert doppelte Shortcut-Vorschläge (`s<name>`) für Container/Alias-Paare und ersetzt beim Auswählen getippte Doppelpunkte (`:::`) sauber ohne Verdopplung.

### Sicherheit & Sandbox
- **Privacy & Pfad-Normalisierung:** Entfernung absoluter lokaler Dateisystempfade aus der Dokumentation (`README.md`).
- **Workspace-Trust:** Weiterhin strikte Einschränkung dynamischer Konfigurationen in unvertrauenswürdigen Arbeitsbereichen (`untrustedWorkspaces`).

### Performance & Rendering
- **Theme-Synchronisation:** [`media/payer-theme.css`](./media/payer-theme.css) auf den Stand von `markdown-it-extensible` 1.4.0 aktualisiert.
- **Optimiertes Laden:** `injectStyles: false` im Markdown-It-Plugin gesetzt, da Stylesheets bereits nativ über VS Code Preview-Styles eingebunden sind; eliminiert synchrone Dateisystem-Leseversuche.
- **VSIX-Schlankheitskur:** Verwaistes Bild-Asset `media/lekt1001.jpg` entfernt; Paketgröße auf 72,13 KB reduziert.

### Plattform- & Backend-Stabilität
- **Abhängigkeiten:** Upgrade auf `markdown-it-extensible@1.4.0`.
- **Snippets:** Neue Snippets `swarn` (`::: warning-box`), `sverse` (`::: verse-box`) und `snote` (`::: note-box`) ergänzt; veraltete `sgaga` entfernt.
