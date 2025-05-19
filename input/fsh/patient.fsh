// =======================
// Extension: NationalityFR
// =======================
Extension: NationalityFR
Id: nationality-fr
Title: "Fixed Nationality (France)"
Description: "Extension fixing the patient nationality to France using ISO 3166-1 alpha-2 code 'FR'."

* value[x] only CodeableConcept
* valueCodeableConcept 1..1
* valueCodeableConcept.coding 1..1
* valueCodeableConcept.coding.system 1..1
* valueCodeableConcept.coding.system = "urn:iso:std:iso:3166"
* valueCodeableConcept.coding.code 1..1
* valueCodeableConcept.coding.code = #FR
* valueCodeableConcept.coding.display 1..1
* valueCodeableConcept.coding.display = "France"
* valueCodeableConcept.text = "France"



// =======================
// Profile: MyPatientProfile
// =======================
Profile: MyPatientProfile
Parent: Patient
Id: my-patient-profile
Title: "My Patient Profile"
Description: "Patient profile requiring full name, birth date, and fixed nationality (France)."

// Nom obligatoire
* name 1..1
* name.family 1..1
* name.given 1..1

// Date de naissance obligatoire
* birthDate 1..1

// Utilisation de l’extension personnalisée obligatoire
* extension contains NationalityFR named nationality 1..1

// =======================
// Instance: PatientExample
// =======================
Instance: PatientExample
InstanceOf: MyPatientProfile
Title: "Patient Example"
Description: "Example patient conforming to MyPatientProfile"

* text.status = #generated
* text.div = "<div xmlns=\"http://www.w3.org/1999/xhtml\">
  <p><b>Nom :</b> Rayan Oudbib</p>
  <p><b>Date de naissance :</b> 15 juillet 1998</p>
  <p><b>Nationalité :</b> France 🇫🇷</p>
  <p><b>Profil appliqué :</b> MyPatientProfile</p>
</div>"


* name[0].use = #official
* name[0].family = "Oudbib"
* name[0].given[0] = "Rayan"
* birthDate = "1998-07-15"

* telecom[0].system = #phone
* telecom[0].use = #mobile
* telecom[0].value = "+33612345678"

* address[0].line[0] = "42 rue de l'Innovation"
* address[0].city = "Toulouse"
* address[0].postalCode = "31000"
* address[0].country = "France"

* communication[0].language.coding[0].system = "urn:ietf:bcp:47"
* communication[0].language.coding[0].code = #fr
* communication[0].preferred = true

* contact[0].name.given[0] = "Claire"
* contact[0].name.family = "Dupont"
* contact[0].telecom[0].system = #phone
* contact[0].telecom[0].value = "+33698765432"
* contact[0].relationship[0].coding[0].code = #SPO
* contact[0].relationship[0].coding[0].system = "http://terminology.hl7.org/CodeSystem/v2-0131"
* contact[0].relationship[0].coding[0].display = "Spouse"


* extension[nationality].url = "http://example.org/StructureDefinition/nationality-fr"
* extension[nationality].valueCodeableConcept.coding.system = "urn:iso:std:iso:3166"
* extension[nationality].valueCodeableConcept.coding.code = #FR
* extension[nationality].valueCodeableConcept.coding.display = "France"
* extension[nationality].valueCodeableConcept.text = "France"

