const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  nomComplet: { type: String, required: true },
  grade: { type: String },
  missionPoste: { type: String },
  email: { type: String, required: true },
  dateNaissance: { type: String },
  sexe: { type: String },
  dateRecrutement: { type: String },
  diplome: { type: String },
  affectation: { type: String },
  situationFamiliale: { type: String },
  formationInitiale: { type: String },
  activitePrincipale: { type: String },
  cin: { type: String },
  ppr: { type: String },
  adresse: { type: String },
  numeroTelephone: { type: String },
  experienceExterne: { type: String },
  experienceInterne: { type: String },
  typeContrat: { type: String },
  supplementaryInfo: [{ titre: String, description: String }],
});

module.exports = mongoose.model('Employee', EmployeeSchema);