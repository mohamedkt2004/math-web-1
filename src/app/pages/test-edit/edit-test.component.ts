import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Database, ref, onValue, update } from '@angular/fire/database';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import {
  OrderNumbersConfig,
  CompareNumbersConfig,
  WhatNumberDoYouHearConfig
} from '../../types/mini-game-types';

@Component({
  selector: 'app-edit-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-test.component.html',
  styleUrl: './edit-test.component.css'
})
export class EditTestComponent implements OnInit {
  private fb = inject(FormBuilder);
  private db = inject(Database);
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  gradeLevels: string[] = [];
  teacherUID: string = "";
  selectedMiniGames: string[] = [];
  testId: string | null = null;
  allMiniGames: {
    id: string;
    title: string;
    configTemplate: Partial<
      OrderNumbersConfig &
      CompareNumbersConfig &
      WhatNumberDoYouHearConfig
    >;
  }[] = [];

  testForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    classroomId: ['', Validators.required],
    testDuration: [30, [Validators.required, Validators.min(5)]],
    selectedMiniGames: [[], Validators.required],
    miniGameConfigs: this.fb.group({}),
    status: ['DRAFT']
  });

  ngOnInit() {
    this.testId = this.route.snapshot.paramMap.get('id');
    if (!this.testId) {
      alert('Erreur : Aucun ID de test fourni.');
      this.router.navigate(['/teacher-dashboard']);
      return;
    }

    this.auth.getCurrentUserWithRole().subscribe(user => {
      if (!user) return;
      this.teacherUID = user.uid;
      const usersRef = ref(this.db, 'users');

      onValue(usersRef, (snapshot) => {
        const allUsers = snapshot.val();
        const gradesSet = new Set<string>();

        for (const key in allUsers) {
          const student = allUsers[key];
          if (student.role === 'Student' && student.linkedTeacherId === this.teacherUID && student.schoolGrade) {
            gradesSet.add(`${student.schoolGrade}`);
          }
        }

        this.gradeLevels = Array.from(gradesSet).sort();
      });

      // Load test data
      const testRef = ref(this.db, `tests/${this.testId}`);
      onValue(testRef, (snapshot) => {
        const testData = snapshot.val();
        if (!testData) {
          alert('Erreur : Test introuvable.');
          this.router.navigate(['/teacher-dashboard']);
          return;
        }

        this.testForm.patchValue({
          title: testData.testName,
          classroomId: testData.grade,
          testDuration: testData.testDuration,
          selectedMiniGames: testData.miniGameOrder,
          status: testData.status
        });

        this.selectedMiniGames = testData.miniGameOrder || [];
        const configs = this.testForm.get('miniGameConfigs') as FormGroup;
        for (const gameId of this.selectedMiniGames) {
          if (['order_numbers', 'compare_numbers', 'what_number_do_you_hear'].includes(gameId)) {
            configs.addControl(gameId, this.fb.group(this.buildMiniGameControls(gameId, testData.miniGameConfigs[gameId])));
          }
        }
      });
    });

    // Load mini-games data
    this.http.get('/mini-games.json').subscribe((data: any) => {
      if (!data || !data.miniGames) {
        console.error('Mini-game data not available');
        return;
      }
      
      const gameDefs = data.miniGames;
      this.allMiniGames = Object.entries(gameDefs)
        .filter(([id]) => ['order_numbers', 'compare_numbers', 'what_number_do_you_hear'].includes(id))
        .map(([id, game]: any) => {
          const gradeConfigs = game.defaultConfig?.gradeConfig || {};
          const fallbackConfig = Object.values(gradeConfigs)[0] || {};
          const selectedGrade = this.testForm.get('classroomId')?.value || '4';
          
          return {
            id,
            title: game.title?.en || id,
            configTemplate: gradeConfigs[selectedGrade] || fallbackConfig
          };
        });
    });
  }

  onMiniGameToggle(gameId: string, checked: boolean) {
    const selectedMiniGames = [...this.selectedMiniGames];
    const configs = this.testForm.get('miniGameConfigs') as FormGroup;
    
    if (checked && ['order_numbers', 'compare_numbers', 'what_number_do_you_hear'].includes(gameId)) {
      selectedMiniGames.push(gameId);
      configs.addControl(gameId, this.fb.group(this.buildMiniGameControls(gameId)));
    } else {
      const index = selectedMiniGames.indexOf(gameId);
      if (index > -1) {
        selectedMiniGames.splice(index, 1);
      }
      configs.removeControl(gameId);
    }
    
    this.selectedMiniGames = selectedMiniGames;
    this.testForm.get('selectedMiniGames')?.setValue(selectedMiniGames);
    this.testForm.get('selectedMiniGames')?.markAsTouched();
  }

  buildMiniGameControls(gameId: string, existingConfig?: any): { [key: string]: FormControl } {
    const game = this.allMiniGames.find(g => g.id === gameId);
    const fields = game?.configTemplate || {};
    const controls: { [key: string]: FormControl } = {
      requiredCorrectAnswers: new FormControl(existingConfig?.requiredCorrectAnswers || 0, Validators.required)
    };

    // Add numberOfOptions for all games except order_numbers
    if (gameId !== 'order_numbers') {
      controls['numberOfOptions'] = new FormControl(existingConfig?.numberOfOptions || 7, Validators.required);
    }

    // Add other fields from template, excluding timeLimit and already handled fields
    for (const key in fields) {
      if (key !== 'timeLimit' && 
          key !== 'requiredCorrectAnswers' && 
          (gameId !== 'order_numbers' || key !== 'numberOfOptions')) {
        const value = existingConfig ? existingConfig[key] : fields[key as keyof typeof fields];
        controls[key] = new FormControl(value, Validators.required);
      }
    }

    return controls;
  }

  onCheckboxChange(event: Event, gameId: string) {
    const input = event.target as HTMLInputElement;
    this.onMiniGameToggle(gameId, input.checked);
  }

  saveTest(isDraft: boolean) {
    // Mark all form controls as touched to show validation errors
    Object.keys(this.testForm.controls).forEach(key => {
      this.testForm.get(key)?.markAsTouched();
    });

    console.log('Form state:', this.testForm.valid, this.testForm.value);
    console.log('Errors:', this.getFormValidationErrors());
    
    if (this.testForm.invalid) {
      alert('Veuillez remplir tous les champs requis.');
      return;
    }

    const testData = this.testForm.value;
    const testObject = {
      testName: testData.title,
      teacherId: this.teacherUID,
      grade: testData.classroomId,
      testDuration: testData.testDuration,
      isDraft: isDraft,
      status: isDraft ? 'DRAFT' : 'PUBLISHED',
      miniGameOrder: testData.selectedMiniGames,
      miniGameConfigs: testData.miniGameConfigs,
      updatedAt: Date.now()
    };

    update(ref(this.db, `tests/${this.testId}`), testObject)
      .then(() => {
        const message = isDraft ? '✅ Draft successfully updated !' : '✅ Test successfully published !';
        alert(message);
        this.router.navigate(['/teacher-dashboard']);
      })
      .catch((err) => console.error('❌ Error while updating the test :', err));
  }

  getFormValidationErrors() {
    const errors: any = {};
    Object.keys(this.testForm.controls).forEach(key => {
      const control = this.testForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
      
      if (key === 'miniGameConfigs' && control instanceof FormGroup) {
        const configErrors: any = {};
        Object.keys(control.controls).forEach(gameId => {
          const gameControl = control.get(gameId);
          if (gameControl instanceof FormGroup) {
            const gameErrors: any = {};
            Object.keys(gameControl.controls).forEach(configKey => {
              const configControl = gameControl.get(configKey);
              if (configControl?.errors) {
                gameErrors[configKey] = configControl.errors;
              }
            });
            if (Object.keys(gameErrors).length > 0) {
              configErrors[gameId] = gameErrors;
            }
          }
        });
        if (Object.keys(configErrors).length > 0) {
          errors['miniGameConfigs'] = configErrors;
        }
      }
    });
    return errors;
  }

  saveAsDraft() {
    this.saveTest(true);
  }

  publishTest() {
    this.saveTest(false);
  }

  getKey(key: any): string {
    return key.key;
  }

  getControlNames(gameId: string): string[] {
    const gameFormGroup = this.testForm.get('miniGameConfigs')?.get(gameId) as FormGroup;
    return gameFormGroup ? Object.keys(gameFormGroup.controls) : [];
  }
}