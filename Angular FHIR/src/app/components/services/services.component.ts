import { Component, OnInit, ViewChild, ElementRef, signal, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { register } from 'swiper/element/bundle';
import { HttpClient } from '@angular/common/http';
import { FhirService } from '../../services/fhir.service';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, switchMap } from 'rxjs/operators';

// Enregistrer Swiper
register();

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('swiper') swiper!: ElementRef;
  
  myForm!: FormGroup;
  etablissementForm!: FormGroup;
  formStatus = signal<string>('');
  formSubmitted = signal<boolean>(false);
  currentSlide = 0;
  totalSlides = 3;
  isEditingEtablissement = false;
  editingEtablissementId: string | null = null;
  
  // Pour la gestion du carrousel
  slides = [
    {
      active: true,
      imageUrl: 'https://i.postimg.cc/nzpBhnGN/Whats-App-Image-2025-05-21-21-29-21-69e272ab.jpg',
      title: 'Unités Fonctionnelles',
      description: 'Gestion des services spécialisés'
    },
    {
      active: false,
      imageUrl: 'https://i.postimg.cc/rsdm8H3v/Whats-App-Image-2025-05-21-21-29-21-5e24d0c5.jpg',
      title: 'Organisation des soins',
      description: 'Optimisez le parcours patient'
    },
    {
      active: false,
      imageUrl: 'https://i.postimg.cc/dQ9ndx78/Whats-App-Image-2025-05-21-21-29-21-fc451ace.jpg',
      title: 'Planification des ressources',
      description: 'Gestion efficace des espaces médicaux'
    }
  ];
  
  carouselInterval: any;
  currentCarouselIndex = 0;
  
  // Pour la liste des établissements
  etablissements: any[] = [];
  isLoading = false;
  loadingError = false;
  showAddEtablissementForm = false;
  
  // Pour gérer les pop-ups
  showPopup = false;
  popupMessage = '';
  popupType = 'success'; // 'success' ou 'error'
  
  // Nouvelles propriétés pour le panneau latéral d'établissements/UF
  etablissementsList: any[] = [];
  filteredEtablissements: any[] = [];
  searchTerm = '';
  isLoadingEtablissements = false;
  ufsByEtablissement: Map<string, any[]> = new Map();
  loadingUFs: Set<string> = new Set();
  
  constructor(
    private formBuilder: FormBuilder,
    private fhirService: FhirService
  ) { }
  
  ngOnInit(): void {
    // Initialiser le formulaire principal pour UF
    this.myForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      status: ['active', Validators.required],
      typeCode: ['ws', Validators.required], // 'ws' pour Ward-Service (UF)
      description: [''],
      ufNumero: ['', [
        Validators.required, 
        Validators.pattern('^[0-9]{4,6}$')
      ], [this.ufNumeroUniqueValidator()]],
      etablissementId: ['', Validators.required], // ID de l'établissement parent
      floor: [''],
      wing: [''],
      roomNumber: [''],
      addressUse: ['work', Validators.required],
      addressLine: [''],
    });
    
    // Initialiser le formulaire pour ajouter un nouvel établissement
    this.etablissementForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      status: ['active', Validators.required],
      typeCode: ['ho', Validators.required], // 'ho' pour Hospital
      addressUse: ['work', Validators.required],
      addressLine: [''],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['FR', Validators.required]
    });
    
    this.myForm.statusChanges.subscribe(status => {
      this.formStatus.set(status);
    });
    
    // Charger la liste des établissements pour le formulaire
    this.loadEtablissements();
    
    // Charger la liste des établissements pour le panneau latéral
    this.loadEtablissementsList();
    
    // Démarrer le carousel
    this.startCarousel();
  }
  
  // Validateur asynchrone pour vérifier l'unicité du numéro UF
  ufNumeroUniqueValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const ufNumero = control.value;
      
      if (!ufNumero) {
        return of(null);
      }
      
      return of(null).pipe(
        debounceTime(300),
        switchMap(() => {
          return this.fhirService.checkUFNumeroUnique(ufNumero).pipe(
            map(isUnique => (isUnique ? null : { 'ufNumeroExists': true })),
            catchError(() => of(null))
          );
        })
      );
    };
  }
  
  // Charger la liste des établissements pour le formulaire
  loadEtablissements() {
    this.isLoading = true;
    this.loadingError = false;
    
    this.fhirService.getEtablissements().subscribe({
      next: (data) => {
        this.etablissements = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des établissements', error);
        this.loadingError = true;
        this.isLoading = false;
      }
    });
  }
  
  // Charger la liste des établissements pour le panneau latéral
  loadEtablissementsList() {
    this.isLoadingEtablissements = true;
    
    this.fhirService.getEtablissements().subscribe({
      next: (data) => {
        // Ajouter la propriété 'expanded' pour la gestion des accordéons
        this.etablissementsList = data.map(etab => ({
          ...etab,
          expanded: false
        }));
        this.filteredEtablissements = [...this.etablissementsList];
        this.isLoadingEtablissements = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des établissements pour le panneau latéral', error);
        this.isLoadingEtablissements = false;
      }
    });
  }
  
  // Filtrer la liste des établissements selon le terme de recherche
  filterList() {
    if (!this.searchTerm.trim()) {
      this.filteredEtablissements = [...this.etablissementsList];
      return;
    }
    
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredEtablissements = this.etablissementsList.filter(etab => {
      return etab.name?.toLowerCase().includes(term) ||
             etab.address?.city?.toLowerCase().includes(term) ||
             etab.address?.postalCode?.includes(term);
    });
  }
  
  // Afficher/masquer les UF d'un établissement
  toggleEtablissement(etab: any) {
    etab.expanded = !etab.expanded;
    
    // Charger les UF si l'établissement est ouvert et qu'elles n'ont pas encore été chargées
    if (etab.expanded && !this.ufsByEtablissement.has(etab.id)) {
      this.loadUFsForEtablissement(etab.id);
    }
  }
  
  // Charger les UF liées à un établissement
  loadUFsForEtablissement(etablissementId: string) {
    this.loadingUFs.add(etablissementId);
    
    this.fhirService.getUFsByEtablissementAlternative(etablissementId).subscribe({
      next: (data) => {
        this.ufsByEtablissement.set(etablissementId, data);
        this.loadingUFs.delete(etablissementId);
      },
      error: (error) => {
        console.error(`Erreur lors du chargement des UF pour l'établissement ${etablissementId}`, error);
        this.ufsByEtablissement.set(etablissementId, []);
        this.loadingUFs.delete(etablissementId);
      }
    });
  }
  
  // Vérifier si les UF d'un établissement sont en cours de chargement
  isLoadingUFs(etablissementId: string): boolean {
    return this.loadingUFs.has(etablissementId);
  }
  
  // Récupérer les UF pour un établissement donné
  getUFsForEtablissement(etablissementId: string): any[] {
    return this.ufsByEtablissement.get(etablissementId) || [];
  }
  
  // Formatter l'adresse d'un établissement
  getEtablissementAddress(etab: any): string {
    if (!etab.address) return 'Adresse non spécifiée';
    
    const parts = [];
    if (etab.address.line && etab.address.line.length > 0) {
      parts.push(etab.address.line[0]);
    }
    if (etab.address.postalCode) {
      parts.push(etab.address.postalCode);
    }
    if (etab.address.city) {
      parts.push(etab.address.city);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'Adresse non spécifiée';
  }
  
  // Récupérer le numéro UF
  getUFNumero(uf: any): string {
    if (!uf.identifier || !uf.identifier.length) return 'N° non spécifié';
    
    const ufIdentifier = uf.identifier.find((id: any) => 
      id.system === 'http://our-organization/identifiers/uf-numero'
    );
    
    return ufIdentifier ? ufIdentifier.value : 'N° non spécifié';
  }
  
  // Récupérer la localisation d'une UF
  getUFLocation(uf: any): string {
    // Construire à partir des détails disponibles (étage, aile, numéro de salle, etc.)
    const parts = [];
    
    // Exemple : si vous avez des extensions personnalisées pour ces informations
    const floor = this.getExtensionValue(uf, 'floor');
    const wing = this.getExtensionValue(uf, 'wing');
    const roomNumber = this.getExtensionValue(uf, 'roomNumber');
    
    if (floor) parts.push(`Étage ${floor}`);
    if (wing) parts.push(`Aile ${wing}`);
    if (roomNumber) parts.push(`Salle ${roomNumber}`);
    
    return parts.length > 0 ? parts.join(', ') : '';
  }
  
  // Utilitaire pour récupérer la valeur d'une extension FHIR
  getExtensionValue(resource: any, urlSuffix: string): string | null {
    if (!resource.extension || !resource.extension.length) return null;
    
    const extension = resource.extension.find((ext: any) => 
      ext.url.endsWith(urlSuffix)
    );
    
    return extension ? extension.valueString : null;
  }
  
  // Sélectionner un établissement pour le formulaire principal
  selectEtablissement(etab: any) {
    this.myForm.get('etablissementId')?.setValue(etab.id);
    this.showPopupMessage(`Établissement "${etab.name}" sélectionné pour la nouvelle UF`);
  }
  
  // Éditer un établissement
   editEtablissement(etab: any) {
    // Remplir le formulaire d'établissement avec les données existantes
    this.etablissementForm.patchValue({
      name: etab.name,
      status: etab.status || 'active',
      typeCode: etab.type?.[0]?.coding?.[0]?.code || 'ho',
      addressUse: etab.address?.use || 'work',
      addressLine: etab.address?.line?.[0] || '',
      city: etab.address?.city || '',
      postalCode: etab.address?.postalCode || '',
      country: etab.address?.country || 'FR'
    });
    
    // Passer en mode édition
    this.isEditingEtablissement = true;
    this.editingEtablissementId = etab.id;
    
    // Afficher le formulaire d'établissement
    this.showAddEtablissementForm = true;
    
    // Optionnel : faire défiler pour afficher le formulaire
    setTimeout(() => {
      const formElement = document.querySelector('.add-etablissement-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Méthode pour annuler l'édition
  cancelEditEtablissement() {
    this.isEditingEtablissement = false;
    this.editingEtablissementId = null;
    this.showAddEtablissementForm = false;
    this.etablissementForm.reset();
  }
  
  // Voir les détails d'une UF
  viewUFDetails(uf: any) {
    // Implémenter la logique pour afficher les détails
    console.log('Voir détails UF', uf);
    // Par exemple, naviguer vers une page de détails ou ouvrir une boîte de dialogue
    this.showPopupMessage(`Détails de l'UF "${uf.name}" - Fonctionnalité à venir`, 'info');
  }
  
  // Éditer une UF
  editUF(uf: any) {
    // Remplir le formulaire principal avec les données de l'UF
    const ufNumero = this.getUFNumero(uf);
    
    this.myForm.patchValue({
      name: uf.name,
      status: uf.status || 'active',
      typeCode: uf.type?.[0]?.coding?.[0]?.code || 'ws',
      description: uf.description || '',
      ufNumero: ufNumero !== 'N° non spécifié' ? ufNumero : '',
      etablissementId: uf.partOf?.reference.replace('Location/', '') || '',
      addressUse: uf.address?.use || 'work',
      addressLine: uf.address?.line?.[0] || ''
    });
    
    // Faire défiler la page jusqu'au formulaire principal
    // Implementation à adapter selon votre interface
    
    this.showPopupMessage(`UF "${uf.name}" chargée pour modification`);
  }
  
  // Créer une nouvelle UF pour un établissement spécifique
  createNewUF(etab: any) {
    // Réinitialiser le formulaire principal
    this.myForm.reset({
      status: 'active',
      typeCode: 'ws',
      addressUse: 'work',
      country: 'FR'
    });
    
    // Remplir le formulaire principal avec l'ID de l'établissement
    this.myForm.get('etablissementId')?.setValue(etab.id);
    
    this.showPopupMessage(`Création d'une nouvelle UF pour "${etab.name}"`);
  }
  
  // Actualiser la liste
  refreshList() {
    // Recharger les établissements
    this.loadEtablissementsList();
    
    // Effacer le cache des UF pour forcer le rechargement
    this.ufsByEtablissement.clear();
    
    this.showPopupMessage('Liste actualisée');
  }
  
  ngAfterViewInit() {
    const swiperEl = this.swiper.nativeElement;
    swiperEl.addEventListener('slidechange', (event: any) => {
      console.log('Slide changed:', event.detail);
      this.currentSlide = event.detail[0].activeIndex;
    });
  }
  
  startCarousel() {
    this.carouselInterval = setInterval(() => {
      this.nextCarouselSlide();
    }, 5000);
  }
  
  nextCarouselSlide() {
    // Désactiver la slide actuelle
    this.slides[this.currentCarouselIndex].active = false;
    
    // Passer à la slide suivante
    this.currentCarouselIndex = (this.currentCarouselIndex + 1) % this.slides.length;
    
    // Activer la nouvelle slide
    this.slides[this.currentCarouselIndex].active = true;
  }
  
  previousSlide() {
    const swiperEl = this.swiper.nativeElement;
    swiperEl.swiper.slidePrev();
    setTimeout(() => { this.currentSlide = swiperEl.swiper.activeIndex; }, 100);
  }
  
  nextSlide() {
    if (this.validateCurrentSlide()) {
      const swiperEl = this.swiper.nativeElement;
      swiperEl.swiper.slideNext();
      setTimeout(() => { this.currentSlide = swiperEl.swiper.activeIndex; }, 100);
    } else {
      this.markCurrentSlideAsTouched();
    }
  }
  
  validateCurrentSlide(): boolean {
    switch (this.currentSlide) {
      case 0:
        return this.validateSlideFields(['name', 'status', 'typeCode', 'etablissementId', 'ufNumero']);
      case 1:
        return this.validateSlideFields(['addressUse']);
      case 2:
        return this.validateSlideFields(['city', 'postalCode', 'country']);
      default:
        return true;
    }
  }
  
  validateSlideFields(fields: string[]): boolean {
    return fields.every(field => {
      const control = this.myForm.get(field);
      if (!control) return true;
      
      if (control.hasValidator(Validators.required) && !control.valid) {
        return false;
      }
      
      if (control.invalid && !control.hasValidator(Validators.required)) {
        return !control.value || control.value === '';
      }
      
      return true;
    });
  }
  
  markCurrentSlideAsTouched() {
    switch (this.currentSlide) {
      case 0:
        this.markFieldsAsTouched(['name', 'status', 'typeCode', 'etablissementId', 'ufNumero']);
        break;
      case 1:
        this.markFieldsAsTouched(['addressUse']);
        break;
      case 2:
        this.markFieldsAsTouched(['city', 'postalCode', 'country']);
        break;
    }
  }
  
  markFieldsAsTouched(fields: string[]) {
    fields.forEach(field => {
      const control = this.myForm.get(field);
      if (control) {
        control.markAsTouched();
      }
    });
  }
  
 toggleAddEtablissementForm() {
  if (this.showAddEtablissementForm && this.isEditingEtablissement) {
    // Si on est en mode édition et qu'on ferme, annuler l'édition
    this.isEditingEtablissement = false;
    this.editingEtablissementId = null;
    this.showAddEtablissementForm = false;
  } else {
    // Comportement normal (ouverture/fermeture)
    this.showAddEtablissementForm = !this.showAddEtablissementForm;
  }
  
  // TOUJOURS réinitialiser le formulaire complètement
  this.etablissementForm.reset({
    name: '',
    status: 'active',
    typeCode: 'ho',
    addressUse: 'work',
    addressLine: '',
    city: '',
    postalCode: '',
    country: 'FR'
  });
  
  // Réinitialiser les états d'édition
  this.isEditingEtablissement = false;
  this.editingEtablissementId = null;
  
  // Nettoyer complètement les états de validation
  this.etablissementForm.markAsUntouched();
  this.etablissementForm.markAsPristine();
  Object.keys(this.etablissementForm.controls).forEach(key => {
    this.etablissementForm.get(key)?.setErrors(null);
  });
}
  
  // Affiche un popup avec un message donné
  showPopupMessage(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.popupMessage = message;
    this.popupType = type === 'info' ? 'success' : type; // 'info' utilise le style de 'success'
    this.showPopup = true;
    
    // Ferme automatiquement le popup après 3 secondes
    setTimeout(() => {
      this.showPopup = false;
    }, 3000);
  }
 // Remplacez votre méthode deleteUF() vide par cette implémentation complète :

// Remplacez votre méthode deleteUF() vide par cette implémentation complète :

deleteUF(uf: any): void {
  // Confirmation avant suppression
  if (confirm(`Êtes-vous sûr de vouloir supprimer l'unité fonctionnelle "${uf.name}" ?`)) {
    console.log(`Suppression de l'UF ${uf.id} - ${uf.name}`);
    
    // Appel au service FHIR pour supprimer l'UF
    this.fhirService.deleteUF(uf.id).subscribe({
      next: (response) => {
        console.log(`UF ${uf.id} supprimée avec succès`, response);
        
        // Succès : afficher un message de confirmation
        this.showPopupMessage(`Unité fonctionnelle "${uf.name}" supprimée avec succès`, 'success');
        
        // Actualiser la liste des UF pour l'établissement concerné
        const etablissementId = this.extractEtablissementId(uf);
        if (etablissementId) {
          this.refreshUFsForEtablissement(etablissementId);
        }
      },
      error: (error) => {
        // Erreur : afficher un message d'erreur détaillé
        console.error(`Erreur lors de la suppression de l'UF ${uf.id}:`, error);
        
        let errorMessage = 'Erreur lors de la suppression de l\'unité fonctionnelle';
        if (error.status === 404) {
          errorMessage = 'Unité fonctionnelle non trouvée';
        } else if (error.status === 403) {
          errorMessage = 'Vous n\'avez pas les droits pour supprimer cette unité fonctionnelle';
        } else if (error.message) {
          errorMessage = `Erreur: ${error.message}`;
        }
        
        this.showPopupMessage(errorMessage, 'error');
      }
    });
  }
}

// Méthode auxiliaire pour extraire l'ID de l'établissement parent
private extractEtablissementId(uf: any): string | null {
  if (uf.partOf?.reference) {
    return uf.partOf.reference.replace('Location/', '');
  }
  return null;
}

// Méthode pour actualiser les UF d'un établissement spécifique
private refreshUFsForEtablissement(etablissementId: string): void {
  console.log(`Actualisation des UF pour l'établissement ${etablissementId}`);
  
  // Recharger les UF pour cet établissement en utilisant la méthode existante
  this.loadUFsForEtablissement(etablissementId);
}
// Méthode pour supprimer un établissement
deleteEtablissement(etab: any): void {
  // Vérifier si l'établissement contient des UF
  const ufsCount = this.getUFsForEtablissement(etab.id).length;
  
  if (ufsCount > 0) {
    // Si l'établissement contient des UF, empêcher la suppression
    this.showPopupMessage(
      `Impossible de supprimer l'établissement "${etab.name}". Il contient ${ufsCount} unité(s) fonctionnelle(s). Veuillez d'abord supprimer toutes les UF.`, 
      'error'
    );
    return;
  }
  
  // Confirmation avant suppression
  if (confirm(`Êtes-vous sûr de vouloir supprimer l'établissement "${etab.name}" ?`)) {
    console.log(`Suppression de l'établissement ${etab.id} - ${etab.name}`);
    
    // Appel au service FHIR pour supprimer l'établissement
    this.fhirService.deleteEtablissement(etab.id).subscribe({
      next: (response) => {
        console.log(`Établissement ${etab.id} supprimé avec succès`, response);
        
        // Succès : afficher un message de confirmation
        this.showPopupMessage(`Établissement "${etab.name}" supprimé avec succès`, 'success');
        
        // Actualiser les listes d'établissements
        this.refreshEtablissementsList();
      },
      error: (error) => {
        // Erreur : afficher un message d'erreur détaillé
        console.error(`Erreur lors de la suppression de l'établissement ${etab.id}:`, error);
        
        let errorMessage = 'Erreur lors de la suppression de l\'établissement';
        if (error.status === 404) {
          errorMessage = 'Établissement non trouvé';
        } else if (error.status === 403) {
          errorMessage = 'Vous n\'avez pas les droits pour supprimer cet établissement';
        } else if (error.status === 409) {
          errorMessage = 'Impossible de supprimer: l\'établissement est encore référencé';
        } else if (error.message) {
          errorMessage = `Erreur: ${error.message}`;
        }
        
        this.showPopupMessage(errorMessage, 'error');
      }
    });
  }
}

// Méthode pour vérifier si un établissement peut être supprimé
canDeleteEtablissement(etab: any): boolean {
  const ufsCount = this.getUFsForEtablissement(etab.id).length;
  return ufsCount === 0;
}

// Méthode pour obtenir le message tooltip pour le bouton de suppression
getDeleteEtablissementTooltip(etab: any): string {
  const ufsCount = this.getUFsForEtablissement(etab.id).length;
  
  if (ufsCount > 0) {
    return `Impossible de supprimer: contient ${ufsCount} unité(s) fonctionnelle(s)`;
  }
  
  return 'Supprimer cet établissement';
}

// Méthode pour actualiser toutes les listes d'établissements
private refreshEtablissementsList(): void {
  console.log('Actualisation des listes d\'établissements');
  
  // Recharger les établissements pour le formulaire
  this.loadEtablissements();
  
  // Recharger les établissements pour le panneau latéral
  this.loadEtablissementsList();
}  



  onAddEtablissement() {
    if (this.etablissementForm.valid) {
      // Création de la structure FHIR Location pour l'établissement
      const etablissement = {
        resourceType: 'Location',
        id: this.editingEtablissementId,
        status: this.etablissementForm.get('status')?.value,
        name: this.etablissementForm.get('name')?.value,
        mode: 'instance',
        type: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/location-type',
                code: this.etablissementForm.get('typeCode')?.value,
                display: this.getTypeDisplay(this.etablissementForm.get('typeCode')?.value)
              }
            ]
          }
        ],
        address: {
          use: this.etablissementForm.get('addressUse')?.value,
          line: [this.etablissementForm.get('addressLine')?.value],
          city: this.etablissementForm.get('city')?.value,
          postalCode: this.etablissementForm.get('postalCode')?.value,
          country: this.etablissementForm.get('country')?.value
          },
  managingOrganization: {
  reference: 'Organization/7',
  display: 'CHU de Toulouse'
}
    };
      
     // Logique de sauvegarde (POST/PUT)
    if (this.isEditingEtablissement && this.editingEtablissementId) {
      // PUT - Mode édition
      this.fhirService.updateEtablissement(this.editingEtablissementId, etablissement).subscribe({
        next: (response) => {
          console.log('Établissement mis à jour avec succès:', response);
          this.formStatus.set('Établissement mis à jour avec succès !');
          this.showPopupMessage('Établissement mis à jour avec succès !');
          
          // Mettre à jour les listes locales
          this.updateLocalEtablissementLists(response);
          
          // Fermer le formulaire
          this.toggleAddEtablissementForm();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de l\'établissement:', error);
          this.formStatus.set('Erreur lors de la mise à jour de l\'établissement. Veuillez réessayer.');
          this.showPopupMessage('Erreur lors de la mise à jour de l\'établissement. Veuillez réessayer.', 'error');
        }
      });
    } else {
      // POST - Mode création
      this.fhirService.createEtablissement(etablissement).subscribe({
        next: (response) => {
          console.log('Établissement créé avec succès:', response);
          this.formStatus.set('Établissement créé avec succès !');
          this.showPopupMessage('Établissement créé avec succès !');
          
          // Ajouter à la liste locale du formulaire
          if (response && response.id) {
            this.etablissements.push(response);
            
            // Ajouter à la liste du panneau latéral avec la propriété expanded
            const newEtab = {
              ...response,
              expanded: false
            };
            this.etablissementsList.push(newEtab);
            this.filteredEtablissements = [...this.etablissementsList];
            
            // Sélectionner automatiquement le nouvel établissement
            this.myForm.get('etablissementId')?.setValue(response.id);
          }
          
          // Fermer le formulaire
          this.toggleAddEtablissementForm();
        },
        error: (error) => {
          console.error('Erreur lors de la création de l\'établissement', error);
          this.formStatus.set('Erreur lors de la création de l\'établissement. Veuillez réessayer.');
          this.showPopupMessage('Erreur lors de la création de l\'établissement. Veuillez réessayer.', 'error');
        }
      });
    }
  } else {
    this.validateAllFormFields(this.etablissementForm);
  }
}

