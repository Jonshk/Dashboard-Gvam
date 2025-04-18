import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsPage } from './groups.page';

describe('GroupsPage', () => {
  let component: GroupsPage;
  let fixture: ComponentFixture<GroupsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
