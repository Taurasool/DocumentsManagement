
import { MedicalInsuranceComponent } from './medical-insurance/medical-insurance.component';  
import { Routes } from '@angular/router'; 
import { PlanDocumentsComponent } from './plan-documents/plan-documents.component';

// This is the Angular routing configuration array where we define our application routes
export const routes: Routes = [
  { path: '', redirectTo: 'medical-insurance', pathMatch: 'full' },  
  // When the URL path is empty (i.e., root URL), automatically redirect to 'medical-insurance' route
  // 'pathMatch: full' means that the entire URL path must match '' exactly to trigger this redirect

  { path: 'medical-insurance', component: MedicalInsuranceComponent },  
  // When the URL path is '/medical-insurance', display the MedicalInsuranceComponent

  { path: 'plan-documents', component: PlanDocumentsComponent }  
  // When the URL path is '/plan-documents', display the PlanDocumentsComponent
];
