import databaseMana from "@/views/DB/databaseMana";
import allTable from "@/views/DB/allTable";
import sql from "@/views/DB/sql";

export default [{
  path: '/DB/databaseMana',
  name: "database management",
  component: databaseMana,
  children: [{
    path: "allTable",
    name: "show all table",
    component: allTable
  }, {
    path: "sql",
    name: "sql",
    component: sql
  }]
}];
