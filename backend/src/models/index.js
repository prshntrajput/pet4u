const userModels = require('./users');
const petModels = require('./pets');
const adoptionModels = require('./adoptionRequests');
const reviewModels = require('./reviews');

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
};
