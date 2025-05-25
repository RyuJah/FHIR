import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FhirService } from '../../services/fhir.service';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.scss'
})
export class DoctorsComponent implements OnInit {
  practitioners: any[] = [];
  isLoading = false;
  loadingError = false;

  constructor(private fhirService: FhirService) {}

  ngOnInit(): void {
    this.loadPractitioners();
  }

  loadPractitioners() {
    this.isLoading = true;
    this.loadingError = false;
    this.fhirService.getPractitioners().subscribe({
      next: (data) => {
        this.practitioners = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des praticiens', error);
        this.loadingError = true;
        this.isLoading = false;
      }
    });
  }

  selectedPractitioner: any | null = null;

  onSelectPractitioner(practitioner: any) {
    this.selectedPractitioner = practitioner;
  }



  // Pour la gestion du carrousel
  slides = [
    {
      active: true,
      imageUrl: 'https://i.postimg.cc/nzpBhnGN/Whats-App-Image-2025-05-21-21-29-21-69e272ab.jpg',
      title: 'Unités Fonctionnelles',
      description: 'Gestion des services spécialisés'
    }
  ];
}
