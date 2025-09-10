import { name as appName } from "./app.json";
import {
    AppRegistry,
} from "react-native";
import Example from "./src/App";



AppRegistry.registerComponent(appName, () => Example);
export default Example;
