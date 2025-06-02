import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError,tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FhirService {
  private baseUrl = 'https://fhir.chl.connected-health.fr/fhir';

  constructor(private http: HttpClient) { }

  /**
   * Récupère les unités fonctionnelles (UF)
   * @returns Observable<any[]> Liste des UF
   */
  getUnitesFonctionnelles(): Observable<any[]> {
    const url = `${this.baseUrl}/Location`;
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response && response.entry) {
          // On ne garde que les Locations qui ont un champ partOf (donc des UF)
          return response.entry
            .map((entry: any) => entry.resource)
            .filter((resource: any) => !!resource.partOf);
        }
        return [];
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des UF:', error);
        return of([]);
      })
    );
  }

  /**
   * Récupère les rôles des praticiens (PractitionerRole)
   * @returns Observable<any[]> Liste des PractitionerRole
   */
  getPractitionerRoles(): Observable<any[]> {
    const url = `${this.baseUrl}/PractitionerRole`;
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response && response.entry && Array.isArray(response.entry)) {
          return response.entry.map((entry: any) => entry.resource);
        }
        return [];
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des PractitionerRole:', error);
        return of([]);
      })
    );
  }

  /**
   * Récupère les praticiens (médecins)
   * @returns Observable<any[]> Liste des praticiens
   */
  getPractitioners(): Observable<any[]> {
    const url = `${this.baseUrl}/Practitioner`;

    return this.http.get<any>(url).pipe(
      map(response => {
        if (response && response.entry && Array.isArray(response.entry)) {
          return response.entry.map((entry: any) => {
            const resource = entry.resource;
            return {
              id: resource.id,
              family: resource.name?.[0]?.family || '',
              given: resource.name?.[0]?.given?.[0] || '',
              phone: resource.telecom?.find((t: any) => t.system === 'phone')?.value || '',
              email: resource.telecom?.find((t: any) => t.system === 'email')?.value || '',
              specialty: resource.qualification?.[0]?.code?.text || '',
              birthDate: resource.birthDate || '',
              address: resource.address?.[0]?.text || '',
              gender: resource.gender || '' // <-- Ajout du genre
            };
          });
        }
        return [];
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des praticiens:', error);
        return of([]);
      })
    );
  }

  /**
   * Récupère les établissements (Locations non UF)
   */
  getEtablissements(): Observable<any[]> {
    // Paramètres pour exclure les UF et récupérer uniquement les établissements principaux
    const params = new HttpParams()
      .set('_count', '100');

    return this.http.get<any>(`${this.baseUrl}/Location`, { params }).pipe(
      map((response: any) => {
        if (response && response.entry) {
          // Filtrer pour exclure les locations qui ont un partOf (UF)
          return response.entry
            .map((entry: any) => entry.resource)
            .filter((resource: any) => !resource.partOf);
        }
        return [];
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des établissements:', error);
        throw error;
      })
    );
  }

  /**
   * Récupère un établissement spécifique par son ID
   */
  getEtablissement(etablissementId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Location/${etablissementId}`).pipe(
      catchError(error => {
        console.error(`Erreur lors de la récupération de l'établissement ${etablissementId}:`, error);
        throw error;
      })
    );
  }

  /**
   * Crée un nouvel établissement
   */
  createEtablissement(etablissement: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Location`, etablissement).pipe(
      catchError(error => {
        console.error('Erreur lors de la création de l\'établissement:', error);
        throw error;
      })
    );
  }

  /**
   * Crée une nouvelle unité fonctionnelle
   */
  createUniteFonctionnelle(uniteFonctionnelle: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Location`, uniteFonctionnelle).pipe(
      catchError(error => {
        console.error('Erreur lors de la création de l\'unité fonctionnelle:', error);
        throw error;
      })
    );
  }

  /**
   * Vérifie si un numéro UF est déjà utilisé
   * @param ufNumero Le numéro UF à vérifier
   * @returns Observable<boolean> true si le numéro est unique (non utilisé), false sinon
   */
  checkUFNumeroUnique(ufNumero: string): Observable<boolean> {
    if (!ufNumero) {
      return of(true);
    }

    // Construire les paramètres pour la recherche
    const params = new HttpParams()
      .set('identifier', `http://our-organization/identifiers/uf-numero|${ufNumero}`)
      .set('_summary', 'count');

    return this.http.get<any>(`${this.baseUrl}/Location`, { params }).pipe(
      map((response: any) => {
        // Si le total est 0, cela signifie que le numéro UF n'existe pas encore
        return response && response.total === 0;
      }),
      catchError(error => {
        console.error(`Erreur lors de la vérification du numéro UF ${ufNumero}:`, error);
        // En cas d'erreur, on considère que le numéro est unique pour éviter de bloquer l'utilisateur
        return of(true);
      })
    );
  }
