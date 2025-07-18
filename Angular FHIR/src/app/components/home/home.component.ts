import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FhirService } from '../../services/fhir.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
   uniteFonctionnelles: any[] = [];
  medecins: any[] = [];
  ufSelectionnee: any = null;

  constructor(private fhirService: FhirService, private router: Router) {}

  ngOnInit(): void {
    this.fhirService.getUnitesFonctionnelles().subscribe({
      next: (ufs: any[]) => {
        this.uniteFonctionnelles = ufs;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des UF', err);
      }
    });
  }

}