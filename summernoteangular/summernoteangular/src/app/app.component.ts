


import { Component } from '@angular/core';  
import { RouterModule } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-root',             // This component will be used in HTML via the <app-root> tag
  standalone: true,                 // This is a standalone component, no need to declare it inside any Angular module
  imports: [RouterModule, CommonModule],  // We import RouterModule for routing and CommonModule for common Angular directives like *ngIf, *ngFor
  templateUrl: './app.component.html',    // Path to this component's HTML template
  styleUrls: ['./app.component.css']      // Path to this component's CSS styles
})
export class AppComponent {
  // This is an array of tab objects, each having a label and a corresponding route (URL path)
  tabs = [
    { label: 'Medical', route: '/medical-insurance' },    // First tab with label 'Medical' and route '/medical-insurance'
    { label: 'Plan', route: '/plan-documents' }           // Second tab with label 'Plan' and route '/plan-documents'
  ];
}

