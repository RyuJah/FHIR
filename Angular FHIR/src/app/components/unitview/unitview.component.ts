import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FhirService } from '../../services/fhir.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-unitview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unitview.component.html',
  styleUrls: ['./unitview.component.scss']
})
export class UnitviewComponent implements OnInit {
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

  afficherMedecins(uf: any) {
    this.ufSelectionnee = uf;
    this.medecins = [];
    this.fhirService.getPractitionerRoles().subscribe({
      next: (roles: any[]) => {
        const locationRef = `Location/${uf.id}`;
        const rolesForUf = roles.filter(r =>
          Array.isArray(r.location) &&
          r.location.some((loc: any) => loc.reference === locationRef)
        );
        console.log(rolesForUf);
        this.fhirService.getPractitioners().subscribe({
          next: (praticiens: any[]) => {
            this.medecins = rolesForUf.map(role => {
              const practitionerId = role.practitioner.reference.split('/')[1];
              const praticien = praticiens.find(p => p.id === practitionerId);

              if (praticien) {
                console.log(praticien.family, praticien.given);
                return {
                  id: praticien.id,
                  family: praticien.family,
                  given: praticien.given,
                  phone: praticien.phone,
                  email: praticien.email
                };
              } else {
                return { name: 'Nom inconnu' };
              }
            });
          },
          error: () => { this.medecins = []; }
        });
      },
      error: () => { this.medecins = []; }
    });
  }

  voirDetailDoctor(medecin: any) {
    console.log(medecin);
    if (medecin.id) {
      this.router.navigate(['/doctors']); /* Il faut que l'on rajoute la route pour arriver directement vers le médecin selectionné, medecin.id]);*/
    } else {
      console.warn('ID du médecin manquant');
    }
  }
}
