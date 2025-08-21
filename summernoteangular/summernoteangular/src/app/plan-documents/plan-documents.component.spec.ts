import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanDocumentsComponent } from './plan-documents.component';

describe('PlanDocumentsComponent', () => {
  let component: PlanDocumentsComponent;
  let fixture: ComponentFixture<PlanDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanDocumentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
