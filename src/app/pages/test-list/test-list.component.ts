import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Database, ref, onValue, update, remove } from '@angular/fire/database';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TestConfig, TestStatus } from '../../models/test-config.model';

@Component({
  selector: 'app-test-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-list.component.html',
  styleUrl: './test-list.component.css'
})
export class TestListComponent implements OnInit {
  private db = inject(Database);
  private auth = inject(AuthService);
  private router = inject(Router);

  teacherUID = '';
  allTests: TestConfig[] = [];
  filteredTests: TestConfig[] = [];
  grades: string[] = [];
  selectedGrade = '';
  testCount = 0;
  TestStatus = TestStatus;

  ngOnInit() {
    this.auth.getCurrentUserWithRole().subscribe(user => {
      if (!user) return;
      this.teacherUID = user.uid;

      const testsRef = ref(this.db, 'tests');
      onValue(testsRef, (snapshot) => {
        const all = snapshot.val() || {};
        this.allTests = Object.entries(all)
          .map(([id, test]: [string, any]) => ({ id, ...test } as TestConfig))
          .filter((test: TestConfig) => test.teacherId === this.teacherUID);
        this.testCount = this.allTests.length;
        this.grades = [...new Set(this.allTests.map((t: TestConfig) => t.grade))];
        this.applyFilter();
      });
    });
  }

  applyFilter() {
    this.filteredTests = this.selectedGrade
      ? this.allTests.filter(t => t.grade === this.selectedGrade)
      : this.allTests;
  }

  editTest(testId: string) {
    this.router.navigate(['/edit-test', testId]);
  }

  publishTest(test: TestConfig) {
    if (test.status === TestStatus.DRAFT && test.id) {
      const testRef = ref(this.db, `tests/${test.id}`);
      update(testRef, { status: TestStatus.PUBLISHED, isDraft: false })
        .then(() => alert('✅ Test publié avec succès !'))
        .catch(err => console.error('❌ Erreur lors de la publication :', err));
    }
  }

  deleteTest(test: TestConfig) {
    if (test.status === TestStatus.DRAFT && test.id) {
      const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer le test "${test.testName}" ? Cette action est irréversible.`);
      
      if (confirmDelete) {
        const testRef = ref(this.db, `tests/${test.id}`);
        remove(testRef)
          .then(() => {
            alert('🗑️ Test supprimé avec succès !');
            // La liste se mettra à jour automatiquement grâce à onValue
          })
          .catch(err => {
            console.error('❌ Erreur lors de la suppression :', err);
            alert('❌ Erreur lors de la suppression du test');
          });
      }
    }
  }
}