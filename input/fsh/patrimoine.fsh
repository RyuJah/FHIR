// =======================
// Profil : Praticien ISIS (FHIR R5)
// =======================
Profile: ISISPractitioner
Parent: Practitioner
Id: ISIS-practitioner
Title: "Praticien (profil ISIS)"
Description: "Profil FHIR R5 représentant un professionnel de santé enregistré dans le RPPS."

* meta.profile 1..1
* identifier 1..1
* identifier.system = "https://esante.gouv.fr/produits-services/repertoire-rpps"
* name 1..1
* telecom 0..*


// =======================
// Profil : Rôle de Praticien ISIS (FHIR R5)
// =======================
Profile: ISISPractitionerRole
Parent: PractitionerRole
Id: ISIS-practitioner-role
Title: "Rôle de Praticien (profil ISIS)"
Description: "Profil FHIR R5 représentant l'affectation d'un professionnel de santé dans une organisation."

* meta.profile 1..1
* identifier 1..1
* identifier.system = "https://esante.gouv.fr/produits-services/repertoire-rpps"
* practitioner 1..1
* organization 1..1
* code 1..1
* code from http://snomed.info/sct


// =======================
// Profil : Organisation de santé ISIS (FHIR R5)
// =======================
Profile: ISISOrganization
Parent: Organization
Id: ISIS-organization
Title: "Organisation de santé (profil ISIS)"
Description: "Structure sanitaire identifiée par l’INSEE dans le contexte RPPS (FHIR R5)."

* identifier 1..1
* identifier.system = "https://esante.gouv.fr/annuaire/identifiants-structure"
* name 1..1
* type 1..1
* contact 1..*
* contact.address 1..1
* contact.telecom 1..*



// =======================
// Profil : Lieu d’exercice ISIS (FHIR R5)
// =======================
Profile: ISISLocation
Parent: Location
Id: ISIS-location
Title: "Lieu d'exercice (profil ISIS)"
Description: "Localisation physique d’un établissement ou cabinet médical (FHIR R5)."

* status = #active
* name 1..1
* type 1..1
* mode = #instance
* address 0..1


// =======================
// Instance : CHU de Toulouse (Organization)
// =======================
Instance: CHUToulouse
InstanceOf: ISISOrganization
Title: "CHU de Toulouse"
Description: "Centre Hospitalier Universitaire de Toulouse"
* id = "7"
* meta.profile = "http://example.org/fhir/StructureDefinition/ISIS-organization"
* identifier.system = "https://esante.gouv.fr/annuaire/identifiants-structure"
* identifier.value = "31078123400017"
* active = true
* type[0].coding[0].system = "http://terminology.hl7.org/CodeSystem/organization-type"
* type[0].coding[0].code = #prov
* type[0].coding[0].display = "Healthcare Provider"
* type[0].text = "Établissement de santé"
* name = "CHU de Toulouse"
* alias[0] = "Centre Hospitalier Universitaire de Toulouse"
* contact[0].address.use = #work
* contact[0].address.line[0] = "2 Rue Viguerie"
* contact[0].address.city = "Toulouse"
* contact[0].address.postalCode = "31059"
* contact[0].address.country = "FR"
* contact[0].telecom[0].system = #phone
* contact[0].telecom[0].value = "+33561777777"
* contact[0].telecom[1].system = #email
* contact[0].telecom[1].value = "contact@chu-toulouse.fr"




// =======================
// Instance : Centre Médical Saint-Pierre (Location)
// =======================
Instance: CentreMedicalSaintPierre
InstanceOf: ISISLocation
Title: "Centre Médical Saint-Pierre"
Description: "Cabinet de soins ambulatoires à Lyon"
* id = "loc-124"
* status = #active
* name = "Centre Médical Saint-Pierre"
* mode = #instance
* type[0].coding[0].system = "http://terminology.hl7.org/CodeSystem/location-type"
* type[0].coding[0].code = #clinic
* type[0].coding[0].display = "Ambulatory Clinic"
* address[0].use = #work
* address[0].line[0] = "45 avenue des Champs"
* address[0].city = "Lyon"
* address[0].postalCode = "69007"
* address[0].country = "FR"
* position.longitude = 4.845
* position.latitude = 45.748


// =======================
// Instance : Dr Romain Ntamack (Practitioner)
// =======================
Instance: RomainNtamack
InstanceOf: ISISPractitioner
Title: "Dr Romain Ntamack"
Description: "Médecin enregistré dans le RPPS"
* id = "5"
* meta.profile = "http://example.org/fhir/StructureDefinition/ISIS-practitioner"
* identifier.system = "https://esante.gouv.fr/produits-services/repertoire-rpps"
* identifier.value = "22233445566"
* name[0].family = "Ntamack"
* name[0].given[0] = "Romain"
* telecom[0].system = #phone
* telecom[0].value = "+33561611777"
* telecom[0].use = #work
* telecom[1].system = #email
* telecom[1].value = "romain.ntamack@chu-toulouse.fr"


// =======================
// Instance : Affectation du praticien (PractitionerRole)
// =======================
Instance: AffectationNtamack
InstanceOf: ISISPractitionerRole
Title: "Affectation de Dr Ntamack"
Description: "Lien entre Dr Ntamack, le CHU et son rôle professionnel."
* id = "8"
* meta.profile = "http://example.org/fhir/StructureDefinition/ISIS-practitioner-role"
* identifier.system = "https://esante.gouv.fr/produits-services/repertoire-rpps"
* identifier.value = "22233445566"
* practitioner = Reference(RomainNtamack)
* organization = Reference(CHUToulouse)
* code[0].coding[0].system = "http://snomed.info/sct"
* code[0].coding[0].code = #159738005
* code[0].coding[0].display = "Infirmier"
