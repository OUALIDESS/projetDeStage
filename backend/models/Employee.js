const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  nomComplet: { type: String, required: true },
  grade: { type: String, required: true },
  missionPoste: { type: String, required: true },
  email: { type: String, required: true },
  dateNaissance: { type: String, required: true },
  sexe: { type: String, required: true },
  dateRecrutement: { type: String, required: true },
  diplome: { type: String, required: true },
  affectation: { type: String, required: true },
  situationFamiliale: { type: String, required: true },
  formationInitiale: { type: String, required: true },
  activitePrincipale: { type: String, required: true },
  cin: { type: String, required: true },
  ppr: { type: String, required: true },
  adresse: { type: String, required: true },
  numeroTelephone: { type: String, required: true },
  experienceExterne: { type: String },
  experienceInterne: { type: String },
  typeContrat: { type: String },
  divisionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Division', required: true },
  supplementaryInfo: [{ titre: String, description: String }],
});

module.exports = mongoose.model('Employee', EmployeeSchema);