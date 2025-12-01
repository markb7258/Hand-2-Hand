// Define permissions for InstantDB
// Users can only access their own data

const rules = {
  profiles: {
    allow: {
      view: "auth.id == data.id",
      create: "auth.id != null",
      update: "auth.id == data.id",
      delete: "auth.id == data.id",
    },
  },
  countries: {
    allow: {
      view: "true", // Everyone can view countries
      create: "auth.id != null && true in auth.ref('$user.profiles.isAdmin')", // Only admins
      update: "auth.id != null && true in auth.ref('$user.profiles.isAdmin')", // Only admins
      delete: "auth.id != null && true in auth.ref('$user.profiles.isAdmin')", // Only admins
    },
  },
  notes: {
    allow: {
      view: "auth.id == data.userId", // Users can only view their own notes
      create: "auth.id != null && auth.id == data.userId",
      update: "auth.id == data.userId",
      delete: "auth.id == data.userId",
    },
  },
  galleryImages: {
    allow: {
      view: "true", // Everyone can view gallery images
      create: "auth.id != null && true in auth.ref('$user.profiles.isAdmin')",
      update: "auth.id != null && true in auth.ref('$user.profiles.isAdmin')",
      delete: "auth.id != null && true in auth.ref('$user.profiles.isAdmin')",
    },
  },
};

export default rules;