// Méthode utilitaire pour mettre à jour les listes locales lors de l'édition
private updateLocalEtablissementLists(updatedEtablissement: any) {
  // Mettre à jour dans la liste du select
  const indexInEtablissements = this.etablissements.findIndex(etab => etab.id === updatedEtablissement.id);
  if (indexInEtablissements !== -1) {
    this.etablissements[indexInEtablissements] = updatedEtablissement;
  }
  
  // Mettre à jour dans la liste du panneau latéral
  const indexInEtablissementsList = this.etablissementsList.findIndex(etab => etab.id === updatedEtablissement.id);
  if (indexInEtablissementsList !== -1) {
    this.etablissementsList[indexInEtablissementsList] = {
      ...updatedEtablissement,
      expanded: this.etablissementsList[indexInEtablissementsList].expanded
    };
    this.filteredEtablissements = [...this.etablissementsList];
  }
}
  
  onSubmit(): void {
    this.formSubmitted.set(true);
    
    if (this.myForm.valid) {
      const etablissementId = this.myForm.get('etablissementId')?.value;
      const etablissement = this.etablissements.find(e => e.id === etablissementId);
      const ufNumero = this.myForm.get('ufNumero')?.value;
      
      // Construire la description complète avec étage, aile, numéro de salle
      let detailedLocation = '';
      const floor = this.myForm.get('floor')?.value;
      const wing = this.myForm.get('wing')?.value;
      const roomNumber = this.myForm.get('roomNumber')?.value;
      
      if (floor) detailedLocation += `Étage ${floor}, `;
      if (wing) detailedLocation += `Aile ${wing}, `;
      if (roomNumber) detailedLocation += `Salle ${roomNumber}, `;
      
      if (detailedLocation.endsWith(', ')) {
        detailedLocation = detailedLocation.slice(0, -2);
      }
      
      // Création de la structure FHIR Location pour l'UF
      const uniteFonctionnelle = {
        resourceType: 'Location',
        name: this.myForm.get('name')?.value,
        description: this.myForm.get('description')?.value,
        mode: 'instance',
        identifier: [
          {
            system: 'http://our-organization/identifiers/uf-numero',
            value: ufNumero,
            use: 'official'
          }
        ],
        type: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/location-type',
                code: this.myForm.get('typeCode')?.value,
                display: this.getTypeDisplay(this.myForm.get('typeCode')?.value)
              }
            ],
            text: "Unité Fonctionnelle"
          }
        ],
        physicalType: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/location-physical-type',
              code: 'wa', // Ward
              display: 'Ward'
            }
          ]
        },
        
        partOf: {
          reference: `Location/${etablissementId}`,
          display: etablissement ? etablissement.name : 'Établissement référencé'
        }
      };
      
  
      
      console.log('FHIR Unité Fonctionnelle:', uniteFonctionnelle);
      
      // Afficher un message de chargement
      this.formStatus.set('Création en cours...');
      
      this.fhirService.createUniteFonctionnelle(uniteFonctionnelle).subscribe({
        next: (response) => {
          console.log('UF créée avec succès:', response);
          this.formStatus.set('Unité Fonctionnelle créée avec succès !');
          this.showPopupMessage('Unité Fonctionnelle créée avec succès !');
          
          // Ajouter l'UF à la liste d'UF de l'établissement si elle est déjà chargée
          if (this.ufsByEtablissement.has(etablissementId)) {
            const ufs = this.ufsByEtablissement.get(etablissementId) || [];
            ufs.push(response);
            this.ufsByEtablissement.set(etablissementId, ufs);
          }
          
          // Réinitialiser le formulaire
          this.myForm.reset({
            status: 'active',
            typeCode: 'ws',
            addressUse: 'work',
            country: 'FR'
          });
          
          this.formSubmitted.set(false);
          
          // Revenir à la première slide après un délai
          setTimeout(() => {
            const swiperEl = this.swiper.nativeElement;
            if (swiperEl && swiperEl.swiper) {
              swiperEl.swiper.slideTo(0);
              this.currentSlide = 0;
            }
          }, 1500);
        },
        error: (error) => {
          console.error('Erreur lors de la création de l\'UF', error);
          this.formStatus.set('Erreur lors de la création de l\'UF. Veuillez réessayer.');
          this.showPopupMessage('Erreur lors de la création de l\'UF. Veuillez réessayer.', 'error');
          this.formSubmitted.set(false);
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.validateAllFormFields(this.myForm);
      this.formStatus.set('Le formulaire contient des erreurs. Veuillez les corriger.');
    }
  }
  
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      } else if (control) {
        control.markAsTouched();
      }
    });
  }
  
  isFieldInvalid(fieldName: string, form: FormGroup = this.myForm): boolean {
    const control = form.get(fieldName);
    return !!(control && control.invalid && (control.touched || this.formSubmitted()));
  }
  
  getErrorMessage(fieldName: string, form: FormGroup = this.myForm): string {
    const control = form.get(fieldName);
    if (!control) return '';
    
    if (control.errors?.['required']) {
      return 'Ce champ est requis.';
    }
    
    if (control.errors?.['minlength']) {
      return `Ce champ doit contenir au moins ${control.errors['minlength'].requiredLength} caractères.`;
    }
    
    if (control.errors?.['pattern']) {
      if (fieldName === 'ufNumero') {
        return 'Le numéro UF doit être composé de 4 à 6 chiffres uniquement.';
      }
      return 'Format invalide.';
    }
    
    if (control.errors?.['ufNumeroExists']) {
      return 'Ce numéro UF est déjà utilisé.';
    }
    
    return '';
  }
  
  getTypeDisplay(code: string): string {
    const typeMap: {[key: string]: string} = {
      'ws': 'Ward-Service',
      'ho': 'Hospital',
      'bu': 'Building',
      'ro': 'Room',
      'bd': 'Bed',
      'HOSP': 'Hospital',
      'PHARM': 'Pharmacy',
      'CSC': 'Community Service Center',
      'OF': 'Outpatient Facility'
    };
    
    return typeMap[code] || '';
  }
  
  getTypeLabel(code: string): string {
    const typeMap: {[key: string]: string} = {
      'ws': 'Unité Fonctionnelle',
      'ho': 'Hôpital',
      'bu': 'Bâtiment',
      'HOSP': 'Hôpital',
      'PHARM': 'Pharmacie',
      'CSC': 'Centre de service communautaire',
      'OF': 'Établissement ambulatoire'
    };
    
    return typeMap[code] || '';
  }
  
  getStatusLabel(status: string): string {
    const statusMap: {[key: string]: string} = {
      'active': 'Actif',
      'suspended': 'Suspendu',
      'inactive': 'Inactif'
    };
    
    return statusMap[status] || '';
  }
  
  getAddressUseLabel(use: string): string {
    const useMap: {[key: string]: string} = {
      'home': 'Domicile',
      'work': 'Travail',
      'temp': 'Temporaire',
      'old': 'Ancienne'
    };
    
    return useMap[use] || '';
  }
  
  getCountryLabel(code: string): string {
    const countryMap: {[key: string]: string} = {
      'FR': 'France',
      'US': 'États-Unis',
      'GB': 'Royaume-Uni',
      'DE': 'Allemagne',
      'ES': 'Espagne'
    };
    
    return countryMap[code] || '';
  }
  
  // Fonction pour déterminer si un établissement a été trouvé
  getEtablissementName(id: string): string {
    const etablissement = this.etablissements.find(e => e.id === id);
    return etablissement ? etablissement.name : 'Non trouvé';
  }
  
  ngOnDestroy() {
    // Nettoyer l'intervalle du carrousel
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }}