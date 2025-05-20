import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit {
  // Formulaire réactif
  myForm!: FormGroup;
  formStatus = signal<string>('');
  formSubmitted = signal<boolean>(false);
  
  constructor(private formBuilder: FormBuilder) { }
  
  ngOnInit(): void {
    // Initialisation du formulaire réactif
    this.myForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });
    
    // Suivi des changements de statut
    this.myForm.statusChanges.subscribe(status => {
      this.formStatus.set(status);
    });
  }
  
  // Soumission du formulaire réactif
  onSubmit(): void {
    this.formSubmitted.set(true);
    
    if (this.myForm.valid) {
      console.log('Formulaire réactif soumis:', this.myForm.value);
      this.formStatus.set('Formulaire soumis avec succès !');
      // Réinitialiser le formulaire après soumission
      this.myForm.reset();
      this.formSubmitted.set(false);
    } else {
      this.validateAllFormFields(this.myForm);
      this.formStatus.set('Le formulaire contient des erreurs.');
    }
  }
  
  // Soumission du formulaire basé sur template
  onTemplateSubmit(form: NgForm): void {
    if (form.valid) {
      console.log('Formulaire template soumis:', form.value);
      this.formStatus.set('Formulaire template soumis avec succès !');
      form.reset();
    } else {
      this.formStatus.set('Le formulaire template contient des erreurs.');
    }
  }
  
  // Validation des champs du formulaire
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
  
  // Helpers pour vérifier la validité des champs
  isFieldInvalid(fieldName: string): boolean {
    const control = this.myForm.get(fieldName);
    return !!(control && control.invalid && (control.touched || this.formSubmitted()));
  }
  
  getErrorMessage(fieldName: string): string {
    const control = this.myForm.get(fieldName);
    if (!control) return '';
    
    if (control.errors?.['required']) {
      return 'Ce champ est requis.';
    }
    
    if (control.errors?.['minlength']) {
      return `Ce champ doit contenir au moins ${control.errors['minlength'].requiredLength} caractères.`;
    }
    
    if (control.errors?.['email']) {
      return 'Veuillez entrer une adresse email valide.';
    }
    
    return '';
  }
}