import { Component, OnInit,signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-services',
  imports: [],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit {

  myForm: FormGroup | undefined;
  formStatus = signal<string>(''); // Signal to track form status
  constructor(private formBuilder: FormBuilder) { }
  ngOnInit(): void {
    this.myForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });
    // Subscribe to form status changes using Signals
    this.myForm.statusChanges.subscribe(status => {
      this.formStatus.set(status);
    });
  }
  onSubmit(): void {
    if (this.myForm.valid) {
      console.log(this.myForm.value);
      this.formStatus.set('Form submitted successfully!');
    } else {
      this.validateAllFormFields(this.myForm);
      this.formStatus.set('Form contains errors.');
    }
  }
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      } else {
        control.markAsTouched();
      }
    });
  }

}
