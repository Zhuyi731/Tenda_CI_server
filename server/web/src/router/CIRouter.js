import allPro from "@/views/CI/allPro";
import preview from "@/views/CI/preview";
import newProject from "@/views/CI/newProject";
import proManager from "@/views/CI/proManager";
import onlineCompile from "@/views/CI/onlineCompile";

export default [{
  path: '/CI/allPro',
  name: "all project",
  component: allPro,
  children: [{
    path: "proManager",
    name: "project running",
    component: proManager
  }, {
    path: "newProject",
    name: "new Project",
    component: newProject
  },{
    path:"onlineCompile",
    name:"online Compile",
    component:onlineCompile
  },{
    path: "preview",
    name: "project preview",
    component: preview
  }]
}];
