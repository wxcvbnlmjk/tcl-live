# TCL Live

Application web de visualisation des **prochains passages TCL** (Transports en Commun Lyonnais) sur une carte interactive, à partir des données ouvertes du [Grand Lyon](https://data.grandlyon.com).

## Fonctionnalités

### Carte interactive

- Affichage des arrêts du réseau TCL sur une carte **OpenStreetMap** (fonds de carte via **Leaflet**).
- Positionnement des arrêts à partir de `public/arrets.json` (coordonnées `lat` / `lon`).
- Les points bleus n’apparaissent qu’à partir du **zoom 16**, lorsque les noms de rues sont lisibles sur la carte (évite la surcharge visuelle en vue large).

### Informations temps réel par arrêt

Au clic sur un arrêt, une popup affiche :

- le **nom** de l’arrêt ;
- pour chaque **ligne + destination** (`idtarretdestination` relié à `arrets.json`) :
  - le numéro de ligne ;
  - la **destination** (nom de l’arrêt terminus) ;
  - les **délais de passage** regroupés, **dédupliqués** et triés par ordre croissant (`Proche`, puis `X min`, puis horaires `XXhYY`).

Les données temps réel proviennent de l’API Grand Lyon (passages à l’arrêt), rafraîchies automatiquement **toutes les 30 secondes**.

### Authentification API

L’accès à l’API `data.grandlyon.com` utilise une **authentification HTTP Basic** :

- en **développement** : proxy Vite (`/api/tcl`) avec identifiants lus depuis `.env` ;
- en **production (Netlify)** : fonction serverless qui appelle l’API côté serveur (les identifiants ne sont jamais exposés au navigateur).

## Technologies

| Domaine | Technologie |
|--------|-------------|
| Interface | [React](https://react.dev/) 19 |
| Langage | [TypeScript](https://www.typescriptlang.org/) |
| Build / dev | [Vite](https://vite.dev/) 8 |
| Carte | [Leaflet](https://leafletjs.com/) + [react-leaflet](https://react-leaflet.js.org/) |
| Tuiles carte | [OpenStreetMap](https://www.openstreetmap.org/) |
| Déploiement | [Netlify](https://www.netlify.com/) (site statique + Functions) |
| API données | [Data Grand Lyon](https://data.grandlyon.com) — jeu `tcl_sytral.tclpassagearret` |
| Qualité code | ESLint |

## Sources de données

| Fichier / endpoint | Rôle |
|-------------------|------|
| `public/arrets.json` | Référentiel des arrêts (id, nom, lat, lon) |
| `/api/tcl` | Proxy vers les passages temps réel Grand Lyon |

URL API cible :

`https://data.grandlyon.com/fr/datapusher/ws/rdata/tcl_sytral.tclpassagearret/all.json?maxfeatures=-1&start=1&filename=prochains-passages-reseau-transports-commun-lyonnais-rhonexpress-disponibilites-temps-reel`

## Structure du projet

```
tcl-live/
├── public/
│   └── arrets.json          # Arrêts (statique)
├── netlify/
│   └── functions/tcl.ts     # Proxy API en production
├── shared/tclApi.ts         # URL API partagée
├── src/
│   ├── api/data.ts          # Chargement arrets + passages
│   ├── components/ArretsMap.tsx
│   └── lib/                 # Popup, regroupement des lignes, index
├── netlify.toml
└── vite.config.ts           # Proxy API en dev
```

## Prérequis

- [Node.js](https://nodejs.org/) 22 (voir `.nvmrc`)
- Compte **Data Grand Lyon**

Mot de passe du portail données (distinct de l’email) :  
https://data.grandlyon.com/portail/fr/mot-de-passe-oublie

## Installation

```bash
git clone <url-du-depot>
cd tcl-live
npm install
```

Copier les variables d’environnement :

```bash
cp .env.example .env
```

Éditer `.env` :

```env
TCL_LOGIN=votre-email@example.com
TCL_PASSWORD="votre-mot-de-passe"
```

> Si le mot de passe contient `#`, le mettre entre **guillemets** dans `.env` (sinon le reste de la ligne est interprété comme un commentaire).

## Lancement en local

### Développement (Vite seul)

```bash
npm run dev
```

Ouvrir l’URL affichée (ex. `http://localhost:5173`). Accessible sur le réseau local grâce à `host: true`.

### Développement (comme sur Netlify)

```bash
npm run dev:netlify
```

Lance Vite + la fonction `tcl` (port Netlify Dev, ex. `http://localhost:8888`).

### Build de production

```bash
npm run build
npm run preview
```

## Déploiement sur Netlify

1. Connecter le dépôt Git à Netlify.
2. Vérifier la configuration (déjà dans `netlify.toml`) :
   - **Build command** : `npm run build`
   - **Publish directory** : `dist`
3. Ajouter les variables d’environnement dans **Site configuration → Environment variables** :
   - `TCL_LOGIN` et `TCL_PASSWORD`
4. Déployer.

La route `/api/tcl` est redirigée vers la fonction serverless `netlify/functions/tcl.ts` (timeout 26 s pour la volumineuse réponse JSON).

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement Vite |
| `npm run dev:netlify` | Dev avec fonctions Netlify |
| `npm run build` | Compilation TypeScript + build Vite |
| `npm run preview` | Aperçu du build local |
| `npm run lint` | Analyse ESLint |

## Licence

Projet privé — données © [Grand Lyon](https://data.grandlyon.com) / TCL Sytral, sous leurs conditions d’utilisation.