// deleteEtablissement(etablissementId: string): Observable<any> {
//   return this.http.delete(`${this.baseUrl}/Location/${etablissementId}`).pipe(
//     tap(() => console.log(`Établissement ${etablissementId} supprimé avec succès`)),
//     catchError(error => {
//       console.error(`Erreur lors de la suppression de l'établissement ${etablissementId}:`, error);
//       return throwError(() => new Error(`Échec de la suppression de l'établissement: ${error.message}`));
//     })
//   );
// }
 /**
   * Supprime une unité fonctionnelle par son ID
   */
  deleteUF(ufId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Location/${ufId}`).pipe(
      tap(() => console.log(`UF ${ufId} supprimée avec succès`)),
      catchError(error => {
        console.error(`Erreur lors de la suppression de l'UF ${ufId}:`, error);
        return throwError(() => new Error(`Échec de la suppression de l'UF: ${error.message}`));
      })
    );
  }
  // Dans votre FhirService, ajoutez cette méthode :

deleteEtablissement(etablissementId: string): Observable<any> {
  const url = `${this.baseUrl}/Location/${etablissementId}`;

  return this.http.delete(url).pipe(
    tap(() => {
      console.log(`Établissement ${etablissementId} supprimé avec succès du serveur FHIR`);
    }),
    catchError(error => {
      console.error(`Erreur lors de la suppression de l'établissement ${etablissementId} sur le serveur FHIR:`, error);

      // Transformer l'erreur pour avoir un message plus explicite
      let errorMessage = `Échec de la suppression de l'établissement: ${error.message}`;

      if (error.status === 404) {
        errorMessage = 'Établissement non trouvé sur le serveur';
      } else if (error.status === 403) {
        errorMessage = 'Droits insuffisants pour supprimer cet établissement';
      } else if (error.status === 409) {
        errorMessage = 'Impossible de supprimer: l\'établissement est encore référencé par d\'autres ressources';
      }

      return throwError(() => new Error(errorMessage));
    })
  );
}
getUFsByEtablissementAlternative(etablissementId: string): Observable<any[]> {
  // Utiliser une recherche plus simple et filtrer manuellement
  const params = new HttpParams()
    .set('_count', '500'); // Récupérer un nombre suffisant d'UF

  console.log("Exécution de la méthode alternative pour récupérer les UF");

  return this.http.get<any>(`${this.baseUrl}/Location`, { params }).pipe(
    map((response: any) => {
      console.log('Réponse du serveur FHIR (recherche alternative):', response);

      if (response && response.entry && Array.isArray(response.entry)) {
        const allLocations = response.entry.map((entry: any) => entry.resource);

        // Filtrer les UF qui ont l'établissement comme parent

        const filteredLocations = allLocations.filter((location: any) => {
          if (!location.partOf) return false;

          // Vérifier différents formats possibles de référence
          return (
            location.partOf.reference === `Location/${etablissementId}` ||
            location.partOf.reference === etablissementId ||
            (location.partOf.reference && location.partOf.reference.endsWith(`/${etablissementId}`))
          );
        });

        console.log(`Nombre d'UF trouvées pour l'établissement ${etablissementId}:`, filteredLocations.length);
        return filteredLocations;
      }

      console.log("Aucune donnée d'UF trouvée dans la réponse");
      return [];
    }),
    catchError(error => {
      console.error(`Erreur lors de la récupération des UF (méthode alternative): ${error.message}`, error);

      // En dernier recours, retourner un tableau vide
      return of([]);
    })
  );
}
  updateEtablissement(etablissementId: string, etablissement: any): Observable<any> {
    const url = `${this.baseUrl}/Location/${etablissementId}`;

    return this.http.put<any>(url, etablissement).pipe(
      tap(() => {
        console.log(`Établissement ${etablissementId} mis à jour avec succès`);
      }),
      catchError(error => {
        console.error(`Erreur lors de la mise à jour de l'établissement ${etablissementId}:`, error);

        let errorMessage = `Échec de la mise à jour de l'établissement: ${error.message}`;

        if (error.status === 404) {
          errorMessage = 'Établissement non trouvé sur le serveur';
        } else if (error.status === 403) {
          errorMessage = 'Droits insuffisants pour modifier cet établissement';
        } else if (error.status === 400) {
          errorMessage = 'Données invalides pour la mise à jour de l\'établissement';
        } else if (error.status === 409) {
          errorMessage = 'Conflit lors de la mise à jour (version obsolète)';
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

   /**
   * Met à jour une unité fonctionnelle existante
   */
  updateUniteFonctionnelle(ufId: string, uniteFonctionnelle: any): Observable<any> {
    const url = `${this.baseUrl}/Location/${ufId}`;

    return this.http.put<any>(url, uniteFonctionnelle).pipe(
      tap(() => {
        console.log(`Unité fonctionnelle ${ufId} mise à jour avec succès`);
      }),
      catchError(error => {
        console.error(`Erreur lors de la mise à jour de l'unité fonctionnelle ${ufId}:`, error);

        let errorMessage = `Échec de la mise à jour de l'unité fonctionnelle: ${error.message}`;

        if (error.status === 404) {
          errorMessage = 'Unité fonctionnelle non trouvée sur le serveur';
        } else if (error.status === 403) {
          errorMessage = 'Droits insuffisants pour modifier cette unité fonctionnelle';
        } else if (error.status === 400) {
          errorMessage = 'Données invalides pour la mise à jour de l\'unité fonctionnelle';
        } else if (error.status === 409) {
          errorMessage = 'Conflit lors de la mise à jour (version obsolète)';
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }






}
