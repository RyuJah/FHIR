import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importez RouterLink seulement si vous avez des éléments routerLink dans votre template

@Component({
  selector: 'app-home',
  standalone: true,
  // Incluez RouterLink uniquement si vous l'utilisez dans le template
  imports: [CommonModule], 
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
}