import { Route, Switch } from "wouter";
import { Provider } from "./components/provider";
import { Onboarding } from "./components/Onboarding";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Tools from "./pages/Tools";
import HeatMap from "./pages/HeatMap";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function App() {
	return (
		<Provider>
			<Onboarding />
			<Switch>
				<Route path="/" component={Dashboard} />
				<Route path="/projects" component={Projects} />
				<Route path="/projects/:id" component={ProjectDetail} />
				<Route path="/tools" component={Tools} />
				<Route path="/heatmap" component={HeatMap} />
				<Route path="/reports" component={Reports} />
				<Route path="/settings" component={Settings} />
			</Switch>
		</Provider>
	);
}

export default App;
