import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalInsuranceComponent } from './medical-insurance.component';

describe('MedicalInsuranceComponent', () => {
  let component: MedicalInsuranceComponent;
  let fixture: ComponentFixture<MedicalInsuranceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalInsuranceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalInsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
