import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroClientePage } from './registro-cliente.page';

describe('RegistroClientePage', () => {
  let component: RegistroClientePage;
  let fixture: ComponentFixture<RegistroClientePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroClientePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
