import AnalyticsModalCtrl from "./AnalyticsModalCtrl";
import ControlPanelCtrl from "./ControlPanelCtrl";
import GUI from "./GUI";

var moduleName = "terrainGenerator.controllers";

angular.module(moduleName, [])
    .controller("AnalyticsModalCtrl", AnalyticsModalCtrl)
    .controller("ControlPanelCtrl", ControlPanelCtrl)
    .controller("GUICtrl", GUI);

export default moduleName;