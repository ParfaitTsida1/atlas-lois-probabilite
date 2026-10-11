# Publier l'application sur le Play Store et l'App Store

Le projet utilise [Capacitor](https://capacitorjs.com) : le site (`index.html`) est embarqué dans une application Android et une application iOS. Les dossiers `android/` et `ios/` sont déjà générés, avec icônes et écran de démarrage.

## Identité de l'application

- Nom : « Atlas des lois »
- Identifiant : `com.parfaittsida.atlaslois` (à changer dans `capacitor.config.json` avant la première publication si besoin, car il ne peut plus être modifié après)
- Version : à régler dans `android/app/build.gradle` (`versionCode`, `versionName`) et dans Xcode (Version et Build)

## Avant de commencer

| | Android (Play Store) | iOS (App Store) |
|---|---|---|
| Compte développeur | Google Play Console, 25 $ une seule fois | Apple Developer Program, 99 $ par an |
| Ordinateur | Windows, Mac ou Linux | **Mac obligatoire** avec Xcode |
| Outil | Android Studio | Xcode |

Il faut aussi : une politique de confidentialité en ligne (l'application ne collecte aucune donnée, une page courte suffit), des captures d'écran et une description pour chaque store.

## Préparer les fichiers

```bash
npm install
npm run sync      # copie le site dans www/ puis dans android/ et ios/
```

À refaire après chaque modification de `index.html`.

## Android

1. `npm run android` ouvre le projet dans Android Studio.
2. Tester sur un téléphone ou un émulateur (bouton Run).
3. Menu **Build**, **Generate Signed Bundle / APK**, choisir **Android App Bundle**, créer une clé de signature et **la sauvegarder en lieu sûr** (sans elle, plus aucune mise à jour possible).
4. Envoyer le fichier `.aab` dans la Play Console, remplir la fiche, puis soumettre. Pour un compte personnel créé récemment, Google demande d'abord un test fermé avec 12 testeurs pendant 14 jours.

## iOS

1. `npm run ios` ouvre le projet dans Xcode (sur Mac).
2. Dans **Signing & Capabilities**, choisir votre équipe Apple Developer.
3. Tester sur un iPhone ou un simulateur.
4. Menu **Product**, **Archive**, puis **Distribute App** vers App Store Connect.
5. Remplir la fiche dans App Store Connect et soumettre à la validation.

Point d'attention : Apple refuse parfois les applications qui ne sont que des sites web emballés. Pour la validation, l'application doit offrir une vraie utilité hors ligne (c'est le cas : elle fonctionne sans connexion) et idéalement des fonctions propres à l'application.

## Installer sans passer par les stores

Le site est aussi une application web installable (PWA) : depuis Chrome ou Safari sur téléphone, « Ajouter à l'écran d'accueil » donne une icône et un fonctionnement hors ligne.
