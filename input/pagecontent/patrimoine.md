# Gestion du patrimoine hospitalier

Ce projet illustre la modélisation de la gestion du patrimoine hospitalier à l’aide de profils FHIR personnalisés.

## 🏢 Bâtiments hospitaliers

Les bâtiments sont représentés par des ressources `Location` profilées via `HospitalBuilding`.  
Chaque bâtiment a un nom, un statut actif, et un type physique `building`.

### Exemples :
- Hôpital Principal
- Bâtiment Nord

## 🏥 Salles de soin

Les salles sont aussi des `Location`, mais rattachées à un bâtiment (via `partOf`) et de type `room`.  
Elles sont représentées par le profil `CareRoom`.

### Exemples :
- Salle de pansement A
- Salle d'urgence B

## 🧑‍⚕️ Affectation des soignants

Les affectations sont gérées avec la ressource `PractitionerRole`, profilée via `CareAssignment`.  
On y associe un professionnel (`Practitioner`) à une salle ou un bâtiment, avec sa spécialité et son organisation.

### Exemples :
- Infirmière affectée à la Salle A
- Médecin généraliste affecté à la Salle B

---

## Objectifs pédagogiques

- Illustrer la structuration des ressources patrimoniales hospitalières
- Montrer l'utilisation de `Location` dans différents contextes
- Explorer l'association entre professionnels et lieux de soins
