import { NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Database, ref, set } from '@angular/fire/database';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-student-registration',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './student-registration.component.html',
  styleUrl: './student-registration.component.css'
})
export class StudentRegistrationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private db = inject(Database);

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  studentForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    birthday: ['', Validators.required],
    schoolGrade: ['', Validators.required],
    gender: ['', Validators.required],
    password: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]]
  });   

  userRole: string | null = null;
  successMessage = '';
  errorMessage = '';
  qrData: string = '';
  qrImage: string = '';
  linkedTeacherId: string = '';
  currentUser: any = null;

  ngOnInit() {
    // Vérifier l'autorisation dès le chargement du composant
    this.auth.getCurrentUserWithRole().subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      if (user.role !== 'Teacher' && user.role !== 'Administrator') {
        this.router.navigate(['/dashboard']);
        return;
      }

      this.currentUser = user;
      this.userRole = user.role;
    });
  }
 
  async onSubmit() {
    if (this.studentForm.invalid || !this.currentUser) {
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }
  
    const studentData = this.studentForm.value;
    const uid = `stu_${Date.now()}`;
  
    try {
      // Créer l'objet de données étudiant
      const studentRecord = {
        uid,
        ...studentData,
        role: 'Student',
        linkedTeacherId: this.currentUser.role === 'Teacher' ? this.currentUser.uid : null,
        createdBy: {
          uid: this.currentUser.uid,
          role: this.currentUser.role
        },
        createdAt: new Date().toISOString()
      };

      // Enregistrer dans la base de données
      await set(ref(this.db, `users/${uid}`), studentRecord);

      // Générer les données QR
      this.qrData = JSON.stringify({
        uid,
        pin: studentData.password
      });

      // Générer et télécharger le PDF
      await this.downloadPDF(studentData);

      // Réinitialiser le formulaire et afficher le message de succès
      this.studentForm.reset();
      this.successMessage = 'Student successfully registered!';
      this.errorMessage = '';

    } catch (err) {
      console.error('Error registering student:', err);
      this.errorMessage = 'An error occurred while registering the student.';
      this.successMessage = '';
    }
  }  

  async downloadPDF(student: any) {
    try {
      const qrUrl = await QRCode.toDataURL(this.qrData);
    
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Student QR Code Login", 20, 20);
    
      doc.setFontSize(12);
      doc.text(`First Name: ${student.firstName}`, 20, 30);
      doc.text(`Last Name: ${student.lastName}`, 20, 40);
      doc.text(`Grade: ${student.schoolGrade}`, 20, 50);
      doc.text(`Birth Date: ${student.birthday}`, 20, 60);
      doc.text(`Gender: ${student.gender}`, 20, 70);
      doc.text(`PIN: ${student.password}`, 20, 80);
      doc.text("Scan the QR code below to log in:", 20, 100);
    
      doc.addImage(qrUrl, "PNG", 20, 110, 100, 100);
    
      const filename = `student-${student.firstName}-${student.lastName}-G${student.schoolGrade}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
      this.errorMessage = 'Error generating PDF document.';
    }
  }  
}