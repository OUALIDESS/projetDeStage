require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('./models/Employee');
const Division = require('./models/Division');
const User = require('./models/User');
const Grade = require('./models/Grade');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/employee_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear non-admin data
    await Employee.deleteMany({});
    await Division.deleteMany({});
    await User.deleteMany({ role: { $ne: 'admin' } });
    await Grade.deleteMany({});

    // Seed grades
    const grades = [
      { name: 'Manager', description: 'Division Manager' },
      { name: 'Manager RH', description: 'HR Manager' },
      { name: 'Analyste', description: 'Data Analyst' },
      { name: 'Technicienne', description: 'Technical Specialist' },
      { name: 'Consultant', description: 'External Consultant' },
      { name: 'Analyste Financier', description: 'Financial Analyst' },
      { name: 'Coordinatrice', description: 'Project Coordinator' },
      { name: 'Assistante RH', description: 'HR Assistant' },
      { name: 'Architecte', description: 'Urban Architect' },
    ];
    const insertedGrades = await Grade.insertMany(grades);
    console.log('Inserted grades:', insertedGrades.length);

    // Check or update admin user
    let admin = await User.findOne({ email: 'admin@example.com' });
    const newPasswordHash = await bcrypt.hash('admin123', 10);
    console.log('Generated hash for admin123:', newPasswordHash);

    if (!admin) {
      admin = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: newPasswordHash,
        role: 'admin',
      });
      await admin.save();
      console.log('Admin user created: email=admin@example.com, password hash=', newPasswordHash);
    } else {
      const isMatch = await bcrypt.compare('admin123', admin.password);
      console.log('Current password matches admin123:', isMatch);
      if (!isMatch) {
        admin.password = newPasswordHash;
        await admin.save();
        console.log('Admin password updated to match admin123, new hash=', newPasswordHash);
      } else {
        console.log('Admin password already matches admin123, no update needed');
      }
    }

    // Seed 8 divisions with isSeeded: true
    const divisions = [
      { name: 'DAEC', currentProject: 'Administrative Coordination', managerId: null, employeeIds: [], isSeeded: true },
      { name: 'DAI', currentProject: 'Infrastructure Analysis', managerId: null, employeeIds: [], isSeeded: true },
      { name: 'DAS', currentProject: 'Security Systems', managerId: null, employeeIds: [], isSeeded: true },
      { name: 'DCT', currentProject: 'Technical Control', managerId: null, employeeIds: [], isSeeded: true },
      { name: 'DFL', currentProject: 'Financial Logistics', managerId: null, employeeIds: [], isSeeded: true },
      { name: 'DPE', currentProject: 'Performance Evaluation', managerId: null, employeeIds: [], isSeeded: true },
      { name: 'DRHF', currentProject: 'Human Resources Framework', managerId: null, employeeIds: [], isSeeded: true },
      { name: 'DUE', currentProject: 'Urban Development', managerId: null, employeeIds: [], isSeeded: true },
    ];

    const insertedDivisions = await Division.insertMany(divisions);
    console.log('Inserted divisions:', insertedDivisions.length);

    // Map division names to their IDs for employee assignment
    const divisionMap = insertedDivisions.reduce((map, div) => {
      map[div.name] = div._id;
      return map;
    }, {});

    // Seed 16 employees with division assignments
    const employees = [
      {
        nomComplet: 'Ahmed Benali',
        dateNaissance: new Date('1985-03-15'),
        sexe: 'Homme',
        grade: 'Manager',
        dateRecrutement: new Date('2010-06-01'),
        diplome: 'Master en Informatique',
        affectation: 'Gestion Administrative',
        situationFamiliale: 'Marié',
        missionPoste: 'Superviser la coordination administrative',
        formationInitiale: 'École Nationale d’Ingénieurs',
        activitePrincipale: 'Gestion des équipes administratives',
        cin: 'AB123456',
        ppr: 'PPR001',
        adresse: 'Rue Hassan II, Casablanca',
        email: 'ahmed.benali@example.com',
        numeroTelephone: '+212600123456',
        experienceExterne: '5 ans chez TechCorp',
        experienceInterne: '10 ans',
        divisionId: divisionMap['DAEC'],
      },
      {
        nomComplet: 'Fatima Zahra',
        dateNaissance: new Date('1990-07-22'),
        sexe: 'Femme',
        grade: 'Analyste',
        dateRecrutement: new Date('2015-09-10'),
        diplome: 'Licence en Gestion',
        affectation: 'Analyse de données',
        situationFamiliale: 'Célibataire',
        missionPoste: 'Analyser les performances',
        formationInitiale: 'Université Mohammed V',
        activitePrincipale: 'Rapports et statistiques',
        cin: 'FZ789012',
        ppr: 'PPR002',
        adresse: 'Avenue Mohammed VI, Rabat',
        email: 'fatima.zahra@example.com',
        numeroTelephone: '+212600789012',
        experienceExterne: '2 ans chez DataCorp',
        experienceInterne: '5 ans',
        divisionId: divisionMap['DAEC'],
      },
      {
        nomComplet: 'Mohammed El Idrissi',
        dateNaissance: new Date('1982-11-05'),
        sexe: 'Homme',
        grade: 'Manager',
        dateRecrutement: new Date('2008-03-15'),
        diplome: 'Master en Gestion',
        affectation: 'Gestion de projet',
        situationFamiliale: 'Marié',
        missionPoste: 'Superviser les projets d’infrastructure',
        formationInitiale: 'École Hassania des Travaux Publics',
        activitePrincipale: 'Coordination des équipes',
        cin: 'ME345678',
        ppr: 'PPR003',
        adresse: 'Rue Al Massira, Marrakech',
        email: 'mohammed.elidrissi@example.com',
        numeroTelephone: '+212600345678',
        experienceExterne: '7 ans chez InfraCorp',
        experienceInterne: '12 ans',
        divisionId: divisionMap['DAI'],
      },
      {
        nomComplet: 'Aicha Bennani',
        dateNaissance: new Date('1988-04-18'),
        sexe: 'Femme',
        grade: 'Technicienne',
        dateRecrutement: new Date('2013-12-01'),
        diplome: 'BTS en Sécurité',
        affectation: 'Sécurité des systèmes',
        situationFamiliale: 'Divorcé',
        missionPoste: 'Maintenance des équipements de sécurité',
        formationInitiale: 'Institut Technique de Rabat',
        activitePrincipale: 'Contrôle des installations',
        cin: 'AB901234',
        ppr: 'PPR004',
        adresse: 'Rue Ibn Sina, Fès',
        email: 'aicha.bennani@example.com',
        numeroTelephone: '+212600901234',
        experienceExterne: '3 ans chez SecurCorp',
        experienceInterne: '7 ans',
        divisionId: divisionMap['DAI'],
      },
      {
        nomComplet: 'Youssef Amrani',
        dateNaissance: new Date('1992-09-30'),
        sexe: 'Homme',
        grade: 'Consultant',
        dateRecrutement: new Date('2017-05-20'),
        diplome: 'Master en Sécurité',
        affectation: 'Audit de sécurité',
        situationFamiliale: 'Célibataire',
        missionPoste: 'Évaluer les risques de sécurité',
        formationInitiale: 'Université Al Akhawayn',
        activitePrincipale: 'Audit et conformité',
        cin: 'YA567890',
        ppr: 'PPR005',
        adresse: 'Avenue Allal Ben Abdellah, Tanger',
        email: 'youssef.amrani@example.com',
        numeroTelephone: '+212600567890',
        experienceExterne: '1 an chez SafeCorp',
        experienceInterne: '3 ans',
        divisionId: divisionMap['DAS'],
      },
      {
        nomComplet: 'Laila Chraibi',
        dateNaissance: new Date('1987-02-12'),
        sexe: 'Femme',
        grade: 'Manager',
        dateRecrutement: new Date('2012-08-15'),
        diplome: 'Master en Génie Civil',
        affectation: 'Gestion de sécurité',
        situationFamiliale: 'Marié',
        missionPoste: 'Superviser les systèmes de sécurité',
        formationInitiale: 'École Mohammedia d’Ingénieurs',
        activitePrincipale: 'Gestion des équipes de sécurité',
        cin: 'LC123456',
        ppr: 'PPR006',
        adresse: 'Rue Abdelmoumen, Casablanca',
        email: 'laila.chraibi@example.com',
        numeroTelephone: '+212600123456',
        experienceExterne: '4 ans chez BuildCorp',
        experienceInterne: '8 ans',
        divisionId: divisionMap['DAS'],
      },
      {
        nomComplet: 'Khalid Saidi',
        dateNaissance: new Date('1984-06-25'),
        sexe: 'Homme',
        grade: 'Manager',
        dateRecrutement: new Date('2011-10-01'),
        diplome: 'BTS en Mécanique',
        affectation: 'Gestion technique',
        situationFamiliale: 'Marié',
        missionPoste: 'Superviser le contrôle technique',
        formationInitiale: 'Institut de Technologie Appliquée',
        activitePrincipale: 'Gestion des équipes techniques',
        cin: 'KS789012',
        ppr: 'PPR007',
        adresse: 'Rue Mohammed V, Agadir',
        email: 'khalid.saidi@example.com',
        numeroTelephone: '+212600789012',
        experienceExterne: '6 ans chez MechCorp',
        experienceInterne: '9 ans',
        divisionId: divisionMap['DCT'],
      },
      {
        nomComplet: 'Nadia El Fassi',
        dateNaissance: new Date('1991-12-03'),
        sexe: 'Femme',
        grade: 'Analyste Financier',
        dateRecrutement: new Date('2016-04-10'),
        diplome: 'Master en Finance',
        affectation: 'Gestion financière',
        situationFamiliale: 'Célibataire',
        missionPoste: 'Analyser les flux financiers',
        formationInitiale: 'École Nationale de Commerce et de Gestion',
        activitePrincipale: 'Budgétisation et rapports',
        cin: 'NE345678',
        ppr: 'PPR008',
        adresse: 'Avenue des FAR, Rabat',
        email: 'nadia.elfassi@example.com',
        numeroTelephone: '+212600345678',
        experienceExterne: '2 ans chez FinCorp',
        experienceInterne: '4 ans',
        divisionId: divisionMap['DCT'],
      },
      {
        nomComplet: 'Omar Tazi',
        dateNaissance: new Date('1986-08-08'),
        sexe: 'Homme',
        grade: 'Manager',
        dateRecrutement: new Date('2014-02-20'),
        diplome: 'Licence en Logistique',
        affectation: 'Gestion logistique',
        situationFamiliale: 'Marié',
        missionPoste: 'Superviser la logistique financière',
        formationInitiale: 'Université Ibn Zohr',
        activitePrincipale: 'Gestion des équipes logistiques',
        cin: 'OT901234',
        ppr: 'PPR009',
        adresse: 'Rue Ibn Battuta, Marrakech',
        email: 'omar.tazi@example.com',
        numeroTelephone: '+212600901234',
        experienceExterne: '5 ans chez LogiCorp',
        experienceInterne: '6 ans',
        divisionId: divisionMap['DFL'],
      },
      {
        nomComplet: 'Sara Lahlou',
        dateNaissance: new Date('1993-05-17'),
        sexe: 'Femme',
        grade: 'Coordinatrice',
        dateRecrutement: new Date('2018-07-01'),
        diplome: 'Licence en Management',
        affectation: 'Coordination de projets',
        situationFamiliale: 'Célibataire',
        missionPoste: 'Coordonner les équipes financières',
        formationInitiale: 'Université Cadi Ayyad',
        activitePrincipale: 'Planification et suivi',
        cin: 'SL567890',
        ppr: 'PPR010',
        adresse: 'Avenue Al Qods, Fès',
        email: 'sara.lahlou@example.com',
        numeroTelephone: '+212600567890',
        experienceExterne: '1 an chez CoordCorp',
        experienceInterne: '2 ans',
        divisionId: divisionMap['DFL'],
      },
      {
        nomComplet: 'Hassan Bouzidi',
        dateNaissance: new Date('1983-10-14'),
        sexe: 'Homme',
        grade: 'Manager',
        dateRecrutement: new Date('2009-11-05'),
        diplome: 'Master en Évaluation',
        affectation: 'Gestion d’évaluation',
        situationFamiliale: 'Marié',
        missionPoste: 'Superviser l’évaluation des performances',
        formationInitiale: 'École Nationale de Gestion',
        activitePrincipale: 'Gestion des équipes d’évaluation',
        cin: 'HB123456',
        ppr: 'PPR011',
        adresse: 'Rue Al Irfane, Tanger',
        email: 'hassan.bouzidi@example.com',
        numeroTelephone: '+212600123456',
        experienceExterne: '8 ans chez EvalCorp',
        experienceInterne: '11 ans',
        divisionId: divisionMap['DPE'],
      },
      {
        nomComplet: 'Zineb Alaoui',
        dateNaissance: new Date('1989-03-29'),
        sexe: 'Femme',
        grade: 'Consultant', // Corrected from 'Consultante' to match grade list
        dateRecrutement: new Date('2015-01-15'),
        diplome: 'Master en Ressources Humaines',
        affectation: 'Gestion du personnel',
        situationFamiliale: 'Marié',
        missionPoste: 'Gérer les processus RH',
        formationInitiale: 'Université Hassan II',
        activitePrincipale: 'Recrutement et formation',
        cin: 'ZA789012',
        ppr: 'PPR012',
        adresse: 'Avenue Mohammed V, Casablanca',
        email: 'zineb.alaoui@example.com',
        numeroTelephone: '+212600789012',
        experienceExterne: '3 ans chez HRCorp',
        experienceInterne: '5 ans',
        divisionId: divisionMap['DPE'],
      },
      {
        nomComplet: 'Rachid Mernissi',
        dateNaissance: new Date('1981-07-07'),
        sexe: 'Homme',
        grade: 'Manager RH',
        dateRecrutement: new Date('2007-04-10'),
        diplome: 'Master en Gestion RH',
        affectation: 'Stratégie RH',
        situationFamiliale: 'Marié',
        missionPoste: 'Développer les politiques RH',
        formationInitiale: 'École Nationale de Commerce',
        activitePrincipale: 'Planification stratégique',
        cin: 'RM345678',
        ppr: 'PPR013',
        adresse: 'Rue Al Wahda, Rabat',
        email: 'rachid.mernissi@example.com',
        numeroTelephone: '+212600345678',
        experienceExterne: '10 ans chez StratCorp',
        experienceInterne: '13 ans',
        divisionId: divisionMap['DRHF'],
      },
      {
        nomComplet: 'Meryem Kabbaj',
        dateNaissance: new Date('1994-11-20'),
        sexe: 'Femme',
        grade: 'Assistante RH',
        dateRecrutement: new Date('2019-03-01'),
        diplome: 'Licence en Gestion',
        affectation: 'Administration RH',
        situationFamiliale: 'Célibataire',
        missionPoste: 'Gérer les dossiers du personnel',
        formationInitiale: 'Université Abdelmalek Essaadi',
        activitePrincipale: 'Gestion administrative',
        cin: 'MK901234',
        ppr: 'PPR014',
        adresse: 'Avenue Hassan I, Tétouan',
        email: 'meryem.kabbaj@example.com',
        numeroTelephone: '+212600901234',
        experienceExterne: '1 an chez AdminCorp',
        experienceInterne: '1 an',
        divisionId: divisionMap['DRHF'],
      },
      {
        nomComplet: 'Said Cherkaoui',
        dateNaissance: new Date('1985-01-09'),
        sexe: 'Homme',
        grade: 'Manager',
        dateRecrutement: new Date('2010-09-15'),
        diplome: 'Master en Urbanisme',
        affectation: 'Gestion urbaine',
        situationFamiliale: 'Marié',
        missionPoste: 'Superviser le développement urbain',
        formationInitiale: 'École d’Architecture de Rabat',
        activitePrincipale: 'Gestion des équipes d’urbanisme',
        cin: 'SC567890',
        ppr: 'PPR015',
        adresse: 'Rue Al Amal, Marrakech',
        email: 'said.cherkaoui@example.com',
        numeroTelephone: '+212600567890',
        experienceExterne: '5 ans chez UrbanCorp',
        experienceInterne: '10 ans',
        divisionId: divisionMap['DUE'],
      },
      {
        nomComplet: 'Asma Bennacer',
        dateNaissance: new Date('1990-06-13'),
        sexe: 'Femme',
        grade: 'Architecte',
        dateRecrutement: new Date('2016-11-01'),
        diplome: 'Master en Architecture',
        affectation: 'Conception urbaine',
        situationFamiliale: 'Célibataire',
        missionPoste: 'Développer des projets architecturaux',
        formationInitiale: 'École Nationale d’Architecture',
        activitePrincipale: 'Conception et planification',
        cin: 'AB123457',
        ppr: 'PPR016',
        adresse: 'Avenue Al Moustakbal, Casablanca',
        email: 'asma.bennacer@example.com',
        numeroTelephone: '+212600123456',
        experienceExterne: '2 ans chez ArchiCorp',
        experienceInterne: '4 ans',
        divisionId: divisionMap['DUE'],
      },
    ];

    const insertedEmployees = await Employee.insertMany(employees);
    console.log('Inserted employees:', insertedEmployees.length);

    // Update divisions with employeeIds and managerId
    const managerAssignments = {
      'DAEC': 'ahmed.benali@example.com',
      'DAI': 'mohammed.elidrissi@example.com',
      'DAS': 'laila.chraibi@example.com',
      'DCT': 'khalid.saidi@example.com',
      'DFL': 'omar.tazi@example.com',
      'DPE': 'hassan.bouzidi@example.com',
      'DRHF': 'rachid.mernissi@example.com',
      'DUE': 'said.cherkaoui@example.com',
    };

    for (const employee of insertedEmployees) {
      if (employee.divisionId) {
        await Division.findByIdAndUpdate(employee.divisionId, {
          $push: { employeeIds: employee._id },
        }, { upsert: true });
      }
      const divisionName = Object.keys(divisionMap).find(key => divisionMap[key].equals(employee.divisionId));
      if (divisionName && managerAssignments[divisionName] === employee.email) {
        await Division.findOneAndUpdate(
          { _id: employee.divisionId },
          { managerId: employee._id },
          { upsert: true }
        );
      }
    }

    // Verify division updates
    const updatedDivisions = await Division.find();
    updatedDivisions.forEach(div => {
      console.log(`Division ${div.name}: managerId=${div.managerId ? div.managerId : 'null'}, employeeIds=${div.employeeIds.length}`);
    });

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await mongoose.connection.close();
  }
};

seedData();