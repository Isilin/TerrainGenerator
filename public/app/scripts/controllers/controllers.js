import {default as AnalyticsModalCtrl} from "./AnalyticsModalCtrl";
import {default as ControlPanelCtrl} from "./ControlPanelCtrl";
import {default as GUI} from "./GUI";

var moduleName = "terrainGenerator.controllers";

angular.module(moduleName, [])
    .controller("AnalyticsModalCtrl", AnalyticsModalCtrl)
    .controller("ControlPanelCtrl", ControlPanelCtrl)
    .controller("GUICtrl", GUI);

export default moduleName;