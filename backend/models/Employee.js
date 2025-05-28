const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  nomComplet: { type: String, required: true },
  dateNaissance: { type: Date },
  sexe: { type: String, required: true, enum: ['Homme', 'Femme'] },
  grade: { type: String },
  dateRecrutement: { type: Date, required: true },
  diplome: { type: String },
  affectation: { type: String },
  situationFamiliale: { type: String, enum: ['Célibataire', 'Marié', 'Divorcé'] },
  missionPoste: { type: String },
  formationInitiale: { type: String },
  activitePrincipale: { type: String },
  cin: { type: String },
  ppr: { type: String },
  adresse: { type: String },
  email: { type: String, required: true },
  numeroTelephone: { type: String },
  experienceExterne: { type: String },
  experienceInterne: { type: String },
  divisionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Division', required: true },
  informationsSupplementaires: [{ type: String }],
});

module.exports = mongoose.model('Employee', employeeSchema);