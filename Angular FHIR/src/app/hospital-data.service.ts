import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface Room {
  id: string;
  name: string;
  type: string;
  staff?: Staff[];
}

export interface Building {
  id: string;
  name: string;
  rooms: Room[];
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  roomId?: string;
}

export interface Hospital {
  id: string;
  name: string;
  buildings: Building[];
  staff: Staff[];
}

@Injectable({
  providedIn: 'root'
})
export class HospitalDataService {
  private hospitals: Hospital[] = [
    {
      id: 'hop1',
      name: 'Hôpital Central',
      buildings: [
        {
          id: 'bat1',
          name: 'Bâtiment A',
          rooms: [
            { id: 'room1', name: 'Salle 101', type: 'Consultation' },
            { id: 'room2', name: 'Salle 102', type: 'Chirurgie' },
            { id: 'room3', name: 'Salle 103', type: 'Réanimation' }
          ]
        },
        {
          id: 'bat2',
          name: 'Bâtiment B',
          rooms: [
            { id: 'room4', name: 'Salle 201', type: 'Pédiatrie' },
            { id: 'room5', name: 'Salle 202', type: 'Cardiologie' }
          ]
        }
      ],
      staff: [
        { id: 'staff1', name: 'Olivier', role: 'Médecin', roomId: 'room1' },
        { id: 'staff2', name: 'Rayan', role: 'Infirmier', roomId: 'room2' },
        { id: 'staff3', name: 'Meriem', role: 'Aide-soignante', roomId: 'room3' }
      ]
    }
  ];

  constructor(private http: HttpClient) {}

  getHospitals(): Observable<Hospital[]> {
    // Dans un environnement réel, cela viendrait d'une API
    return of(this.hospitals);
  }

  getHospitalById(id: string): Observable<Hospital | undefined> {
    return of(this.hospitals.find(h => h.id === id));
  }

  assignStaffToRoom(staffId: string, roomId: string): Observable<boolean> {
    // Logique pour assigner un membre du personnel à une salle
    this.hospitals.forEach(hospital => {
      const staffMember = hospital.staff.find(s => s.id === staffId);
      if (staffMember) {
        staffMember.roomId = roomId;
      }
    });
    return of(true);
  }
}