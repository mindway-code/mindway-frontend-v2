import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkSchoolComponent } from './link-school.component';

describe('LinkSchoolComponent', () => {
  let component: LinkSchoolComponent;
  let fixture: ComponentFixture<LinkSchoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkSchoolComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkSchoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
