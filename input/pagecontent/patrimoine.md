# Documentation du modèle FHIR ISIS (FHIR R5)

Cette documentation décrit les profils personnalisés FHIR R5 développés dans le cadre du projet ISIS pour la modélisation des professionnels de santé, des rôles, des organisations et des lieux d'exercice. Elle couvre également les instances associées pour fournir des exemples concrets.

---

## Profils personnalisés

### 1. `ISISPractitioner` — Praticien

**Basé sur** : `Practitioner`

**Description** : Représente un professionnel de santé enregistré au RPPS.

**Contraintes** :

* `meta.profile` : obligatoire (1..1)
* `identifier` : obligatoire (1..1), avec `system = https://esante.gouv.fr/produits-services/repertoire-rpps`
* `name` : obligatoire (1..1)
* `telecom` : optionnel (0..\*)

---

### 2. `ISISPractitionerRole` — Rôle du praticien

**Basé sur** : `PractitionerRole`

**Description** : Représente l'affectation d'un praticien à une organisation.

**Contraintes** :

* `meta.profile` : obligatoire (1..1)
* `identifier` : obligatoire (1..1), avec `system = https://esante.gouv.fr/produits-services/repertoire-rpps`
* `practitioner` : obligatoire (1..1)
* `organization` : obligatoire (1..1)
* `code` : obligatoire (1..1), avec terminologie SNOMED CT

---

### 3. `ISISOrganization` — Organisation de santé

**Basé sur** : `Organization`

**Description** : Représente une structure sanitaire identifiée par l’INSEE.

**Contraintes** :

* `identifier` : obligatoire (1..1), avec `system = https://esante.gouv.fr/annuaire/identifiants-structure`
* `name` : obligatoire (1..1)
* `type` : obligatoire (1..1)
* `contact` : au moins 1 (1..\*)

    * `address` : obligatoire (1..1)
    * `telecom` : au moins 1 (1..\*)

---

### 4. `ISISLocation` — Lieu d’exercice

**Basé sur** : `Location`

**Description** : Représente un lieu physique d’exercice (établissement, UF, cabinet, etc.).

**Contraintes** :

* `identifier` : slicing sur `system`

    * Slice `ufNumber` (0..1)
    * `system = http://our-organization/identifiers/uf-numero`
* `name` : obligatoire (1..1)
* `type` : obligatoire (1..1)
* `type.text` : optionnel (0..1)
* `mode` : `#instance` obligatoire
* `partOf` : optionnel (0..1)
* `managingOrganization` : obligatoire (1..1)
* `address` : optionnel (0..1)

---

## Instances d’exemple

### `CHUToulouse` — Organisation

* Identifiant INSEE : `31078123400017`
* Type : `Healthcare Provider`
* Téléphone : `+33561777777`
* Email : `contact@chu-toulouse.fr`

### `CHUdeSfax` — Location

* Type : `Hospital`
* Adresse : `17 rue joseph, Sfax, 35588, FR`
* Organisation gestionnaire : CHU de Toulouse

### `ServiceCardiologie` — Location

* Identifiant UF : `7795`
* Type : `Ward-Service`
* Organisation gestionnaire : CHU de Toulouse

### `ServicePneumologie` — Location

* Identifiant UF : `1254`
* Aile : `Ouest` (via extension)
* Organisation gestionnaire : CHU de Toulouse

### `RomainNtamack` — Practitioner

* RPPS : `22233445566`
* Téléphone pro : `+33561611777`
* Email : `romain.ntamack@chu-toulouse.fr`

### `AffectationNtamack` — PractitionerRole

* Praticien : Romain Ntamack
* Organisation : CHU de Toulouse
* Rôle : Infirmier (SNOMED : `159738005`)

---

## Version & Conformité

* FHIR Version : R5
* Auteur : Projet ISIS — École d’ingénieurs en e-santé
* Version du modèle : 1.0.0
* Date : Juin 2025
