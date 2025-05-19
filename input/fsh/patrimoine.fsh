// =======================
// Profil : Bâtiment Hospitalier
// =======================
Profile: HospitalBuilding
Parent: Location
Id: hospital-building
Title: "Bâtiment Hospitalier"
Description: "Profil représentant un bâtiment de l'hôpital."

* status = #active
* name 1..1
* type = http://terminology.hl7.org/CodeSystem/v3-RoleCode#HOSP
* form = http://terminology.hl7.org/CodeSystem/location-physical-type#bu

// =======================
// Profil : Salle de Soin
// =======================
Profile: CareRoom
Parent: Location
Id: care-room
Title: "Salle de Soin"
Description: "Profil représentant une salle de soin dans l'hôpital."

* status = #active
* name 1..1
* type = http://terminology.hl7.org/CodeSystem/v3-RoleCode#ER
* form = http://terminology.hl7.org/CodeSystem/location-physical-type#ro
* partOf 1..1

// =======================
// Profil : Affectation de Soignant
// =======================
Profile: CareAssignment
Parent: PractitionerRole
Id: care-assignment
Title: "Affectation de Soignant"
Description: "Profil représentant l'affectation d'un soignant à un service ou une salle."

* practitioner 1..1
* organization 1..1
* location 1..*
* code 1..1
* specialty 0..*

// =======================
// Instance : Bâtiment A
// =======================
Instance: BuildingA
InstanceOf: HospitalBuilding
Title: "Bâtiment A"
Description: "Bâtiment principal de l'hôpital."
* name = "Bâtiment A"
* status = #active
* type = http://terminology.hl7.org/CodeSystem/v3-RoleCode#HOSP
* form = http://terminology.hl7.org/CodeSystem/location-physical-type#bu

// =======================
// Instance : Salle 101
// =======================
Instance: Room101
InstanceOf: CareRoom
Title: "Salle 101"
Description: "Salle de soin située dans le Bâtiment A."
* name = "Salle 101"
* status = #active
* type = http://terminology.hl7.org/CodeSystem/v3-RoleCode#ER
* form = http://terminology.hl7.org/CodeSystem/location-physical-type#ro
* partOf = Reference(BuildingA)

// =======================
// Instance : Infirmier 1 (générique)
// =======================
Instance: Nurse1
InstanceOf: Practitioner
Title: "Infirmier 1"
Description: "Infirmier travaillant dans la Salle 101."
* name[0].use = #official
* name[0].family = "Dupont"
* name[0].given[0] = "Jean"

// =======================
// Instance : Organisation Hospitalière (générique)
// =======================
Instance: HospitalOrg
InstanceOf: Organization
Title: "Organisation Hospitalière"
Description: "Organisation représentant l'hôpital."
* name = "Hôpital Général"

// =======================
// Instance : Affectation de l'Infirmier 1
// =======================
Instance: AssignmentNurse1
InstanceOf: CareAssignment
Title: "Affectation de l'Infirmier 1"
Description: "Infirmier 1 affecté à la Salle 101."
* practitioner = Reference(Nurse1)
* organization = Reference(HospitalOrg)
* location = Reference(Room101)
* code = http://terminology.hl7.org/CodeSystem/practitioner-role#nurse
* specialty = http://snomed.info/sct#224565004 "Soins infirmiers"
