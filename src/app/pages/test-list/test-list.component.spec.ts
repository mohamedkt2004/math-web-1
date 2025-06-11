import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestListComponent } from './test-list.component';
import { AuthService } from '../../services/auth.service';
import { Database } from '@angular/fire/database';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('TestListComponent', () => {
  let component: TestListComponent;
  let fixture: ComponentFixture<TestListComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserWithRole']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TestListComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Database, useValue: {} },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestListComponent);
    component = fixture.componentInstance;
    authServiceMock = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerMock = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authServiceMock.getCurrentUserWithRole.and.returnValue(of({ uid: 'teacher1' }));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to edit page on editTest', () => {
    component.editTest('test1');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/edit-test', 'test1']);
  });

  it('should publish test if status is DRAFT', () => {
    spyOn(window, 'alert');
    const test = { id: 'test1', status: 'DRAFT', teacherId: 'teacher1' };
    component.publishTest(test as any);
    // Ajouter une vérification si vous simulez Firebase
    expect(window.alert).toHaveBeenCalledWith('✅ Test publié avec succès !');
  });
});