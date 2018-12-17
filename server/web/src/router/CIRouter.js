import newProject from "@/views/CI/newProject";
import allProject from "@/views/CI/allProject";
import onlineCompile from "@/views/CI/onlineCompile";

export default [{
    path: "/CI/allProject",
    name: "project running",
    component: allProject
  }, {
    path: "/CI/newProject",
    name: "new Project",
    component: newProject
  },{
    path:"/CI/onlineCompile",
    name:"online Compile",
    component:onlineCompile
}];

