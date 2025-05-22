import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError,tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'  // Cette ligne rend le service disponible partout dans l'application
})
export class FhirService {
  private baseUrl = 'https://fhir.chl.connected-health.fr/fhir';

  constructor(private http: HttpClient) { }

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




}