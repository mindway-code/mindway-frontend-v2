import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkProfessionalComponent } from './link-professional.component';

describe('LinkProfessionalComponent', () => {
  let component: LinkProfessionalComponent;
  let fixture: ComponentFixture<LinkProfessionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkProfessionalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkProfessionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
