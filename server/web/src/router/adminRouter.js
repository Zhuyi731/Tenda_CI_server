import adminMana from "@/views/admin/adminMana";
import userMana from "@/views/admin/userMana";

export default [{
  path: '/admin/adminMana',
  name: "administrator management",
  component: adminMana,
  children: [{
    path: "/userMana",
    name: "User Manager",
    component: userMana
  }]
}];
