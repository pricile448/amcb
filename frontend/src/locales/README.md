# Gestion des traductions

## Traductions manquantes

Un fichier `missing_translations.json` a été créé pour stocker les clés de traduction manquantes identifiées dans l'application. Ces clés sont utilisées dans le code mais n'étaient pas présentes dans le fichier `fr.json` principal.

## Comment fusionner les traductions

Pour intégrer les traductions manquantes dans le fichier principal, exécutez le script de fusion :

```bash
node src/utils/mergeTranslations.js
```

Ce script va :
1. Lire le fichier `fr.json` principal
2. Lire le fichier `missing_translations.json` contenant les traductions manquantes
3. Fusionner les deux fichiers en préservant la structure existante
4. Écrire le résultat dans le fichier `fr.json`

## Clés manquantes identifiées

Les clés suivantes ont été identifiées comme manquantes dans le fichier `fr.json` :

1. `transfers.internalTransfer` - Titre du virement interne
2. `transfers.internalTransferDescription` - Description du virement interne
3. `transfers.startInternalTransfer` - Bouton pour démarrer un virement interne
4. `transfers.externalTransfer` - Titre du virement externe
5. `transfers.externalTransferDescription` - Description du virement externe
6. `transfers.startExternalTransfer` - Bouton pour démarrer un virement externe
7. `transfers.recurringTransfer` - Titre du virement récurrent
8. `transfers.recurringTransferDescription` - Description du virement récurrent
9. `transfers.startRecurringTransfer` - Bouton pour démarrer un virement récurrent
10. `transfers.businessDays` - Jours ouvrables
11. `transactions.filters` - Bouton de filtres
12. `transactions.advancedFilters` - Titre des filtres avancés
13. `common.resetFilters` - Bouton pour réinitialiser les filtres
14. `transfers.type.internal` - Type de virement interne dans le filtre
15. `transfers.type.external` - Type de virement externe dans le filtre
16. `transfers.type.recurring` - Type de virement récurrent dans le filtre
17. `transfers.status.cancelled` - Statut annulé dans le filtre
18. `transactions.allTime` - Option de filtre pour toutes les dates
19. `transactions.lastWeek` - Option de filtre pour la semaine dernière
20. `transactions.lastMonth` - Option de filtre pour le mois dernier
21. `transactions.amountSmall` - Option de filtre pour les petits montants
22. `transactions.amountMedium` - Option de filtre pour les montants moyens
23. `transactions.amountLarge` - Option de filtre pour les grands montants
24. `kyc.noTransfersAvailable` - Message quand aucun transfert n'est disponible
25. `transfers.noTransfersFound` - Message quand aucun transfert n'est trouvé

## Bonnes pratiques

- Vérifiez régulièrement que toutes les clés utilisées dans le code sont présentes dans les fichiers de traduction
- Ajoutez les nouvelles clés dans tous les fichiers de traduction (fr.json, en.json, etc.)
- Utilisez des outils automatisés pour détecter les clés manquantes