import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniGameConfigComponent } from './mini-game-config.component';

describe('MiniGameConfigComponent', () => {
  let component: MiniGameConfigComponent;
  let fixture: ComponentFixture<MiniGameConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniGameConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiniGameConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
