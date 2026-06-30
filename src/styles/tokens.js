export const palette = {
  bg:         "#F0F4FF",
  surface:    "#FFFFFF",
  surfaceAlt: "#F7F9FF",
  border:     "#E2E8FF",
  borderLight:"#CBD5F7",
  accent:     "#4F46E5",
  accentDim:  "#EEF2FF",
  accentGlow: "rgba(79,70,229,0.18)",
  green:      "#059669",
  greenDim:   "#D1FAE5",
  amber:      "#D97706",
  amberDim:   "#FEF3C7",
  red:        "#DC2626",
  redDim:     "#FEE2E2",
  violet:     "#7C3AED",
  violetDim:  "#EDE9FE",
  text:       "#1E1B4B",
  textMuted:  "#6366F1",
  textFaint:  "#A5B4FC",
};

export const STATUS_META = {
  Pending:      { color: "#D97706", bg: "#FEF3C7", icon: "⏳" },
  Assigned:     { color: "#4F46E5", bg: "#EEF2FF", icon: "📋" },
  "In Progress":{ color: "#7C3AED", bg: "#EDE9FE", icon: "🔧" },
  Resolved:     { color: "#059669", bg: "#D1FAE5", icon: "✅" },
  Rejected:     { color: "#DC2626", bg: "#FEE2E2", icon: "✗"  },
};

export const PRIORITY_META = {
  High:   { color: "#DC2626", bg: "#FEE2E2" },
  Medium: { color: "#D97706", bg: "#FEF3C7" },
  Low:    { color: "#059669", bg: "#D1FAE5" },
};

export const CATEGORY_ICONS = {
  Garbage:          "🗑️",
  Pothole:          "🕳️",
  "Water Leakage":  "💧",
  Streetlight:      "💡",
  Sewage:           "🚿",
  "Road Damage":    "🛣️",
  "Noise Pollution":"🔊",
  Other:            "📋",
};

export const ROLE_META = {
  citizen:            { label: "Citizen",            color: "#4F46E5", bg: "#EEF2FF",  icon: "👤" },
  admin:              { label: "Admin",               color: "#059669", bg: "#D1FAE5",  icon: "🛡️" },
  department_officer: { label: "Department Officer",  color: "#D97706", bg: "#FEF3C7",  icon: "🔧" },
  superadmin:         { label: "Super Admin",         color: "#DC2626", bg: "#FEE2E2",  icon: "👑" },
};

export const ROLE_COLORS = {
  citizen:            "#4F46E5",
  admin:              "#059669",
  department_officer: "#D97706",
  superadmin:         "#DC2626",
};

export const BAR_COLORS = [
  "#4F46E5","#059669","#D97706","#7C3AED","#DC2626","#DB2777","#0891B2","#EA580C",
];

// Roles that can access admin-side pages
export const ADMIN_ROLES   = ["admin", "superadmin"];
// Roles that can access officer pages
export const OFFICER_ROLES = ["department_officer"];
// All staff roles
export const STAFF_ROLES   = ["admin", "superadmin", "department_officer"];
