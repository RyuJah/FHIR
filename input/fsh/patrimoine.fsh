// =======================
// Profil : Praticien ISIS (FHIR R5)
// =======================
Profile: ISISPractitioner
Parent: Practitioner
Id: ISISPractitioner
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
Id: ISISPractitionerRole
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
Id: ISISOrganization
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
Id: ISISLocation
Title: "Lieu d'exercice (profil ISIS)"
Description: "Localisation physique d’un établissement ou d'une unité fonctionnelle (profil ISIS - FHIR R5)."

// Définition du slicing
* identifier ^slicing.discriminator.type = #pattern
* identifier ^slicing.discriminator.path = "system"
* identifier ^slicing.rules = #open

// Slice "ufNumber"
* identifier contains ufNumber 0..1
* identifier[ufNumber].system = "http://our-organization/identifiers/uf-numero"
* identifier[ufNumber].use = #official

* name 1..1
* type 1..1
* type.text 0..1
* mode = #instance
* partOf 0..1
* managingOrganization 0..1
* address 0..1

// =======================
// Instance : CHU de Toulouse (Organization)
// =======================
Instance: CHUToulouse
InstanceOf: ISISOrganization
Title: "CHU de Toulouse"
Description: "Centre Hospitalier Universitaire de Toulouse"

* id = "7"
* meta.profile = "http://example.org/fhir/StructureDefinition/ISISOrganization"
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
// Instance : CHU de Sfax (Location)
// =======================
Instance: CHUdeSfax
InstanceOf: ISISLocation
Title: "CHU de Sfax"
Description: "Centre Hospitalier Universitaire situé à Sfax"

* id = "281"
* meta.versionId = "1"
* meta.lastUpdated = "2025-06-03T15:26:34.627+00:00"
* meta.source = "#db2qKBXmF9WTc2eJ"
* status = #active
* name = "CHU DE SFAX"
* mode = #instance
* type[0].coding[0].system = "http://terminology.hl7.org/CodeSystem/location-type"
* type[0].coding[0].code = #ho
* type[0].coding[0].display = "Hospital"
* address.use = #work
* address.line[0] = "17 rue joseph"
* address.city = "Sfax"
* address.postalCode = "35588"
* address.country = "FR"
* managingOrganization.reference = "Organization/7"
* managingOrganization.display = "CHU de Toulouse"

// =======================
// Instance : Service de Cardiologie (Location)
// =======================
Instance: ServiceCardiologie
InstanceOf: ISISLocation
Title: "Service de Cardiologie"
Description: "Unité fonctionnelle de cardiologie"

* id = "29"
* meta.versionId = "1"
* meta.lastUpdated = "2025-05-21T21:36:17.639+00:00"
* meta.source = "#d38feLRuV7lv4e2x"
* identifier[ufNumber].use = #official
* identifier[ufNumber].system = "http://our-organization/identifiers/uf-numero"
* identifier[ufNumber].value = "7795"
* name = "service de cardiologie"
* mode = #instance
* type[0].coding[0].system = "http://terminology.hl7.org/CodeSystem/location-type"
* type[0].coding[0].code = #ws
* type[0].coding[0].display = "Ward-Service"
* type[0].text = "Unité Fonctionnelle"
* partOf.reference = "Location/17"
* partOf.display = "CHU Tounes"
* managingOrganization.reference = "Organization/7"
* managingOrganization.display = "CHU de Toulouse"

// =======================
// Instance : Service de Pneumologie (Location))
// =======================
Instance: ServicePneumologie
InstanceOf: ISISLocation
Title: "Service de pneumologie"
Description: "Unité fonctionnelle de pneumologie rattachée au CHU de Sousse"

* id = "77"
* meta.versionId = "7"
* meta.lastUpdated = "2025-06-04T09:31:29.711+00:00"
* meta.source = "#rBHxTRvGzYDPWoDD"
* extension[0].url = "http://our-organization/extensions/wing"
* extension[0].valueString = "Ouest"
* identifier[ufNumber].use = #official
* identifier[ufNumber].system = "http://our-organization/identifiers/uf-numero"
* identifier[ufNumber].value = "1254"
* status = #active
* name = "service de pneumologie"
* mode = #instance
* type[0].coding[0].system = "http://terminology.hl7.org/CodeSystem/location-type"
* type[0].coding[0].code = #ws
* type[0].coding[0].display = "Ward-Service"
* type[0].text = "Unité Fonctionnelle"
* address.use = #work
* partOf.reference = "Location/14"
* partOf.display = "CHU DE SOUSSE"
* managingOrganization.reference = "Organization/7"
* managingOrganization.display = "CHU de Toulouse"


// =======================
// Instance : Dr Romain Ntamack (Practitioner)
// =======================
Instance: RomainNtamack
InstanceOf: ISISPractitioner
Title: "Dr Romain Ntamack"
Description: "Médecin enregistré dans le RPPS"

* id = "5"
* meta.profile = "http://example.org/fhir/StructureDefinition/ISISPractitioner"
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
// Instance : Affectation de Dr Ntamack (PractitionerRole)
// =======================
Instance: AffectationNtamack
InstanceOf: ISISPractitionerRole
Title: "Affectation de Dr Ntamack"
Description: "Lien entre Dr Ntamack, le CHU et son rôle professionnel"

* id = "8"
* meta.profile = "http://example.org/fhir/StructureDefinition/ISISPractitionerRole"
* identifier.system = "https://esante.gouv.fr/produits-services/repertoire-rpps"
* identifier.value = "22233445566"
* practitioner = Reference(RomainNtamack)
* organization = Reference(CHUToulouse)
* code[0].coding[0].system = "http://snomed.info/sct"
* code[0].coding[0].code = #159738005
* code[0].coding[0].display = "Infirmier"
