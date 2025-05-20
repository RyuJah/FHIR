# Guide Patrimoine FHIR

Bienvenue dans le guide d'implémentation FHIR dédié à la gestion du patrimoine hospitalier.

Ce guide propose une modélisation structurée des ressources clés du système hospitalier, en conformité avec le standard HL7® FHIR R5. Il vise à faciliter l'interopérabilité entre les systèmes d'information de santé, en s'appuyant sur des profils personnalisés adaptés au contexte français (RPPS, structures, affectations...).

## Ressources couvertes

- **Practitioner** : professionnels de santé enregistrés dans le RPPS, avec profil `ISISPractitioner`.
- **PractitionerRole** : affectation des soignants à une structure et un lieu, avec profil `ISISPractitionerRole`.
- **Organization** : structure de soins (ex. CHU, clinique, cabinet), identifiée par un SIRET, avec profil `ISISOrganization`.
- **Location** : lieu d’exercice (cabinet, bâtiment, service hospitalier), avec profil `ISISLocation`.

## Objectifs du guide

- Fournir une base de modélisation commune pour les établissements de santé
- Documenter les contraintes minimales pour chaque type de ressource
- Proposer des exemples réalistes et réutilisables
- Soutenir les équipes projets dans leurs démarches d’implémentation FHIR

## Contexte d'utilisation

Ce guide s'inscrit dans le cadre de la digitalisation du système de santé et s’adresse aux éditeurs de logiciels, établissements publics ou privés, et aux intégrateurs souhaitant structurer leurs données FHIR autour des affectations de soignants, des lieux et des structures hospitalières.