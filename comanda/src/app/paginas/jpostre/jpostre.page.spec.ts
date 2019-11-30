import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JpostrePage } from './jpostre.page';

describe('JpostrePage', () => {
  let component: JpostrePage;
  let fixture: ComponentFixture<JpostrePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JpostrePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JpostrePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
