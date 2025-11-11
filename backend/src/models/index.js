// Central export for all database models
const userModels = require('./users');
const petModels = require('./pets');
const adoptionModels = require("./adoptionRequests")

module.exports = {
  // User-related models
  users: userModels.users,
  shelters: userModels.shelters,
  userSessions: userModels.userSessions,
  emailVerificationTokens: userModels.emailVerificationTokens,
  passwordResetTokens: userModels.passwordResetTokens,
  
  // Pet-related models
  pets: petModels.pets,
  petImages: petModels.petImages,
  petCategories: petModels.petCategories,
  petFavorites: petModels.petFavorites,

  // Adoption-related models
  adoptionRequests: adoptionModels.adoptionRequests,
  messages: adoptionModels.messages,
  conversations: adoptionModels.conversations,
  notifications: adoptionModels.notifications,
};
