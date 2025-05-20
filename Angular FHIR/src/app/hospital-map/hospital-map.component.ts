
import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { HospitalDataService, Hospital, Building, Room, Staff } from '../hospital-data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hospital-map',
  templateUrl: './hospital-map.component.html',
  styleUrls: ['./hospital-map.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class HospitalMapComponent implements OnInit {
  @Input() hospitalId: string = '';
  @ViewChild('svgContainer') svgContainer!: ElementRef;
  
  hospital: Hospital | undefined;
  selectedBuilding: Building | undefined;
  selectedRoom: Room | undefined;
  staffMembers: Staff[] = [];
  
  constructor(private hospitalService: HospitalDataService) {}
  
  ngOnInit(): void {
    console.log('HospitalMapComponent initialized with hospitalId:', this.hospitalId);
    this.loadHospitalData();
  }
  
  loadHospitalData(): void {
    console.log('Loading hospital data for:', this.hospitalId);
    this.hospitalService.getHospitalById(this.hospitalId).subscribe(hospital => {
      console.log('Hospital data received:', hospital);
      this.hospital = hospital;
      if (hospital && hospital.buildings.length > 0) {
        console.log('Selecting building:', hospital.buildings[0]);
        this.selectBuilding(hospital.buildings[0]);
      }
    });
  }
  
  selectBuilding(building: Building): void {
    this.selectedBuilding = building;
    this.selectedRoom = undefined;
    this.generateBuildingSvg();
  }
  
  selectRoom(room: Room): void {
    this.selectedRoom = room;
    // Filtrer le personnel assigné à cette salle
    if (this.hospital) {
      this.staffMembers = this.hospital.staff.filter(staff => staff.roomId === room.id);
    }
  }
  
  generateBuildingSvg(): void {
    if (!this.selectedBuilding) return;
    
    // Création dynamique du SVG pour le bâtiment sélectionné
    const rooms = this.selectedBuilding.rooms;
    const svgWidth = 800;
    const svgHeight = 600;
    const roomWidth = svgWidth / 3;
    const roomHeight = svgHeight / 2;
    
    let svgContent = `<svg viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Fond du bâtiment
    svgContent += `<rect width="${svgWidth}" height="${svgHeight}" fill="#f0f0f0" stroke="#333" stroke-width="2" />`;
    
    // Titre du bâtiment
    svgContent += `<text x="${svgWidth/2}" y="30" font-size="24" text-anchor="middle" font-weight="bold">${this.selectedBuilding.name}</text>`;
    
    // Création des salles
    rooms.forEach((room, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = col * roomWidth + 50;
      const y = row * roomHeight + 80;
      const width = roomWidth - 40;
      const height = roomHeight - 40;
      
      // Rectangle de la salle
      svgContent += `<rect id="${room.id}" x="${x}" y="${y}" width="${width}" height="${height}" 
                       fill="${room.id === this.selectedRoom?.id ? '#a3c2ff' : '#fff'}" 
                       stroke="#333" stroke-width="1" 
                       class="room-rect" 
                       onclick="window.dispatchEvent(new CustomEvent('roomClicked', {detail: '${room.id}'}))"/>`;
      
      // Nom de la salle
      svgContent += `<text x="${x + width/2}" y="${y + 25}" font-size="16" text-anchor="middle">${room.name}</text>`;
      
      // Type de salle
      svgContent += `<text x="${x + width/2}" y="${y + 50}" font-size="14" text-anchor="middle">${room.type}</text>`;
      
      // Afficher les membres du personnel assignés à cette salle
      if (this.hospital) {
        const roomStaff = this.hospital.staff.filter(staff => staff.roomId === room.id);
        roomStaff.forEach((staff, staffIndex) => {
          svgContent += `<text x="${x + width/2}" y="${y + 80 + staffIndex * 20}" font-size="12" text-anchor="middle">👤 ${staff.name} (${staff.role})</text>`;
        });
      }
    });
    
    svgContent += `</svg>`;
    
    // Insérer le SVG dans le conteneur
    if (this.svgContainer) {
      this.svgContainer.nativeElement.innerHTML = svgContent;
    }
    
    // Ajouter des écouteurs d'événements pour les éléments SVG
    window.addEventListener('roomClicked', (event: any) => {
      const roomId = event.detail;
      if (this.selectedBuilding) {
        const room = this.selectedBuilding.rooms.find(r => r.id === roomId);
        if (room) {
          this.selectRoom(room);
          this.generateBuildingSvg(); // Redessiner avec la sélection mise à jour
        }
      }
    });
  }
  
  assignStaffToRoom(staffId: string): void {
    if (this.selectedRoom) {
      this.hospitalService.assignStaffToRoom(staffId, this.selectedRoom.id).subscribe(() => {
        this.generateBuildingSvg(); // Rafraîchir l'affichage
      });
    }
  }
}