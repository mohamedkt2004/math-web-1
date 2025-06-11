import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditTestComponent } from './edit-test.component';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { AuthService } from '../../services/auth.service';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('EditTestComponent', () => {
  let component: EditTestComponent;
  let fixture: ComponentFixture<EditTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EditTestComponent,
        ReactiveFormsModule
      ],
      providers: [
        provideHttpClient(),
        provideFirebaseApp(() => initializeApp({ projectId: 'test' })),
        provideDatabase(() => getDatabase()),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'test_123'
              }
            }
          }
        },
        {
          provide: AuthService,
          useValue: {
            getCurrentUserWithRole: () => of({ uid: 'teacher123', role: 'Teacher' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load test data on init', () => {
    expect(component.testId).toBe('test_123');
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