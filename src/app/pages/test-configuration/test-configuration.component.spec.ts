import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestConfigurationComponent } from './test-configuration.component';

describe('TestConfigurationComponent', () => {
  let component: TestConfigurationComponent;
  let fixture: ComponentFixture<TestConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
