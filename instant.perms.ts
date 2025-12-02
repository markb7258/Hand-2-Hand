// Define permissions for InstantDB
// Users can only access their own data

const rules = {
  profiles: {
    allow: {
      view: "auth.id in data.ref('user.id')", // Users can view their own profile
      create: "auth.id != null", // Authenticated users can create profiles
      update: "auth.id in data.ref('user.id')", // Users can update their own profile
      delete: "auth.id in data.ref('user.id')", // Users can delete their own profile
    },
  },
  countries: {
    allow: {
      view: "true", // Everyone can view countries
      create: "true in auth.ref('$user.profile.isAdmin')", // Only admins
      update: "true in auth.ref('$user.profile.isAdmin')", // Only admins
      delete: "true in auth.ref('$user.profile.isAdmin')", // Only admins
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
      create: "true in auth.ref('$user.profile.isAdmin')",
      update: "true in auth.ref('$user.profile.isAdmin')",
      delete: "true in auth.ref('$user.profile.isAdmin')",
    },
  },
};

export default rules;
