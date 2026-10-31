# Revue documentaire complémentaire — 31 octobre 2026

La première revue visuelle avait laissé 17 zones au statut « À vérifier ». La suite du travail complète 16 de ces zones. Le corpus et ses octets sources restent inchangés.

## État après complément

- 31 zones : éléments explicitement documentés au statut « Vérifié ».
- 1 zone : « À vérifier » (856, dont le rôle et les indicateurs sont documentés mais dont le $b rencontré reste inexpliqué).
- 2 zones : « Règle locale » (039 et 930). Le statut distingue leur portée des règles générales ; il ne prétend pas que tous leurs codes sont élucidés.

Les définitions ajoutées concernent 001, 003, 020, 073, 100, 102, 105, 106, 181, 182, 300, 410, 500, 676, 686 et 801. Les sources spécifiques et complémentaires sont désormais affichées dans la rubrique normative, avec des liens paginés pour le profil BnF.

## Résultats documentaires importants

| Élément | Conclusion et portée | Référence |
| --- | --- | --- |
| 330$2 | Source du résumé dans le profil de diffusion BnF ; la valeur « éditeur » n’est plus laissée sans explication | [BnF, profil 2023, p. 36](https://www.bnf.fr/sites/default/files/2023-10/UNIMARC_B.pdf#page=36) |
| 700/701/702$o | Identifiant ISNI, distinct de l’identifiant d’autorité $3 | [BnF, p. 55–56](https://www.bnf.fr/sites/default/files/2023-10/UNIMARC_B.pdf#page=55) |
| 410 | Les indicateurs et sous-zones classiques sont complétés à partir des règles communes du bloc 4XX | [CfU, bloc 4XX](https://www.transition-bibliographique.fr/B4XX_fre) |
| 856$b | Le manuel CfU définit un numéro d’accès, tandis que le corpus fournit des libellés de couverture. Aucune correspondance n’est inventée | [CfU, 856](https://www.transition-bibliographique.fr/B856_fre), [profil BnF, p. 59–60](https://www.bnf.fr/sites/default/files/2023-10/UNIMARC_B.pdf#page=59) |
| 930 | La recommandation nationale éclaire la structure, mais ne suffit pas à interpréter tous les codes de l’export BnF ; les codes O/N ne sont pas assimilés aux niveaux de localisation | [CfU, données d’exemplaire, p. 29](https://www.transition-bibliographique.fr/Description_FormatUnimarcEchange_Exemplaire#page=29) |
| 039 | La source, le numéro de contrôle et la date de fusion sont documentés ; les codes OPP/NOE ne sont pas développés sans référence | [BnF, p. 12](https://www.bnf.fr/sites/default/files/2023-10/UNIMARC_B.pdf#page=12) |

## Limite de consultation pour 020

Le PDF CfU 020 n’a pas pu être récupéré par l’outil de consultation. Les deux sous-champs rencontrés et les indicateurs sont confirmés par le profil BnF, p. 11. La répétabilité de la zone est confirmée par l’extrait indexé du tableau IFLA 2025. Le téléchargement intégral du tableau IFLA n’a pas abouti ; cette limite est indiquée dans la fiche. Les modalités détaillées de répétabilité des sous-champs ne sont pas inventées.

## Validation

TypeScript, import fidèle des 154 zones et compilation statique passent. Des contrôles spécifiques vérifient désormais la présence des références BnF pour 330$2 et 7XX$o, les sous-zones de lien 410 et le maintien des incertitudes de 856 et 930.

La suite navigateur de la bibliothèque sous `/docs/` passe : les cinq notices, les valeurs complètes, les occurrences, la copie, la vue brute, les téléchargements identiques aux sources, le clavier et les écrans mobiles. Les dix captures sont régénérées avec les nouvelles annotations. Les tests généraux de la plateforme et de la visite Koha avaient passé à l’étape précédente ; leurs composants et données ne sont pas modifiés par ce complément.

La documentation n’est pas un audit exhaustif du manuel UNIMARC courant. Les références CfU anciennes, le profil de diffusion BnF et les observations de corpus restent distingués. Les procédures du réseau restent à valider humainement. La pull request reste sans fusion ni déploiement de production.
