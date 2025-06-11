export enum TestStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED'
}

export interface TestConfig {
  id?: string; // Identifiant unique du test (optionnel, généré par Firebase)
  testName: string; // Nom du test (correspond à "title" dans le formulaire)
  teacherId: string; // ID de l'enseignant qui a créé le test
  grade: string; // Niveau scolaire (correspond à "classroomId" dans le formulaire)
  testDuration: number; // Durée du test en minutes
  miniGameOrder: string[]; // Liste des identifiants des mini-jeux sélectionnés
  miniGameConfigs: { [key: string]: any }; // Configurations des mini-jeux
  status: TestStatus; // État du test (DRAFT, PUBLISHED, etc.)
  createdAt: number; // Horodatage de création (timestamp)
  updatedAt?: number; // Horodatage de mise à jour (optionnel)
  isDraft?: boolean; // Champ pour compatibilité avec l'existant
}