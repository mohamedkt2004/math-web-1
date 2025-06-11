import { Component, inject, OnInit } from '@angular/core';
import { Database, ref, get, remove, update } from '@angular/fire/database';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Student {
  uid: string;
  firstName: string;
  lastName: string;
  birthday?: string;
  schoolGrade: string;
  gender: string;
  linkedTeacherId: string;
  role: string;
}

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css'
})
export class StudentListComponent implements OnInit {
  private db = inject(Database);
  private auth = inject(AuthService);

  students: Student[] = [];
  loading = true;
  teacherUID = '';
  
  // Variables pour l'édition
  editingStudent: Student | null = null;
  editForm: Partial<Student> = {};
  isEditing = false;
  editLoading = false;

  // Options pour les dropdowns
  gradeOptions = ['1', '2', '3', '4', '5', '6'];
  genderOptions = ['Male', 'Female'];

  ngOnInit(): void {
    this.auth.getCurrentUserWithRole().subscribe(async (user) => {
      if (!user || user.role !== 'Teacher') return;

      this.teacherUID = user.uid;
      await this.loadStudents();
      this.loading = false;
    });
  }

  async loadStudents() {
    try {
      const snapshot = await get(ref(this.db, 'users'));
      
      if (snapshot.exists()) {
        const allUsers = snapshot.val();
        this.students = Object.entries(allUsers)
          .filter(([key, user]: [string, any]) => 
            user.role === 'Student' && user.linkedTeacherId === this.teacherUID
          )
          .map(([key, user]: [string, any]) => ({
            uid: key,
            firstName: user.firstName,
            lastName: user.lastName,
            birthday: user.birthday,
            schoolGrade: user.schoolGrade,
            gender: user.gender,
            linkedTeacherId: user.linkedTeacherId,
            role: user.role
          }));
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  }

  // Méthodes d'édition
  startEdit(student: Student) {
    this.editingStudent = { ...student };
    this.editForm = {
      firstName: student.firstName,
      lastName: student.lastName,
      birthday: student.birthday,
      schoolGrade: student.schoolGrade,
      gender: student.gender
    };
    this.isEditing = true;
  }

  cancelEdit() {
    this.editingStudent = null;
    this.editForm = {};
    this.isEditing = false;
    this.editLoading = false;
  }

  async saveEdit() {
    if (!this.editingStudent || !this.editForm) return;

    this.editLoading = true;
    
    try {
      // Préparer les données à mettre à jour
      const updateData: any = {};
      
      if (this.editForm.firstName?.trim()) {
        updateData.firstName = this.editForm.firstName.trim();
      }
      
      if (this.editForm.lastName?.trim()) {
        updateData.lastName = this.editForm.lastName.trim();
      }
      
      if (this.editForm.birthday) {
        updateData.birthday = this.editForm.birthday;
      }
      
      if (this.editForm.schoolGrade) {
        updateData.schoolGrade = this.editForm.schoolGrade;
      }
      
      if (this.editForm.gender) {
        updateData.gender = this.editForm.gender;
      }

      // Mettre à jour dans Firebase
      await update(ref(this.db, `users/${this.editingStudent.uid}`), updateData);

      // Mettre à jour la liste locale
      const studentIndex = this.students.findIndex(s => s.uid === this.editingStudent!.uid);
      if (studentIndex !== -1) {
        this.students[studentIndex] = {
          ...this.students[studentIndex],
          ...updateData
        };
      }

      console.log('Student updated successfully');
      this.cancelEdit();
      
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Erreur lors de la mise à jour. Veuillez réessayer.');
    } finally {
      this.editLoading = false;
    }
  }

  // Validation du formulaire
  isFormValid(): boolean {
    return !!(
      this.editForm.firstName?.trim() &&
      this.editForm.lastName?.trim() &&
      this.editForm.schoolGrade &&
      this.editForm.gender
    );
  }

  // Méthodes de suppression existantes
  async unlinkStudent(uid: string) {
    try {
      await remove(ref(this.db, `users/${uid}`));
      this.students = this.students.filter(s => s.uid !== uid);
      console.log(`Student ${uid} deleted successfully`);
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Erreur lors de la suppression. Veuillez réessayer.');
    }
  }

  confirmDelete(student: Student) {
    const confirmDelete = confirm(
      `Êtes-vous sûr de vouloir supprimer définitivement l'étudiant ${student.firstName} ${student.lastName} ?`
    );
    if (confirmDelete) {
      this.unlinkStudent(student.uid);
    }
  }
}