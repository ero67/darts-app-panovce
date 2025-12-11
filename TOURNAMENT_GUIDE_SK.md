# Príručka Správy Turnajov

Táto príručka vás prevedie vytváraním a správou turnajov v aplikácii Správca Šípkových Turnajov, od počiatočného nastavenia až po zobrazenie finálnych štatistík.

---

## Obsah

1. [Vytvorenie Turnaja](#vytvorenie-turnaja)
2. [Nastavenia Turnaja](#nastavenia-turnaja)
3. [Pridávanie Hráčov](#pridávanie-hráčov)
4. [Spustenie Turnaja](#spustenie-turnaja)
5. [Správa Skupín a Zápasov](#správa-skupín-a-zápasov)
6. [Zobrazenie Tabuľky](#zobrazenie-tabuľky)
7. [Nastavenie Play-off](#nastavenie-play-off)
8. [Zobrazenie Štatistík](#zobrazenie-štatistík)
9. [Live Zápasy](#live-zápasy)
10. [Zapisovanie Zápasu](#zapisovanie-zápasu)

---

## Vytvorenie Turnaja

### Krok 1: Prístup k Vytvoreniu Turnaja

**Miesto pre Screenshot:** *Prehľad zobrazujúci tlačidlo "Vytvoriť Turnaj" alebo navigačné menu*

- Z hlavného prehľadu kliknite na tlačidlo **"Vytvoriť Turnaj"** alebo prejdite na stránku vytvorenia turnaja
- Uvidíte formulár s niekoľkými sekciami na konfiguráciu vášho turnaja

### Krok 2: Zadanie Názvu Turnaja

**Miesto pre Screenshot:** *Formulár vytvorenia turnaja s zvýrazneným vstupným poľom pre názov*

- Zadajte jedinečný názov pre váš turnaj (maximálne 50 znakov)
- Tento názov sa zobrazí v celom rozhraní turnaja

### Krok 3: Konfigurácia Nastavení Zápasu

**Miesto pre Screenshot:** *Sekcia nastavení zápasu zobrazujúca rozbaľovacie zoznamy pre legy na výhru a začiatočné skóre*

- **Predvolené Legy na Výhru:** Vyberte, koľko legov potrebuje hráč na výhru v zápase (možnosti: 1, 2, 3, 4, 5, 7 alebo 9 legov)
- **Začiatočné Skóre:** Vyberte začiatočné skóre pre každý leg (301, 501 alebo 701)

**Poznámka:** Toto sú predvolené nastavenia. Nastavenia jednotlivých zápasov môžu byť neskôr upravené podľa potreby.

### Krok 4: Konfigurácia Poradia Kritérií v Tabuľke

**Miesto pre Screenshot:** *Sekcia poradia kritérií v tabuľke zobrazujúca zoznam so šípkami nahor/dolu*

- Toto určuje, ako sú hráči hodnotení v tabuľke skupín, keď majú rovnaké body
- Kritériá sa používajú v poradí:
  1. **Počet Víťazstiev** - Počet vyhraných zápasov
  2. **Rozdiel Legov** - Rozdiel medzi vyhranými a prehranými legmi
  3. **Priemer** - Priemerné skóre zápasu
  4. **Vzájomný Zápas** - Výsledok priameho zápasu medzi zhodnými hráčmi

- Použite **šípky nahor/dolu** na preskupenie týchto kritérií podľa vašich preferencií
- Prvé kritérium sa kontroluje ako prvé, potom druhé, ak sú hodnoty rovnaké, atď.

### Krok 5: Konfigurácia Nastavení Skupín

**Miesto pre Screenshot:** *Sekcia nastavení skupín zobrazujúca prepínače pre "Počet Skupín" a "Hráčov na Skupinu"*

- Vyberte, ako budú hráči rozdelení do skupín:
  - **Počet Skupín:** Zadajte, koľko skupín chcete (napr. 2 skupiny, 4 skupiny)
  - **Hráčov na Skupinu:** Zadajte, koľko hráčov má byť v každej skupine (systém automaticky vypočíta počet skupín)

- Zadajte hodnotu (počet skupín alebo hráčov na skupinu) do vstupného poľa
- Skupiny budú automaticky vytvorené pri spustení turnaja

### Krok 6: Konfigurácia Nastavení Play-off (Voliteľné)

**Miesto pre Screenshot:** *Sekcia nastavení play-off s začiarknutým políčkom a rozbalenými možnosťami*

- **Povoliť Play-off:** Začiarknite toto políčko, ak chcete play-off fázu po skupinových zápasoch
- Ak je povolené, nakonfigurujte:
  - **Režim Kvalifikácie:**
    - **Hráčov na Skupinu:** Postúpiť určitý počet hráčov z každej skupiny (napr. top 2 z každej skupiny)
    - **Celkový Počet Hráčov:** Postúpiť celkový počet hráčov zo všetkých skupín (napr. top 8 celkovo)
  - **Postupujúci Hráči:** Nastavte, koľko hráčov postúpi (1-8 na skupinu alebo "Všetci")
  - **Legy na Výhru podľa Kola:** Nastavte rôzne požiadavky na legy pre každé play-off kolo:
    - **Osemfinále** (ak je to relevantné)
    - **Štvrťfinále**
    - **Semifinále**
    - **Finále**

### Krok 7: Vytvorenie Turnaja

**Miesto pre Screenshot:** *Tlačidlo "Vytvoriť Turnaj" v spodnej časti formulára*

- Kliknite na tlačidlo **"Vytvoriť Turnaj"**
- Turnaj bude vytvorený so stavom "Otvorené pre Registráciu"
- Budete presmerovaní na stránku Registrácie Turnaja

---

## Nastavenia Turnaja

### Prístup k Nastaveniam

**Miesto pre Screenshot:** *Stránka registrácie turnaja zobrazujúca tlačidlo "Upraviť Nastavenia"*

- Na stránke Registrácie Turnaja kliknite na tlačidlo **"Upraviť Nastavenia"** (ikona ozubeného kolieska) v hlavičke
- Otvorí sa modálne okno so všetkými nastaveniami turnaja

### Úprava Nastavení

**Miesto pre Screenshot:** *Modálne okno nastavení zobrazujúce všetky upraviteľné možnosti*

Môžete upraviť:
- **Nastavenia Zápasu:** Legy na výhru a začiatočné skóre
- **Poradie Kritérií v Tabuľke:** Preskupenie kritérií na rozhodovanie o remíze
- **Nastavenia Skupín:** Zmena konfigurácie skupín (iba pred spustením turnaja)
- **Nastavenia Play-off:** Povolenie/zakázanie play-off a konfigurácia pravidiel play-off

**Poznámka:** Niektoré nastavenia nemožno zmeniť po spustení turnaja. Nastavenia skupín možno upraviť iba pred spustením turnaja.

### Uloženie Zmien

- Kliknite na **"Aktualizovať Nastavenia"** na uloženie zmien
- Kliknite na **"Zrušiť"** na zatvorenie bez uloženia

---

## Pridávanie Hráčov

### Pridávanie Hráčov počas Registrácie

**Miesto pre Screenshot:** *Sekcia registrácie hráčov zobrazujúca vstupné pole a tlačidlo "Pridať Hráča"*

- Na stránke Registrácie Turnaja uvidíte sekciu **Hráči**
- Zadajte meno hráča do vstupného poľa
- Kliknite na **"Pridať Hráča"** alebo stlačte Enter
- Hráč bude pridaný do turnaja (maximum 64 hráčov)

### Zobrazenie Registrovaných Hráčov

**Miesto pre Screenshot:** *Zoznam registrovaných hráčov zobrazujúci karty hráčov s tlačidlami na odstránenie*

- Všetci registrovaní hráči sú zobrazení ako karty pod vstupným poľom
- Každá karta zobrazuje meno hráča
- Hráčov môžete odstrániť kliknutím na tlačidlo **X** (iba pred spustením turnaja)

### Limity Hráčov

- Minimum: 2 hráči sú potrební na spustenie turnaja
- Maximum: 64 hráčov na turnaj

---

## Spustenie Turnaja

### Predpoklady

**Miesto pre Screenshot:** *Stránka registrácie turnaja s aspoň 2 pridanými hráčmi*

Pred spustením sa uistite:
- Sú registrovaní aspoň 2 hráči
- Sú nakonfigurované nastavenia skupín
- Boli pridaní všetci požadovaní hráči

### Spustenie Turnaja

**Miesto pre Screenshot:** *Tlačidlo "Spustiť Turnaj" v spodnej časti stránky registrácie*

- Kliknite na tlačidlo **"Spustiť Turnaj"**
- Môže sa zobraziť dialógové okno na potvrdenie
- Po potvrdení:
  - Hráči budú automaticky rozdelení do skupín podľa vašich nastavení
  - Všetky skupinové zápasy budú vygenerované
  - Stav turnaja sa zmení na "Aktívne"
  - Budete presmerovaní na stránku Správy Turnaja

**Poznámka:** Po spustení nemôžete odstraňovať hráčov ani meniť nastavenia skupín.

---

## Správa Skupín a Zápasov

### Rozhranie Správy Turnaja

**Miesto pre Screenshot:** *Stránka Správy Turnaja zobrazujúca záložky: Skupiny, Zápasy, Tabuľka, Play-off, Štatistiky, Live Zápasy*

Stránka Správy Turnaja má niekoľko záložiek:
- **Skupiny:** Zobrazenie všetkých skupín a ich zápasov
- **Zápasy:** Zobrazenie všetkých zápasov s možnosťami filtrovania
- **Tabuľka:** Zobrazenie tabuliek skupín
- **Play-off:** Zobrazenie a správa play-off pavúkov
- **Štatistiky:** Zobrazenie štatistík celého turnaja
- **Live Zápasy:** Zobrazenie aktuálne aktívnych zápasov

### Záložka Skupiny

**Miesto pre Screenshot:** *Záložka Skupiny zobrazujúca viacero skupín s ich zápasmi*

- Každá skupina je zobrazená ako karta
- Názov skupiny je zobrazený v hornej časti (napr. "Skupina A", "Skupina B")
- Všetky zápasy v tejto skupine sú uvedené nižšie
- Indikátory stavu zápasu:
  - **Nezačaté:** Sivý/naplánovaný stav
  - **Prebieha:** Zelený indikátor "Live"
  - **Dokončené:** Zobrazuje finálne skóre s zvýrazneným víťazom

### Záložka Zápasy

**Miesto pre Screenshot:** *Záložka Zápasy zobrazujúca rozbaľovacie zoznamy filtrov a zoznam zápasov*

- Zobrazenie všetkých zápasov zo všetkých skupín na jednom mieste
- **Možnosti Filtrovania:**
  - **Filtrovať podľa Skupiny:** Rozbaľovací zoznam na zobrazenie zápasov z konkrétnej skupiny alebo "Všetky Skupiny"
  - **Filtrovať podľa Hráča:** Textové vstupné pole na vyhľadanie zápasov obsahujúcich konkrétne meno hráča
  - **Vymazať Filtre:** Tlačidlo na resetovanie všetkých filtrov
- Každá karta zápasu zobrazuje:
  - Mená hráčov
  - Stav zápasu
  - Skóre (ak je dokončené)
  - Tlačidlo štatistík (pre dokončené zápasy)

### Spustenie Zápasu

**Miesto pre Screenshot:** *Karta zápasu s tlačidlom "Spustiť Zápas"*

- Kliknite na **"Spustiť Zápas"** na akomkoľvek naplánovanom zápase
- Budete presmerovaní na Rozhranie Zápasu na zapisovanie zápasu
- Stav zápasu sa zmení na "Prebieha" a zobrazí sa v Live Zápasoch

### Úprava Zápasov (Iba Play-off)

**Miesto pre Screenshot:** *Play-off zápas s ikonou tlačidla na úpravu*

- V záložke Play-off možno upraviť play-off zápasy pred ich začatím
- Kliknite na **ikonu úpravy** (ceruzka) vedľa play-off zápasu
- Vyberte rôznych hráčov pre zápas
- Toto je užitočné, ak je potrebné nahradiť hráčov alebo upraviť pavúky

---

## Zobrazenie Tabuľky

### Záložka Tabuľka

**Miesto pre Screenshot:** *Záložka Tabuľka zobrazujúca tabuľky skupín*

- Každá skupina má svoju vlastnú tabuľku
- Tabuľky zobrazujú:
  - **Pozícia:** Poradie hráča v skupine
  - **Meno Hráča:** Meno hráča
  - **Počet Víťazstiev:** Počet vyhraných zápasov
  - **Rozdiel Legov:** Rozdiel medzi vyhranými a prehranými legmi
  - **Priemer:** Priemerné skóre zápasu
  - **Body:** Celkové body (ak je to relevantné)

### Pochopenie Tabuľky

**Miesto pre Screenshot:** *Tabuľka s viacerými hráčmi zobrazujúca rôzne štatistiky*

- Hráči sú zoradení podľa **Poradia Kritérií v Tabuľke**, ktoré ste nakonfigurovali
- Tabuľka sa automaticky aktualizuje po dokončení zápasov
- Kladné rozdiely legov sú zobrazené zelenou farbou
- Záporné rozdiely legov sú zobrazené červenou farbou

### Kritériá Tabuľky

Tabuľka používa tieto kritériá v poradí (podľa konfigurácie):
1. **Počet Víťazstiev:** Vyššie je lepšie
2. **Rozdiel Legov:** Vyššie je lepšie
3. **Priemer:** Vyššie je lepšie
4. **Vzájomný Zápas:** Víťaz priameho zápasu je vyššie hodnotený

---

## Nastavenie Play-off

### Predpoklady

**Miesto pre Screenshot:** *Záložka Play-off zobrazujúca sekciu "Spustiť Play-off" s kvalifikovanými hráčmi*

Pred spustením play-off:
- Všetky skupinové zápasy musia byť dokončené (alebo aspoň dostatočne na určenie kvalifikantov)
- Nastavenia play-off musia byť povolené v nastaveniach turnaja
- Kvalifikujúci hráči budú automaticky určení podľa vašich nastavení play-off

### Zobrazenie Kvalifikujúcich Hráčov

**Miesto pre Screenshot:** *Sekcia kvalifikujúcich hráčov zobrazujúca hráčov zoskupených podľa ich skupín*

- Záložka Play-off zobrazuje, ktorí hráči sa kvalifikujú z každej skupiny
- Hráči sú zoskupení podľa ich pôvodnej skupiny
- Počet kvalifikantov zodpovedá vašim nastaveniam play-off

### Spustenie Play-off

**Miesto pre Screenshot:** *Tlačidlo "Spustiť Play-off"*

- Kliknite na tlačidlo **"Spustiť Play-off"**
- Play-off pavúky budú automaticky vygenerované
- Zápasy budú vytvorené pre každé kolo:
  - Osemfinále (ak sa kvalifikuje 16+ hráčov)
  - Štvrťfinále (8 hráčov)
  - Semifinále (4 hráči)
  - Finále (2 hráči)
  - Zápas o 3. miesto (ak je nakonfigurovaný)

### Play-off Pavúky

**Miesto pre Screenshot:** *Play-off pavúky zobrazujúce rôzne kolá s kartami zápasov*

- Každé kolo je zobrazené ako samostatná sekcia
- Aktuálne kolo je zvýraznené
- Karty zápasov zobrazujú:
  - Mená hráčov
  - Stav zápasu
  - Požiadavku na legy na výhru pre toto kolo
  - Tlačidlo úpravy (pred začatím zápasu)

### Úprava Play-off Zápasov

**Miesto pre Screenshot:** *Modálne okno úpravy play-off zápasu zobrazujúce rozbaľovacie zoznamy výberu hráčov*

- Kliknite na **ikonu úpravy** na akomkoľvek play-off zápase
- Vyberte rôznych hráčov zo zoznamu kvalifikujúcich hráčov
- Uložte na aktualizáciu zápasu
- Užitočné na spracovanie náhrad alebo úprav pavúkov

---

## Zobrazenie Štatistík

### Záložka Štatistiky Turnaja

**Miesto pre Screenshot:** *Záložka Štatistiky zobrazujúca štatistiky celého turnaja*

Záložka Štatistiky zobrazuje celkové štatistiky turnaja:
- **Najlepšie Priemery:** Najlepšie priemery zápasov zo všetkých zápasov
- **Najlepšie Checkouty:** Najvyššie checkoutové skóre
- **Najmenej Šípok:** Najlepšie výkony v legoch (najmenej šípok na leg)
- Štatistiky sú vypočítané zo všetkých dokončených zápasov (skupinových a play-off)

### Štatistiky Zápasu

**Miesto pre Screenshot:** *Karta dokončeného zápasu s ikonou tlačidla štatistík*

- Pre akýkoľvek dokončený zápas kliknite na tlačidlo **ikonu štatistík** (stĺpcový graf)
- Otvorí sa modálne okno zobrazujúce podrobné štatistiky zápasu

### Modálne Okno Štatistík Zápasu

**Miesto pre Screenshot:** *Modálne okno štatistík zápasu zobrazujúce mená hráčov, vyhrané legy a podrobné štatistiky*

Modálne okno štatistík zobrazuje:

1. **Hlavička Zápasu:**
   - Meno Hráča 1 a vyhrané legy
   - Meno Hráča 2 a vyhrané legy
   - Rozdeľovač "vs"

2. **Priemer Zápasu:**
   - Priemerné skóre pre Hráča 1
   - Priemerné skóre pre Hráča 2

3. **Vyhrané Legy:**
   - Celkový počet vyhraných legov každého hráča

4. **Checkouty:**
   - Zoznam všetkých checkoutových skóre pre Hráča 1 (zoradené od najvyššieho po najnižšie)
   - Zoznam všetkých checkoutových skóre pre Hráča 2 (zoradené od najvyššieho po najnižšie)

5. **Šípky na Leg:**
   - Tabuľka zobrazujúca počet použitých šípok v každom lege pre oboch hráčov
   - Víťazné legy sú zvýraznené
   - Zobrazuje porovnanie výkonnosti leg po lege

**Miesto pre Screenshot:** *Podrobné sekcie štatistík zobrazujúce priemery, zoznam checkoutov a tabuľku šípok na leg*

---

## Live Zápasy

### Záložka Live Zápasy

**Miesto pre Screenshot:** *Záložka Live Zápasy zobrazujúca karty v štýle scoreboardu pre aktívne zápasy*

- Záložka Live Zápasy zobrazuje všetky aktuálne aktívne zápasy
- Zápasy sú zobrazené v štýle scoreboardu:
  - Mená hráčov
  - Aktuálne skóre legu (vyhrané legy)
  - Aktuálne skóre v aktívnom lege
  - Názov skupiny v spodnej časti
- Live zápasy sa automaticky obnovujú každých 8 sekúnd (iba keď je táto záložka aktívna)

### Indikátory Stavu Zápasu

**Miesto pre Screenshot:** *Karta live zápasu s indikátorom "Live" a stavom pripojenia*

- **Indikátor Live:** Zelený odznak "Live" zobrazuje, že zápas prebieha
- **Stav Pripojenia:** Zobrazuje, či je zápas zapisovaný na vašom zariadení alebo inom zariadení

### Zobrazenie Podrobností Live Zápasu

- Kliknite na kartu live zápasu na zobrazenie viacerých podrobností
- Budete presmerovaní na Rozhranie Zápasu, ak ste zapisovateľom
- V opačnom prípade uvidíte verziu iba na prezeranie

---

## Zapisovanie Zápasu

### Prehľad Rozhrania Zápasu

**Miesto pre Screenshot:** *Rozhranie Zápasu zobrazujúce scoreboard v hornej časti a tlačidlá dart boardu nižšie*

Rozhranie Zápasu má dve hlavné sekcie:
1. **Scoreboard:** Zobrazuje skóre a štatistiky oboch hráčov
2. **Dart Board:** Tlačidlá na zadávanie skóre

### Sekcia Scoreboard

**Miesto pre Screenshot:** *Scoreboard zobrazujúci zvýrazneného aktívneho hráča a neaktívneho hráča*

**Aktívny Hráč (Aktuálne Hádže):**
- Pozadie: Oranžové zvýraznenie s prechodom
- Meno hráča: Veľký, tučný, biely text
- Vyhrané legy: Veľké číslo s oranžovým pozadím
- Aktuálne skóre: Veľké, tučné číslo
- Posledné hody: Zobrazuje posledné 3 skóre šípok
- Štatistiky: Priemer a počet použitých šípok v aktuálnom lege

**Neaktívny Hráč:**
- Pozadie: Priehľadné/tmavé
- Meno hráča: Veľký, tučný text (čierny v svetlom režime, biely v tmavom režime)
- Vyhrané legy: Veľké číslo
- Aktuálne skóre: Veľké, tučné číslo
- Posledné hody: Zobrazuje posledné 3 skóre šípok
- Štatistiky: Priemer a počet použitých šípok v aktuálnom lege

### Sekcia Dart Board

**Miesto pre Screenshot:** *Sekcia dart boardu zobrazujúca číselné tlačidlá, tlačidlá režimu a tlačidlo odstránenia posledného*

**Výber Čísla:**
- Tlačidlá pre čísla 0-20 a 25 (bull)
- Kliknite na číslo na zadanie tohto skóre

**Výber Režimu:**
- **Single:** Štandardné jednoduché skóre (predvolené)
- **Double:** Dvojnásobok čísla (vonkajší kruh)
- **Triple:** Trojnásobok čísla (vnútorný kruh)
- **Bull:** 25 alebo 50 (bullseye)

**Špeciálne Tlačidlá:**
- **Odstrániť Posledné:** Odstránenie posledného zadaného skóre šípky
- **Bust:** Automaticky sa spustí, ak skóre klesne pod nulu

### Proces Zapisovania

**Miesto pre Screenshot:** *Zápas v priebehu zobrazujúci zadávanie šípky a aktualizácie skóre*

1. **Vyberte Režim:** Vyberte Single, Double alebo Triple (ak je to potrebné)
2. **Zadajte Skóre:** Kliknite na číselné tlačidlo
3. **Opakujte:** Zadajte až 3 šípky na kolo
4. **Checkout:** Ak skóre dosiahne presne 0 s dvojkou alebo bullom, leg je vyhraný
5. **Bust:** Ak skóre klesne pod 0, kolo je bust a skóre sa resetuje na predchádzajúcu hodnotu

### Tok Zápasu

**Miesto pre Screenshot:** *Dialóg spustenia legu zobrazujúci výber hráča*

- **Spustenie Legu:** Keď sa začne nový leg, budete požiadaní o výber, kto hádže prvý
- **Dokončenie Legu:** Keď hráč vyhrá leg, scoreboard sa aktualizuje
- **Dokončenie Zápasu:** Keď hráč dosiahne požadovaný počet legov na výhru, zobrazí sa karta víťaza

### Karta Víťaza Zápasu

**Miesto pre Screenshot:** *Karta dokončenia zápasu zobrazujúca meno víťaza, ikonu trofeje a finálne skóre*

- Zobrazuje meno víťaza prominentne
- Zobrazuje finálne skóre (napr. "3-1")
- Ikona trofeje indikuje dokončenie zápasu
- Kliknite na návrat do správy turnaja

### Nastavenia Zápasu počas Hry

**Miesto pre Screenshot:** *Nastavenia zápasu dostupné počas zápasu (ak je to povolené)*

- Niektoré nastavenia zápasu možno upraviť počas hry (ak je to povolené)
- Legy na výhru možno niekedy zmeniť pred dokončením zápasu

---

## Ďalšie Funkcie

### Filtrovanie Zápasov

**Miesto pre Screenshot:** *Záložka Zápasy s aplikovanými filtrami*

- Použite rozbaľovací zoznam skupiny na filtrovanie podľa konkrétnej skupiny
- Použite vstupné pole mena hráča na nájdenie zápasov s konkrétnymi hráčmi
- Filtre sa zachovávajú pri navigácii (okrem obnovenia live zápasov)

### Stav Turnaja

Turnaje môžu mať rôzne stavy:
- **Otvorené pre Registráciu:** Hráči môžu byť pridaní, nastavenia možno zmeniť
- **Aktívne:** Turnaj prebieha, zápasy sa hrajú
- **Dokončené:** Všetky zápasy (vrátane play-off) sú ukončené

### Tmavý Režim

**Miesto pre Screenshot:** *Navigačný panel zobrazujúci tlačidlo prepínania témy*

- Prepínajte medzi svetlým a tmavým režimom pomocou ikony mesiaca/slnka v navigačnom paneli
- Vaša preferencia je uložená a zachováva sa medzi reláciami
- Všetky stránky turnaja podporujú obe témy

### Výber Jazyka

**Miesto pre Screenshot:** *Rozbaľovací zoznam prepínača jazyka*

- Zmeňte jazyk aplikácie pomocou prepínača jazyka v navigačnom paneli
- Dostupné jazyky: Slovenčina, Angličtina (a ďalšie, ak sú nakonfigurované)

---

## Tipy a Najlepšie Postupy

1. **Naplánujte Svoje Skupiny:** Rozhodnite sa o štruktúre skupín pred pridaním hráčov, aby ste zabezpečili rovnomerné rozdelenie

2. **Nakonfigurujte Play-off Skoro:** Nastavte nastavenia play-off počas vytvárania turnaja, aby ste sa neskôr vyhli zmätku

3. **Pravidelne Kontrolujte Tabuľku:** Monitorujte tabuľky skupín, aby ste pochopili scenáre kvalifikácie

4. **Použite Filtre Zápasov:** Pri správe mnohých zápasov použite filtre na rýchle nájdenie konkrétnych zápasov

5. **Prezrite si Štatistiky:** Skontrolujte štatistiky zápasov po dôležitých zápasoch na sledovanie výkonnosti hráčov

6. **Monitorovanie Live Zápasov:** Použite záložku Live Zápasy na simultánne monitorovanie všetkých aktívnych zápasov

7. **Úprava Play-off Zápasov:** Ak je potrebné nahradiť hráčov v play-off, použite funkciu úpravy pred začatím zápasu

8. **Uložte Nastavenia:** Vždy kliknite na "Aktualizovať Nastavenia" po vykonaní zmien, aby ste zabezpečili ich uloženie

---

## Riešenie Problémov

### Nemôžem Spustiť Turnaj
- **Problém:** Tlačidlo Spustiť Turnaj je zakázané
- **Riešenie:** Uistite sa, že sú registrovaní aspoň 2 hráči

### Nemôžem Odstrániť Hráčov
- **Problém:** Tlačidlo odstránenia nefunguje
- **Riešenie:** Hráči môžu byť odstránení iba pred spustením turnaja

### Zápas sa Nezobrazuje v Live Zápasoch
- **Problém:** Spustený zápas sa nezobrazuje ako live
- **Riešenie:** Obnovte stránku alebo skontrolujte, či ste na záložke Live Zápasy

### Štatistiky sa Nezobrazujú
- **Problém:** Tlačidlo štatistík sa nezobrazuje alebo nezobrazuje žiadne dáta
- **Riešenie:** Uistite sa, že je zápas dokončený a má uložený výsledok

### Play-off sa Nespúšťa
- **Problém:** Tlačidlo Spustiť Play-off je zakázané
- **Riešenie:** Uistite sa, že je dokončených dostatočne skupinových zápasov na určenie kvalifikantov

---

## Záver

Táto príručka pokrýva všetky aspekty správy turnajov od vytvorenia až po dokončenie. Pre ďalšiu pomoc alebo otázky sa pozrite na sekciu pomoci aplikácie alebo kontaktujte podporu.

**Šťastnú správu turnajov! 🎯**

