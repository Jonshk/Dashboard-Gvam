import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicesPage } from './devices.page';

describe('DevicesPage', () => {
  let component: DevicesPage;
  let fixture: ComponentFixture<DevicesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevicesPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevicesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
