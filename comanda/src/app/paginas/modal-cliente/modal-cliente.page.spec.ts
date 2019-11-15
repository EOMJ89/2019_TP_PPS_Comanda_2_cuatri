import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalClientePage } from './modal-cliente.page';

describe('ModalClientePage', () => {
  let component: ModalClientePage;
  let fixture: ComponentFixture<ModalClientePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalClientePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
