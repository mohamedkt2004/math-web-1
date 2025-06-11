import { Component, inject, OnInit } from '@angular/core';
import { Database, ref, get, child } from '@angular/fire/database';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-performance-monitoring',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './performance-monitoring.component.html',
  styleUrl: './performance-monitoring.component.css'
})
export class PerformanceMonitoringComponent implements OnInit {
  private db = inject(Database);
  private auth = inject(AuthService);

  teacherUID = '';
  loading = true;
  allResults: any[] = []; // Tous les résultats
  filteredResults: any[] = []; // Résultats filtrés affichés
  availableGrades: string[] = []; // Grades disponibles
  selectedGrade = 'all'; // Grade sélectionné ('all' pour tous)

  ngOnInit(): void {
    this.auth.getCurrentUserWithRole().subscribe(async (user) => {
      if (!user || user.role !== 'Teacher') {
        this.loading = false;
        return;
      }

      this.teacherUID = user.uid;
      await this.loadTestResults();
      this.loading = false;
    });
  }

  async loadTestResults() {
    try {
      const dbRef = ref(this.db);
      const snapshot = await get(child(dbRef, 'testResults'));

      if (snapshot.exists()) {
        const allResultsFromDB = snapshot.val();
        this.allResults = []; // Réinitialiser le tableau

        console.log('All results from DB:', allResultsFromDB);
        console.log('Teacher UID to match:', this.teacherUID);

        // Parcourir tous les résultats
        for (const key in allResultsFromDB) {
          const result = allResultsFromDB[key];
          
          // Vérifier les différents formats possibles de teacherId
          const teacherId = result.teacherId || 
                           result['"teacherId"'] || 
                           result['teacherId'] ||
                           null;

          console.log(`Result ${key}:`, {
            teacherId: teacherId,
            allKeys: Object.keys(result),
            fullResult: result
          });

          // Comparer avec le teacherUID
          if (teacherId === this.teacherUID) {
            // Nettoyer le résultat en supprimant les guillemets supplémentaires
            const cleanedResult: any = { id: key }; // Ajouter l'ID du résultat
            
            for (const prop in result) {
              const cleanKey = prop.replace(/"/g, '');
              cleanedResult[cleanKey] = result[prop];
            }

            this.allResults.push(cleanedResult);
          }
        }

        // Extraire les grades uniques
        this.extractAvailableGrades();
        
        // Appliquer le filtre initial
        this.applyGradeFilter();

        console.log('All Test Results:', this.allResults);
        console.log('Available Grades:', this.availableGrades);
      } else {
        console.log('No test results found in database.');
      }
    } catch (error) {
      console.error('Error loading test results:', error);
    }
  }

  extractAvailableGrades() {
    const grades = new Set<string>();
    
    this.allResults.forEach(result => {
      // Essayer différents champs possibles pour le grade
      const grade = result.grade || 
                   result.studentGrade || 
                   result.class || 
                   result.level;
      
      if (grade) {
        grades.add(grade.toString());
      }
    });

    this.availableGrades = Array.from(grades).sort();
  }

  applyGradeFilter() {
    if (this.selectedGrade === 'all') {
      this.filteredResults = [...this.allResults];
    } else {
      this.filteredResults = this.allResults.filter(result => {
        const grade = result.grade || 
                     result.studentGrade || 
                     result.class || 
                     result.level;
        
        return grade && grade.toString() === this.selectedGrade;
      });
    }

    console.log('Filtered results for grade:', this.selectedGrade, this.filteredResults);
  }

  onGradeChange() {
    this.applyGradeFilter();
  }

  formatCompletionTime(completionTime: any): string {
    if (!completionTime) return 'N/A';
    
    // Handle different possible formats
    let timeValue: number;
    
    if (typeof completionTime === 'string') {
      timeValue = parseFloat(completionTime);
    } else if (typeof completionTime === 'number') {
      timeValue = completionTime;
    } else {
      return 'N/A';
    }
    
    // Check if the value is valid
    if (isNaN(timeValue) || timeValue < 0) {
      return 'N/A';
    }
    
    // Format the time (assuming it's in decimal minutes)
    if (timeValue < 1) {
      // Less than a minute, show in seconds
      return `${Math.round(timeValue * 60)}s`;
    } else {
      // Show in minutes and seconds
      const minutes = Math.floor(timeValue);
      const seconds = Math.round((timeValue - minutes) * 60);
      return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
    }
  }

  getCorrectAnswers(result: any): string {
    if (result.correctAnswers !== undefined && result.correctAnswers !== null) {
      return result.correctAnswers.toString();
    }
    return 'N/A';
  }

  getWrongAnswers(result: any): string {
    if (result.wrongAnswers !== undefined && result.wrongAnswers !== null) {
      return result.wrongAnswers.toString();
    }
    return 'N/A';
  }

  // Alternative: Méthode pour obtenir la valeur avec gestion du zéro
  getNumericValue(value: any): string {
    // Vérifier si la valeur est un nombre (y compris 0) ou une chaîne numérique
    if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
      return value.toString();
    }
    return 'N/A';
  }
}