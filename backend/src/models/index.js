const userModels = require('./users');
const petModels = require('./pets');
const adoptionModels = require('./adoptionRequests');
const reviewModels = require('./reviews');
const paymentModels = require('./payment');
const lostFoundModels = require('./lostFoundReports');
const appointmentModels = require('./appointments');
const savedSearchModels = require('./savedSearches');
const checkInModels = require('./adoptionCheckIns');

module.exports = {
  // User models
  users: userModels.users,
  shelters: userModels.shelters,
  userSessions: userModels.userSessions,
  emailVerificationTokens: userModels.emailVerificationTokens,
  passwordResetTokens: userModels.passwordResetTokens,

  // Pet models
  pets: petModels.pets,
  petImages: petModels.petImages,
  petCategories: petModels.petCategories,
  petFavorites: petModels.petFavorites,

  // Adoption models
  adoptionRequests: adoptionModels.adoptionRequests,
  messages: adoptionModels.messages,
  conversations: adoptionModels.conversations,
  notifications: adoptionModels.notifications,

  // Review models
  petReviews: reviewModels.petReviews,
  shelterReviews: reviewModels.shelterReviews,
  adminLogs: reviewModels.adminLogs,
  statistics: reviewModels.statistics,

  // Payment models
  payments: paymentModels.payments,
  refunds: paymentModels.refunds,

  // Lost & Found reports
  lostFoundReports: lostFoundModels.lostFoundReports,

  // Appointments
  appointments: appointmentModels.appointments,
  availabilitySlots: appointmentModels.availabilitySlots,

  // Saved searches / pet alerts
  savedSearches: savedSearchModels.savedSearches,

  // Post-adoption check-ins
  adoptionCheckIns: checkInModels.adoptionCheckIns,
};
