import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestCreationComponent } from './test-creation.component';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';

describe('TestCreationComponent', () => {
  let component: TestCreationComponent;
  let fixture: ComponentFixture<TestCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TestCreationComponent,
        ReactiveFormsModule
      ],
      providers: [
        provideHttpClient(),
        provideFirebaseApp(() => initializeApp({ projectId: 'test' })),
        provideDatabase(() => getDatabase()),
        {
          provide: AuthService,
          useValue: {
            getCurrentUserWithRole: () => of({ uid: 'teacher123', role: 'Teacher' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should save test as draft', () => {
    spyOn(component, 'saveTest');
    component.saveAsDraft();
    expect(component.saveTest).toHaveBeenCalledWith(true);
  });

  it('should publish test', () => {
    spyOn(component, 'saveTest');
    component.publishTest();
    expect(component.saveTest).toHaveBeenCalledWith(false);
  });
});